from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import TransactionSerializer
from .models import Transaction


@api_view(['POST'])
def create_transaction(request):
    data = request.data.copy()
    amount = int(data.get("amount", 0))
    price = float(data.get("price", 0))
    data['total'] = amount * price

    serializer = TransactionSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)