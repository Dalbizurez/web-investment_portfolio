from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import User
from user_try.emails.services import UserEmailService

@receiver(pre_save, sender=User)
def track_previous_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_status = sender.objects.get(pk=instance.pk).status
        except sender.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None

@receiver(post_save, sender=User)
def send_activation_email(sender, instance, created, **kwargs):
    # Don't send email on user creation (only on status change)
    if created:
        return

    previous_status = getattr(instance, '_old_status', None)

    # If the user changed from pending - active and no email has been sent
    if previous_status == "pending" and instance.status == "active":
        if not instance.email_activation_sent:
            UserEmailService.send_account_activated_email(instance)

            # Mark that the email has been sent
            User.objects.filter(pk=instance.pk).update(email_activation_sent=True)
