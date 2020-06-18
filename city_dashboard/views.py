import requests
from django.http import JsonResponse
from django.shortcuts import render

from city_dashboard.lists import ACTIVITY_TYPES
from project.settings import NAIADES_API, URL_PREFIX


def home(request):
    return render(request, 'home.html', {
        'URL_PREFIX': URL_PREFIX,
        'ACTIVITY_TYPES': ACTIVITY_TYPES,
    })


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


def api_average_consumption(request):
    params = ''
    if request.GET.get("activity"):
        params = f'&activity={request.GET["activity"]}'

    return get_from_dashboard(metric='avg_daily_consumption', params=params)
