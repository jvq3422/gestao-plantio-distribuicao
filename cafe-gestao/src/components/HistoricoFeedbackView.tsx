import React, { useState } from 'react';
import { Plot, HarvestRecord, SoilAnalysis } from '../types';
import { calcularExportacaoColheita, analisarHistoricoTalhao } from '../services/historyFeedbackEngine';
import { Plus, Award, Scale, Sparkles, Trash2 } from 'lucide-react';

interface HistoricoFeedbackViewProps {
  plots: Plot[];
  harvests: HarvestRecord[];
  analyses: SoilAnalysis[];
  onOpenNewHarvestModal: (preselectedPlotId?: string) => void;
  onDeleteHarvest?: (harvestId: string) => void;
}

export const HistoricoFeedbackView: React.FC<HistoricoFeedbackViewProps> = ({
  plots,
  harvests,
  analyses,
  onOpenNewHarvestModal,
  onDeleteHarvest,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>(plots[0]?.id || '');

  React.useEffect(() => {
    if (!selectedPlotId && plots.length > 0) {
      setSelectedPlotId(plots[0].id);
    }
  }, [plots, selectedPlotId]);

  const filteredHarvests = harvests
    .filter((h) => !selectedPlotId || h.plotId === selectedPlotId)
    .sort((a, b) => b.safra.localeCompare(a.safra));

  const currentPlot = plots.find((p) => p.id === selectedPlotId);
  const feedback = currentPlot ? analisarHistoricoTalhao(currentPlot.id, harvests, analyses) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-recreio-gold-700 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Aprendizado Retroalimentado • Histórico de Safras</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-recreio-espresso-950 font-playfair">
            Histórico de Safras & Balanço Químico
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Monitoramento da extração de nutrientes pelas sacas colhidas e evolução da pontuação de xícara.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPlotId}
            onChange={(e) => setSelectedPlotId(e.target.value)}
            className="text-xs sm:text-sm font-semibold border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 focus:ring-2 focus:ring-recreio-gold-500 focus:outline-none"
          >
            <option value="">Todos os Talhões</option>
            {plots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <button
            onClick={() => onOpenNewHarvestModal(selectedPlotId)}
            style={{ backgroundColor: '#964f0b', color: '#ffffff' }}
            className="inline-flex items-center space-x-1.5 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Colheita Real</span>
          </button>
        </div>
      </div>

      {/* AI Machine Feedback Card */}
      {feedback && currentPlot && (
        <div
          className="text-white rounded-2xl p-6 shadow-md space-y-4 border border-[#643410]/60"
          style={{
            backgroundColor: '#231914',
            backgroundImage: 'linear-gradient(135deg, #231914 0%, #2e180d 100%)',
          }}
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-recreio-gold-400" />
              <h3 className="font-bold text-base text-stone-100">
                Diagnóstico de Safra: {currentPlot.nome}
              </h3>
            </div>
            <span className="text-xs font-semibold bg-stone-900 px-3 py-1 rounded-full text-recreio-gold-300 border border-stone-700">
              {feedback.tendenciaFertilidadeSolo}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {feedback.motivoHistorico}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Correção Nitrogênio</span>
              <span className={`text-base font-black ${feedback.ajustePercentN > 0 ? 'text-amber-400' : 'text-stone-200'}`}>
                {feedback.ajustePercentN > 0 ? `+${feedback.ajustePercentN}% (Restauração de Ramos)` : '0% (Equilibrado)'}
              </span>
            </div>
            <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Correção Potássio</span>
              <span className={`text-base font-black ${feedback.ajustePercentK < 0 ? 'text-folha-400' : feedback.ajustePercentK > 0 ? 'text-amber-400' : 'text-stone-200'}`}>
                {feedback.ajustePercentK < 0 ? `${feedback.ajustePercentK}% (Economia Solo Rico)` : feedback.ajustePercentK > 0 ? `+${feedback.ajustePercentK}% (Reposição)` : '0% (Equilibrado)'}
              </span>
            </div>
            <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Safra Anterior Colhida</span>
              <span className="text-base font-black text-stone-200 font-mono">
                {feedback.safraAnteriorColhida ? `${feedback.safraAnteriorColhida} scs/ha` : 'Sem registro'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Harvest List & Nutrient Balance */}
      <div className="space-y-4">
        {filteredHarvests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-recreio-gold-100 text-recreio-gold-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-recreio-gold-200">
              <Award className="w-7 h-7 text-recreio-gold-700" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-stone-800 font-playfair font-serif-brand">Nenhuma colheita registrada ainda</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Registre a produtividade real colhida e a pontuação de xícara (SCA) dos seus lotes para ativar o balanço químico de exportação de nutrientes e o motor de retroalimentação.
              </p>
            </div>
            <button
              onClick={() => onOpenNewHarvestModal(selectedPlotId)}
              className="inline-flex items-center space-x-2 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Primeira Colheita</span>
            </button>
          </div>
        ) : (
          filteredHarvests.map((harv) => {
          const plot = plots.find((p) => p.id === harv.plotId);
          const exportado = calcularExportacaoColheita(harv.produtividadeSacasHa);
          const saldoN = harv.adubacaoRealN - exportado.nExportado;
          const saldoK = harv.adubacaoRealK2O - exportado.k2oExportado;

          const isDestaqueSCA = Boolean(harv.pontosSCA && harv.pontosSCA >= 85.0);

          return (
            <div
              key={harv.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 sm:p-6 space-y-4 transition-all ${
                isDestaqueSCA ? 'border-recreio-gold-300 ring-1 ring-recreio-gold-200' : 'border-stone-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-stone-900">
                      Safra {harv.safra} • {plot?.nome || 'Talhão'}
                    </span>
                    {harv.pontosSCA && (
                      <span className="bg-recreio-gold-100 text-recreio-gold-950 border border-recreio-gold-300 text-xs font-black px-2.5 py-0.5 rounded-lg flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-recreio-gold-700" />
                        <span>{harv.pontosSCA} pts SCA</span>
                      </span>
                    )}
                  </div>
                  {harv.perfilSensorial && (
                    <p className="text-xs text-stone-600 italic mt-0.5 font-medium">
                      "{harv.perfilSensorial}"
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="text-right">
                    <span className="text-xs text-stone-400 uppercase font-bold block">Produtividade Real</span>
                    <span className="text-lg font-black text-recreio-gold-800 font-mono">
                      {harv.produtividadeSacasHa} scs/ha
                    </span>
                    <span className="text-[10px] text-stone-400 block font-mono">
                      ({harv.sacasTotais} scs no talhão)
                    </span>
                  </div>
                  {onDeleteHarvest && (
                    <button
                      onClick={() => onDeleteHarvest(harv.id)}
                      title="Excluir este registro de colheita"
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Balanço Nutricional: Aplicado vs Exportado */}
              <div className="bg-[#fcfaf6] rounded-xl p-4 border border-stone-200/80 space-y-3">
                <span className="text-[11px] font-bold text-stone-700 uppercase flex items-center space-x-1.5">
                  <Scale className="w-4 h-4 text-recreio-gold-700" />
                  <span>Balanço Químico da Safra (Aplicado vs Extraído pelo Grão):</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Nitrogênio */}
                  <div className="bg-white p-3 rounded-lg border border-stone-200/80 space-y-1">
                    <div className="flex justify-between font-bold text-stone-800">
                      <span>Nitrogênio (N)</span>
                      <span className={saldoN >= 0 ? 'text-folha-700' : 'text-rose-600'}>
                        {saldoN >= 0 ? `+${saldoN.toFixed(0)} kg saldo` : `${saldoN.toFixed(0)} kg déficit`}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 flex justify-between font-mono">
                      <span>Adubação aplicada: {harv.adubacaoRealN} kg/ha</span>
                      <span>Exportado: {exportado.nExportado} kg/ha</span>
                    </div>
                  </div>

                  {/* Potássio */}
                  <div className="bg-white p-3 rounded-lg border border-stone-200/80 space-y-1">
                    <div className="flex justify-between font-bold text-stone-800">
                      <span>Potássio (K₂O)</span>
                      <span className={saldoK >= 0 ? 'text-folha-700' : 'text-rose-600'}>
                        {saldoK >= 0 ? `+${saldoK.toFixed(0)} kg saldo` : `${saldoK.toFixed(0)} kg déficit`}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 flex justify-between font-mono">
                      <span>Adubação aplicada: {harv.adubacaoRealK2O} kg/ha</span>
                      <span>Exportado: {exportado.k2oExportado} kg/ha</span>
                    </div>
                  </div>
                </div>
              </div>

              {harv.observacoes && (
                <p className="text-xs text-stone-600">
                  <strong>Observações agronômicas:</strong> {harv.observacoes}
                </p>
              )}
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};
