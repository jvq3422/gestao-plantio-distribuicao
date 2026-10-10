import React, { useState } from 'react';
import {
  Plot,
  RegistroAdubacao,
  RegistroProfilaxia,
  CommercialFertilizer,
} from '../types';
import {
  Sprout,
  ShieldAlert,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  DollarSign,
  Filter,
} from 'lucide-react';
import { ModalNovaAdubacao } from './ModalNovaAdubacao';
import { ModalNovaProfilaxia } from './ModalNovaProfilaxia';

interface ManejoTalhoesViewProps {
  plots: Plot[];
  adubacoes: RegistroAdubacao[];
  profilaxias: RegistroProfilaxia[];
  fertilizers: CommercialFertilizer[];
  onAddAdubacao: (adubacao: RegistroAdubacao) => void;
  onDeleteAdubacao: (id: string) => void;
  onAddProfilaxia: (profilaxia: RegistroProfilaxia) => void;
  onDeleteProfilaxia: (id: string) => void;
}

export const ManejoTalhoesView: React.FC<ManejoTalhoesViewProps> = ({
  plots,
  adubacoes,
  profilaxias,
  fertilizers,
  onAddAdubacao,
  onDeleteAdubacao,
  onAddProfilaxia,
  onDeleteProfilaxia,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'adubacoes' | 'profilaxias'>('adubacoes');
  const [selectedPlotId, setSelectedPlotId] = useState<string>('todos');
  const [isModalAdubacaoOpen, setIsModalAdubacaoOpen] = useState(false);
  const [isModalProfilaxiaOpen, setIsModalProfilaxiaOpen] = useState(false);

  // Filter lists
  const filteredAdubacoes = adubacoes.filter((a) => {
    if (selectedPlotId !== 'todos' && a.plotId !== selectedPlotId) return false;
    return true;
  });

  const filteredProfilaxias = profilaxias.filter((p) => {
    if (selectedPlotId !== 'todos' && p.plotId !== selectedPlotId) return false;
    return true;
  });

  // Calculate totals
  const totalAduboKg = filteredAdubacoes.reduce((acc, curr) => acc + (curr.quantidadeKg || 0), 0);
  const totalCustoAdubacao = filteredAdubacoes.reduce((acc, curr) => acc + (curr.custoTotal || 0), 0);

  // Helper to format date
  const formatDateBR = (iso: string) => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return iso;
  };

  // Helper for withdrawal period status
  const getCarenciaStatus = (dataAplicacao: string, carenciaDias?: number) => {
    if (!carenciaDias) return null;
    const dataApp = new Date(dataAplicacao);
    const dataFim = new Date(dataApp);
    dataFim.setDate(dataApp.getDate() + carenciaDias);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diffTime = dataFim.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDias > 0) {
      return {
        ativo: true,
        diasRestantes: diffDias,
        dataFim: dataFim.toLocaleDateString('pt-BR'),
      };
    }
    return {
      ativo: false,
      diasRestantes: 0,
      dataFim: dataFim.toLocaleDateString('pt-BR'),
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-navigation */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-900 shadow-sm">
              <Sprout className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Caderno de Campo & Manejo Agronômico
              </h2>
              <p className="text-xs text-stone-500">
                Histórico temporal de adubações, tratamentos fitossanitários e rastreabilidade por talhão
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Plot Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedPlotId}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="bg-transparent font-bold text-stone-800 focus:outline-none"
            >
              <option value="todos">Todos os Talhões ({plots.length})</option>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.cultura || 'Café'})
                </option>
              ))}
            </select>
          </div>

          {activeSubTab === 'adubacoes' ? (
            <button
              onClick={() => setIsModalAdubacaoOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all text-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Registrar Adubação
            </button>
          ) : (
            <button
              onClick={() => setIsModalProfilaxiaOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow-md transition-all text-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Registrar Profilaxia
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          onClick={() => setActiveSubTab('adubacoes')}
          className={`pb-3 px-4 font-extrabold text-sm flex items-center gap-2 transition-all border-b-2 ${
            activeSubTab === 'adubacoes'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sprout className="w-4 h-4" />
          Adubações Realizadas ({filteredAdubacoes.length})
        </button>
        <button
          onClick={() => setActiveSubTab('profilaxias')}
          className={`pb-3 px-4 font-extrabold text-sm flex items-center gap-2 transition-all border-b-2 ${
            activeSubTab === 'profilaxias'
              ? 'border-rose-600 text-rose-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Fitossanidade & Profilaxia ({filteredProfilaxias.length})
        </button>
      </div>

      {/* Subtab: Adubações */}
      {activeSubTab === 'adubacoes' && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Total de Aplicações
              </span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">
                {filteredAdubacoes.length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Volume Total Aplicado
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {totalAduboKg.toLocaleString('pt-BR')} kg
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Custo de Adubação Registrado
              </span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">
                R$ {totalCustoAdubacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {filteredAdubacoes.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 shadow-sm">
              <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">Nenhuma adubação registrada</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                Registre cada aplicação de adubo, corretivo ou foliar para acompanhar o histórico nutricional e custos de cada talhão.
              </p>
              <button
                onClick={() => setIsModalAdubacaoOpen(true)}
                className="mt-4 px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Registrar Primeira Adubação
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAdubacoes.map((reg) => {
                const plot = plots.find((p) => p.id === reg.plotId);
                return (
                  <div
                    key={reg.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-base text-stone-900">
                              {reg.aduboNome}
                            </span>
                            {reg.marca && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold rounded-full text-[10px]">
                                {reg.marca}
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                              {plot?.cultura === 'Uva' ? '🍇 Uva' : '☕ Café'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-stone-600 mt-1 flex items-center gap-1.5">
                            <span>Talhão: {plot ? plot.nome : 'Talhão Removido'}</span>
                            <span className="text-stone-300">•</span>
                            <span className="flex items-center gap-1 text-stone-500">
                              <Calendar className="w-3 h-3" /> {formatDateBR(reg.data)}
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Deseja excluir este registro de adubação?')) {
                              onDeleteAdubacao(reg.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs">
                        <div className="bg-stone-50 p-2 rounded-xl">
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">
                            Total Aplicado
                          </span>
                          <span className="font-extrabold text-stone-900 text-sm">
                            {reg.quantidadeKg} kg
                          </span>
                        </div>
                        {reg.doseKgHa && (
                          <div className="bg-stone-50 p-2 rounded-xl">
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">
                              Dose / ha
                            </span>
                            <span className="font-extrabold text-stone-900 text-sm">
                              {reg.doseKgHa} kg/ha
                            </span>
                          </div>
                        )}
                        {reg.doseGPorPlanta && (
                          <div className="bg-stone-50 p-2 rounded-xl">
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">
                              Dose / Planta
                            </span>
                            <span className="font-extrabold text-stone-900 text-sm">
                              {reg.doseGPorPlanta} g
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-stone-600">
                        <div className="flex items-center justify-between">
                          <span>Modo de Aplicação:</span>
                          <span className="font-bold text-stone-800">{reg.modoAplicacao}</span>
                        </div>
                        {reg.estagioFenologico && (
                          <div className="flex items-center justify-between">
                            <span>Fase da Planta:</span>
                            <span className="font-bold text-stone-800">{reg.estagioFenologico}</span>
                          </div>
                        )}
                        {reg.responsavel && (
                          <div className="flex items-center justify-between">
                            <span>Responsável:</span>
                            <span className="font-bold text-stone-800">{reg.responsavel}</span>
                          </div>
                        )}
                        {reg.observacoes && (
                          <p className="mt-2 text-[11px] text-stone-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                            "{reg.observacoes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {reg.custoTotal ? (
                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-stone-500 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-stone-400" /> Custo Investido:
                        </span>
                        <span className="font-black text-emerald-800 text-sm">
                          R$ {reg.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Subtab: Profilaxias & Fitossanidade */}
      {activeSubTab === 'profilaxias' && (
        <div className="space-y-4">
          {filteredProfilaxias.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 shadow-sm">
              <ShieldAlert className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">Nenhuma profilaxia registrada</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                Registre os manejos preventivos e curativos contra fungos, pragas e doenças, controlando os períodos de carência para colheita segura.
              </p>
              <button
                onClick={() => setIsModalProfilaxiaOpen(true)}
                className="mt-4 px-4 py-2 bg-rose-700 text-white font-bold rounded-xl text-xs hover:bg-rose-800 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Registrar Primeiro Manejo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProfilaxias.map((reg) => {
                const plot = plots.find((p) => p.id === reg.plotId);
                const carencia = getCarenciaStatus(reg.data, reg.periodoCarenciaDias);

                return (
                  <div
                    key={reg.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm hover:border-rose-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-base text-stone-900">
                              {reg.produtoComercial}
                            </span>
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-extrabold rounded-full text-[10px]">
                              {reg.tipoTratamento}
                            </span>
                            <span className="px-2 py-0.5 bg-stone-100 text-stone-700 font-bold rounded-full text-[10px]">
                              {plot?.cultura === 'Uva' ? '🍇 Uva' : '☕ Café'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-stone-600 mt-1 flex items-center gap-1.5">
                            <span>Talhão: {plot ? plot.nome : 'Talhão Removido'}</span>
                            <span className="text-stone-300">•</span>
                            <span className="flex items-center gap-1 text-stone-500">
                              <Calendar className="w-3 h-3" /> {formatDateBR(reg.data)}
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Deseja excluir este registro de profilaxia?')) {
                              onDeleteProfilaxia(reg.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 space-y-2 text-xs">
                        <div className="p-2.5 bg-stone-50 rounded-xl">
                          <span className="text-stone-500 font-bold block text-[10px] uppercase">
                            Alvo / Praga / Doença:
                          </span>
                          <span className="font-extrabold text-stone-900 text-sm">
                            {reg.alvoPragaDoenca}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-stone-50 p-2 rounded-xl">
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">
                              Dosagem
                            </span>
                            <span className="font-extrabold text-stone-900">{reg.dosagem}</span>
                          </div>
                          {reg.volumeCaldaLHa && (
                            <div className="bg-stone-50 p-2 rounded-xl">
                              <span className="text-stone-400 block text-[10px] uppercase font-bold">
                                Calda / ha
                              </span>
                              <span className="font-extrabold text-stone-900">
                                {reg.volumeCaldaLHa} L/ha
                              </span>
                            </div>
                          )}
                        </div>

                        {carencia && (
                          <div
                            className={`p-2.5 rounded-xl border flex items-center justify-between ${
                              carencia.ativo
                                ? 'bg-amber-50 border-amber-300 text-amber-900'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {carencia.ativo ? (
                                <AlertTriangle className="w-4 h-4 text-amber-700" />
                              ) : (
                                <Clock className="w-4 h-4 text-emerald-700" />
                              )}
                              <div>
                                <span className="font-extrabold block text-xs">
                                  {carencia.ativo
                                    ? `Carência Ativa: ${carencia.diasRestantes} dia(s) restantes`
                                    : 'Período de Carência Concluído'}
                                </span>
                                <span className="text-[10px] opacity-80 block">
                                  Liberado para colheita em: {carencia.dataFim}
                                </span>
                              </div>
                            </div>
                            <span className="font-black text-xs">
                              {reg.periodoCarenciaDias}d
                            </span>
                          </div>
                        )}

                        {reg.responsavel && (
                          <div className="flex items-center justify-between text-stone-600 pt-1">
                            <span>Aplicador:</span>
                            <span className="font-bold text-stone-800">{reg.responsavel}</span>
                          </div>
                        )}

                        {reg.observacoes && (
                          <p className="mt-2 text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                            "{reg.observacoes}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ModalNovaAdubacao
        isOpen={isModalAdubacaoOpen}
        plots={plots}
        fertilizers={fertilizers}
        preselectedPlotId={selectedPlotId !== 'todos' ? selectedPlotId : undefined}
        onClose={() => setIsModalAdubacaoOpen(false)}
        onSave={onAddAdubacao}
      />

      <ModalNovaProfilaxia
        isOpen={isModalProfilaxiaOpen}
        plots={plots}
        preselectedPlotId={selectedPlotId !== 'todos' ? selectedPlotId : undefined}
        onClose={() => setIsModalProfilaxiaOpen(false)}
        onSave={onAddProfilaxia}
      />
    </div>
  );
};
