import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // ✅ Grouped
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // ✅ HttpClientModule imported
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule], // ✅ Now valid
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
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

      this.http.post<any>('http://127.0.0.1:8000/api/admin/login', formData)
        .subscribe({
          next: (response) => {
            const fullName= response.data.user.fname.concat(' ', response.data.user.lname);
            console.log('Login success:', response.data.token,response);
            localStorage.setItem('userToken', response.data.token);
            localStorage.setItem('userId', response.data.user.id);
            localStorage.setItem('userName', response.data.user.id);
            localStorage.setItem('role', "admin");
            this.router.navigate(['/Admin/AdminHome']);
          },
          error: (error) => {
            this.errorMessage = error.error.message || 'Login failed';
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
