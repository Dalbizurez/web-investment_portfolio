from rest_framework import serializers
from .models import User, UserSession, AuditLog
from django.contrib.auth.hashers import make_password
import secrets
import string

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "type", "status", "referral_code", "created_at", "auth0_id", "language",]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},  # Make password optional
            "referral_code": {"read_only": True},
            "status": {"read_only": True},
            "auth0_id": {"read_only": True},  # Auth0 ID is auto-generated
        }

    def create(self, validated_data):
        # For Auth0 users, password might not be provided
        if 'password' in validated_data:
            validated_data["password"] = make_password(validated_data["password"])
        else:
            # Generate a random password for Auth0 users
            random_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(20))
            validated_data["password"] = make_password(random_password)
        
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
        
        user = User.objects.create(
            **validated_data,
            referral_code=referral_code,
            referred_by=referred_by
        )
        
        return user

# Remove LoginSerializer since we're using Auth0
# Keep UserSessionSerializer and AuditLogSerializer unchanged


class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ["id", "user", "ip_address", "created_at", "expires_at"]


class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ["id", "username", "action", "ip_address", "timestamp", "details"]

class Auth0CallbackSerializer(serializers.Serializer):
    """
    Serializer for Auth0 callback - if needed for additional user data
    """
    auth0_id = serializers.CharField()
    email = serializers.EmailField()
    name = serializers.CharField(required=False)        