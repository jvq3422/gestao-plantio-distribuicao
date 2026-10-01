import React, { useState } from 'react';
import { PontoVenda, Produto, PrecoNegociado } from '../../types';
import { StorageService } from '../../services/storageService';
import { Store, Plus, Tag, Check, Edit2, MapPin, Phone, Building } from 'lucide-react';

interface PontosVendaPrecosTabProps {
  pontosVenda: PontoVenda[];
  produtos: Produto[];
  precosNegociados: PrecoNegociado[];
  onOpenNewPdvModal: () => void;
  onRefreshData: () => void;
}

export const PontosVendaPrecosTab: React.FC<PontosVendaPrecosTabProps> = ({
  pontosVenda,
  produtos,
  precosNegociados,
  onOpenNewPdvModal,
  onRefreshData,
}) => {
  const [selectedPdvId, setSelectedPdvId] = useState<string>(pontosVenda[0]?.id || '');
  const [editingPrices, setEditingPrices] = useState<{ [produtoId: string]: number }>({});
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const currentPdv = pontosVenda.find((p) => p.id === selectedPdvId);

  // Inicializar preços de edição quando mudar o PDV
  React.useEffect(() => {
    if (selectedPdvId) {
      const initial: { [produtoId: string]: number } = {};
      produtos.forEach((prod) => {
        initial[prod.id] = StorageService.getPrecoParaPdv(selectedPdvId, prod.id);
      });
      setEditingPrices(initial);
      setSavedSuccess(false);
    }
  }, [selectedPdvId, produtos, precosNegociados]);

  const handlePriceChange = (produtoId: string, value: number) => {
    setEditingPrices((prev) => ({
      ...prev,
      [produtoId]: value,
    }));
    setSavedSuccess(false);
  };

  const handleSavePrices = () => {
    if (!selectedPdvId) return;

    produtos.forEach((prod) => {
      const novoPreco = editingPrices[prod.id];
      if (novoPreco !== undefined && novoPreco >= 0) {
        StorageService.setPrecoNegociado(selectedPdvId, prod.id, novoPreco);
      }
    });

    setSavedSuccess(true);
    onRefreshData();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-coffee-700 uppercase tracking-wider bg-coffee-50 px-2.5 py-1 rounded-full">
            Tabela de Preços Diferenciada
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 flex items-center space-x-2 font-playfair">
            <Tag className="w-5 h-5 text-coffee-800" />
            <span>Preços Negociados por Ponto de Venda</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure valores sob medida para cada cliente comercial (cafeterias, empórios, atacado ou venda direta).
          </p>
        </div>

        <button
          onClick={onOpenNewPdvModal}
          className="inline-flex items-center space-x-2 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo PDV</span>
        </button>
      </div>

      {/* Selector of PDV */}
      {pontosVenda.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-recreio-gold-100 text-recreio-gold-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-recreio-gold-200">
            <Store className="w-7 h-7 text-recreio-gold-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-800 font-playfair font-serif-brand">Nenhum Ponto de Venda cadastrado ainda</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Cadastre seus clientes comerciais (cafeterias especiais, empórios gourmet, restaurantes ou canais de venda direta) para configurar preços de venda personalizados para cada cliente.
            </p>
          </div>
          <button
            onClick={onOpenNewPdvModal}
            className="inline-flex items-center space-x-2 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeiro PDV</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {pontosVenda.map((pdv) => {
            const isSelected = pdv.id === selectedPdvId;
            return (
              <button
                key={pdv.id}
                onClick={() => setSelectedPdvId(pdv.id)}
                className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-recreio-espresso-950 text-white border-recreio-gold-700 shadow-md ring-2 ring-recreio-gold-500'
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-900'
                }`}
              >
                <div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      isSelected ? 'bg-coffee-800 text-coffee-200' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {pdv.tipo}
                  </span>
                  <h4 className="font-bold text-sm mt-1.5 line-clamp-1">{pdv.nome}</h4>
                  <p className={`text-xs mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                    {pdv.cidade}
                  </p>
                </div>
                <span
                  className={`text-[10px] mt-3 font-semibold ${
                    isSelected ? 'text-folha-400' : 'text-folha-700'
                  }`}
                >
                  Condição: {pdv.condicaoPagamento}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Price Table for Selected PDV */}
      {currentPdv && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-coffee-700" />
                <h3 className="text-lg font-bold text-stone-900">
                  Preços para: <span className="text-coffee-900">{currentPdv.nome}</span>
                </h3>
              </div>
              <div className="flex items-center space-x-3 text-xs text-stone-500 mt-1">
                <span>Tipo: <strong>{currentPdv.tipo}</strong></span>
                <span>• Contato: <strong>{currentPdv.contato}</strong> ({currentPdv.telefone})</span>
                <span>• Pagamento: <strong>{currentPdv.condicaoPagamento}</strong></span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {savedSuccess && (
                <span className="text-xs font-bold text-folha-700 bg-folha-50 px-3 py-1.5 rounded-xl border border-folha-200 flex items-center space-x-1 animate-pulse">
                  <Check className="w-4 h-4 text-folha-600" />
                  <span>Preços atualizados!</span>
                </span>
              )}
              <button
                onClick={handleSavePrices}
                className="bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Tabela deste PDV</span>
              </button>
            </div>
          </div>

          {/* Visualização Mobile: Cards de Preços Negociados */}
          <div className="md:hidden space-y-3">
            {produtos.length === 0 ? (
              <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-xl border border-stone-200">
                Nenhum produto cadastrado no catálogo. Cadastre produtos (cafés, tomates, uvas ou vinhos) na aba "Catálogo & Estoque" para precificá-los neste PDV.
              </div>
            ) : (
              produtos.map((prod) => {
                const precoNegociado = editingPrices[prod.id] ?? prod.precoPadrao;
                const diff = precoNegociado - prod.precoPadrao;
                const percent = prod.precoPadrao > 0 ? (diff / prod.precoPadrao) * 100 : 0;

                return (
                  <div
                    key={prod.id}
                    className="bg-[#fcfaf6] rounded-xl p-4 border border-stone-200 space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase mr-1 ${
                            prod.categoria === 'cafe'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {prod.categoria}
                        </span>
                        <h4 className="font-bold text-stone-900 text-sm mt-1">{prod.nome}</h4>
                        <span className="text-xs text-stone-500">{prod.subtipo}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Base Sugerido</span>
                        <span className="text-xs font-mono font-bold text-stone-600">
                          R$ {prod.precoPadrao.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-coffee-800 block">
                          Preço Negociado PDV:
                        </span>
                        {diff === 0 ? (
                          <span className="text-[10px] text-stone-400">Igual ao preço padrão</span>
                        ) : diff > 0 ? (
                          <span className="text-[10px] font-bold text-folha-700 bg-folha-50 px-1.5 py-0.5 rounded">
                            +{percent.toFixed(0)}% (Margem Premium)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            {percent.toFixed(0)}% (Desconto Volume)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 bg-white border border-coffee-300 rounded-xl px-2.5 py-1 shadow-inner">
                        <span className="text-xs font-mono font-bold text-stone-400">R$</span>
                        <input
                          type="number"
                          step="0.50"
                          min="0"
                          value={precoNegociado}
                          onChange={(e) => handlePriceChange(prod.id, Number(e.target.value))}
                          className="w-20 text-right font-mono font-black text-base text-coffee-950 bg-transparent focus:outline-none min-h-[36px]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Visualização Desktop: Tabela de Preços */}
          <div className="hidden md:block overflow-x-auto touch-scroll">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-y border-stone-200">
                <tr>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Categoria / Formato</th>
                  <th className="py-3 px-4 text-right">Preço Sugerido (Base)</th>
                  <th className="py-3 px-4 text-right bg-coffee-50/70 text-coffee-950 font-black">
                    Preço Negociado (R$)
                  </th>
                  <th className="py-3 px-4 text-center">Diferença / Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {produtos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">
                      Nenhum produto cadastrado no catálogo. Cadastre produtos (cafés, tomates, uvas ou vinhos) na aba "Catálogo & Estoque" para precificá-los neste PDV.
                    </td>
                  </tr>
                ) : (
                  produtos.map((prod) => {
                  const precoNegociado = editingPrices[prod.id] ?? prod.precoPadrao;
                  const diff = precoNegociado - prod.precoPadrao;
                  const percent = prod.precoPadrao > 0 ? (diff / prod.precoPadrao) * 100 : 0;

                  return (
                    <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {prod.nome}
                        {prod.talhaoOrigemId && (
                          <span className="text-[10px] text-folha-700 block font-normal">
                            Origem: Talhão da Fazenda
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase mr-1.5 ${
                            prod.categoria === 'cafe'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {prod.categoria}
                        </span>
                        {prod.subtipo}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-stone-500">
                        R$ {prod.precoPadrao.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right bg-coffee-50/30">
                        <div className="flex items-center justify-end space-x-1">
                          <span className="text-stone-400 font-mono">R$</span>
                          <input
                            type="number"
                            step="0.50"
                            min="0"
                            value={precoNegociado}
                            onChange={(e) => handlePriceChange(prod.id, Number(e.target.value))}
                            className="w-24 text-right font-mono font-extrabold text-sm border border-coffee-300 rounded-lg px-2 py-1 bg-white text-coffee-950 focus:ring-2 focus:ring-folha-600 focus:outline-none"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {diff === 0 ? (
                          <span className="text-[11px] text-stone-400">Preço padrão</span>
                        ) : diff > 0 ? (
                          <span className="text-[11px] font-bold text-folha-700 bg-folha-50 px-2 py-0.5 rounded-md">
                            +{percent.toFixed(0)}% (Premium)
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            {percent.toFixed(0)}% (Atacado)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
