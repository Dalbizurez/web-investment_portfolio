# stocks/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from stocks.services.finnhub_service import FinnhubService
from stocks.models import UserPortfolio, Stock
from stocks.utils import validate_trading_hours
from decimal import Decimal


# PUBLIC ENDPOINTS - No authentication required
@api_view(['GET'])
@permission_classes([AllowAny])
def search_stocks(request):
    """
    Search stocks with multiple filters
    Query params:
    - q: Search query (symbol or name)
    - sector: Filter by sector
    - min_price: Minimum price filter
    - max_price: Maximum price filter
    - exchange: Filter by exchange (NASDAQ, NYSE, etc.)
    """
    query = request.GET.get('q', '')
    sector = request.GET.get('sector', '')
    min_price = request.GET.get('min_price', '')
    max_price = request.GET.get('max_price', '')
    exchange = request.GET.get('exchange', '')
    
    if not query:
        return Response({'error': 'Query parameter "q" is required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    service = FinnhubService()
    results = service.search_stocks(query)
    
    # Apply additional filters if stocks exist in our database
    if sector or min_price or max_price or exchange:
        filtered_results = []
        
        for result in results:
            symbol = result.get('symbol', '')
            
            # Try to get stock from our database for additional filtering
            try:
                stock = Stock.objects.get(symbol=symbol)
                
                # Filter by sector
                if sector and stock.sector:
                    if sector.lower() not in stock.sector.lower():
                        continue
                
                # Filter by price range
                if min_price:
                    try:
                        if float(stock.current_price) < float(min_price):
                            continue
                    except (ValueError, TypeError):
                        pass
                
                if max_price:
                    try:
                        if float(stock.current_price) > float(max_price):
                            continue
                    except (ValueError, TypeError):
                        pass
                
                # Filter by exchange
                if exchange:
                    if exchange.upper() not in stock.exchange.upper():
                        continue
                
                # Add database info to result
                result['sector'] = stock.sector
                result['current_price'] = float(stock.current_price)
                result['exchange'] = stock.exchange
                
            except Stock.DoesNotExist:
                # If stock not in our DB, include it anyway if no filters applied
                if not (sector or min_price or max_price or exchange):
                    pass
                else:
                    continue
            
            filtered_results.append(result)
        
        results = filtered_results
    
    return Response({
        'query': query,
        'filters': {
            'sector': sector or None,
            'min_price': min_price or None,
            'max_price': max_price or None,
            'exchange': exchange or None
        },
        'results': results,
        'count': len(results)
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_stock_detail(request, symbol):
    """Get detailed stock information (public endpoint)"""
    service = FinnhubService()
    
    # Get real-time quote
    quote_data = service.get_stock_quote(symbol)
    
    # Get company profile
    profile_data = service.get_stock_profile(symbol)
    
    # Get historical data
    historical_data = service.get_stock_candles(symbol, resolution='D', count=30)
    
    # Get recommendation trends
    recommendations = service.get_stock_recommendation_trends(symbol)
    
    data = {
        'symbol': symbol.upper(),
        'quote': quote_data,
        'profile': profile_data,
        'historical_data': historical_data,
        'recommendations': recommendations,
    }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_stock_history(request, symbol):
    """Get historical stock data (public endpoint)"""
    resolution = request.GET.get('resolution', 'D')
    count = int(request.GET.get('count', 30))
    
    service = FinnhubService()
    history = service.get_stock_candles(symbol, resolution=resolution, count=count)
    
    return Response({
        'symbol': symbol.upper(),
        'resolution': resolution,
        'count': count,
        'history': history
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_market_news(request):
    """Get latest market news (public endpoint)"""
    category = request.GET.get('category', 'general')
    
    service = FinnhubService()
    news = service.get_market_news(category=category)
    
    return Response({
        'category': category,
        'news': news[:20]
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def check_market_status(request):
    """Check if market is currently open for trading"""
    is_open, message = validate_trading_hours()
    
    return Response({
        'is_open': is_open,
        'message': message
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_available_sectors(request):
    """Get list of all available sectors/categories"""
    sectors = Stock.objects.filter(
        sector__isnull=False
    ).values_list('sector', flat=True).distinct().order_by('sector')
    
    return Response({
        'sectors': list(sectors),
        'count': len(sectors)
    })


# PROTECTED ENDPOINTS - Require Auth0 authentication
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_portfolio(request):
    """Get user's portfolio (authenticated endpoint)"""
    service = FinnhubService()
    portfolio_items = UserPortfolio.objects.filter(user=request.user)
    
    portfolio_data = []
    total_invested = 0
    total_current_value = 0
    
    for item in portfolio_items:
        # Get current price from Finnhub
        quote_data = service.get_stock_quote(item.stock.symbol)
        current_price = quote_data.get('current_price', 0) if quote_data else item.stock.current_price
        
        current_value = float(item.quantity * Decimal(str(current_price)))
        invested_value = float(item.quantity * item.average_price)
        profit_loss = current_value - invested_value
        
        portfolio_data.append({
            'symbol': item.stock.symbol,
            'name': item.stock.name,
            'sector': item.stock.sector,
            'quantity': item.quantity,
            'average_price': float(item.average_price),
            'current_price': current_price,
            'current_value': current_value,
            'invested_value': invested_value,
            'profit_loss': profit_loss,
            'profit_loss_percentage': (profit_loss / invested_value * 100) if invested_value > 0 else 0,
            'daily_change': quote_data.get('change', 0) if quote_data else 0,
            'daily_change_percentage': quote_data.get('percent_change', 0) if quote_data else 0
        })
        
        total_invested += invested_value
        total_current_value += current_value
    
    return Response({
        'portfolio': portfolio_data,
        'summary': {
            'total_invested': total_invested,
            'total_current_value': total_current_value,
            'total_profit_loss': total_current_value - total_invested,
            'total_profit_loss_percentage': ((total_current_value - total_invested) / total_invested * 100) if total_invested > 0 else 0
        }
    })