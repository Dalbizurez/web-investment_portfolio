# user_try/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from django.db import transaction
from django.db import models

from .serializers import UserSerializer, AuditLogSerializer, UseReferralCodeSerializer
from .models import User, AuditLog


def get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get current user profile"""
    return Response(UserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def validate_token(request):
    """Validate Auth0 token and return user data"""
    return Response({
        'valid': True,
        'user': UserSerializer(request.user).data
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def activate_user(request, user_id):
    """Activate a pending user (Admin only)"""
    if request.user.type != 'admin':
        return Response({
            'error': 'Only administrators can activate users'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user_to_activate = User.objects.get(id=user_id)
        
        if user_to_activate.status == 'active':
            return Response({
                'error': 'User is already active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Activate the user
        user_to_activate.status = 'active'
        user_to_activate.save()
        
        # Create audit log
        AuditLog.objects.create(
            user=request.user,
            action='activate_user',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            details={
                'action': 'user_activation',
                'activated_user_id': user_to_activate.id,
                'activated_username': user_to_activate.username
            }
        )
        
        return Response({
            'message': f'User {user_to_activate.username} activated successfully',
            'user': UserSerializer(user_to_activate).data
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_pending_users(request):
    """List all pending users (Admin only)"""
    if request.user.type != 'admin':
        return Response({
            'error': 'Only administrators can view pending users'
        }, status=status.HTTP_403_FORBIDDEN)
    
    pending_users = User.objects.filter(status='pending')
    serializer = UserSerializer(pending_users, many=True)
    
    return Response({
        'pending_users': serializer.data,
        'count': pending_users.count()
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change password for users with local passwords"""
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not user.password:
        return Response({"error": "Password change not allowed for Auth0 users"}, status=400)

    if not user.check_password(old_password):
        return Response({"error": "Old password is incorrect"}, status=400)

    user.set_password(new_password)

    # Optional: log audit
    AuditLog.objects.create(
        user=user,
        action='password_change',
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        details={}
    )

    return Response({"message": "Password changed successfully"})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Get or update user profile, including language preference"""
    user = request.user

    if request.method == "GET":
        return Response(UserSerializer(user).data)

    # POST - update profile
    username = request.data.get("username", user.username)
    email = request.data.get("email", user.email)
    language = request.data.get("language", user.language)

    user.username = username
    user.email = email
    user.language = language
    user.save()

    # Audit log
    AuditLog.objects.create(
        user=user,
        action="update_profile",
        ip_address=request.META.get("REMOTE_ADDR"),
        user_agent=request.META.get("HTTP_USER_AGENT", ""),
        details={"updated_fields": ["username", "email", "language"]}
    )

    return Response(UserSerializer(user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def use_referral_code(request):
    """
    Use a referral code AFTER registration
    - User can only use ONE referral code ever
    - Cannot use own code
    - Referrer gets $8, Referee gets $5
    """
    user = request.user
    
    # Check if user already used a referral code
    if user.has_used_referral:
        return Response({
            'error': 'You have already used a referral code'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user already has a referred_by
    if user.referred_by:
        return Response({
            'error': 'You have already been referred by someone'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = UseReferralCodeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    referral_code = serializer.validated_data['referral_code'].upper().strip()
    
    # Check if trying to use own code
    if user.referral_code == referral_code:
        return Response({
            'error': 'You cannot use your own referral code'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        referrer = User.objects.get(referral_code=referral_code, status='active')
    except User.DoesNotExist:
        return Response({
            'error': 'Invalid or inactive referral code'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Use atomic transaction to ensure data consistency
    try:
        with transaction.atomic():
            # Import here to avoid circular import
            from stocks.services.referral_service import ReferralService
            
            # Process referral bonuses
            referral_service = ReferralService()
            result = referral_service.process_referral(
                referrer=referrer,
                referee=user,
                ip_address=get_client_ip(request)
            )
            
            # Update user
            user.referred_by = referrer
            user.has_used_referral = True
            user.save()
            
            # Create audit log
            AuditLog.objects.create(
                user=user,
                action='referral_used',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details={
                    'referrer_id': referrer.id,
                    'referrer_username': referrer.username,
                    'referrer_code': referral_code,
                    'referrer_bonus': str(result['referrer_bonus']),
                    'referee_bonus': str(result['referee_bonus'])
                }
            )
            
            return Response({
                'message': 'Referral code applied successfully',
                'bonus_received': float(result['referee_bonus']),
                'referrer_username': referrer.username,
                'your_new_balance': float(result['referee_new_balance'])
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'error': f'Failed to process referral: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_referral_stats(request):
    """
    Get referral statistics for current user
    """
    user = request.user
    
    # Count successful referrals (active users who used this user's code)
    successful_referrals = User.objects.filter(
        referred_by=user,
        status='active'
    ).count()
    
    # Get list of referred users
    referred_users = User.objects.filter(referred_by=user).values(
        'id', 'username', 'email', 'created_at', 'status'
    )
    
    # Calculate total earnings from referrals
    from stocks.models import Transaction
    referral_earnings = Transaction.objects.filter(
        user=user,
        transaction_type='REFERRAL'
    ).aggregate(
        total=models.Sum('amount')
    )['total'] or 0
    
    return Response({
        'referral_code': user.referral_code,
        'successful_referrals': successful_referrals,
        'total_earnings': float(referral_earnings),
        'has_used_referral': user.has_used_referral,
        'referred_by': user.referred_by.username if user.referred_by else None,
        'referred_users': list(referred_users)
    })