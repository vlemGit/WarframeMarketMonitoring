import { Item } from "./Item";

export interface Tracker{
    id: string;
    name: string;
    item: Item;
    treshold: number;
    

}