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
  selectedAsset: any = null;
  availableQuantity: number = 0;
  quantityError: string = '';
  priceLoading = false;
  priceError: string | null = null;

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

    // React to changes in asset or type selection
    this.transactionForm.get('asset_id')?.valueChanges.subscribe(id => {
      this.selectedAsset = this.assets.find(a => a.id == id);
      this.availableQuantity = this.selectedAsset ? Number(this.selectedAsset.quantity) : 0;
      this.checkQuantity();
      this.fetchLatestPriceForSelectedAsset();
    });
    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      this.checkQuantity();
    });
    this.transactionForm.get('quantity')?.valueChanges.subscribe(qty => {
      this.checkQuantity();
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
        // Update selected asset and available quantity
        const id = this.transactionForm.get('asset_id')?.value;
        this.selectedAsset = this.assets.find(a => a.id == id);
        this.availableQuantity = this.selectedAsset ? Number(this.selectedAsset.quantity) : 0;
        this.fetchLatestPriceForSelectedAsset();
      },
      error: (err) => {
        this.snackBar.open('Failed to load assets', 'Close', { duration: 3000 });
        this.assetsLoading = false;
      }
    });
  }

  checkQuantity(): void {
    const type = this.transactionForm.get('type')?.value;
    const quantityCtrl = this.transactionForm.get('quantity');
    const qty = Number(quantityCtrl?.value);

    if (type === 'sell') {
      if (qty > this.availableQuantity) {
        this.quantityError = `Cannot sell more than owned: ${this.availableQuantity}`;
        const errors = quantityCtrl?.errors || {};
        errors['exceed'] = true;
        quantityCtrl?.setErrors(errors);
      } else {
        // Remove only 'exceed'
        if (quantityCtrl?.errors) {
          const errors = { ...quantityCtrl.errors };
          delete errors['exceed'];
          quantityCtrl.setErrors(Object.keys(errors).length ? errors : null);
        }
        this.quantityError = '';
      }
    } else {
      // For buy, remove 'exceed' only
      if (quantityCtrl?.errors) {
        const errors = { ...quantityCtrl.errors };
        delete errors['exceed'];
        quantityCtrl.setErrors(Object.keys(errors).length ? errors : null);
      }
      this.quantityError = '';
    }
  }

  formatTypeForApi(type: string): string {
    switch (type) {
      case 'mutual_fund': return 'mutual fund';
      case 'crypto': return 'cryptocurrency';
      default: return type;
    }
  }

  fetchLatestPriceForSelectedAsset(): void {
    this.priceError = null;
    this.priceLoading = false;
    if (!this.selectedAsset) return;
    const type = this.selectedAsset.type;
    const symbol = this.selectedAsset.symbol;
    const formattedType = this.formatTypeForApi(type);
    const supported = ['stock', 'mutual fund', 'cryptocurrency'];
    if (!supported.includes(formattedType) || !symbol) {
      this.transactionForm.get('price')?.setValue('');
      return;
    }
    this.priceLoading = true;
    this.assetService.getLivePrice(formattedType, symbol).subscribe({
      next: res => {
        this.transactionForm.get('price')!.setValue(res.price || '');
        this.priceLoading = false;
      },
      error: err => {
        this.priceError = err?.error?.message || 'Failed to fetch live price';
        this.priceLoading = false;
        this.transactionForm.get('price')!.setValue('');
      }
    });
  }

  onSubmit(): void {
    // Only block if quantityError is present for sell type
    if (
      this.transactionForm.invalid ||
      (this.transactionForm.get('type')?.value === 'sell' && this.quantityError)
    ) {
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