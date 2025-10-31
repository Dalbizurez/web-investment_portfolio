from django.apps import AppConfig

class UserTryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_try'

    def ready(self):
        import user_try.signals
