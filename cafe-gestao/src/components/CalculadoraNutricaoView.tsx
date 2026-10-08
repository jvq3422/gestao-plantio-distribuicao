import React, { useState, useEffect } from 'react';
import { Plot, SoilAnalysis, HarvestRecord, RecommendationPlan, BienalidadeCiclo, ParametrosAgronomicos } from '../types';
import { gerarPlanoRecomendacao } from '../services/agronomyEngine';
import { analisarHistoricoTalhao } from '../services/historyFeedbackEngine';
import { StorageService } from '../services/storageService';
import { exportCalculoExcel, generateCalculoTxt, copyToClipboard } from '../services/exportService';
import {
  Calculator,
  Sparkles,
  AlertCircle,
  Clock,
  Package,
  Leaf,
  FileText,
  ShieldAlert,
  Sliders,
  FileSpreadsheet,
  Copy,
  Check,
} from 'lucide-react';

interface CalculadoraNutricaoViewProps {
  plots: Plot[];
  analyses: SoilAnalysis[];
  harvests: HarvestRecord[];
  initialPlotId?: string;
  onViewWorkOrder: (plan: RecommendationPlan) => void;
}

export const CalculadoraNutricaoView: React.FC<CalculadoraNutricaoViewProps> = ({
  plots,
  analyses,
  harvests,
  initialPlotId,
  onViewWorkOrder,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>(initialPlotId || plots[0]?.id || '');
  const [metaSacas, setMetaSacas] = useState<number>(40);
  const [safra, setSafra] = useState<string>('2026/2027');
  const [cicloBienalidade, setCicloBienalidade] = useState<BienalidadeCiclo>('Carga Alta');
  const [usaPalhaCafe, setUsaPalhaCafe] = useState<boolean>(true);
  const [palhaTonsHa, setPalhaTonsHa] = useState<number>(5.0);

  // Sincronizar seleção quando os talhões chegarem da nuvem
  useEffect(() => {
    if (initialPlotId) {
      setSelectedPlotId(initialPlotId);
    } else if (!selectedPlotId && plots.length > 0) {
      setSelectedPlotId(plots[0].id);
    } else if (selectedPlotId && !plots.some((p) => p.id === selectedPlotId) && plots.length > 0) {
      setSelectedPlotId(plots[0].id);
    }
  }, [plots, initialPlotId, selectedPlotId]);

  // Parâmetros Químicos Dinâmicos (Sem hardcoding)
  const [parametros, setParametros] = useState<ParametrosAgronomicos>(() => StorageService.getParametros());
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  const currentPlot = plots.find((p) => p.id === selectedPlotId);

  // Análises de solo disponíveis para o talhão
  const analisesDoTalhao = analyses
    .filter((a) => a.plotId === selectedPlotId)
    .sort((a, b) => new Date(b.dataColeta).getTime() - new Date(a.dataColeta).getTime());

  const analise0_20 = analisesDoTalhao.find((a) => a.profundidade === '0-20cm') || analisesDoTalhao[0];
  const analise20_40 = analisesDoTalhao.find((a) => a.profundidade === '20-40cm');

  // Estado do plano gerado
  const [planoAtual, setPlanoAtual] = useState<RecommendationPlan | null>(null);
  const [copiedCalculo, setCopiedCalculo] = useState<boolean>(false);

  // Salvar parâmetros sempre que alterados
  const handleUpdateParametros = (novosParams: Partial<ParametrosAgronomicos>) => {
    const atualizados = { ...parametros, ...novosParams };
    setParametros(atualizados);
    StorageService.saveParametros(atualizados);
  };

  // Calcular plano sempre que os parâmetros mudarem
  useEffect(() => {
    if (!currentPlot || !analise0_20) {
      setPlanoAtual(null);
      return;
    }

    // 1. Processar inteligência histórica
    const feedbackHistorico = analisarHistoricoTalhao(currentPlot.id, harvests, analyses);

    // 2. Gerar recomendação química dinâmica com os parâmetros configurados
    const catalogo = StorageService.getFertilizantes();
    const plano = gerarPlanoRecomendacao(
      currentPlot,
      analise0_20,
      analise20_40,
      metaSacas,
      safra,
      cicloBienalidade,
      usaPalhaCafe,
      palhaTonsHa,
      feedbackHistorico,
      parametros,
      catalogo
    );

    setPlanoAtual(plano);
    StorageService.savePlan(plano);
  }, [selectedPlotId, metaSacas, safra, cicloBienalidade, usaPalhaCafe, palhaTonsHa, analyses, harvests, parametros]);

  if (!currentPlot) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center space-y-4 shadow-sm max-w-xl mx-auto my-8">
        <div className="w-14 h-14 bg-recreio-gold-100 text-recreio-gold-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-recreio-gold-200">
          <Calculator className="w-7 h-7 text-recreio-gold-700" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-stone-800 font-playfair font-serif-brand">Nenhum talhão disponível para cálculo</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Para calcular o equilíbrio de bases (V%), calagem, gessagem e formulação NPK por planta e metro linear, cadastre seu talhão na aba "Talhões & Terroir" e insira a análise de solo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Parameter Control Panel */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-recreio-gold-900 uppercase tracking-widest bg-recreio-gold-100 border border-recreio-gold-300 px-2.5 py-0.5 rounded-full">
                Recreio do Morro • Nutrição de Precisão
              </span>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                {currentPlot.altitudeM}m de Altitude
              </span>
            </div>
            <h2 className="text-2xl font-black text-recreio-espresso-950 mt-1 flex items-center space-x-2 font-playfair">
              <Calculator className="w-6 h-6 text-recreio-gold-600" />
              <span>Cálculo Nutricional para Cafés Nobres</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Fórmula balanceada para preservar aromas florais/frutados, dureza do grão e acidez cristalina da Chapada Diamantina.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className="inline-flex items-center space-x-1.5 bg-[#f6eee2] hover:bg-[#ebdcc8] text-recreio-gold-900 border border-recreio-gold-300 text-xs font-bold px-3 py-2 rounded-xl transition-all min-h-[38px]"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showConfigPanel ? 'Ocultar Parâmetros' : 'Parâmetros Químicos'}</span>
            </button>

            {planoAtual && currentPlot && (
              <>
                <button
                  onClick={() => onViewWorkOrder(planoAtual)}
                  style={{ backgroundColor: '#231914', color: '#ffffff' }}
                  className="inline-flex items-center space-x-1.5 bg-recreio-espresso-950 hover:bg-black text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-md transition-all min-h-[38px] active:scale-95"
                  title="Visualizar e Imprimir Ficha de Campo em PDF"
                >
                  <FileText className="w-4 h-4 text-[#e0a442]" />
                  <span>Ficha PDF</span>
                </button>

                <button
                  onClick={() => exportCalculoExcel(planoAtual, currentPlot)}
                  className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-md transition-all min-h-[38px]"
                  title="Baixar Planilha Excel com todos os cálculos"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel (.csv)</span>
                </button>

                <button
                  onClick={async () => {
                    const text = generateCalculoTxt(planoAtual, currentPlot);
                    const ok = await copyToClipboard(text);
                    if (ok) {
                      setCopiedCalculo(true);
                      setTimeout(() => setCopiedCalculo(false), 2500);
                    }
                  }}
                  className={`inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border transition-all min-h-[38px] ${
                    copiedCalculo
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
                  title="Copiar resumo formatado para enviar no WhatsApp"
                >
                  {copiedCalculo ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
                  <span>{copiedCalculo ? 'Copiado!' : 'Copiar TXT'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Parameter Settings Drawer (Sem Hardcoding) */}
        {showConfigPanel && (
          <div className="bg-[#fcfaf6] border border-recreio-gold-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-recreio-gold-100 pb-2">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-recreio-gold-700" />
                <h4 className="text-xs font-extrabold text-recreio-espresso-950 uppercase tracking-wider">
                  Configurações do Motor Químico (Customizável pelo Produtor)
                </h4>
              </div>
              <span className="text-[10px] text-stone-400">Totalmente dinâmico, sem fórmulas travadas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Meta Saturação por Bases (V%):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="50"
                    max="75"
                    step="1"
                    value={parametros.vDesejado}
                    onChange={(e) => handleUpdateParametros({ vDesejado: Number(e.target.value) })}
                    className="w-full accent-recreio-gold-600"
                  />
                  <span className="font-mono font-black text-recreio-espresso-950 bg-white border border-stone-200 px-2 py-0.5 rounded text-xs">
                    {parametros.vDesejado}%
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  65% a 70% recomendado para grãos pesados e alta densidade
                </span>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Demanda de Nitrogênio (kg N / saca):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    min="2.0"
                    max="4.0"
                    value={parametros.kgNPorSaca}
                    onChange={(e) => handleUpdateParametros({ kgNPorSaca: Number(e.target.value) })}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1 bg-white font-mono font-bold"
                  />
                  <span className="text-stone-500 font-mono text-[11px]">kg/sc</span>
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  3.0 kg evita excesso de vegetação que afeta notas sensoriais
                </span>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  PRNT do Calcário Utilizado (%):
                </label>
                <input
                  type="number"
                  step="1"
                  min="60"
                  max="100"
                  value={parametros.prntPadrao}
                  onChange={(e) => handleUpdateParametros({ prntPadrao: Number(e.target.value) })}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1 bg-white font-mono font-bold"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Padrão 85% para calcários magnesianos/dolomíticos
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Talhão Selector */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1.5">Talhão de Origem:</label>
            <select
              value={selectedPlotId}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold border border-stone-300 rounded-xl px-3 py-2.5 bg-stone-50 focus:ring-2 focus:ring-recreio-gold-500 focus:outline-none"
            >
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.variedade} • {p.altitudeM}m)
                </option>
              ))}
            </select>
          </div>

          {/* Target Yield (Meta de Sacas/ha) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700">Meta Produtiva:</label>
              <span className="text-xs font-black text-recreio-gold-800">{metaSacas} scs/ha</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="15"
                max="80"
                step="5"
                value={metaSacas}
                onChange={(e) => setMetaSacas(Number(e.target.value))}
                className="w-full accent-recreio-gold-600 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold bg-stone-100 px-2 py-1 rounded-md text-stone-800 shrink-0">
                {metaSacas} sc/ha
              </span>
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Previsão de safra: {(metaSacas * currentPlot.areaHa).toFixed(0)} sacas no talhão
            </span>
          </div>

          {/* Biennial Cycle */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1.5">Ciclo Fenológico:</label>
            <select
              value={cicloBienalidade}
              onChange={(e) => setCicloBienalidade(e.target.value as BienalidadeCiclo)}
              className="w-full text-xs sm:text-sm font-semibold border border-stone-300 rounded-xl px-3 py-2.5 bg-stone-50 focus:ring-2 focus:ring-recreio-gold-500 focus:outline-none"
            >
              <option value="Carga Alta">Carga Alta (Ano Produtivo On)</option>
              <option value="Carga Baixa / Descanso">Carga Baixa / Repouso (Ano Off)</option>
              <option value="Pós-Safra Recorde (Esgotamento)">Pós-Safra Recorde (Restauração)</option>
              <option value="Ano Normal">Ano Normal / Estável</option>
            </select>
          </div>

          {/* Safra */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1.5">Safra de Aplicação:</label>
            <input
              type="text"
              value={safra}
              onChange={(e) => setSafra(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
            />
          </div>
        </div>

        {/* Organic Credits & Palha de Café */}
        <div className="bg-[#fcfaf6] border border-recreio-gold-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-recreio-gold-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Leaf className="w-5 h-5 text-recreio-gold-100" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-recreio-espresso-950 flex items-center space-x-2">
                <span>Reciclagem da Palha de Café do Terreiro</span>
                <span className="text-[10px] bg-recreio-gold-100 text-recreio-gold-900 border border-recreio-gold-300 font-bold px-2 py-0.2 rounded-full">
                  Potássio Orgânico Gratuito
                </span>
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                A casca residual das cerejas colhidas na Chapada Diamantina retorna à saia do cafeeiro, fornecendo K₂O orgânico e retendo umidade.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 shrink-0 bg-white p-2.5 rounded-xl border border-recreio-gold-200">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-stone-800">
              <input
                type="checkbox"
                checked={usaPalhaCafe}
                onChange={(e) => setUsaPalhaCafe(e.target.checked)}
                className="w-4 h-4 rounded text-recreio-gold-600 focus:ring-recreio-gold-500"
              />
              <span>Abater Palha</span>
            </label>
            {usaPalhaCafe && (
              <div className="flex items-center space-x-1.5 text-xs font-bold">
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="0.5"
                  value={palhaTonsHa}
                  onChange={(e) => setPalhaTonsHa(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-stone-300 rounded-lg text-center"
                />
                <span className="text-stone-600">t/ha</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!analise0_20 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-amber-900 text-sm">Este talhão não possui análise de solo cadastrada</h3>
          <p className="text-xs text-amber-700">
            Acesse a aba "Laudo de Solo & Subsolo" para registrar os dados químicos antes de calcular.
          </p>
        </div>
      ) : (
        planoAtual && (
          <div className="space-y-6">
            <div
              style={{ backgroundColor: '#231914', color: '#ffffff' }}
              className="bg-recreio-espresso-950 text-white rounded-2xl p-5 shadow-sm space-y-3 border border-[#643410]"
            >
              <div className="flex items-center space-x-2 text-recreio-gold-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Inteligência Retroalimentada • Calibração Contínua de Safras</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                {planoAtual.ajusteHistorico.motivoHistorico}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-xs">
                <span className="bg-stone-900 px-3 py-1 rounded-lg border border-stone-800 text-recreio-gold-300">
                  Ajuste Nitrogênio: <strong>{planoAtual.ajusteHistorico.ajustePercentN > 0 ? '+' : ''}{planoAtual.ajusteHistorico.ajustePercentN}%</strong>
                </span>
                <span className="bg-stone-900 px-3 py-1 rounded-lg border border-stone-800 text-recreio-gold-300">
                  Ajuste Potássio: <strong>{planoAtual.ajusteHistorico.ajustePercentK > 0 ? '+' : ''}{planoAtual.ajusteHistorico.ajustePercentK}%</strong>
                </span>
                <span className="bg-stone-900 px-3 py-1 rounded-lg border border-stone-800 text-stone-300">
                  Tendência do Solo: <strong>{planoAtual.ajusteHistorico.tendenciaFertilidadeSolo}</strong>
                </span>
              </div>
            </div>

            {/* Calagem e Gessagem Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Calagem */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-recreio-gold-900 uppercase bg-recreio-gold-50 border border-recreio-gold-200 px-2 py-0.5 rounded">
                      Equilíbrio Iônico
                    </span>
                    <h3 className="text-lg font-bold text-stone-900 mt-1">Calagem do Solo</h3>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      planoAtual.calagem.necessario
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-folha-100 text-folha-800'
                    }`}
                  >
                    {planoAtual.calagem.necessario ? 'Aplicação Necessária' : `V% no Nível Ideal (${parametros.vDesejado}%)`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-stone-400 font-bold uppercase block text-[10px]">V% Atual / Meta</span>
                    <span className="font-extrabold text-stone-800 text-sm">
                      {planoAtual.calagem.vAtual.toFixed(1)}% &rarr; {planoAtual.calagem.vDesejado}%
                    </span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-stone-400 font-bold uppercase block text-[10px]">Dose na Saia (Faixa)</span>
                    <span className="font-extrabold text-stone-800 text-sm">
                      {planoAtual.calagem.doseFaixaHa} t/ha
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-stone-600">
                  <p>
                    <strong>Tipo Recomendado:</strong> {planoAtual.calagem.tipoCalcario}
                  </p>
                  <p>
                    <strong>Total para o Talhão ({currentPlot.areaHa} ha):</strong>{' '}
                    <span className="font-bold text-recreio-gold-800 text-sm">
                      {(planoAtual.calagem.totalKgTalhao / 1000).toFixed(1)} toneladas
                    </span>
                  </p>
                  <p className="text-stone-500 italic text-[11px]">{planoAtual.calagem.diagnostico}</p>
                </div>
              </div>

              {/* Card Gessagem */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded">
                      Enraizamento Profundo
                    </span>
                    <h3 className="text-lg font-bold text-stone-900 mt-1">Gessagem Agrícola</h3>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      planoAtual.gessagem.necessario
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {planoAtual.gessagem.necessario ? 'Recomendado' : 'Subsolo Saudável'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-stone-400 font-bold uppercase block text-[10px]">Dose por Hectare</span>
                    <span className="font-extrabold text-stone-800 text-sm">
                      {planoAtual.gessagem.doseKgHa} kg/ha
                    </span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-stone-400 font-bold uppercase block text-[10px]">Total Talhão</span>
                    <span className="font-extrabold text-stone-800 text-sm">
                      {(planoAtual.gessagem.totalKgTalhao / 1000).toFixed(1)} toneladas
                    </span>
                  </div>
                </div>

                <div className="text-xs text-stone-600">
                  <p className="leading-relaxed">{planoAtual.gessagem.motivo}</p>
                </div>
              </div>
            </div>

            {/* Nutrientes Totais (Balanço Químico) */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Exigência Nutricional Líquida (kg/ha)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Nutrição balanceada para garantir teor brix alto sem amargor ou desfolha.
                  </p>
                </div>
                {usaPalhaCafe && (
                  <span className="text-xs font-bold text-recreio-gold-900 bg-recreio-gold-50 border border-recreio-gold-300 px-3 py-1 rounded-full self-start">
                    Economia: -{planoAtual.descontoOrganico.k2oAbatido} kg/ha de K₂O pela palha
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                <div className="bg-[#fcfaf6] p-3 rounded-xl border border-stone-100">
                  <span className="text-[11px] font-bold text-stone-500 uppercase block">Nitrogênio (N)</span>
                  <span className="text-xl font-black text-recreio-espresso-950">{planoAtual.exigenciaLiquida.n_kg_ha}</span>
                  <span className="text-[10px] text-stone-400 block">kg/ha</span>
                </div>
                <div className="bg-[#fcfaf6] p-3 rounded-xl border border-stone-100">
                  <span className="text-[11px] font-bold text-stone-500 uppercase block">Fósforo (P₂O₅)</span>
                  <span className="text-xl font-black text-amber-700">{planoAtual.exigenciaLiquida.p2o5_kg_ha}</span>
                  <span className="text-[10px] text-stone-400 block">kg/ha</span>
                </div>
                <div className="bg-[#fcfaf6] p-3 rounded-xl border border-stone-100">
                  <span className="text-[11px] font-bold text-stone-500 uppercase block">Potássio (K₂O)</span>
                  <span className="text-xl font-black text-recreio-gold-700">{planoAtual.exigenciaLiquida.k2o_kg_ha}</span>
                  <span className="text-[10px] text-stone-400 block">kg/ha</span>
                </div>
                <div className="bg-[#fcfaf6] p-3 rounded-xl border border-stone-100">
                  <span className="text-[11px] font-bold text-stone-500 uppercase block">Enxofre (S)</span>
                  <span className="text-xl font-black text-stone-800">{planoAtual.exigenciaLiquida.s_kg_ha}</span>
                  <span className="text-[10px] text-stone-400 block">kg/ha</span>
                </div>
                <div className="bg-[#fcfaf6] p-3 rounded-xl border border-stone-100">
                  <span className="text-[11px] font-bold text-stone-500 uppercase block">Boro (B)</span>
                  <span className="text-xl font-black text-purple-700">{planoAtual.exigenciaLiquida.b_kg_ha}</span>
                  <span className="text-[10px] text-stone-400 block">kg/ha</span>
                </div>
                <div className="bg-[#fcfaf6] p-3 rounded-xl border border-stone-100">
                  <span className="text-[11px] font-bold text-stone-500 uppercase block">Zinco (Zn)</span>
                  <span className="text-xl font-black text-blue-700">{planoAtual.exigenciaLiquida.zn_kg_ha}</span>
                  <span className="text-[10px] text-stone-400 block">kg/ha</span>
                </div>
              </div>
            </div>

            {/* Formulação de Adubos Comerciais Recomendados */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-recreio-gold-600" />
                    <span>Matérias-Primas e Adubos Comerciais a Aplicar</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Quantidades calculadas para suprir com precisão a exigência química.
                  </p>
                </div>
                <div className="bg-[#fcfaf6] border border-recreio-gold-200 px-3.5 py-1.5 rounded-xl text-right">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Custo Estimado no Talhão</span>
                  <span className="text-sm sm:text-base font-black text-recreio-espresso-950 font-mono">
                    R$ {planoAtual.opcaoRecomendada.custoTotalTalhao.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Visualização Mobile: Cards de Calibração Touch-Friendly */}
              <div className="md:hidden space-y-3">
                {planoAtual.opcaoRecomendada.adubos.map((adubo, idx) => (
                  <div
                    key={idx}
                    className="bg-[#fcfaf6] rounded-xl p-4 border border-stone-200/90 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                      <span className="font-bold text-stone-900 text-sm">{adubo.nome}</span>
                      <span className="text-xs font-mono font-bold text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200">
                        {adubo.sacas50kg} sacas
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-[#f5ede0] p-2.5 rounded-lg border border-recreio-gold-200">
                        <span className="text-[10px] uppercase font-black text-recreio-espresso-950 block">
                          g / Metro Linear (Trator)
                        </span>
                        <span className="text-base font-black font-mono text-recreio-espresso-950">
                          {adubo.gramasPorMetroLinear} g/m
                        </span>
                      </div>
                      <div className="bg-recreio-gold-50 p-2.5 rounded-lg border border-recreio-gold-200">
                        <span className="text-[10px] uppercase font-black text-recreio-gold-900 block">
                          g / Cova (Planta)
                        </span>
                        <span className="text-base font-black font-mono text-recreio-gold-900">
                          {adubo.gramasPorPlanta} g
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                      <span>Dose: <strong>{adubo.doseKgHa} kg/ha</strong></span>
                      <span>Total Talhão: <strong>{adubo.totalKgTalhao.toLocaleString()} kg</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visualização Desktop: Tabela Completa de Insumos */}
              <div className="hidden md:block overflow-x-auto touch-scroll">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-y border-stone-200">
                    <tr>
                      <th className="py-3 px-3">Fertilizante Comercial</th>
                      <th className="py-3 px-3 text-right">Dose (kg/ha)</th>
                      <th className="py-3 px-3 text-right">Total Talhão ({currentPlot.areaHa} ha)</th>
                      <th className="py-3 px-3 text-right">Sacos (50 kg)</th>
                      <th className="py-3 px-3 text-right text-recreio-gold-900 font-extrabold bg-recreio-gold-50/70">
                        g / Planta
                      </th>
                      <th className="py-3 px-3 text-right text-recreio-espresso-950 font-extrabold bg-[#f5ede0]">
                        g / Metro Linear (Trator)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {planoAtual.opcaoRecomendada.adubos.map((adubo, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-stone-900">{adubo.nome}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold">{adubo.doseKgHa} kg</td>
                        <td className="py-3 px-3 text-right font-mono">{adubo.totalKgTalhao.toLocaleString()} kg</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-stone-700">
                          {adubo.sacas50kg} scs
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-recreio-gold-900 bg-recreio-gold-50/40">
                          {adubo.gramasPorPlanta} g
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-recreio-espresso-950 bg-[#f5ede0]/50">
                          {adubo.gramasPorMetroLinear} g/m
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cronograma de Parcelamento Fenológico (3 Parcelas) */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
                <Clock className="w-5 h-5 text-recreio-gold-600" />
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Cronograma de Parcelamento das Adubações
                  </h3>
                  <p className="text-xs text-stone-500">
                    Acompanhamento fenológico durante a estação das águas na Chapada Diamantina.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {planoAtual.cronogramaParcelamento.map((parcela) => (
                  <div
                    key={parcela.numero}
                    className="border border-stone-200 rounded-2xl p-5 space-y-3 bg-[#fdfbf7] hover:bg-white hover:border-recreio-gold-500 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white bg-recreio-gold-700 px-2 py-0.5 rounded-md uppercase">
                          {parcela.numero}ª Parcela ({parcela.mesReferencia})
                        </span>
                        <span className="text-[11px] font-bold text-stone-500">
                          {parcela.percentualN}% N / {parcela.percentualK}% K
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm">{parcela.faseFenologica}</h4>

                      <div className="space-y-1.5 pt-2 border-t border-stone-200/60">
                        {parcela.adubos.map((a, i) => (
                          <div key={i} className="text-xs bg-white p-2 rounded-lg border border-stone-100 flex justify-between">
                            <span className="text-stone-700 font-medium">{a.nome}</span>
                            <span className="font-mono font-bold text-stone-900">{a.doseKgHa} kg/ha</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 text-[11px] text-amber-950 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 flex items-start space-x-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>{parcela.condicoesClimaticasEAlerta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
