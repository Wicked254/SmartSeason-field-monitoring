from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render

from .forms import FieldForm, FieldUpdateForm
from .models import Field


def is_admin(user):
    return user.is_staff


@login_required
def dashboard(request):
    if is_admin(request.user):
        fields = Field.objects.select_related('assigned_agent').all()
    else:
        fields = Field.objects.select_related('assigned_agent').filter(assigned_agent=request.user)

    status_counts = {
        Field.Status.ACTIVE: 0,
        Field.Status.AT_RISK: 0,
        Field.Status.COMPLETED: 0,
    }

    for field in fields:
        status_counts[field.status] += 1

    recent_updates = []
    for field in fields[:20]:
        latest = field.updates.select_related('agent').first()
        if latest:
            recent_updates.append(latest)
    recent_updates.sort(key=lambda x: x.created_at, reverse=True)

    context = {
        'is_admin': is_admin(request.user),
        'total_fields': fields.count(),
        'status_counts': status_counts,
        'fields': fields[:10],
        'recent_updates': recent_updates[:10],
    }
    return render(request, 'monitoring/dashboard.html', context)


@login_required
def field_list(request):
    if is_admin(request.user):
        fields = Field.objects.select_related('assigned_agent').all()
    else:
        fields = Field.objects.select_related('assigned_agent').filter(assigned_agent=request.user)

    return render(request, 'monitoring/field_list.html', {'fields': fields, 'is_admin': is_admin(request.user)})


@login_required
def field_create(request):
    if not is_admin(request.user):
        return HttpResponseForbidden('Only admins can create fields.')

    if request.method == 'POST':
        form = FieldForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Field created successfully.')
            return redirect('field_list')
    else:
        form = FieldForm()

    return render(request, 'monitoring/field_form.html', {'form': form, 'title': 'Create Field'})


@login_required
def field_edit(request, pk):
    if not is_admin(request.user):
        return HttpResponseForbidden('Only admins can edit fields.')

    field = get_object_or_404(Field, pk=pk)

    if request.method == 'POST':
        form = FieldForm(request.POST, instance=field)
        if form.is_valid():
            form.save()
            messages.success(request, 'Field updated successfully.')
            return redirect('field_detail', pk=field.pk)
    else:
        form = FieldForm(instance=field)

    return render(request, 'monitoring/field_form.html', {'form': form, 'title': 'Edit Field'})


@login_required
def field_detail(request, pk):
    field = get_object_or_404(Field.objects.select_related('assigned_agent'), pk=pk)

    if not is_admin(request.user) and field.assigned_agent_id != request.user.id:
        return HttpResponseForbidden('You can only view your assigned fields.')

    if request.method == 'POST':
        if not field.assigned_agent_id == request.user.id and not is_admin(request.user):
            return HttpResponseForbidden('You can only update your assigned fields.')

        update_form = FieldUpdateForm(request.POST)
        if update_form.is_valid():
            update = update_form.save(commit=False)
            update.field = field
            update.agent = request.user
            update.save()

            field.current_stage = update.stage
            field.save(update_fields=['current_stage', 'updated_at'])

            messages.success(request, 'Field update submitted.')
            return redirect('field_detail', pk=field.pk)
    else:
        update_form = FieldUpdateForm(initial={'stage': field.current_stage})

    return render(
        request,
        'monitoring/field_detail.html',
        {
            'field': field,
            'updates': field.updates.select_related('agent').all(),
            'update_form': update_form,
            'is_admin': is_admin(request.user),
        },
    )
