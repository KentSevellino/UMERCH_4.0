import type { ImageSourcePropType } from "react-native";

export type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  oldPrice?: string;
  image: ImageSourcePropType;
};
