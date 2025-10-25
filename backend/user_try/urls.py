from django.urls import path
from .views import change_password, profile, update_profile, validate_token, activate_user, list_pending_users

urlpatterns = [
    path("profile/", profile, name="profile"),
    path("validate-token/", validate_token, name="validate_token"),
    path("admin/activate-user/<int:user_id>/", activate_user, name="activate_user"),
    path("admin/pending-users/", list_pending_users, name="pending_users"),
    path("change-password/", change_password, name="change_password"),
    path("update-profile/", update_profile, name="update_profile"),

]

# Remove register, login, logout URLs