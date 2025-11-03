from django.urls import path
from . import views
from . import views_transactions

urlpatterns = [
    # 1. Routes related to STOCKS first
    path('search/', views.search_stocks, name='stock-search'),
    path('news/', views.get_market_news, name='market-news'),
    path('portfolio/', views.get_user_portfolio, name='user-portfolio'),

    # Quote routes
    path('<str:symbol>/quote/', views.get_stock_today_api, name='stock-quote'),

    # 2. Then the routes for TRANSACTIONS
    path('transactions/deposit/', views_transactions.deposit_money, name='deposit-money'),
    path('transactions/withdraw/', views_transactions.withdraw_money, name='withdraw-money'),
    path('transactions/buy/', views_transactions.buy_stock, name='buy-stock'),
    path('transactions/sell/', views_transactions.sell_stock, name='sell-stock'),
    path('transactions/history/', views_transactions.get_transaction_history, name='transaction-history'),
    path('balance/', views_transactions.get_user_balance, name='user-balance'),

    # 3. Finally, the dynamic routes (with parameters)
    path('<str:symbol>/history/', views.get_stock_history, name='stock-history'),
    path('<str:symbol>/', views.get_stock_detail, name='stock-detail'),
]
