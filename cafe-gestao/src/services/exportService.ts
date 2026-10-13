import { RecommendationPlan, Plot, SaidaVenda, PontoVenda, Produto, RegistroAdubacao, HarvestRecord } from '../types';
import { calcularExportacaoColheita } from './historyFeedbackEngine';

/**
 * Utilitário para acionar download de arquivo no navegador
 */
function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copia texto para a área de transferência com fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para ambientes sem suporte direto à clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Falha ao copiar para o clipboard:', err);
    return false;
  }
}

// ============================================================================
// 1. EXPORTAÇÃO DE CÁLCULO NUTRICIONAL (EXCEL & TXT)
// ============================================================================

/**
 * Gera e baixa planilha formatada compatível com Microsoft Excel (CSV com UTF-8 BOM e delimitador ;)
 */
export function exportCalculoExcel(plan: RecommendationPlan, plot: Plot): void {
  const BOM = '\uFEFF'; // Garante que o Excel abra com acentos corretos em português
  const rows: string[] = [];

  // Cabeçalho da Fazenda
  rows.push('FAZENDA RECREIO DO MORRO - CHAPADA DIAMANTINA • BAHIA');
  rows.push('RESUMO DO CÁLCULO NUTRICIONAL, CALAGEM & ADUBAÇÃO');
  rows.push(`Data de Emissão;${plan.dataCalculo};Safra;${plan.safra}`);
  rows.push('');

  // Dados do Talhão
  rows.push('1. IDENTIFICAÇÃO DO TALHÃO');
  rows.push('Parâmetro;Valor');
  rows.push(`Nome do Talhão;${plot.nome}`);
  rows.push(`Área (ha);${plot.areaHa.toFixed(1)}`);
  rows.push(`Variedade;${plot.variedade}`);
  rows.push(`Altitude;${plot.altitudeM} metros`);
  rows.push(`Espaçamento;${plot.espacamentoRuaM || 3.5}m entre ruas x ${plot.espacamentoPlantaM || 0.7}m entre plantas`);
  rows.push(`Densidade de Plantas;${plan.densidadePlantasHa} plantas/ha`);
  rows.push(`Metros Lineares de Rua;${Math.round(10000 / (plot.espacamentoRuaM || 3.5))} m/ha`);
  rows.push(`Meta Produtiva;${plan.metaSacasHa} sacas/ha (${Math.round(plan.metaSacasHa * plot.areaHa)} sacas no talhão)`);
  rows.push(`Cobertura do Solo;${plot.coberturaSolo || 'Padrão'}`);
  rows.push('');

  // Calagem e Gessagem
  rows.push('2. CORREÇÃO DO SOLO (CALAGEM & GESSAGEM)');
  rows.push('Operação;Necessário?;Dose Recomendada;Total para o Talhão;Diagnóstico Técnico');
  rows.push(
    `Calagem em Área Total;${plan.calagem.necessario ? 'Sim' : 'Não'};${plan.calagem.doseTotalHa} t/ha;${Math.round(plan.calagem.doseTotalHa * 1000 * plot.areaHa)} kg;Meta V% ${plan.calagem.vDesejado}% (Atual: ${plan.calagem.vAtual.toFixed(1)}%)`
  );
  rows.push(
    `Calagem em Faixa na Saia (Recomendada);${plan.calagem.necessario ? 'Sim' : 'Não'};${plan.calagem.doseFaixaHa} t/ha;${plan.calagem.totalKgTalhao} kg (${(plan.calagem.totalKgTalhao / 50).toFixed(0)} sacos de 50kg);${plan.calagem.tipoCalcario} - ${plan.calagem.diagnostico.replace(/;/g, ',')}`
  );
  rows.push(
    `Gessagem em Subsuperfície (20-40cm);${plan.gessagem.necessario ? 'Sim' : 'Não'};${plan.gessagem.doseKgHa} kg/ha;${plan.gessagem.totalKgTalhao} kg (${(plan.gessagem.totalKgTalhao / 50).toFixed(0)} sacos);${plan.gessagem.motivo.replace(/;/g, ',')}`
  );
  rows.push('');

  // Exigência Nutricional
  rows.push('3. BALANÇO DE NUTRIENTES LÍQUIDOS (kg/ha)');
  rows.push('Nutriente;Exigência Bruta (kg/ha);Abate Orgânico Palha (kg/ha);Exigência Líquida a Suprir (kg/ha)');
  rows.push(`Nitrogênio (N);${plan.exigenciaBruta.n_kg_ha};${plan.descontoOrganico.temPalhaCafe ? Math.round(plan.descontoOrganico.palhaTonsHa * 15 * 0.3) : 0};${plan.exigenciaLiquida.n_kg_ha}`);
  rows.push(`Fósforo (P2O5);${plan.exigenciaBruta.p2o5_kg_ha};0;${plan.exigenciaLiquida.p2o5_kg_ha}`);
  rows.push(`Potássio (K2O);${plan.exigenciaBruta.k2o_kg_ha};${plan.descontoOrganico.k2oAbatido};${plan.exigenciaLiquida.k2o_kg_ha}`);
  rows.push(`Enxofre (S);${plan.exigenciaBruta.s_kg_ha};0;${plan.exigenciaLiquida.s_kg_ha}`);
  rows.push(`Boro (B);${plan.exigenciaBruta.b_kg_ha};0;${plan.exigenciaLiquida.b_kg_ha}`);
  rows.push(`Zinco (Zn);${plan.exigenciaBruta.zn_kg_ha};0;${plan.exigenciaLiquida.zn_kg_ha}`);
  rows.push('');

  // Tabela de Adubos Comerciais Recomendados
  rows.push('4. RECOMENDAÇÃO DE MATÉRIAS-PRIMAS & REGULAGEM');
  rows.push('Insumo Fertilizante;Dose (kg/ha);Total no Talhão (kg);Sacas 50kg;Dose por Planta (g/planta);Dose por Metro Linear (g/m);Custo Estimado (R$)');
  plan.opcaoRecomendada.adubos.forEach((a) => {
    rows.push(
      `"${a.nome}";${a.doseKgHa};${a.totalKgTalhao};${a.sacas50kg};${a.gramasPorPlanta};${a.gramasPorMetroLinear};R$ ${a.custoTotalEstimado.toFixed(2)}`
    );
  });
  rows.push(`"CUSTO TOTAL ESTIMADO DE ADUBOS NO TALHÃO";;;;;;R$ ${plan.opcaoRecomendada.custoTotalTalhao.toFixed(2)}`);
  rows.push('');

  // Cronograma de Parcelamento
  rows.push('5. CRONOGRAMA DE PARCELAMENTO FENOLÓGICO');
  rows.push('Parcela;Época Recomendada;Fase Fenológica;Adubo;Dose (kg/ha);Regulagem (g/m linear);Total Parcela no Talhão (kg);Condições & Alertas');
  plan.cronogramaParcelamento.forEach((p) => {
    p.adubos.forEach((ad, idx) => {
      rows.push(
        `Parcela ${p.numero} (${p.mesReferencia});"${p.epoca}";"${p.faseFenologica}";"${ad.nome}";${ad.doseKgHa};${ad.gramasPorMetro};${ad.totalKgTalhao};"${idx === 0 ? p.condicoesClimaticasEAlerta : ''}"`
      );
    });
  });

  const csvContent = BOM + rows.join('\r\n');
  const safePlotName = plot.nome.replace(/[^a-zA-Z0-9]/g, '_');
  const safeSafra = plan.safra.replace(/[^a-zA-Z0-9]/g, '_');
  downloadFile(csvContent, `Calculo_Nutricao_${safePlotName}_${safeSafra}.csv`);
}

/**
 * Gera texto formatado com emojis e marcadores para envio no WhatsApp ou bloco de notas
 */
export function generateCalculoTxt(plan: RecommendationPlan, plot: Plot): string {
  const espRua = plot.espacamentoRuaM || 3.5;
  const metrosHa = Math.round(10000 / espRua);

  let text = `🌱 *RECREIO DO MORRO - FICHA DE NUTRIÇÃO E ADUBAÇÃO*\n`;
  text += `📍 *Talhão:* ${plot.nome} (${plot.areaHa.toFixed(1)} ha) | *Altitude:* ${plot.altitudeM}m\n`;
  text += `🎯 *Variedade:* ${plot.variedade} | *Safra:* ${plan.safra}\n`;
  text += `☕ *Meta de Colheita:* ${plan.metaSacasHa} scs/ha (Total previsto: ${Math.round(plan.metaSacasHa * plot.areaHa)} sacas)\n`;
  text += `🚜 *Espaçamento:* ${espRua}m x ${plot.espacamentoPlantaM || 0.7}m (${plan.densidadePlantasHa} plantas/ha | ${metrosHa} m/ha)\n`;
  text += `─────────────────────────────────────────\n\n`;

  text += `🧪 *1. CORREÇÃO DO SOLO (CALAGEM & GESSAGEM)*\n`;
  if (plan.calagem.necessario) {
    text += `• *Calcário na Saia:* ${plan.calagem.doseFaixaHa} t/ha\n`;
    text += `  └ Total Talhão: *${plan.calagem.totalKgTalhao.toLocaleString('pt-BR')} kg* (~${(plan.calagem.totalKgTalhao / 50).toFixed(0)} sacos)\n`;
    text += `  └ Tipo: *${plan.calagem.tipoCalcario}* (Elevação para ${plan.calagem.vDesejado}% V)\n`;
  } else {
    text += `• *Calagem:* Não requer calagem nesta safra (V% atual de ${plan.calagem.vAtual.toFixed(1)}% está adequado).\n`;
  }

  if (plan.gessagem.necessario) {
    text += `• *Gesso Agrícola (20-40cm):* ${plan.gessagem.doseKgHa} kg/ha\n`;
    text += `  └ Total Talhão: *${plan.gessagem.totalKgTalhao.toLocaleString('pt-BR')} kg* (~${(plan.gessagem.totalKgTalhao / 50).toFixed(0)} sacos)\n`;
    text += `  └ Finalidade: Aprofundamento de raízes contra secas e neutralização de Al.\n`;
  } else {
    text += `• *Gessagem:* Subsolo sem toxidez de alumínio.\n`;
  }
  text += `\n`;

  text += `📦 *2. INSUMOS FERTILIZANTES RECOMENDADOS (TOTAL DO TALHÃO)*\n`;
  plan.opcaoRecomendada.adubos.forEach((a) => {
    text += `• *${a.nome}:*\n`;
    text += `  └ Dose: *${a.doseKgHa} kg/ha* | Total: *${a.totalKgTalhao.toLocaleString('pt-BR')} kg* (~${a.sacas50kg} sacos de 50kg)\n`;
    text += `  └ Regulagem: *${a.gramasPorMetroLinear} g/m linear* (*${a.gramasPorPlanta} g/planta*)\n`;
  });
  text += `💰 *Custo Total Estimado de Insumos:* R$ ${plan.opcaoRecomendada.custoTotalTalhao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;

  if (plan.descontoOrganico.temPalhaCafe && plan.descontoOrganico.k2oAbatido > 0) {
    text += `♻️ *Crédito Orgânico:* Abate de ${plan.descontoOrganico.k2oAbatido} kg/ha de K₂O pela aplicação de ${plan.descontoOrganico.palhaTonsHa} t/ha de casca de café.\n\n`;
  }

  text += `📅 *3. CRONOGRAMA DE PARCELAMENTO NO CAMPO*\n`;
  plan.cronogramaParcelamento.forEach((p) => {
    text += `*▶ Parcela ${p.numero} - ${p.epoca} (${p.mesReferencia})*\n`;
    text += `  Fase: ${p.faseFenologica}\n`;
    p.adubos.forEach((ad) => {
      text += `  • ${ad.nome}: *${ad.doseKgHa} kg/ha* (Regulagem esteira: *${ad.gramasPorMetro} g/m* | Total: ${ad.totalKgTalhao} kg)\n`;
    });
    text += `  ⚠️ Alerta: ${p.condicoesClimaticasEAlerta}\n\n`;
  });

  text += `─────────────────────────────────────────\n`;
  text += `Fazenda Recreio do Morro • Gestão Agronômica Sob Medida\n`;

  return text;
}

// ============================================================================
// 2. EXPORTAÇÃO DE VENDAS & DISTRIBUIÇÃO (EXCEL & TXT)
// ============================================================================

/**
 * Gera e baixa planilha detalhada de saídas e vendas compatível com Microsoft Excel
 */
export function exportVendasExcel(saidas: SaidaVenda[], pdvs: PontoVenda[], produtos: Produto[]): void {
  const BOM = '\uFEFF';
  const rows: string[] = [];

  rows.push('FAZENDA RECREIO DO MORRO - CHAPADA DIAMANTINA • BAHIA');
  rows.push('RELATÓRIO DETALHADO DE VENDAS, SAÍDAS & FLUXO DE CAIXA');
  rows.push(`Emitido em;${new Date().toLocaleDateString('pt-BR')}`);
  rows.push('');

  // 1. Tabela Detalhada de Itens Despachados
  rows.push('1. EXTRATO DE SAÍDAS DE PRODUTOS');
  rows.push(
    'Data da Saída;ID Saída;Ponto de Venda (PDV);Tipo de PDV;Produto;Categoria;Subtipo;Quantidade;Unidade;Preço Unitário Negociado (R$);Total do Item (R$);Total do Pedido (R$);Status Pagamento;Data Recebimento;Observações'
  );

  let faturamentoTotal = 0;
  let totalRecebido = 0;
  let totalPendente = 0;

  saidas.forEach((s) => {
    const pdv = pdvs.find((p) => p.id === s.pontoVendaId);
    const pdvNome = pdv?.nome || 'PDV Não Identificado';
    const pdvTipo = pdv?.tipo || '-';

    faturamentoTotal += s.valorTotal;
    if (s.statusPagamento === 'Recebido') {
      totalRecebido += s.valorTotal;
    } else {
      totalPendente += s.valorTotal;
    }

    s.itens.forEach((item) => {
      const prod = produtos.find((p) => p.id === item.produtoId);
      const prodNome = prod?.nome || 'Produto';
      const prodCat =
        prod?.categoria === 'cafe'
          ? 'Café'
          : prod?.categoria === 'tomate'
          ? 'Tomate'
          : prod?.categoria === 'uva'
          ? 'Uva'
          : prod?.categoria === 'vinho'
          ? 'Vinho'
          : 'Geral';
      const prodSub = prod?.subtipo || '-';
      const prodUnid = prod?.unidade || 'un';

      rows.push(
        `${s.data};"${s.id}";"${pdvNome}";"${pdvTipo}";"${prodNome}";"${prodCat}";"${prodSub}";${item.quantidade};"${prodUnid}";R$ ${item.precoUnitario.toFixed(2)};R$ ${item.subtotal.toFixed(2)};R$ ${s.valorTotal.toFixed(2)};"${s.statusPagamento}";"${s.dataRecebimento || '-'}";"${s.observacoes || '-'}"`
      );
    });
  });

  rows.push('');
  rows.push('2. RESUMO CONSOLIDADO FINANCEIRO');
  rows.push('Indicador;Valor (R$)');
  rows.push(`Faturamento Total Despachado;R$ ${faturamentoTotal.toFixed(2)}`);
  rows.push(`Total Liquidado / Recebido em Caixa;R$ ${totalRecebido.toFixed(2)}`);
  rows.push(`Total Pendente / Contas a Receber;R$ ${totalPendente.toFixed(2)}`);
  rows.push(`Total de Remessas/Pedidos;${saidas.length}`);
  rows.push('');

  // 3. Faturamento por Ponto de Venda
  rows.push('3. FATURAMENTO POR PONTO DE VENDA (PDV)');
  rows.push('Ponto de Venda;Cidade/Canal;Total de Pedidos;Total Faturado (R$);Valor Recebido (R$);Valor Pendente (R$)');
  pdvs.forEach((p) => {
    const saidasPdv = saidas.filter((s) => s.pontoVendaId === p.id);
    const fatPdv = saidasPdv.reduce((sum, s) => sum + s.valorTotal, 0);
    const recPdv = saidasPdv.filter((s) => s.statusPagamento === 'Recebido').reduce((sum, s) => sum + s.valorTotal, 0);
    const pendPdv = fatPdv - recPdv;
    rows.push(
      `"${p.nome}";"${p.cidade || p.tipo}";${saidasPdv.length};R$ ${fatPdv.toFixed(2)};R$ ${recPdv.toFixed(2)};R$ ${pendPdv.toFixed(2)}`
    );
  });

  const csvContent = BOM + rows.join('\r\n');
  const safeDate = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `Relatorio_Vendas_Recreio_do_Morro_${safeDate}.csv`);
}

/**
 * Gera resumo executivo de vendas e faturamento para envio via WhatsApp ou bloco de notas
 */
export function generateVendasTxt(saidas: SaidaVenda[], pdvs: PontoVenda[], produtos: Produto[]): string {
  const totalFaturado = saidas.reduce((acc, s) => acc + s.valorTotal, 0);
  const totalRecebido = saidas
    .filter((s) => s.statusPagamento === 'Recebido')
    .reduce((acc, s) => acc + s.valorTotal, 0);
  const totalPendente = totalFaturado - totalRecebido;

  // Total de unidades por categoria
  let pacotesCafe = 0;
  let bandejasTomate = 0;
  let caixasTomate = 0;
  let caixasUva = 0;
  let garrafasVinho = 0;

  saidas.forEach((s) => {
    s.itens.forEach((i) => {
      const p = produtos.find((pr) => pr.id === i.produtoId);
      if (p?.categoria === 'cafe') {
        pacotesCafe += i.quantidade;
      } else if (p?.categoria === 'tomate') {
        if (p?.unidade === 'bandeja') {
          bandejasTomate += i.quantidade;
        } else {
          caixasTomate += i.quantidade;
        }
      } else if (p?.categoria === 'uva') {
        caixasUva += i.quantidade;
      } else if (p?.categoria === 'vinho') {
        garrafasVinho += i.quantidade;
      }
    });
  });

  let text = `📦 *RECREIO DO MORRO - RESUMO DE VENDAS & SAÍDAS*\n`;
  text += `📅 *Posição em:* ${new Date().toLocaleDateString('pt-BR')}\n`;
  text += `─────────────────────────────────────────\n\n`;

  text += `💰 *PAINEL FINANCEIRO GERAL*\n`;
  text += `• *Faturamento Total:* R$ ${totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
  text += `• *Recebido em Caixa:* R$ ${totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
  text += `• *A Receber (Pendente):* R$ ${totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
  text += `• *Total de Entregas Realizadas:* ${saidas.length} pedidos\n\n`;

  text += `📊 *VOLUMES DE PRODUTOS DESPACHADOS*\n`;
  text += `• ☕ *Cafés Especiais:* ${pacotesCafe} pacotes entregues\n`;
  text += `• 🍅 *Tomates Especiais:* ${bandejasTomate} bandejas + ${caixasTomate} caixas\n`;
  if (caixasUva > 0) {
    text += `• 🍇 *Uvas da Fazenda:* ${caixasUva} caixas despachadas\n`;
  }
  if (garrafasVinho > 0) {
    text += `• 🍷 *Vinhos Finos:* ${garrafasVinho} garrafas despachadas\n`;
  }
  text += `\n`;

  text += `🏬 *FATURAMENTO POR PONTO DE VENDA (PDV)*\n`;
  pdvs.forEach((p) => {
    const saidasPdv = saidas.filter((s) => s.pontoVendaId === p.id);
    if (saidasPdv.length > 0) {
      const fat = saidasPdv.reduce((sum, s) => sum + s.valorTotal, 0);
      const rec = saidasPdv.filter((s) => s.statusPagamento === 'Recebido').reduce((sum, s) => sum + s.valorTotal, 0);
      const pend = fat - rec;
      text += `• *${p.nome}* (${p.cidade || p.tipo}):\n`;
      text += `  └ Total: R$ ${fat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${saidasPdv.length} entregas)\n`;
      if (pend > 0) {
        text += `  └ ⚠️ Pendente: R$ ${pend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      } else {
        text += `  └ ✅ 100% Liquidado\n`;
      }
    }
  });

  text += `\nÚltimas Saídas Registradas:\n`;
  saidas.slice(0, 5).forEach((s) => {
    const pdv = pdvs.find((p) => p.id === s.pontoVendaId);
    text += `• ${s.data} - ${pdv?.nome || 'PDV'}: R$ ${s.valorTotal.toFixed(2)} [${s.statusPagamento}]\n`;
  });

  text += `\n─────────────────────────────────────────\n`;
  text += `Fazenda Recreio do Morro • Gestão Comercial Integrada\n`;

  return text;
}

// ============================================================================
// 3. EXPORTAÇÃO DE ADUBAÇÕES / MANEJOS (EXCEL & TXT)
// ============================================================================

/**
 * Gera e baixa planilha formatada compatível com Microsoft Excel contendo todos os manejos de adubação
 */
export function exportAdubacoesExcel(adubacoes: RegistroAdubacao[], plots: Plot[]): void {
  const BOM = '\uFEFF';
  const rows: string[] = [];

  const totalKg = adubacoes.reduce((acc, a) => acc + (a.quantidadeKg || 0), 0);
  const totalCusto = adubacoes.reduce((acc, a) => acc + (a.custoTotal || 0), 0);
  const safeDate = new Date().toLocaleDateString('pt-BR');

  // Cabeçalho da Fazenda
  rows.push('FAZENDA RECREIO DO MORRO - CHAPADA DIAMANTINA • BAHIA');
  rows.push('RELATÓRIO DE MANEJOS NUTRICIONAIS & CADERNO DE CAMPO (ADUBAÇÕES)');
  rows.push(`Data de Emissão;${safeDate};Total de Aplicações;${adubacoes.length}`);
  rows.push('');

  // 1. Resumo Consolidado
  rows.push('1. RESUMO GERAL DE INSUMOS APLICADOS');
  rows.push('Indicador;Valor');
  rows.push(`Total Geral de Adubo Aplicado (kg);${totalKg.toLocaleString('pt-BR')}`);
  rows.push(`Total Geral em Sacos de 50kg;${(totalKg / 50).toFixed(1)}`);
  rows.push(`Investimento Total em Adubação (R$);R$ ${totalCusto.toFixed(2)}`);
  rows.push(`Quantidade de Talhões Contemplados;${new Set(adubacoes.map((a) => a.plotId)).size}`);
  rows.push('');

  // 2. Tabela Detalhada de Aplicações
  rows.push('2. EXTRATO DETALHADO DE REGISTROS DE ADUBAÇÃO');
  rows.push('Data do Manejo;Talhão;Cultura;Área (ha);Adubo / Fórmula;Marca Comercial;Qtd (kg);Dose (kg/ha);Dose (g/planta);Modo de Aplicação;Fase Fenológica;Responsável;Custo Total (R$);Observações');

  adubacoes.forEach((a) => {
    const plot = plots.find((p) => p.id === a.plotId);
    const plotNome = plot ? plot.nome : 'Talhão não encontrado';
    const cultura = plot?.cultura || 'Café';
    const areaHa = plot?.areaHa ? plot.areaHa.toFixed(1) : '-';
    const doseKg = a.doseKgHa !== undefined ? a.doseKgHa.toString().replace('.', ',') : '-';
    const doseG = a.doseGPorPlanta !== undefined ? a.doseGPorPlanta.toString().replace('.', ',') : '-';
    const custo = a.custoTotal ? `R$ ${a.custoTotal.toFixed(2)}` : 'R$ 0,00';
    const obs = a.observacoes ? a.observacoes.replace(/;/g, ',').replace(/\r?\n/g, ' ') : '';
    const marca = a.marca ? a.marca.replace(/;/g, ',') : '-';
    const resp = a.responsavel ? a.responsavel.replace(/;/g, ',') : '-';
    const fase = a.estagioFenologico ? a.estagioFenologico.replace(/;/g, ',') : '-';

    rows.push(
      `"${a.data}";"${plotNome}";"${cultura}";${areaHa};"${a.aduboNome}";"${marca}";${a.quantidadeKg};${doseKg};${doseG};"${a.modoAplicacao}";"${fase}";"${resp}";${custo};"${obs}"`
    );
  });

  rows.push('');
  // 3. Total por Talhão
  rows.push('3. CONSOLIDAÇÃO POR TALHÃO');
  rows.push('Talhão;Cultura;Área (ha);Qtd Total Adubo (kg);Custo Total (R$);Total de Manejos');
  plots.forEach((p) => {
    const adubsTalhao = adubacoes.filter((a) => a.plotId === p.id);
    if (adubsTalhao.length > 0) {
      const kgTalhao = adubsTalhao.reduce((acc, a) => acc + (a.quantidadeKg || 0), 0);
      const custoTalhao = adubsTalhao.reduce((acc, a) => acc + (a.custoTotal || 0), 0);
      rows.push(
        `"${p.nome}";"${p.cultura || 'Café'}";${p.areaHa.toFixed(1)};${kgTalhao};R$ ${custoTalhao.toFixed(2)};${adubsTalhao.length}`
      );
    }
  });

  const csvContent = BOM + rows.join('\r\n');
  const safeDateFile = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `Relatorio_Adubacoes_Recreio_do_Morro_${safeDateFile}.csv`);
}

/**
 * Gera texto formatado de adubações para compartilhamento via WhatsApp
 */
export function generateAdubacoesTxt(adubacoes: RegistroAdubacao[], plots: Plot[]): string {
  const totalKg = adubacoes.reduce((acc, a) => acc + (a.quantidadeKg || 0), 0);
  const totalCusto = adubacoes.reduce((acc, a) => acc + (a.custoTotal || 0), 0);

  let text = `🌱 *RECREIO DO MORRO - RELATÓRIO DE MANEJOS & ADUBAÇÃO*\n`;
  text += `📅 *Posição em:* ${new Date().toLocaleDateString('pt-BR')}\n`;
  text += `─────────────────────────────────────────\n\n`;

  text += `📊 *TOTAIS CONSOLIDADOS*\n`;
  text += `• *Total Aplicado:* ${totalKg.toLocaleString('pt-BR')} kg (~${(totalKg / 50).toFixed(1)} sacos)\n`;
  text += `• *Investimento Total:* R$ ${totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
  text += `• *Total de Intervenções:* ${adubacoes.length} aplicações registradas\n\n`;

  text += `📍 *APLICAÇÕES POR TALHÃO*\n`;
  plots.forEach((p) => {
    const adubs = adubacoes.filter((a) => a.plotId === p.id);
    if (adubs.length > 0) {
      const kg = adubs.reduce((acc, a) => acc + (a.quantidadeKg || 0), 0);
      const custo = adubs.reduce((acc, a) => acc + (a.custoTotal || 0), 0);
      text += `• *${p.nome}* (${p.cultura || 'Café'} - ${p.areaHa} ha):\n`;
      text += `  └ Total: ${kg.toLocaleString('pt-BR')} kg | R$ ${custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      adubs.forEach((a) => {
        text += `    - ${a.data}: ${a.aduboNome}${a.marca ? ` (${a.marca})` : ''} - ${a.quantidadeKg}kg (${a.modoAplicacao})\n`;
      });
    }
  });

  text += `\n─────────────────────────────────────────\n`;
  text += `Fazenda Recreio do Morro • Gestão Agronômica Integrada\n`;
  return text;
}

// ============================================================================
// 4. EXPORTAÇÃO DE HISTÓRICO DE SAFRAS & BALANÇO NUTRICIONAL (EXCEL & TXT)
// ============================================================================

/**
 * Gera e baixa planilha formatada compatível com Microsoft Excel contendo histórico de colheitas e balanço nutricional
 */
export function exportHistoricosExcel(harvests: HarvestRecord[], plots: Plot[]): void {
  const BOM = '\uFEFF';
  const rows: string[] = [];

  const totalSacas = harvests.reduce((acc, h) => acc + (h.sacasTotais || 0), 0);
  const mediaProd =
    harvests.length > 0
      ? harvests.reduce((acc, h) => acc + (h.produtividadeSacasHa || 0), 0) / harvests.length
      : 0;
  const safeDate = new Date().toLocaleDateString('pt-BR');

  // Cabeçalho da Fazenda
  rows.push('FAZENDA RECREIO DO MORRO - CHAPADA DIAMANTINA • BAHIA');
  rows.push('RELATÓRIO HISTÓRICO DE SAFRAS, PRODUTIVIDADE E BALANÇO DE EXTRAÇÃO');
  rows.push(`Data de Emissão;${safeDate};Total de Safras Registradas;${harvests.length}`);
  rows.push('');

  // 1. Resumo Geral
  rows.push('1. RESUMO HISTÓRICO CONSOLIDADO');
  rows.push('Indicador;Valor');
  rows.push(`Volume Total Produzido Acumulado;${totalSacas.toLocaleString('pt-BR')} sacas / unidades`);
  rows.push(`Produtividade Média Global;${mediaProd.toFixed(1)} scs/ha`);
  rows.push(`Total de Safras Registradas;${harvests.length}`);
  rows.push('');

  // 2. Tabela Detalhada com Balanço Químico Real vs Exportado
  rows.push('2. HISTÓRICO DETALHADO DE SAFRAS & BALANÇO NUTRICIONAL');
  rows.push(
    'Safra;Talhão;Cultura;Área (ha);Produtividade (scs/ha ou t/ha);Produção Total;Pontos SCA / Brix;Perfil Sensorial;N Aplicado (kg/ha);P2O5 Aplicado (kg/ha);K2O Aplicado (kg/ha);N Exportado Fruto (kg/ha);P2O5 Exportado Fruto (kg/ha);K2O Exportado Fruto (kg/ha);Balanço Líquido N (kg/ha);Balanço Líquido P2O5 (kg/ha);Balanço Líquido K2O (kg/ha);Observações de Campo'
  );

  harvests.forEach((h) => {
    const plot = plots.find((p) => p.id === h.plotId);
    const plotNome = plot ? plot.nome : 'Talhão não cadastrado';
    const cultura = plot?.cultura || 'Café';
    const areaHa = plot?.areaHa ? plot.areaHa.toFixed(1) : '-';

    const exportado = calcularExportacaoColheita(h.produtividadeSacasHa || 0);
    const balancoN = Number(((h.adubacaoRealN || 0) - exportado.nExportado).toFixed(1));
    const balancoP = Number(((h.adubacaoRealP2O5 || 0) - exportado.p2o5Exportado).toFixed(1));
    const balancoK = Number(((h.adubacaoRealK2O || 0) - exportado.k2oExportado).toFixed(1));

    const sca = h.pontosSCA ? h.pontosSCA.toString().replace('.', ',') : '-';
    const sensorial = h.perfilSensorial ? h.perfilSensorial.replace(/;/g, ',') : '-';
    const obs = h.observacoes ? h.observacoes.replace(/;/g, ',').replace(/\r?\n/g, ' ') : '';

    rows.push(
      `"${h.safra}";"${plotNome}";"${cultura}";${areaHa};${h.produtividadeSacasHa};${h.sacasTotais};${sca};"${sensorial}";${h.adubacaoRealN};${h.adubacaoRealP2O5};${h.adubacaoRealK2O};${exportado.nExportado};${exportado.p2o5Exportado};${exportado.k2oExportado};${balancoN};${balancoP};${balancoK};"${obs}"`
    );
  });

  const csvContent = BOM + rows.join('\r\n');
  const safeDateFile = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `Relatorio_Historico_Safras_Recreio_do_Morro_${safeDateFile}.csv`);
}

/**
 * Gera texto formatado de histórico de safras para WhatsApp
 */
export function generateHistoricosTxt(harvests: HarvestRecord[], plots: Plot[]): string {
  const totalSacas = harvests.reduce((acc, h) => acc + (h.sacasTotais || 0), 0);
  const mediaProd =
    harvests.length > 0
      ? harvests.reduce((acc, h) => acc + (h.produtividadeSacasHa || 0), 0) / harvests.length
      : 0;

  let text = `🏆 *RECREIO DO MORRO - HISTÓRICO DE SAFRAS & QUALIDADE*\n`;
  text += `📅 *Posição em:* ${new Date().toLocaleDateString('pt-BR')}\n`;
  text += `─────────────────────────────────────────\n\n`;

  text += `📈 *RESUMO DE PRODUÇÃO*\n`;
  text += `• *Volume Acumulado:* ${totalSacas.toLocaleString('pt-BR')} sacas / colheitas\n`;
  text += `• *Produtividade Média:* ${mediaProd.toFixed(1)} scs/ha\n`;
  text += `• *Safras Avaliadas:* ${harvests.length} safras registradas\n\n`;

  text += `☕ *DETALHAMENTO POR TALHÃO & QUALIDADE*\n`;
  harvests.forEach((h) => {
    const plot = plots.find((p) => p.id === h.plotId);
    text += `• *${h.safra} - ${plot?.nome || 'Talhão'}* (${plot?.cultura || 'Café'}):\n`;
    text += `  └ Produção: ${h.produtividadeSacasHa} scs/ha (Total: ${h.sacasTotais} scs)\n`;
    if (h.pontosSCA) {
      text += `  └ Qualidade Bebida: *${h.pontosSCA} pts SCA* ${h.perfilSensorial ? `(${h.perfilSensorial})` : ''}\n`;
    }
    const exportado = calcularExportacaoColheita(h.produtividadeSacasHa);
    const saldoK = ((h.adubacaoRealK2O || 0) - exportado.k2oExportado).toFixed(0);
    text += `  └ Balanço K2O: Aplicado ${h.adubacaoRealK2O}kg | Exportado ${exportado.k2oExportado}kg (Saldo: ${saldoK} kg/ha)\n`;
  });

  text += `\n─────────────────────────────────────────\n`;
  text += `Fazenda Recreio do Morro • Aprendizado de Máquina Retroalimentado\n`;
  return text;
}

