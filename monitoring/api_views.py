from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Field, FieldUpdate
from .serializers import (
    FieldSerializer, FieldCreateUpdateSerializer, FieldUpdateSerializer,
    UserSerializer, UserListSerializer, UserCreateSerializer
)


def is_admin(user):
    return user.is_staff


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and is_admin(request.user)


class IsAssignedAgentOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if is_admin(request.user):
            return True
        return obj.assigned_agent_id == request.user.id


@method_decorator(csrf_exempt, name='dispatch')
class FieldViewSet(viewsets.ModelViewSet):
    serializer_class = FieldSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    queryset = Field.objects.all()

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            return Field.objects.select_related('assigned_agent').prefetch_related('updates')
        else:
            return Field.objects.select_related('assigned_agent').prefetch_related('updates').filter(
                assigned_agent=user
            )

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FieldCreateUpdateSerializer
        return FieldSerializer

    def perform_create(self, serializer):
        return serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        created = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(FieldSerializer(created).data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_update(self, request, pk=None):
        field = self.get_object()
        
        # Check if user can update this field
        if not is_admin(request.user) and field.assigned_agent_id != request.user.id:
            return Response(
                {'error': 'You can only update your assigned fields.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = FieldUpdateSerializer(data=request.data)
        if serializer.is_valid():
            update = serializer.save(field=field, agent=request.user)
            
            # Update field's current stage
            field.current_stage = update.stage
            field.save(update_fields=['current_stage', 'updated_at'])
            
            return Response(FieldUpdateSerializer(update).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ['retrieve', 'me']:
            return UserSerializer
        return UserListSerializer

    def create(self, request, *args, **kwargs):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        if is_admin(self.request.user):
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


@method_decorator(csrf_exempt, name='dispatch')
class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        if is_admin(user):
            fields = Field.objects.select_related('assigned_agent').prefetch_related('updates')
        else:
            fields = Field.objects.select_related('assigned_agent').prefetch_related('updates').filter(
                assigned_agent=user
            )

        # Status counts
        status_counts = {
            'ACTIVE': 0,
            'AT_RISK': 0,
            'COMPLETED': 0,
        }
        for field in fields:
            status_counts[field.status] += 1

        # Recent updates
        recent_updates_data = []
        for field in fields[:20]:
            latest = field.updates.select_related('agent').first()
            if latest:
                # Create update data with field info
                update_data = {
                    'id': latest.id,
                    'agent': {
                        'id': latest.agent.id,
                        'username': latest.agent.username,
                        'email': latest.agent.email,
                        'is_staff': latest.agent.is_staff,
                    },
                    'stage': latest.stage,
                    'note': latest.note,
                    'created_at': latest.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    'field': {
                        'id': field.id,
                        'name': field.name,
                    }
                }
                recent_updates_data.append(update_data)
        recent_updates_data.sort(key=lambda x: x['created_at'], reverse=True)

        # Recent fields
        recent_fields = fields[:10]

        data = {
            'is_admin': is_admin(user),
            'total_fields': fields.count(),
            'status_counts': status_counts,
            'recent_fields': FieldSerializer(recent_fields, many=True).data,
            'recent_updates': recent_updates_data[:10],
        }

        return Response(data)
