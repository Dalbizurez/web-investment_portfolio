from django.db import models
from NormalUser.models import NormalUser

# Create your models here.
class Gift(models.Model):
    user_code = models.ForeignKey(NormalUser, on_delete=models.CASCADE, related_name='id_user')    
    new_user = models.OneToOneField(NormalUser, on_delete=models.CASCADE, related_name='id_new_user')    

    def __str__(self):
        return self.name