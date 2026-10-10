import React, { useState, useEffect } from 'react';
import { RegistroAdubacao, Plot, CommercialFertilizer, ModoAplicacaoAdubo } from '../types';
import { DecimalInput } from './DecimalInput';
import { X, Sprout, Calendar, FlaskConical } from 'lucide-react';

interface ModalNovaAdubacaoProps {
  isOpen: boolean;
  plots: Plot[];
  fertilizers: CommercialFertilizer[];
  preselectedPlotId?: string;
  onClose: () => void;
  onSave: (adubacao: RegistroAdubacao) => void;
}

export const ModalNovaAdubacao: React.FC<ModalNovaAdubacaoProps> = ({
  isOpen,
  plots,
  fertilizers,
  preselectedPlotId,
  onClose,
  onSave,
}) => {
  const [plotId, setPlotId] = useState<string>(preselectedPlotId || plots[0]?.id || '');
  const [data, setData] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [aduboNome, setAduboNome] = useState('');
  const [marca, setMarca] = useState('');
  const [quantidadeKg, setQuantidadeKg] = useState<number>(100);
  const [doseKgHa, setDoseKgHa] = useState<number>(0);
  const [doseGPorPlanta, setDoseGPorPlanta] = useState<number>(0);
  const [modoAplicacao, setModoAplicacao] = useState<ModoAplicacaoAdubo>('A lanço na saia');
  const [estagioFenologico, setEstagioFenologico] = useState('Pós-colheita / Arranque');
  const [responsavel, setResponsavel] = useState('');
  const [custoTotal, setCustoTotal] = useState<number>(0);
  const [observacoes, setObservacoes] = useState('');

  // Keep plotId in sync
  useEffect(() => {
    if (preselectedPlotId) {
      setPlotId(preselectedPlotId);
    } else if (!plotId && plots.length > 0) {
      setPlotId(plots[0].id);
    }
  }, [preselectedPlotId, plots, plotId]);

  // Recalculate dose if plot changes or quantidade changes
  const selectedPlot = plots.find((p) => p.id === plotId);

  const handleSelectPredefinedAdubo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const fert = fertilizers.find((f) => f.id === selectedId);
    if (fert) {
      setAduboNome(fert.nome);
      if (fert.marca) setMarca(fert.marca);
      if (fert.precoSaco50kg) {
        // Estima custo proporcional (R$ por kg = precoSaco / 50)
        const precoKg = fert.precoSaco50kg / 50;
        setCustoTotal(Math.round(quantidadeKg * precoKg));
      }
    }
  };

  const handleQuantidadeChange = (kg: number) => {
    setQuantidadeKg(kg);
    if (selectedPlot && selectedPlot.areaHa > 0) {
      setDoseKgHa(Math.round((kg / selectedPlot.areaHa) * 10) / 10);
      if (selectedPlot.espacamentoRuaM > 0 && selectedPlot.espacamentoPlantaM > 0) {
        const densidade = 10000 / (selectedPlot.espacamentoRuaM * selectedPlot.espacamentoPlantaM);
        const totalPlantas = densidade * selectedPlot.areaHa;
        if (totalPlantas > 0) {
          setDoseGPorPlanta(Math.round((kg * 1000) / totalPlantas));
        }
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotId) {
      alert('Selecione um talhão antes de salvar.');
      return;
    }
    if (!aduboNome.trim()) {
      alert('Informe o nome ou fórmula do adubo.');
      return;
    }
    if (quantidadeKg <= 0) {
      alert('Informe uma quantidade válida em kg.');
      return;
    }

    const reg: RegistroAdubacao = {
      id: `adub-${Date.now()}`,
      plotId,
      data,
      aduboNome: aduboNome.trim(),
      marca: marca.trim() || undefined,
      quantidadeKg,
      doseKgHa: doseKgHa > 0 ? doseKgHa : undefined,
      doseGPorPlanta: doseGPorPlanta > 0 ? doseGPorPlanta : undefined,
      modoAplicacao,
      estagioFenologico: estagioFenologico.trim() || undefined,
      responsavel: responsavel.trim() || undefined,
      custoTotal: custoTotal > 0 ? custoTotal : undefined,
      observacoes: observacoes.trim() || undefined,
    };

    onSave(reg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto sm:my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Sprout className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900">
                Registrar Aplicação de Adubo
              </h3>
              <p className="text-xs text-stone-500">Caderno de campo e rastreabilidade nutricional do talhão</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-scroll overscroll-contain">
            {plots.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl">
                Nenhum talhão cadastrado. Cadastre um talhão antes de registrar a adubação.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Talhão *:</label>
                <select
                  value={plotId}
                  onChange={(e) => setPlotId(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold"
                >
                  {plots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.cultura || 'Café'} - {p.areaHa} ha)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Data da Aplicação *:</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="date"
                    required
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-stone-50 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Quick Select from Fertilizer Catalog */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                <span>Escolher do Catálogo ou Digitar:</span>
              </div>
              <select
                onChange={handleSelectPredefinedAdubo}
                defaultValue=""
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-white"
              >
                <option value="">-- Selecionar fórmula ou insumo do catálogo --</option>
                {fertilizers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome} {f.marca ? `(${f.marca})` : ''} - N:{f.teorN} P:{f.teorP2O5} K:{f.teorK2O}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="font-medium text-stone-600 block mb-1">Nome do Adubo / Fórmula *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 20-00-20, Ureia, Organomineral"
                    value={aduboNome}
                    onChange={(e) => setAduboNome(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-600 block mb-1">Marca Comercial (Opcional):</label>
                  <input
                    type="text"
                    placeholder="Ex: Yara, Mosaic, Eurochem, etc."
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Quantidade e Doses */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Quantidade Total (kg) *:</label>
                <DecimalInput
                  value={quantidadeKg}
                  onChange={handleQuantidadeChange}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Dose Calculada (kg/ha):</label>
                <DecimalInput
                  value={doseKgHa}
                  onChange={setDoseKgHa}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Dose (g/planta):</label>
                <DecimalInput
                  value={doseGPorPlanta}
                  onChange={setDoseGPorPlanta}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold"
                />
              </div>
            </div>

            {/* Modo de Aplicação & Estágio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Modo de Aplicação:</label>
                <select
                  value={modoAplicacao}
                  onChange={(e) => setModoAplicacao(e.target.value as ModoAplicacaoAdubo)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold"
                >
                  <option value="A lanço na saia">A lanço na saia / projeção da copa</option>
                  <option value="Linha de plantio">Linha de plantio</option>
                  <option value="Fertirrigação">Fertirrigação</option>
                  <option value="Foliar">Foliar</option>
                  <option value="Drench / No pé">Drench / No pé</option>
                  <option value="Incorporado">Incorporado</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Fase / Estágio Fenológico:</label>
                <input
                  type="text"
                  placeholder="Ex: Pós-poda, Floração, Véraison, Chumbinho"
                  value={estagioFenologico}
                  onChange={(e) => setEstagioFenologico(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-medium"
                />
              </div>
            </div>

            {/* Custo & Responsável */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Custo Total (R$):</label>
                <DecimalInput
                  value={custoTotal}
                  onChange={setCustoTotal}
                  placeholder="Ex: 850.00"
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Responsável / Operador:</label>
                <input
                  type="text"
                  placeholder="Ex: João / Tratorista"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Observações do Talhão / Condição Climática:</label>
              <textarea
                rows={2}
                placeholder="Ex: Solo úmido pós-chuva de 25mm. Sem vento forte."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center space-x-3 p-3.5 sm:p-4 border-t border-stone-200 bg-stone-50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-200 font-bold min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-md min-h-[44px] active:scale-95"
            >
              Salvar Adubação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
