from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import jwt
from .models import User, UserSession
from django.utils import timezone


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            return None
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            # Verify JWT token
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            
            # Check if session exists and is active
            session = UserSession.objects.get(
                token=token, 
                is_active=True,
                expires_at__gt=timezone.now()
            )
            
            user = User.objects.get(id=payload['user_id'], status='active')
            
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except UserSession.DoesNotExist:
            raise AuthenticationFailed('Session not found or inactive')
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')