from rest_framework import serializers
from .models import UserActiveAndDesactive

class SerializerUserActiveandDesactive(serializers.ModelSerializer):
    class Meta:
        model = UserActiveAndDesactive
        fields = ["id", "adminUser", "normal_user", "is_active"]
