from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated  
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
import jwt
from django.conf import settings
import secrets
import string

from .serializers import NormalUserSerializer, LoginSerializer, UserSessionSerializer, AuditLogSerializer
from .models import NormalUser, UserSession, AuditLog

from .utils.EmailComposer import pendingEmail, approvedEmail
from .utils.EmailSender import send_email

# JWT Configuration
JWT_SECRET = getattr(settings, 'JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

def generate_jwt_token(user, ip_address, user_agent):
    # Generate JWT token for authenticated user
    payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': timezone.now() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': timezone.now(),
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    # Create session record
    session = UserSession.objects.create(
        user=user,
        token=token,
        ip_address=ip_address,
        user_agent=user_agent,
        expires_at=timezone.now() + timedelta(hours=JWT_EXPIRATION_HOURS)
    )
    
    # Update user's last login
    user.last_login = timezone.now()
    user.save()
    
    return token, session


def get_client_ip(request):
    # Get client IP address
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@api_view(["POST"])
@permission_classes([AllowAny])  
def register(request):
    # User registration endpoint
    serializer = NormalUserSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        # Get client IP
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Create user
        user = serializer.save()
        user.ip_address = ip_address
        user.save()
        
        # Send pending approval email
        subject, html, text = pendingEmail(user.username)
        send_email(user.email, subject, text, html)

        # Create audit log
        AuditLog.objects.create(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent,
            details={'username': user.username, 'email': user.email}
        )
        
        return Response({
            'message': 'User registered successfully. Waiting for administrator approval.',
            'user': NormalUserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])  
def login(request):
    # User login endpoint with JWT token
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    
    # Get client IP and user agent
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    try:
        user = NormalUser.objects.get(username=username)  

        AuditLog.objects.create(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent,
            details={'success': False, 'reason': 'Account not active'}
        )
            
        # Check password
        if user.check_password(password):
            # Generate JWT token
            token, session = generate_jwt_token(user, ip_address, user_agent)
            
            # Create audit log for successful login
            AuditLog.objects.create(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent,
                details={'success': True, 'session_id': session.id}
            )
            
            return Response({
                'message': 'Login successful',
                'token': token,
                'user': NormalUserSerializer(user).data,
                'expires_in': JWT_EXPIRATION_HOURS * 3600  # in seconds
            }, status=status.HTTP_200_OK)
        else:
            # Create audit log for failed login attempt
            AuditLog.objects.create(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent,
                details={'success': False, 'reason': 'Invalid password'}
            )
            
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except NormalUser.DoesNotExist:
        # Create audit log for failed login attempt (user not found)
        AuditLog.objects.create(
            ip_address=ip_address,
            user_agent=user_agent,
            details={'success': False, 'reason': 'User not found', 'username': username}
        )
        
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    # User logout endpoint
    # Get the token from the request
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        
        try:
            # Find and deactivate the session
            session = UserSession.objects.get(token=token, is_active=True)
            session.is_active = False
            session.save()
            
            # Create audit log
            AuditLog.objects.create(
                user=request.user,
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details={'session_id': session.id}
            )
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
            
        except UserSession.DoesNotExist:
            pass
    
    return Response({
        'error': 'Invalid session'
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    # Get current user profile
    return Response(NormalUserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def validate_token(request):
    # Validate JWT token and return user data
    return Response({
        'valid': True,
        'user': NormalUserSerializer(request.user).data
    })


