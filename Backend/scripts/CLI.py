#Executes a test command line on powershell
from os import system

"""
Syntax descripytion

'''bash
    sentry [command_name] -[arguments] *[values]=[values]
'''

examples

authentication example
'''bash
    sentry auth -login email='test@mail' password='1234'
'''
'''bash
    Token generated
    Token will automaticaly apply as default in operations
    This user will be used as default in the next operations
    Login went succesfull
'''

'''bash
    sentry chat -create name='teste de chat'
'''
'''bash
    Chat created sucessfully
    This chat will be used as default in the next operations
'''
Tip: You can also set other params like 'user_id=x' or 'token=x'. A default is generally used.
Tip: You can send extra data, it just wont be read. So, if you accidentally send an extra param, it wont break anything.
Tip for the programmer: That means you can send all defaults with no worries
Tip: All default params are sent as it was typed
Commands:
    auth
        -login      # logs you in, generates a token and set default token. [email, password] required 
        -logout     # removes the JWT token  [Takes nothing, it only removes it from defaults]
        -gettoken   # gets the current token [Takes nothing, it only gets it on defaults]
    chat
        -create     # creates an chat object on DB and sets an default chat_id [name, user_id, token]
        -get        # gets an existing chat by own id [chat_id, token]
        -getbyuser  # gets all chat by user_id [user_id, token]
        -getall     # get all chats [token]
        -update     # updates an existing chat [chat_id, token]
        -delete     # deletes an existing chat [chat_id, token]
        -open       # sets an chat_id as default chat_id [chat_id]
        -quit       # unsets the default id [Takes nothing, it only removes it from defaults]

    user
        -create     # creates an chat object on DB
        -get        # gets an existing user by own id
        -getall     # gets all users
        -getbyemail # gets an user by email
        -update     # updates an existing user
        -delete     # deletes an existing user
        -open       # sets an user_id as default user_id
        -quit       # unsets the default id

    message
        -send       # creates an message and calls the AI to respond
        -create     # creates an user message on DB
        -get        # gets an existing user message by own id
        -getall     # gets all messages
        -getbyuser  # gets all user messages
        -getbychat  # gets all user messages by chat_id
        -update     # updates an existing user message
        -delete     # deletes an existing user message
        -open       # sets an user message_id as default user message_id
        -quit       # unsets the default id

    message_ai
        -create             # creates an AI message on DB
        -get                # gets an existing AI message by own id
        -getll              # gets all AI messages
        -getbychat          # gets all AI messages by chat_id
        -getbymodel         # gets all AI messages by model name
        -getbychatandmodel  # gets all AI messages by chat_id and model name
        -update             # updates an existing AI message
        -delete             # deletes an existing AI message
        -open               # sets an AI message_id as default AI message_id
        -quit               # unsets the default id

    default
        -get        # gets a current default value
        -getall     # gets all default values
        -set        # sets a value as default
        -setall     # sets all value as an default (useless, but why not)
        -unset      # unsets a default value
        -unsetall   # unsets all default values

    help
        -[command]  # gets help about a specific command
        -all        # gets all help

"""

