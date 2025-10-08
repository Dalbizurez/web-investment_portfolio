from django.core.management.base import BaseCommand
from stocks.models import Stock, StockPriceHistory
from stocks.services.finnhub_service import FinnhubService
import time

class Command(BaseCommand):
    help = 'Update stock prices from Finnhub API'
    
    def handle(self, *args, **options):
        service = FinnhubService()
        stocks = Stock.objects.filter(is_active=True)
        
        self.stdout.write(f"Updating prices for {stocks.count()} stocks...")
        
        for stock in stocks:
            try:
                quote_data = service.get_stock_quote(stock.symbol)
                
                if quote_data and quote_data.get('current_price', 0) > 0:
                    current_price = quote_data['current_price']
                    
                    # Update current price
                    stock.current_price = current_price
                    stock.save()
                    
                    # Save to price history
                    StockPriceHistory.objects.create(
                        stock=stock,
                        price=current_price
                    )
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'Updated {stock.symbol}: ${current_price}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'No price data for {stock.symbol}')
                    )
                
                time.sleep(1)  # Rate limiting for free tier
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error updating {stock.symbol}: {e}')
                )