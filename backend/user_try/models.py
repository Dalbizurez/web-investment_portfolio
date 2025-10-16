from django.db import models
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone


class User(models.Model):
    
    USER_TYPES = [
        ("standard", "Standard"),
        ("admin", "Admin"),
        ("vip", "VIP"),
    ]
    STATUS_TYPES = [
            ("pending", "Pending Approval"),
            ("active", "Active"),
            ("suspended", "Suspended"),
        ]

    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    type = models.CharField(max_length=50, choices=USER_TYPES, default="standard")
    status = models.CharField(max_length=50, choices=STATUS_TYPES, default="pending")
    referral_code = models.CharField(max_length=10, unique=True, blank=True, null=True)
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    def __str__(self):
        return self.username
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        self.save()

    @property
    def is_authenticated(self):
        # always true for verified users
        return True

    @property
    def is_anonymous(self):
        # always false for authenticated users
        return False


class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.TextField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.created_at}"


class AuditLog(models.Model):
    ACTION_TYPES = [
        ("login", "User Login"),
        ("logout", "User Logout"),
        ("register", "User Registration"),
        ("password_change", "Password Change"),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    action = models.CharField(max_length=50, choices=ACTION_TYPES)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    details = models.JSONField(default=dict)
    
    def __str__(self):
        return f"{self.user.username if self.user else 'System'} - {self.action} - {self.timestamp}"