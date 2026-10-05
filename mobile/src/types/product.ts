import type { ImageSourcePropType } from "react-native";

export type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  oldPrice?: string;
  hasSize?: boolean;
  image: ImageSourcePropType;
  description?: string;
<<<<<<< HEAD
  variants?: string[];
  stock?: number;
=======
  stock?: number;
  variant?: string;
  variantType?: string;
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
};
