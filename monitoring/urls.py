from django.urls import path, include

from . import views
from . import api_urls

app_name = 'monitoring'

urlpatterns = [
    # Template views (keep for admin interface)
    path('', views.dashboard, name='dashboard'),
    path('fields/', views.field_list, name='field_list'),
    path('fields/new/', views.field_create, name='field_create'),
    path('fields/<int:pk>/', views.field_detail, name='field_detail'),
    path('fields/<int:pk>/edit/', views.field_edit, name='field_edit'),
    
    # API endpoints
    path('api/', include(api_urls)),
]
