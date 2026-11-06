from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, RefreshView, RegisterUserView
from .views import UserApiViewSet, UserView
router = DefaultRouter()
router.register('users', UserApiViewSet, basename='users')
urlpatterns = [path('auth/register/', RegisterUserView.as_view(), name='register'), path('auth/me/', UserView.as_view(), name='auth-me'), path('auth/token/', LoginView.as_view(), name='token_obtain_pair'), path('auth/token/refresh/', RefreshView.as_view(), name='token_refresh'), path('', include(router.urls))]
