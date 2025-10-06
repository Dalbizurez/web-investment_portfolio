from django.db import models
from NormalUser.models import NormalUser

class Transaction(models.Model):
    normal_user_id = models.ForeignKey(NormalUser, on_delete=models.CASCADE, related_name='transactions')    
    ticker = models.CharField(max_length=10)
    amount = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    def calculate_total(self):
        return self.amount * self.price