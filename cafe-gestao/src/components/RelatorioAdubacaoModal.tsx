import React, { useState } from 'react';
import { RegistroAdubacao, Plot } from '../types';
import { exportAdubacoesExcel, generateAdubacoesTxt, copyToClipboard } from '../services/exportService';
import {
  X,
  Printer,
  FileSpreadsheet,
  Copy,
  Check,
  Sprout,
  DollarSign,
  Calendar,
  Layers,
  Search,
} from 'lucide-react';

interface RelatorioAdubacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  adubacoes: RegistroAdubacao[];
  plots: Plot[];
}

export const RelatorioAdubacaoModal: React.FC<RelatorioAdubacaoModalProps> = ({
  isOpen,
  onClose,
  adubacoes,
  plots,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  // Filtragem dos dados
  const filteredAdubacoes = adubacoes.filter((a) => {
    if (selectedPlotId !== 'todos' && a.plotId !== selectedPlotId) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const plot = plots.find((p) => p.id === a.plotId);
      const matchPlot = plot?.nome.toLowerCase().includes(term);
      const matchAdubo = a.aduboNome.toLowerCase().includes(term);
      const matchMarca = a.marca?.toLowerCase().includes(term);
      const matchData = a.data.toLowerCase().includes(term);
      const matchResp = a.responsavel?.toLowerCase().includes(term);
      if (!matchPlot && !matchAdubo && !matchMarca && !matchData && !matchResp) {
        return false;
      }
    }
    return true;
  });

  const totalKg = filteredAdubacoes.reduce((acc, a) => acc + (a.quantidadeKg || 0), 0);
  const totalCusto = filteredAdubacoes.reduce((acc, a) => acc + (a.custoTotal || 0), 0);
  const totalTalhoesAtendidos = new Set(filteredAdubacoes.map((a) => a.plotId)).size;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportAdubacoesExcel(filteredAdubacoes, plots);
  };

  const handleCopyTxt = async () => {
    const text = generateAdubacoesTxt(filteredAdubacoes, plots);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-4 sm:p-8 space-y-6 relative touch-scroll my-auto print:shadow-none print:border-none print:max-h-none print:p-0">
        
        {/* Top Action Bar (Escondido na Impressão) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4 no-print">
          <div>
            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              Caderno de Campo Oficial • Nutrição & Manejos
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-1 font-playfair">
              Relatório Geral de Adubações
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              style={{ backgroundColor: '#231914', color: '#ffffff' }}
              className="inline-flex items-center space-x-1.5 bg-recreio-espresso-950 hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-[#e0a442]" />
              <span>Imprimir / Salvar em PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel (.csv)</span>
            </button>

            <button
              onClick={handleCopyTxt}
              className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                copied
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
              <span>{copied ? 'Copiado para WhatsApp!' : 'Copiar TXT (WhatsApp)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors ml-auto sm:ml-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtros em tela (Escondidos na Impressão) */}
        <div className="flex flex-col sm:flex-row gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 no-print">
          <div className="flex-1 flex items-center relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por adubo, marca, data ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-stone-700 whitespace-nowrap">Talhão:</label>
            <select
              value={selectedPlotId}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="text-xs font-semibold bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos os Talhões ({adubacoes.length})</option>
              {plots.map((p) => {
                const count = adubacoes.filter((a) => a.plotId === p.id).length;
                return (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="space-y-6 text-stone-900 printable-area">
          
          {/* Header Institucional com o Logo Principal sobre Fundo Branco */}
          <div className="border-b-2 border-stone-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <img
                src="/logo-principal.png"
                alt="Fazenda Recreio do Morro"
                className="h-16 w-auto object-contain bg-white"
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Fazenda Recreio do Morro • Chapada Diamantina - BA
                </p>
                <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 font-playfair">
                  Caderno de Campo de Adubação & Manejo Nutricional
                </h1>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-stone-600">
              <p>
                <span className="font-bold">Emissão:</span> {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p>
                <span className="font-bold">Escopo:</span>{' '}
                {selectedPlotId === 'todos'
                  ? 'Geral da Propriedade'
                  : plots.find((p) => p.id === selectedPlotId)?.nome || 'Talhão Específico'}
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold">
                {filteredAdubacoes.length} aplicações registradas
              </p>
            </div>
          </div>

          {/* Cards de Resumo Consolidado */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-emerald-700 text-xs font-bold mb-1">
                <Sprout className="w-4 h-4" />
                <span>Adubo Aplicado</span>
              </div>
              <p className="text-lg font-black text-stone-900 font-mono">
                {totalKg.toLocaleString('pt-BR')} <span className="text-xs font-normal">kg</span>
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                ~{(totalKg / 50).toFixed(1)} sacos de 50kg
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-stone-700 text-xs font-bold mb-1">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Investimento Total</span>
              </div>
              <p className="text-lg font-black text-stone-900 font-mono">
                R$ {totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">Custo real acumulado</p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-stone-700 text-xs font-bold mb-1">
                <Calendar className="w-4 h-4 text-stone-500" />
                <span>Intervenções</span>
              </div>
              <p className="text-lg font-black text-stone-900 font-mono">{filteredAdubacoes.length}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">Manejos de campo</p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-stone-700 text-xs font-bold mb-1">
                <Layers className="w-4 h-4 text-stone-500" />
                <span>Talhões Atendidos</span>
              </div>
              <p className="text-lg font-black text-stone-900 font-mono">{totalTalhoesAtendidos}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">Áreas com adubação</p>
            </div>
          </div>

          {/* Tabela de Manejos Detalhados */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
              Extrato Detalhado de Aplicações de Adubo (Datas e Dosagens)
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                    <th className="p-2.5 font-bold">Data do Manejo</th>
                    <th className="p-2.5 font-bold">Talhão / Cultura</th>
                    <th className="p-2.5 font-bold">Adubo & Marca</th>
                    <th className="p-2.5 text-right font-bold">Qtd (kg)</th>
                    <th className="p-2.5 text-right font-bold">Dose</th>
                    <th className="p-2.5 font-bold">Aplicação</th>
                    <th className="p-2.5 text-right font-bold">Custo (R$)</th>
                    <th className="p-2.5 font-bold">Responsável / Obs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredAdubacoes.map((a) => {
                    const plot = plots.find((p) => p.id === a.plotId);
                    return (
                      <tr key={a.id} className="hover:bg-stone-50">
                        <td className="p-2.5 font-semibold text-stone-900 whitespace-nowrap">
                          {a.data}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="font-bold text-stone-900">{plot?.nome || 'Talhão'}</span>
                          <span className="block text-[10px] text-stone-500">
                            {plot?.cultura || 'Café'} • {plot?.areaHa} ha
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="font-bold text-emerald-950">{a.aduboNome}</span>
                          {a.marca && (
                            <span className="block text-[10px] text-stone-500">{a.marca}</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-stone-900 whitespace-nowrap">
                          {a.quantidadeKg} kg
                        </td>
                        <td className="p-2.5 text-right whitespace-nowrap">
                          {a.doseKgHa !== undefined ? (
                            <div className="text-[11px] font-mono text-stone-700">
                              {a.doseKgHa} kg/ha
                            </div>
                          ) : (
                            '-'
                          )}
                          {a.doseGPorPlanta !== undefined && (
                            <div className="text-[10px] text-stone-400">
                              {a.doseGPorPlanta} g/planta
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="text-[11px] font-medium text-stone-800">
                            {a.modoAplicacao}
                          </span>
                          {a.estagioFenologico && (
                            <span className="block text-[10px] text-stone-400">
                              {a.estagioFenologico}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono text-stone-900 whitespace-nowrap">
                          {a.custoTotal ? (
                            `R$ ${a.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-2.5 text-stone-600 max-w-xs">
                          {a.responsavel && (
                            <div className="font-semibold text-stone-800">{a.responsavel}</div>
                          )}
                          {a.observacoes && (
                            <div className="text-[11px] italic text-stone-500">{a.observacoes}</div>
                          )}
                          {!a.responsavel && !a.observacoes && '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAdubacoes.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-stone-400 italic">
                        Nenhum registro de adubação encontrado com os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consolidação por Talhão */}
          {selectedPlotId === 'todos' && plots.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                Resumo Acumulado por Talhão
              </h3>
              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                      <th className="p-2 font-bold">Talhão</th>
                      <th className="p-2 font-bold">Cultura</th>
                      <th className="p-2 text-right font-bold">Área (ha)</th>
                      <th className="p-2 text-right font-bold">Total Adubo (kg)</th>
                      <th className="p-2 text-right font-bold">Custo Total (R$)</th>
                      <th className="p-2 text-center font-bold">Nº de Aplicações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {plots.map((p) => {
                      const adubs = adubacoes.filter((a) => a.plotId === p.id);
                      const kg = adubs.reduce((acc, a) => acc + (a.quantidadeKg || 0), 0);
                      const custo = adubs.reduce((acc, a) => acc + (a.custoTotal || 0), 0);
                      return (
                        <tr key={p.id} className="hover:bg-stone-50">
                          <td className="p-2 font-bold text-stone-900">{p.nome}</td>
                          <td className="p-2 text-stone-600">{p.cultura || 'Café'}</td>
                          <td className="p-2 text-right font-mono">{p.areaHa} ha</td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-900">
                            {kg.toLocaleString('pt-BR')} kg
                          </td>
                          <td className="p-2 text-right font-mono text-stone-800">
                            R$ {custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-center font-bold text-stone-700">{adubs.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rodapé da Impressão */}
          <div className="border-t border-stone-200 pt-4 text-[10px] text-stone-500 flex justify-between items-center">
            <span>Fazenda Recreio do Morro • Gestão Agronômica Integrada</span>
            <span>Documento emitido automaticamente pelo sistema</span>
          </div>

        </div>
      </div>
    </div>
  );
};
