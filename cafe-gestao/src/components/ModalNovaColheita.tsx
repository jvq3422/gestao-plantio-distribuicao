import React, { useState } from 'react';
import { HarvestRecord, Plot } from '../types';
import { X, Award } from 'lucide-react';

interface ModalNovaColheitaProps {
  isOpen: boolean;
  plots: Plot[];
  preselectedPlotId?: string;
  onClose: () => void;
  onSave: (harvest: HarvestRecord) => void;
}

export const ModalNovaColheita: React.FC<ModalNovaColheitaProps> = ({
  isOpen,
  plots,
  preselectedPlotId,
  onClose,
  onSave,
}) => {
  const [plotId, setPlotId] = useState<string>(preselectedPlotId || plots[0]?.id || '');
  const [safra, setSafra] = useState('2025/2026');
  const [produtividadeSacasHa, setProdutividadeSacasHa] = useState<number>(42);
  const [pontosSCA, setPontosSCA] = useState<number>(85.0);
  const [perfilSensorial, setPerfilSensorial] = useState('Caramelo, chocolate e corpo cremoso.');
  const [adubacaoRealN, setAdubacaoRealN] = useState<number>(140);
  const [adubacaoRealP2O5, setAdubacaoRealP2O5] = useState<number>(60);
  const [adubacaoRealK2O, setAdubacaoRealK2O] = useState<number>(130);
  const [observacoes, setObservacoes] = useState('');

  if (!isOpen) return null;

  const currentPlot = plots.find((p) => p.id === plotId);
  const sacasTotais = currentPlot ? Math.round(produtividadeSacasHa * currentPlot.areaHa) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotId) return;

    const newHarvest: HarvestRecord = {
      id: `harv-${Date.now()}`,
      plotId,
      safra,
      produtividadeSacasHa,
      sacasTotais,
      pontosSCA: pontosSCA > 0 ? pontosSCA : undefined,
      perfilSensorial,
      adubacaoRealN,
      adubacaoRealP2O5,
      adubacaoRealK2O,
      observacoes,
    };

    onSave(newHarvest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto sm:my-8">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-stone-900">Registrar Colheita Real da Safra</h3>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="font-bold text-stone-700 block mb-1">Safra:</label>
              <input
                type="text"
                value={safra}
                onChange={(e) => setSafra(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Produtividade Real (scs/ha):</label>
              <input
                type="number"
                step="0.5"
                value={produtividadeSacasHa}
                onChange={(e) => setProdutividadeSacasHa(Number(e.target.value))}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Total no talhão: {sacasTotais} sacas de 60kg
              </span>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Nota Sensorial SCA (Opcional):</label>
              <input
                type="number"
                step="0.25"
                min="0"
                max="100"
                value={pontosSCA}
                onChange={(e) => setPontosSCA(Number(e.target.value))}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
              />
            </div>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <h4 className="font-bold text-stone-900 mb-2">Adubação Realmente Aplicada na Safra (kg/ha):</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-medium text-stone-600 block mb-1">N Aplicado:</label>
                <input
                  type="number"
                  value={adubacaoRealN}
                  onChange={(e) => setAdubacaoRealN(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="font-medium text-stone-600 block mb-1">P₂O₅ Aplicado:</label>
                <input
                  type="number"
                  value={adubacaoRealP2O5}
                  onChange={(e) => setAdubacaoRealP2O5(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="font-medium text-stone-600 block mb-1">K₂O Aplicado:</label>
                <input
                  type="number"
                  value={adubacaoRealK2O}
                  onChange={(e) => setAdubacaoRealK2O(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Perfil Sensorial do Lote:</label>
            <input
              type="text"
              placeholder="Ex: Frutas vermelhas, acidez cítrica, doçura de rapadura."
              value={perfilSensorial}
              onChange={(e) => setPerfilSensorial(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Observações do Ciclo:</label>
            <textarea
              rows={2}
              placeholder="Ex: Teve veranico em Janeiro, mas a braquiária segurou o pegamento."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
            />
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
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
