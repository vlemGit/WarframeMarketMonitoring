import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Item } from '../Item';
import { UserData } from '../UserData';
import { Order } from '../Order';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-display',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './data-display.component.html',
  styleUrl: './data-display.component.scss'
})

export class DataDisplayComponent {

  httpClient = inject(HttpClient);
  items: any[] = [];
  selectedItem: string = '';
  selectedItemId: string = '';
  selectedItemName: string = '';
  selectedItemUrlName: string = '';
  orders: any[] = [];


  ngOnInit() {
    this.fetchAllItems();
  }

  fetchAllItems(){
        this.httpClient
        .get<any>('https://api.warframe.market/v1/items')
        .subscribe((data: any) => {
          this.items = data.payload.items as Item[];
        });
  }

  selectItem() {
    if (this.selectedItemUrlName) {
      this.fetchOrdersByItem(this.selectedItemUrlName);
    }
  }

  fetchOrdersByItem(param: string){
    this.httpClient
    .get<Order>('https://api.warframe.market/v2/orders/item/' + param)
    .subscribe((data: any) => {
      console.log(data);
      this.orders = data.data as Order[];
    });
}

}
