from django.http import JsonResponse, HttpResponse
from django.db.transaction import atomic

from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from .models import Client, Task
from .serializers import ClientSerializer, HashSerializer, ClientGeneralInfoSerializer, TaskSerializer
from .service import *

import logging
logger = logging.getLogger(__name__)


@api_view(['GET', 'POST'])
def api_client(request):
    if request.method == 'GET':
        clients = Client.objects.all()
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def api_client_detail(request, client_uuid):
    client = Client.objects.get(uuid=client_uuid)
    if request.method == 'GET':
        serializer = ClientSerializer(client)
        return Response(serializer.data)
    elif request.method == 'PUT' or request.method == 'PATCH':
        serializer = ClientSerializer(client, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        client.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def api_new_client(request):
    if request.method == 'GET':
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def api_get_hash(request, client_uuid):
    client = Client.objects.get(uuid=client_uuid)
    if request.method == 'GET':
        if client.hash_id:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            hash = Hash.get_hash_for_work()
            client.hash_id = hash
            client.save()
            serialized_hash = HashSerializer(hash)
            return Response({
                'hash': serialized_hash.data,
                # 'client': serialized_client.data
            })


@atomic
@api_view(['GET'])
def api_get_tasks(request, client_uuid, amount_tasks):
    client = Client.objects.get(uuid=client_uuid)
    if request.method == 'GET':
        tasks = client.get_tasks(amount_tasks)
        return Response(TaskSerializer(tasks, many=True).data, status=status.HTTP_200_OK)


@api_view(['GET'])
def api_check_health(request, client_uuid):
    client = Client.objects.get(uuid=client_uuid)
    if request.method == 'GET':
        serializer = ClientSerializer(client)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['POST'])
def api_finished_completed_tasks(request, client_uuid):
    client = Client.objects.get(uuid=client_uuid)
    if request.method == 'POST':
        tasks = request.data['tasks']
        completed_tasks = client.complete_tasks(tasks)
        return Response({'completed_tasks': completed_tasks}, status=status.HTTP_200_OK)


@api_view(['GET'])
def api_get_info(request, client_uuid):
    if request.method == 'GET':
        client = Client.objects.get(uuid=client_uuid)
        amount_clients = client.get_amount_clients()
        amount_tasks = client.get_amount_tasks()
        return Response({'amount_clients': amount_clients, 'amount_tasks': amount_tasks}, status=status.HTTP_200_OK)


@api_view(['POST'])
def api_tg_add_hash(request):
    if request.method == 'POST':
        serializer = HashSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def api_tg_get_info(request):
    if request.method == 'GET':
        info = Hash.objects.all()
        # TODO return info


@api_view(['GET'])
def api_tg_show_hashes(request):
    if request.method == 'GET':
        hashes = Hash.objects.all()
        return hashes


@api_view(['GET'])
def api_tg_delete_hashes(request):
    if request.method == 'GET':
        return Hash.objects().all().delete()
