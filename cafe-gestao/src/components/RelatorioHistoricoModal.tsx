import React, { useState } from 'react';
import { HarvestRecord, Plot } from '../types';
import { exportHistoricosExcel, generateHistoricosTxt, copyToClipboard } from '../services/exportService';
import { calcularExportacaoColheita } from '../services/historyFeedbackEngine';
import {
  X,
  Printer,
  FileSpreadsheet,
  Copy,
  Check,
  Award,
  TrendingUp,
  Search,
  Scale,
  Sparkles,
} from 'lucide-react';

interface RelatorioHistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  harvests: HarvestRecord[];
  plots: Plot[];
}

export const RelatorioHistoricoModal: React.FC<RelatorioHistoricoModalProps> = ({
  isOpen,
  onClose,
  harvests,
  plots,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  // Filtragem
  const filteredHarvests = harvests
    .filter((h) => {
      if (selectedPlotId !== 'todos' && h.plotId !== selectedPlotId) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const plot = plots.find((p) => p.id === h.plotId);
        const matchPlot = plot?.nome.toLowerCase().includes(term);
        const matchSafra = h.safra.toLowerCase().includes(term);
        const matchSensorial = h.perfilSensorial?.toLowerCase().includes(term);
        const matchObs = h.observacoes.toLowerCase().includes(term);
        if (!matchPlot && !matchSafra && !matchSensorial && !matchObs) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => b.safra.localeCompare(a.safra));

  const totalSacas = filteredHarvests.reduce((acc, h) => acc + (h.sacasTotais || 0), 0);
  const mediaProd =
    filteredHarvests.length > 0
      ? filteredHarvests.reduce((acc, h) => acc + (h.produtividadeSacasHa || 0), 0) /
        filteredHarvests.length
      : 0;

  const scaScores = filteredHarvests
    .map((h) => h.pontosSCA)
    .filter((s): s is number => typeof s === 'number' && s > 0);
  const maxSca = scaScores.length > 0 ? Math.max(...scaScores) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportHistoricosExcel(filteredHarvests, plots);
  };

  const handleCopyTxt = async () => {
    const text = generateHistoricosTxt(filteredHarvests, plots);
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
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
              Histórico de Safras & Produtividade • Rastreabilidade
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-1 font-playfair">
              Relatório Histórico de Safras & Qualidade
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
              placeholder="Buscar por safra, notas sensoriais ou observações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-stone-700 whitespace-nowrap">Talhão:</label>
            <select
              value={selectedPlotId}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="text-xs font-semibold bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="todos">Todos os Talhões ({harvests.length})</option>
              {plots.map((p) => {
                const count = harvests.filter((h) => h.plotId === p.id).length;
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
                  Histórico de Safras, Qualidade & Balanço de Extração
                </h1>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-stone-600">
              <p>
                <span className="font-bold">Emissão:</span> {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p>
                <span className="font-bold">Talhão:</span>{' '}
                {selectedPlotId === 'todos'
                  ? 'Todos os Talhões'
                  : plots.find((p) => p.id === selectedPlotId)?.nome || 'Específico'}
              </p>
              <p className="text-[11px] text-amber-800 font-semibold">
                {filteredHarvests.length} safras registradas
              </p>
            </div>
          </div>

          {/* Cards de Resumo Consolidado */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-amber-700 text-xs font-bold mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Volume Acumulado</span>
              </div>
              <p className="text-lg font-black text-stone-900 font-mono">
                {totalSacas.toLocaleString('pt-BR')} <span className="text-xs font-normal">sacas/un</span>
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">Colheitas registradas</p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-stone-700 text-xs font-bold mb-1">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Produtividade Média</span>
              </div>
              <p className="text-lg font-black text-stone-900 font-mono">
                {mediaProd.toFixed(1)} <span className="text-xs font-normal">scs/ha</span>
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">Média ponderada</p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-stone-700 text-xs font-bold mb-1">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Melhor Qualidade</span>
              </div>
              <p className="text-lg font-black text-amber-900 font-mono">
                {maxSca ? `${maxSca} pts` : '-'}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">Pontuação SCA / Brix</p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-stone-700 text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Safras Cadastradas</span>
              </div>
              <p className="text-lg font-black text-stone-900 font-mono">{filteredHarvests.length}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">Eventos de colheita</p>
            </div>
          </div>

          {/* Tabela de Safras e Balanço Químico */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
              Histórico Detalhado por Safra & Balanço Nutricional (Aplicado vs Exportado)
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                    <th className="p-2.5 font-bold">Safra</th>
                    <th className="p-2.5 font-bold">Talhão</th>
                    <th className="p-2.5 text-right font-bold">Produtividade</th>
                    <th className="p-2.5 text-right font-bold">Total Colhido</th>
                    <th className="p-2.5 text-center font-bold">Qualidade Bebida</th>
                    <th className="p-2.5 text-center font-bold">Nutrientes Aplicados (kg/ha)</th>
                    <th className="p-2.5 text-center font-bold">Balanço Líquido (Saldo kg/ha)</th>
                    <th className="p-2.5 font-bold">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredHarvests.map((h) => {
                    const plot = plots.find((p) => p.id === h.plotId);
                    const exportado = calcularExportacaoColheita(h.produtividadeSacasHa || 0);
                    const balancoN = Number(((h.adubacaoRealN || 0) - exportado.nExportado).toFixed(0));
                    const balancoP = Number(((h.adubacaoRealP2O5 || 0) - exportado.p2o5Exportado).toFixed(0));
                    const balancoK = Number(((h.adubacaoRealK2O || 0) - exportado.k2oExportado).toFixed(0));

                    return (
                      <tr key={h.id} className="hover:bg-stone-50">
                        <td className="p-2.5 font-black text-stone-900 whitespace-nowrap">
                          {h.safra}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="font-bold text-stone-900">{plot?.nome || 'Talhão'}</span>
                          <span className="block text-[10px] text-stone-500">
                            {plot?.cultura || 'Café'} ({plot?.areaHa} ha)
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-stone-900 whitespace-nowrap">
                          {h.produtividadeSacasHa} scs/ha
                        </td>
                        <td className="p-2.5 text-right font-mono text-stone-700 whitespace-nowrap">
                          {h.sacasTotais} scs
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          {h.pontosSCA ? (
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                {h.pontosSCA} pts SCA
                              </span>
                              {h.perfilSensorial && (
                                <span className="block text-[10px] text-stone-500 mt-0.5">
                                  {h.perfilSensorial}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-stone-400">-</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <div className="font-mono text-[11px] text-stone-800">
                            N: {h.adubacaoRealN} | P₂O₅: {h.adubacaoRealP2O5} | K₂O: {h.adubacaoRealK2O}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            Exportado: N {exportado.nExportado} | P {exportado.p2o5Exportado} | K {exportado.k2oExportado}
                          </div>
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <div className="font-mono text-[11px] font-bold">
                            <span className={balancoN >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                              N: {balancoN > 0 ? `+${balancoN}` : balancoN}
                            </span>{' '}
                            |{' '}
                            <span className={balancoP >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                              P: {balancoP > 0 ? `+${balancoP}` : balancoP}
                            </span>{' '}
                            |{' '}
                            <span className={balancoK >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                              K: {balancoK > 0 ? `+${balancoK}` : balancoK}
                            </span>
                          </div>
                          <span className="text-[9px] text-stone-400">saldo líquido</span>
                        </td>
                        <td className="p-2.5 text-stone-600 max-w-xs">
                          {h.observacoes ? (
                            <div className="text-[11px] italic">{h.observacoes}</div>
                          ) : (
                            <span className="text-stone-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHarvests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-stone-400 italic">
                        Nenhum registro de safra encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rodapé da Impressão */}
          <div className="border-t border-stone-200 pt-4 text-[10px] text-stone-500 flex justify-between items-center">
            <span>Fazenda Recreio do Morro • Aprendizado de Máquina Retroalimentado</span>
            <span>Documento emitido automaticamente pelo sistema</span>
          </div>

        </div>
      </div>
    </div>
  );
};
