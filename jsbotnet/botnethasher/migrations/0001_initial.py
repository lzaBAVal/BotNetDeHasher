# Generated by Django 3.2.8 on 2021-11-10 18:17

import botnethasher.db.other
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Hash',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hash', models.CharField(max_length=32, verbose_name='Hash string')),
                ('password', models.TextField(max_length=255, null=True, verbose_name='Password string')),
                ('alphabet', models.TextField(default=botnethasher.db.other.default_alphabet, max_length=255, verbose_name='Password alphabet')),
                ('priority', models.PositiveSmallIntegerField(default=1000, verbose_name='Priority of hash')),
                ('status', models.CharField(choices=[('a', 'Добавлен'), ('w', 'В работе'), ('s', 'Остановлен'), ('f', 'Работа закончена')], default='a', max_length=1, verbose_name='Status of hash')),
                ('date_create', models.DateTimeField(auto_now_add=True, verbose_name='Created datetime')),
                ('date_update', models.DateTimeField(auto_now=True, verbose_name='Updated datetime')),
                ('date_finished', models.DateTimeField(verbose_name='Finished datetime')),
            ],
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('static_string', models.TextField(max_length=20)),
                ('status', models.CharField(choices=[('c', 'Создано'), ('w', 'В работе'), ('f', 'Работа закончена'), ('x', 'Истекло время ожидания')], default='c', max_length=1)),
                ('data_create', models.DateTimeField(auto_now_add=True, verbose_name='Created datetime')),
                ('date_update', models.DateTimeField(auto_now=True, verbose_name='Updated datetime')),
                ('hash_id', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='botnethasher.hash')),
            ],
            options={
                'unique_together': {('hash_id', 'static_string')},
            },
        ),
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, verbose_name='UUID')),
                ('count_finished_tasks', models.IntegerField(default=0, verbose_name='Count all finished tasks')),
                ('date_create', models.DateTimeField(auto_now_add=True, verbose_name='Created datetime')),
                ('date_update', models.DateTimeField(auto_now=True, verbose_name='Updated datetime')),
                ('hash_id', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='botnethasher.hash', verbose_name='Hash which processing')),
            ],
        ),
        migrations.CreateModel(
            name='Work',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_create', models.DateTimeField(auto_now_add=True, verbose_name='Created datetime')),
                ('date_update', models.DateTimeField(auto_now=True, verbose_name='Updated datetime')),
                ('client_id', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='botnethasher.client')),
                ('task_id', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='botnethasher.task')),
            ],
            options={
                'unique_together': {('task_id', 'client_id')},
            },
        ),
    ]
