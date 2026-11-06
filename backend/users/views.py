from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from .models import User
from .serializers import UserSerializer, UserReadSerializer
class UserApiViewSet(ModelViewSet):
    """CRUD de usuarios exclusivo para administradores; password nunca se devuelve."""
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.order_by('id')
    @swagger_auto_schema(responses={201: UserReadSerializer})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    @swagger_auto_schema(responses={200: UserReadSerializer(many=True)})
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    @swagger_auto_schema(responses={200: UserReadSerializer})
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    @swagger_auto_schema(responses={200: UserReadSerializer})
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    @swagger_auto_schema(responses={200: UserReadSerializer})
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
class UserView(APIView):
    permission_classes = [IsAuthenticated]
    @swagger_auto_schema(responses={200: UserReadSerializer}, operation_description='Datos del usuario autenticado. Sin password ni hash.')
    def get(self, request):
        return Response(UserReadSerializer(request.user).data)

from rest_framework import serializers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
class TokenPairResponseSerializer(serializers.Serializer):
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
class AccessResponseSerializer(serializers.Serializer):
    access = serializers.CharField(read_only=True)
class LoginView(TokenObtainPairView):
    @swagger_auto_schema(responses={200: TokenPairResponseSerializer})
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
class RefreshView(TokenRefreshView):
    @swagger_auto_schema(responses={200: AccessResponseSerializer})
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from .serializers import RegisterUserSerializer
class RegisterUserView(CreateAPIView):
    """Registro publico. Solo permite crear cuentas sin permisos administrativos."""
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = RegisterUserSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'register'
    @swagger_auto_schema(responses={201: UserReadSerializer})
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
