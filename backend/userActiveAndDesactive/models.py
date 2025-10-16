from django.db import models
from NormalUser.models import NormalUser
from adminUser.models import AdminUser

# Create your models here.
class UserActiveAndDesactive(models.Model):
    adminUser = models.ForeignKey(AdminUser, on_delete=models.CASCADE, related_name='admin_actions')
    normal_user = models.OneToOneField(NormalUser, on_delete=models.CASCADE, related_name='user_activate')
    is_active = models.BooleanField(default=False)

    def change_status(self, new_status: bool):
        self.is_active = new_status
        self.save()

    def return_status(self):
        return self.is_active