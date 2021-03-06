import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { of as ObservableOf } from "rxjs";
import { environment } from "src/environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "./local-storage.service";
import { Order } from "../models/order";
import { ProductsInOrder } from "../models/products-in-order";
import { ProductToAdd } from "../models/product-to-add";
import { MenuProduct } from '../models/menu-product';
import { Table } from '../models/table';

@Injectable({
  providedIn: "root",
})
export class OrderService {

  host: string = environment.host;
  productsToAdd:ProductsInOrder[] = [];

  constructor( private http:HttpClient, private storageService:LocalStorageService) {}
  
  getOrders () : Observable<Array<Order>> {
    return this.http.get<Array<Order>>(this.host + 'api/orders/inprogress',{
      headers : new HttpHeaders().set('Authorization', 'Bearer '+ this.storageService.getToken()),
    });    
  }

  updateOrderStatus(order:Order) : Observable<any>{
    return this.http.put<any>(this.host + 'api/orders/'+order.id+'/'+order.status, {}, {  
      headers : new HttpHeaders().set('Authorization', 'Bearer '+ this.storageService.getToken()),
    });    
  }

  updateStatus (orderedProduct:ProductsInOrder) : Observable<ProductsInOrder> { 
    return this.http.put<ProductsInOrder>(this.host + 'api/orders/products/'+orderedProduct.id,orderedProduct, {  
      headers : new HttpHeaders().set('Authorization', 'Bearer '+ this.storageService.getToken()),
    });    
  }
  
  getOrdersHistory (year:number, month:number,day:number) : Observable<Array<Order>>{
    return this.http.get<Array<Order>>(this.host + 'api/orders/history/'+year+"/"+month+"/"+day,  {
      headers : new HttpHeaders().set('Authorization', 'Bearer '+ this.storageService.getToken()),
     });    
  }

  getThisWeekOrders () : Observable<Array<Order>>{
    return this.http.get<Array<Order>>(this.host + 'api/orders/history/lastWeek',  {
      headers : new HttpHeaders().set('Authorization', 'Bearer '+ this.storageService.getToken()),
     });    
  }

  getThisMonthOrders () : Observable<Array<Order>>{
    return this.http.get<Array<Order>>(this.host + 'api/orders/history/lastMonth',  {
      headers : new HttpHeaders().set('Authorization', 'Bearer '+ this.storageService.getToken()),
     });    
  }
 
  createOrder(
    tableId: number,
    waiterId: number,
    note: string
  ) {
    //new Date + two hours
    var dt = new Date();
    dt.setHours(dt.getHours() + 2);
    
    return this.http.post<Order>(
      this.host + "api/orders",
      {
        tableId: tableId,
        waiterId: waiterId,
        note: note,
        status: "IN_PROGRESS",
        orderDate: dt,
      },
      {
        headers: new HttpHeaders().set(
          "Authorization",
          "Bearer " + this.storageService.getToken()
        ),
      }
    );
  }
  //GET order details by TableId
  getOrderByTableId(tableId: number): Observable<Order> {
    return this.http.get<Order>(this.host + "api/orders/table/" + tableId, {
      headers: new HttpHeaders().set(
        "Authorization",
        "Bearer " + this.storageService.getToken()
      ),
    });
  }

  //PATCH or PUT order
  editOrder(order: Order): Observable<Order> {
    return this.http.put<Order>(this.host + "api/orders/" + order.id, order, {
      headers: new HttpHeaders().set(
        "Authorization",
        "Bearer " + this.storageService.getToken()
      ),
    });
  }

  editOrderProducts(
    order: Order,
    productsToAddInOrder: Array<ProductToAdd>,
    productsToDeleteInOrder:Array<MenuProduct>
  ) {
    
    this.productsToAdd = order.orderedProducts;

    let productsToAdd = new Array();
    let productToAdd;

    productsToAddInOrder.forEach((element) => {
      let amountOfProductsInOrder = order.orderedProducts.filter(
        (e) => e.productId === element.product.id
      );
      if (amountOfProductsInOrder.length < element.amount) {
        for (let i = amountOfProductsInOrder.length; i < element.amount; i++) {
          productToAdd = {
            orderId: order.id,
            productId: element.product.id,
            status: "IN_PROGRESS",
          };
          productsToAdd.push(productToAdd);
          this.addProductToOrder(productsToAdd).subscribe();
          productsToAdd = new Array();
        }
      } else if(amountOfProductsInOrder.length > element.amount){
        for (let i = element.amount; i < amountOfProductsInOrder.length; i++) {
          this.deleteProductFromOrder(
            amountOfProductsInOrder[i].id
          ).subscribe();
        }
      
      }
    });

    if (productsToDeleteInOrder[0] != null) {
      productsToDeleteInOrder.forEach((element) => {
        let amountOfProductsInOrder = order.orderedProducts.find(
          (e) => e.productId === element.id);
        this.deleteProductFromOrder(
            amountOfProductsInOrder.id
          ).subscribe();
        })
      
    }
  
    return this.http.get<Order>(this.host + "api/orders/" + order.id, {
      headers: new HttpHeaders().set(
        "Authorization",
        "Bearer " + this.storageService.getToken()
      ),
    });
  }

  addProductToOrder(array) {
    return this.http.post(this.host + "api/orders/products/", array, {
      headers: new HttpHeaders().set(
        "Authorization",
        "Bearer " + this.storageService.getToken()
      ),
    });
  }

  //PUT
  addProductsToOrder(orderId: number, productsToOrder: Array<ProductToAdd>) {
    let productsToAdd = new Array();
    let productToAdd;
    productsToOrder.forEach((element) => {
      for (let i = 0; i < element.amount; i++) {
        productToAdd = {
          orderId: orderId,
          productId: element.product.id,
          status: "IN_PROGRESS",
        };
        productsToAdd.push(productToAdd);
      }
    });

    return this.http.post(this.host + "api/orders/products/", productsToAdd, {
      headers: new HttpHeaders().set(
        "Authorization",
        "Bearer " + this.storageService.getToken()
      ),
    });
  }

  deleteProductFromOrder(productInOrderId: number) {
    return this.http.delete(
      this.host + "api/orders/products/" + productInOrderId,
      {
        headers: new HttpHeaders().set(
          "Authorization",
          "Bearer " + this.storageService.getToken()
        ),
      }
    );
  }
  
  getReadyTables () : Observable<Array<Table>> {
    return this.http.get<Array<Table>>(this.host + 'api/tables/ready',{
      headers : new HttpHeaders().set('Authorization', 'Bearer '+ this.storageService.getToken()),
   }); 
    
   
  }
}
