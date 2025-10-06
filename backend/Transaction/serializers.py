from rest_framework import serializers
from .models import Transaction
from django.contrib.auth.hashers import make_password

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "normal_user_id", "ticker", "amount", "price", "total", "date"]
    
