from defaults import defaults


def get(key,**kwargs):
    return defaults[key]

def getall(**kwargs):
    return defaults

def set_key(key, value,**kwargs):
    try:
        defaults[key] = value
        return defaults[key]
    except Exception as e:
        return e
def set_all(value,**kwargs):
    try:
        for key in defaults.keys:
            defaults[key] = value
        return defaults
    except Exception as e:
        return e
    
def unset(key,**kwargs):
    try:
        defaults.pop(key)
        return f"{key} unsetted"
    except Exception as e:
        return e

def unsetall(**kwargs):
    try:
        defaults = {}
        return "defaults reseted"
    except Exception as e:
        return e