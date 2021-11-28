from django.contrib import admin
from .models import *


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'hash_id', 'count_finished_tasks', 'date_create', 'date_update')


@admin.register(Hash)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('hash', 'password', 'priority', 'status', 'date_create', 'date_update', 'date_finished')


@admin.register(Task)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('hash_id', 'static_string', 'status')


# admin.site.register(Task)
admin.site.register(Work)
