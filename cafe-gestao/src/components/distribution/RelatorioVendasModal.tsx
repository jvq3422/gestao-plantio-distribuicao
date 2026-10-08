import React, { useState } from 'react';
import { SaidaVenda, PontoVenda, Produto } from '../../types';
import { exportVendasExcel, generateVendasTxt, copyToClipboard } from '../../services/exportService';
import { X, Printer, FileSpreadsheet, Copy, Check, DollarSign, Package, ShoppingCart, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface RelatorioVendasModalProps {
  isOpen: boolean;
  onClose: () => void;
  saidas: SaidaVenda[];
  pontosVenda: PontoVenda[];
  produtos: Produto[];
}

export const RelatorioVendasModal: React.FC<RelatorioVendasModalProps> = ({
  isOpen,
  onClose,
  saidas,
  pontosVenda,
  produtos,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalFaturado = saidas.reduce((acc, s) => acc + s.valorTotal, 0);
  const totalRecebido = saidas
    .filter((s) => s.statusPagamento === 'Recebido')
    .reduce((acc, s) => acc + s.valorTotal, 0);
  const totalPendente = totalFaturado - totalRecebido;

  // Contabilizar volumes
  let pacotesCafe = 0;
  let bandejasTomate = 0;
  let caixasTomate = 0;
  let caixasUva = 0;
  let garrafasVinho = 0;

  saidas.forEach((s) => {
    s.itens.forEach((i) => {
      const p = produtos.find((pr) => pr.id === i.produtoId);
      if (p?.categoria === 'cafe') {
        pacotesCafe += i.quantidade;
      } else if (p?.categoria === 'tomate') {
        if (p?.unidade === 'bandeja') {
          bandejasTomate += i.quantidade;
        } else {
          caixasTomate += i.quantidade;
        }
      } else if (p?.categoria === 'uva') {
        caixasUva += i.quantidade;
      } else if (p?.categoria === 'vinho') {
        garrafasVinho += i.quantidade;
      }
    });
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportVendasExcel(saidas, pontosVenda, produtos);
  };

  const handleCopyTxt = async () => {
    const text = generateVendasTxt(saidas, pontosVenda, produtos);
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
            <span className="text-[10px] font-black text-recreio-gold-900 uppercase tracking-widest bg-recreio-gold-100 border border-recreio-gold-300 px-2.5 py-0.5 rounded-full">
              Exportação Oficial • Comercial & Financeiro
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-1 font-playfair">
              Relatório Consolidado de Vendas & Saídas
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
              className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
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
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors ml-auto sm:ml-0"
            >
              <X className="w-5 h-5" />
            </button>
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
                className="h-20 w-auto object-contain bg-white"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Chapada Diamantina • Bahia | Cafés Especiais & Hortifrúti
                </p>
                <h1 className="font-playfair text-xl sm:text-2xl font-black text-stone-900">
                  Relatório Executivo de Vendas & Faturamento
                </h1>
                <p className="text-[11px] text-stone-500">
                  Posição consolidada de saídas, entregas por ponto de venda e recebimentos
                </p>
              </div>
            </div>

            <div className="text-right text-xs shrink-0 self-end sm:self-auto">
              <span className="font-bold block text-sm">Posição: {new Date().toLocaleDateString('pt-BR')}</span>
              <span className="text-stone-500">Total de Pedidos: {saidas.length}</span>
            </div>
          </div>

          {/* Cards de Métricas Financeiras */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-[10px] font-bold uppercase">Faturamento Total</span>
                <DollarSign className="w-3.5 h-3.5 text-recreio-gold-700" />
              </div>
              <div className="text-base sm:text-lg font-black text-recreio-espresso-950 font-mono">
                R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-stone-400">Total despachado</span>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <span className="text-[10px] font-bold uppercase">Recebido (Caixa)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-900 font-mono">
                R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-emerald-700">100% liquidado</span>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-[10px] font-bold uppercase">A Receber</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-base sm:text-lg font-black text-amber-900 font-mono">
                R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-amber-700">Contas pendentes</span>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-[10px] font-bold uppercase">Volume Entregue</span>
                <Package className="w-3.5 h-3.5 text-stone-600" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-stone-900 flex flex-wrap gap-x-2 gap-y-0.5">
                <span>☕ {pacotesCafe} pct</span>
                <span>🍅 {bandejasTomate + caixasTomate} cx/bd</span>
                {caixasUva > 0 && <span>🍇 {caixasUva} cx</span>}
                {garrafasVinho > 0 && <span>🍷 {garrafasVinho} gf</span>}
              </div>
              <div className="text-[10px] text-stone-500 mt-1">
                {caixasUva === 0 && garrafasVinho === 0
                  ? `🍅 ${bandejasTomate} band. + ${caixasTomate} cx`
                  : `🍇 ${caixasUva} uva • 🍷 ${garrafasVinho} vinho`}
              </div>
            </div>
          </div>

          {/* Faturamento por Canal / Ponto de Venda */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Faturamento Consolidado por Ponto de Venda</span>
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                    <th className="p-2.5 font-bold">Ponto de Venda</th>
                    <th className="p-2.5 font-bold">Canal / Cidade</th>
                    <th className="p-2.5 text-center font-bold">Pedidos</th>
                    <th className="p-2.5 text-right font-bold">Recebido</th>
                    <th className="p-2.5 text-right font-bold">Pendente</th>
                    <th className="p-2.5 text-right font-bold">Total Faturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {pontosVenda.map((pdv) => {
                    const saidasPdv = saidas.filter((s) => s.pontoVendaId === pdv.id);
                    const fat = saidasPdv.reduce((sum, s) => sum + s.valorTotal, 0);
                    const rec = saidasPdv.filter((s) => s.statusPagamento === 'Recebido').reduce((sum, s) => sum + s.valorTotal, 0);
                    const pend = fat - rec;

                    if (saidasPdv.length === 0) return null;

                    return (
                      <tr key={pdv.id} className="hover:bg-stone-50">
                        <td className="p-2.5 font-bold text-stone-900">{pdv.nome}</td>
                        <td className="p-2.5 text-stone-600">{pdv.cidade || pdv.tipo}</td>
                        <td className="p-2.5 text-center font-mono">{saidasPdv.length}</td>
                        <td className="p-2.5 text-right font-mono text-emerald-800">
                          R$ {rec.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-mono text-amber-800">
                          {pend > 0 ? `R$ ${pend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-stone-900">
                          R$ {fat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                  {saidas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-stone-400 italic">
                        Nenhuma venda registrada até o momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Extrato Detalhado de Saídas */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Extrato Detalhado de Remessas Despachadas</span>
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                    <th className="p-2.5 font-bold">Data</th>
                    <th className="p-2.5 font-bold">Ponto de Venda</th>
                    <th className="p-2.5 font-bold">Itens / Produtos</th>
                    <th className="p-2.5 text-right font-bold">Total (R$)</th>
                    <th className="p-2.5 text-center font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {saidas.map((s) => {
                    const pdv = pontosVenda.find((p) => p.id === s.pontoVendaId);
                    return (
                      <tr key={s.id} className="hover:bg-stone-50">
                        <td className="p-2.5 text-stone-600 whitespace-nowrap">{s.data}</td>
                        <td className="p-2.5 font-bold text-stone-900">{pdv?.nome || 'PDV'}</td>
                        <td className="p-2.5 text-stone-700">
                          <div className="space-y-0.5">
                            {s.itens.map((i, idx) => {
                              const prod = produtos.find((pr) => pr.id === i.produtoId);
                              return (
                                <div key={idx} className="text-[11px]">
                                  <span className="font-semibold">{i.quantidade}x</span> {prod?.nome}{' '}
                                  <span className="text-stone-400">({prod?.subtipo})</span> -{' '}
                                  <span className="text-stone-600">R$ {i.subtotal.toFixed(2)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-stone-900 whitespace-nowrap">
                          R$ {s.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.statusPagamento === 'Recebido'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {s.statusPagamento}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {saidas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-stone-400 italic">
                        Nenhuma saída registrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rodapé Institucional da Impressão */}
          <div className="border-t border-stone-200 pt-4 text-center text-[10px] text-stone-500 flex justify-between items-center">
            <span>Fazenda Recreio do Morro • Gestão Agronômica & Distribuição</span>
            <span>Documento emitido automaticamente pelo sistema</span>
          </div>

        </div>
      </div>
    </div>
  );
};
