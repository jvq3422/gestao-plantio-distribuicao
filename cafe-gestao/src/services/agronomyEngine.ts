import {
  SoilAnalysis,
  Plot,
  CalagemResult,
  GessagemResult,
  ExigenciaNutricional,
  AduboItemCalculado,
  ParcelaCronograma,
  RecommendationPlan,
  FeedbackHistoricoAjuste,
  CommercialFertilizer,
  ParametrosAgronomicos,
} from '../types';
import { CATALOGO_FERTILIZANTES } from './fertilizerDatabase';

/**
 * Calcula os índices de fertilidade da análise de solo:
 * SB, CTC efetiva (t), CTC a pH 7 (T), V%, m%, e relação Ca:Mg.
 */
export function calcularIndicesSolo(analise: Partial<SoilAnalysis>): Partial<SoilAnalysis> {
  const ca = Number(analise.ca || 0);
  const mg = Number(analise.mg || 0);
  let k = Number(analise.k || 0);
  
  // Se K foi informado em mg/dm³, converter para cmolc/dm³ (dividir por 391)
  if (analise.kIsMgDm3 && k > 1.5) {
    k = k / 391;
  }
  
  const al = Number(analise.al || 0);
  const h_al = Number(analise.h_al || 0);

  const sb = ca + mg + k;
  const ctcEfetiva = sb + al;
  const ctcTotal = sb + h_al;
  const vPercent = ctcTotal > 0 ? (sb / ctcTotal) * 100 : 0;
  const mPercent = ctcEfetiva > 0 ? (al / ctcEfetiva) * 100 : 0;
  const relacaoCaMg = mg > 0 ? ca / mg : ca > 0 ? 99 : 0;

  return {
    ...analise,
    k,
    sb: Number(sb.toFixed(2)),
    ctcEfetiva: Number(ctcEfetiva.toFixed(2)),
    ctcTotal: Number(ctcTotal.toFixed(2)),
    vPercent: Number(vPercent.toFixed(1)),
    mPercent: Number(mPercent.toFixed(1)),
    relacaoCaMg: Number(relacaoCaMg.toFixed(2)),
  };
}

/**
 * Calcula a necessidade de Calagem para o cafeeiro ou videira
 * Café: Elevação de V% para 60-65%.
 * Uva / Vinhedo: Elevação de V% para 70% (a videira é sensível a alumínio e exige boa saturação por bases).
 */
export function calcularCalagem(
  analise: SoilAnalysis,
  plot: Plot,
  vDesejadoParam?: number,
  prnt = 85
): CalagemResult {
  const isUva = plot.cultura === 'Uva';
  const vDesejado = vDesejadoParam ?? (isUva ? 70 : 60);

  const soloCalc = calcularIndicesSolo(analise);
  const vAtual = soloCalc.vPercent ?? 0;
  const ctcTotal = soloCalc.ctcTotal ?? 0;
  const relacaoCaMg = soloCalc.relacaoCaMg ?? 3;

  const diferencaV = vDesejado - vAtual;

  if (diferencaV <= 0) {
    return {
      necessario: false,
      vAtual,
      vDesejado,
      ctcTotal,
      prnt,
      doseTotalHa: 0,
      fatorFaixa: isUva ? 0.50 : 0.45,
      doseFaixaHa: 0,
      totalKgTalhao: 0,
      tipoCalcario: 'Dolomítico (Mg > 12%)',
      relacaoCaMg,
      diagnostico: `Saturação por bases adequada (${vAtual.toFixed(1)}% >= ${vDesejado}%). Não há necessidade de calagem nesta safra de ${isUva ? 'uva' : 'café'}.`,
    };
  }

  // NC em área total (t/ha) = ((V2 - V1) * T) / PRNT
  const doseTotalHa = Number((((diferencaV * ctcTotal) / prnt)).toFixed(2));

  // Fator de faixa na linha de plantio / camalhão
  const espacamentoRua = plot.espacamentoRuaM || (isUva ? 2.8 : 3.5);
  const faixaMetros = isUva ? 1.3 : 1.5;
  const fatorFaixa = Math.min(0.55, Math.max(0.35, faixaMetros / espacamentoRua));
  const doseFaixaHa = Number((doseTotalHa * fatorFaixa).toFixed(2));
  const totalKgTalhao = Math.round(doseFaixaHa * 1000 * plot.areaHa);

  // Tipo de calcário
  let tipoCalcario: CalagemResult['tipoCalcario'] = 'Dolomítico (Mg > 12%)';
  let diagnosticoTipo = isUva
    ? 'Recomendado calcário dolomítico para suprir Magnésio e evitar dessecamento do ráquis da uva.'
    : 'Recomendado calcário dolomítico para suprir Magnésio na fotossíntese do cafeeiro.';

  if (relacaoCaMg > 4.5) {
    tipoCalcario = 'Dolomítico (Mg > 12%)';
    diagnosticoTipo = `Relação Ca:Mg elevada (${relacaoCaMg.toFixed(1)}:1). Uso obrigatório de calcário Dolomítico para repor Magnésio e equilibrar o solo.`;
  } else if (relacaoCaMg < 2.0) {
    tipoCalcario = 'Calcítico (Mg < 5%)';
    diagnosticoTipo = `Relação Ca:Mg baixa (${relacaoCaMg.toFixed(1)}:1). Recomendado calcário Calcítico para fornecer Cálcio estrutural.`;
  } else {
    tipoCalcario = 'Magnesiano (Mg 5-12%)';
    diagnosticoTipo = `Relação Ca:Mg equilibrada (${relacaoCaMg.toFixed(1)}:1). Pode ser usado calcário magnesiano ou dolomítico.`;
  }

  return {
    necessario: true,
    vAtual,
    vDesejado,
    ctcTotal,
    prnt,
    doseTotalHa,
    fatorFaixa,
    doseFaixaHa,
    totalKgTalhao,
    tipoCalcario,
    relacaoCaMg,
    diagnostico: `V% atual (${vAtual.toFixed(1)}%) abaixo da meta de ${vDesejado}%. Em área total: ${doseTotalHa} t/ha. Com aplicação na faixa de plantio (${Math.round(fatorFaixa * 100)}% da área), aplicar ${doseFaixaHa} t/ha. ${diagnosticoTipo}`,
  };
}

/**
 * Calcula necessidade de Gessagem (desenvolvimento radicular em profundidade)
 */
export function calcularGessagem(
  analise0_20: SoilAnalysis,
  analise20_40?: SoilAnalysis,
  argilaInformada?: number
): GessagemResult {
  const argila = argilaInformada || analise20_40?.argilaPercent || analise0_20.argilaPercent || 35;
  
  if (analise20_40) {
    const calcSub = calcularIndicesSolo(analise20_40);
    const mSub = calcSub.mPercent ?? 0;
    const caSub = calcSub.ca ?? 1;

    // Critério agronômico: m% > 20% ou Ca < 0.4 cmolc/dm³ na camada 20-40cm
    if (mSub > 20 || caSub < 0.4) {
      // Dose = 50 * Argila(%) kg/ha
      const doseKgHa = Math.round(50 * argila);
      return {
        necessario: true,
        mPercentAtual: mSub,
        caSubsuperficie: caSub,
        doseKgHa,
        totalKgTalhao: 0,
        motivo: `Camada 20-40cm com ${mSub > 20 ? `alta toxidez de Alumínio (m=${mSub.toFixed(1)}%)` : `deficiência severa de Cálcio (${caSub.toFixed(2)} cmolc/dm³)`}. O gesso carrega Cálcio em profundidade e neutraliza o Alumínio para as raízes explorarem água em períodos de seca.`,
      };
    }
  }

  return {
    necessario: false,
    doseKgHa: 0,
    totalKgTalhao: 0,
    motivo: 'Condições da camada subsuperficial adequadas ou sem evidência de toxidez de alumínio.',
  };
}

/**
 * Calcula a exigência nutricional bruta (N, P2O5, K2O, S, B, Zn)
 * Para Café: meta em sacas/ha.
 * Para Uva: meta em toneladas/ha (t/ha).
 */
export function calcularExigenciaNutricional(
  metaProducao: number,
  analiseSolo: SoilAnalysis,
  plot: Plot,
  historicoAjuste?: FeedbackHistoricoAjuste,
  parametros?: ParametrosAgronomicos
): ExigenciaNutricional {
  const isUva = plot.cultura === 'Uva';
  const pSolo = analiseSolo.p || 10;
  const kSolo = analiseSolo.k || 0.25;

  if (isUva) {
    // ==========================================
    // CÁLCULO ESPECÍFICO PARA VIDEIRA (UVA)
    // ==========================================
    // metaProducao = toneladas de uva por hectare (ex: 8 a 18 t/ha)
    const metaTon = metaProducao > 0 ? metaProducao : 12;

    // 1. Nitrogênio: ~6.5 kg N/t (cuidado: N excessivo provoca desavinho e perda de polifenóis/aroma)
    const taxaN = parametros?.kgNPorSaca ?? 6.5;
    let nBase = Math.round(metaTon * taxaN);

    // 2. Fósforo (P2O5): videira tem baixa extração, suprir conforme P no solo
    let p2o5Base = 45;
    let detalheP = '';
    if (pSolo < 10) {
      p2o5Base = Math.max(70, metaTon * 4.5);
      detalheP = `Solo com P baixo (${pSolo} mg/dm³). Dose reforçada para suprir demanda inicial e fixação radicular.`;
    } else if (pSolo < 20) {
      p2o5Base = Math.max(45, metaTon * 3.5);
      detalheP = `Solo com P médio (${pSolo} mg/dm³). Manutenção e reposição de colheita da videira.`;
    } else {
      p2o5Base = 25;
      detalheP = `Solo com P bom (${pSolo} mg/dm³). Dose reduzida de manutenção.`;
    }

    // 3. Potássio (K2O): nutriente mais exportado pelos cachos, vital para °Brix e acidez equilibrada
    let fatorK = 9.5;
    let detalheK = '';
    if (kSolo < 0.15) {
      fatorK = 13.0;
      detalheK = `Solo com K baixo (${kSolo.toFixed(2)} cmolc/dm³). Demanda alta de K2O para evitar maturação deficiente dos cachos.`;
    } else if (kSolo <= 0.35) {
      fatorK = 10.0;
      detalheK = `Solo com K equilibrado (${kSolo.toFixed(2)} cmolc/dm³). Fornecimento padrão para enchimento dos bagos e acúmulo de açúcares (°Brix).`;
    } else {
      fatorK = 7.0;
      detalheK = `Solo com K alto (${kSolo.toFixed(2)} cmolc/dm³). Dose moderada para evitar excesso de potássio no mosto.`;
    }
    let k2oBase = Math.round(metaTon * fatorK);

    let detalheN = `Meta de ${metaTon} t/ha de uva requer ~${taxaN} kg N/t para equilíbrio vegetativo/produtivo sem causar desavinho.`;

    if (historicoAjuste) {
      if (historicoAjuste.ajustePercentN !== 0) {
        nBase = Math.round(nBase * (1 + historicoAjuste.ajustePercentN / 100));
        detalheN += ` Ajuste histórico de ${historicoAjuste.ajustePercentN}%.`;
      }
      if (historicoAjuste.ajustePercentK !== 0) {
        k2oBase = Math.round(k2oBase * (1 + historicoAjuste.ajustePercentK / 100));
      }
    }

    const sBase = Math.round(nBase * 0.20); // ~15-20 kg/ha
    const bBase = 2.0; // Boro essencial para fecundação floral e pegamento de cachos
    const znBase = 2.5; // Zinco para brotação e fotossíntese

    return {
      n_kg_ha: nBase,
      p2o5_kg_ha: Math.round(p2o5Base),
      k2o_kg_ha: k2oBase,
      s_kg_ha: sBase,
      b_kg_ha: bBase,
      zn_kg_ha: znBase,
      detalheN,
      detalheP,
      detalheK,
    };
  }

  // ==========================================
  // CÁLCULO CLÁSSICO PARA CAFEEIRO
  // ==========================================
  const metaSacas = metaProducao > 0 ? metaProducao : 40;

  // 1. Nitrogênio (N): cafeeiro requer suprimento equilibrado (3.0 kg N/sc evita excesso vegetativo)
  const taxaN = parametros?.kgNPorSaca ?? (parametros?.focoAltaQualidade || parametros?.focoCafesNobres90Plus ? 3.0 : 3.2);
  let nBase = metaSacas * taxaN;

  // 2. Fósforo (P2O5): curva em função do teor de P no solo (mg/dm³)
  let p2o5Base = 60;
  let detalheP = '';
  if (pSolo < 10) {
    p2o5Base = Math.max(90, metaSacas * 2.2);
    detalheP = `Solo com P baixo (${pSolo} mg/dm³). Dose reforçada para suprir demanda e fixação.`;
  } else if (pSolo < 20) {
    p2o5Base = Math.max(60, metaSacas * 1.5);
    detalheP = `Solo com P médio (${pSolo} mg/dm³). Dose padrão de reposição produtiva.`;
  } else if (pSolo < 40) {
    p2o5Base = Math.max(30, metaSacas * 0.9);
    detalheP = `Solo com P bom (${pSolo} mg/dm³). Adubação de manutenção moderada.`;
  } else {
    p2o5Base = 20; // Manutenção mínima
    detalheP = `Solo com P muito alto (${pSolo} mg/dm³). Redução drástica recomendada (economia de adubo).`;
  }

  // 3. Potássio (K2O): determinante na granação, densidade e brix dos frutos
  let fatorK = 2.8;
  let detalheK = '';
  if (kSolo < 0.15) {
    fatorK = 3.8;
    detalheK = `Solo deficiente em K (${kSolo.toFixed(2)} cmolc/dm³). Dose intensiva para evitar desfolha e frutos chochos.`;
  } else if (kSolo <= 0.30) {
    fatorK = 2.8;
    detalheK = `Solo com K médio (${kSolo.toFixed(2)} cmolc/dm³). Relação balanceada com a meta de sacas.`;
  } else if (kSolo <= 0.50) {
    fatorK = 2.0;
    detalheK = `Solo com bom suprimento de K (${kSolo.toFixed(2)} cmolc/dm³).`;
  } else {
    fatorK = 1.4;
    detalheK = `Solo com K muito alto (${kSolo.toFixed(2)} cmolc/dm³). Redução para evitar queima salina e bloqueio de Magnésio.`;
  }
  let k2oBase = metaSacas * fatorK;

  // Aplicar ajustes do histórico se existirem
  let detalheN = `Meta de ${metaSacas} scs/ha requer base de ~${taxaN} kg N/sc.`;
  if (historicoAjuste) {
    if (historicoAjuste.ajustePercentN !== 0) {
      nBase = nBase * (1 + historicoAjuste.ajustePercentN / 100);
      detalheN += ` Ajuste histórico de ${historicoAjuste.ajustePercentN > 0 ? '+' : ''}${historicoAjuste.ajustePercentN}% (${historicoAjuste.motivoHistorico}).`;
    }
    if (historicoAjuste.ajustePercentK !== 0) {
      k2oBase = k2oBase * (1 + historicoAjuste.ajustePercentK / 100);
      detalheK += ` Ajuste histórico de ${historicoAjuste.ajustePercentK > 0 ? '+' : ''}${historicoAjuste.ajustePercentK}%.`;
    }
    if (historicoAjuste.ajustePercentP !== 0) {
      p2o5Base = p2o5Base * (1 + historicoAjuste.ajustePercentP / 100);
    }
  }

  // Micronutrientes cafeeiro
  const sBase = Math.round(nBase * 0.15); // Relação N:S ideal no café é ~ 10:1 a 8:1
  const bBase = 2.0; // kg/ha de Boro
  const znBase = 3.0; // kg/ha de Zinco

  return {
    n_kg_ha: Math.round(nBase),
    p2o5_kg_ha: Math.round(p2o5Base),
    k2o_kg_ha: Math.round(k2oBase),
    s_kg_ha: sBase,
    b_kg_ha: bBase,
    zn_kg_ha: znBase,
    detalheN,
    detalheP,
    detalheK,
  };
}

/**
 * Monta o plano completo com recomendação de adubos comerciais e parcelamento
 * Adequado tanto para Café quanto para Uva (Vinhedo).
 */
export function gerarPlanoRecomendacao(
  plot: Plot,
  analiseSolo: SoilAnalysis,
  analiseSubsolo: SoilAnalysis | undefined,
  metaProducao: number,
  safra: string,
  cicloBienalidade: RecommendationPlan['cicloBienalidade'],
  usaPalhaCafe: boolean,
  palhaTonsHa: number,
  historicoAjuste: FeedbackHistoricoAjuste,
  parametros?: ParametrosAgronomicos,
  catalogoPersonalizado?: CommercialFertilizer[]
): RecommendationPlan {
  const isUva = plot.cultura === 'Uva';
  const catalogo = catalogoPersonalizado && catalogoPersonalizado.length > 0 ? catalogoPersonalizado : CATALOGO_FERTILIZANTES;
  const vDesejado = parametros?.vDesejado ?? (isUva ? 70 : (parametros?.focoAltaQualidade || parametros?.focoCafesNobres90Plus ? 65 : 60));
  const prnt = parametros?.prntPadrao ?? 85;

  const soloCalc = calcularIndicesSolo(analiseSolo) as SoilAnalysis;
  const calagem = calcularCalagem(soloCalc, plot, vDesejado, prnt);
  const gessagem = calcularGessagem(soloCalc, analiseSubsolo, soloCalc.argilaPercent);
  gessagem.totalKgTalhao = Math.round(gessagem.doseKgHa * plot.areaHa);

  // Densidade de plantas por hectare
  const espacamentoRua = plot.espacamentoRuaM || (isUva ? 2.8 : 3.5);
  const espacamentoPlanta = plot.espacamentoPlantaM || (isUva ? 1.2 : 0.7);
  const densidadePlantasHa = Math.round(10000 / (espacamentoRua * espacamentoPlanta));

  // Exigência Bruta parametrizada
  const exigenciaBruta = calcularExigenciaNutricional(metaProducao, soloCalc, plot, historicoAjuste, parametros);

  // Desconto de Matéria Orgânica e Palha de Café / Composto
  let k2oAbatido = 0;
  let nAbatido = 0;
  if (usaPalhaCafe && palhaTonsHa > 0) {
    k2oAbatido = Math.round(palhaTonsHa * 25 * 0.5);
    nAbatido = Math.round(palhaTonsHa * 15 * 0.3);
  }

  const exigenciaLiquida: ExigenciaNutricional = {
    ...exigenciaBruta,
    n_kg_ha: Math.max(15, exigenciaBruta.n_kg_ha - nAbatido),
    k2o_kg_ha: Math.max(20, exigenciaBruta.k2o_kg_ha - k2oAbatido),
  };

  // Resolução Química com Matérias-Primas Simples
  const adubosCalculados: AduboItemCalculado[] = [];

  // 1. Suprir P2O5 via MAP (ou similar)
  const mapFert = catalogo.find((f) => f.id === 'map') || CATALOGO_FERTILIZANTES.find((f) => f.id === 'map')!;
  const kgMapHa = Math.round((exigenciaLiquida.p2o5_kg_ha / (mapFert.teorP2O5 / 100)));
  const nFornecidoPeloMap = Math.round(kgMapHa * (mapFert.teorN / 100));

  if (kgMapHa > 0) {
    adubosCalculados.push(criarItemCalculado(mapFert, kgMapHa, plot, densidadePlantasHa, nFornecidoPeloMap, exigenciaLiquida.p2o5_kg_ha, 0));
  }

  // 2. Suprir K2O via Cloreto de Potássio (KCl 60%) ou Sulfato de Potássio
  // Para uvas finas, sulfato de potássio é especialmente recomendado (isento de cloro e com enxofre)
  const kclFert = catalogo.find((f) => f.id === 'kcl') || CATALOGO_FERTILIZANTES.find((f) => f.id === 'kcl')!;
  const kgKclHa = Math.round(exigenciaLiquida.k2o_kg_ha / (kclFert.teorK2O / 100));
  adubosCalculados.push(criarItemCalculado(kclFert, kgKclHa, plot, densidadePlantasHa, 0, 0, exigenciaLiquida.k2o_kg_ha));

  // 3. Suprir Enxofre via Sulfato de Amônio (21% N + 24% S)
  const sulfAmonioFert = catalogo.find((f) => f.id === 'sulfato_amonio') || CATALOGO_FERTILIZANTES.find((f) => f.id === 'sulfato_amonio')!;
  const kgSulfAmonioHa = Math.round(exigenciaLiquida.s_kg_ha / ((sulfAmonioFert.teorS || 24) / 100));
  const nFornecidoPeloSulfato = Math.round(kgSulfAmonioHa * (sulfAmonioFert.teorN / 100));
  if (kgSulfAmonioHa > 0) {
    adubosCalculados.push(criarItemCalculado(sulfAmonioFert, kgSulfAmonioHa, plot, densidadePlantasHa, nFornecidoPeloSulfato, 0, 0));
  }

  // 4. Saldo restante de N via Ureia (45% N)
  const ureiaFert = catalogo.find((f) => f.id === 'ureia') || CATALOGO_FERTILIZANTES.find((f) => f.id === 'ureia')!;
  const saldoN = Math.max(0, exigenciaLiquida.n_kg_ha - nFornecidoPeloMap - nFornecidoPeloSulfato);
  const kgUreiaHa = Math.round(saldoN / (ureiaFert.teorN / 100));
  if (kgUreiaHa > 0) {
    adubosCalculados.push(criarItemCalculado(ureiaFert, kgUreiaHa, plot, densidadePlantasHa, saldoN, 0, 0));
  }

  // 5. Micronutrientes (Boro e Zinco)
  const boroFert = catalogo.find((f) => f.id === 'acido_borico') || CATALOGO_FERTILIZANTES.find((f) => f.id === 'acido_borico')!;
  const kgBoroHa = Math.round(exigenciaLiquida.b_kg_ha / ((boroFert.teorB || 17) / 100));
  adubosCalculados.push(criarItemCalculado(boroFert, kgBoroHa, plot, densidadePlantasHa, 0, 0, 0));

  const custoTotalTalhao = adubosCalculados.reduce((sum, item) => sum + item.custoTotalEstimado, 0);

  // CRONOGRAMA DE PARCELAMENTO ESPECÍFICO (UVA vs CAFÉ)
  let cronogramaParcelamento: ParcelaCronograma[] = [];

  if (isUva) {
    // Cronograma da Videira (4 fases fenológicas da Chapada)
    cronogramaParcelamento = [
      {
        numero: 1,
        epoca: 'Pós-Poda / Brotação Inicial',
        faseFenologica: 'Brotação e Arranque Vegetativo dos Ramos',
        mesReferencia: 'Fase de Poda (Agosto / Setembro ou Inverno)',
        percentualN: 25,
        percentualK: 20,
        adubos: [
          {
            nome: 'MAP (100% da dose de fósforo)',
            doseKgHa: kgMapHa,
            gramasPorPlanta: Math.round((kgMapHa * 1000) / densidadePlantasHa),
            gramasPorMetro: Number(((kgMapHa * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round(kgMapHa * plot.areaHa),
          },
          {
            nome: 'Sulfato de Amônio / Ureia (1ª Parcela N)',
            doseKgHa: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.25),
            gramasPorPlanta: Math.round(((kgSulfAmonioHa + kgUreiaHa) * 0.25 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number((((kgSulfAmonioHa + kgUreiaHa) * 0.25 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.25 * plot.areaHa),
          },
          {
            nome: 'KCl / Sulfato de Potássio (1ª Parcela K)',
            doseKgHa: Math.round(kgKclHa * 0.20),
            gramasPorPlanta: Math.round((kgKclHa * 0.20 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number(((kgKclHa * 0.20 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round(kgKclHa * 0.20 * plot.areaHa),
          },
        ],
        condicoesClimaticasEAlerta: 'Aplicar na faixa da espaldeira/camalhão logo após a poda com irrigação ou solo úmido.',
      },
      {
        numero: 2,
        epoca: 'Floração e Chumbinho',
        faseFenologica: 'Divisão Celular e Pegamento dos Cachos',
        mesReferencia: 'Primavera (Outubro / Novembro)',
        percentualN: 35,
        percentualK: 30,
        adubos: [
          {
            nome: 'Ureia / Sulfato de Amônio (2ª Parcela N)',
            doseKgHa: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.35),
            gramasPorPlanta: Math.round(((kgSulfAmonioHa + kgUreiaHa) * 0.35 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number((((kgSulfAmonioHa + kgUreiaHa) * 0.35 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.35 * plot.areaHa),
          },
          {
            nome: 'KCl / Sulfato de K (2ª Parcela K)',
            doseKgHa: Math.round(kgKclHa * 0.30),
            gramasPorPlanta: Math.round((kgKclHa * 0.30 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number(((kgKclHa * 0.30 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round(kgKclHa * 0.30 * plot.areaHa),
          },
          {
            nome: 'Ácido Bórico (100% da dose de Boro)',
            doseKgHa: kgBoroHa,
            gramasPorPlanta: Math.round((kgBoroHa * 1000) / densidadePlantasHa),
            gramasPorMetro: Number(((kgBoroHa * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round(kgBoroHa * plot.areaHa),
          },
        ],
        condicoesClimaticasEAlerta: 'Fase essencial de fecundação. Suprimento de boro é indispensável para evitar desavinho e bagas chochas.',
      },
      {
        numero: 3,
        epoca: 'Véraison / Mudança de Cor (Pintor)',
        faseFenologica: 'Maturação dos Bagos, Acúmulo de Açúcares (°Brix) e Polifenóis',
        mesReferencia: 'Verão (Dezembro / Janeiro)',
        percentualN: 15,
        percentualK: 50,
        adubos: [
          {
            nome: 'Ureia (3ª Parcela N - Dose Reduzida)',
            doseKgHa: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.15),
            gramasPorPlanta: Math.round(((kgSulfAmonioHa + kgUreiaHa) * 0.15 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number((((kgSulfAmonioHa + kgUreiaHa) * 0.15 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.15 * plot.areaHa),
          },
          {
            nome: 'KCl / Sulfato de Potássio (3ª Parcela K - Reforço de Maturação)',
            doseKgHa: Math.round(kgKclHa * 0.50),
            gramasPorPlanta: Math.round((kgKclHa * 0.50 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number(((kgKclHa * 0.50 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round(kgKclHa * 0.50 * plot.areaHa),
          },
        ],
        condicoesClimaticasEAlerta: 'Pico de potássio para acúmulo de °Brix e equilíbrio de acidez tartárica. O nitrogênio é reduzido para não estimular brotações indesejadas.',
      },
      {
        numero: 4,
        epoca: 'Pós-Colheita da Uva',
        faseFenologica: 'Adubação de Reserva / Acúmulo no Lenho',
        mesReferencia: 'Pós-Safra (Fevereiro / Março)',
        percentualN: 25,
        percentualK: 0,
        adubos: [
          {
            nome: 'Ureia / Sulfato de Amônio (Adubação de Reserva)',
            doseKgHa: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.25),
            gramasPorPlanta: Math.round(((kgSulfAmonioHa + kgUreiaHa) * 0.25 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number((((kgSulfAmonioHa + kgUreiaHa) * 0.25 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.25 * plot.areaHa),
          },
        ],
        condicoesClimaticasEAlerta: 'Garante o acúmulo de reservas nutritivas nas gemas e ramos lenhosos para garantir a próxima brotação vigorosa.',
      },
    ];
  } else {
    // Cronograma clássico do cafeeiro (3 parcelas)
    cronogramaParcelamento = [
      {
        numero: 1,
        epoca: 'Início das Chuvas (Outubro / Novembro)',
        faseFenologica: 'Florada e Chumbinho (Início do pegamento)',
        mesReferencia: 'Outubro/Novembro',
        percentualN: 30,
        percentualK: 25,
        adubos: [
          {
            nome: 'MAP (100% da dose de fósforo)',
            doseKgHa: kgMapHa,
            gramasPorPlanta: Math.round((kgMapHa * 1000) / densidadePlantasHa),
            gramasPorMetro: Number(((kgMapHa * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round(kgMapHa * plot.areaHa),
          },
          {
            nome: 'Sulfato de Amônio + Ureia (1ª Parcela N)',
            doseKgHa: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.30),
            gramasPorPlanta: Math.round(((kgSulfAmonioHa + kgUreiaHa) * 0.30 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number((((kgSulfAmonioHa + kgUreiaHa) * 0.30 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.30 * plot.areaHa),
          },
          {
            nome: 'KCl (1ª Parcela K)',
            doseKgHa: Math.round(kgKclHa * 0.25),
            gramasPorPlanta: Math.round((kgKclHa * 0.25 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number(((kgKclHa * 0.25 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round(kgKclHa * 0.25 * plot.areaHa),
          },
        ],
        condicoesClimaticasEAlerta: 'Atenção: Aplicar somente após consolidação das chuvas (solo úmido). Não aplicar em solo esturricado para evitar queima de radicelas.',
      },
      {
        numero: 2,
        epoca: 'Pleno Verão (Dezembro / Janeiro)',
        faseFenologica: 'Expansão Rápida dos Frutos e Formação de Ramos',
        mesReferencia: 'Dezembro/Janeiro',
        percentualN: 40,
        percentualK: 35,
        adubos: [
          {
            nome: 'Ureia / Sulfato de Amônio (2ª Parcela N - Carga Principal)',
            doseKgHa: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.40),
            gramasPorPlanta: Math.round(((kgSulfAmonioHa + kgUreiaHa) * 0.40 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number((((kgSulfAmonioHa + kgUreiaHa) * 0.40 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.40 * plot.areaHa),
          },
          {
            nome: 'KCl (2ª Parcela K)',
            doseKgHa: Math.round(kgKclHa * 0.35),
            gramasPorPlanta: Math.round((kgKclHa * 0.35 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number(((kgKclHa * 0.35 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round(kgKclHa * 0.35 * plot.areaHa),
          },
        ],
        condicoesClimaticasEAlerta: 'Monitorar veranicos de Janeiro. Se houver estiagem superior a 10 dias com sol forte, adiar até retorno das precipitações.',
      },
      {
        numero: 3,
        epoca: 'Final do Verão (Fevereiro / Março)',
        faseFenologica: 'Granação dos Frutos (Enchimento de Sólidos e Brix)',
        mesReferencia: 'Fevereiro/Março',
        percentualN: 30,
        percentualK: 40,
        adubos: [
          {
            nome: 'Ureia (3ª Parcela N)',
            doseKgHa: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.30),
            gramasPorPlanta: Math.round(((kgSulfAmonioHa + kgUreiaHa) * 0.30 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number((((kgSulfAmonioHa + kgUreiaHa) * 0.30 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round((kgSulfAmonioHa + kgUreiaHa) * 0.30 * plot.areaHa),
          },
          {
            nome: 'KCl (3ª Parcela K - Reforço de Granação)',
            doseKgHa: Math.round(kgKclHa * 0.40),
            gramasPorPlanta: Math.round((kgKclHa * 0.40 * 1000) / densidadePlantasHa),
            gramasPorMetro: Number(((kgKclHa * 0.40 * espacamentoRua) / 10).toFixed(1)),
            totalKgTalhao: Math.round(kgKclHa * 0.40 * plot.areaHa),
          },
        ],
        condicoesClimaticasEAlerta: 'Fase crucial para evitar "grãos chochos" e manter folhas verdes até a colheita, garantindo a safra seguinte.',
      },
    ];
  }

  const observacoesAgronomicas: string[] = isUva
    ? [
        `Vinhedo: Espaçamento de ${espacamentoRua}m x ${espacamentoPlanta}m (${densidadePlantasHa} plantas/ha).`,
        `Sistema de Condução: ${plot.sistemaConducao || 'Espaldeira'}. Aplicação dos adubos na faixa de plantio / camalhão.`,
        `Manejo de ${plot.variedade}: Foco em acúmulo de °Brix e polifenóis de alta qualidade na Chapada Diamantina.`,
        `Prevenção do dessecamento do ráquis: manter relação Ca:Mg no solo entre 3:1 e 4:1.`,
      ]
    : [
        `Espaçamento do talhão: ${espacamentoRua}m x ${espacamentoPlanta}m (${densidadePlantasHa} plantas/ha).`,
        `Aplicação de adubação deve ser feita em faixa sob a projeção da copa do cafeeiro (saia).`,
        plot.coberturaSolo === 'Braquiária nas entrelinhas'
          ? 'A braquiária nas entrelinhas protege o solo contra erosão e mantém umidade residual em veranicos.'
          : 'Recomenda-se manejar a cobertura verde para melhorar a ciclagem de nutrientes e a infiltração de água.',
        usaPalhaCafe
          ? `Benefício da palha de café: economizou ${k2oAbatido} kg/ha de K2O e aumentou a matéria orgânica no solo.`
          : 'Dica dos fóruns: o uso da casca/palha de café residual do terreiro fornece alto teor de potássio orgânico gratuito.',
      ];

  return {
    id: `rec-${Date.now()}`,
    plotId: plot.id,
    safra,
    dataCalculo: new Date().toISOString().split('T')[0],
    cultura: plot.cultura || 'Café',
    metaSacasHa: metaProducao,
    unidadeMeta: isUva ? 't/ha' : 'scs/ha',
    cicloBienalidade,
    densidadePlantasHa,
    calagem,
    gessagem,
    exigenciaBruta,
    descontoOrganico: {
      temPalhaCafe: usaPalhaCafe,
      palhaTonsHa,
      k2oAbatido,
      temBraquiariaCobertura: plot.coberturaSolo === 'Braquiária nas entrelinhas',
      beneficioUmidadeEBiomassa: 'Redução da temperatura superficial do solo e melhoria biológica das raízes.',
    },
    ajusteHistorico: historicoAjuste,
    exigenciaLiquida,
    opcaoRecomendada: {
      modo: 'MateriaPrimaSimples',
      adubos: adubosCalculados,
      custoTotalTalhao: Math.round(custoTotalTalhao),
    },
    cronogramaParcelamento,
    observacoesAgronomicas,
    parametrosUtilizados: parametros,
  };
}

function criarItemCalculado(
  fert: CommercialFertilizer,
  doseKgHa: number,
  plot: Plot,
  densidadePlantasHa: number,
  forneceN: number,
  forneceP2O5: number,
  forneceK2O: number
): AduboItemCalculado {
  const totalKgTalhao = Math.round(doseKgHa * plot.areaHa);
  const sacas50kg = Number((totalKgTalhao / 50).toFixed(1));
  const gramasPorPlanta = Math.round((doseKgHa * 1000) / densidadePlantasHa);
  const gramasPorMetroLinear = Number(((doseKgHa * (plot.espacamentoRuaM || 3.5)) / 10).toFixed(1));
  
  const precoSaco = fert.precoSaco50kg || 150;
  const custoTotalEstimado = Math.round(sacas50kg * precoSaco);

  return {
    fertilizanteId: fert.id,
    nome: fert.nome,
    doseKgHa,
    totalKgTalhao,
    sacas50kg,
    gramasPorPlanta,
    gramasPorMetroLinear,
    custoTotalEstimado,
    forneceN,
    forneceP2O5,
    forneceK2O,
  };
}
