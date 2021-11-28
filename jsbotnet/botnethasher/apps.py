from django.apps import AppConfig


class BotnethasherConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'botnethasher'

    def ready(self):
        import botnethasher.signals
        import botnethasher.background_task
