from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import UsuarioSerializer
from .models import NormalUser

@api_view(['POST'])
def register(request):
    serializer = UsuarioSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def login(request):
    name = request.data.get("name")
    password = request.data.get("password")
    try:
        user = NormalUser.objects.get(name=name)
        if user.check_password(password):
            serializer = UsuarioSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
    except NormalUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # falta el update de credenciales

