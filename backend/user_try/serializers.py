from rest_framework import serializers
from .models import User, UserSession, AuditLog
from django.contrib.auth.hashers import make_password
import secrets
import string

class UserSerializer(serializers.ModelSerializer):
    referral_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "type", "status", "referral_code", 
            "created_at", "auth0_id", "language", "has_used_referral", "referral_count"
        ]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},
            "referral_code": {"read_only": True},
            "status": {"read_only": True},
            "auth0_id": {"read_only": True},
            "has_used_referral": {"read_only": True},
        }
    
    def get_referral_count(self, obj):
        """Get count of successful referrals"""
        return obj.referrals.filter(status='active').count()

    def create(self, validated_data):
        # For Auth0 users, password might not be provided
        if 'password' in validated_data:
            validated_data["password"] = make_password(validated_data["password"])
        else:
            # Generate a random password for Auth0 users
            random_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(20))
            validated_data["password"] = make_password(random_password)
        
        # Referral code will be auto-generated in model's save method
        user = User.objects.create(**validated_data)
        
        return user


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


class UseReferralCodeSerializer(serializers.Serializer):
    """
    Serializer for using a referral code
    """
    referral_code = serializers.CharField(max_length=10, required=True)
    
    def validate_referral_code(self, value):
        """Validate that the referral code exists and is valid"""
        value = value.upper().strip()
        
        if not User.objects.filter(referral_code=value, status='active').exists():
            raise serializers.ValidationError("Invalid or inactive referral code")
        
        return value