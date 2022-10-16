from django.urls import path

from city_dashboard import views


urlpatterns = [
    # pages
    path('', views.home, name='home'),
    path('details', views.activity_details, name='activity'),
    path('list', views.list_meters, name='list'),

    # api
    path('api/meters/', views.api_meters, name='api-meters'),
    path('api/alerts/', views.api_alerts, name='api-alerts'),
    path('api/meter-infos/', views.api_meter_infos, name='api-meter-infos'),
    path('api/meters/consumption/', views.api_meter_consumption, name='api-meter-consumption'),
    path('api/consumption/average/', views.api_average_consumption, name='api-average-consumption'),
    path('api/weekly-total/', views.api_weekly_total, name='api-weekly-total'),
    path('api/activities/yearly-change/', views.api_yearly_change_by_activity, name='api-yearly-change-by-activity'),
    path('api/consumption/', views.api_consumption, name='api-consumption'),
]
