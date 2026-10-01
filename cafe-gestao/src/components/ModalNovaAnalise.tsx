import React, { useState } from 'react';
import { SoilAnalysis, Plot, SoilDepth } from '../types';
import { calcularIndicesSolo } from '../services/agronomyEngine';
import { X, Beaker } from 'lucide-react';

interface ModalNovaAnaliseProps {
  isOpen: boolean;
  plots: Plot[];
  preselectedPlotId?: string;
  onClose: () => void;
  onSave: (analysis: SoilAnalysis) => void;
}

export const ModalNovaAnalise: React.FC<ModalNovaAnaliseProps> = ({
  isOpen,
  plots,
  preselectedPlotId,
  onClose,
  onSave,
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
    if (!plotId) return;

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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto sm:my-8">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-recreio-gold-100 text-recreio-gold-900 border border-recreio-gold-200 flex items-center justify-center font-bold">
              <Beaker className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-stone-900">Novo Laudo de Solo</h3>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Talhão:</label>
              <select
                value={plotId}
                onChange={(e) => setPlotId(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
              >
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Profundidade:</label>
              <select
                value={profundidade}
                onChange={(e) => setProfundidade(e.target.value as SoilDepth)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
              >
                <option value="0-20cm">0 - 20 cm (Rotina / Calagem)</option>
                <option value="20-40cm">20 - 40 cm (Gessagem / Subsolo)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Data da Amostragem:</label>
              <input
                type="date"
                value={dataColeta}
                onChange={(e) => setDataColeta(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
              />
            </div>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <h4 className="font-bold text-stone-900 mb-2">Macronutrientes e Acidez:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-medium text-stone-600 block mb-1">pH em CaCl₂:</label>
                <input
                  type="number"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="font-medium text-stone-600 block mb-1">M.O. (g/dm³):</label>
                <input
                  type="number"
                  value={mo}
                  onChange={(e) => setMo(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="font-medium text-stone-600 block mb-1">Fósforo P (mg/dm³):</label>
                <input
                  type="number"
                  step="0.5"
                  value={p}
                  onChange={(e) => setP(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="font-medium text-stone-600 block mb-1">K (cmolc/dm³):</label>
                <input
                  type="number"
                  step="0.01"
                  value={k}
                  onChange={(e) => setK(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="font-medium text-stone-600 block mb-1">Ca (cmolc/dm³):</label>
                <input
                  type="number"
                  step="0.1"
                  value={ca}
                  onChange={(e) => setCa(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="font-medium text-stone-600 block mb-1">Mg (cmolc/dm³):</label>
                <input
                  type="number"
                  step="0.1"
                  value={mg}
                  onChange={(e) => setMg(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="font-medium text-stone-600 block mb-1">Alumínio Al (cmolc):</label>
                <input
                  type="number"
                  step="0.1"
                  value={al}
                  onChange={(e) => setAl(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="font-medium text-stone-600 block mb-1">H+Al (cmolc/dm³):</label>
                <input
                  type="number"
                  step="0.1"
                  value={h_al}
                  onChange={(e) => setH_al(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <h4 className="font-bold text-stone-900 mb-2">Micronutrientes e Textura:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-medium text-stone-600 block mb-1">Argila (%):</label>
                <input
                  type="number"
                  value={argilaPercent}
                  onChange={(e) => setArgilaPercent(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="font-medium text-stone-600 block mb-1">Boro B (mg/dm³):</label>
                <input
                  type="number"
                  step="0.1"
                  value={b}
                  onChange={(e) => setB(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="font-medium text-stone-600 block mb-1">Zinco Zn (mg/dm³):</label>
                <input
                  type="number"
                  step="0.1"
                  value={zn}
                  onChange={(e) => setZn(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="font-medium text-stone-600 block mb-1">Enxofre S (mg/dm³):</label>
                <input
                  type="number"
                  step="1"
                  value={s}
                  onChange={(e) => setS(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
            </div>
          </div>

          {/* Cálculos Calculados em Tempo Real */}
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] font-bold">SB</span>
              <strong>{preview.sb}</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] font-bold">CTC (T)</span>
              <strong>{preview.ctcTotal}</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] font-bold">V% Calculado</span>
              <strong className={preview.vPercent && preview.vPercent >= 60 ? 'text-folha-700' : 'text-amber-600'}>
                {preview.vPercent}%
              </strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] font-bold">Ca : Mg</span>
              <strong>{preview.relacaoCaMg}:1</strong>
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
              className="px-5 py-2.5 rounded-xl bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white font-bold transition-all shadow-md min-h-[44px]"
            >
              Salvar Análise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
