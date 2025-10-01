from django.urls import path
from .views import registro

urlpatterns = [
    path("register/", registro, name="registro"),
]
