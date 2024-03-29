from project.settings.staging import *

DEBUG = os.environ.get("DEBUG_UNSAFE") == "ON"

STATICFILES_STORAGE = 'whitenoise.django.GzipManifestStaticFilesStorage'
WHITENOISE_MANIFEST_STRICT = False
