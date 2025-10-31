from django.db import models
from django.conf import settings
from django.utils import timezone

# USE user_try User model, this is important
from user_try.models import User as UserModel


class SoftDeleteManager(models.Manager):
    """Manager that filters out soft-deleted objects"""
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)


class SoftDeleteModel(models.Model):
    """Abstract base class for soft delete functionality"""
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    objects = SoftDeleteManager()
    all_objects = models.Manager()
    
    class Meta:
        abstract = True
    
    def delete(self, using=None, keep_parents=False):
        """Soft delete - mark as deleted instead of removing from database"""
        self.deleted_at = timezone.now()
        self.save(using=using)
    
    def hard_delete(self):
        """Permanently delete from database"""
        super().delete()
    
    def restore(self):
        """Restore a soft-deleted object"""
        self.deleted_at = None
        self.save()
    
    @property
    def is_deleted(self):
        return self.deleted_at is not None


class Stock(SoftDeleteModel):
    symbol = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    currency = models.CharField(max_length=10, default='USD')
    exchange = models.CharField(max_length=50, default='NASDAQ')
    sector = models.CharField(max_length=100, blank=True, null=True)
    current_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    market_cap = models.BigIntegerField(null=True, blank=True)
    volume = models.BigIntegerField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['symbol']
    
    def __str__(self):
        return f"{self.symbol} - {self.name}"


class StockPriceHistory(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Stock price history'


class UserPortfolio(SoftDeleteModel):
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0)
    average_price = models.DecimalField(max_digits=10, decimal_places=2)
    added_date = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ['user', 'stock']
        verbose_name_plural = 'User portfolios'


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
        ('DEPOSIT', 'Deposit'),
        ('WITHDRAWAL', 'Withdrawal'),
        ('REFERRAL', 'Referral Bonus'),
    ]
    
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transfer_reference = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount}"


class UserBalance(models.Model):
    user = models.OneToOneField(UserModel, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - ${self.balance}"


class ReferralBonus(models.Model):
    """
    Track referral bonuses given to users
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    referrer = models.ForeignKey(
        UserModel, 
        on_delete=models.CASCADE, 
        related_name='referral_bonuses_given'
    )
    referee = models.ForeignKey(
        UserModel, 
        on_delete=models.CASCADE, 
        related_name='referral_bonuses_received'
    )
    referrer_bonus = models.DecimalField(max_digits=10, decimal_places=2, default=8.00)
    referee_bonus = models.DecimalField(max_digits=10, decimal_places=2, default=5.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    referrer_transaction = models.ForeignKey(
        Transaction, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='referrer_bonus'
    )
    referee_transaction = models.ForeignKey(
        Transaction, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='referee_bonus'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Referral bonuses'
    
    def __str__(self):
        return f"{self.referrer.username} -> {self.referee.username} (${self.referrer_bonus} / ${self.referee_bonus})"