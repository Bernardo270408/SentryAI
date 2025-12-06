import os

# Define o caminho onde os arquivos ficarão
# Ajuste se estiver rodando de dentro da pasta Backend ou da raiz
BASE_DIR = os.path.join("Backend", "data", "laws_txt")

# Garante que a pasta existe
os.makedirs(BASE_DIR, exist_ok=True)

# Dicionário com o Nome do Arquivo -> Conteúdo Rico
# Conteúdo baseado na legislação oficial do Planalto (CLT, CF/88, CDC, CC/2002)
laws_content = {
    "clt.txt": """FONTE: CLT - Consolidação das Leis do Trabalho (Decreto-Lei nº 5.452/1943)

Art. 2º - Considera-se empregador a empresa, individual ou coletiva, que, assumindo os riscos da atividade econômica, admite, assalaria e dirige a prestação pessoal de serviço.

Art. 3º - Considera-se empregado toda pessoa física que prestar serviços de natureza não eventual a empregador, sob a dependência deste e mediante salário.

Art. 58. A duração normal do trabalho, para os empregados em qualquer atividade privada, não excederá de 8 (oito) horas diárias, desde que não seja fixado outro limite.

Art. 59. A duração diária do trabalho poderá ser acrescida de horas extras, em número não excedente de duas, por acordo individual, convenção coletiva ou acordo coletivo de trabalho.
§ 1º A remuneração da hora extra será, pelo menos, 50% (cinquenta por cento) superior à da hora normal.

Art. 477. Na extinção do contrato de trabalho, o empregador deverá proceder à anotação na Carteira de Trabalho e Previdência Social, comunicar a dispensa aos órgãos competentes e realizar o pagamento das verbas rescisórias no prazo e na forma estabelecidos neste artigo.
§ 6o A entrega ao empregado de documentos que comprovem a comunicação da extinção contratual aos órgãos competentes bem como o pagamento dos valores constantes do instrumento de rescisão ou recibo de quitação deverão ser efetuados até dez dias contados a partir do término do contrato.""",

    "constituicao.txt": """FONTE: Constituição da República Federativa do Brasil de 1988

Art. 5º Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade.

Art. 7º São direitos dos trabalhadores urbanos e rurais, além de outros que visem à melhoria de sua condição social:
I - relação de emprego protegida contra despedida arbitrária ou sem justa causa, nos termos de lei complementar, que preverá indenização compensatória, dentre outros direitos;
II - seguro-desemprego, em caso de desemprego involuntário;
III - fundo de garantia do tempo de serviço;
IV - salário mínimo, fixado em lei, nacionalmente unificado;
XIII - duração do trabalho normal não superior a oito horas diárias e quarenta e quatro semanais, facultada a compensação de horários e a redução da jornada, mediante acordo ou convenção coletiva de trabalho;""",

    "cdc.txt": """FONTE: CDC - Código de Defesa do Consumidor (Lei nº 8.078/1990)

Art. 2° Consumidor é toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final.

Art. 6º São direitos básicos do consumidor:
I - a proteção da vida, saúde e segurança contra os riscos provocados por práticas no fornecimento de produtos e serviços considerados perigosos ou nocivos;
III - a informação adequada e clara sobre os diferentes produtos e serviços, com especificação correta de quantidade, características, composição, qualidade, tributos incidentes e preço, bem como sobre os riscos que apresentem;
VI - a efetiva prevenção e reparação de danos patrimoniais e morais, individuais, coletivos e difusos;

Art. 14. O fornecedor de serviços responde, independentemente da existência de culpa, pela reparação dos danos causados aos consumidores por defeitos relativos à prestação dos serviços, bem como por informações insuficientes ou inadequadas sobre sua fruição e riscos.

Art. 49. O consumidor pode desistir do contrato, no prazo de 7 dias a contar de sua assinatura ou do ato de recebimento do produto ou serviço, sempre que a contratação de fornecimento de produtos e serviços ocorrer fora do estabelecimento comercial, especialmente por telefone ou a domicílio.""",

    "codigo_civil.txt": """FONTE: Código Civil Brasileiro (Lei nº 10.406/2002)

Art. 186. Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito.

Art. 421. A liberdade contratual será exercida nos limites da função social do contrato.

Art. 422. Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa-fé.

Art. 927. Aquele que, por ato ilícito (arts. 186 e 187), causar dano a outrem, fica obrigado a repará-lo.""",

    "maria_da_penha.txt": """FONTE: Lei Maria da Penha (Lei nº 11.340/2006)

Art. 5º Para os efeitos desta Lei, configura violência doméstica e familiar contra a mulher qualquer ação ou omissão baseada no gênero que lhe cause morte, lesão, sofrimento físico, sexual ou psicológico e dano moral ou patrimonial.

Art. 7º São formas de violência doméstica e familiar contra a mulher, entre outras:
I - a violência física, entendida como qualquer conduta que ofenda sua integridade ou saúde corporal;
II - a violência psicológica, entendida como qualquer conduta que lhe cause dano emocional e diminuição da autoestima;
III - a violência sexual;
IV - a violência patrimonial;
V - a violência moral.""",

    "sumulas_tst.txt": """FONTE: Súmulas do Tribunal Superior do Trabalho (TST)

Súmula nº 331 do TST - CONTRATO DE PRESTAÇÃO DE SERVIÇOS. LEGALIDADE
I - A contratação de trabalhadores por empresa interposta é ilegal, formando-se o vínculo diretamente com o tomador dos serviços, salvo no caso de trabalho temporário.

Súmula nº 444 do TST - JORNADA DE TRABALHO. NORMA COLETIVA. LEI. ESCALA DE 12 POR 36. VALIDADE.
É valida, em caráter excepcional, a jornada de doze horas de trabalho por trinta e seis de descanso, prevista em lei ou ajustada exclusivamente mediante acordo coletivo de trabalho ou convenção coletiva de trabalho, assegurada a remuneração em dobro dos feriados trabalhados."""
}

def create_files():
    print(f"--- Iniciando criação de arquivos em: {BASE_DIR} ---")
    
    for filename, content in laws_content.items():
        file_path = os.path.join(BASE_DIR, filename)
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[OK] Criado: {filename}")
        except Exception as e:
            print(f"[ERRO] Falha ao criar {filename}: {e}")

    print("\n--- Concluído! ---")
    print("Agora execute o script de ingestão para processar estes arquivos:")
    print("cd Backend")
    print("python ingest_laws.py")

if __name__ == "__main__":
    create_files()