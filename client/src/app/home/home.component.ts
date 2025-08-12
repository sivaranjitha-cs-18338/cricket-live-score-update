import { Component } from '@angular/core';
import { zcAuth } from "@zcatalyst/auth-client";
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <h1>Welcome to DataStreams</h1>
      <div *ngIf="!isAuthenticated" class="auth-prompt">
        <p>Please sign in to access the application.</p>
        <button (click)="navigateToLogin()" class="btn btn-primary">
          Go to Login
        </button>
      </div>
      <div *ngIf="isAuthenticated" class="authenticated-content">
        <p>You are successfully logged in!</p>
        <button (click)="navigateToDatastream()" class="btn btn-primary">
          🏏 View Live Cricket Scores
        </button>
        <button (click)="signOut()" class="btn btn-secondary">
          Sign Out
        </button>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 2rem;
      text-align: center;
    }
    .auth-prompt, .authenticated-content {
      margin-top: 2rem;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      margin: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-primary {
      background-color: #1976d2;
      color: white;
    }
    .btn-secondary {
      background-color: #757575;
      color: white;
    }
  `]
})
export class HomeComponent {
  isAuthenticated = false;

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  async checkAuthStatus() {
    try {
      const authResult = await zcAuth.isUserAuthenticated();
      this.isAuthenticated = Boolean(authResult);
    } catch (error) {
      console.error("Error checking auth status:", error);
      this.isAuthenticated = false;
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToDatastream() {
    // Navigate to cricket live scores
    this.router.navigate(['/cricket']);
  }

  async signOut() {
    try {
      // Catalyst Auth signOut requires a string parameter (possibly redirect URL)
      await zcAuth.signOut('/login');
      this.isAuthenticated = false;
      this.router.navigate(['/login']);
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if signOut fails, redirect to login
      this.isAuthenticated = false;
      this.router.navigate(['/login']);
    }
  }
}
