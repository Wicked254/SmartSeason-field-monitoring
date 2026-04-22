from datetime import datetime, timedelta

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class Field(models.Model):
    class Stage(models.TextChoices):
        PLANTED = 'PLANTED', 'Planted'
        GROWING = 'GROWING', 'Growing'
        READY = 'READY', 'Ready'
        HARVESTED = 'HARVESTED', 'Harvested'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        AT_RISK = 'AT_RISK', 'At Risk'
        COMPLETED = 'COMPLETED', 'Completed'

    name = models.CharField(max_length=120)
    crop_type = models.CharField(max_length=120)
    planting_date = models.DateField()
    current_stage = models.CharField(max_length=20, choices=Stage.choices, default=Stage.PLANTED)
    assigned_agent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='assigned_fields',
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.name} ({self.crop_type})'

    @property
    def status(self):
        if self.current_stage == Field.Stage.HARVESTED:
            return Field.Status.COMPLETED

        latest_update = self.updates.order_by('-created_at').first()
        latest_activity_time = latest_update.created_at if latest_update else timezone.make_aware(
            datetime.combine(self.planting_date, datetime.min.time())
        )

        if timezone.now() - latest_activity_time > timedelta(days=14):
            return Field.Status.AT_RISK

        if self.current_stage == Field.Stage.PLANTED and self.planting_date < timezone.localdate() - timedelta(days=21):
            return Field.Status.AT_RISK

        return Field.Status.ACTIVE

    @property
    def status_label(self):
        return self.Status(self.status).label

    @property
    def status_css_class(self):
        mapping = {
            self.Status.ACTIVE: 'status-active',
            self.Status.AT_RISK: 'status-at-risk',
            self.Status.COMPLETED: 'status-completed',
        }
        return mapping[self.status]


class FieldUpdate(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='updates')
    agent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='field_updates')
    stage = models.CharField(max_length=20, choices=Field.Stage.choices)
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.field.name} update by {self.agent.username} on {self.created_at:%Y-%m-%d}'
