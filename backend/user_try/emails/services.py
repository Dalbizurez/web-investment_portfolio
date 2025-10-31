# user_try/emails/services.py
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


class UserEmailService:
    """Service for sending user-related emails"""
    
    @staticmethod
    def send_registration_pending_email(user):
        """
        Send email to user when they register
        Informs them their account is pending admin approval
        """
        try:
            subject = 'Account Registration - Pending Approval'
            
            context = {
                'username': user.username,
                'email': user.email,
                'created_at': user.created_at,
            }
            
            html_message = render_to_string(
                'user_try/emails/registration_pending.html',
                context
            )
            
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Registration pending email sent to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending registration pending email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_account_activated_email(user):
        """
        Send welcome email when account is activated by admin
        """
        try:
            subject = 'Welcome! Your Account Has Been Activated'
            
            context = {
                'username': user.username,
                'email': user.email,
                'referral_code': user.referral_code,
                'login_url': 'http://localhost:5173/login',  # Update with production URL
            }
            
            html_message = render_to_string(
                'user_try/emails/account_activated.html',
                context
            )
            
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Account activated email sent to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending account activated email to {user.email}: {str(e)}")
            return False