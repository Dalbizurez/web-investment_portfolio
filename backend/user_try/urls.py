from django.urls import path
from .views import registro, login

urlpatterns = [
    path("register/", registro, name="registro"),
    path("login/", login, name="login")
]
