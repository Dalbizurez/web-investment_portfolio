from django.urls import path
from user_try import views_admin as adminv
from .views import (
    change_password, profile, update_profile, validate_token, 
    activate_user, list_pending_users, use_referral_code, get_referral_stats
)

urlpatterns = [
    path("profile/", profile, name="profile"),
    path("validate-token/", validate_token, name="validate_token"),
    path("admin/activate-user/<int:user_id>/", activate_user, name="activate_user"),
    path("admin/pending-users/", list_pending_users, name="pending_users"),
    path("change-password/", change_password, name="change_password"),
    path("update-profile/", update_profile, name="update_profile"),
    
    # Referral endpoints
    path("referral/use-code/", use_referral_code, name="use_referral_code"),
    path("referral/stats/", get_referral_stats, name="referral_stats"),
        # --- Admin API ---
    path("admin/users/", adminv.admin_users_list),
    path("admin/users/<int:user_id>/status/", adminv.admin_users_update_status),
    path("admin/users/<int:user_id>/type/", adminv.admin_users_update_type),

    path("admin/transactions/", adminv.admin_transactions_list),

    path("admin/stocks/", adminv.admin_stocks_list),
    path("admin/stocks/create/", adminv.admin_stocks_create),
    path("admin/stocks/<int:stock_id>/", adminv.admin_stocks_update),
    path("admin/stocks/<int:stock_id>/delete/", adminv.admin_stocks_soft_delete),

    # NUEVO
    path("admin/reports/", adminv.admin_reports_list),
    path("admin/referrals/", adminv.admin_referrals_list),
    path("admin/balances/", adminv.admin_balances_list),
    path("admin/portfolios/", adminv.admin_portfolios_list),
    path("admin/stock-price-history/", adminv.admin_sph_list),
    path("admin/audit-logs/", adminv.admin_audit_list),
    path("admin/sessions/", adminv.admin_sessions_list),
    path("admin/sessions/<int:session_id>/deactivate/", adminv.admin_sessions_deactivate),
]