import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssetService } from '../../services/assets.service';

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
      purchase_price: ['', [Validators.required, Validators.min(0.01)]],
      purchase_date: [new Date(), Validators.required],
      current_price: ['', [Validators.required, Validators.min(0.01)]]
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
  }

  loadAsset(id: number): void {
    this.loading = true;
    this.assetService.getAsset(id).subscribe({
      next: (asset) => {
        this.assetForm.patchValue({
          ...asset,
          purchase_date: new Date(asset.purchase_date)
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

  onSubmit(): void {
    if (this.assetForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.assetForm.value;

    if (this.isEditMode && this.assetId) {
      this.assetService.updateAsset(this.assetId, formData).subscribe({
        next: () => {
          this.snackBar.open('Asset updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.snackBar.open('Failed to update asset', 'Close', { duration: 3000 });
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
          this.snackBar.open('Failed to add asset', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }
}