import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ShardService {

   private selectedCategorySource = new BehaviorSubject<number | null>(null);
  selectedCategory$ = this.selectedCategorySource.asObservable();

  setSelectedCategory(categoryId: number | null) {
    this.selectedCategorySource.next(categoryId);
  }
  }
