import uuid

from django.db import models
from django.db.models import Q

from .db.other import default_alphabet

from itertools import chain


class Hash(models.Model):
    class Statuses(models.TextChoices):
        ADDED = 'a', 'Добавлен'
        WORKING = 'w', 'В работе'
        STOPED = 's', 'Остановлен'
        FINISHED = 'f', 'Работа закончена'

    hash = models.CharField(verbose_name='Hash string', max_length=32, null=False)
    password = models.TextField(verbose_name='Password string', max_length=255, null=True)
    alphabet = models.TextField(verbose_name='Password alphabet', max_length=255, null=False, default=default_alphabet)
    priority = models.PositiveSmallIntegerField(verbose_name='Priority of hash', null=False, default=1000)
    status = models.CharField(verbose_name='Status of hash', max_length=1, null=False, default=Statuses.ADDED,
                              choices=Statuses.choices)
    date_create = models.DateTimeField(verbose_name='Created datetime', auto_now_add=True)
    date_update = models.DateTimeField(verbose_name='Updated datetime', auto_now=True)
    date_finished = models.DateTimeField(verbose_name='Finished datetime', null=True)

    @staticmethod
    def get_hash_for_work():
        return Hash.objects.filter(Q(status__in=['a', 'w']), Q()).order_by('-priority').first()


class Client(models.Model):
    uuid = models.UUIDField(verbose_name='UUID', default=uuid.uuid4, null=False, editable=False)
    hash_id = models.ForeignKey(Hash, on_delete=models.SET_NULL, null=True, verbose_name='Hash which processing')
    count_finished_tasks = models.IntegerField(verbose_name='Count all finished tasks', null=False, default=0)
    date_create = models.DateTimeField(verbose_name='Created datetime', auto_now_add=True)
    date_update = models.DateTimeField(verbose_name='Updated datetime', auto_now=True)

    def get_tasks(self, amount_tasks: int) -> list:
        tasks = Task.get_unprocessed_tasks(self.hash_id, amount_tasks)
        if not tasks.count():
            return 0
        for task in tasks:
            Work(task_id=task, client_id=self).save()
        return tasks

    def get_amount_tasks(self):
        return Task.objects.filter(hash_id=self.hash_id).exclude(status='f').count()

    def get_amount_clients(self):
        return Client.objects.filter(hash_id=self.hash_id).count()

    def complete_tasks(self, tasks):
        completed_tasks = []
        for task in tasks:
            task_object: Task = Task.objects.filter(static_string=task).filter(hash_id=self.hash_id)
            if not task_object.count():
                continue
            task_object = task_object[0]
            task_object.status = 'f'
            task_object.save()
            completed_tasks.append(task)
        return completed_tasks


class Task(models.Model):
    class Statuses(models.TextChoices):
        CREATED = 'c', 'Создано'
        WORKING = 'w', 'В работе'
        FINISHED = 'f', 'Работа закончена'
        FORGOTTEN = 'x', 'Истекло время ожидания'

    class Meta:
        unique_together = (('hash_id', 'static_string'),)

    hash_id = models.ForeignKey(Hash, on_delete=models.CASCADE)
    static_string = models.TextField(max_length=20, null=False)
    status = models.CharField(max_length=1, null=False, default=Statuses.CREATED, choices=Statuses.choices)
    data_create = models.DateTimeField(verbose_name="Created datetime", auto_now_add=True)
    date_update = models.DateTimeField(verbose_name='Updated datetime', auto_now=True)

    @staticmethod
    def get_unprocessed_tasks(hash: Hash, amount_tasks):
        created_tasks = Task.objects.all().filter(hash_id=hash.pk, status='c')
        return Task.objects.all().filter(hash_id=hash.pk, status='x').union(created_tasks).all()[:amount_tasks]


class Work(models.Model):
    class Meta:
        unique_together = (('task_id', 'client_id'),)

    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)
    client_id = models.ForeignKey(Client, on_delete=models.CASCADE)
    date_create = models.DateTimeField(verbose_name='Created datetime', auto_now_add=True)
    date_update = models.DateTimeField(verbose_name='Updated datetime', auto_now=True)
