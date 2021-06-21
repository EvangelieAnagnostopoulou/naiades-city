from django.contrib.auth import logout as logout_fn
from django.shortcuts import redirect
from django.urls import reverse

from project.settings import LOGIN_REDIRECT_URL


def home_redirect(request):
    return redirect(LOGIN_REDIRECT_URL)


def logout(request):
    # clear session
    logout_fn(request)

    return redirect(reverse('login'))
