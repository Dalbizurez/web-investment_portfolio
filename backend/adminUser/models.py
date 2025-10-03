from django.db import models
from django.contrib.auth.hashers import check_password


class AdminUser(models.Model):
    name = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)