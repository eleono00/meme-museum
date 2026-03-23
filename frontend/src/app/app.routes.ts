import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ProfileComponent } from './components/profile/profile'; 

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Meme Museum' },
  { path: 'login', component: LoginComponent, title: 'Accedi' },
  { path: 'register', component: RegisterComponent, title: 'Registrati' },
  { path: 'profile', component: ProfileComponent, title: 'Il Mio Profilo' },
  { path: '**', redirectTo: '' }
];