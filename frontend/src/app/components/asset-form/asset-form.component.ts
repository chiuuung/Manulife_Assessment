import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssetService } from '../../services/assets.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-asset-form',
  templateUrl: './asset-form.component.html',
  styleUrls: ['./asset-form.component.scss']
})
export class AssetFormComponent implements OnInit {
  assetForm: FormGroup;
  isEditMode = false;
  assetId: number | null = null;
  loading = false;
  priceLoading = false;
  priceError: string | null = null;
  assetTypes = [
    { value: 'stock', label: 'Stock' },
    { value: 'bond', label: 'Bond' },
    { value: 'mutual_fund', label: 'Mutual Fund' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'other', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.assetForm = this.fb.group({
      type: ['stock', Validators.required],
      symbol: ['', Validators.required],
      name: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0.000001)]],
      purchase_date: [this.getTodayDateString(), Validators.required],
      current_price: [''] 
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.assetId = +id;
        this.loadAsset(this.assetId);
      }
    });

    // Auto-fetch current price when type or symbol changes
    this.assetForm.get('type')!.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.tryFetchLivePrice());

    this.assetForm.get('symbol')!.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => this.tryFetchLivePrice());
  }

  getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }

  loadAsset(id: number): void {
    this.loading = true;
    this.assetService.getAsset(id).subscribe({
      next: (asset) => {
        this.assetForm.patchValue({
          ...asset,
          purchase_date: asset.purchase_date
            ? new Date(asset.purchase_date).toISOString().slice(0, 10)
            : this.getTodayDateString()
        });
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Failed to load asset details', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/dashboard']);
      }
    });
  }

  formatTypeForApi(type: string): string {
    switch (type) {
      case 'mutual_fund': return 'mutual fund';
      case 'crypto': return 'cryptocurrency';
      default: return type;
    }
  }

  tryFetchLivePrice(): void {
    this.priceError = null;
    const type = this.assetForm.get('type')!.value;
    const symbol = this.assetForm.get('symbol')!.value;
    if (!type || !symbol) {
      return;
    }
    const formattedType = this.formatTypeForApi(type);
    const supported = ['stock', 'mutual fund', 'cryptocurrency'];
    if (!supported.includes(formattedType)) {
      return;
    }
    this.priceLoading = true;
    this.assetService.getLivePrice(formattedType, symbol).subscribe({
      next: res => {
        this.assetForm.get('current_price')!.setValue(res.price || '');
        this.priceLoading = false;
      },
      error: err => {
        this.priceError = err?.error?.message || 'Failed to fetch live price';
        this.priceLoading = false;
        this.assetForm.get('current_price')!.setValue('');
      }
    });
  }

  formatDateForBackend(date: any): string {
    if (!date) return '';
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
    if (date instanceof Date) return date.toISOString().slice(0, 10);
    const dt = new Date(date);
    if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
    return '';
  }

  onSubmit(): void {
    if (this.assetForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.assetForm.value;
    const formData = {
      ...formValue,
      purchase_date: this.formatDateForBackend(formValue.purchase_date),
      purchase_price: formValue.current_price || formValue.purchase_price || 0,
      current_price: formValue.current_price || 0
    };

    if (this.isEditMode && this.assetId) {
      this.assetService.updateAsset(this.assetId, formData).subscribe({
        next: () => {
          this.snackBar.open('Asset updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Backend error on update:', err);
          const backendMsg = err?.error?.message || 'Failed to update asset';
          this.snackBar.open(backendMsg, 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.assetService.createAsset(formData).subscribe({
        next: () => {
          this.snackBar.open('Asset added successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Backend error on create:', err);
          const backendMsg = err?.error?.message || 'Failed to add asset';
          this.snackBar.open(backendMsg, 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }
}