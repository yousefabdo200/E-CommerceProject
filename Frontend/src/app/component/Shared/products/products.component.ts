// products.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../service/products.service';
import { ShardService } from '../../../service/shard.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-products',
  imports: [CommonModule,HttpClientModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: any[] = [];
  loading: boolean = true;
  error: string = '';

  // Pagination properties
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;

  // Category filtering
  selectedCategoryId: number | null = null;

  // Role
  role: string = '';
  token: string = '';
  // Subscription to prevent memory leaks
  private categorySubscription?: Subscription;

  constructor(
    private productService: ProductsService,
    private shardService: ShardService,
    private router: Router,
    private http: HttpClient
  ) {
    this.role = this.getStoredRole();
  }

  ngOnInit(): void {
    this.loadProducts();

    // Listen to selected category changes from shared service
    this.categorySubscription = this.shardService.selectedCategory$.subscribe((categoryId) => {
      console.log('Category changed to:', categoryId);
      this.selectedCategoryId = categoryId;
      this.currentPage = 1; // Reset to first page when category changes

      // Load products based on category selection
      this.loadProductsBasedOnCategory();
    });
    this.role=localStorage.getItem('role') || '';
    this.token = localStorage.getItem('userToken') || '';
  }

  ngOnDestroy(): void {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

  private getStoredRole(): string {
    try {
      return localStorage.getItem('role') || '';
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
      return '';
    }
  }

  private loadProductsBasedOnCategory(): void {
    if (this.selectedCategoryId === null) {
      // Load all products
      this.loadProducts(1);
    } else {
      // Load products by category
      this.getProductsByCategory(this.selectedCategoryId);
    }
  }

  private loadProducts(page: number = 1): void {
    // Only use pagination when no category is selected
    if (this.selectedCategoryId !== null) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      // Check if user is admin to decide which endpoint to use
      this.productService.getAllProductsPaginated(page, this.itemsPerPage).subscribe({
          next: (response) => {
            console.log('Admin products response:', response);
            this.handleProductsResponse(response, page);
          },
          error: (error) => {
            this.handleError(error, 'Failed to load products');
          }
        });
    } catch (error: any) {
      this.handleError(error, 'Failed to load products');
    }
  }

  private getProductsByCategory(categoryId: number): void {
    this.loading = true;
    this.error = '';

    console.log('Loading products for category:', categoryId);

    this.productService.getProductsByCategory(categoryId).subscribe({
      next: (response) => {
        console.log('Category products response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'No keys');

        // More detailed response handling
        let extractedProducts: any[] = [];

        if (response === null || response === undefined) {
          console.log('Response is null or undefined');
          extractedProducts = [];
        } else if (Array.isArray(response)) {
          console.log('Response is an array with', response.length, 'items');
          extractedProducts = response;
        } else if (response && typeof response === 'object') {
          if (response.data) {
            console.log('Found data property:', response.data);
            if (Array.isArray(response.data)) {
              extractedProducts = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              extractedProducts = response.data.data;
            } else {
              console.log('Data property is not an array:', response.data);
              extractedProducts = [];
            }
          } else if (response.products && Array.isArray(response.products)) {
            console.log('Found products property:', response.products);
            extractedProducts = response.products;
          } else {
            console.log('No recognizable data structure found');
            console.log('Available properties:', Object.keys(response));
            extractedProducts = [];
          }
        } else {
          console.log('Response is not an object or array');
          extractedProducts = [];
        }

        this.products = extractedProducts;
        this.setupSimplePagination();
        this.loading = false;

        console.log('Final products array:', this.products);
        console.log('Products count:', this.products.length);

        if (this.products.length === 0) {
          console.warn('No products found for category', categoryId);
          this.error = `No products found for this category`;
        }
      },
      error: (error) => {
        console.error('Error loading products by category:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        this.handleError(error, 'Failed to load products by category');
      }
    });
  }

  private handleProductsResponse(response: any, page: number): void {
    console.log('Handling products response:', response);

    // Handle different response structures
    this.products = response.data?.data || response.data || response || [];

    // Extract pagination metadata
    const paginationData = response.data || response;
    this.currentPage = paginationData.current_page || page;
    this.totalPages = paginationData.last_page || Math.ceil(paginationData.total / this.itemsPerPage) || 1;
    this.totalItems = paginationData.total || this.products.length;
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPrevPage = this.currentPage > 1;

    console.log('Products processed:', this.products.length);
    console.log('Pagination info:', {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalItems: this.totalItems
    });
    this.loading = false;
  }

  private setupSimplePagination(): void {
    // For category filtering or public products, set simple pagination
    this.currentPage = 1;
    this.totalPages = Math.max(1, Math.ceil(this.products.length / this.itemsPerPage));
    this.totalItems = this.products.length;
    this.hasNextPage = false;
    this.hasPrevPage = false;

    console.log('Simple pagination setup:', {
      totalProducts: this.products.length,
      totalPages: this.totalPages
    });
  }

  private handleError(error: any, defaultMessage: string): void {
    console.error('Error occurred:', error);
    this.error = error.message || defaultMessage;
    this.loading = false;
    this.products = []; // Clear products on error
  }

  // Product actions
  onAddProduct(): void {
      this.router.navigate(['Admin/AddPrduct']);
  }

  onEditProduct(productId: number): void {
    console.log('Edit product clicked:', productId);
    // Navigate to edit product form
  }

  onDeleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: (response) => {
          console.log('Product deleted successfully');
          // Refresh the current view
          this.loadProductsBasedOnCategory();
        },
        error: (error) => {
          this.handleError(error, 'Failed to delete product');
        }
      });
    }
  }

  onAddToCart(product: any): void {
    if(this.role==='')
       this.router.navigate(['/login']);
    this.http.post<any>(`http://127.0.0.1:8000/api/user/cart?token=${this.token}`,{
      product_id: product.id,
      amount: 1
    }).subscribe({
      next: (response) => {
        console.log('Product added to cart successfully:', response);
        // Optionally, show a success message or update UI
      },
      error: (error) => {
        console.error('Error adding product to cart:', error);
        // Optionally, show an error message
      }
    })

  }

  // Pagination methods (only work when no category is selected and for admin)
  goToPage(page: number): void {
    if (this.selectedCategoryId === null && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.loadProducts(page);
    }
  }

  nextPage(): void {
    if (this.hasNextPage && this.selectedCategoryId === null) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage && this.selectedCategoryId === null) {
      this.goToPage(this.currentPage - 1);
    }
  }

  firstPage(): void {
    if (this.selectedCategoryId === null) {
      this.goToPage(1);
    }
  }

  lastPage(): void {
    if (this.selectedCategoryId === null) {
      this.goToPage(this.totalPages);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

      if (endPage === this.totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // Helper method to check if pagination should be shown
  shouldShowPagination(): boolean {
    return this.selectedCategoryId === null && this.totalPages > 1;
  }

  // Helper method to check if we have products to display
  hasProducts(): boolean {
    return this.products && this.products.length > 0;
  }
}
