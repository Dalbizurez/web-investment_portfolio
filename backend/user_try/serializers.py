from rest_framework import serializers
from .models import User, UserSession, AuditLog
from django.contrib.auth.hashers import make_password
import secrets
import string


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "type", "status", "referral_code", "created_at"]
        extra_kwargs = {
            "password": {"write_only": True},
            "referral_code": {"read_only": True},
            "status": {"read_only": True},
        }

    def create(self, validated_data):
        # Generate referral code
        referral_code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        
        # Check if referral code is provided in request
        referral_code_used = self.context['request'].data.get('referral_code')
        referred_by = None
        
        if referral_code_used:
            try:
                referred_by = User.objects.get(referral_code=referral_code_used, status='active')
            except User.DoesNotExist:
                pass
        
        validated_data["password"] = make_password(validated_data["password"])
        user = User.objects.create(
            **validated_data,
            referral_code=referral_code,
            referred_by=referred_by
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ["id", "user", "ip_address", "created_at", "expires_at"]


class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ["id", "username", "action", "ip_address", "timestamp", "details"]