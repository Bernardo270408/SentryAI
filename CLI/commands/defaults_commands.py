import defaults


def get(key, **kwargs):
    if key in defaults.defaults:
        return defaults.defaults[key]
    else:
        return None


def getall(**kwargs):
    return defaults.defaults


def set_key(key, value, **kwargs):
    try:
        defaults.defaults[key] = value
        return defaults.defaults[key]
    except Exception as e:
        return e


def set_all(value, **kwargs):
    try:
        for key in defaults.defaults.keys:
            defaults.defaults[key] = value
        return defaults.defaults
    except Exception as e:
        return e


def unset(key, **kwargs):
    try:
        defaults.defaults.pop(key)
        return f"{key} unsetted"
    except Exception as e:
        return e


def unsetall(**kwargs):
    try:
        defaults = {}
        return "defaults reseted"
    except Exception as e:
        return e
