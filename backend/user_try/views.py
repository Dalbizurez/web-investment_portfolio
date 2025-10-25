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
    " ""Get current user profile"""
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

    # POST → actualizar perfil
    username = request.data.get("username", user.username)
    email = request.data.get("email", user.email)
    language = request.data.get("language", user.language)

    user.username = username
    user.email = email
    user.language = language
    user.save()

    # Log de auditoría
    AuditLog.objects.create(
        user=user,
        action="update_profile",
        ip_address=request.META.get("REMOTE_ADDR"),
        user_agent=request.META.get("HTTP_USER_AGENT", ""),
        details={"updated_fields": ["username", "email", "language"]}
    )

    return Response(UserSerializer(user).data)


# Remove register, login, logout views since Auth0 handles them