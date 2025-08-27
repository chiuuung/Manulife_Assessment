import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  transactions: any[] = [];
  loading = true;
  error = '';
  
  displayedColumns: string[] = ['date', 'asset', 'type', 'quantity', 'price', 'total', 'actions'];

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data.map(t => ({
          ...t,
          total: t.price * t.quantity
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transactions. Please try again later.';
        this.loading = false;
      }
    });
  }
}