import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssetService } from '../../services/assets.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent implements OnInit {
  transactionForm: FormGroup;
  assets: any[] = [];
  loading = false;
  assetsLoading = true;
  preSelectedAssetId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private transactionService: TransactionService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.transactionForm = this.fb.group({
      asset_id: ['', Validators.required],
      type: ['buy', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0.000001)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadAssets();
    
    // Check if asset_id is passed as a query parameter
    this.route.queryParams.subscribe(params => {
      if (params['assetId']) {
        this.preSelectedAssetId = +params['assetId'];
        this.transactionForm.patchValue({
          asset_id: this.preSelectedAssetId
        });
      }
    });
  }

  loadAssets(): void {
    this.assetsLoading = true;
    this.assetService.getAssets().subscribe({
      next: (data) => {
        this.assets = data;
        this.assetsLoading = false;
        
        // If we have a preselected asset and assets are loaded, set the form value
        if (this.preSelectedAssetId && this.assets.length > 0) {
          this.transactionForm.patchValue({
            asset_id: this.preSelectedAssetId
          });
        }
      },
      error: (err) => {
        this.snackBar.open('Failed to load assets', 'Close', { duration: 3000 });
        this.assetsLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.transactionForm.value;
    
    this.transactionService.createTransaction(formData).subscribe({
      next: (response) => {
        this.snackBar.open('Transaction created successfully', 'Close', { duration: 3000 });
        if (this.preSelectedAssetId) {
          this.router.navigate(['/assets', this.preSelectedAssetId]);
        } else {
          this.router.navigate(['/transactions']);
        }
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Failed to create transaction';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}