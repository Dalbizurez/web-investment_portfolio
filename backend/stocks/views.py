from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from stocks.services.finnhub_service import FinnhubService
from stocks.models import UserPortfolio

@api_view(['GET'])
@permission_classes([AllowAny])
def search_stocks(request):
    """Search stocks by symbol or name (public endpoint)"""
    query = request.GET.get('q', '')
    
    if not query:
        return Response({'error': 'Query parameter "q" is required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    service = FinnhubService()
    results = service.search_stocks(query)
    
    return Response({
        'query': query,
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
    resolution = request.GET.get('resolution', 'D')  # D, W, M, 1, 5, 15, 30, 60
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
        'news': news[:20]  # Limit to 20 news items
    })

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
        
        current_value = float(item.quantity * current_price)
        invested_value = float(item.quantity * item.average_price)
        profit_loss = current_value - invested_value
        
        portfolio_data.append({
            'symbol': item.stock.symbol,
            'name': item.stock.name,
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