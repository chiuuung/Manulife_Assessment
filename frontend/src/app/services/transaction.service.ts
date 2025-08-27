import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:3000/api/transactions';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getAssetTransactions(assetId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/asset/${assetId}`, { headers: this.getHeaders() });
  }

  createTransaction(transaction: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, transaction, { headers: this.getHeaders() });
  }
}