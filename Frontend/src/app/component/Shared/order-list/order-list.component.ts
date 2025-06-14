import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../User/navbar/navbar.component';
import { NavbarComponent as AdminNavbarComponent } from '../../Admin/Shared/navbar/navbar.component';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-list',
  imports: [NavbarComponent, AdminNavbarComponent, HttpClientModule, CommonModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  constructor(private route: Router, private http: HttpClient) { }

  public role: string = '';
  public baseUrl: string = '';
  public orders: any[] = [];
  public token: string = '';

  // Pagination properties (from API)
  public currentPage: number = 1;
  public itemsPerPage: number = 10; // You can adjust this value
  public totalItems: number = 0;
  public totalPages: number = 0;
  public nextPageUrl: string | null = null;
  public prevPageUrl: string | null = null;
  public pageNumbers: number[] = [];

  ngOnInit(): void {
    this.token = localStorage.getItem('userToken') || '';

    if (localStorage.getItem('role') === 'admin') {
      this.role = 'admin';
      this.baseUrl = 'http://127.0.0.1:8000/api/admin/order';
    } else if (localStorage.getItem('role') === 'user') {
      this.role = 'user';
      this.baseUrl = 'http://127.0.0.1:8000/api/user/order';
    } else {
      this.route.navigate(['/login']);
      return;
    }

    this.loadOrders(1); // Load first page
  }

  loadOrders(page: number = 1): void {
    const url = `${this.baseUrl}?token=${this.token}&page=${page}&per_page=${this.itemsPerPage}`;

    this.http.get(url).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);

        if (response.success && response.data) {
          const paginationData = response.data;

          // Extract orders from nested data structure
          this.orders = Array.isArray(paginationData.data) ? paginationData.data : [];

          // Extract pagination info from API response
          this.currentPage = paginationData.current_page || 1;
          this.totalItems = paginationData.total || 0;
          this.totalPages = paginationData.last_page || 1;
          this.nextPageUrl = paginationData.next_page_url;
          this.prevPageUrl = paginationData.prev_page_url;

          // Generate page numbers
          this.generatePageNumbers();

          console.log('Orders data:', this.orders);
          console.log('Pagination info:', {
            currentPage: this.currentPage,
            totalItems: this.totalItems,
            totalPages: this.totalPages
          });
        } else {
          this.orders = [];
          this.resetPagination();
        }
      },
      error: (error: any) => {
        console.error('Error fetching orders data:', error);
        this.orders = [];
        this.resetPagination();
      }
    });
  }

  generatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  resetPagination(): void {
    this.currentPage = 1;
    this.totalItems = 0;
    this.totalPages = 0;
    this.nextPageUrl = null;
    this.prevPageUrl = null;
    this.pageNumbers = [];
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.loadOrders(page);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadOrders(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadOrders(this.currentPage + 1);
    }
  }

  // Helper methods for pagination display
  get startItem(): number {
    return this.totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  // Get visible page numbers for pagination (show max 5 pages)
  get visiblePageNumbers(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  vieworder(orderId: number): void {
    this.route.navigate([`Admin/orders/`], { queryParams: { id: orderId } });
  }

}
