# Generated by Django 4.2.13 on 2024-07-06 21:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_remove_person_request_date_candidate_request_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='candidate',
            name='interviewed',
            field=models.BooleanField(default=False),
        ),
    ]
