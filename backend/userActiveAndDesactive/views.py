from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import SerializerUserActiveandDesactive

@api_view(['POST'])
def active_or_desactive(request):
    serializer = SerializerUserActiveandDesactive(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# aqui se trabajaria el update o el cambio de estado
