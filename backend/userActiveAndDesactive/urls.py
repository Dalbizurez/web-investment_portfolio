from django.urls import path
from .views import active_or_desactive

urlpatterns = [
    path("active_or_desactive/", active_or_desactive, name="active_or_desactive"),
]
