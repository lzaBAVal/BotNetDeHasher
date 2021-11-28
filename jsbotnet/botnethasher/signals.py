from .models import *
from django.dispatch import receiver
from django.db.models import signals

from .service import create_tasks_list

# @receiver(signals.post_init, sender=Client)
# def get_first_hash(sender, instance, *args, **kwargs):
#     hash_id = Hash.objects.first().filter('-priority')
#     if hash_id:
#         instance.hash_id = hash_id


@receiver(signals.pre_delete, sender=Client)
def flush_work_by_client(sender: Client, instance, *args, **kwargs):
    client_id = instance.pk
    tasks_in_work = Work.objects.all().filter(client_id=client_id)
    for task_in_work in tasks_in_work:
        task_in_work.delete()


@receiver(signals.pre_delete, sender=Work)
def change_status_before_delete_work(sender: Work, instance, *args, **kwargs):
    task = instance.task_id
    task = Task.objects.filter(id=task.pk).first()
    task.status = 'x'
    task.save()


@receiver(signals.post_save, sender=Hash)
def create_tasks_after_add_hash(sender: Hash, instance, created, **kwargs):
    if created:
        tasks = create_tasks_list(alphabet=instance.alphabet)
        for task in tasks:
            t = Task(static_string=task, hash_id=instance)
            t.save()


@receiver(signals.post_save, sender=Work)
def change_status_for_task(sender: Work, instance, created, **kwargs):
    if created:
        task = instance.task_id
        task.status = 'w'
        task.save()


@receiver(signals.pre_save, sender=Task)
def delete_work_completed_task(sender: Task, instance: Task, *args, **kwargs):
    if instance.pk is not None:
        old_task = Task.objects.get(pk=instance.pk)
        if instance.status == 'f' and old_task == 'w':
            Work.objects.filter(task_id=instance.pk).delete()
