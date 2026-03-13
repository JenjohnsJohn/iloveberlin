import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

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

// Response interceptor - handle 401 with token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

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
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

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

              processQueue(null, data.access_token);
              originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
              return apiClient(originalRequest);
            }
          }
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('iloveberlin-auth');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
