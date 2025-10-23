# user_try/auth.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from jose import jwt
import requests
from .models import User
import secrets
import string
from django.utils import timezone

class Auth0Authentication(BaseAuthentication):
    """
    Authentication backend for Auth0 JWT tokens
    """
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            return None
            
        if not auth_header.startswith('Bearer '):
            return None
            
        token = auth_header.split(' ')[1]
        
        try:
            # Verify token with Auth0
            payload = self.verify_auth0_token(token)
            
            # Get or create user from Auth0 payload
            user = self.get_or_create_user_from_auth0(payload, token)
            
            # ✅ NUEVO: Verificar que el usuario esté activo
            if user.status != 'active':
                raise AuthenticationFailed(
                    f'Your account is {user.status}. Please wait for admin approval.'
                )
            
            # Update last login
            user.last_login = timezone.now()
            user.save()
            
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.JWTClaimsError:
            raise AuthenticationFailed('Invalid claims')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    def verify_auth0_token(self, token):
        """Verify Auth0 JWT token using public keys"""
        jwks_url = f'https://{settings.AUTH0_CONFIG["DOMAIN"]}/.well-known/jwks.json'
        
        try:
            jwks_response = requests.get(jwks_url)
            jwks_response.raise_for_status()
            jwks = jwks_response.json()
        except Exception as e:
            raise AuthenticationFailed(f'Failed to fetch JWKS: {str(e)}')
        
        # Decode header to get the key ID
        try:
            header = jwt.get_unverified_header(token)
            kid = header['kid']
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token header: {str(e)}')
        
        # Find the correct key
        rsa_key = {}
        for key in jwks['keys']:
            if key['kid'] == kid:
                rsa_key = {
                    'kty': key['kty'],
                    'kid': key['kid'],
                    'use': key['use'],
                    'n': key['n'],
                    'e': key['e']
                }
                break
        
        if not rsa_key:
            raise AuthenticationFailed('Unable to find appropriate key')
        
        # Verify the token
        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=settings.AUTH0_CONFIG['ALGORITHMS'],
                audience=settings.AUTH0_CONFIG.get('API_AUDIENCE'),
                issuer=f'https://{settings.AUTH0_CONFIG["DOMAIN"]}/'
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.JWTClaimsError as e:
            raise AuthenticationFailed(f'Invalid claims: {str(e)}')
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
    
    def get_user_info_from_auth0(self, token):
        """Get user info from Auth0 userinfo endpoint"""
        userinfo_url = f'https://{settings.AUTH0_CONFIG["DOMAIN"]}/userinfo'
        
        try:
            response = requests.get(
                userinfo_url,
                headers={'Authorization': f'Bearer {token}'}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise AuthenticationFailed(f'Failed to fetch user info: {str(e)}')
    
    def get_or_create_user_from_auth0(self, payload, token):
        """Get or create user based on Auth0 payload"""
        auth0_id = payload['sub']
        
        # Try to get email from payload first
        email = payload.get('email')
        name = payload.get('name', '')
        
        # If email not in payload, fetch from userinfo endpoint
        if not email:
            try:
                userinfo = self.get_user_info_from_auth0(token)
                email = userinfo.get('email')
                name = userinfo.get('name', name)
            except Exception as e:
                print(f"Warning: Could not get email from Auth0: {e}")
                email = f"{auth0_id.replace('|', '_')}@auth0-user.local"
        
        try:
            # Try to find user by auth0_id
            user = User.objects.get(auth0_id=auth0_id)
            
            # Update email if it was missing before
            if email and user.email != email and '@auth0-user.local' in user.email:
                user.email = email
                user.save()
            
            return user
        except User.DoesNotExist:
            try:
                # Try to find user by email (for existing users migrating to Auth0)
                user = User.objects.get(email=email)
                user.auth0_id = auth0_id
                # No cambiar status aquí, mantener el que tenga
                user.save()
                return user
            except User.DoesNotExist:
                # ✅ NUEVO: Crear usuario como PENDING para esperar aprobación
                username = self.generate_unique_username(email, name)
                
                user = User.objects.create(
                    username=username,
                    email=email,
                    auth0_id=auth0_id,
                    status='pending',  # ← Ahora se crea como PENDING
                    type='standard'    # ← Por defecto standard
                )
                
                # Generate a random password (won't be used for login)
                random_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(20))
                user.set_password(random_password)
                user.save()
                
                return user
    
    def generate_unique_username(self, email, name):
        """Generate unique username from email or name"""
        # Try to use name first
        if name:
            base_username = name.lower().replace(' ', '_')[:30]
        else:
            base_username = email.split('@')[0][:30]
        
        username = base_username
        counter = 1
        
        # Ensure username is unique
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
            if counter > 100:
                # Fallback to random username
                random_suffix = ''.join(secrets.choice(string.ascii_lowercase) for _ in range(6))
                username = f"user_{random_suffix}"
                break
        
        return username