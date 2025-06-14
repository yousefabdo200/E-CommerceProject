import { Component } from '@angular/core';
import { NavbarComponent } from "../Shared/navbar/navbar.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, HttpClientModule],
  templateUrl: './add-products.component.html',
  styleUrl: './add-products.component.css'
})
export class AddProductsComponent {
  addproductForm: FormGroup;
  errorMessage: any;
  selectedImage: File | null = null;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.addproductForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(250)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1500)]],
      price: ['', [Validators.required, Validators.min(0), Validators.max(100000), this.numericValidator]],
      amount: ['', [Validators.required, Validators.min(1), Validators.max(100000), this.numericValidator]],
      img: ['', [this.imageValidator]], // Apply custom image validator
      category_name: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  /**
   * Custom validator function for numeric fields
   * Ensures the input is a valid number
   * @param control - The form control containing the numeric value
   * @returns ValidationErrors object if validation fails, null if valid
   */
  private numericValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Allow empty values (handled by required validator)
    if (!value || value === '') {
      return null;
    }

    // Check if value is numeric
    if (isNaN(value) || isNaN(parseFloat(value))) {
      return { numeric: true };
    }

    return null;
  };

  /**
   * Custom validator function for image file validation
   * Validates file type, size, and existence
   * @param control - The form control containing the file
   * @returns ValidationErrors object if validation fails, null if valid
   */
  private imageValidator = (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;

    // Check if file exists
    if (!file) {
      return { required: true };
    }

    // Ensure the value is actually a File object
    if (!(file instanceof File)) {
      return { invalidFile: true };
    }

    // Define allowed image types and maximum file size (2MB as per requirements)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes (2048KB)

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      return { invalidType: true };
    }

    // Validate file size
    if (file.size > maxSize) {
      return { maxSize: true };
    }

    // All validations passed
    return null;
  };

  /**
   * Handle image file selection from input element
   * Validates the selected file and updates form control
   * @param event - The file input change event
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Update the form control value
      this.addproductForm.patchValue({ img: file });

      // Trigger validation
      this.addproductForm.get('img')?.updateValueAndValidity();

      // Check if validation passed
      const imgControl = this.addproductForm.get('img');
      if (imgControl && imgControl.valid) {
        this.selectedImage = file;
        this.errorMessage = '';
      } else if (imgControl) {
        this.handleImageValidationErrors(imgControl.errors);
        this.resetImageInput();
      }
    }
  }

  /**
   * Handle validation errors for image field
   * Sets appropriate error messages based on validation failure type
   * @param errors - ValidationErrors object from form control
   */
  private handleImageValidationErrors(errors: ValidationErrors | null): void {
    if (!errors) return;

    if (errors['required']) {
      this.errorMessage = 'Please select an image file';
    } else if (errors['invalidType']) {
      this.errorMessage = 'Please select a valid image file (JPG, PNG, JPEG, GIF)';
    } else if (errors['maxSize']) {
      this.errorMessage = 'Image file size must be less than 2MB';
    } else if (errors['invalidFile']) {
      this.errorMessage = 'Invalid file format';
    }
  }

  /**
   * Reset the image input field and clear selected image
   * Clears both form control value and file input element
   */
  private resetImageInput(): void {
    this.selectedImage = null;
    this.addproductForm.patchValue({ img: '' });

    // Reset the file input element
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Check if image field has a specific validation error
   * @param errorType - The type of error to check for
   * @returns boolean indicating if the error exists and field is touched
   */
  hasImageError(errorType: string): boolean {
    const imgControl = this.addproductForm.get('img');
    return !!(imgControl?.errors?.[errorType] && imgControl.touched);
  }

  /**
   * Get error message for a specific form field
   * Returns appropriate error message based on validation failure
   * @param fieldName - The name of the form field
   * @returns Error message string or empty string if no error
   */
  getFieldError(fieldName: string): string {
    const field = this.addproductForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${this.getFieldDisplayName(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${this.getFieldDisplayName(fieldName)} must not exceed ${field.errors['max'].max}`;
      if (field.errors['numeric']) return `${this.getFieldDisplayName(fieldName)} must be a valid number`;
    }

    return '';
  }

  /**
   * Get display name for form field
   * Maps field names to user-friendly display names
   * @param fieldName - The internal field name
   * @returns User-friendly display name
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'name': 'Product Name',
      'description': 'Description',
      'price': 'Price',
      'amount': 'Amount',
      'img': 'Image',
      'category_name': 'Category Name'
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Handle form submission
   * Validates form, creates FormData, and submits to API
   * Manages loading state and error handling
   */
  async onSubmit(): Promise<void> {
    // Prevent double submission
    if (this.isSubmitting) {
      return;
    }

    // Check if form is valid
    if (this.addproductForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    // Set loading state
    this.isSubmitting = true;

    try {
      const formData = new FormData();

      // Add all form fields to FormData
      Object.entries(this.addproductForm.value).forEach(([key, value]) => {
        if (key === 'img' && this.selectedImage) {
          formData.append(key, this.selectedImage);
        } else if (key !== 'img' && value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });

      console.log('Submitting form data...');
      const token = localStorage.getItem('userToken');
      // Submit form data to API
      this.http.post<any>(`http://127.0.0.1:8000/api/admin/product?token=${token}`, formData)
        .subscribe({
          next: (response) => {
            console.log('Product added successfully:', response);

            // Navigate to products page or show success message
            this.router.navigate(['/Admin/AdminHome']);
          },
          error: (error) => {
            console.error('Add product error:', error.error.data);
            this.errorMessage = error.error?.data || 'Failed to add product. Please try again.';
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });

    } catch (error) {
      console.error('Add product failed:', error);
      this.errorMessage = 'Failed to add product. Please try again.';
      this.isSubmitting = false;
    }
  }


  private markAllFieldsAsTouched(): void {
    Object.keys(this.addproductForm.controls).forEach(key => {
      this.addproductForm.get(key)?.markAsTouched();
    });
  }
}
