from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import UserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        })
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def api_logout(request):
    # Simple logout - just clear the session
    try:
        request.session.flush()
        return Response({'message': 'Logout successful'})
    except Exception as e:
        return Response({'message': 'Logout completed'}, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def api_user(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
