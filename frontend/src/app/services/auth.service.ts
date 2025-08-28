import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) { }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, email, password })
      .pipe(
        tap((response: any) => {
          console.log('[AuthService][register] Response from backend:', response);
          this.setToken(response.token);
          this.setUser(response.user);
        })
      );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response: any) => {
          console.log('[AuthService][login] Response from backend:', response);
          this.setToken(response.token);
          this.setUser(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): any {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  private setToken(token: string): void {
    console.log('[AuthService][setToken] Saving token to localStorage:', token);
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: any): void {
    console.log('[AuthService][setUser] Saving user to localStorage:', user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}