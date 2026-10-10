import React, { useState, useEffect } from 'react';
import { RegistroProfilaxia, Plot, TipoTratamentoFitossanitario } from '../types';
import { DecimalInput } from './DecimalInput';
import { X, ShieldAlert, Calendar, AlertTriangle } from 'lucide-react';

interface ModalNovaProfilaxiaProps {
  isOpen: boolean;
  plots: Plot[];
  preselectedPlotId?: string;
  onClose: () => void;
  onSave: (profilaxia: RegistroProfilaxia) => void;
}

export const ModalNovaProfilaxia: React.FC<ModalNovaProfilaxiaProps> = ({
  isOpen,
  plots,
  preselectedPlotId,
  onClose,
  onSave,
}) => {
  const [plotId, setPlotId] = useState<string>(preselectedPlotId || plots[0]?.id || '');
  const [data, setData] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [tipoTratamento, setTipoTratamento] = useState<TipoTratamentoFitossanitario>('Fungicida');
  const [alvoPragaDoenca, setAlvoPragaDoenca] = useState('');
  const [produtoComercial, setProdutoComercial] = useState('');
  const [dosagem, setDosagem] = useState('1.5 L/ha');
  const [volumeCaldaLHa, setVolumeCaldaLHa] = useState<number>(400);
  const [periodoCarenciaDias, setPeriodoCarenciaDias] = useState<number>(14);
  const [responsavel, setResponsavel] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (preselectedPlotId) {
      setPlotId(preselectedPlotId);
    } else if (!plotId && plots.length > 0) {
      setPlotId(plots[0].id);
    }
  }, [preselectedPlotId, plots, plotId]);

  if (!isOpen) return null;

  const currentPlot = plots.find((p) => p.id === plotId);
  const isUva = currentPlot?.cultura === 'Uva';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotId) {
      alert('Selecione um talhão antes de salvar.');
      return;
    }
    if (!alvoPragaDoenca.trim() || !produtoComercial.trim()) {
      alert('Informe a praga/doença alvo e o produto comercial utilizado.');
      return;
    }

    const reg: RegistroProfilaxia = {
      id: `prof-${Date.now()}`,
      plotId,
      data,
      tipoTratamento,
      alvoPragaDoenca: alvoPragaDoenca.trim(),
      produtoComercial: produtoComercial.trim(),
      dosagem: dosagem.trim(),
      volumeCaldaLHa: volumeCaldaLHa > 0 ? volumeCaldaLHa : undefined,
      periodoCarenciaDias: periodoCarenciaDias > 0 ? periodoCarenciaDias : undefined,
      responsavel: responsavel.trim() || undefined,
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
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900">
                Registrar Manejo Fitossanitário / Profilaxia
              </h3>
              <p className="text-xs text-stone-500">
                Controle de pragas, doenças, carência e rastreabilidade por talhão
              </p>
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
                Nenhum talhão cadastrado. Cadastre um talhão antes de registrar o tratamento.
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Tipo de Tratamento:</label>
                <select
                  value={tipoTratamento}
                  onChange={(e) => setTipoTratamento(e.target.value as TipoTratamentoFitossanitario)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold"
                >
                  <option value="Fungicida">Fungicida</option>
                  <option value="Inseticida">Inseticida</option>
                  <option value="Acaricida">Acaricida</option>
                  <option value="Biológico / Calda">Biológico / Calda Bordalesa / Sulfocálcica</option>
                  <option value="Herbicida">Herbicida</option>
                  <option value="Foliar Nutricional">Foliar Nutricional / Bioestimulante</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Alvo (Praga ou Doença) *:</label>
                <input
                  type="text"
                  required
                  placeholder={
                    isUva
                      ? 'Ex: Míldio (Plasmopara), Oídio, Botrytis'
                      : 'Ex: Ferrugem, Bicho-mineiro, Broca-do-café'
                  }
                  value={alvoPragaDoenca}
                  onChange={(e) => setAlvoPragaDoenca(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Produto Comercial / Princípio Ativo *:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nativo, Priori Xtra, Cuprogarb, Óleo Mineral"
                  value={produtoComercial}
                  onChange={(e) => setProdutoComercial(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Dosagem Recomendada:</label>
                <input
                  type="text"
                  placeholder="Ex: 0.75 L/ha ou 150 mL / 100 L de água"
                  value={dosagem}
                  onChange={(e) => setDosagem(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Volume de Calda (L/ha):</label>
                <DecimalInput
                  value={volumeCaldaLHa}
                  onChange={setVolumeCaldaLHa}
                  placeholder="Ex: 400"
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 flex items-center justify-between">
                  <span>Período de Carência (Dias):</span>
                  <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Intervalo p/ colheita
                  </span>
                </label>
                <DecimalInput
                  value={periodoCarenciaDias}
                  onChange={setPeriodoCarenciaDias}
                  placeholder="Ex: 14 ou 21"
                  className="w-full border border-amber-300 rounded-xl px-3 py-2 bg-amber-50 font-bold text-amber-950"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Responsável / Aplicador:</label>
              <input
                type="text"
                placeholder="Ex: Técnico agrícola / Equipe de pulverização"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Observações Técnicas / Condição do Tempo:</label>
              <textarea
                rows={2}
                placeholder="Ex: Bicos cone vazio TX-VK. Vento 3 km/h, UR 75%, temperatura 24°C."
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
              className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold transition-all shadow-md min-h-[44px] active:scale-95"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
