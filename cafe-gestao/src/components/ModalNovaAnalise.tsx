import React, { useState, useEffect } from 'react';
import { SoilAnalysis, Plot, SoilDepth } from '../types';
import { calcularIndicesSolo } from '../services/agronomyEngine';
import { X, Beaker, AlertTriangle } from 'lucide-react';
import { DecimalInput } from './DecimalInput';

interface ModalNovaAnaliseProps {
  isOpen: boolean;
  plots: Plot[];
  preselectedPlotId?: string;
  onClose: () => void;
  onSave: (analysis: SoilAnalysis) => void;
  onOpenNewPlotModal?: () => void;
}

export const ModalNovaAnalise: React.FC<ModalNovaAnaliseProps> = ({
  isOpen,
  plots,
  preselectedPlotId,
  onClose,
  onSave,
  onOpenNewPlotModal,
}) => {
  const [plotId, setPlotId] = useState<string>(preselectedPlotId || plots[0]?.id || '');
  const [dataColeta, setDataColeta] = useState<string>(new Date().toISOString().split('T')[0]);
  const [profundidade, setProfundidade] = useState<SoilDepth>('0-20cm');
  const [laboratorio, setLaboratorio] = useState('LabAgro Análises');
  const [ph, setPh] = useState<number>(5.2);
  const [mo, setMo] = useState<number>(28);
  const [p, setP] = useState<number>(14);
  const [k, setK] = useState<number>(0.22);
  const [ca, setCa] = useState<number>(2.9);
  const [mg, setMg] = useState<number>(0.8);
  const [al, setAl] = useState<number>(0.1);
  const [h_al, setH_al] = useState<number>(3.6);
  const [argilaPercent, setArgilaPercent] = useState<number>(35);
  const [b, setB] = useState<number>(0.9);
  const [zn, setZn] = useState<number>(2.2);
  const [s, setS] = useState<number>(12);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sincroniza o plotId sempre que o modal abre ou os talhões mudam
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (preselectedPlotId && plots.some((p) => p.id === preselectedPlotId)) {
        setPlotId(preselectedPlotId);
      } else if (plots.length > 0 && (!plotId || !plots.some((p) => p.id === plotId))) {
        setPlotId(plots[0].id);
      } else if (plots.length === 0) {
        setPlotId('');
      }
    }
  }, [isOpen, preselectedPlotId, plots]);

  if (!isOpen) return null;

  // Pré-visualização instantânea dos cálculos
  const preview = calcularIndicesSolo({
    ca,
    mg,
    k,
    al,
    h_al,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!plotId) {
      if (plots.length === 0) {
        setErrorMsg('É necessário cadastrar pelo menos um talhão antes de salvar o laudo de solo.');
      } else {
        setErrorMsg('Por favor, selecione um talhão na lista.');
      }
      return;
    }

    const novaAnalise: SoilAnalysis = {
      id: `soil-${Date.now()}`,
      plotId,
      dataColeta,
      profundidade,
      laboratorio,
      ph,
      mo,
      p,
      k,
      ca,
      mg,
      al,
      h_al,
      argilaPercent,
      b,
      zn,
      s,
      ...preview,
    };

    onSave(novaAnalise);
    onClose();
  };

  const selectedPlot = plots.find((p) => p.id === plotId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto sm:my-8">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-recreio-gold-100 text-recreio-gold-900 border border-recreio-gold-200 flex items-center justify-center font-bold">
              <Beaker className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900 font-playfair">Novo Laudo de Solo</h3>
              {selectedPlot && (
                <p className="text-[11px] text-stone-500">
                  Talhão: <strong>{selectedPlot.nome}</strong> ({selectedPlot.cultura || 'Café'} • {selectedPlot.variedade})
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 active:bg-stone-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-scroll overscroll-contain">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start space-x-2 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <p className="font-bold">{errorMsg}</p>
                  {plots.length === 0 && onOpenNewPlotModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenNewPlotModal();
                      }}
                      className="mt-2 px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700"
                    >
                      Cadastrar Talhão Agora
                    </button>
                  )}
                </div>
              </div>
            )}

            {plots.length === 0 && !errorMsg && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start space-x-2 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-bold">Nenhum talhão cadastrado no sistema.</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Cadastre um talhão primeiro para poder vincular os laudos de análise.
                  </p>
                  {onOpenNewPlotModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenNewPlotModal();
                      }}
                      className="mt-2 px-3 py-1 bg-amber-700 text-white rounded-lg font-bold text-xs hover:bg-amber-800"
                    >
                      Cadastrar Talhão
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Talhão de Destino:</label>
                <select
                  value={plotId}
                  onChange={(e) => {
                    setPlotId(e.target.value);
                    setErrorMsg(null);
                  }}
                  required
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-medium text-xs min-h-[40px]"
                >
                  {plots.length === 0 && <option value="">Nenhum talhão disponível</option>}
                  {plots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.cultura || 'Café'} • {p.variedade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Profundidade da Camada:</label>
                <select
                  value={profundidade}
                  onChange={(e) => setProfundidade(e.target.value as SoilDepth)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-medium text-xs min-h-[40px]"
                >
                  <option value="0-20cm">0 - 20 cm (Rotina / Calagem)</option>
                  <option value="20-40cm">20 - 40 cm (Subsolo / Gessagem)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Data da Amostragem:</label>
                <input
                  type="date"
                  value={dataColeta}
                  onChange={(e) => setDataColeta(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 text-xs min-h-[40px]"
                />
              </div>
            </div>

            <div className="border-t border-stone-100 pt-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-stone-900 text-xs">Macronutrientes e Acidez (Valores Decimais aceitos com vírgula ou ponto):</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-medium text-stone-600 block mb-1">pH em CaCl₂:</label>
                  <DecimalInput
                    value={ph}
                    onChange={setPh}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white focus:ring-1 focus:ring-recreio-gold-600"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-600 block mb-1">M.O. (g/dm³):</label>
                  <DecimalInput
                    value={mo}
                    onChange={setMo}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white focus:ring-1 focus:ring-recreio-gold-600"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-600 block mb-1">Fósforo P (mg/dm³):</label>
                  <DecimalInput
                    value={p}
                    onChange={setP}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white focus:ring-1 focus:ring-recreio-gold-600"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-600 block mb-1">K (cmolc/dm³):</label>
                  <DecimalInput
                    value={k}
                    onChange={setK}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white focus:ring-1 focus:ring-recreio-gold-600"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-600 block mb-1">Cálcio Ca (cmolc):</label>
                  <DecimalInput
                    value={ca}
                    onChange={setCa}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white focus:ring-1 focus:ring-recreio-gold-600"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-600 block mb-1">Magnésio Mg (cmolc):</label>
                  <DecimalInput
                    value={mg}
                    onChange={setMg}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white focus:ring-1 focus:ring-recreio-gold-600"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-600 block mb-1">Alumínio Al (cmolc):</label>
                  <DecimalInput
                    value={al}
                    onChange={setAl}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white focus:ring-1 focus:ring-recreio-gold-600"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-600 block mb-1">H+Al (cmolc/dm³):</label>
                  <DecimalInput
                    value={h_al}
                    onChange={setH_al}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white focus:ring-1 focus:ring-recreio-gold-600"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-3">
              <h4 className="font-bold text-stone-900 mb-2 text-xs">Micronutrientes e Textura:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-medium text-stone-600 block mb-1">Argila (%):</label>
                  <DecimalInput
                    value={argilaPercent}
                    onChange={setArgilaPercent}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-600 block mb-1">Boro B (mg/dm³):</label>
                  <DecimalInput
                    value={b}
                    onChange={setB}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-600 block mb-1">Zinco Zn (mg/dm³):</label>
                  <DecimalInput
                    value={zn}
                    onChange={setZn}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-600 block mb-1">Enxofre S (mg/dm³):</label>
                  <DecimalInput
                    value={s}
                    onChange={setS}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Cálculos Calculados em Tempo Real */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] font-bold">SB</span>
                <strong className="font-mono">{preview.sb}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] font-bold">CTC (T)</span>
                <strong className="font-mono">{preview.ctcTotal}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] font-bold">V% Calculado</span>
                <strong className={`font-mono ${preview.vPercent && preview.vPercent >= 60 ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {preview.vPercent}%
                </strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] font-bold">Ca : Mg</span>
                <strong className="font-mono">{preview.relacaoCaMg}:1</strong>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex justify-end items-center space-x-3 p-3.5 sm:p-4 border-t border-stone-200 bg-stone-50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-200 font-bold min-h-[44px] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={plots.length === 0}
              style={{ backgroundColor: plots.length === 0 ? '#9ca3af' : '#964f0b', color: '#ffffff' }}
              className="px-5 py-2.5 rounded-xl text-white font-bold transition-all shadow-md min-h-[44px] active:scale-95 disabled:cursor-not-allowed"
            >
              Salvar Laudo de Solo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
