from django.contrib import admin
from .models import ReferralBonus, Stock, StockPriceHistory, UserPortfolio, Transaction, UserBalance

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['symbol', 'name', 'current_price', 'currency', 'exchange', 'last_updated', 'is_active']
    list_filter = ['is_active', 'exchange', 'currency', 'sector']
    search_fields = ['symbol', 'name']
    readonly_fields = ['last_updated']
    list_editable = ['current_price', 'is_active']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('symbol', 'name', 'is_active')
        }),
        ('Market Information', {
            'fields': ('current_price', 'currency', 'exchange', 'sector')
        }),
        ('Metadata', {
            'fields': ('last_updated',)
        }),
    )

@admin.register(StockPriceHistory)
class StockPriceHistoryAdmin(admin.ModelAdmin):
    list_display = ['stock', 'price', 'timestamp']
    list_filter = ['stock', 'timestamp']
    search_fields = ['stock__symbol', 'stock__name']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'

@admin.register(UserPortfolio)
class UserPortfolioAdmin(admin.ModelAdmin):
    list_display = ['user', 'stock', 'quantity', 'average_price', 'added_date']
    list_filter = ['stock', 'added_date']
    search_fields = ['user__username', 'stock__symbol', 'stock__name']
    readonly_fields = ['added_date']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'transaction_type', 'stock', 'quantity', 'price', 'amount', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['user__username', 'stock__symbol']
    readonly_fields = ['created_at', 'updated_at', 'ip_address']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Transaction', {
            'fields': ('transaction_type', 'stock', 'quantity', 'price', 'amount', 'transaction_fee')
        }),
        ('Additional Information', {
            'fields': ('transfer_reference', 'ip_address', 'created_at', 'updated_at')
        }),
    )
    
    def has_delete_permission(self, request, obj=None):
        # Not allow deletion of transactions to maintain data integrity
        return False

@admin.register(UserBalance)
class UserBalanceAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'last_updated']
    search_fields = ['user__username']
    readonly_fields = ['last_updated']
    
    fieldsets = (
        ('Usuario', {
            'fields': ('user',)
        }),
        ('Balance', {
            'fields': ('balance', 'last_updated')
        }),
    )

@admin.register(ReferralBonus)
class ReferralBonusAdmin(admin.ModelAdmin):
    list_display = ['referrer', 'referee', 'referrer_bonus', 'referee_bonus', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['referrer__username', 'referee__username']
    readonly_fields = ['created_at']