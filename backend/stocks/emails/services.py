# stocks/emails/services.py
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


class TransactionEmailService:
    """Service for sending transaction-related emails"""
    
    @staticmethod
    def send_buy_confirmation_email(user, transaction, stock):
        """
        Send email confirmation when user buys stock
        """
        try:
            subject = f'Stock Purchase Confirmation - {stock.symbol}'
            
            context = {
                'username': user.username,
                'stock_symbol': stock.symbol,
                'stock_name': stock.name,
                'quantity': transaction.quantity,
                'price_per_share': float(transaction.price),
                'total_amount': float(abs(transaction.amount)),
                'transaction_date': transaction.created_at,
                'transaction_id': transaction.id,
                'ip_address': transaction.ip_address,
            }
            
            html_message = render_to_string(
                'stocks/emails/transaction_buy.html',
                context
            )
            
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Buy confirmation email sent to {user.email} for {stock.symbol}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending buy confirmation email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_sell_confirmation_email(user, transaction, stock):
        """
        Send email confirmation when user sells stock
        """
        try:
            subject = f'Stock Sale Confirmation - {stock.symbol}'
            
            context = {
                'username': user.username,
                'stock_symbol': stock.symbol,
                'stock_name': stock.name,
                'quantity': transaction.quantity,
                'price_per_share': float(transaction.price),
                'total_amount': float(transaction.amount),
                'transaction_date': transaction.created_at,
                'transaction_id': transaction.id,
                'ip_address': transaction.ip_address,
            }
            
            html_message = render_to_string(
                'stocks/emails/transaction_sell.html',
                context
            )
            
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Sell confirmation email sent to {user.email} for {stock.symbol}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending sell confirmation email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_deposit_confirmation_email(user, transaction):
        """
        Send email confirmation when user deposits money
        """
        try:
            subject = 'Deposit Confirmation'
            
            context = {
                'username': user.username,
                'amount': float(transaction.amount),
                'fee': float(transaction.transaction_fee),
                'net_amount': float(transaction.amount),
                'transfer_reference': transaction.transfer_reference,
                'transaction_date': transaction.created_at,
                'transaction_id': transaction.id,
                'ip_address': transaction.ip_address,
            }
            
            html_message = render_to_string(
                'stocks/emails/transaction_deposit.html',
                context
            )
            
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Deposit confirmation email sent to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending deposit confirmation email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_withdrawal_confirmation_email(user, transaction):
        """
        Send email confirmation when user withdraws money
        """
        try:
            subject = 'Withdrawal Confirmation'
            
            context = {
                'username': user.username,
                'amount': float(abs(transaction.amount)),
                'fee': float(transaction.transaction_fee),
                'total_deducted': float(abs(transaction.amount)) + float(transaction.transaction_fee),
                'transfer_reference': transaction.transfer_reference,
                'transaction_date': transaction.created_at,
                'transaction_id': transaction.id,
                'ip_address': transaction.ip_address,
            }
            
            html_message = render_to_string(
                'stocks/emails/transaction_withdrawal.html',
                context
            )
            
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Withdrawal confirmation email sent to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending withdrawal confirmation email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_referral_bonus_email(user, referral_bonus, is_referrer=True):
        """
        Send email when user receives referral bonus
        is_referrer: True if user is the one who referred, False if user was referred
        """
        try:
            if is_referrer:
                subject = 'Referral Bonus Received!'
                bonus_amount = float(referral_bonus.referrer_bonus)
                referred_user = referral_bonus.referee.username
            else:
                subject = 'Welcome Bonus Received!'
                bonus_amount = float(referral_bonus.referee_bonus)
                referred_user = referral_bonus.referrer.username
            
            context = {
                'username': user.username,
                'bonus_amount': bonus_amount,
                'is_referrer': is_referrer,
                'referred_user': referred_user,
                'referral_code': user.referral_code,
                'transaction_date': referral_bonus.created_at,
                'referral_id': referral_bonus.id,
            }
            
            html_message = render_to_string(
                'stocks/emails/referral_bonus.html',
                context
            )
            
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Referral bonus email sent to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending referral bonus email to {user.email}: {str(e)}")
            return False