# stocks/views_transactions.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from decimal import Decimal
from .models import Stock, UserPortfolio, Transaction, UserBalance
from .services.finnhub_service import FinnhubService
from .utils import validate_trading_hours
from .emails.services import TransactionEmailService
import logging
from django.db import IntegrityError

logger = logging.getLogger(__name__)

def get_client_ip(request):
    """Get client IP address for non-repudiation"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_stock(request):
    """Buy stock shares - Uses Auth0 authentication"""
    try:
        symbol = request.data.get('symbol', '').upper().strip()
        quantity = int(request.data.get('quantity', 0))

        is_market_open, market_message = validate_trading_hours()
        if not is_market_open:
            return Response({
                'error': 'Trading not allowed at this time',
                'message': market_message,
                'market_open': False
            }, status=status.HTTP_400_BAD_REQUEST)

        if not symbol:
            return Response({'error': 'Stock symbol is required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        if quantity <= 0:
            return Response({'error': 'Quantity must be greater than 0'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        if len(symbol) < 1 or len(symbol) > 10:
            return Response({'error': 'Invalid stock symbol format'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        service = FinnhubService()
        
        is_valid, validation_message = service.validate_stock_symbol(symbol)
        if not is_valid:
            return Response({'error': f'Invalid stock symbol: {validation_message}'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        quote_data = service.get_stock_quote(symbol)
        if not quote_data:
            return Response({'error': 'Could not get valid stock price'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        current_price = Decimal(str(quote_data['current_price']))
        total_cost = current_price * quantity

        if current_price <= 0:
            return Response({'error': 'Invalid stock price'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        user_balance, created = UserBalance.objects.get_or_create(
            user=request.user, 
            defaults={'balance': Decimal('0')}
        )
        
        if user_balance.balance < total_cost:
            return Response({'error': 'Insufficient balance'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():

            stock, created = Stock.objects.get_or_create(
                symbol=symbol,
                defaults={
                    'name': f"{symbol} Corporation",
                    'current_price': current_price,
                    'currency': 'USD',
                    'exchange': 'NASDAQ'
                }
            )

            if created:
                profile_data = service.get_stock_profile(symbol)
                if profile_data:
                    stock.name = profile_data.get('name', f"{symbol} Corporation")
                    stock.exchange = profile_data.get('exchange', 'NASDAQ')
                    stock.currency = profile_data.get('currency', 'USD')
                    stock.sector = profile_data.get('finnhubIndustry', '')
                    stock.market_cap = profile_data.get('marketCapitalization')
                    stock.save()

            stock.current_price = current_price
            stock.save()

            try:
                portfolio_item = UserPortfolio.objects.select_for_update().get(user=request.user, stock=stock)
                total_quantity = portfolio_item.quantity + quantity
                total_value = (portfolio_item.quantity * portfolio_item.average_price) + total_cost
                portfolio_item.quantity = total_quantity
                portfolio_item.average_price = total_value / total_quantity
                portfolio_item.save()

            except UserPortfolio.DoesNotExist:
                try:
                    portfolio_item = UserPortfolio.objects.create(
                        user=request.user,
                        stock=stock,
                        quantity=quantity,
                        average_price=current_price
                    )
                #    
                except IntegrityError:
                    portfolio_item, _ = UserPortfolio.objects.get_or_create(
                        user=request.user,
                        stock=stock,
                        defaults={
                            'quantity': quantity,
                            'average_price': current_price
                        }
                    )


            user_balance.balance -= total_cost
            user_balance.save()

            
            transaction_record = Transaction.objects.create(
                user=request.user,
                transaction_type='BUY',
                stock=stock,
                quantity=quantity,
                price=current_price,
                amount=-total_cost,
                ip_address=get_client_ip(request)
            )
        
        # Send email notification
        TransactionEmailService.send_buy_confirmation_email(
            user=request.user,
            transaction=transaction_record,
            stock=stock
        )
        
        return Response({
            'message': f'Successfully bought {quantity} shares of {symbol}',
            'total_cost': float(total_cost),
            'new_balance': float(user_balance.balance),
            'stock_name': stock.name,
            'market_open': True
        })
        
    except Exception as e:
        logger.error(f"Error buying stock: {e}")
        logger.error(f"Request data: {request.data}")
        return Response({'error': 'Internal server error'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sell_stock(request):
    """Sell stock shares - Uses Auth0 authentication"""
    try:
        symbol = request.data.get('symbol', '').upper().strip()
        quantity = int(request.data.get('quantity', 0))
        
        if not symbol or quantity <= 0:
            return Response({'error': 'Symbol and valid quantity required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # COMENTADO PARA USAR VENTAS EN CUALQUIER MOMENTO
        is_market_open, market_message = validate_trading_hours()
        if not is_market_open:
            return Response({
                'error': 'Trading not allowed at this time',
                'message': market_message,
                'market_open': False
            }, status=status.HTTP_400_BAD_REQUEST)

        service = FinnhubService()
        
        is_valid, validation_message = service.validate_stock_symbol(symbol)
        if not is_valid:
            return Response({'error': f'Invalid stock symbol: {validation_message}'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        quote_data = service.get_stock_quote(symbol)
        if not quote_data:
            return Response({'error': 'Could not get valid stock price'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        current_price = Decimal(str(quote_data['current_price']))
        total_revenue = current_price * quantity
        
        try:
            portfolio_item = UserPortfolio.objects.get(user=request.user, stock__symbol=symbol)
            if portfolio_item.quantity < quantity:
                return Response({'error': 'Insufficient shares'}, 
                               status=status.HTTP_400_BAD_REQUEST)
        except UserPortfolio.DoesNotExist:
            return Response({'error': 'You do not own this stock'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            portfolio_item.quantity -= quantity
            if portfolio_item.quantity == 0:
                portfolio_item.quantity = 0
                portfolio_item.save()
            else:
                portfolio_item.save()
            
            user_balance = UserBalance.objects.get(user=request.user)
            user_balance.balance += total_revenue
            user_balance.save()
            
            transaction_record = Transaction.objects.create(
                user=request.user,
                transaction_type='SELL',
                stock=portfolio_item.stock,
                quantity=quantity,
                price=current_price,
                amount=total_revenue,
                ip_address=get_client_ip(request)
            )
        
        # Send email notification
        TransactionEmailService.send_sell_confirmation_email(
            user=request.user,
            transaction=transaction_record,
            stock=portfolio_item.stock
        )
        
        return Response({
            'message': f'Successfully sold {quantity} shares of {symbol}',
            'total_revenue': float(total_revenue),
            'new_balance': float(user_balance.balance),
            'market_open': True
        })
        
    except Exception as e:
        logger.error(f"Error selling stock: {e}")
        return Response({'error': 'Internal server error'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit_money(request):
    """Simulate bank deposit - Uses Auth0 authentication"""
    try:
        amount = Decimal(str(request.data.get('amount', 0)))
        transfer_reference = request.data.get('transfer_reference', '')
        
        if amount <= 0:
            return Response({'error': 'Valid amount required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        fee = amount * Decimal('0.01')
        net_amount = amount - fee
        
        with transaction.atomic():
            user_balance, created = UserBalance.objects.get_or_create(
                user=request.user, 
                defaults={'balance': Decimal('0')}
            )
            user_balance.balance += net_amount
            user_balance.save()
            
            transaction_record = Transaction.objects.create(
                user=request.user,
                transaction_type='DEPOSIT',
                amount=net_amount,
                transaction_fee=fee,
                transfer_reference=transfer_reference,
                ip_address=get_client_ip(request)
            )
        
        # Send email notification
        TransactionEmailService.send_deposit_confirmation_email(
            user=request.user,
            transaction=transaction_record
        )
        
        return Response({
            'message': f'Successfully deposited ${net_amount:.2f} (fee: ${fee:.2f})',
            'net_amount': float(net_amount),
            'fee': float(fee),
            'new_balance': float(user_balance.balance)
        })
        
    except Exception as e:
        logger.error(f"Error depositing money: {e}")
        return Response({'error': str(e)}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw_money(request):
    """Simulate bank withdrawal - Uses Auth0 authentication"""
    try:
        amount = Decimal(str(request.data.get('amount', 0)))
        transfer_reference = request.data.get('transfer_reference', '')
        
        if amount <= 0:
            return Response({'error': 'Valid amount required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        fee = amount * Decimal('0.01')
        total_debit = amount + fee
        
        user_balance, created = UserBalance.objects.get_or_create(
            user=request.user, 
            defaults={'balance': Decimal('0')}
        )
        
        if user_balance.balance < total_debit:
            return Response({'error': 'Insufficient balance'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            user_balance.balance -= total_debit
            user_balance.save()
            
            transaction_record = Transaction.objects.create(
                user=request.user,
                transaction_type='WITHDRAWAL',
                amount=-amount,
                transaction_fee=fee,
                transfer_reference=transfer_reference,
                ip_address=get_client_ip(request)
            )
        
        # Send email notification
        TransactionEmailService.send_withdrawal_confirmation_email(
            user=request.user,
            transaction=transaction_record
        )
        
        return Response({
            'message': f'Successfully withdrew ${amount:.2f} (fee: ${fee:.2f})',
            'amount': float(amount),
            'fee': float(fee),
            'new_balance': float(user_balance.balance)
        })
        
    except Exception as e:
        logger.error(f"Error withdrawing money: {e}")
        return Response({'error': str(e)}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transaction_history(request):
    """Get user's transaction history - Uses Auth0 authentication"""
    transactions = Transaction.objects.filter(user=request.user).select_related('stock')
    
    transaction_data = []
    for tx in transactions:
        transaction_data.append({
            'id': tx.id,
            'type': tx.transaction_type,
            'symbol': tx.stock.symbol if tx.stock else None,
            'stock_name': tx.stock.name if tx.stock else None,
            'quantity': tx.quantity,
            'price': float(tx.price) if tx.price else None,
            'amount': float(tx.amount),
            'fee': float(tx.transaction_fee),
            'transfer_reference': tx.transfer_reference,
            'ip_address': tx.ip_address,
            'timestamp': tx.created_at
        })
    
    return Response({'transactions': transaction_data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_balance(request):
    """Get user's current balance - Uses Auth0 authentication"""
    user_balance, created = UserBalance.objects.get_or_create(
        user=request.user, 
        defaults={'balance': Decimal('0')}
    )
    
    return Response({
        'balance': float(user_balance.balance),
        'last_updated': user_balance.last_updated
    })


    """Get user's current stock portfolio - stocks available to sell"""
    try:
        portfolio_items = UserPortfolio.objects.filter(
            user=request.user, 
            quantity__gt=0
        ).select_related('stock')
        
        portfolio_data = []
        total_portfolio_value = Decimal('0')
        
        for item in portfolio_items:
            current_value = item.stock.current_price * item.quantity
            total_invested = item.average_price * item.quantity
            profit_loss = current_value - total_invested
            profit_loss_percentage = (profit_loss / total_invested * 100) if total_invested > 0 else Decimal('0')
            
            portfolio_data.append({
                'symbol': item.stock.symbol,
                'stock_name': item.stock.name,
                'quantity': item.quantity,
                'average_price': float(item.average_price),
                'current_price': float(item.stock.current_price),
                'total_invested': float(total_invested),
                'current_value': float(current_value),
                'profit_loss': float(profit_loss),
                'profit_loss_percentage': float(profit_loss_percentage),
                'currency': item.stock.currency,
                'exchange': item.stock.exchange
            })
            
            total_portfolio_value += current_value
        
        return Response({
            'portfolio': portfolio_data,
            'total_portfolio_value': float(total_portfolio_value),
            'total_stocks': len(portfolio_data)
        })
        
    except Exception as e:
        logger.error(f"Error getting user portfolio: {e}")
        return Response({'error': 'Internal server error'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)