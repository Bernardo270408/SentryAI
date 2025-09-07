import shlex
from commands import user_commands
from commands import auth_commands
from commands import defaults_commands
from defaults import defaults

def breakdown_command(command: str):
    tokens = shlex.split(command)

    if len(tokens) < 2:
        raise ValueError("Invalid command: must have at least command")

    if tokens[0] != "sentry":
        raise ValueError("Command must start with 'sentry'")

    command_name = tokens[1]
    subcommand = None
    args = defaults.copy()
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


def main():

    RUNNING = True

    while RUNNING:
        user_input = input("(sentry) ")
        action = breakdown_command(user_input)
        bash = ""

        print("> Just a second...")
        match action["command"]:

            case "user":
                match action["subcommand"]:
                    case "-create":
                        bash = user_commands.create(**action["args"])
                    case "-get":
                        bash = user_commands.get(**action["args"])
                    case "-getall":
                        bash = user_commands.getall(**action["args"])
                    case "-update":
                        bash = user_commands.update(**action["args"])
                    case "-delete":
                        bash = user_commands.delete(**action["args"])
                    case _:
                        bash = f"Unknown subcommand for user: {action['subcommand']}"

            case "auth":
    
                match action["subcommand"]:
                    case "-login":
            
                        bash = auth_commands.login(**action["args"])
                        
                    case "-logout":
                        bash = auth_commands.logout(**action["args"])
                    case "-gettoken":
                        bash = auth_commands.gettoken(**action["args"])
                    case _:
                        bash = f"Unknown subcommand for auth: {action['subcommand']}"

            case "default" | "defaults":
                match action["subcommand"]:
                    case "-get":
                        bash = defaults_commands.get(**action["args"])
                    case "-getall":
                        bash = defaults_commands.getall(**action["args"])
                    case "-set":
                        bash = defaults_commands.set_key(**action["args"])
                    case "-setall":
                        bash = defaults_commands.set_all(**action["args"])
                    case "-unset":
                        bash = defaults_commands.unset(**action["args"])
                    case "-unsetall":
                        bash = defaults_commands.unsetall(**action["args"])

            case "check":
                from commands.sentry_commands import check
                check()

            case "exit" | "quit" | "q":
                from commands.sentry_commands import quit
                quit()
                RUNNING = False
            
            case _:
                print(f"Unknown command: {action}")
        print(">", bash)

main()