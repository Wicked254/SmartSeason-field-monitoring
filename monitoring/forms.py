from django import forms
from django.contrib.auth.models import User

from .models import Field, FieldUpdate


class FieldForm(forms.ModelForm):
    assigned_agent = forms.ModelChoiceField(
        queryset=User.objects.filter(is_staff=False).order_by('username'),
        required=False,
        help_text='Assign to a field agent user (non-staff).',
    )

    class Meta:
        model = Field
        fields = ['name', 'crop_type', 'planting_date', 'current_stage', 'assigned_agent']
        widgets = {
            'planting_date': forms.DateInput(attrs={'type': 'date'}),
        }


class FieldUpdateForm(forms.ModelForm):
    class Meta:
        model = FieldUpdate
        fields = ['stage', 'note']
        widgets = {
            'note': forms.Textarea(attrs={'rows': 4}),
        }
