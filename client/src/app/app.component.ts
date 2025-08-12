import { Component, OnInit } from '@angular/core';
import { zcAuth } from "@zcatalyst/auth-client";
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-app';

  constructor(private router: Router) {}

  async ngOnInit() {
    try {
      await zcAuth.init();
      console.log("ZC Auth initialized");
      
      // Check if user is authenticated and redirect accordingly
      const authResult = await zcAuth.isUserAuthenticated();
      const isAuthenticated = Boolean(authResult);
      
      if (isAuthenticated) {
        console.log("User is authenticated");
        this.router.navigate(['/home']);
      } else {
        console.log("User is not authenticated");
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      this.router.navigate(['/login']);
    }
  }
}
