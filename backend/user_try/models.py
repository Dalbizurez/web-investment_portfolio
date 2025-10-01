from django.db import models
from django.contrib.auth.hashers import check_password




class User(models.Model):
    USER_TYPES = [
        ("standard", "Standard"),
        ("admin", "Admin"),
        ("vip", "VIP"),
    ]
    
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  
    type = models.CharField(max_length=50, choices=USER_TYPES, default="standard")

    def __str__(self):
        return self.username
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
