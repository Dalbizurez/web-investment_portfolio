from django.contrib import admin
from .models import User, UserSession, AuditLog


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "username",
        "email",
        "type",
        "status",
        "referral_code",
        "referred_by",
        "created_at",
        "last_login",
    )
    list_filter = ("type", "status", "created_at")
    search_fields = ("username", "email", "referral_code")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at", "last_login")

    fieldsets = (
        ("Información de Usuario", {
            "fields": (
                "username",
                "email",
                "password",
                "type",
                "status",
            )
        }),
        ("Referencias", {
            "fields": (
                "referral_code",
                "referred_by",
            ),
            "classes": ("collapse",),
        }),
        ("Actividad", {
            "fields": (
                "last_login",
                "ip_address",
                "created_at",
                "updated_at",
            ),
            "classes": ("collapse",),
        }),
    )


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "ip_address",
        "user_agent",
        "created_at",
        "expires_at",
        "is_active",
    )
    list_filter = ("is_active", "created_at")
    search_fields = ("user__username", "ip_address", "user_agent")
    readonly_fields = ("created_at",)

    fieldsets = (
        (None, {
            "fields": (
                "user",
                "token",
                "ip_address",
                "user_agent",
                "expires_at",
                "is_active",
            )
        }),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "action",
        "ip_address",
        "timestamp",
    )
    list_filter = ("action", "timestamp")
    search_fields = ("user__username", "ip_address", "user_agent")
    readonly_fields = ("timestamp",)

    fieldsets = (
        (None, {
            "fields": (
                "user",
                "action",
                "ip_address",
                "user_agent",
                "details",
                "timestamp",
            )
        }),
    )
