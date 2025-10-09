import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebaseConfig";

export class StorageService {
  private storage = storage;

  /**
   * Upload a file to Firebase Storage
   * @param file The file to upload
   * @param path The storage path (e.g., 'synagogueId/financialReports/filename')
   * @returns The download URL of the uploaded file
   */
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  }

  /**
   * Delete a file from Firebase Storage
   * @param path The storage path of the file to delete
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("Failed to delete file");
    }
  }

  /**
   * Get the download URL for a file
   * @param path The storage path of the file
   * @returns The download URL
   */
  async getFileURL(path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error getting file URL:", error);
      throw new Error("Failed to get file URL");
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
