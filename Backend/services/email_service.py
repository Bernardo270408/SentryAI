import smtplib
from email.mime.text import MIMEText
import os
import random
import logging

logger = logging.getLogger(__name__)


def generate_verification_code():
    """Gera um código numérico de 6 dígitos."""
    return str(random.randint(100000, 999999))


def send_verification_email(to_email, code):
    """
    Envia o e-mail de verificação.
    Requer as variáveis de ambiente SMTP_USER, SMTP_PASSWORD, SMTP_SERVER, SMTP_PORT.
    """
    sender = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    server_host = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    server_port = int(os.getenv("SMTP_PORT", 587))

    # Se não houver configuração de e-mail, apenas loga o código
    if not sender or not password:
        logger.warning(
            f"SMTP não configurado. Código de verificação para {to_email}: {code}"
        )
        print(f"--- DEBUG EMAIL ---\nTo: {to_email}\nCode: {code}\n-------------------")
        return True

    msg = MIMEText(
        f"Olá,\n\nSeu código de verificação para o SentryAI é:\n\n{code}\n\nEste código expira em 15 minutos.\n\nAtenciosamente,\nEquipe SentryAI"
    )
    msg["Subject"] = "Verifique sua conta SentryAI"
    msg["From"] = sender
    msg["To"] = to_email

    try:
        server = smtplib.SMTP(server_host, server_port)
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, [to_email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        logger.error(f"Erro ao enviar email: {e}")
        return False
