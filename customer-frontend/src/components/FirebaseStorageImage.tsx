import React from "react";
import Image from "./Image";
import { useFirebaseStorageImageUrl } from "../hooks/useFirebaseStorageImageUrl";
import Logo from "./Logo";

interface Props {
  url: string;
}

const FirebaseStorageImage: React.FC<Props> = ({ url }) => {
  const imageUrl = useFirebaseStorageImageUrl(url);
  return imageUrl ? <Image url={imageUrl} /> : <Logo height="10rem" />;
};

export default FirebaseStorageImage;
