# stocks/services/referral_service.py
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.db import models
from stocks.models import UserBalance, Transaction, ReferralBonus
from stocks.emails.services import TransactionEmailService
import logging

logger = logging.getLogger(__name__)


class ReferralService:
    """
    Service to handle referral bonuses
    - Referrer (who shares code) gets $8
    - Referee (who uses code) gets $5
    """
    
    REFERRER_BONUS = Decimal('8.00')
    REFEREE_BONUS = Decimal('5.00')
    
    def process_referral(self, referrer, referee, ip_address=None):
        """
        Process referral bonuses for both referrer and referee
        
        Args:
            referrer: User who shared the code
            referee: User who used the code
            ip_address: IP address for audit trail
            
        Returns:
            dict with transaction details
        """
        
        with transaction.atomic():
            # Get or create balances
            referrer_balance, _ = UserBalance.objects.get_or_create(
                user=referrer,
                defaults={'balance': Decimal('0')}
            )
            
            referee_balance, _ = UserBalance.objects.get_or_create(
                user=referee,
                defaults={'balance': Decimal('0')}
            )
            
            # Add bonus to referrer ($8)
            referrer_balance.balance += self.REFERRER_BONUS
            referrer_balance.save()
            
            # Create transaction record for referrer
            referrer_transaction = Transaction.objects.create(
                user=referrer,
                transaction_type='REFERRAL',
                amount=self.REFERRER_BONUS,
                transaction_fee=Decimal('0'),
                ip_address=ip_address,
                transfer_reference=f'Referral bonus from {referee.username}'
            )
            
            # Add bonus to referee ($5)
            referee_balance.balance += self.REFEREE_BONUS
            referee_balance.save()
            
            # Create transaction record for referee
            referee_transaction = Transaction.objects.create(
                user=referee,
                transaction_type='REFERRAL',
                amount=self.REFEREE_BONUS,
                transaction_fee=Decimal('0'),
                ip_address=ip_address,
                transfer_reference=f'Referral bonus from using {referrer.username}\'s code'
            )
            
            # Create ReferralBonus record for tracking
            referral_bonus = ReferralBonus.objects.create(
                referrer=referrer,
                referee=referee,
                referrer_bonus=self.REFERRER_BONUS,
                referee_bonus=self.REFEREE_BONUS,
                referrer_transaction=referrer_transaction,
                referee_transaction=referee_transaction,
                status='completed'
            )
        
        # Send email notifications (outside transaction to avoid rollback on email failure)
        try:
            # Send email to referrer (person who shared the code)
            TransactionEmailService.send_referral_bonus_email(
                user=referrer,
                referral_bonus=referral_bonus,
                is_referrer=True
            )
            logger.info(f"Referral bonus email sent to referrer: {referrer.email}")
        except Exception as e:
            logger.error(f"Failed to send referral email to referrer {referrer.email}: {str(e)}")
        
        try:
            # Send email to referee (person who used the code)
            TransactionEmailService.send_referral_bonus_email(
                user=referee,
                referral_bonus=referral_bonus,
                is_referrer=False
            )
            logger.info(f"Referral bonus email sent to referee: {referee.email}")
        except Exception as e:
            logger.error(f"Failed to send referral email to referee {referee.email}: {str(e)}")
        
        return {
            'referrer_bonus': self.REFERRER_BONUS,
            'referee_bonus': self.REFEREE_BONUS,
            'referrer_new_balance': referrer_balance.balance,
            'referee_new_balance': referee_balance.balance,
            'referral_bonus_id': referral_bonus.id
        }
    
    def get_referral_earnings(self, user):
        """
        Get total earnings from referrals for a user
        """
        total = Transaction.objects.filter(
            user=user,
            transaction_type='REFERRAL'
        ).aggregate(
            total=models.Sum('amount')
        )['total']
        
        return total or Decimal('0')
    
    def get_referral_history(self, user):
        """
        Get referral history for a user (as referrer)
        """
        bonuses = ReferralBonus.objects.filter(
            referrer=user
        ).select_related('referee', 'referrer_transaction').order_by('-created_at')
        
        history = []
        for bonus in bonuses:
            history.append({
                'id': bonus.id,
                'referee_username': bonus.referee.username,
                'referee_email': bonus.referee.email,
                'referrer_bonus': float(bonus.referrer_bonus),
                'referee_bonus': float(bonus.referee_bonus),
                'status': bonus.status,
                'created_at': bonus.created_at,
                'transaction_id': bonus.referrer_transaction.id if bonus.referrer_transaction else None
            })
        
        return history