import React from 'react';
import { SaidaVenda, PontoVenda, Produto } from '../../types';
import { DollarSign, TrendingUp, Clock, CheckCircle2, Coffee, Apple, Store, Wallet, Grape, Wine } from 'lucide-react';

interface ReceitasFinanceiroTabProps {
  saidas: SaidaVenda[];
  pontosVenda: PontoVenda[];
  produtos: Produto[];
}

export const ReceitasFinanceiroTab: React.FC<ReceitasFinanceiroTabProps> = ({
  saidas,
  pontosVenda,
  produtos,
}) => {
  const faturamentoTotal = saidas.reduce((sum, s) => sum + s.valorTotal, 0);

  const totalRecebido = saidas
    .filter((s) => s.statusPagamento === 'Recebido')
    .reduce((sum, s) => sum + s.valorTotal, 0);

  const totalAReceber = saidas
    .filter((s) => s.statusPagamento === 'A Receber')
    .reduce((sum, s) => sum + s.valorTotal, 0);

  // Volumes por produto
  let pacotesCafeVendidos = 0;
  let bandejasCerejaVendidas = 0;
  let caixasTomateVendidas = 0;
  let caixasUvaVendidas = 0;
  let garrafasVinhoVendidas = 0;

  let receitaCafe = 0;
  let receitaTomate = 0;
  let receitaUva = 0;
  let receitaVinho = 0;

  saidas.forEach((s) => {
    s.itens.forEach((item) => {
      const prod = produtos.find((p) => p.id === item.produtoId);
      if (prod?.categoria === 'cafe') {
        pacotesCafeVendidos += item.quantidade;
        receitaCafe += item.subtotal;
      } else if (prod?.categoria === 'tomate') {
        receitaTomate += item.subtotal;
        if (prod.unidade === 'bandeja') {
          bandejasCerejaVendidas += item.quantidade;
        } else {
          caixasTomateVendidas += item.quantidade;
        }
      } else if (prod?.categoria === 'uva') {
        receitaUva += item.subtotal;
        caixasUvaVendidas += item.quantidade;
      } else if (prod?.categoria === 'vinho') {
        receitaVinho += item.subtotal;
        garrafasVinhoVendidas += item.quantidade;
      }
    });
  });

  // Faturamento por Ponto de Venda
  const faturamentoPorPdv = pontosVenda.map((pdv) => {
    const totalPdv = saidas
      .filter((s) => s.pontoVendaId === pdv.id)
      .reduce((sum, s) => sum + s.valorTotal, 0);
    return {
      pdv,
      total: totalPdv,
      percentual: faturamentoTotal > 0 ? (totalPdv / faturamentoTotal) * 100 : 0,
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase">
            <span>Faturamento Bruto Total</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
            R$ {faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-stone-400">
            Soma de todas as saídas e entregas registradas
          </p>
        </div>

        {/* Liquidated / Recebido */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-folha-700 text-xs font-bold uppercase">
            <span>Receita Liquidada (Recebido)</span>
            <div className="w-8 h-8 rounded-xl bg-folha-100 flex items-center justify-center text-folha-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-folha-800 font-mono">
            R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-stone-400">
            Valores já recebidos via PIX e dinheiro
          </p>
        </div>

        {/* A Receber */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase">
            <span>Contas a Receber (Faturado)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800 font-mono">
            R$ {totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-stone-400">
            Remessas com vencimento a prazo em carteira
          </p>
        </div>
      </div>

      {/* Production & Sales Volume Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Contribution */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2 border-b border-stone-100 pb-3 font-playfair">
            <Wallet className="w-5 h-5 text-coffee-700" />
            <span>Receitas por Linha de Produto</span>
          </h3>

          <div className="space-y-4">
            {/* Café */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center space-x-2 text-sm">
                  <Coffee className="w-4 h-4 text-amber-700" />
                  <span>Cafés da Fazenda</span>
                </span>
                <span className="font-mono font-black text-amber-950 text-base">
                  R$ {receitaCafe.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-amber-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-800 h-full rounded-full"
                  style={{
                    width: `${faturamentoTotal > 0 ? (receitaCafe / faturamentoTotal) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-[11px] text-amber-900">
                Total despachado: <strong>{pacotesCafeVendidos} pacotes</strong> de café especial e tradicional.
              </p>
            </div>

            {/* Tomates */}
            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-950 flex items-center space-x-2 text-sm">
                  <Apple className="w-4 h-4 text-rose-700" />
                  <span>Tomates Especiais</span>
                </span>
                <span className="font-mono font-black text-rose-950 text-base">
                  R$ {receitaTomate.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-rose-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-800 h-full rounded-full"
                  style={{
                    width: `${faturamentoTotal > 0 ? (receitaTomate / faturamentoTotal) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-[11px] text-rose-900">
                Total despachado: <strong>{bandejasCerejaVendidas} bandejas</strong> e{' '}
                <strong>{caixasTomateVendidas} caixas</strong> de tomate.
              </p>
            </div>

            {/* Uvas */}
            <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-950 flex items-center space-x-2 text-sm">
                  <Grape className="w-4 h-4 text-purple-700" />
                  <span>Uvas de Mesa & Viníferas</span>
                </span>
                <span className="font-mono font-black text-purple-950 text-base">
                  R$ {receitaUva.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-purple-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-800 h-full rounded-full"
                  style={{
                    width: `${faturamentoTotal > 0 ? (receitaUva / faturamentoTotal) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-[11px] text-purple-900">
                Total despachado: <strong>{caixasUvaVendidas} caixas/unidades</strong> de uva.
              </p>
            </div>

            {/* Vinhos */}
            <div className="bg-red-50/60 p-4 rounded-xl border border-red-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-950 flex items-center space-x-2 text-sm">
                  <Wine className="w-4 h-4 text-red-700" />
                  <span>Vinhos Artesanais & Finos</span>
                </span>
                <span className="font-mono font-black text-red-950 text-base">
                  R$ {receitaVinho.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-red-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-900 h-full rounded-full"
                  style={{
                    width: `${faturamentoTotal > 0 ? (receitaVinho / faturamentoTotal) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-[11px] text-red-950">
                Total despachado: <strong>{garrafasVinhoVendidas} garrafas</strong> de vinho da propriedade.
              </p>
            </div>
          </div>
        </div>

        {/* Faturamento por Ponto de Venda */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2 border-b border-stone-100 pb-3 font-playfair">
            <Store className="w-5 h-5 text-folha-700" />
            <span>Faturamento por Canal / Ponto de Venda</span>
          </h3>

          <div className="space-y-3">
            {faturamentoPorPdv.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center italic">
                Nenhum ponto de venda cadastrado ou saída faturada ainda.
              </p>
            ) : (
              faturamentoPorPdv.map((item) => (
                <div key={item.pdv.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">{item.pdv.nome}</span>
                    <span className="font-mono font-bold text-stone-900">
                      R$ {item.total.toFixed(2)} ({item.percentual.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-folha-700 h-full rounded-full"
                      style={{ width: `${item.percentual}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
