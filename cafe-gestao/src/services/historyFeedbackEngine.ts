import { HarvestRecord, SoilAnalysis, FeedbackHistoricoAjuste } from '../types';

export interface NutrientesExportados {
  nExportado: number;
  p2o5Exportado: number;
  k2oExportado: number;
}

/**
 * Calcula a exportação de nutrientes pelos frutos colhidos
 * Em média, cada saca (60kg café beneficiado) exporta:
 * N: ~2.4 kg | P2O5: ~0.4 kg | K2O: ~2.8 kg | S: ~0.2 kg
 */
export function calcularExportacaoColheita(sacasHa: number): NutrientesExportados {
  return {
    nExportado: Number((sacasHa * 2.4).toFixed(1)),
    p2o5Exportado: Number((sacasHa * 0.4).toFixed(1)),
    k2oExportado: Number((sacasHa * 2.8).toFixed(1)),
  };
}

/**
 * Motor de Retroalimentação Histórica (Machine Feedback)
 * Analisa as safras anteriores e evolução dos laudos de solo para gerar
 * recomendações adaptativas e calibradas para a realidade do talhão.
 */
export function analisarHistoricoTalhao(
  plotId: string,
  historicoColheitas: HarvestRecord[],
  analisesSolo: SoilAnalysis[]
): FeedbackHistoricoAjuste {
  // Filtrar dados do talhão
  const colheitasTalhao = historicoColheitas
    .filter((h) => h.plotId === plotId)
    .sort((a, b) => b.safra.localeCompare(a.safra)); // Mais recente primeiro

  const analisesTalhao = analisesSolo
    .filter((a) => a.plotId === plotId && a.profundidade === '0-20cm')
    .sort((a, b) => new Date(b.dataColeta).getTime() - new Date(a.dataColeta).getTime());

  let ajustePercentN = 0;
  let ajustePercentK = 0;
  let ajustePercentP = 0;
  const motivos: string[] = [];
  let tendenciaFertilidade = 'Histórico estável';

  // 1. ANÁLISE DE CARGA E BIENALIDADE DA SAFRA ANTERIOR
  const safraAnterior = colheitasTalhao[0];
  if (safraAnterior) {
    const prodAnterior = safraAnterior.produtividadeSacasHa;
    
    if (prodAnterior >= 50) {
      // Safra de alta carga extrema: esgotamento de reservas
      ajustePercentN += 15;
      ajustePercentK += 10;
      motivos.push(
        `Safra anterior recorde (${prodAnterior} scs/ha) causou alto dreno de carboidratos. Recomenda-se +15% de N para restauração de ramos e folhas.`
      );
    } else if (prodAnterior < 25 && colheitasTalhao.length >= 2 && colheitasTalhao[1].produtividadeSacasHa > 45) {
      // Safra de repouso típica de bienalidade baixa
      motivos.push(
        `Safra anterior de repouso vegetativo (${prodAnterior} scs/ha). Planta acumulou reservas foliares para carga atual.`
      );
    }
  }

  // 2. EVOLUÇÃO DAS ANÁLISES DE SOLO AO LONGO DAS SAFRAS
  if (analisesTalhao.length >= 2) {
    const atual = analisesTalhao[0];
    const anterior = analisesTalhao[1];

    // Tendência de Fósforo
    const deltaP = atual.p - anterior.p;
    if (atual.p > 30 && deltaP > 5) {
      ajustePercentP -= 25;
      motivos.push(
        `Fósforo acumulado no solo aumentou de ${anterior.p} para ${atual.p} mg/dm³. Redução de 25% na dose de P2O5 recomendada para economizar insumo.`
      );
      tendenciaFertilidade = 'Solo com acúmulo residual de Fósforo';
    }

    // Tendência de Potássio
    const deltaK = atual.k - anterior.k;
    if (atual.k > 0.40 && deltaK > 0.05) {
      ajustePercentK -= 15;
      motivos.push(
        `Potássio residual elevado (${atual.k.toFixed(2)} cmolc/dm³). Redução preventiva de 15% de K2O para evitar antagonismo com Magnésio e salinidade.`
      );
    } else if (atual.k < 0.15 && deltaK < -0.05) {
      ajustePercentK += 15;
      motivos.push(
        `Queda nos teores de K no solo (${anterior.k.toFixed(2)} -> ${atual.k.toFixed(2)} cmolc/dm³). Aporte extra de K2O necessário para reposição.`
      );
    }

    // Evolução de Saturação por Bases (V%)
    if (atual.vPercent && anterior.vPercent) {
      const deltaV = atual.vPercent - anterior.vPercent;
      if (deltaV > 10) {
        motivos.push(`Boa resposta da calagem anterior: V% subiu de ${anterior.vPercent.toFixed(1)}% para ${atual.vPercent.toFixed(1)}%.`);
      } else if (deltaV < -10) {
        motivos.push(`Acidificação acelerada observada: V% caiu de ${anterior.vPercent.toFixed(1)}% para ${atual.vPercent.toFixed(1)}%.`);
      }
    }
  }

  // 3. BALANÇO DE APLICAÇÃO ANTERIOR VS COLHEITA REAL
  if (safraAnterior && safraAnterior.adubacaoRealN > 0) {
    const exportado = calcularExportacaoColheita(safraAnterior.produtividadeSacasHa);
    const saldoN = safraAnterior.adubacaoRealN - exportado.nExportado;
    const saldoK = safraAnterior.adubacaoRealK2O - exportado.k2oExportado;

    if (saldoK < -20) {
      motivos.push(`Déficit na safra passada: Colheita exportou mais K2O (${exportado.k2oExportado} kg) do que o aplicado (${safraAnterior.adubacaoRealK2O} kg).`);
    }
  }

  const motivoFinal = motivos.length > 0 
    ? motivos.join(' | ') 
    : 'Sem desvios históricos significativos. Mantida calibração padrão pela meta de produtividade.';

  return {
    ajustePercentN,
    ajustePercentK,
    ajustePercentP,
    motivoHistorico: motivoFinal,
    safraAnteriorColhida: safraAnterior?.produtividadeSacasHa,
    tendenciaFertilidadeSolo: tendenciaFertilidade,
  };
}
