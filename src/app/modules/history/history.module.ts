import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryRoutingModule } from './history-routing.moule';
import { HistoryMainComponent } from './history-main/history-main.component';
import { HistoryOrderComponent } from './history-order/history-order.component';
import { HistoryOrderProductsComponent } from './history-order-products/history-order-products.component';
import { HistoryNavbarComponent } from './history-navbar/history-navbar.component';


@NgModule({
  declarations: [
    HistoryMainComponent, 
    HistoryOrderComponent, 
    HistoryOrderProductsComponent, 
    HistoryNavbarComponent
  ],
  imports: [
    CommonModule,
    HistoryRoutingModule
  ],
  exports: [
    HistoryMainComponent
  ]
})
export class HistoryModule { }