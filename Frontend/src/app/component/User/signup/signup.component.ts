import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, HttpClientModule,RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  showPassword = false;
  errorMessage:any;
  selectedImage: File | null = null;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.signupForm = this.fb.group(
      {
        fname: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$'), Validators.minLength(2)]],
        lname: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$'), Validators.minLength(2)]],
        user_name: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9_]+$')]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).+$'),
          ],
        ],
        confirmPassword: ['', Validators.required],
        gender: ['', Validators.required],
        img: [null],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  passwordMatchValidator(form: FormGroup): null | object {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (this.isValidImageFile(file)) {
        this.selectedImage = file;
        this.signupForm.patchValue({ img: file });
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Please select a valid image file (JPG, PNG, GIF, max 5MB)';
        this.resetImageInput();
      }
    }
  }

  private isValidImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  private resetImageInput(): void {
    this.selectedImage = null;
    this.signupForm.patchValue({ img: null });
    const fileInput = document.getElementById('img') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) {
        switch (fieldName) {
          case 'fname':
          case 'lname':
            return `${this.getFieldDisplayName(fieldName)} should contain only letters`;
          case 'user_name':
            return 'Username can only contain letters, numbers, and underscores';
          case 'password':
            return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
          default:
            return 'Invalid format';
        }
      }
    }

    // Check for password mismatch
    if (fieldName === 'confirmPassword' && this.signupForm.errors?.['mismatch'] && field?.touched) {
      return 'Passwords do not match';
    }

    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'fname': 'First Name',
      'lname': 'Last Name',
      'user_name': 'Username',
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password',
      'gender': 'Gender'
    };
    return displayNames[fieldName] || fieldName;
  }

  async onSubmit(): Promise<void> {
    // Prevent double submission
    if (this.isSubmitting) {
      return;
    }

    if (this.signupForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }


    try {
      const formData = new FormData();

      // Add all form fields to FormData
      Object.entries(this.signupForm.value).forEach(([key, value]) => {
        if (key === 'img' && this.selectedImage) {
          formData.append(key, this.selectedImage);
        } else if (key !== 'img' && value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });

      console.log('Submitting form data...');

      this.http.post<any>('http://127.0.0.1:8000/api/user/signup', formData)
        .subscribe({
          next: (response) => {
            console.log('Signup success:', response);

            // Store user data
            localStorage.setItem('userToken', response.data.token);
            localStorage.setItem('userId', response.data.user.id);
            localStorage.setItem('userName', response.data.user.user_name);
            localStorage.setItem('role', "user");
            if(!response.data.user.img)
              localStorage.setItem('img',"/AdminAvatar.png");
            else
               localStorage.setItem('img', response.data.user.img);
            // Navigate to home
            this.router.navigate(['/Home']);
          },
          error: (error) => {
            console.error('Signup error:', error.error.data);
            this.errorMessage = error.error?.data || 'Signup failed. Please try again.';
          }
        });

    } catch (error) {
      console.error('Signup failed:', error);
      this.errorMessage = 'Signup failed. Please try again.';
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.get(key)?.markAsTouched();
    });
  }
}
