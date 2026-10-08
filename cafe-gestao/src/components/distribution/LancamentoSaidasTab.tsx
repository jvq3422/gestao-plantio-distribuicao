import React, { useState } from 'react';
import { SaidaVenda, PontoVenda, Produto, StatusPagamento } from '../../types';
import { StorageService } from '../../services/storageService';
import { exportVendasExcel, generateVendasTxt, copyToClipboard } from '../../services/exportService';
import { ShoppingCart, Plus, CheckCircle2, Clock, Filter, Calendar, FileSpreadsheet, ArrowUpRight, FileText, Copy, Check } from 'lucide-react';

interface LancamentoSaidasTabProps {
  saidas: SaidaVenda[];
  pontosVenda: PontoVenda[];
  produtos: Produto[];
  onOpenNovaSaidaModal: () => void;
  onRefreshData: () => void;
  onOpenRelatorioVendas?: () => void;
}

export const LancamentoSaidasTab: React.FC<LancamentoSaidasTabProps> = ({
  saidas,
  pontosVenda,
  produtos,
  onOpenNovaSaidaModal,
  onRefreshData,
  onOpenRelatorioVendas,
}) => {
  const [filterPdv, setFilterPdv] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [copiedVendas, setCopiedVendas] = useState<boolean>(false);

  const filteredSaidas = saidas.filter((s) => {
    if (filterPdv && s.pontoVendaId !== filterPdv) return false;
    if (filterStatus !== 'todos' && s.statusPagamento !== filterStatus) return false;
    return true;
  });

  const handleMarcarComoRecebido = (saidaId: string) => {
    StorageService.atualizarStatusPagamento(saidaId, 'Recebido');
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-folha-700 uppercase tracking-wider bg-folha-50 px-2.5 py-1 rounded-full">
            Logística & Vendas
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 flex items-center space-x-2 font-playfair">
            <ShoppingCart className="w-5 h-5 text-folha-700" />
            <span>Saídas de Produtos & Entregas</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Registro de remessas despachadas para pontos de venda e entrada automática no fluxo de receitas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenNovaSaidaModal}
            style={{ backgroundColor: '#964f0b', color: '#ffffff' }}
            className="inline-flex items-center space-x-1.5 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all min-h-[38px] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Saída</span>
          </button>

          {onOpenRelatorioVendas && (
            <button
              onClick={onOpenRelatorioVendas}
              style={{ backgroundColor: '#231914', color: '#ffffff' }}
              className="inline-flex items-center space-x-1.5 bg-recreio-espresso-950 hover:bg-black text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-md transition-all min-h-[38px] active:scale-95"
              title="Abrir Relatório Oficial para Impressão e PDF"
            >
              <FileText className="w-4 h-4 text-[#e0a442]" />
              <span>Relatório PDF</span>
            </button>
          )}

          <button
            onClick={() => exportVendasExcel(saidas, pontosVenda, produtos)}
            className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-md transition-all min-h-[38px]"
            title="Exportar todas as saídas para planilha Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.csv)</span>
          </button>

          <button
            onClick={async () => {
              const text = generateVendasTxt(saidas, pontosVenda, produtos);
              const ok = await copyToClipboard(text);
              if (ok) {
                setCopiedVendas(true);
                setTimeout(() => setCopiedVendas(false), 2500);
              }
            }}
            className={`inline-flex items-center space-x-1.5 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border transition-all min-h-[38px] ${
              copiedVendas
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
            }`}
            title="Copiar resumo consolidado de vendas para o WhatsApp"
          >
            {copiedVendas ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
            <span>{copiedVendas ? 'Copiado!' : 'Copiar TXT'}</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center space-x-1.5 font-bold text-stone-700">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>Filtrar:</span>
          </div>

          <select
            value={filterPdv}
            onChange={(e) => setFilterPdv(e.target.value)}
            className="border border-stone-300 rounded-xl px-2.5 py-2 bg-stone-50 font-semibold min-h-[38px] text-base sm:text-xs"
          >
            <option value="">Todos os Pontos de Venda</option>
            {pontosVenda.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-stone-300 rounded-xl px-2.5 py-2 bg-stone-50 font-semibold min-h-[38px] text-base sm:text-xs"
          >
            <option value="todos">Todos os Status</option>
            <option value="Recebido">Recebidos (Pagos)</option>
            <option value="A Receber">A Receber (Faturados)</option>
          </select>
        </div>

        <span className="text-stone-400 font-medium text-right sm:text-left text-[11px] sm:text-xs">
          {filteredSaidas.length} saída(s) encontrada(s)
        </span>
      </div>

      {/* List of Sales */}
      <div className="space-y-4">
        {filteredSaidas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center text-stone-500">
            Nenhuma saída encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredSaidas.map((saida) => {
            const pdv = pontosVenda.find((p) => p.id === saida.pontoVendaId);
            const isPago = saida.statusPagamento === 'Recebido';

            return (
              <div
                key={saida.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4 hover:border-folha-500 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                        {saida.numeroControle}
                      </span>
                      <h3 className="font-bold text-base text-stone-900">
                        {pdv?.nome || 'Ponto de Venda'}
                      </h3>
                      <span className="text-[10px] text-stone-400 font-medium">
                        ({pdv?.cidade})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-stone-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>Data: {saida.data}</span>
                      </span>
                      <span>• Pagamento: {saida.formaPagamento}</span>
                      {saida.dataVencimento && !isPago && (
                        <span className="text-amber-700 font-bold">
                          • Vence em: {saida.dataVencimento}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">
                        Valor Total
                      </span>
                      <span className="text-lg font-black text-stone-900 font-mono">
                        R$ {saida.valorTotal.toFixed(2)}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                        isPago
                          ? 'bg-folha-100 text-folha-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isPago ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-folha-600" />
                          <span>Recebido</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>A Receber</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Items Dispatched */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-xs">
                  <span className="font-bold text-stone-600 uppercase text-[10px] block mb-2">
                    Itens Entregues nesta Remessa:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {saida.itens.map((item, idx) => {
                      const prod = produtos.find((p) => p.id === item.produtoId);
                      return (
                        <div
                          key={idx}
                          className="bg-white p-2.5 rounded-lg border border-stone-200/80 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-stone-800 block line-clamp-1">
                              {prod?.nome || 'Produto'}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {item.quantidade} {prod?.unidade}s x R$ {item.precoUnitario.toFixed(2)}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-stone-900 ml-2">
                            R$ {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer notes & quick settlement */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
                  {saida.observacoes ? (
                    <p className="text-stone-500 italic">"{saida.observacoes}"</p>
                  ) : (
                    <span></span>
                  )}

                  {!isPago && (
                    <button
                      onClick={() => handleMarcarComoRecebido(saida.id)}
                      className="inline-flex items-center space-x-1.5 bg-folha-50 hover:bg-folha-100 text-folha-800 font-bold px-3 py-1.5 rounded-lg border border-folha-200 transition-colors self-end"
                    >
                      <CheckCircle2 className="w-4 h-4 text-folha-600" />
                      <span>Confirmar Recebimento do Pagamento</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
