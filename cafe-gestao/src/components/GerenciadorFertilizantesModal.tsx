import React, { useState } from 'react';
import { CommercialFertilizer } from '../types';
import { DecimalInput } from './DecimalInput';
import { X, Plus, Trash2, Edit3, FlaskConical, Search, CheckCircle } from 'lucide-react';

interface GerenciadorFertilizantesModalProps {
  isOpen: boolean;
  fertilizers: CommercialFertilizer[];
  onClose: () => void;
  onSaveFertilizer: (fert: CommercialFertilizer) => void;
  onDeleteFertilizer: (id: string) => void;
}

export const GerenciadorFertilizantesModal: React.FC<GerenciadorFertilizantesModalProps> = ({
  isOpen,
  fertilizers,
  onClose,
  onSaveFertilizer,
  onDeleteFertilizer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [tipo, setTipo] = useState<CommercialFertilizer['tipo']>('formulado');
  const [teorN, setTeorN] = useState<number>(0);
  const [teorP2O5, setTeorP2O5] = useState<number>(0);
  const [teorK2O, setTeorK2O] = useState<number>(0);
  const [teorCa, setTeorCa] = useState<number>(0);
  const [teorMg, setTeorMg] = useState<number>(0);
  const [teorS, setTeorS] = useState<number>(0);
  const [teorB, setTeorB] = useState<number>(0);
  const [teorZn, setTeorZn] = useState<number>(0);
  const [precoSaco50kg, setPrecoSaco50kg] = useState<number>(180);
  const [unidade, setUnidade] = useState<CommercialFertilizer['unidade']>('saco50kg');
  const [descricao, setDescricao] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setNome('');
    setMarca('');
    setTipo('formulado');
    setTeorN(0);
    setTeorP2O5(0);
    setTeorK2O(0);
    setTeorCa(0);
    setTeorMg(0);
    setTeorS(0);
    setTeorB(0);
    setTeorZn(0);
    setPrecoSaco50kg(180);
    setUnidade('saco50kg');
    setDescricao('');
    setEditingId(null);
    setIsEditing(false);
  };

  const handleStartEdit = (fert: CommercialFertilizer) => {
    setEditingId(fert.id);
    setNome(fert.nome);
    setMarca(fert.marca || '');
    setTipo(fert.tipo);
    setTeorN(fert.teorN || 0);
    setTeorP2O5(fert.teorP2O5 || 0);
    setTeorK2O(fert.teorK2O || 0);
    setTeorCa(fert.teorCa || 0);
    setTeorMg(fert.teorMg || 0);
    setTeorS(fert.teorS || 0);
    setTeorB(fert.teorB || 0);
    setTeorZn(fert.teorZn || 0);
    setPrecoSaco50kg(fert.precoSaco50kg || 0);
    setUnidade(fert.unidade || 'saco50kg');
    setDescricao(fert.descricao || '');
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Informe o nome do fertilizante ou fórmula comercial.');
      return;
    }

    const fertToSave: CommercialFertilizer = {
      id: editingId || `fert-custom-${Date.now()}`,
      nome: nome.trim(),
      marca: marca.trim() || undefined,
      tipo,
      teorN,
      teorP2O5,
      teorK2O,
      teorCa: teorCa > 0 ? teorCa : undefined,
      teorMg: teorMg > 0 ? teorMg : undefined,
      teorS: teorS > 0 ? teorS : undefined,
      teorB: teorB > 0 ? teorB : undefined,
      teorZn: teorZn > 0 ? teorZn : undefined,
      precoSaco50kg: precoSaco50kg > 0 ? precoSaco50kg : undefined,
      unidade,
      descricao: descricao.trim() || `${marca ? marca + ' - ' : ''}${nome}`,
    };

    onSaveFertilizer(fertToSave);
    resetForm();
  };

  const filtered = fertilizers.filter((f) => {
    const q = searchTerm.toLowerCase();
    return (
      f.nome.toLowerCase().includes(q) ||
      (f.marca && f.marca.toLowerCase().includes(q)) ||
      (f.descricao && f.descricao.toLowerCase().includes(q)) ||
      f.tipo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-4xl w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto sm:my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900">
                Catálogo de Adubos & Fertilizantes Comerciais
              </h3>
              <p className="text-xs text-stone-500">
                Cadastre fórmulas personalizadas, marcas (Yara, Mosaic, etc.) e teores de nutrientes.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 touch-scroll overscroll-contain text-xs">
          {/* Top Actions: Add Button & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por fórmula, marca, nome ou teor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white text-xs"
              />
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition-all text-xs"
              >
                <Plus className="w-4 h-4" />
                Novo Adubo / Marca
              </button>
            )}
          </div>

          {/* Form for Add/Edit */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="bg-stone-50 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="font-extrabold text-sm text-stone-800">
                  {editingId ? 'Editar Fertilizante' : 'Cadastrar Novo Fertilizante / Marca'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-stone-500 hover:text-stone-800 font-bold text-xs"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Nome / Fórmula Commercial *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 20-00-20 ou K-Mag"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Marca Comercial / Fabricante:</label>
                  <input
                    type="text"
                    placeholder="Ex: Yara, Mosaic, Fertipar, Eurochem"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tipo de Adubo:</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-white font-bold"
                  >
                    <option value="formulado">Formulado NPK</option>
                    <option value="simples">Matéria-Prima Simples</option>
                    <option value="organico">Orgânico / Composto</option>
                    <option value="foliar">Foliar / Fertirrigação</option>
                    <option value="corretivo">Corretivo / Condicionador</option>
                  </select>
                </div>
              </div>

              {/* Teores / Concentrações (%) */}
              <div className="border-t border-stone-200 pt-3">
                <label className="font-extrabold text-stone-800 block mb-2">
                  Teores e Garantias Nutricionais (%):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  <div>
                    <span className="font-bold text-stone-600 block text-[11px] mb-0.5">N (%)</span>
                    <DecimalInput
                      value={teorN}
                      onChange={setTeorN}
                      className="w-full border border-stone-300 rounded-lg p-2 bg-white font-bold text-center"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-stone-600 block text-[11px] mb-0.5">P₂O₅ (%)</span>
                    <DecimalInput
                      value={teorP2O5}
                      onChange={setTeorP2O5}
                      className="w-full border border-stone-300 rounded-lg p-2 bg-white font-bold text-center"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-stone-600 block text-[11px] mb-0.5">K₂O (%)</span>
                    <DecimalInput
                      value={teorK2O}
                      onChange={setTeorK2O}
                      className="w-full border border-stone-300 rounded-lg p-2 bg-white font-bold text-center"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-stone-600 block text-[11px] mb-0.5">Ca (%)</span>
                    <DecimalInput
                      value={teorCa}
                      onChange={setTeorCa}
                      className="w-full border border-stone-300 rounded-lg p-2 bg-white font-bold text-center"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-stone-600 block text-[11px] mb-0.5">Mg (%)</span>
                    <DecimalInput
                      value={teorMg}
                      onChange={setTeorMg}
                      className="w-full border border-stone-300 rounded-lg p-2 bg-white font-bold text-center"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-stone-600 block text-[11px] mb-0.5">S (%)</span>
                    <DecimalInput
                      value={teorS}
                      onChange={setTeorS}
                      className="w-full border border-stone-300 rounded-lg p-2 bg-white font-bold text-center"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-stone-600 block text-[11px] mb-0.5">B (%)</span>
                    <DecimalInput
                      value={teorB}
                      onChange={setTeorB}
                      className="w-full border border-stone-300 rounded-lg p-2 bg-white font-bold text-center"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-stone-600 block text-[11px] mb-0.5">Zn (%)</span>
                    <DecimalInput
                      value={teorZn}
                      onChange={setTeorZn}
                      className="w-full border border-stone-300 rounded-lg p-2 bg-white font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Preço e Embalagem */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-stone-200 pt-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Preço Médio (R$):</label>
                  <DecimalInput
                    value={precoSaco50kg}
                    onChange={setPrecoSaco50kg}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Unidade Comercial:</label>
                  <select
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-white font-bold"
                  >
                    <option value="saco50kg">Saco de 50 kg</option>
                    <option value="saco25kg">Saco de 25 kg</option>
                    <option value="tonelada">Tonelada (1.000 kg)</option>
                    <option value="kg">Kg</option>
                    <option value="litro">Litro / Galão</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Notas / Descrição:</label>
                  <input
                    type="text"
                    placeholder="Ex: Com nitrato e sulfato para rápida absorção"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingId ? 'Atualizar Fertilizante' : 'Salvar Fertilizante'}
                </button>
              </div>
            </form>
          )}

          {/* List of Fertilizers */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-stone-800">
              Fertilizantes Cadastrados ({filtered.length})
            </h4>

            {filtered.length === 0 ? (
              <div className="text-center py-8 text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
                Nenhum fertilizante encontrado com o filtro atual.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((fert) => (
                  <div
                    key={fert.id}
                    className="border border-stone-200 rounded-2xl p-4 bg-white hover:border-amber-400 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-stone-900">
                              {fert.nome}
                            </span>
                            {fert.marca && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold rounded-full text-[10px]">
                                {fert.marca}
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-stone-100 text-stone-700 font-bold rounded-full text-[10px] capitalize">
                              {fert.tipo}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                            {fert.descricao || 'Sem observações adicionais.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(fert)}
                            title="Editar"
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remover "${fert.nome}" do catálogo?`)) {
                                onDeleteFertilizer(fert.id);
                              }
                            }}
                            title="Excluir"
                            className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Nutrient Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                          N: {fert.teorN}%
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                          P₂O₅: {fert.teorP2O5}%
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[10px]">
                          K₂O: {fert.teorK2O}%
                        </span>
                        {fert.teorCa ? (
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px]">
                            Ca: {fert.teorCa}%
                          </span>
                        ) : null}
                        {fert.teorMg ? (
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px]">
                            Mg: {fert.teorMg}%
                          </span>
                        ) : null}
                        {fert.teorS ? (
                          <span className="px-2 py-0.5 rounded bg-yellow-50 text-yellow-800 border border-yellow-200 text-[10px]">
                            S: {fert.teorS}%
                          </span>
                        ) : null}
                        {fert.teorB ? (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px]">
                            B: {fert.teorB}%
                          </span>
                        ) : null}
                        {fert.teorZn ? (
                          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[10px]">
                            Zn: {fert.teorZn}%
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Price and Unit Footer */}
                    {fert.precoSaco50kg ? (
                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                        <span>Preço de referência:</span>
                        <span className="font-bold text-stone-900">
                          R$ {fert.precoSaco50kg.toFixed(2)} / {fert.unidade}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-stone-200 bg-stone-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs shadow-md transition-all"
          >
            Fechar Catálogo
          </button>
        </div>
      </div>
    </div>
  );
};
