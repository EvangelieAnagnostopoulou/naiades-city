import os

from django.conf import settings
from django.db import migrations


def create_default_superuser(_, __):
    from django.apps import apps

    User = apps.get_model('auth', 'User')

    default_username = os.environ.get('DEFAULT_USER_USERNAME', 'naiades_user')
    default_password = os.environ.get('DEFAULT_USER_PASSWORD', 'qweasd!@#')

    user = User.objects.filter(username=default_username).first()

    # create if not exists
    if not user:
        user = User(username=default_username)
        user.set_password(default_password)

    # turn to super user
    user.is_staff = user.is_superuser = True
    user.save()


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(create_default_superuser, reverse_code=lambda _, __: None),
    ]
