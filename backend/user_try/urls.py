from django.urls import path
from .views import register, login, logout, profile, validate_token, activate_user, list_pending_users

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", login, name="login"),
    path("logout/", logout, name="logout"),
    path("profile/", profile, name="profile"),
    path("validate-token/", validate_token, name="validate_token"),
    path("admin/activate-user/<int:user_id>/", activate_user, name="activate_user"),
    path("admin/pending-users/", list_pending_users, name="pending_users"),
]