// categories.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../service/products.service';
import { ShardService } from '../../../service/shard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-categories',
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: any[] = [];
  loading: boolean = true;
  error: string = '';
  selectedCategoryId: number | null = null;

  private categorySubscription?: Subscription;

  constructor(
    private productService: ProductsService,
    private shardService: ShardService
  ) {}

  ngOnInit(): void {
    this.loadCategories();

    // Listen to category changes to update UI
    this.categorySubscription = this.shardService.selectedCategory$.subscribe((categoryId) => {
      this.selectedCategoryId = categoryId;
    });
  }

  ngOnDestroy(): void {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

  private loadCategories(): void {
    this.loading = true;
    this.error = '';

    this.productService.allCategories().subscribe({
      next: (response) => {
        this.categories = response.data || response || [];
        this.loading = false;
        console.log('Categories loaded successfully:', this.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  onCategoryClick(categoryId: number): void {
    console.log('Category selected:', categoryId);
    this.shardService.setSelectedCategory(categoryId);
  }

  showAllProducts(): void {
    console.log('Show all products selected');
    this.shardService.setSelectedCategory(null);
  }

  isSelected(categoryId: number | null): boolean {
    return this.selectedCategoryId === categoryId;
  }
}
