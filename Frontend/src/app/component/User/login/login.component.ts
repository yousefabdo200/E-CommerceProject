import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [NavbarComponent, ReactiveFormsModule, CommonModule, HttpClientModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class UserLoginComponent {
   loginForm: FormGroup;
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      login: ['', [Validators.required]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      // Use the correct API endpoint for user login
      console.log('Form Data:', formData); // Debugging line to check form data
      this.http.post<any>('http://127.0.0.1:8000/api/user/login', formData)
        .subscribe({
          next: (response) => {
            const fullName= response.data.user.fname.concat(' ', response.data.user.lname);
            console.log('Login success:', response.data.token,response);
            localStorage.setItem('userToken', response.data.token);
            localStorage.setItem('userId', response.data.user.id);
            localStorage.setItem('userName', response.data.user.id);
            localStorage.setItem('role', "user");
             if(!response.data.user.img)
              localStorage.setItem('img',"/AdminAvatar.png");
            else
               localStorage.setItem('img', response.data.user.img);
            this.router.navigate(['/Home']);
          },
          error: (error) => {
            this.errorMessage = error.error.message || 'Login failed';
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
  loginWithGoogle() {
  // Implement Google OAuth login logic here
  console.log('Google login clicked');
  // Example: this.authService.signInWithGoogle()
}

loginWithFacebook() {
  // Implement Facebook OAuth login logic here
  console.log('Facebook login clicked');
  // Example: this.authService.signInWithFacebook()
}
}
