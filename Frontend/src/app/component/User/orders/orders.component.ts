import { Component ,OnInit  } from '@angular/core';
import { RedirectService } from '../../../service/redirect.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
@Component({
  selector: 'app-orders',
  imports: [NavbarComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class UserOrdersComponent implements OnInit {

  constructor(private redirectService: RedirectService) {
  }

  ngOnInit(): void {
    this.redirectService.redirectuser();
  }

}
