import React, { useState } from 'react';
import { Plot, VariedadeCafe, ExposicaoSolar, CoberturaSolo } from '../types';
import { X, Sprout } from 'lucide-react';

interface ModalNovoTalhaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plot: Plot) => void;
}

export const ModalNovoTalhao: React.FC<ModalNovoTalhaoProps> = ({ isOpen, onClose, onSave }) => {
  const [nome, setNome] = useState('');
  const [areaHa, setAreaHa] = useState<number>(5.0);
  const [variedade, setVariedade] = useState<VariedadeCafe>('Arara');
  const [altitudeM, setAltitudeM] = useState<number>(1050);
  const [exposicaoSolar, setExposicaoSolar] = useState<ExposicaoSolar>('Face Norte (Mais Sol)');
  const [espacamentoRuaM, setEspacamentoRuaM] = useState<number>(3.5);
  const [espacamentoPlantaM, setEspacamentoPlantaM] = useState<number>(0.7);
  const [anoPlantio, setAnoPlantio] = useState<number>(2020);
  const [coberturaSolo, setCoberturaSolo] = useState<CoberturaSolo>('Braquiária nas entrelinhas');
  const [observacoesTerroir, setObservacoesTerroir] = useState('');
  const [irrigado, setIrrigado] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const newPlot: Plot = {
      id: `plot-${Date.now()}`,
      nome,
      areaHa,
      variedade,
      altitudeM,
      exposicaoSolar,
      espacamentoRuaM,
      espacamentoPlantaM,
      anoPlantio,
      coberturaSolo,
      observacoesTerroir,
      irrigado,
    };

    onSave(newPlot);
    onClose();
  };

  const densidade = Math.round(10000 / (espacamentoRuaM * espacamentoPlantaM));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto sm:my-8">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-recreio-gold-100 text-recreio-gold-900 border border-recreio-gold-200 flex items-center justify-center font-bold">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-stone-900">Novo Talhão de Café</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 active:bg-stone-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-scroll overscroll-contain">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Nome do Talhão:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Talhão 04 - Morro Alto"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full text-base sm:text-sm border border-stone-300 rounded-xl px-3 py-2.5 bg-stone-50 focus:ring-2 focus:ring-folha-600 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Variedade de Café:</label>
                <select
                  value={variedade}
                  onChange={(e) => setVariedade(e.target.value as VariedadeCafe)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                >
                  <option value="Catuaí Vermelho 144">Catuaí Vermelho 144</option>
                  <option value="Catuaí Amarelo 2SL">Catuaí Amarelo 2SL</option>
                  <option value="Bourbon Amarelo">Bourbon Amarelo</option>
                  <option value="Arara">Arara</option>
                  <option value="Topázio MG 1190">Topázio MG 1190</option>
                  <option value="Mundo Novo IAC 379-19">Mundo Novo IAC 379-19</option>
                  <option value="Catucaí 2SL">Catucaí 2SL</option>
                  <option value="Geisha">Geisha</option>
                  <option value="Acauã">Acauã</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Área (hectares):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={areaHa}
                  onChange={(e) => setAreaHa(Number(e.target.value))}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Altitude (metros):</label>
                <input
                  type="number"
                  value={altitudeM}
                  onChange={(e) => setAltitudeM(Number(e.target.value))}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Exposição Solar:</label>
                <select
                  value={exposicaoSolar}
                  onChange={(e) => setExposicaoSolar(e.target.value as ExposicaoSolar)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                >
                  <option value="Face Norte (Mais Sol)">Face Norte (Mais Sol)</option>
                  <option value="Face Sul (Mais Ameno)">Face Sul (Mais Ameno)</option>
                  <option value="Face Leste">Face Leste (Sol da Manhã)</option>
                  <option value="Face Oeste">Face Oeste (Sol da Tarde)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Espaçamento Entre Ruas (m):</label>
                <input
                  type="number"
                  step="0.1"
                  value={espacamentoRuaM}
                  onChange={(e) => setEspacamentoRuaM(Number(e.target.value))}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Espaçamento Entre Plantas (m):</label>
                <input
                  type="number"
                  step="0.05"
                  value={espacamentoPlantaM}
                  onChange={(e) => setEspacamentoPlantaM(Number(e.target.value))}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Manejo de Cobertura do Solo:</label>
                <select
                  value={coberturaSolo}
                  onChange={(e) => setCoberturaSolo(e.target.value as CoberturaSolo)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                >
                  <option value="Braquiária nas entrelinhas">Braquiária nas entrelinhas (Recomendado fóruns)</option>
                  <option value="Mato roçado / palhada espontânea">Mato roçado / palhada espontânea</option>
                  <option value="Leguminosa adubação verde (Crotalária/Guandu)">Leguminosa / Adubação verde</option>
                  <option value="Solo limpo / herbicida">Solo limpo / herbicida</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Notas de Terroir e Histórico:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Face com boa ventilação, propício para cafés fermentados."
                  value={observacoesTerroir}
                  onChange={(e) => setObservacoesTerroir(e.target.value)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
                />
              </div>
            </div>

            <div className="bg-folha-50 p-3 rounded-xl border border-folha-200 text-stone-700 flex justify-between items-center">
              <span>Densidade calculada:</span>
              <strong className="text-folha-800 font-mono text-sm">{densidade.toLocaleString()} plantas/ha</strong>
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
              Salvar Talhão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
