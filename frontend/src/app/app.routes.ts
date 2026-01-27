import { Routes } from '@angular/router';
// NOTA: Qui importiamo dai file col nome corto
import { RegisterComponent } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent, title: 'Registrazione' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'home', component: HomeComponent, title: 'Museo dei Meme' },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];