export interface StorageService {
  /**
   * Returns the API upload endpoint URL for a given storage key.
   */
  getUploadUrl(storageKey: string): string;

  /**
   * Returns the public URL for a stored file.
   */
  getFileUrl(storageKey: string): string;

  /**
   * Returns the public URL for a thumbnail.
   */
  getThumbnailUrl(storageKey: string): string;

  /**
   * Saves raw file data and returns the public URL.
   */
  saveFile(storageKey: string, data: Buffer): Promise<string>;

  /**
   * Checks if a file exists in storage.
   */
  fileExists(storageKey: string): Promise<boolean>;

  /**
   * Deletes a file from storage.
   */
  deleteFile(storageKey: string): Promise<void>;

  /**
   * Generates a thumbnail for an image.
   * Returns the thumbnail URL, or null if generation fails.
   */
  generateThumbnail(
    storageKey: string,
    width?: number,
    height?: number,
  ): Promise<string | null>;

  /**
   * Gets image dimensions.
   * Returns { width, height } or null if not determinable.
   */
  getImageDimensions(
    storageKey: string,
  ): Promise<{ width: number; height: number } | null>;
}
