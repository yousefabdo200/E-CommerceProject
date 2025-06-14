import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule,HttpClientModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isMobileMenuOpen = false;
  showProfile = false;
  role: string = '';
  img: string = '';
  token:string='';
  constructor(private router: Router,private http:HttpClient) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role') || '';
    this.img = localStorage.getItem('img') || '/AdminAvatar.png'; // Default placeholder image
    this.token=localStorage.getItem('userToken') || '';
    // Debug logging
    console.log('Role:', this.role);
    console.log('Image URL:', this.img);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    // Clear localStorage
          localStorage.removeItem('userToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          localStorage.removeItem('img');
          localStorage.removeItem('role');
     this.http.get(`http://127.0.0.1:8000/api/admin/logout?token=${this.token}`).subscribe({

    });


    // Reset component properties
    this.role = '';
    this.img = '';

    console.log('User logged out');

    // Redirect to login page
    this.router.navigate(['/Admin/AdminAuth']);
  }
}
