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
def handle_status_change(sender, instance, created, **kwargs):
    if created:
        return  # no enviar nada al crear

    prev = getattr(instance, '_old_status', None)
    new = instance.status

    # Pending -> Active (first approval)
    if prev == "pending" and new == "active":
        if not instance.email_activation_sent:
            UserEmailService.send_account_activated_email(instance)
            User.objects.filter(pk=instance.pk).update(email_activation_sent=True)

    # Active -> Suspended
    elif prev == "active" and new == "suspended":
        UserEmailService.send_account_suspended_email(instance)

    # Suspended -> Active (reactivation)
    elif prev == "suspended" and new == "active":
        UserEmailService.send_account_reactivated_email(instance)
