import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../User/navbar/navbar.component';
import { NavbarComponent as AdminNavbarComponent } from '../../Admin/Shared/navbar/navbar.component';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order',
  imports: [NavbarComponent, AdminNavbarComponent, HttpClientModule, CommonModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {
  orderId: string | null = null;

  constructor(private route: ActivatedRoute, private routeTo: Router, private http: HttpClient) {}

  public role: string = '';
  public baseUrl: string = '';
  public order: any = null; // Changed from orders to order (single object)
  public token: string = '';
  public showConfirmation: boolean = false;
  public confirmationAction: 'accept' | 'reject' | null = null;
  public actionInProgress: boolean = false;

  ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParams['id'];
    console.log('Order ID:', this.orderId);

    // Subscribe to query parameter changes (reactive)
    this.route.queryParams.subscribe(params => {
      this.orderId = params['id'];
      if (this.orderId) {
        this.loadOrder(); // Reload order when ID changes
      }
    });

    this.token = localStorage.getItem('userToken') || '';

    if (localStorage.getItem('role') === 'admin') {
      this.role = 'admin';
      this.baseUrl = `http://127.0.0.1:8000/api/admin/order/${this.orderId}`;
    } else if (localStorage.getItem('role') === 'user') {
      this.role = 'user';
      this.baseUrl = `http://127.0.0.1:8000/api/user/order/${this.orderId}`;
    } else {
      this.routeTo.navigate(['/']);
      return;
    }

    // Load the specific order
    if (this.orderId) {
      this.loadOrder();
    }
  }

  loadOrder(): void {
    const url = `${this.baseUrl}?token=${this.token}`;

    this.http.get(url).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);

        if (response.success && response.data) {
          this.order = response.data; // Store the single order object
        } else {
          console.error('Invalid response structure:', response);
          this.order = null;
        }
      },
      error: (error: any) => {
        console.error('Error fetching order data:', error);
        this.order = null;
      }
    });
  }

  vieworder(orderId: number): void {
    this.routeTo.navigate([`Admin/orders/`], { queryParams: { id: orderId } });
  }

  // Helper method to calculate total order amount
  calculateOrderTotal(): number {
    if (!this.order || !this.order.products) {
      return 0;
    }

    return this.order.products.reduce((total: number, product: any) => {
      return total + (product.price * product.pivot.amount);
    }, 0);
  }

  // Helper method to get total items count
  getTotalItemsCount(): number {
    if (!this.order || !this.order.products) {
      return 0;
    }

    return this.order.products.reduce((total: number, product: any) => {
      return total + product.pivot.amount;
    }, 0);
  }

  // Show confirmation dialog
  showConfirmationDialog(action: 'accept' | 'reject'): void {
    this.confirmationAction = action;
    this.showConfirmation = true;
  }

  // Hide confirmation dialog
  hideConfirmationDialog(): void {
    this.showConfirmation = false;
    this.confirmationAction = null;
  }

  // Confirm the action
  confirmAction(): void {
    if (this.confirmationAction === 'accept') {
      this.acceptOrder();
    } else if (this.confirmationAction === 'reject') {
      this.rejectOrder();
    }
    this.hideConfirmationDialog();
  }

  // Accept order method
  acceptOrder(): void {
    if (!this.order || !this.order.id || this.actionInProgress) {
      console.error('No order to accept or action in progress');
      return;
    }

    this.actionInProgress = true;
    const url = `http://127.0.0.1:8000/api/admin/order/${this.order.id}/accept?token=${this.token}`;

    this.http.put(url, {}).subscribe({
      next: (response: any) => {
        console.log('Order accepted:', response);
        if (response.success) {
          this.order.status = 'Accepted'; // Update local status
          // You might want to show a success message here
        }
        this.actionInProgress = false;
      },
      error: (error: any) => {
        console.error('Error accepting order:', error);
        this.actionInProgress = false;
        // You might want to show an error message here
      }
    });
  }

  // Reject order method
  rejectOrder(): void {
    if (!this.order || !this.order.id || this.actionInProgress) {
      console.error('No order to reject or action in progress');
      return;
    }

    this.actionInProgress = true;
    const url = `http://127.0.0.1:8000/api/admin/order/${this.order.id}/reject?token=${this.token}`;

    this.http.put(url, {}).subscribe({
      next: (response: any) => {
        console.log('Order rejected:', response);
        if (response.success) {
          this.order.status = 'Rejected'; // Update local status
          // You might want to show a success message here
        }
        this.actionInProgress = false;
      },
      error: (error: any) => {
        console.error('Error rejecting order:', error);
        this.actionInProgress = false;
        // You might want to show an error message here
      }
    });
  }

  // Helper method to check if order can be accepted/rejected
  canModifyOrder(): boolean {
    return this.role === 'admin' &&
           this.order &&
           (this.order.status === 'Pending' || this.order.status === 'Processing');
  }
}
