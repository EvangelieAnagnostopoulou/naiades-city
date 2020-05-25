import requests
from django.http import JsonResponse
from django.shortcuts import render

from project.settings import NAIADES_API


def home(request):
    return render(request, 'home.html')


def get_from_dashboard(metric):
    return JsonResponse(
        requests.
            get(f"{NAIADES_API}/measurements/data?metric={metric}").
            json()
    )


def api_weekly_total(request):
    return get_from_dashboard(metric='weekly_consumption_by_meter')


def api_meters(request):
    return get_from_dashboard(metric='meter_info')
