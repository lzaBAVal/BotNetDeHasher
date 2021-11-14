from .models import Hash, Client
from django.dispatch import receiver
from django.db.models import signals


@receiver(signals.post_init, sender=Client)
def get_first_hash(sender, instance, *args, **kwargs):
    hash_id = Hash.objects.first().filter('-priority')
    if hash_id:
        instance.hash_id = hash_id
