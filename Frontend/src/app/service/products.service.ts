import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiBase = `http://127.0.0.1:8000/api/all/product`;
  constructor(private http: HttpClient) {}

  // Get stored token from localStorage
  private getStoredToken(): string {
    try {
      return localStorage.getItem('userToken') || '';
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
      return '';
    }
  }

  // Get all categories
  allCategories(): Observable<any> {
    return this.http.get(`${this.apiBase}/category`);
  }

  // Get all products (public endpoint)
  allProducts(): Observable<any> {
    return this.http.get(this.apiBase);
  }

  // Get products with pagination and authentication (admin endpoint)
  getAllProductsPaginated(page: number = 1, perPage: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get(this.apiBase, { params });
  }

  // Get products by category
  getProductsByCategory(categoryId: number): Observable<any> {
    return this.http.get(`${this.apiBase}/${categoryId}`);
  }

  // Add new product (admin only)
  addProduct(productData: any): Observable<any> {
    const token = this.getStoredToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new HttpParams().set('token', token);
    return this.http.post(this.apiBase, productData, { params });
  }

  // Update product (admin only)
  updateProduct(productId: number, productData: any): Observable<any> {
    const token = this.getStoredToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new HttpParams().set('token', token);
    return this.http.put(`${this.apiBase}/${productId}`, productData, { params });
  }

  // Delete product (admin only)
  deleteProduct(productId: number): Observable<any> {
    const token = this.getStoredToken();

    if (!token) {
      throw new Error('No authentication token found');
    }
    console.log(token);
    //const params = new HttpParams().set('token', token);
    return this.http.delete(`http://127.0.0.1:8000/api/admin/product/${productId}?token=${token}`);
  }
}
