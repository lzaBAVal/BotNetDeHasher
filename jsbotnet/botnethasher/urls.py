from django.urls import path
from .views import *

# 202cb962ac59075b964b07152d234b70
# caf1a3dfb505ffed0d024130f58c5cfa

urlpatterns = [
    path('guest/hello', api_new_client),

    path('user/all', api_client),
    path('user/<uuid:client_uuid>', api_check_news),
    path('user/<uuid:client_uuid>/detail', api_client_detail),
    path('user/<uuid:client_uuid>/get-tasks/<int:amount_tasks>', api_get_tasks),
    path('user/<uuid:client_uuid>/check-health', api_check_health),

    path('tg-bot/add-hash', api_tg_add_hash),
    path('tg-bot/get-info', api_tg_get_info),
    path('tg-bot/get-hashes', api_tg_show_hashes),
    path('tg-bot/delete-hashes', api_tg_delete_hashes),
    # path('<str:UID>/get-info/', ),
    # path('<str:UID>/send-info/', ),
    # path('<str:UID>/tasks-processed/', ),
    # path('<str:UID>/send-answer/', ),
    # path('<str:UID>/bye/', ),
]