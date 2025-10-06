from django.urls import path
from .views import register, login, logout, profile, validate_token

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", login, name="login"),
    path("logout/", logout, name="logout"),
    path("profile/", profile, name="profile"),
    path("validate-token/", validate_token, name="validate_token"),
]
