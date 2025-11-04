import json
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import User
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions

class Auth0Service:
    def __init__(self):
        auth0 = settings.AUTH0_CONFIG
        self.domain = auth0["DOMAIN"]
        self.client_id = auth0["CLIENT_ID"]
        self.client_secret = auth0["CLIENT_SECRET"]
        self.audience = auth0["API_AUDIENCE"]

        self.userinfo_cache = {}
        
    def exchange_code_for_tokens(self, code, redirect_uri):
        token_url = f"https://{self.domain}/oauth/token"
        payload = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
        }
        response = requests.post(token_url, json=payload)
        response.raise_for_status()
        return response.json()

    def decode_auth0_token(self, token):
        # ✅ No hacemos validación de firma en dev, solo decodificamos el payload
        parts = token.split('.')
        if len(parts) != 3:
            return {}
        import base64
        padded = parts[1] + '=' * (-len(parts[1]) % 4)
        return json.loads(base64.urlsafe_b64decode(padded).decode('utf-8'))

    def get_user_info_from_auth0(self, token):
        if token in self.userinfo_cache:
            return self.userinfo_cache[token]

        try:
            headers = {"Authorization": f"Bearer {token}"}
            resp = requests.get(f"https://{self.domain}/userinfo", headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                self.userinfo_cache[token] = data
                return data
        except Exception:
            pass

        return {}

    def get_or_create_user_from_auth0(self, token):
        payload = self.decode_auth0_token(token)

        auth0_id = payload.get("sub")
        email = payload.get("email")
        name = payload.get("name", "")

        # ✅ Si no viene email, un Fallback a /userinfo solo una vez
        if not email:
            userinfo = self.get_user_info_from_auth0(token)
            email = userinfo.get("email", None)
            name = userinfo.get("name", name)

        # ✅ Si de plano no hay email, generamos uno temporal
        if not email:
            email = f"{auth0_id.replace('|', '_')}@auth0-temp.local"

        try:
            user = User.objects.get(auth0_id=auth0_id)
        except ObjectDoesNotExist:
            user = User.objects.create(
                auth0_id=auth0_id,
                username=email.split("@")[0],
                email=email,
                type="standard",
                status="active",
            )

        return user


class Auth0Authentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not token:
            return None

        from .auth import Auth0Service
        service = Auth0Service()
        user = service.get_or_create_user_from_auth0(token)

        if not user:
            raise exceptions.AuthenticationFailed("Invalid Auth0 token")

        return (user, None)
