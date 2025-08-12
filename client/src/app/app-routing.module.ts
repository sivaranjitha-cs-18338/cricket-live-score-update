import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/app.login';
import { HomeComponent } from './home/home.component';
import { DatastreamComponent } from './datastream/app.datastream';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'cricket', component: DatastreamComponent },
  { path: 'datastream', redirectTo: '/cricket', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' } // Wildcard route for 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
