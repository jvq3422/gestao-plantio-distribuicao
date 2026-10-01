import React, { useState } from 'react';
import { Produto, CategoriaProduto, Plot } from '../../types';
import { StorageService } from '../../services/storageService';
import { Package, Plus, Coffee, Apple, ArrowUpDown, Check, AlertTriangle, Grape, Wine } from 'lucide-react';

interface ProdutosEstoqueTabProps {
  produtos: Produto[];
  plots: Plot[];
  onOpenNovoProdutoModal: () => void;
  onRefreshData: () => void;
}

export const ProdutosEstoqueTab: React.FC<ProdutosEstoqueTabProps> = ({
  produtos,
  plots,
  onOpenNovoProdutoModal,
  onRefreshData,
}) => {
  const [filterCat, setFilterCat] = useState<string>('todos');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [addedStockQtd, setAddedStockQtd] = useState<number>(10);

  const filteredProdutos = produtos.filter((p) => {
    if (filterCat === 'cafe') return p.categoria === 'cafe';
    if (filterCat === 'tomate') return p.categoria === 'tomate';
    if (filterCat === 'uva') return p.categoria === 'uva';
    if (filterCat === 'vinho') return p.categoria === 'vinho';
    return true;
  });

  const handleAddStock = (produtoId: string) => {
    const prods = StorageService.getProdutos();
    const prod = prods.find((p) => p.id === produtoId);
    if (prod) {
      prod.estoqueDisponivel += addedStockQtd;
      StorageService.saveProdutos(prods);
      setEditingStockId(null);
      setAddedStockQtd(10);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-coffee-700 uppercase tracking-wider bg-coffee-50 px-2.5 py-1 rounded-full">
            Catálogo & Estoque Pronto
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 flex items-center space-x-2 font-playfair">
            <Package className="w-5 h-5 text-coffee-800" />
            <span>Catálogo de Produtos & Estoque</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Gerencie o estoque disponível dos cafés torrados, tomates, uvas de mesa e vinhos finos da fazenda.
          </p>
        </div>

        <button
          onClick={onOpenNovoProdutoModal}
          className="inline-flex items-center space-x-2 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 border-b border-stone-200 pb-3 overflow-x-auto no-scrollbar touch-scroll -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          onClick={() => setFilterCat('todos')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] shrink-0 ${
            filterCat === 'todos'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Todos os Produtos ({produtos.length})
        </button>
        <button
          onClick={() => setFilterCat('cafe')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap min-h-[38px] shrink-0 ${
            filterCat === 'cafe'
              ? 'bg-amber-900 text-white shadow-sm'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Cafés ({produtos.filter((p) => p.categoria === 'cafe').length})</span>
        </button>
        <button
          onClick={() => setFilterCat('tomate')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap min-h-[38px] shrink-0 ${
            filterCat === 'tomate'
              ? 'bg-rose-900 text-white shadow-sm'
              : 'bg-rose-50 text-rose-900 hover:bg-rose-100'
          }`}
        >
          <Apple className="w-3.5 h-3.5" />
          <span>Tomates ({produtos.filter((p) => p.categoria === 'tomate').length})</span>
        </button>
        <button
          onClick={() => setFilterCat('uva')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap min-h-[38px] shrink-0 ${
            filterCat === 'uva'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
          }`}
        >
          <Grape className="w-3.5 h-3.5" />
          <span>Uvas ({produtos.filter((p) => p.categoria === 'uva').length})</span>
        </button>
        <button
          onClick={() => setFilterCat('vinho')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap min-h-[38px] shrink-0 ${
            filterCat === 'vinho'
              ? 'bg-rose-950 text-white shadow-sm'
              : 'bg-red-50 text-red-950 hover:bg-red-100'
          }`}
        >
          <Wine className="w-3.5 h-3.5" />
          <span>Vinhos ({produtos.filter((p) => p.categoria === 'vinho').length})</span>
        </button>
      </div>

      {/* Product Cards */}
      {filteredProdutos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-recreio-gold-100 text-recreio-gold-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-recreio-gold-200">
            <Package className="w-7 h-7 text-recreio-gold-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-800 font-playfair font-serif-brand">Nenhum produto cadastrado nesta categoria</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Cadastre cafés beneficiados da fazenda, tomates especiais, uvas de mesa/viníferas e vinhos artesanais para gerenciar o estoque pronto e os preços de venda.
            </p>
          </div>
          <button
            onClick={onOpenNovoProdutoModal}
            className="inline-flex items-center space-x-2 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Produto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProdutos.map((prod) => {
          const talhao = plots.find((p) => p.id === prod.talhaoOrigemId);
          const isCafe = prod.categoria === 'cafe';
          const isTomate = prod.categoria === 'tomate';
          const isUva = prod.categoria === 'uva';
          const isVinho = prod.categoria === 'vinho';
          const isLowStock = prod.estoqueDisponivel <= 20;

          const badgeClass = isCafe
            ? 'bg-amber-100 text-amber-900'
            : isTomate
            ? 'bg-rose-100 text-rose-900'
            : isUva
            ? 'bg-purple-100 text-purple-900'
            : 'bg-red-100 text-red-950';

          const badgeLabel = isCafe
            ? 'Café da Fazenda'
            : isTomate
            ? 'Hortifrúti / Tomate'
            : isUva
            ? 'Viticultura / Uva'
            : 'Vinhedo / Vinho Fino';

          return (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4 hover:border-folha-500 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${badgeClass}`}
                    >
                      {badgeLabel}
                    </span>
                    <h3 className="font-bold text-base text-stone-900 mt-1">{prod.nome}</h3>
                    <p className="text-xs text-stone-500 font-medium">{prod.subtipo}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 font-bold block uppercase">
                      Preço Base
                    </span>
                    <span className="text-base font-extrabold text-stone-900 font-mono">
                      R$ {prod.precoPadrao.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-600 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  "{prod.descricao}"
                </p>

                {talhao && (
                  <div className="text-[11px] text-folha-800 font-semibold bg-folha-50/70 px-2.5 py-1 rounded-lg">
                    Origem: {talhao.nome} ({talhao.altitudeM}m de altitude)
                  </div>
                )}
              </div>

              {/* Stock Management Footer */}
              <div className="border-t border-stone-100 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600 font-semibold">Estoque Pronto:</span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-sm font-mono font-black ${
                        isLowStock ? 'text-amber-700' : 'text-stone-900'
                      }`}
                    >
                      {prod.estoqueDisponivel} {prod.unidade}s
                    </span>
                    {isLowStock && (
                      <span title="Estoque baixo">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      </span>
                    )}
                  </div>
                </div>

                {editingStockId === prod.id ? (
                  <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-stone-600">Produzido (+):</span>
                    <input
                      type="number"
                      min="1"
                      value={addedStockQtd}
                      onChange={(e) => setAddedStockQtd(Number(e.target.value))}
                      className="w-16 text-center text-xs font-bold border border-stone-300 rounded-lg py-1"
                    />
                    <button
                      onClick={() => handleAddStock(prod.id)}
                      className="bg-recreio-gold-700 text-white px-2 py-1 rounded-lg text-xs font-bold hover:bg-recreio-gold-800"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setEditingStockId(null)}
                      className="text-stone-400 hover:text-stone-600 text-xs px-1"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingStockId(prod.id);
                      setAddedStockQtd(10);
                    }}
                    className="w-full text-center py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    + Lançar Nova Produção no Estoque
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
    </div>
  );
};
