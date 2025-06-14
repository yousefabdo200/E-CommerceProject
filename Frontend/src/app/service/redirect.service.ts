import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  role: string = '';
  constructor(private router: Router) {
    // This service can be used to handle redirection logic
   }
   redirectuser()
   {
     this.role = localStorage.getItem('role') || '';
      if(!this.role || this.role !== 'user') {
        this.router.navigate(['/login']);
      }
   }
}
