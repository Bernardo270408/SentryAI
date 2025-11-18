import shlex
import defaults
from commands import user_commands, auth_commands, defaults_commands,sentry_commands, chat_commands, message_commands, message_ai_commands, help_commands, rating_commands
import os
import sys
import socket
import getpass

def get_prompt():
    """Retorna o prompt formatado de acordo com o SO."""
    current_path = str(os.path.abspath(''))

    if sys.platform.startswith('win'):
        return f"\033[92m(SentryAI) \033[0mCLI \033[34m{current_path}\033[0m> "
    else:
        username = getpass.getuser()
        hostname = socket.gethostname()
        return f"(sentryai)\033[92m\033[1m {username}:{hostname}\033[0m\033[1m: \033[34m{current_path}\033[0m$ "


def read_user_input():
    """Lê o input do usuário com prompt customizado."""
    return input(get_prompt())


def process_action(action):
    """Processa o dicionário `action` e retorna o resultado (bash)."""
    bash = ""
    try:
        match action["command"]:
            case "user":
                bash = handle_user(action)
            case "auth":
                bash = handle_auth(action)
            case "default" | "defaults":
                bash = handle_defaults(action)
            case "chat" | "chats":
                bash = handle_chat(action)
            case "message" | "messages":
                bash = handle_message(action)
            case "message_ai" | "messageai" | "ai_message" | "aimessage" | "ai-message" | "message-ai":
                bash = handle_message_ai(action)
            case "rating" | "ratings":
                bash = handle_rating(action)
            case "check":
                from commands.sentry_commands import check
                check()
            case "exit" | "quit" | "q":
                from commands.sentry_commands import quit
                quit()
                return None, False
            case "help" | "h" | "?":
                bash = help_commands.get_help(action["subcommand"])
            case "run":
                bash = "Application is already running"
            case _:
                bash = warn(f"Unknown command: {action['command']}")
    except Exception as e:
        print(warn(f"An error occurred while processing command: {e}"))
    
    return bash, True


def warn(msg):
    return f"\033[33m> WARNING: {msg}\033[0m"


def handle_user(action):
    match action["subcommand"]:
        case "-create": return user_commands.create(**action["args"])
        case "-get": return user_commands.get(**action["args"])
        case "-getbyemail": return user_commands.getbyemail(**action["args"])
        case "-getall": return user_commands.getall(**action["args"])
        case "-update": return user_commands.update(**action["args"])
        case "-delete": return user_commands.delete(**action["args"])
        case _: return warn(f"Unknown subcommand for user: {action['subcommand']}")


def handle_auth(action):
    match action["subcommand"]:
        case "-login": return auth_commands.login(**action["args"])
        case "-logout": return auth_commands.logout(**action["args"])
        case "-gettoken": return auth_commands.gettoken(**action["args"])
        case _: return warn(f"Unknown subcommand for auth: {action['subcommand']}")


def handle_defaults(action):
    match action["subcommand"]:
        case "-get": return defaults_commands.get(**action["args"])
        case "-getall": return defaults_commands.getall(**action["args"])
        case "-set": return defaults_commands.set_key(**action["args"])
        case "-setall": return defaults_commands.set_all(**action["args"])
        case "-unset": return defaults_commands.unset(**action["args"])
        case "-unsetall": return defaults_commands.unsetall(**action["args"])
        case _: return warn(f"Unknown subcommand for defaults: {action['subcommand']}")


def handle_chat(action):
    match action["subcommand"]:
        case "-create": return chat_commands.create(**action["args"])
        case "-get": return chat_commands.get(**action["args"])
        case "-getall": return chat_commands.getall(**action["args"])
        case "-getbyuser": return chat_commands.getbyuser(**action["args"])
        case "-update": return chat_commands.update(**action["args"])
        case "-delete": return chat_commands.delete(**action["args"])
        case "-open": return chat_commands.open(**action["args"])
        case "-quit" | "close": return chat_commands.quit(**action["args"]) 
        case _: return warn(f"Unknown subcommand for chats: {action['subcommand']}")


def handle_message(action):
    match action["subcommand"]:
        case "-create": return message_commands.create(**action["args"])
        case "-get": return message_commands.get(**action["args"])
        case "-getall": return message_commands.getall(**action["args"])
        case "-getbyuser": return message_commands.getbyuser(**action["args"])
        case "-getbychat": return message_commands.getbychat(**action["args"])   
        case "-update": return message_commands.update(**action["args"])
        case "-delete": return message_commands.delete(**action["args"])
        case "-open": return message_commands.open(**action["args"])
        case "-quit" | "close": return message_commands.quit(**action["args"])
        case _: return warn(f"Unknown subcommand for messages: {action['subcommand']}")


def handle_message_ai(action):
    match action["subcommand"]:
        case "-create": return message_ai_commands.create(**action["args"])
        case "-get": return message_ai_commands.get(**action["args"])
        case "-getall": return message_ai_commands.getall(**action["args"])
        case "-getbymodel": return message_ai_commands.getbymodel(**action["args"])
        case "-getbychat": return message_ai_commands.getbychat(**action["args"])
        case "-getbychatandmodel": return message_ai_commands.getbychatandmodel(**action["args"])
        case "-update": return message_ai_commands.update(**action["args"])
        case "-delete": return message_ai_commands.delete(**action["args"])
        case "-open": return message_ai_commands.open(**action["args"])
        case "-quit" | "close": return message_ai_commands.quit(**action["args"])
        case _: return warn(f"Unknown subcommand for message AI: {action['subcommand']}")

def handle_rating(action):
    match action["subcommand"]:
        case "-create": return rating_commands.create(**action["args"])
        case "-get": return rating_commands.get(**action["args"])
        case "-getall": return rating_commands.getall(**action["args"])
        case "-getbyuser": return rating_commands.getbyuser(**action["args"])
        case "-getbychat": return rating_commands.getbychat(**action["args"])   
        case "-update": return rating_commands.update(**action["args"])
        case "-delete": return rating_commands.delete(**action["args"])
        case "-open": return rating_commands.open(**action["args"])
        case "-quit" | "close": return rating_commands.quit(**action["args"])
        case _: return warn(f"Unknown subcommand for ratings: {action['subcommand']}")


def main():
    RUNNING = True
    sentry_commands.check()

    while RUNNING:
        user_input = read_user_input()
        defaults.load_defaults()

        try:
            action = breakdown_command(user_input)
        except Exception as e:
            print(warn(f"An error occurred while processing command: {e}"))
            continue
        
        if action["command"] is None:
            continue
        print("> Just a second...")
        bash, RUNNING = process_action(action)

        try:
            defaults.save_defaults()
        except Exception as e:
            bash = (bash or "") + "\nErro ao salvar defaults: " + str(e)
        
        if bash:
            print(">", bash)

def breakdown_command(command: str):
    tokens = shlex.split(command)

    if len(tokens) == 0:
        return {
        "command": None,
        "subcommand": None,
        "args": None,
        "options": None
        }

    if len(tokens) < 2:
        raise ValueError("Invalid command: commands must have at least a command")

    if tokens[0] != "sentry":
        raise ValueError("You are already using SentryAI on this terminal. Commands must start with 'sentry'.")

    command_name = tokens[1]
    subcommand = None
    args = defaults.defaults.copy()
    options = []

    i = 2
    if i < len(tokens):
        candidate = tokens[i]
        if candidate.startswith("-") and len(candidate) > 2:  
            # ex: -login, -create → subcommand
            subcommand = candidate
            i += 1

    for token in tokens[i:]:
        if "=" in token:
            key, value = token.split("=", 1)
            args[key] = value
        elif token.startswith("-"):
            if len(token) == 2:  
                # ex: -y, -n → option
                options.append(token)
            else:
                # se escapar algo tipo -weird → trata como option também
                options.append(token)
        else:
            options.append(token)

    
    
    for arg in args:
        
        args[arg] = str(args[arg])

        if args[arg].lower() == "true":
            args[arg] = True
        elif args[arg].lower() == "false":
            args[arg] = False

        if args[arg].isdigit():
            args[arg] = int(args[arg])

        if arg == "password":
            args[arg] = str(args[arg])

    return {
        "command": command_name,
        "subcommand": subcommand,
        "args": args,
        "options": options
    }


if __name__ == "__main__":
    main()
