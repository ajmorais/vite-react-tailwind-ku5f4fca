export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3tdBvWpwYa2P7F8WrsRlVF9qYPS93YHKHbkK2YpWWL2wBcs-bIqDpdoSLiOQ5cGHALg/exec";

export const LOGO_URL = "https://lh3.googleusercontent.com/d/1opR-emCqYIhNUlt8-tOspVGQPQbwKfqi";

export const PLANILHA_EFETIVO_URL = "https://docs.google.com/spreadsheets/d/1BadMt7OMYLqaKFRgsgQJFYI4JGRhVdNSnq_5N9DPFGU/gviz/tq?tqx=out:json";

export const DECLARACAO_SEM_ALTERACAO = "Declaro para os devidos fins que recebi a viatura/equipamento SEM ALTERAÇÕES. Declaro ainda que realizei a devida conferência, procedendo à verificação minuciosa do estado geral, condições de uso, níveis de fluidos e funcionamento (quando aplicável), dos equipamentos obrigatórios e operacionais (rádio, GPS, armamentos, munições, algemas, coletes), bem como documentação e limpeza. Assumo total responsabilidade pelos materiais sob minha cautela durante o período de serviço.";

export const CIDADES_SERVICO = ['SOBRAL', 'FORQUILHA', 'GROAÍRAS', 'CARIRÉ', 'MUCAMBO', 'GRAÇA', 'PACUJÁ', 'MASSAPÊ', 'SANTANA DO ACARAÚ', 'MERUOCA', 'ALCÂNTARAS', 'SENADOR SÁ', 'COREAÚ', 'FRECHEIRINHA', 'OUTRA'];

export const OPMS = ['1ªCIA DO 3ºBPM', '2ªCIA DO 3ºBPM', '3ªCIA DO 3ºBPM', '4ªCIA DO 3ºBPM', 'OUTRA'];

export const OPMS_VTR = ['3ºBPM', '1ªCIA DO 3ºBPM', '2ªCIA DO 3ºBPM', '3ªCIA DO 3ºBPM', '4ªCIA DO 3ºBPM', 'CEDIDA'];

export const MODALIDADES = [
  'VIATURA(POG)', 
  'VIATURA(FORÇA TÁTICA)', 
  'VIATURA(PROATIVO)', 
  'VIATURA(DESTACAMENTO)', 
  'MOTOPATRULHAMENTO', 
  'POSTO FIXO', 
  'A PÉ',
  'VIATURA(REFORÇO)',
  'SUPERVISÃO'
];

export const CATEGORIAS_MATERIAL = ['Armamento', 'Munição', 'Equipamento (Colete)', 'Acessórios'];

export const CHECKLIST_CATEGORIES_VTR = {
  'Exterior e Lataria': ['Para-choque Dianteiro', 'Para-choque Traseiro', 'Portas Lado Direito', 'Portas Lado Esquerdo', 'Capô', 'Porta-malas', 'Teto', 'Pintura/Adesivos', 'Retrovisores', 'Estribo'],
  'Vidros': ['Para-brisa', 'Vidros Laterais Direitos', 'Vidros Laterais Esquerdos', 'Vidro Traseiro'],
  'Iluminação e Sinalização': ['Farol Baixo', 'Farol Alto', 'Lanternas Traseiras', 'Setas', 'Luz de Freio', 'Sirene', 'Giroflex/Sinalizador'],
  'Pneus e Equipamentos': ['Pneu Dianteiro Direito', 'Pneu Dianteiro Esquerdo', 'Pneu Traseiro Direito', 'Pneu Traseiro Esquerdo', 'Estepe (Step)', 'Calotas', 'Chave de Roda', 'Macaco', 'Triângulo'],
  'Interior e Cabine': ['Bancos Dianteiros', 'Bancos Traseiros', 'Cintos de Segurança', 'Painel de Instrumentos', 'Ar Condicionado', 'Botões dos Vidros', 'Rádio Comunicador', 'Extintor', 'Tapetes', 'Limpeza Interna'],
  'Mecânica Básica': ['Bateria', 'Nível de Óleo', 'Nível de Água do Radiador', 'Freios', 'Motor (Ruídos/Vazamentos)']
};

export const CHECKLIST_CATEGORIES_MOTO = {
  'Estrutura e Carenagem': ['Carenagem Frontal', 'Carenagem Lateral', 'Retrovisores', 'Banco', 'Baú/Bauleto'],
  'Iluminação e Sinalização': ['Farol', 'Lanterna Traseira', 'Setas', 'Luz de Freio', 'Sirene', 'Giroflex'],
  'Pneus e Suspensão': ['Pneu Dianteiro', 'Pneu Traseiro', 'Rodas', 'Amortecedores Dianteiros', 'Amortecedor Traseiro'],
  'Mecânica e Fluidos': ['Bateria', 'Nível de Óleo', 'Freio Dianteiro', 'Freio Traseiro', 'Transmissão (Corrente/Correia)', 'Motor (Ruídos/Vazamentos)'],
  'Equipamentos de Segurança': ['Capacetes', 'Rádio Comunicador']
};

export const POSTOS_GRADUACOES = ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST', 'ASP OFICIAL', '2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL'];

export const TURNOS = ['A', 'B', '24HRS', '48HRS'];

export const TURNO_DURATION_RULES = {
  A: [6, 7, 8, 9, 10, 11, 12],
  B: [6, 7, 8, 9, 10, 11, 12],
  '24HRS': [24],
  '48HRS': [48]
};

export const TIPOS_SERVICO = ['ORDINÁRIO', 'DRSO','REFORÇO'];

export const PROCEDIMENTOS = ['BO', 'TCO', 'APF', 'BOC', 'INQ', 'OUTROS'];

export const NATUREZAS_OCORRENCIA = [
  'HOMICÍDIO DOLOSO (CVLI)',
  'TENTATIVA DE HOMICÍDIO (CVLI)',
  'LATROCÍNIO (CVLI)',
  'LESÃO CORPORAL SEGUIDA DE MORTE (CVLI)',
  'FEMINICÍDIO (CVLI)',
  'INFANTICÍDIO (CVLI)',
  'ROUBO A PESSOA (CVP)',
  'ROUBO DE VEÍCULO (CVP)',
  'ROUBO A RESIDÊNCIA (CVP)',
  'ROUBO A COMÉRCIO (CVP)',
  'ROUBO A COLETIVO (CVP)',
  'ROUBO A INSTITUIÇÃO FINANCEIRA (CVP)',
  'ROUBO DE CARGA (CVP)',
  'TENTATIVA DE ROUBO',
  'FURTO DE VEÍCULO (CVP)',
  'FURTO A RESIDÊNCIA (CVP)',
  'FURTO A COMÉRCIO (CVP)',
  'FURTO A TRANSEUNTE (CVP)',
  'TENTATIVA DE FURTO',
  'TRÁFICO DE DROGAS (ART. 33)',
  'ASSOCIAÇÃO PARA O TRÁFICO',
  'APREENSÃO DE DROGAS (CONSUMO)',
  'PORTE ILEGAL DE ARMA DE FOGO',
  'POSSE ILEGAL DE ARMA DE FOGO',
  'PORTE ILEGAL DE ARMA BRANCA',
  'DISPARO DE ARMA DE FOGO',
  'CUMPRIMENTO DE MANDADO DE PRISÃO',
  'VIOLÊNCIA DOMÉSTICA (LEI MARIA DA PENHA)',
  'VIOLÊNCIA CONTRA A MULHER',
  'ESTUPRO',
  'LESÃO CORPORAL',
  'AMEAÇA',
  'ESTELIONATO / FRAUDE',
  'EXTORSÃO',
  'RECEPTAÇÃO',
  'PERTURBAÇÃO DO SOSSEGO ALHEIO',
  'DESACATO / DESOBEDIÊNCIA / RESISTÊNCIA',
  'MAUS TRATOS A ANIMAIS',
  'CRIME AMBIENTAL',
  'HOMICÍDIO CULPOSO NO TRÂNSITO',
  'ACIDENTE DE TRÂNSITO COM VÍTIMA',
  'ACIDENTE DE TRÂNSITO COM DANOS MATERIAIS',
  'RECUPERAÇÃO DE VEÍCULO ROUBADO/FURTADO',
  'AVERIGUAÇÃO DE PESSOA EM ATITUDE SUSPEITA',
  'OUTROS'
];

export const AREAS_POR_OPM = {
  '1ªCIA DO 3ºBPM': [
    'ÁREA 05: CENTRO, DERBY, PEDRINHAS',
    'ÁREA 06: DOM EXPEDITO, SINHÁ SABÓIA, SANTO ANTÔNIO, COHAB I, COHAB II, DISTRITO INDUSTRIAL, BELCHIOR',
    'ÁREA 07: PARQUE SILVANA, ALTO DA BRASÍLIA, EXPECTATIVA, NOVO RECANTO, BETÂNIA, CORAÇÃO DE JESUS, COLINAS, MORADA DOS VENTOS',
    'ÁREA 08: CAMPO DOS VELHOS, JUNCO',
    'DESTACAMENTO 1: Taperuaba, Aracatiaçu, Caracará, Caioca'
  ],
  '3ªCIA DO 3ºBPM': [
    'MASSAPÊ (SEDE)',
    'SANTANA DO ACARAÚ',
    'MERUOCA',
    'ALCÂNTARAS',
    'SENADOR SÁ',
    'COREAÚ',
    'MORAÚJO'
  ],
  '2ªCIA DO 3ºBPM': [
    'FORQUILHA (SEDE)',
    'CARIRÉ',
    'GROAÍRAS',
    'MUCAMBO',
    'GRAÇA',
    'PACUJÁ',
    'FRECHEIRINHA'
  ],
  '4ªCIA DO 3ºBPM': [
    'ÁREA 01: NOVA CAIÇARA, COHAB III, CACHOEIRO, RENATO PARENTE',
    'ÁREA 02: TERRENOS NOVOS, VILA UNIÃO',
    'ÁREA 03: DOM JOSÉ, PADRE PALHANO, SUMARÉ, SANTA CASA/PINTOR LEMOS/TAMARINDO, EDMUNDO COELHO',
    'ÁREA 04: ALTO DO CRISTO, DOMINGOS OLÍMPIO, PADRE IBIAPINA',
    'DESTACAMENTO 2: Jaibaras, Jordão, Bonfim, Patriarca'
  ]
};

export const ROLES = {
  'operacional': { label: 'OPERACIONAL', weight: 1 },
  'armeiro': { label: 'ARMEIRO', weight: 1 },
  'administrativo': { label: 'ADM P3', weight: 2 },
  'adm_p4': { label: 'ADM P4', weight: 2 },
  'fiscal_policiamento': { label: 'FISCAL DE POLICIAMENTO', weight: 3 },
  'oficial_p4': { label: 'OFICIAL P4', weight: 3 },
  'oficial_p3': { label: 'OFICIAL P3', weight: 3 },
  'oficial': { label: 'OFICIAL', weight: 3 },
  'oficial_superior': { label: 'OFICIAL SUPERIOR', weight: 4 },
  'dev': { label: 'DESENVOLVEDOR', weight: 5 }
};

export const SCREEN_DEFINITIONS = {
  user_check: { label: 'Entrada de Serviço', section: 'Serviço Diário' },
  user_hist: { label: 'Histórico (VTR)', section: 'Serviço Diário' },
  user_area_map: { label: 'Mapa de Áreas', section: 'Serviço Diário' },
  user_ocorrencia: { label: 'Registro de Ocorrência Policial', section: 'Produtividade' },
  user_hist_ocorrencia: { label: 'Histórico de Produtividade', section: 'Produtividade' },
  user_cautela: { label: 'Nova Cautela (Reserva)', section: 'Reserva de Armamento' },
  armeiro_dash: { label: 'Gestão de Reserva', section: 'Reserva de Armamento' },
  admin_dash: { label: 'Panorama Gerencial', section: 'Administração' },
  admin_equipes: { label: 'Equipes em Serviço', section: 'Administração' },
  admin_vtr: { label: 'Frota (Viaturas)', section: 'Administração' },
  admin_users: { label: 'Efetivo (Usuários)', section: 'Administração' },
  dev_dash: { label: 'Painel do Desenvolvedor', section: 'Sistema' }
};

export const DEFAULT_ROLE_PERMISSIONS = {
  operacional: ['user_check', 'user_area_map'],
  armeiro: ['user_check', 'user_area_map'],
  administrativo: ['user_ocorrencia', 'user_hist_ocorrencia', 'user_area_map'],
  adm_p4: ['user_check', 'user_hist', 'user_area_map', 'admin_vtr'],
  fiscal_policiamento: ['user_check', 'user_hist', 'user_area_map', 'user_ocorrencia', 'user_hist_ocorrencia', 'admin_dash', 'admin_equipes', 'admin_vtr', 'admin_users'],
  oficial_p4: ['user_check', 'user_hist', 'user_area_map', 'user_ocorrencia', 'user_hist_ocorrencia', 'admin_dash', 'admin_equipes', 'admin_vtr', 'admin_users'],
  oficial_p3: ['user_check', 'user_hist', 'user_area_map', 'user_ocorrencia', 'user_hist_ocorrencia', 'admin_dash', 'admin_equipes', 'admin_vtr', 'admin_users'],
  oficial: ['user_check', 'user_hist', 'user_area_map', 'user_ocorrencia', 'user_hist_ocorrencia', 'admin_dash', 'admin_equipes', 'admin_vtr', 'admin_users'],
  oficial_superior: ['user_check', 'user_hist', 'user_area_map', 'user_ocorrencia', 'user_hist_ocorrencia', 'admin_dash', 'admin_equipes', 'admin_vtr', 'admin_users'],
  dev: ['user_check', 'user_hist', 'user_area_map', 'user_ocorrencia', 'user_hist_ocorrencia', 'user_cautela', 'armeiro_dash', 'admin_dash', 'admin_equipes', 'admin_vtr', 'admin_users', 'dev_dash']
};

export const MANDATORY_PHOTOS = [
  'Frontal', 'Traseira', 'Lateral Esquerda', 'Lateral Direita',
  'Pneu Dianteiro Direito', 'Pneu Dianteiro Esquerdo',
  'Pneu Traseiro Direito', 'Pneu Traseiro Esquerdo',
  'Estepe', 'Motor', 'Painel', 'Hodômetro'
];

export const VTR_USAGE_STORAGE_KEY = 'pmce_vtr_selector_usage_v3';
