from .models import *


def get_tasks(client, amount_tasks: int) -> list:
    tasks = Task.get_unprocessed_tasks(client.hash_id, amount_tasks)
    if not tasks:
        return 0
    task_string_list = []
    for task in tasks:
        task.status = 'w'
        task.save()
        Work(task_id=task.id, client_id=client.id).save()
        task_string_list.append(task.static_string)
    return task_string_list


def create_tasks(hash_id):
    tasks = Task.objects.all().filter(hash_id=hash_id)
    alphabet = Hash.objects.first().filter(id=hash_id)
    return tasks
    if not tasks:
        amount_tasks = 5000
        counter = 0
        while counter < 5000:
            counter += 1

    else:
        pass


def generate_string():
    pass