import requests
from django.http import JsonResponse
from django.shortcuts import render

from city_dashboard.lists import ACTIVITY_TYPES
from project.settings import NAIADES_API, URL_PREFIX, FIXED_DATE


def home(request):
    return render(request, 'home.html', {
        'URL_PREFIX': URL_PREFIX,
        'ACTIVITY_TYPES': ACTIVITY_TYPES,
    })


def activity_details(request):
    _id = request.GET.get('id')

    # define params
    params = {
        'URL_PREFIX': URL_PREFIX,
        'ACTIVITY_TYPES': ACTIVITY_TYPES,
        'FIXED_DATE': FIXED_DATE,
    }

    try:
        title = [a[1] for a in ACTIVITY_TYPES if a[0] == _id][0]

        params.update({
            "activity": _id,
            "title": title,
        })
    except IndexError:

        # either use name with meter number,
        # or just the meter number if name is not available
        if request.GET.get("name"):
            title = f"{request.GET['name']} (Meter {_id})"
        else:
            title = f'Meter {_id}'

        params.update({
            "meter_number": _id,
            "title": title,
        })

    # render
    return render(request, 'activity-details.html', params)


def list_meters(request):
    q = request.GET.get('q')
    activity = request.GET.get('activity')

    return render(request, 'list.html', {
        'URL_PREFIX': URL_PREFIX,
        'q': q,
        'activity': activity,
    })


def get_from_dashboard(metric, endpoint='measurements/data', params=None, transform_fn=None):
    response = requests.\
        get(f"{NAIADES_API}/{endpoint}?metric={metric}{params or ''}").\
        json()

    if transform_fn:
        response["data"] = transform_fn(response["data"])

    return JsonResponse(response)


def api_weekly_total(request):
    return get_from_dashboard(metric='weekly_consumption_by_meter')


def api_consumption(request):
    params = ''

    for param in ["activity", "days", "days_offset", "id"]:
        if request.GET.get(param):
            params += f'&{param}={request.GET[param]}'

    return get_from_dashboard(metric='consumption', params=params)


def api_meters(request):
    return get_from_dashboard(metric='meter_info')


def api_alerts(request):
    return JsonResponse(requests.
        get(f"{NAIADES_API}/device-alerts").
        json()
    )


def api_meter_consumption(request):
    meter_number = request.GET.get("meter_number")

    return get_from_dashboard(metric='meter_daily_consumption', params=f'&meter_number={meter_number}')


def api_average_consumption(request):
    params = ''
    if request.GET.get("activity"):
        params = f'&activity={request.GET["activity"]}'

    return get_from_dashboard(metric='avg_daily_consumption', params=params)


def api_meter_infos(request):
    params = ''

    for param in ["activity", "q"]:
        if request.GET.get(param):
            params = f'&{param}={request.GET[param]}'

    return get_from_dashboard(metric='', endpoint='meters', params=params)


def api_yearly_change_by_activity(request):
    return get_from_dashboard(
        metric='yearly_change_by_activity',
        transform_fn=lambda data: [
            item
            for item in data
            if (item.get("name") or "").strip() not in [
                "Conductividad 1-Pozo Muelle Poniente",
                "Nivel pozo  - Muelle de Poniente",
                "DFM-Test-001"
            ]
        ],
    )
