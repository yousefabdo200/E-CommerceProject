import { Component, OnInit } from '@angular/core';
import { RedirectService } from '../../../service/redirect.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

@Component({
  selector: 'app-cart',
  imports: [NavbarComponent, CommonModule, HttpClientModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  private role: string = '';
  private token: string = '';
  loading: boolean = true;
  error: string = '';
  products: any[] = [];
  public itemsNumber: number = 0;
  total: number = 0;

  constructor(private router:Router,private redirectService: RedirectService, private http: HttpClient) {}

  ngOnInit(): void {
    this.redirectService.redirectuser();
    this.role = localStorage.getItem('role') || '';
    this.token = localStorage.getItem('userToken') || '';
    this.loadCart();
  }

  private loadCart(): void {
    this.loading = true;
    this.error = '';

    this.http.get(`http://127.0.0.1:8000/api/user/cart?token=${this.token}`).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        this.products = response.data || response || [];
        this.loading = false;
        this.error = '';
        for (const product of this.products) {
          this.itemsNumber+= product.pivot?.amount || 0;
          this.total+= product.pivot?.amount*product.price || 0;
        }
        console.log('Cart data:', this.products);
      },
      error: (error: any) => {
        console.error('Error fetching cart data:', error);
        this.error = 'Failed to load cart items';
        this.loading = false;
      }
    });
  }

  public decreaseItem(product: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    console.log('Decreasing item:', product.name, 'Current amount:', product.pivot?.amount);

    if (product.pivot?.amount <= 1) {
      this.removeItem(product);
      return;
    }

    const originalAmount = product.pivot.amount;
    product.pivot.amount--;

    this.http.put<any>(`http://127.0.0.1:8000/api/user/cart/${product.id}?token=${this.token}`, {})
      .subscribe({
        next: (response: any) => {
          console.log('Decrease response:', response);
          if (response.data) {
            this.products = response.data;
          }
        },
        error: (error: any) => {
          console.error('Error updating cart:', error);
          product.pivot.amount = originalAmount;
          this.error = 'Failed to update cart';
        }
      });
  }

  public increaseItem(product: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    console.log('Increasing item:', product.name, 'Current amount:', product.pivot?.amount);

    const originalAmount = product.pivot?.amount || 0;
    if (product.pivot) {
      product.pivot.amount++;
    }

    this.http.post<any>(`http://127.0.0.1:8000/api/user/cart?token=${this.token}`, {
      product_id: product.id,
      amount: 1
    }).subscribe({
      next: (response: any) => {
        console.log('Increase response:', response);
        if (response.data) {
          this.products = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error updating cart:', error);
        if (product.pivot) {
          product.pivot.amount = originalAmount;
        }
        this.error = 'Failed to update cart';
      }
    });
  }

  private removeItem(product: any): void {
    console.log('Removing item:', product.name);

    const originalProducts = [...this.products];
    this.products = this.products.filter(p => p.id !== product.id);

    this.http.delete<any>(`http://127.0.0.1:8000/api/user/cart/${product.id}?token=${this.token}`)
      .subscribe({
        next: (response: any) => {
          console.log('Remove response:', response);
          if (response.data) {
            this.products = response.data;
          }
          console.log('Item removed from cart');
        },
        error: (error: any) => {
          console.error('Error removing item:', error);
          this.products = originalProducts;
          this.error = 'Failed to remove item';
        }
      });
  }

  public getCartTotal(): number {
    return this.products.reduce((total, product) => {
      return total + (product.price * (product.pivot?.amount || 0));
    }, 0);
  }

  public getTotalItems(): number {
    return this.products.reduce((total, product) => {
      return total + (product.pivot?.amount || 0);
    }, 0);
  }

  // Get user's current location using Geolocation API
  private getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          resolve(locationData);
        },
        (error) => {
          let errorMessage = 'Unknown error occurred';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  // Optional: Get address from coordinates using reverse geocoding
  private getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      // Using a free geocoding service (you might need to use Google Maps API or similar)
      this.http.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
        .subscribe({
          next: (response: any) => {
            const address = response.display_name ||
                           `${response.city}, ${response.countryName}` ||
                           'Address not found';
            resolve(address);
          },
          error: (error) => {
            console.warn('Could not get address:', error);
            resolve('Address not available');
          }
        });
    });
  }

  public async makeorder(): Promise<void> {
    console.log('Making order with items:', this.products);

    try {
      // Show loading state
      this.loading = true;
      this.error = '';

      // Get user's current location
      console.log('Getting user location...');
      const location = await this.getCurrentLocation();
      console.log('Location obtained:', location);

      // Optionally get address from coordinates
      const address = await this.getAddressFromCoordinates(location.latitude, location.longitude);
      location.address = address;
      console.log('Address obtained:', address);

      // Prepare order data
      const orderData = {
        products: this.products.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          admin_id: product.admin_id,
          amount: product.pivot?.amount || 0
        })),
        total: this.getCartTotal(),
        totalItems: this.getTotalItems(),
        address: location.address,
        timestamp: new Date().toISOString()
      };

      console.log('Sending order data:', orderData);

      // Send order to API
      this.http.post(`http://127.0.0.1:8000/api/user/order?token=${this.token}`, orderData)
        .subscribe({
          next: (response: any) => {
            console.log('Order created successfully:', response);
            this.loading = false;
            // Handle successful order (e.g., redirect to order confirmation page)
            // You might want to clear the cart or navigate to a success page
            alert('Order placed successfully!');
          },
          error: (error: any) => {
            console.error('Error creating order:', error);
            this.error = 'Failed to create order. Please try again.';
            this.loading = false;
          }
        });
         this.products=[];
    } catch (locationError: any) {
      console.error('Error getting location:', locationError);
      this.error = `Location error: ${locationError.message}`;
      this.loading = false;

      // Optionally, you could still proceed with the order without location
      // or ask the user to enter their address manually
      const proceedWithoutLocation = confirm(
        'Could not get your location. Would you like to proceed without location data?'
      );

      //this.router.navigate(['/user/order'])
    }
  }

  // Fallback method to create order without location

}
