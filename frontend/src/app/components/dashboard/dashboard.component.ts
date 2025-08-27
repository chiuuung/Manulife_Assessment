import { Component, OnInit } from '@angular/core';
import { AssetService } from '../../services/assets.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  assets: any[] = [];
  loading: boolean = true;
  error: string = '';
  totalValue: number = 0;
  totalInvestment: number = 0;
  totalProfit: number = 0;
  profitPercentage: number = 0;

  constructor(private assetService: AssetService) { }

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets(): void {
    this.loading = true;
    this.assetService.getAssets().subscribe({
      next: (data) => {
        this.assets = data;
        this.calculatePortfolioMetrics();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load assets. Please try again later.';
        this.loading = false;
        console.error(err);
      }
    });
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