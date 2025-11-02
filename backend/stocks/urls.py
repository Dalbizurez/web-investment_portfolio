from django.urls import path
from . import views
from . import views_transactions
from . import views_reports


urlpatterns = [
    # Stock search and info routes
    path('search/', views.search_stocks, name='stock-search'),
    path('news/', views.get_market_news, name='market-news'),
    path('portfolio/', views.get_user_portfolio, name='user-portfolio'),
    path('market-status/', views.check_market_status, name='market-status'),
    path('sectors/', views.get_available_sectors, name='available-sectors'),

    # Transaction routes
    path('transactions/deposit/', views_transactions.deposit_money, name='deposit-money'),
    path('transactions/withdraw/', views_transactions.withdraw_money, name='withdraw-money'),
    path('transactions/buy/', views_transactions.buy_stock, name='buy-stock'),
    path('transactions/sell/', views_transactions.sell_stock, name='sell-stock'),
    path('transactions/history/', views_transactions.get_transaction_history, name='transaction-history'),
    path('balance/', views_transactions.get_user_balance, name='user-balance'),

     # Reports
    path('reports/request/', views_reports.request_report, name='request-report'),
    path('reports/history/', views_reports.report_history, name='report-history'),


    # Dynamic routes with parameters
    path('<str:symbol>/history/', views.get_stock_history, name='stock-history'),
    path('<str:symbol>/', views.get_stock_detail, name='stock-detail'),
]