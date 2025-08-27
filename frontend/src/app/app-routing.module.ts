import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AssetFormComponent } from './components/asset-form/asset-form.component';
import { AssetDetailComponent } from './components/asset-detail/asset-detail.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route is now the home component
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }, // Protected by AuthGuard
  { path: 'assets/add', component: AssetFormComponent, canActivate: [AuthGuard] },
  { path: 'assets/edit/:id', component: AssetFormComponent, canActivate: [AuthGuard] },
  { path: 'assets/:id', component: AssetDetailComponent, canActivate: [AuthGuard] },
  { path: 'transactions', component: TransactionListComponent, canActivate: [AuthGuard] },
  { path: 'transactions/add', component: TransactionFormComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' } // Redirect all unknown paths to home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }