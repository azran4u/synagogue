import React from "react";
import Image from "./Image";
import { useFirebaseStorageImageUrl } from "../hooks/useFirebaseStorageImageUrl";

interface Props {
  url: string;
}

const FirebaseStorageImage: React.FC<Props> = ({ url }) => {
  const imageUrl = useFirebaseStorageImageUrl(url);
  return <Image url={imageUrl} />;
};

export default FirebaseStorageImage;
