import requests
from django.conf import settings
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class FinnhubService:
    BASE_URL = "https://finnhub.io/api/v1"
    
    def __init__(self):
        self.api_key = settings.FINNHUB_API_KEY
    
    def get_stock_quote(self, symbol):
        """Get real-time stock quote with PROPER validation"""
        try:
            url = f"{self.BASE_URL}/quote"
            params = {
                'symbol': symbol.upper(),
                'token': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Validate the response data to ensure the symbol is valid
            current_price = data.get('c', 0)
            
            # If the price is 0, None, or negative, the symbol probably doesn't exist
            if not current_price or current_price <= 0:
                logger.warning(f"Invalid price for symbol {symbol}: {current_price}")
                return None

            # Validate that other fields are not all zero (would indicate invalid symbol)
            if (data.get('h', 0) == 0 and data.get('l', 0) == 0 and 
                data.get('o', 0) == 0 and data.get('pc', 0) == 0):
                logger.warning(f"Suspicious data for symbol {symbol}: all zero values")
                return None
            
            return {
                'current_price': current_price,
                'change': data.get('d', 0),
                'percent_change': data.get('dp', 0),
                'high': data.get('h', 0),
                'low': data.get('l', 0),
                'open': data.get('o', 0),
                'previous_close': data.get('pc', 0)
            }
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                logger.error(f"Finnhub API rate limit exceeded for symbol {symbol}")
            else:
                logger.error(f"HTTP error getting stock quote for {symbol}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error getting stock quote for {symbol}: {e}")
            return None
    
    def validate_stock_symbol(self, symbol):
        """Validate if a stock symbol exists and is tradable"""
        try:
            # Verify with quote endpoint first
            quote_data = self.get_stock_quote(symbol)
            if not quote_data:
                return False, "Symbol not found or invalid"

            # Then check with profile for more information
            profile_data = self.get_stock_profile(symbol)
            if not profile_data:
                return True, "Symbol exists but no profile data"  # Still valid

            # Check that it's not OTC or untradable
            if profile_data.get('marketCapitalization', 0) == 0:
                return False, "Stock may not be actively traded"
                
            return True, "Valid stock symbol"
            
        except Exception as e:
            logger.error(f"Error validating stock symbol {symbol}: {e}")
            return False, f"Validation error: {str(e)}"
    
    def search_stocks(self, query):
        """Search stocks by symbol or name"""
        try:
            url = f"{self.BASE_URL}/search"
            params = {
                'q': query,
                'token': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return data.get('result', [])
            
        except Exception as e:
            logger.error(f"Error searching stocks: {e}")
            return []
    
    def get_stock_profile(self, symbol):
        """Get company profile and basic information"""
        try:
            url = f"{self.BASE_URL}/stock/profile2"
            params = {
                'symbol': symbol.upper(),
                'token': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()

            # If the profile is empty or has an error, return None
            if not data or 'name' not in data:
                return None
                
            return data
            
        except Exception as e:
            logger.error(f"Error getting stock profile for {symbol}: {e}")
            return None
    
    def get_stock_candles(self, symbol, resolution='D', count=30):
        """Get historical candle data (OHLC)"""
        try:
            # Calculate from_date (count days ago)
            to_date = int(datetime.now().timestamp())
            from_date = int((datetime.now() - timedelta(days=count*2)).timestamp())
            
            url = f"{self.BASE_URL}/stock/candle"
            params = {
                'symbol': symbol.upper(),
                'resolution': resolution,
                'from': from_date,
                'to': to_date,
                'token': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('s') == 'ok' and len(data.get('t', [])) > 0:
                # Format the candle data
                candles = []
                for i in range(len(data['t'])):
                    candles.append({
                        'timestamp': data['t'][i],
                        'open': data['o'][i],
                        'high': data['h'][i],
                        'low': data['l'][i],
                        'close': data['c'][i],
                        'volume': data['v'][i]
                    })
                return candles
            return []
            
        except Exception as e:
            logger.error(f"Error getting stock candles for {symbol}: {e}")
            return []
    
    def get_market_news(self, category='general'):
        """Get latest market news"""
        try:
            url = f"{self.BASE_URL}/news"
            params = {
                'category': category,
                'token': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error getting market news: {e}")
            return []
    
    def get_stock_recommendation_trends(self, symbol):
        """Get analyst recommendation trends"""
        try:
            url = f"{self.BASE_URL}/stock/recommendation"
            params = {
                'symbol': symbol.upper(),
                'token': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error getting recommendation trends for {symbol}: {e}")
            return None
    
    def get_symbols(self, exchange='US'):
        """Get all available symbols from an exchange"""
        try:
            url = f"{self.BASE_URL}/stock/symbol"
            params = {
                'exchange': exchange,
                'token': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error getting symbols for exchange {exchange}: {e}")
            return []
        
    def get_all_us_stocks(self):
        """Get all available US stocks"""
        try:
            symbols = self.get_symbols(exchange='US')
            # Filter for common stocks only
            common_stocks = [s for s in symbols if s.get('type') == 'Common Stock']
            return common_stocks[:100]  # Limit to 100 for demo
        except Exception as e:
            logger.error(f"Error getting all US stocks: {e}")
            return []

    def get_market_status(self):
        """Check if market is open - versión simplificada"""
        try:
            # Por ahora, siempre asumir abierto para testing
            return {'is_open': True, 'reason': 'Market is open'}
                
        except Exception as e:
            logger.error(f"Error checking market status: {e}")
            return {'is_open': True, 'reason': 'Assuming market is open due to error'}