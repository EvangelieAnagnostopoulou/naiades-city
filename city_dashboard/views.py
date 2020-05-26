import requests
from django.http import JsonResponse
from django.shortcuts import render

from project.settings import NAIADES_API


def home(request):
    return render(request, 'home.html')


def get_from_dashboard(metric, params=None):
    return JsonResponse(
        requests.
            get(f"{NAIADES_API}/measurements/data?metric={metric}{params or ''}").
            json()
    )


def api_weekly_total(request):
    return get_from_dashboard(metric='weekly_consumption_by_meter')


def api_meters(request):
    return get_from_dashboard(metric='meter_info')


def api_meter_consumption(request):
    meter_number = request.GET.get("meter_number")

    return get_from_dashboard(metric='meter_hourly_consumption', params=f'&meter_number={meter_number}')
