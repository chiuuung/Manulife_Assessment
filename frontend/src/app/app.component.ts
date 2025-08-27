import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Portfolio Manager';
  isLoggedIn = false;
  private routerSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check authentication status on initialization
    this.isLoggedIn = this.authService.isAuthenticated();
    
    // Add navigation event logging for debugging
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('Navigation started:', event.url);
      } else if (event instanceof NavigationEnd) {
        console.log('Navigation completed:', event.url);
        this.isLoggedIn = this.authService.isAuthenticated();
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  
  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}