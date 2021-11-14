from background_task import background
from .models import Client, Hash
from datetime import datetime, timedelta


@background(schedule=60)
def check_sleeped_clients():
    expire_time = datetime.now() + timedelta(minutes=3)
    clients = Client.objects.all().filter(date_update__gte=expire_time)
    if clients:
        pass