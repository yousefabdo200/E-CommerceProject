import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { CategoriesComponent } from '../../Shared/categories/categories.component';
import { ProductsComponent } from '../../Shared/products/products.component';
@Component({
  selector: 'app-home',
  imports: [NavbarComponent,CategoriesComponent, ProductsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class UserHomeComponent {

}
