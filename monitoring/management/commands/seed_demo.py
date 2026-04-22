from datetime import date, timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from monitoring.models import Field, FieldUpdate


class Command(BaseCommand):
    help = 'Create demo users and sample fields for SmartSeason assessment'

    def handle(self, *args, **options):
        admin_user, _ = User.objects.get_or_create(
            username='coordinator',
            defaults={'is_staff': True, 'is_superuser': True, 'email': 'admin@smartseason.local'},
        )
        admin_user.set_password('Admin123!')
        admin_user.save()

        agent1, _ = User.objects.get_or_create(username='agent1', defaults={'email': 'agent1@smartseason.local'})
        agent1.set_password('Agent123!')
        agent1.save()

        agent2, _ = User.objects.get_or_create(username='agent2', defaults={'email': 'agent2@smartseason.local'})
        agent2.set_password('Agent123!')
        agent2.save()

        FieldUpdate.objects.all().delete()
        Field.objects.all().delete()

        fields = [
            Field.objects.create(
                name='North Block A',
                crop_type='Maize',
                planting_date=date.today() - timedelta(days=16),
                current_stage=Field.Stage.GROWING,
                assigned_agent=agent1,
            ),
            Field.objects.create(
                name='Riverbank Plot',
                crop_type='Beans',
                planting_date=date.today() - timedelta(days=32),
                current_stage=Field.Stage.PLANTED,
                assigned_agent=agent2,
            ),
            Field.objects.create(
                name='South Farm C',
                crop_type='Tomatoes',
                planting_date=date.today() - timedelta(days=50),
                current_stage=Field.Stage.HARVESTED,
                assigned_agent=agent1,
            ),
        ]

        FieldUpdate.objects.create(field=fields[0], agent=agent1, stage=Field.Stage.GROWING, note='Good canopy development.')
        FieldUpdate.objects.create(field=fields[1], agent=agent2, stage=Field.Stage.PLANTED, note='Uneven emergence on east side.')
        FieldUpdate.objects.create(field=fields[2], agent=agent1, stage=Field.Stage.HARVESTED, note='Harvest completed and recorded.')

        self.stdout.write(self.style.SUCCESS('Demo data created.'))
        self.stdout.write('Admin: coordinator / Admin123!')
        self.stdout.write('Agent: agent1 / Agent123!')
        self.stdout.write('Agent: agent2 / Agent123!')
