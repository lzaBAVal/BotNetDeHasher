from background_task import background
from .models import Client, Work
from datetime import datetime, timedelta


@background(schedule=1)
def check_sleeped_clients(repeat=60):
    clients = Client.objects.all()
    for client in clients:
        if datetime.now() - timedelta(minutes=1) > client.date_update:
            client.delete()


@background(schedule=1)
def check_unfulfilled_tasks(repeat=60):
    works = Work.objects.all()
    for work in works:
        if datetime.now() - timedelta(minutes=3) > work.date_update:
            work.delete()


# check_sleeped_clients(repeat=10)
# check_unfulfilled_tasks(repeat=10)
