export interface ProductData {
  sku: string;
  nameEn: string;
  nameTh: string;
  descEn: string;
  descTh: string;
  brand: string;
  price: string;
  stock: string;
  weight: string;
  w: string;
  l: string;
  h: string;
  images: string[];
  video: string;
}

export const DEFAULT_DATA: ProductData = {
  sku: "",
  nameEn: "",
  nameTh: "",
  descEn: "",
  descTh: "",
  brand: "",
  price: "",
  stock: "",
  weight: "",
  w: "",
  l: "",
  h: "",
  images: [],
  video: "",
};
