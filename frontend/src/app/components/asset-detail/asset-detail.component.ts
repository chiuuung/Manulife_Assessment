import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AssetService } from '../../services/assets.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.scss']
})
export class AssetDetailComponent implements OnInit {
  asset: any;
  transactions: any[] = [];
  loading = true;
  transactionsLoading = true;
  error = '';
  
  displayedColumns: string[] = ['date', 'type', 'quantity', 'price', 'total'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assetService: AssetService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAsset(+id);
        this.loadTransactions(+id);
      } else {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadAsset(id: number): void {
    this.loading = true;
    this.assetService.getAsset(id).subscribe({
      next: (data) => {
        this.asset = data;
        this.calculateAssetMetrics();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load asset details';
        this.loading = false;
        this.snackBar.open(this.error, 'Close', { duration: 3000 });
      }
    });
  }

  loadTransactions(assetId: number): void {
    this.transactionsLoading = true;
    this.transactionService.getAssetTransactions(assetId).subscribe({
      next: (data) => {
        this.transactions = data;
        this.transactionsLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Failed to load transactions', 'Close', { duration: 3000 });
        this.transactionsLoading = false;
      }
    });
  }

  calculateAssetMetrics(): void {
    if (this.asset) {
      // Calculate current value
      this.asset.currentValue = this.asset.quantity * this.asset.current_price;
      
      // Calculate investment value
      this.asset.investmentValue = this.asset.quantity * this.asset.purchase_price;
      
      // Calculate profit/loss
      this.asset.profit = this.asset.currentValue - this.asset.investmentValue;
      this.asset.profitPercentage = ((this.asset.currentValue / this.asset.investmentValue) - 1) * 100;
    }
  }

  confirmDelete(): void {
    if (confirm('Are you sure you want to delete this asset? This will delete all related transactions and cannot be undone.')) {
      this.deleteAsset();
    }
  }

  deleteAsset(): void {
    if (!this.asset) return;
    
    this.loading = true;
    this.assetService.deleteAsset(this.asset.id).subscribe({
      next: () => {
        this.snackBar.open('Asset deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.snackBar.open('Failed to delete asset', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}