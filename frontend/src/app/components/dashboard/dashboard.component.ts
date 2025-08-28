import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssetService } from '../../services/assets.service';
import { forkJoin, of, Subscription, timer } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  assets: any[] = [];
  loading: boolean = true;
  error: string = '';
  totalValue: number = 0;
  totalInvestment: number = 0;
  totalProfit: number = 0;
  profitPercentage: number = 0;

  // For auto-refresh
  private priceRefreshInterval: any;
  private readonly REFRESH_MS = 60000; // 1 minute (adjust as needed)
  refreshing: boolean = false; // for spinner on button

  constructor(private assetService: AssetService) { }

  ngOnInit(): void {
    this.loadAssets();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadAssets(): void {
    this.loading = true;
    this.assetService.getAssets().subscribe({
      next: (data) => {
        this.assets = data;
        this.refreshAllCurrentPrices();
      },
      error: (err) => {
        this.error = 'Failed to load assets. Please try again later.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Utility to map frontend asset type to backend
  formatTypeForApi(type: string): string {
    switch (type) {
      case 'mutual_fund': return 'mutual fund';
      case 'crypto': return 'cryptocurrency';
      default: return type;
    }
  }

  refreshAllCurrentPrices(): void {
    this.refreshing = true;
    const supported = ['stock', 'mutual_fund', 'crypto'];
    const priceCalls = this.assets.map(asset => {
      if (!supported.includes(asset.type)) {
        return of({ price: asset.current_price });
      }
      // Use the mapping here:
      return this.assetService.getLivePrice(this.formatTypeForApi(asset.type), asset.symbol)
        .pipe(
          catchError(_ => of({ price: asset.current_price }))
        );
    });
  
    forkJoin(priceCalls).subscribe((prices: any[]) => {
      this.assets.forEach((asset, i) => {
        asset.current_price = prices[i].price ?? asset.current_price;
      });
      this.calculatePortfolioMetrics();
      this.loading = false;
      this.refreshing = false;
    });
  }

  startAutoRefresh() {
    this.priceRefreshInterval = setInterval(() => {
      this.refreshAllCurrentPrices();
    }, this.REFRESH_MS);
  }

  stopAutoRefresh() {
    if (this.priceRefreshInterval) {
      clearInterval(this.priceRefreshInterval);
    }
  }

  manualRefresh() {
    this.refreshAllCurrentPrices();
  }

  calculatePortfolioMetrics(): void {
    this.totalValue = 0;
    this.totalInvestment = 0;

    this.assets.forEach(asset => {
      // Calculate current value
      const currentValue = asset.quantity * asset.current_price;
      asset.currentValue = currentValue;
      this.totalValue += currentValue;

      // Calculate investment value
      const investmentValue = asset.quantity * asset.purchase_price;
      asset.investmentValue = investmentValue;
      this.totalInvestment += investmentValue;
      
      // Calculate profit/loss
      asset.profit = currentValue - investmentValue;
      asset.profitPercentage = ((currentValue / investmentValue) - 1) * 100;
    });

    this.totalProfit = this.totalValue - this.totalInvestment;
    this.profitPercentage = this.totalInvestment !== 0 ? 
      ((this.totalValue / this.totalInvestment) - 1) * 100 : 0;
  }
}