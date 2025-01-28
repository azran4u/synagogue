import { useEffect, useState } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../services/firebaseConfig";

const cache = new Map<string, string>();
const firebaseStorageUrl = "gs://shomron-tights.firebasestorage.app/";

export function useFirebaseStorageImageUrl(url: string) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!url.includes(firebaseStorageUrl)) {
      setImageUrl(url);
      return;
    }

    const fetchImage = async () => {
      if (cache.has(url)) {
        setImageUrl(cache.get(url));
        return;
      }
      const storageRef = ref(
        storage,
        url.replace("gs://shomron-tights.firebasestorage.app/", "")
      );

      try {
        const downloadUrl = await getDownloadURL(storageRef);
        cache.set(url, downloadUrl);
        setImageUrl(downloadUrl);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchImage();
  }, [url]);

  return imageUrl;
}
