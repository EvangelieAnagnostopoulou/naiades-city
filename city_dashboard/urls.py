from django.urls import path

from city_dashboard import views


urlpatterns = [
    # pages
    path('', views.home, name='home'),
    path('details', views.activity_details, name='activity'),
    path('list', views.list, name='list'),

    # api
    path('api/meters/', views.api_meters, name='api-meters'),
    path('api/meters/consumption/', views.api_meter_consumption, name='api-meter-consumption'),
    path('api/consumption/average/', views.api_average_consumption, name='api-average-consumption'),
    path('api/weekly-total/', views.api_weekly_total, name='api-weekly-total'),
    path('api/consumption/', views.api_consumption, name='api-consumption'),
]
