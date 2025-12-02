import json
import os

DEFAULTS_PATH = "data/defaults.json"

defaults = {}


def save_defaults():
    """Salva o dicionário defaults no arquivo JSON."""
    os.makedirs(os.path.dirname(DEFAULTS_PATH), exist_ok=True)
    try:
        with open(DEFAULTS_PATH, "w") as f:
            json.dump(defaults, f, indent=4)
    except Exception as e:
        print(f"Erro ao salvar defaults: {e}")


def load_defaults():
    """Carrega defaults do arquivo JSON, sobrescrevendo os valores padrão."""
    global defaults
    if os.path.exists(DEFAULTS_PATH):
        try:
            with open(DEFAULTS_PATH, "r") as f:
                loaded = json.load(f)
                if isinstance(loaded, dict):
                    defaults.update(loaded)
                else:
                    print("Arquivo de defaults inválido, usando valores padrões.")
        except json.JSONDecodeError:
            print("Arquivo JSON inválido, usando defaults padrões.")
        except Exception as e:
            print(f"Erro ao carregar defaults: {e}")
    else:
        print(f"{DEFAULTS_PATH} não existe, usando defaults padrões.")
