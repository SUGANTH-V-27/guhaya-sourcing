export type ModelStatus = "Shipped" | "Pending";

export type Model = {
  id: string;
  brandId: string;
  code: string;
  name: string;
  category: string;
  image: string;
  daysToHandover: number;
  status: ModelStatus;
};
