from django.urls import path

from city_dashboard import views


urlpatterns = [
    # pages
    path('', views.home, name='home'),
]
