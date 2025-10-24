# user_try/views.py - MODIFY existing file
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone

from .serializers import UserSerializer, AuditLogSerializer
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

# ADMIN VIEWS - Only for admin users
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

# Remove register, login, logout views since Auth0 handles them