import requests
import os
import random
from datetime import datetime, timedelta

class JusbrasilService:
    """
    Serviço para buscar modelos de documentos e jurisprudência.
    Nota: A API oficial do JusBrasil requer autenticação OAuth/Token pago.
    Este serviço implementa um Mock robusto para demonstração se não houver chave.
    """
    
    BASE_URL = "https://api.jusbrasil.com.br/api/v1" 

    @staticmethod
    def search_documents(query):
        api_token = os.getenv("JUSBRASIL_API_TOKEN")

        # 1. Se tiver token configurado, tenta a busca real
        if api_token:
            try:
                headers = {"Authorization": f"Bearer {api_token}"}
                response = requests.get(
                    f"{JusbrasilService.BASE_URL}/consulta", 
                    params={"q": query, "kind": "modelos"},
                    headers=headers,
                    timeout=5
                )
                if response.status_code == 200:
                    return response.json()
            except Exception as e:
                print(f"Erro na API Jusbrasil (Real): {e}")

        # 2. Fallback: Retorna dados Mockados (Simulação de Real-Time)
        return JusbrasilService._get_mock_data(query)

    @staticmethod
    def _get_mock_data(query):
        """Retorna uma vasta lista de modelos baseados na query para simular a API"""
        
        # Gerador de datas recentes para parecer "fresco"
        def recent_date(days_ago=0):
            d = datetime.now() - timedelta(days=days_ago)
            return d.strftime("%d/%m/%Y")

        all_docs = [
            # --- TRABALHISTA ---
            {
                "id": "trab_001",
                "title": "Reclamação Trabalhista - Horas Extras e Reflexos",
                "type": "Petição Inicial",
                "source": "Jusbrasil",
                "date": recent_date(2),
                "preview": "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DA VARA DO TRABALHO... Reclamante alega jornada excessiva sem o devido pagamento das horas extraordinárias e seus reflexos em férias, 13º e FGTS...",
                "tags": ["Trabalhista", "CLT", "Horas Extras", "Verbas Rescisórias"],
                "url": "#"
            },
            {
                "id": "trab_002",
                "title": "Contestação Trabalhista - Inexistência de Vínculo",
                "type": "Petição - Defesa",
                "source": "Jusbrasil",
                "date": recent_date(5),
                "preview": "Contestação alegando preliminar de mérito e, no mérito, a inexistência de vínculo empregatício, caracterizando-se a relação como prestação de serviços autônomos...",
                "tags": ["Trabalhista", "Contestação", "Vínculo Empregatício", "PJ"],
                "url": "#"
            },
            {
                "id": "trab_003",
                "title": "Pedido de Rescisão Indireta do Contrato de Trabalho",
                "type": "Petição Inicial",
                "source": "TRT-2",
                "date": recent_date(10),
                "preview": "Ação postulando a Rescisão Indireta com base no art. 483, 'd', da CLT, devido ao não recolhimento de FGTS e atrasos constantes de salário...",
                "tags": ["Trabalhista", "Rescisão Indireta", "FGTS", "Atraso Salarial"],
                "url": "#"
            },
            {
                "id": "trab_004",
                "title": "Recurso Ordinário Trabalhista",
                "type": "Recurso",
                "source": "TST",
                "date": recent_date(12),
                "preview": "Interposição de Recurso Ordinário visando a reforma da sentença que indeferiu o adicional de insalubridade, com base em laudo pericial divergente...",
                "tags": ["Trabalhista", "Recurso", "Insalubridade"],
                "url": "#"
            },

            # --- CIVIL & CONSUMIDOR ---
            {
                "id": "civ_001",
                "title": "Ação de Indenização por Danos Morais - Negativação Indevida",
                "type": "Petição Cível",
                "source": "Jusbrasil",
                "date": recent_date(1),
                "preview": "Ação contra instituição financeira por inscrição indevida em órgãos de proteção ao crédito (SPC/Serasa) de dívida já quitada. Pedido de liminar...",
                "tags": ["Cível", "Consumidor", "Danos Morais", "Nome Sujo"],
                "url": "#"
            },
            {
                "id": "civ_002",
                "title": "Ação de Usucapião Extraordinária",
                "type": "Petição Cível",
                "source": "TJSP",
                "date": recent_date(20),
                "preview": "Requerimento de declaração de propriedade de imóvel urbano, com base na posse mansa, pacífica e ininterrupta por mais de 15 anos (Art. 1.238 CC)...",
                "tags": ["Cível", "Imobiliário", "Usucapião", "Propriedade"],
                "url": "#"
            },
            {
                "id": "civ_003",
                "title": "Ação de Despejo por Falta de Pagamento c/c Cobrança",
                "type": "Petição Cível",
                "source": "Jusbrasil",
                "date": recent_date(8),
                "preview": "Locador move ação em face do Locatário inadimplente há 3 meses. Pedido de desocupação liminar e pagamento dos aluguéis e encargos atrasados...",
                "tags": ["Cível", "Imobiliário", "Despejo", "Aluguel"],
                "url": "#"
            },
            {
                "id": "civ_004",
                "title": "Ação Obrigação de Fazer - Plano de Saúde (Cirurgia)",
                "type": "Petição Cível",
                "source": "TJ-RJ",
                "date": recent_date(3),
                "preview": "Pedido de Tutela de Urgência para obrigar plano de saúde a custear cirurgia e materiais negados indevidamente. Aplicação do Código de Defesa do Consumidor...",
                "tags": ["Cível", "Saúde", "Liminar", "Consumidor"],
                "url": "#"
            },
            {
                "id": "civ_005",
                "title": "Ação Indenizatória - Voo Cancelado / Extravio de Bagagem",
                "type": "Petição Cível",
                "source": "JEC",
                "date": recent_date(15),
                "preview": "Ação contra companhia aérea devido a cancelamento injustificado de voo e perda temporária de bagagem. Danos materiais e morais...",
                "tags": ["Consumidor", "Aéreo", "Viagem", "Danos Morais"],
                "url": "#"
            },

            # --- FAMÍLIA & SUCESSÕES ---
            {
                "id": "fam_001",
                "title": "Petição de Divórcio Consensual com Partilha de Bens",
                "type": "Petição Família",
                "source": "Cartório Online",
                "date": recent_date(4),
                "preview": "Minuta de divórcio consensual extrajudicial. Casal sem filhos menores, acordam sobre a partilha do imóvel residencial e veículo...",
                "tags": ["Família", "Divórcio", "Partilha", "Consensual"],
                "url": "#"
            },
            {
                "id": "fam_002",
                "title": "Ação de Alimentos (Pensão Alimentícia)",
                "type": "Petição Inicial",
                "source": "Jusbrasil",
                "date": recent_date(6),
                "preview": "Representante legal do menor pleiteia fixação de alimentos provisórios e definitivos em face do genitor, no patamar de 30% dos rendimentos...",
                "tags": ["Família", "Alimentos", "Pensão", "Menor"],
                "url": "#"
            },
            {
                "id": "fam_003",
                "title": "Ação de Guarda Compartilhada e Regulamentação de Visitas",
                "type": "Petição Família",
                "source": "Jusbrasil",
                "date": recent_date(9),
                "preview": "Genitor requer a regulamentação da guarda compartilhada, visando o melhor interesse da criança, estabelecendo regime de convivência quinzenal...",
                "tags": ["Família", "Guarda", "Visitas", "Filhos"],
                "url": "#"
            },
            {
                "id": "fam_004",
                "title": "Inventário Extrajudicial (Minuta)",
                "type": "Escritura Pública",
                "source": "Cartório",
                "date": recent_date(30),
                "preview": "Minuta para realização de inventário em cartório, com herdeiros maiores e capazes e consenso sobre a divisão do espólio...",
                "tags": ["Família", "Sucessões", "Inventário", "Herança"],
                "url": "#"
            },

            # --- PENAL ---
            {
                "id": "pen_001",
                "title": "Habeas Corpus com Pedido Liminar",
                "type": "Petição Criminal",
                "source": "STJ",
                "date": recent_date(2),
                "preview": "Impetração de HC visando o trancamento da ação penal ou revogação de prisão preventiva por ausência dos requisitos do art. 312 do CPP...",
                "tags": ["Penal", "Habeas Corpus", "Liberdade", "Prisão"],
                "url": "#"
            },
            {
                "id": "pen_002",
                "title": "Queixa-Crime - Calúnia, Injúria e Difamação",
                "type": "Petição Criminal",
                "source": "Jusbrasil",
                "date": recent_date(5),
                "preview": "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ... Querelante oferece QUEIXA-CRIME contra Querelado pela prática de crimes contra a honra em redes sociais (Arts. 138, 139 e 140 CP)...",
                "tags": ["Penal", "Calúnia", "Crimes Contra Honra", "Difamação", "Internet"],
                "url": "#"
            },
            {
                "id": "pen_003",
                "title": "Pedido de Liberdade Provisória",
                "type": "Petição Criminal",
                "source": "TJ-SP",
                "date": recent_date(7),
                "preview": "Defesa requer a concessão de liberdade provisória sem fiança, alegando primariedade, bons antecedentes e residência fixa do réu...",
                "tags": ["Penal", "Liberdade Provisória", "Defesa"],
                "url": "#"
            },
            {
                "id": "pen_004",
                "title": "Resposta à Acusação (Defesa Prévia)",
                "type": "Petição Criminal",
                "source": "Jusbrasil",
                "date": recent_date(11),
                "preview": "Peça defensiva apresentada após a citação, arguindo preliminares de nulidade e requerendo a absolvição sumária do acusado...",
                "tags": ["Penal", "Defesa", "Processo Penal"],
                "url": "#"
            },

            # --- CONTRATOS & EMPRESARIAL ---
            {
                "id": "con_001",
                "title": "Contrato de Prestação de Serviços (PJ/Freelancer)",
                "type": "Contrato",
                "source": "Jusbrasil",
                "date": recent_date(3),
                "preview": "Instrumento particular para contratação de serviços técnicos especializados. Cláusulas de objeto, preço, prazo, confidencialidade e rescisão...",
                "tags": ["Contratos", "PJ", "Serviços", "Civil"],
                "url": "#"
            },
            {
                "id": "con_002",
                "title": "Contrato de Locação de Imóvel Residencial",
                "type": "Contrato",
                "source": "Imobiliário",
                "date": recent_date(14),
                "preview": "Modelo atualizado conforme Lei do Inquilinato. Prevê garantia por caução, prazo de 30 meses e multa rescisória proporcional...",
                "tags": ["Contratos", "Locação", "Imóvel", "Aluguel"],
                "url": "#"
            },
            {
                "id": "con_003",
                "title": "Acordo de Confidencialidade (NDA - Non-Disclosure Agreement)",
                "type": "Contrato",
                "source": "Startups",
                "date": recent_date(22),
                "preview": "Termo para proteção de segredo industrial e informações sensíveis trocadas entre parceiros comerciais ou investidores...",
                "tags": ["Contratos", "Empresarial", "NDA", "Sigilo"],
                "url": "#"
            },
            {
                "id": "con_004",
                "title": "Contrato Social de Sociedade Limitada (Ltda)",
                "type": "Societário",
                "source": "Junta Comercial",
                "date": recent_date(45),
                "preview": "Instrumento de constituição de sociedade empresária limitada, definindo capital social, administração e distribuição de lucros...",
                "tags": ["Empresarial", "Societário", "Abertura de Empresa"],
                "url": "#"
            },
            {
                "id": "con_005",
                "title": "Contrato de Vesting (Opção de Compra de Ações)",
                "type": "Contrato",
                "source": "Startups",
                "date": recent_date(18),
                "preview": "Contrato para colaboradores de startups, garantindo direito de aquisição de participação societária mediante cumprimento de tempo (cliff) e metas...",
                "tags": ["Empresarial", "Startup", "Vesting", "Societário"],
                "url": "#"
            },

            # --- PREVIDENCIÁRIO & ADMINISTRATIVO ---
            {
                "id": "prev_001",
                "title": "Petição Inicial - Aposentadoria por Idade Rural",
                "type": "Petição Previdenciária",
                "source": "Jusbrasil",
                "date": recent_date(13),
                "preview": "Ação contra o INSS visando a concessão de aposentadoria por idade a trabalhador rural (segurado especial), com provas materiais e testemunhais...",
                "tags": ["Previdenciário", "INSS", "Aposentadoria", "Rural"],
                "url": "#"
            },
            {
                "id": "prev_002",
                "title": "Requerimento de BPC/LOAS (Idoso ou Deficiente)",
                "type": "Administrativo",
                "source": "INSS",
                "date": recent_date(8),
                "preview": "Modelo de requerimento administrativo ou judicial para concessão do Benefício de Prestação Continuada para pessoa em situação de vulnerabilidade...",
                "tags": ["Previdenciário", "LOAS", "BPC", "Assistência Social"],
                "url": "#"
            },
            {
                "id": "adm_001",
                "title": "Mandado de Segurança - Concurso Público (Nomeação)",
                "type": "Petição Administrativa",
                "source": "TJ-DF",
                "date": recent_date(25),
                "preview": "Impetração de MS contra ato de autoridade que preteriu candidato aprovado dentro do número de vagas em concurso público...",
                "tags": ["Administrativo", "Concurso", "Mandado de Segurança"],
                "url": "#"
            },
            {
                "id": "adm_002",
                "title": "Defesa Prévia - Multa de Trânsito (Lei Seca/Velocidade)",
                "type": "Administrativo",
                "source": "Detran",
                "date": recent_date(10),
                "preview": "Recurso administrativo contra autuação de trânsito, alegando falhas formais no auto de infração ou aferição irregular do equipamento...",
                "tags": ["Administrativo", "Trânsito", "Multa", "CNH"],
                "url": "#"
            }
        ]
        
        # Lógica de Filtro
        if not query:
            # Retorna uma amostra aleatória na home para não ficar sempre igual
            random.shuffle(all_docs)
            return all_docs[:12]
        
        query = query.lower()
        
        # Filtra por Título, Tags, Tipo ou ID
        filtered = [
            d for d in all_docs 
            if query in d['title'].lower() 
            or any(query in tag.lower() for tag in d['tags'])
            or query in d['type'].lower()
            or query in d['preview'].lower()
        ]
        
        return filtered