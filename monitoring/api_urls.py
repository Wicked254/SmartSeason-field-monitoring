from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import FieldViewSet, UserViewSet, DashboardViewSet
from . import auth_views

router = DefaultRouter()
router.register(r'fields', FieldViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', auth_views.api_login, name='api-login'),
    path('auth/logout/', auth_views.api_logout, name='api-logout'),
    path('auth/user/', auth_views.api_user, name='api-user'),
    
    # API endpoints
    path('', include(router.urls)),
    path('dashboard/', DashboardViewSet.as_view({'get': 'list'}), name='api-dashboard'),
]
