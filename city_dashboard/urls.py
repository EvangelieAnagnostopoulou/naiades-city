from django.urls import path

from city_dashboard import views


urlpatterns = [
    # pages
    path('', views.home, name='home'),

    # api
    path('api/meters/', views.api_meters, name='api-meters'),
    path('api/meters/consumption/', views.api_meter_consumption, name='api-meter-consumption'),
    path('api/weekly-total/', views.api_weekly_total, name='api-weekly-total')
]
