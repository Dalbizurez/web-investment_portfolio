from django.contrib import admin
from .models import Stock, StockPriceHistory, UserPortfolio

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