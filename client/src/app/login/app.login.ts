import { Component } from '@angular/core';
import { zcAuth } from "@zcatalyst/auth-client";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './app.login.html',
  styleUrls: []
})
export class LoginComponent {
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  async checkAuthStatus() {
    try {
      const isAuthenticated = await zcAuth.isUserAuthenticated();
      if (isAuthenticated) {
        console.log("User is already authenticated");
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  }

  async signIn() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      const isAuthenticated = await zcAuth.isUserAuthenticated();
      if (isAuthenticated) {
        console.log("User is already authenticated");
        this.router.navigate(['/home']);
      } else {
        // Redirect to Catalyst auth login
        window.location.href = '/__catalyst/auth/login';
      }
    } catch (error) {
      this.errorMessage = 'Login failed. Please try again.';
      console.error("Login error:", error);
    } finally {
      this.isLoading = false;
    }
  }

  async signOut() {
    try {
      this.isLoading = true;
      // Catalyst Auth signOut requires a string parameter (possibly redirect URL)
      await zcAuth.signOut('/login');
      console.log("User signed out");
      this.router.navigate(['/login']);
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if signOut fails, redirect to login
      this.router.navigate(['/login']);
    } finally {
      this.isLoading = false;
    }
  }
}