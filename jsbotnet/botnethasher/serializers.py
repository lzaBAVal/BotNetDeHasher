from rest_framework import serializers
from .models import *


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ('uuid', 'date_create', 'date_update')


class HashSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hash
        fields = ('hash', 'alphabet')


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('static_string',)


class ClientGeneralInfoSerializer(serializers.ModelSerializer):
    hash = HashSerializer()
    tasks = TaskSerializer(many=True)
