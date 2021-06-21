"""Project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""

from django.urls import path, include

import django.contrib.auth.views as auth_views

from django.contrib import admin
from project.settings import URL_PREFIX
from project import views


urlpatterns = [
    # django admin
    path(f'{URL_PREFIX}admin/', admin.site.urls),

    # auth
    path(f'{URL_PREFIX}login/', auth_views.login, name='login'),
    path(f'{URL_PREFIX}logout/', views.logout, name='logout'),

    # KeyRock
    path(f'{URL_PREFIX}', include('keyrock.urls')),

    # city dashboard
    path(f'{URL_PREFIX}', include('city_dashboard.urls')),
]
