import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Item } from '../Item';
import { UserData } from '../UserData';
import { Order } from '../Order';
import { FormsModule } from '@angular/forms';
import { Thresholds } from '../Thresholds';

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
  selectedItemName: string = '';
  selectedItemUrlName: string = '';
  orders: any[] = [];
  severity: number = 1;
  detectedAnomalies: Order[] = [];
  isLoadingOrders: boolean = false;
  whisperCopied: boolean = false;
  whisperCopiedStates: boolean[] = [];


  ngOnInit() {
    this.fetchAllItems();
  }

  fetchAllItems() {
    this.httpClient
      .get<any>('https://api.warframe.market/v1/items')
      .subscribe((data: any) => {
        this.items = data.payload.items as Item[];
        this.items.sort((a, b) => a.item_name.localeCompare(b.item_name));
      });
  }

  selectItem() {
    const selectedItem = this.items.find(item => item.url_name === this.selectedItemUrlName);
    if (selectedItem) {
      this.orders = [];
      this.detectedAnomalies = [];
      this.selectedItemName = selectedItem.item_name;
      this.isLoadingOrders = true;
      this.fetchOrdersByItem(selectedItem.url_name);
    }
  }

  fetchOrdersByItem(param: string) {
    this.httpClient
      .get<Order>('https://api.warframe.market/v2/orders/item/' + param)
      .subscribe((data: any) => {
        console.log(data);
        this.orders = data.data as Order[];
        this.orders = this.orders.filter(order => order.type !== "buy");
        this.orders = this.orders.filter(order => (order.user.status === "ingame" || order.user.status === "online") && order.user.platform === "pc");
        this.orders.sort((a, b) => a.platinum - b.platinum);
        this.isLoadingOrders = false;

        this.orders.forEach(order => order.whisperCopied = false);
      });
  }

  copyText(userName: string, item: string, platinum: number, index: number, isAnomaly: boolean, rank?: number) {
    let textToCopy = ''

    if (rank !== undefined && rank !== null) {
      textToCopy = `/w ${userName} Hi! I want to buy: "${item} (rank ${rank})" for ${platinum} platinum. (warframe.market)`;
    } else {
      textToCopy = `/w ${userName} Hi! I want to buy: "${item}" for ${platinum} platinum. (warframe.market)`;
    }

    if (!navigator.clipboard) {
      console.error('API Clipboard non prise en charge.');
    } else {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          console.log('Texte copié avec succès !');
          if (isAnomaly) {
            this.whisperCopiedStates[index + this.orders.length] = true;
            
            setTimeout(() => {
              this.whisperCopiedStates[index + this.orders.length] = false;
            }, 3000);
          } else {
            this.whisperCopiedStates[index] = true;
            
            setTimeout(() => {
              this.whisperCopiedStates[index] = false;
            }, 3000);
          }
        })
        .catch(err => {
          console.error('Erreur lors de la copie du texte :', err);
        });
    }
  }

  hasRank(): boolean {
    return this.orders.some(order => order.rank !== undefined && order.rank !== null);
  }

  detectAnomalies() {
    this.detectedAnomalies = this.anomalyDetector(this.orders, this.severity);
  }

  anomalyDetector(orders: any[], severity: number): Order[] {
    const averagePrice = orders.reduce((sum, order) => sum + order.platinum, 0) / orders.length;

    // Calculate the standard deviation 
    const squaredDifferences = orders.map(order => Math.pow(order.platinum - averagePrice, 2));
    const variance = squaredDifferences.reduce((sum, squaredDiff) => sum + squaredDiff, 0) / orders.length;
    const standardDeviation = Math.sqrt(variance);

    // Define threshold ranges according to severity
    const thresholds: Thresholds = {
        1: standardDeviation,
        2: standardDeviation * 1.5,
        3: standardDeviation * 2,
        4: standardDeviation * 2.5,
        5: standardDeviation * 3
    };

    // Filter orders with a price below the anomaly threshold
    const threshold = thresholds[severity];
    const anomalies = orders.filter(order => (order.platinum < averagePrice - threshold || order.platinum > averagePrice + threshold) && order.platinum < averagePrice);

    console.log('Anomalies de prix détectées :', anomalies);
    return anomalies.length > 0 ? anomalies : [];
  }

}
