from project.settings.staging import *

DEBUG = os.environ.get("DEBUG_UNSAFE") == "ON"
