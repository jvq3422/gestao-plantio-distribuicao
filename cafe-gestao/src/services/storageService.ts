import {
  Plot,
  SoilAnalysis,
  HarvestRecord,
  RecommendationPlan,
  Produto,
  PontoVenda,
  PrecoNegociado,
  SaidaVenda,
  ParametrosAgronomicos,
  CommercialFertilizer,
} from '../types';
import { CATALOGO_FERTILIZANTES } from './fertilizerDatabase';

// ==========================================
// ESTADOS INICIAIS LIMPOS (SEM EXEMPLOS HARDCODADOS)
// ==========================================
export const INITIAL_PLOTS: Plot[] = [];
export const INITIAL_ANALYSES: SoilAnalysis[] = [];
export const INITIAL_HARVESTS: HarvestRecord[] = [];
export const INITIAL_PRODUTOS: Produto[] = [];
export const INITIAL_PONTOS_VENDA: PontoVenda[] = [];
export const INITIAL_PRECOS_NEGOCIADOS: PrecoNegociado[] = [];
export const INITIAL_SAIDAS: SaidaVenda[] = [];

// ==========================================
// PARÂMETROS AGRONÔMICOS DINÂMICOS (SEM HARDCODING)
// ==========================================
export const DEFAULT_PARAMETROS: ParametrosAgronomicos = {
  vDesejado: 65, // Meta padrão de 65% V (ajustável no painel)
  prntPadrao: 85,
  kgNPorSaca: 3.0, // 3.0 kg N/sc para equilíbrio nutricional e vigor da planta
  focoAltaQualidade: true,
  focoCafesNobres90Plus: true,
};

export class StorageService {
  private static KEY_PLOTS = 'recreio_clean_plots_v1';
  private static KEY_ANALYSES = 'recreio_clean_analyses_v1';
  private static KEY_HARVESTS = 'recreio_clean_harvests_v1';
  private static KEY_PLANS = 'recreio_clean_plans_v1';
  private static KEY_PARAMETROS = 'recreio_clean_parametros_v1';
  private static KEY_FERTILIZANTES = 'recreio_clean_fertilizantes_v1';
  private static KEY_PRODUTOS = 'recreio_clean_produtos_v1';
  private static KEY_PDVS = 'recreio_clean_pdvs_v1';
  private static KEY_PRECOS = 'recreio_clean_precos_v1';
  private static KEY_SAIDAS = 'recreio_clean_saidas_v1';

  private static syncHook: ((collection: string, entity: any) => void) | null = null;

  static setSyncHook(hook: ((collection: string, entity: any) => void) | null): void {
    this.syncHook = hook;
  }

  // --- AGRONOMIA & PARÂMETROS DINÂMICOS ---
  static getParametros(): ParametrosAgronomicos {
    const raw = localStorage.getItem(this.KEY_PARAMETROS);
    if (!raw) {
      this.saveParametros(DEFAULT_PARAMETROS);
      return DEFAULT_PARAMETROS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PARAMETROS;
    }
  }

  static saveParametros(params: ParametrosAgronomicos): void {
    localStorage.setItem(this.KEY_PARAMETROS, JSON.stringify(params));
  }

  static getFertilizantes(): CommercialFertilizer[] {
    const raw = localStorage.getItem(this.KEY_FERTILIZANTES);
    if (!raw) {
      this.saveFertilizantes(CATALOGO_FERTILIZANTES);
      return CATALOGO_FERTILIZANTES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return CATALOGO_FERTILIZANTES;
    }
  }

  static saveFertilizantes(fert: CommercialFertilizer[]): void {
    localStorage.setItem(this.KEY_FERTILIZANTES, JSON.stringify(fert));
  }

  static getPlots(): Plot[] {
    const raw = localStorage.getItem(this.KEY_PLOTS);
    if (!raw) {
      this.savePlots(INITIAL_PLOTS);
      return INITIAL_PLOTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PLOTS;
    }
  }

  static savePlots(plots: Plot[]): void {
    localStorage.setItem(this.KEY_PLOTS, JSON.stringify(plots));
    plots.forEach((p) => this.syncHook?.('recreio_plots', p));
  }

  static getAnalyses(): SoilAnalysis[] {
    const raw = localStorage.getItem(this.KEY_ANALYSES);
    if (!raw) {
      this.saveAnalyses(INITIAL_ANALYSES);
      return INITIAL_ANALYSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ANALYSES;
    }
  }

  static saveAnalyses(analyses: SoilAnalysis[]): void {
    localStorage.setItem(this.KEY_ANALYSES, JSON.stringify(analyses));
    analyses.forEach((a) => this.syncHook?.('recreio_analyses', a));
  }

  static getHarvests(): HarvestRecord[] {
    const raw = localStorage.getItem(this.KEY_HARVESTS);
    if (!raw) {
      this.saveHarvests(INITIAL_HARVESTS);
      return INITIAL_HARVESTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_HARVESTS;
    }
  }

  static saveHarvests(harvests: HarvestRecord[]): void {
    localStorage.setItem(this.KEY_HARVESTS, JSON.stringify(harvests));
    harvests.forEach((h) => this.syncHook?.('recreio_harvests', h));
  }

  static getPlans(): RecommendationPlan[] {
    const raw = localStorage.getItem(this.KEY_PLANS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static savePlan(plan: RecommendationPlan): void {
    const plans = this.getPlans().filter((p) => p.id !== plan.id);
    plans.unshift(plan);
    localStorage.setItem(this.KEY_PLANS, JSON.stringify(plans));
  }

  // --- COMERCIALIZAÇÃO, PRODUTOS & VENDAS ---
  static getProdutos(): Produto[] {
    const raw = localStorage.getItem(this.KEY_PRODUTOS);
    if (!raw) {
      this.saveProdutos(INITIAL_PRODUTOS);
      return INITIAL_PRODUTOS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRODUTOS;
    }
  }

  static saveProdutos(produtos: Produto[]): void {
    localStorage.setItem(this.KEY_PRODUTOS, JSON.stringify(produtos));
    produtos.forEach((p) => this.syncHook?.('recreio_produtos', p));
  }

  static getPontosVenda(): PontoVenda[] {
    const raw = localStorage.getItem(this.KEY_PDVS);
    if (!raw) {
      this.savePontosVenda(INITIAL_PONTOS_VENDA);
      return INITIAL_PONTOS_VENDA;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PONTOS_VENDA;
    }
  }

  static savePontosVenda(pdvs: PontoVenda[]): void {
    localStorage.setItem(this.KEY_PDVS, JSON.stringify(pdvs));
    pdvs.forEach((p) => this.syncHook?.('recreio_pdvs', p));
  }

  static getPrecosNegociados(): PrecoNegociado[] {
    const raw = localStorage.getItem(this.KEY_PRECOS);
    if (!raw) {
      this.savePrecosNegociados(INITIAL_PRECOS_NEGOCIADOS);
      return INITIAL_PRECOS_NEGOCIADOS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRECOS_NEGOCIADOS;
    }
  }

  static savePrecosNegociados(precos: PrecoNegociado[]): void {
    localStorage.setItem(this.KEY_PRECOS, JSON.stringify(precos));
    precos.forEach((pr) =>
      this.syncHook?.('recreio_precos', { ...pr, id: `${pr.pontoVendaId}_${pr.produtoId}` })
    );
  }

  static getPrecoParaPdv(pontoVendaId: string, produtoId: string): number {
    const precos = this.getPrecosNegociados();
    const encontrado = precos.find(
      (p) => p.pontoVendaId === pontoVendaId && p.produtoId === produtoId
    );
    if (encontrado) return encontrado.preco;

    const produto = this.getProdutos().find((p) => p.id === produtoId);
    return produto?.precoPadrao ?? 0;
  }

  static setPrecoNegociado(pontoVendaId: string, produtoId: string, preco: number): void {
    const precos = this.getPrecosNegociados().filter(
      (p) => !(p.pontoVendaId === pontoVendaId && p.produtoId === produtoId)
    );
    precos.push({ pontoVendaId, produtoId, preco });
    this.savePrecosNegociados(precos);
  }

  static getSaidas(): SaidaVenda[] {
    const raw = localStorage.getItem(this.KEY_SAIDAS);
    if (!raw) {
      this.saveSaidas(INITIAL_SAIDAS);
      return INITIAL_SAIDAS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SAIDAS;
    }
  }

  static saveSaidas(saidas: SaidaVenda[]): void {
    localStorage.setItem(this.KEY_SAIDAS, JSON.stringify(saidas));
    saidas.forEach((s) => this.syncHook?.('recreio_saidas', s));
  }

  static addSaida(saida: SaidaVenda): void {
    const saidas = this.getSaidas();
    saidas.unshift(saida);
    this.saveSaidas(saidas);

    // Abater estoque dos produtos vendidos
    const produtos = this.getProdutos();
    saida.itens.forEach((item) => {
      const prod = produtos.find((p) => p.id === item.produtoId);
      if (prod) {
        prod.estoqueDisponivel = Math.max(0, prod.estoqueDisponivel - item.quantidade);
      }
    });
    this.saveProdutos(produtos);
  }

  static atualizarStatusPagamento(saidaId: string, novoStatus: SaidaVenda['statusPagamento']): void {
    const saidas = this.getSaidas();
    const saida = saidas.find((s) => s.id === saidaId);
    if (saida) {
      saida.statusPagamento = novoStatus;
      if (novoStatus === 'Recebido') {
        saida.dataRecebimento = new Date().toISOString().split('T')[0];
      }
      this.saveSaidas(saidas);
    }
  }

  static clearAllData(): void {
    this.savePlots([]);
    this.saveAnalyses([]);
    this.saveHarvests([]);
    this.saveParametros(DEFAULT_PARAMETROS);
    this.saveFertilizantes(CATALOGO_FERTILIZANTES);
    this.saveProdutos([]);
    this.savePontosVenda([]);
    this.savePrecosNegociados([]);
    this.saveSaidas([]);
    localStorage.removeItem(this.KEY_PLANS);

    // Limpar quaisquer chaves legadas de versões anteriores
    const legacyKeys = [
      'recreio_plots_v2',
      'recreio_analyses_v2',
      'recreio_harvests_v2',
      'recreio_plans_v2',
      'recreio_parametros_v2',
      'recreio_fertilizantes_v2',
      'recreio_produtos_v2',
      'recreio_pdvs_v2',
      'recreio_precos_v2',
      'recreio_saidas_v2',
      'coffee_plots_v1',
      'coffee_analyses_v1',
      'coffee_harvests_v1',
      'coffee_plans_v1',
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  }

  static resetToDefault(): void {
    this.clearAllData();
  }
}
