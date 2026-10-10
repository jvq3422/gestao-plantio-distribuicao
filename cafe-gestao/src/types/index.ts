export type SoilDepth = '0-20cm' | '20-40cm';

export type CulturaTalhao = 'Café' | 'Uva';

export type VariedadeCafe = 
  | 'Catuaí Vermelho 144'
  | 'Catuaí Amarelo 2SL'
  | 'Bourbon Amarelo'
  | 'Arara'
  | 'Topázio MG 1190'
  | 'Mundo Novo IAC 379-19'
  | 'Catucaí 2SL'
  | 'Geisha'
  | 'Acauã'
  | 'Siriema'
  | 'Paraíso MG 419-1'
  | 'Outro Café';

export type VariedadeUva =
  | 'Syrah (Shiraz)'
  | 'Cabernet Sauvignon'
  | 'Sauvignon Blanc'
  | 'Chardonnay'
  | 'Tempranillo'
  | 'Malbec'
  | 'Merlot'
  | 'Pinot Noir'
  | 'Touriga Nacional'
  | 'Cabernet Franc'
  | 'Petit Verdot'
  | 'Viognier'
  | 'Isabel'
  | 'Niágara Rosada'
  | 'BRS Vitória'
  | 'Outra Uva';

export type SistemaConducaoUva = 'Espaldeira' | 'Latada / Pérgola' | 'Ypsilon / Lira' | 'Livre / Outro';

export type ExposicaoSolar = 'Face Norte (Mais Sol)' | 'Face Sul (Mais Ameno)' | 'Face Leste' | 'Face Oeste';

export type CoberturaSolo = 
  | 'Braquiária nas entrelinhas'
  | 'Mato roçado / palhada espontânea'
  | 'Leguminosa adubação verde (Crotalária/Guandu)'
  | 'Solo limpo / herbicida';

export type BienalidadeCiclo = 'Carga Alta' | 'Carga Baixa / Descanso' | 'Pós-Safra Recorde (Esgotamento)' | 'Ano Normal';

export interface Plot {
  id: string;
  nome: string;
  areaHa: number;
  cultura?: CulturaTalhao; // 'Café' (padrão) ou 'Uva'
  variedade: string; // VariedadeCafe | VariedadeUva | string
  sistemaConducao?: SistemaConducaoUva;
  portaEnxerto?: string;
  altitudeM: number;
  exposicaoSolar: ExposicaoSolar;
  espacamentoRuaM: number;
  espacamentoPlantaM: number;
  anoPlantio: number;
  coberturaSolo: CoberturaSolo;
  observacoesTerroir?: string;
  irrigado: boolean;
}

export interface SoilAnalysis {
  id: string;
  plotId: string;
  dataColeta: string;
  profundidade: SoilDepth;
  laboratorio: string;
  ph: number; // CaCl2
  mo: number; // Matéria orgânica g/dm³
  p: number; // Fósforo mg/dm³ (Mehlich-1)
  k: number; // Potássio cmolc/dm³ (ou mg/dm³)
  kIsMgDm3?: boolean;
  ca: number; // Cálcio cmolc/dm³
  mg: number; // Magnésio cmolc/dm³
  al: number; // Alumínio trocável cmolc/dm³
  h_al: number; // Acidez potencial H+Al cmolc/dm³
  argilaPercent: number; // Textura: argila %
  // Micronutrientes (mg/dm³)
  s?: number;
  b?: number;
  zn?: number;
  cu?: number;
  mn?: number;
  fe?: number;
  // Calculados
  sb?: number;
  ctcEfetiva?: number;
  ctcTotal?: number;
  vPercent?: number;
  mPercent?: number;
  relacaoCaMg?: number;
}

export interface CommercialFertilizer {
  id: string;
  nome: string;
  marca?: string; // Marca comercial (ex: Yara, Mosaic, Fertipar, Heringer, EuroChem, Biofértil, Própria)
  tipo: 'simples' | 'formulado' | 'organico' | 'foliar' | 'corretivo';
  teorN: number; // % N
  teorP2O5: number; // % P2O5
  teorK2O: number; // % K2O
  teorS?: number; // % S
  teorCa?: number; // % Ca
  teorMg?: number; // % Mg
  teorB?: number; // % B
  teorZn?: number; // % Zn
  teorCu?: number;
  teorMn?: number;
  precoSaco50kg?: number; // R$
  unidade: 'saco50kg' | 'saco25kg' | 'tonelada' | 'kg' | 'litro';
  descricao: string;
}

// ==========================================
// REGISTROS DE MANEJO: ADUBAÇÃO & PROFILAXIAS
// ==========================================

export type ModoAplicacaoAdubo = 
  | 'A lanço na saia'
  | 'Linha de plantio'
  | 'Fertirrigação'
  | 'Foliar'
  | 'Drench / No pé'
  | 'Incorporado';

export interface RegistroAdubacao {
  id: string;
  plotId: string;
  data: string; // YYYY-MM-DD
  aduboNome: string;
  marca?: string;
  quantidadeKg: number;
  doseKgHa?: number;
  doseGPorPlanta?: number;
  modoAplicacao: ModoAplicacaoAdubo;
  estagioFenologico?: string;
  responsavel?: string;
  custoTotal?: number;
  observacoes?: string;
}

export type TipoTratamentoFitossanitario = 
  | 'Fungicida'
  | 'Inseticida'
  | 'Acaricida'
  | 'Biológico / Calda'
  | 'Herbicida'
  | 'Foliar Nutricional';

export interface RegistroProfilaxia {
  id: string;
  plotId: string;
  data: string; // YYYY-MM-DD
  tipoTratamento: TipoTratamentoFitossanitario;
  alvoPragaDoenca: string; // ex: Ferrugem, Oídio, Míldio, Broca, Bicho-mineiro
  produtoComercial: string;
  dosagem: string; // ex: 1.5 L/ha, 200 mL/100L
  volumeCaldaLHa?: number;
  periodoCarenciaDias?: number;
  responsavel?: string;
  observacoes?: string;
}

export interface HarvestRecord {
  id: string;
  plotId: string;
  safra: string; // ex: "2024/2025"
  produtividadeSacasHa: number; // para café: scs/ha; para uva: t/ha (quando cultura == 'Uva')
  sacasTotais: number;
  pontosSCA?: number; // Qualidade de bebida (fóruns/especiais ou brix da uva)
  perfilSensorial?: string;
  adubacaoRealN: number; // kg/ha aplicados
  adubacaoRealP2O5: number; // kg/ha aplicados
  adubacaoRealK2O: number; // kg/ha aplicados
  observacoes: string;
}

export interface CalagemResult {
  necessario: boolean;
  vAtual: number;
  vDesejado: number;
  ctcTotal: number;
  prnt: number;
  doseTotalHa: number; // t/ha se fosse em área total
  fatorFaixa: number; // proporção da faixa tratada (ex: 0.45)
  doseFaixaHa: number; // t/ha aplicando na faixa da saia
  totalKgTalhao: number;
  tipoCalcario: 'Dolomítico (Mg > 12%)' | 'Magnesiano (Mg 5-12%)' | 'Calcítico (Mg < 5%)';
  relacaoCaMg: number;
  diagnostico: string;
}

export interface GessagemResult {
  necessario: boolean;
  mPercentAtual?: number;
  caSubsuperficie?: number;
  doseKgHa: number;
  totalKgTalhao: number;
  motivo: string;
}

export interface ExigenciaNutricional {
  n_kg_ha: number;
  p2o5_kg_ha: number;
  k2o_kg_ha: number;
  s_kg_ha: number;
  b_kg_ha: number;
  zn_kg_ha: number;
  detalheN: string;
  detalheP: string;
  detalheK: string;
}

export interface AduboItemCalculado {
  fertilizanteId: string;
  nome: string;
  doseKgHa: number;
  totalKgTalhao: number;
  sacas50kg: number;
  gramasPorPlanta: number;
  gramasPorMetroLinear: number;
  custoTotalEstimado: number;
  forneceN: number;
  forneceP2O5: number;
  forneceK2O: number;
}

export interface ParcelaCronograma {
  numero: number;
  epoca: string;
  faseFenologica: string;
  mesReferencia: string;
  percentualN: number;
  percentualK: number;
  adubos: {
    nome: string;
    doseKgHa: number;
    gramasPorPlanta: number;
    gramasPorMetro: number;
    totalKgTalhao: number;
  }[];
  condicoesClimaticasEAlerta: string;
}

export interface FeedbackHistoricoAjuste {
  ajustePercentN: number;
  ajustePercentK: number;
  ajustePercentP: number;
  motivoHistorico: string;
  safraAnteriorColhida?: number;
  tendenciaFertilidadeSolo: string;
}

export interface RecommendationPlan {
  id: string;
  plotId: string;
  safra: string;
  dataCalculo: string;
  cultura?: CulturaTalhao;
  metaSacasHa: number; // Para café: scs/ha; Para uva: t/ha
  unidadeMeta?: 'scs/ha' | 't/ha';
  cicloBienalidade: BienalidadeCiclo;
  densidadePlantasHa: number;
  calagem: CalagemResult;
  gessagem: GessagemResult;
  exigenciaBruta: ExigenciaNutricional;
  descontoOrganico: {
    temPalhaCafe: boolean;
    palhaTonsHa: number;
    k2oAbatido: number;
    temBraquiariaCobertura: boolean;
    beneficioUmidadeEBiomassa: string;
  };
  ajusteHistorico: FeedbackHistoricoAjuste;
  exigenciaLiquida: ExigenciaNutricional;
  opcaoRecomendada: {
    modo: 'MateriaPrimaSimples' | 'NPK_Formulado';
    adubos: AduboItemCalculado[];
    custoTotalTalhao: number;
  };
  cronogramaParcelamento: ParcelaCronograma[];
  observacoesAgronomicas: string[];
  parametrosUtilizados?: ParametrosAgronomicos;
}

export interface ParametrosAgronomicos {
  vDesejado: number; // Meta de V% (60 a 70%, 65% para cafés de alta densidade, 70% para uvas)
  prntPadrao: number; // PRNT do calcário
  kgNPorSaca: number; // kg N por saca esperada (padrão 3.0 no café) ou kg N por tonelada na uva (padrão 6.5)
  fatorFaixaCustom?: number; // Permite forçar fator de faixa se desejado
  focoAltaQualidade?: boolean; // Ativa ajustes de brix e densidade
  focoCafesNobres90Plus?: boolean; // Compatibilidade
}

// ==========================================
// MÓDULO DE DISTRIBUIÇÃO, PRODUTOS & VENDAS
// ==========================================

export type CategoriaProduto = 'cafe' | 'tomate' | 'uva' | 'vinho';
export type UnidadeComercial = 'pacote' | 'bandeja' | 'caixa' | 'kg' | 'garrafa';

export interface Produto {
  id: string;
  nome: string;
  categoria: CategoriaProduto;
  subtipo: string;
  unidade: UnidadeComercial;
  precoPadrao: number;
  estoqueDisponivel: number;
  talhaoOrigemId?: string;
  descricao: string;
}

export type TipoPontoVenda = 
  | 'Cafeteria Especial'
  | 'Empório / Mercearia Gourmet'
  | 'Supermercado Local'
  | 'Restaurante / Pizzaria'
  | 'Feira do Produtor'
  | 'Venda Direta / Porteira';

export type CondicaoPagamento = 'À Vista' | '15 dias' | '30 dias' | 'Consignado';

export interface PontoVenda {
  id: string;
  nome: string;
  tipo: TipoPontoVenda;
  cidade: string;
  contato: string;
  telefone: string;
  condicaoPagamento: CondicaoPagamento;
}

export interface PrecoNegociado {
  pontoVendaId: string;
  produtoId: string;
  preco: number;
}

export interface ItemSaidaVenda {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export type StatusPagamento = 'Recebido' | 'A Receber';
export type FormaPagamento = 'PIX' | 'Boleto' | 'Dinheiro' | 'Transferência Bancária';

export interface SaidaVenda {
  id: string;
  numeroControle: string;
  data: string; // YYYY-MM-DD
  pontoVendaId: string;
  itens: ItemSaidaVenda[];
  valorTotal: number;
  statusPagamento: StatusPagamento;
  formaPagamento: FormaPagamento;
  dataRecebimento?: string;
  dataVencimento?: string;
  observacoes?: string;
}
