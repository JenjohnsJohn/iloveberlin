import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Track retried requests without mutating config objects
const retriedRequests = new WeakSet<InternalAxiosRequestConfig>();
const refreshRetriedRequests = new WeakSet<InternalAxiosRequestConfig>();

// Network retry config
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

function isNetworkError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  // No response means a network-level failure (timeout, DNS, connection refused, etc.)
  // Exclude 4xx/5xx which have a response object
  return !error.response && error.code !== 'ERR_CANCELED';
}

async function retryWithBackoff(
  config: InternalAxiosRequestConfig,
  attempt: number,
): Promise<ReturnType<typeof apiClient.request>> {
  const delay = BASE_DELAY_MS * Math.pow(2, attempt);
  await new Promise((resolve) => setTimeout(resolve, delay));
  return apiClient.request(config);
}

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('iloveberlin-auth');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      } catch {
        // Ignore parse errors
      }
    }
  }
  return config;
});

// Response interceptor - handle 401 with token refresh + network retry
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];
let refreshPromise: Promise<string | null> | null = null;

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

    // Network error retry logic (not for 4xx errors)
    if (originalRequest && isNetworkError(error)) {
      if (!retriedRequests.has(originalRequest)) {
        retriedRequests.add(originalRequest);

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            return await retryWithBackoff(originalRequest, attempt);
          } catch (retryError) {
            if (!isNetworkError(retryError) || attempt === MAX_RETRIES - 1) {
              return Promise.reject(retryError);
            }
          }
        }
      }
    }

    // Token refresh logic for 401 responses
    if (originalRequest && error.response?.status === 401 && !refreshRetriedRequests.has(originalRequest)) {
      if (isRefreshing) {
        // Another refresh is already in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      refreshRetriedRequests.add(originalRequest);
      isRefreshing = true;

      // Create a single refresh promise that all queued requests will share
      refreshPromise = (async () => {
        try {
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('iloveberlin-auth');
            if (stored) {
              const { state } = JSON.parse(stored);
              if (state?.refreshToken) {
                const { data } = await axios.post(
                  `${apiClient.defaults.baseURL}/auth/refresh`,
                  { refresh_token: state.refreshToken },
                );

                // Update stored tokens
                const newState = {
                  ...state,
                  accessToken: data.access_token,
                  refreshToken: data.refresh_token,
                };
                localStorage.setItem('iloveberlin-auth', JSON.stringify({ state: newState }));

                return data.access_token as string;
              }
            }
          }
          return null;
        } catch (refreshError) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('iloveberlin-auth');
            window.location.href = '/login';
          }
          throw refreshError;
        }
      })();

      try {
        const newToken = await refreshPromise;
        processQueue(null, newToken);
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

export async function healthCheck() {
  const { data } = await apiClient.get('/health');
  return data;
}

/**
 * Create a cancellable request using AbortController.
 * Returns both the response promise and an abort function.
 *
 * Usage:
 *   const { promise, abort } = createCancellableRequest({ url: '/data', method: 'GET' });
 *   // Later: abort();
 */
export function createCancellableRequest<T = unknown>(config: AxiosRequestConfig) {
  const controller = new AbortController();
  const promise = apiClient.request<T>({
    ...config,
    signal: controller.signal,
  });
  return {
    promise,
    abort: () => controller.abort(),
  };
}
