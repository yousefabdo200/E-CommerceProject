import { Routes,RouterModule } from '@angular/router';
import { LoginComponent } from './component/Admin/login/login.component';
import { HomeComponent } from './component/Admin/home/home.component';
import { UserHomeComponent } from './component/User/home/home.component';
import { SignupComponent } from './component/User/signup/signup.component';
import { UserLoginComponent } from './component/User/login/login.component';
import { CartComponent } from './component/User/cart/cart.component';
import { AddProductsComponent } from './component/Admin/add-products/add-products.component';
import { OrderComponent } from './component/Shared/order/order.component';
import { OrderListComponent } from './component/Shared/order-list/order-list.component';
export const routes: Routes = [
  {path:'Admin/AdminAuth',component:LoginComponent},
  {path:'Admin/AdminHome',component:HomeComponent},
  {path:'Admin/AddPrduct',component:AddProductsComponent},
   {path:'Admin/orders',component:OrderComponent},
    {path:'Admin/orderlist',component:OrderListComponent},
  {path:'',component:UserHomeComponent },
  {path:'Home',component:UserHomeComponent },
  {path:'signup',component:SignupComponent},
  {path:'login',component:UserLoginComponent},
   {path:'order',component:OrderComponent},
  {path:'cart',component:CartComponent},
  {path:'orderlist',component:OrderListComponent},

];
