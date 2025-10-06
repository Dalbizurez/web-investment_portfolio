from django.urls import path
from .views import create_gift

urlpatterns = [
    path("create_gift/", create_gift, name="create_gift"),
]
