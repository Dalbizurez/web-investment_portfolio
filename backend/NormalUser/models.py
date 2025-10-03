from django.db import models
from django.contrib.auth.hashers import check_password




class NormalUser(models.Model):

    name = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    code = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
