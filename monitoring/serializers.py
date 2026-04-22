from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Field, FieldUpdate


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']


class FieldUpdateSerializer(serializers.ModelSerializer):
    agent = UserSerializer(read_only=True)
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    
    class Meta:
        model = FieldUpdate
        fields = ['id', 'agent', 'stage', 'note', 'created_at']
        read_only_fields = ['agent', 'created_at']


class FieldSerializer(serializers.ModelSerializer):
    assigned_agent = UserSerializer(read_only=True)
    assigned_agent_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    updates = FieldUpdateSerializer(many=True, read_only=True)
    status = serializers.CharField(read_only=True)
    status_label = serializers.CharField(read_only=True)
    status_css_class = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    updated_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    planting_date = serializers.DateField(format='%Y-%m-%d')

    class Meta:
        model = Field
        fields = [
            'id', 'name', 'crop_type', 'planting_date', 'current_stage',
            'assigned_agent', 'assigned_agent_id', 'status', 'status_label',
            'status_css_class', 'created_at', 'updated_at', 'updates'
        ]

    def validate_assigned_agent_id(self, value):
        if value is not None:
            try:
                User.objects.get(id=value)
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid agent ID")
        return value


class FieldCreateUpdateSerializer(serializers.ModelSerializer):
    assigned_agent_id = serializers.IntegerField(required=False, allow_null=True)
    planting_date = serializers.DateField(format='%Y-%m-%d')

    class Meta:
        model = Field
        fields = [
            'name', 'crop_type', 'planting_date', 'current_stage',
            'assigned_agent_id'
        ]

    def validate_assigned_agent_id(self, value):
        if value is not None:
            try:
                User.objects.get(id=value)
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid agent ID")
        return value


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_staff']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
