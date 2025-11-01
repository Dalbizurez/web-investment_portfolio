from rest_framework import serializers
from .models import Gift

class SerializerGift(serializers.ModelSerializer):
    class Meta:
        model = Gift
        fields = ["id", "user_code", "new_user"]
        
