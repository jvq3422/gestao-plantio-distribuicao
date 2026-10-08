import React, { useState } from 'react';
import { SoilAnalysis, Plot } from '../types';
import { calcularIndicesSolo } from '../services/agronomyEngine';
import { Plus, Beaker, AlertTriangle, CheckCircle2, ChevronRight, Activity, Calendar, Trash2 } from 'lucide-react';

interface AnalisesSoloViewProps {
  plots: Plot[];
  analyses: SoilAnalysis[];
  onOpenNewAnalysisModal: (preselectedPlotId?: string) => void;
  onDeleteAnalysis?: (analysisId: string) => void;
}

export const AnalisesSoloView: React.FC<AnalisesSoloViewProps> = ({
  plots,
  analyses,
  onOpenNewAnalysisModal,
  onDeleteAnalysis,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>(plots[0]?.id || '');

  React.useEffect(() => {
    if (!selectedPlotId && plots.length > 0) {
      setSelectedPlotId(plots[0].id);
    }
  }, [plots, selectedPlotId]);

  const filteredAnalyses = analyses
    .filter((a) => !selectedPlotId || a.plotId === selectedPlotId)
    .sort((a, b) => new Date(b.dataColeta).getTime() - new Date(a.dataColeta).getTime());

  const currentPlot = plots.find((p) => p.id === selectedPlotId);

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center space-x-2 font-playfair">
            <Beaker className="w-5 h-5 text-folha-700" />
            <span>Laudos de Fertilidade do Solo</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Rotina química (0-20 cm) e subsuperfície (20-40 cm) para calagem e gessagem.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPlotId}
            onChange={(e) => setSelectedPlotId(e.target.value)}
            className="text-xs sm:text-sm font-semibold border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 focus:ring-2 focus:ring-folha-600 focus:outline-none"
          >
            <option value="">Todos os Talhões</option>
            {plots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.variedade})
              </option>
            ))}
          </select>

          <button
            onClick={() => onOpenNewAnalysisModal(selectedPlotId)}
            style={{ backgroundColor: '#964f0b', color: '#ffffff' }}
            className="inline-flex items-center space-x-1.5 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Inserir Laudo</span>
          </button>
        </div>
      </div>

      {/* Analysis Cards */}
      {filteredAnalyses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-3">
          <Beaker className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-700">Nenhum laudo encontrado para este talhão</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Cadastre a análise de solo para calcular automaticamente a necessidade de calcário, gesso e formulação NPK.
          </p>
          <button
            onClick={() => onOpenNewAnalysisModal(selectedPlotId)}
            className="bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Cadastrar Primeira Análise
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAnalyses.map((item) => {
            const solo = calcularIndicesSolo(item);
            const plotOwner = plots.find((p) => p.id === item.plotId);
            const v = solo.vPercent || 0;
            const m = solo.mPercent || 0;
            const caMg = solo.relacaoCaMg || 0;

            const isVOk = v >= 60;
            const isSub = item.profundidade === '20-40cm';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5 hover:shadow-md transition-shadow"
              >
                {/* Card Title */}
                <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-base text-stone-900">
                        {plotOwner?.nome || 'Talhão'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isSub
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-folha-100 text-folha-800'
                        }`}
                      >
                        {item.profundidade}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-stone-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Coleta: {item.dataColeta}</span>
                      </span>
                      <span>• Lab: {item.laboratorio}</span>
                    </div>
                  </div>

                  {/* V% or m% highlight & Delete */}
                  <div className="flex items-center space-x-2.5">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        {isSub ? 'Toxidez Al (m%)' : 'Saturação Bases (V%)'}
                      </span>
                      <span
                        className={`text-xl font-extrabold ${
                          isSub
                            ? m > 20
                              ? 'text-rose-600'
                              : 'text-folha-600'
                            : isVOk
                            ? 'text-folha-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {isSub ? `${m.toFixed(1)}%` : `${v.toFixed(1)}%`}
                      </span>
                    </div>
                    {onDeleteAnalysis && (
                      <button
                        onClick={() => onDeleteAnalysis(item.id)}
                        title="Excluir este laudo"
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Agronomic Score Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">pH (CaCl₂)</span>
                    <span className="text-sm font-extrabold text-stone-800">{item.ph.toFixed(1)}</span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">M.O. (g/dm³)</span>
                    <span className="text-sm font-extrabold text-stone-800">{item.mo}</span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">P (mg/dm³)</span>
                    <span
                      className={`text-sm font-extrabold ${
                        item.p < 10 ? 'text-amber-600' : item.p > 30 ? 'text-blue-600' : 'text-stone-800'
                      }`}
                    >
                      {item.p}
                    </span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">K (cmolc)</span>
                    <span className="text-sm font-extrabold text-stone-800">{item.k.toFixed(2)}</span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Ca (cmolc)</span>
                    <span className="text-sm font-extrabold text-stone-800">{item.ca.toFixed(2)}</span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Mg (cmolc)</span>
                    <span className="text-sm font-extrabold text-stone-800">{item.mg.toFixed(2)}</span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">CTC pH 7 (T)</span>
                    <span className="text-sm font-extrabold text-stone-800">{solo.ctcTotal}</span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Relação Ca:Mg</span>
                    <span className="text-sm font-extrabold text-stone-800">{caMg.toFixed(1)}:1</span>
                  </div>
                </div>

                {/* Micronutrients if available */}
                {(item.b || item.zn || item.s) && (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-xs">
                    <span className="font-bold text-amber-900 block mb-1">Micronutrientes Críticos do Café:</span>
                    <div className="flex flex-wrap gap-4 text-stone-700">
                      {item.b && <span>Boro (B): <strong>{item.b} mg/dm³</strong></span>}
                      {item.zn && <span>Zinco (Zn): <strong>{item.zn} mg/dm³</strong></span>}
                      {item.s && <span>Enxofre (S): <strong>{item.s} mg/dm³</strong></span>}
                      {item.argilaPercent && <span>Argila: <strong>{item.argilaPercent}%</strong></span>}
                    </div>
                  </div>
                )}

                {/* Quick Diagnostics */}
                <div className="flex items-start space-x-2 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  {isSub ? (
                    m > 20 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>Alerta Subsuperfície: m% alto ({m.toFixed(1)}%). Requer aplicação de <strong>gesso agrícola</strong> para raízes descerem.</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-folha-600 shrink-0 mt-0.5" />
                        <span>Subsuperfície saudável (m &le; 20%). Sem impedimento químico para o enraizamento profundo.</span>
                      </>
                    )
                  ) : isVOk ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-folha-600 shrink-0 mt-0.5" />
                      <span>Saturação por bases no nível ideal para o cafeeiro ({v.toFixed(1)}% &ge; 60%). Foco em adubação de produção.</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Acidez detectada (V% = {v.toFixed(1)}%). Necessita de calagem para elevar a 60% e maximizar eficiência do adubo.</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
