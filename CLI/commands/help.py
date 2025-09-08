"""
SentryAI Command Line Interface

Usage:
    sentry [command] -[subcommand] [arguments] [options]

Examples:

Authentication:
    sentry auth -login email='test@mail' password='1234'
    > Token generated
    > Token will automatically apply as default in operations
    > Do you want to use this user_id as default to the next operations? (y/n): n
    > Login successful

Chat creation:
    sentry chat -create name='My first chat'
    > Chat created successfully
    > Do you want to use this chat_id as default to the next operations? (y/n): y

User message creation:
    sentry message -create content='Why is the sky blue?'
    > User message created successfully
    > Do you want to call the AI to respond? (y/n): y
    > AI message created successfully
    > Model 'deepseek-r1:1.5b' said:
    > "The sky appears blue to human observers because of the way Earth's atmosphere scatters sunlight. When sunlight enters the atmosphere, it is made up of different colors, each with its own wavelength. Blue light has a shorter wavelength and is scattered in all directions by the gases and particles in the atmosphere. This scattering causes the sky to appear blue when we look up during the day."

Tips:
    - You can provide other params such as user_id=x or token=x.
    - A default value is generally used if no explicit param is given.
    - Sending extra data will not cause errors (it will simply be ignored).
    - All default params are sent exactly as typed.
    - Developers: You can safely send all defaults without breaking anything.
    - If you type '-y' or '-n' after the last argument, it will answer 'yes' or 'no' to all questions.

------------------------------------------------------------
Commands:
------------------------------------------------------------

auth
    -login      Logs in, generates a token and sets it as default.
                Requires: email, password
    -logout     Removes the JWT token from defaults.
                Takes nothing.
    -gettoken   Prints the current token from defaults.
                Takes nothing.

chat
    -create     Creates a chat object on DB and sets default chat_id.
                Requires: name
                Optional: user_id, token
    -get        Gets an existing chat by id.
                Requires: chat_id, token
    -getbyuser  Gets all chats from a specific user.
                Requires: user_id, token
    -getall     Gets all chats.
                Requires: token
    -update     Updates an existing chat.
                Requires: chat_id, token
    -delete     Deletes an existing chat.
                Requires: chat_id, token
    -open       Sets a chat_id as default.
                Requires: chat_id
    -quit       Unsets the default chat_id.
                Takes nothing.

user
    -create     Creates a user on DB.
                Requires: name, email, password
                Optional: extra_data
    -get        Gets an existing user by id.
                Requires: user_id
    -getall     Gets all users.
                Takes nothing.
    -update     Updates an existing user.
                Requires: user_id, token
    -delete     Deletes an existing user.
                Requires: user_id, token
    -open       Sets a user_id as default.
                Requires: user_id
    -quit       Unsets the default user_id.
                Takes nothing.

message
    -create     Creates a user message on DB.
                Requires: user_id, chat_id, content, token
    -get        Gets a user message by id.
                Requires: user_message_id, token
    -getall     Gets all messages.
                Requires: token
    -getbyuser  Gets all messages from a user.
                Requires: user_id, token
    -getbychat  Gets all messages from a chat.
                Requires: chat_id, token
    -update     Updates a user message.
                Requires: user_message_id, token
    -delete     Deletes a user message.
                Requires: user_message_id, token
    -open       Sets a user_message_id as default.
                Requires: user_message_id
    -quit       Unsets the default user_message_id.
                Takes nothing.

message_ai
    -create             Generates an AI response and saves it on DB.
                        Requires: user_id, chat_id, model, token
    -get                Gets an AI message by id.
                        Requires: ai_message_id, token
    -getall             Gets all AI messages.
                        Requires: token
    -getbychat          Gets all AI messages from a chat.
                        Requires: chat_id, token
    -getbymodel         Gets all AI messages from a model.
                        Requires: model_name, token
    -getbychatandmodel  Gets AI messages by chat_id and model.
                        Requires: chat_id, model_name, token
    -update             Updates an AI message.
                        Requires: ai_message_id, token
    -delete             Deletes an AI message.
                        Requires: ai_message_id, token
    -open               Sets an AI message_id as default.
                        Requires: ai_message_id
    -quit               Unsets the default ai_message_id.
                        Takes nothing.

quit
    Exits the program.

default
    -get        Gets a default value by key.
                Requires: key
    -getall     Gets all default values.
                Takes nothing.
    -set        Sets a value as default.
                Requires: key, value
    -setall     Sets all values as default (mostly useless).
                Requires: value
    -unset      Unsets a default value.
                Requires: key
    -unsetall   Clears all defaults.
                Takes nothing.


Regular keys for defaults:
    auto-create-AI-message   If true, every user message created
                             will automatically generate an AI message
                             in the same chat. [bool]
    user_id                  Default user_id for operations. [int]
    chat_id                  Default chat_id for operations. [int]
    user_message_id          Default user_message_id for operations. [int]
    ai_message_id            Default ai_message_id for operations. [int]
    token                    Default token for operations. [string]
    model                    Default model used for AI message creation. [string]


Note:
    You can set any key, but only the above are used by the program.
    Keys are case-sensitive.

help
    -[command]  Shows help for a specific command.
    -all        Shows help for all commands.

"""