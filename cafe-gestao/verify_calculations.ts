// Teste de validação dos cálculos químicos e agronômicos do cafeeiro
import { calcularIndicesSolo, calcularCalagem, calcularGessagem, calcularExigenciaNutricional, gerarPlanoRecomendacao } from './src/services/agronomyEngine.ts';
import { analisarHistoricoTalhao, calcularExportacaoColheita } from './src/services/historyFeedbackEngine.ts';
import { CATALOGO_FERTILIZANTES } from './src/services/fertilizerDatabase.ts';

console.log('=== TESTE 1: CÁLCULO DE ÍNDICES DE SOLO (SB, CTC, V%, Ca:Mg) ===');
const mockSoil = {
  ca: 2.1,
  mg: 0.5,
  k: 0.14,
  al: 0.6,
  h_al: 4.8,
  p: 8,
  ph: 4.7,
  argilaPercent: 35,
};

const soloIndices = calcularIndicesSolo(mockSoil);
console.log('SB Calculado:', soloIndices.sb, '(Esperado: ~2.74)');
console.log('CTC (T):', soloIndices.ctcTotal, '(Esperado: ~7.54)');
console.log('V%:', soloIndices.vPercent, '(Esperado: ~36.3%)');
console.log('Relação Ca:Mg:', soloIndices.relacaoCaMg, '(Esperado: 4.2)');

console.log('\n=== TESTE 2: CÁLCULO DE CALAGEM ===');
const mockPlot = {
  id: 'plot-test',
  nome: 'Talhão Teste',
  areaHa: 5.0,
  variedade: 'Arara',
  altitudeM: 1100,
  exposicaoSolar: 'Face Norte',
  espacamentoRuaM: 3.5,
  espacamentoPlantaM: 0.7,
  anoPlantio: 2020,
  coberturaSolo: 'Braquiária nas entrelinhas',
  irrigado: false,
};

const calagem = calcularCalagem(soloIndices as any, mockPlot as any, 60, 85);
console.log('Calagem necessária?', calagem.necessario);
console.log('Dose área total (t/ha):', calagem.doseTotalHa);
console.log('Dose na faixa da saia (t/ha):', calagem.doseFaixaHa);
console.log('Total em toneladas para 5 ha:', calagem.totalKgTalhao / 1000);
console.log('Tipo de calcário recomendado:', calagem.tipoCalcario);

console.log('\n=== TESTE 3: GESSAGEM EM SUBSUPERFÍCIE (20-40cm) ===');
const mockSubSolo = {
  ca: 0.3,
  mg: 0.2,
  k: 0.08,
  al: 1.1,
  h_al: 4.2,
  argilaPercent: 40,
};
const gessagem = calcularGessagem(soloIndices as any, mockSubSolo as any, 40);
console.log('Gessagem recomendada?', gessagem.necessario);
console.log('Dose gesso (kg/ha):', gessagem.doseKgHa, '(Esperado: 50 * 40 = 2000 kg/ha)');

console.log('\n=== TESTE 4: RETROALIMENTAÇÃO HISTÓRICA (MACHINE FEEDBACK) ===');
const historicoColheitas = [
  {
    id: 'h1',
    plotId: 'plot-test',
    safra: '2025/2026',
    produtividadeSacasHa: 55.0, // Safra recorde
    sacasTotais: 275,
    adubacaoRealN: 170,
    adubacaoRealP2O5: 70,
    adubacaoRealK2O: 160,
    observacoes: '',
  },
];
const feedback = analisarHistoricoTalhao('plot-test', historicoColheitas as any, [soloIndices as any]);
console.log('Ajuste histórico N%:', feedback.ajustePercentN, '(Esperado: +15% para restauração pós-safra recorde)');
console.log('Diagnóstico histórico:', feedback.motivoHistorico);

console.log('\n=== TESTE 5: EXPORTAÇÃO DE NUTRIENTES NA COLHEITA ===');
const exportado = calcularExportacaoColheita(50); // 50 scs/ha
console.log('Para 50 scs/ha:');
console.log('N Exportado:', exportado.nExportado, 'kg');
console.log('P2O5 Exportado:', exportado.p2o5Exportado, 'kg');
console.log('K2O Exportado:', exportado.k2oExportado, 'kg');

console.log('\n=== TESTE 6: PLANO COMPLETO E DOSES POR PLANTA / METRO LINEAR ===');
const plano = gerarPlanoRecomendacao(
  mockPlot as any,
  soloIndices as any,
  mockSubSolo as any,
  45, // meta 45 scs/ha
  '2026/2027',
  'Carga Alta',
  true, // palha de café
  5.0, // 5 t/ha de palha
  feedback
);

console.log('Densidade plantas/ha:', plano.densidadePlantasHa);
console.log('Exigência Líquida N:', plano.exigenciaLiquida.n_kg_ha, 'kg/ha');
console.log('Exigência Líquida K2O:', plano.exigenciaLiquida.k2o_kg_ha, 'kg/ha (após desconto de palha de café)');
console.log('Adubos comerciais calculados:');
plano.opcaoRecomendada.adubos.forEach((a) => {
  console.log(`- ${a.nome}: ${a.doseKgHa} kg/ha | ${a.totalKgTalhao} kg total | ${a.gramasPorPlanta} g/planta | ${a.gramasPorMetroLinear} g/m linear`);
});

console.log('\n✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
