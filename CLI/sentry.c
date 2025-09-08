#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Compile me and execute me on the terminal
// If you are on windows, dont use powershell

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Uso: sentry run\n");
        return 1;
    }

    if (strcmp(argv[1], "run") == 0) {
        int result;

        #ifdef _WIN32
            // Windows → chama python padrão
            result = system("python3 app.py");
        #else
            // Linux → chama python3
            result = system("python3 app.py");
        #endif

        if (result != 0) {
            printf("Erro ao executar app.py. Verifique se o Python está instalado.\n");
            return 1;
        }
    } else {
        printf("Comando desconhecido: %s\n", argv[1]);
        printf("Digite: sentry run\n");
        return 1;
    }

    return 0;
}
