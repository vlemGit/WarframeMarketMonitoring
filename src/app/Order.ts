import { UserData } from "./UserData";

export interface Order {
    id: string;
    type: string;
    platinum: number;
    quantity: number;
    rank: number;
    visible: boolean;
    createdAt: string;
    updatedAt: string;
    crosstrade: boolean;
    user: UserData;
  }