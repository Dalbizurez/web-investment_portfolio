# user_try/admin.py
from django.contrib import admin
from .models import User, UserSession, AuditLog
from user_try.emails.services import UserEmailService

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'type', 'status', 'referral_code', 'has_used_referral', 'created_at', 'last_login']
    list_filter = ['type', 'status', 'has_used_referral', 'created_at']
    search_fields = ['username', 'email', 'auth0_id', 'referral_code']
    readonly_fields = ['auth0_id', 'created_at', 'updated_at', 'last_login', 'referral_code']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('username', 'email', 'auth0_id', 'language')
        }),
        ('Status and Type', {
            'fields': ('type', 'status')
        }),
        ('Referral Information', {
            'fields': ('referral_code', 'referred_by', 'has_used_referral'),
            'description': 'Referral code is auto-generated. Users can only use one referral code.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_login', 'ip_address')
        }),
    )
    
    actions = ['activate_users', 'suspend_users', 'make_admin', 'make_vip', 'make_standard']
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)


    def activate_users(self, request, queryset):
        for user in queryset:
            user.status = 'active'
            user.save()
        self.message_user(request, f'{queryset.count()} users activated.')
    
    def suspend_users(self, request, queryset):
        for user in queryset:
            user.status = 'suspended'
            user.save()
        self.message_user(request, f'{queryset.count()} users suspended.')
    
    def make_admin(self, request, queryset):
        updated = queryset.update(type='admin')
        self.message_user(request, f'{updated} users changed to admin.')
    make_admin.short_description = "Make admin"
    
    def make_vip(self, request, queryset):
        updated = queryset.update(type='vip')
        self.message_user(request, f'{updated} users changed to VIP.')
    make_vip.short_description = "Make VIP"
    
    def make_standard(self, request, queryset):
        updated = queryset.update(type='standard')
        self.message_user(request, f'{updated} users changed to Standard.')
    make_standard.short_description = "Make Standard"

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'ip_address', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['user__username', 'ip_address', 'action']
    readonly_fields = ['user', 'action', 'ip_address', 'user_agent', 'timestamp', 'details']

@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_active', 'created_at', 'expires_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__username', 'ip_address']
    readonly_fields = ['token', 'created_at', 'expires_at', 'ip_address', 'user_agent']
    
    fieldsets = (
        ('User', {
            'fields': ('user', 'is_active')
        }),
        ('Session', {
            'fields': ('token', 'created_at', 'expires_at')
        }),
        ('Additional Information', {
            'fields': ('ip_address', 'user_agent')
        }),
    )