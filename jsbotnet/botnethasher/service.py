# from .models import *
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


def create_tasks_list(alphabet='abcdefghijklmnopqrstuvwxyz0123456789!"#$%&\'()*+,-./:;<=>?@[\]^_`{|}~') -> list:
    tasks = []
    for symbol_1 in range(len(alphabet)):
        for symbol_2 in range(symbol_1, len(alphabet)):
            tasks.append(f'{alphabet[symbol_1]}{alphabet[symbol_2]}')
    tasks = list(dict.fromkeys(tasks))
    return tasks
