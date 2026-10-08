import React, { useState, useEffect } from 'react';
import { Produto, PontoVenda, SaidaVenda, ItemSaidaVenda, FormaPagamento, StatusPagamento } from '../../types';
import { StorageService } from '../../services/storageService';
import { X, Plus, Trash2, ShoppingCart, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface ModalNovaSaidaProps {
  isOpen: boolean;
  produtos: Produto[];
  pontosVenda: PontoVenda[];
  onClose: () => void;
  onSave: (saida: SaidaVenda) => void;
}

export const ModalNovaSaida: React.FC<ModalNovaSaidaProps> = ({
  isOpen,
  produtos,
  pontosVenda,
  onClose,
  onSave,
}) => {
  const [pontoVendaId, setPontoVendaId] = useState<string>(pontosVenda[0]?.id || '');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusPagamento, setStatusPagamento] = useState<StatusPagamento>('Recebido');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [dataVencimento, setDataVencimento] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  // Itens da venda
  const [itens, setItens] = useState<ItemSaidaVenda[]>([]);

  // Item selecionado para adicionar
  const [selectedProdId, setSelectedProdId] = useState<string>(produtos[0]?.id || '');
  const [itemQtd, setItemQtd] = useState<number>(10);
  const [itemPreco, setItemPreco] = useState<number>(0);

  // Ao mudar PDV ou produto selecionado, carregar preço negociado
  useEffect(() => {
    if (pontoVendaId && selectedProdId) {
      const precoNegociado = StorageService.getPrecoParaPdv(pontoVendaId, selectedProdId);
      setItemPreco(precoNegociado);
    }
  }, [pontoVendaId, selectedProdId]);

  // Se trocar o PDV e já houver itens na lista, atualizar os preços com os negociados do novo PDV
  const handlePdvChange = (newPdvId: string) => {
    setPontoVendaId(newPdvId);
    setItens((prev) =>
      prev.map((item) => {
        const precoNegociado = StorageService.getPrecoParaPdv(newPdvId, item.produtoId);
        return {
          ...item,
          precoUnitario: precoNegociado,
          subtotal: Number((item.quantidade * precoNegociado).toFixed(2)),
        };
      })
    );
  };

  const handleAddItem = () => {
    if (!selectedProdId || itemQtd <= 0) return;

    const prod = produtos.find((p) => p.id === selectedProdId);
    if (!prod) return;

    // Verificar se já está na lista
    const existingIndex = itens.findIndex((i) => i.produtoId === selectedProdId);
    if (existingIndex >= 0) {
      const updated = [...itens];
      updated[existingIndex].quantidade += itemQtd;
      updated[existingIndex].precoUnitario = itemPreco;
      updated[existingIndex].subtotal = Number((updated[existingIndex].quantidade * itemPreco).toFixed(2));
      setItens(updated);
    } else {
      setItens([
        ...itens,
        {
          produtoId: selectedProdId,
          quantidade: itemQtd,
          precoUnitario: itemPreco,
          subtotal: Number((itemQtd * itemPreco).toFixed(2)),
        },
      ]);
    }

    // Resetar quantidade
    setItemQtd(10);
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const valorTotal = itens.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pontoVendaId || itens.length === 0) return;

    const novaSaida: SaidaVenda = {
      id: `saida-${Date.now()}`,
      numeroControle: `SAI-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      data,
      pontoVendaId,
      itens,
      valorTotal: Number(valorTotal.toFixed(2)),
      statusPagamento,
      formaPagamento,
      dataRecebimento: statusPagamento === 'Recebido' ? data : undefined,
      dataVencimento: statusPagamento === 'A Receber' ? dataVencimento : undefined,
      observacoes,
    };

    onSave(novaSaida);
    onClose();
  };

  if (!isOpen) return null;

  const currentPdv = pontosVenda.find((p) => p.id === pontoVendaId);
  const selectedProd = produtos.find((p) => p.id === selectedProdId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto sm:my-8">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-recreio-gold-100 text-recreio-gold-900 border border-recreio-gold-200 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900">Registrar Saída de Produtos</h3>
              <p className="text-[11px] sm:text-xs text-stone-500">
                Preços carregados conforme negociação com o PDV.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 active:bg-stone-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {pontosVenda.length === 0 || produtos.length === 0 ? (
          <div className="p-6 overflow-y-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="font-bold text-amber-900 text-sm">
                Cadastros prévios necessários
              </h4>
              <p className="text-xs text-amber-800 max-w-sm mx-auto">
                Para registrar uma saída de produtos, é necessário cadastrar previamente pelo menos um <strong>Ponto de Venda</strong> e um <strong>Produto</strong>.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all min-h-[44px]"
              >
                Fechar e Cadastrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-scroll overscroll-contain">
              {/* Top Row: PDV and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Ponto de Venda (Destino):</label>
              <select
                value={pontoVendaId}
                onChange={(e) => handlePdvChange(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-semibold focus:ring-2 focus:ring-folha-600 focus:outline-none"
              >
                {pontosVenda.map((pdv) => (
                  <option key={pdv.id} value={pdv.id}>
                    {pdv.nome} ({pdv.tipo})
                  </option>
                ))}
              </select>
              {currentPdv && (
                <span className="text-[10px] text-stone-500 mt-1 block">
                  {currentPdv.cidade} • Condição padrão: {currentPdv.condicaoPagamento}
                </span>
              )}
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Data da Saída / Entrega:</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-semibold"
              />
            </div>
          </div>

          {/* Add Product Line */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
            <span className="font-bold text-stone-700 block text-[11px] uppercase tracking-wider">
              Adicionar Produto à Remessa:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-6">
                <label className="text-[10px] text-stone-500 font-bold block mb-1">Produto:</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white text-xs"
                >
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (Estoque: {p.estoqueDisponivel} {p.unidade}s)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-stone-500 font-bold block mb-1">Qtd:</label>
                <input
                  type="number"
                  min="1"
                  value={itemQtd}
                  onChange={(e) => setItemQtd(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2 py-1.5 bg-white text-center text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-stone-500 font-bold block mb-1">
                  Preço PDV (R$):
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={itemPreco}
                  onChange={(e) => setItemPreco(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-2 py-1.5 bg-white text-right text-xs font-bold text-folha-800"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Incluir</span>
                </button>
              </div>
            </div>
            {selectedProd && selectedProd.estoqueDisponivel < itemQtd && (
              <p className="text-[10px] text-amber-700 font-semibold flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Atenção: A quantidade informada ({itemQtd}) é maior que o estoque atual ({selectedProd.estoqueDisponivel}).</span>
              </p>
            )}
          </div>

          {/* Items List */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold border-b border-stone-200">
                <tr>
                  <th className="p-2.5">Produto</th>
                  <th className="p-2.5 text-center">Qtd</th>
                  <th className="p-2.5 text-right">Preço Un.</th>
                  <th className="p-2.5 text-right">Subtotal</th>
                  <th className="p-2.5 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {itens.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-stone-400">
                      Nenhum produto adicionado nesta saída.
                    </td>
                  </tr>
                ) : (
                  itens.map((item, idx) => {
                    const prod = produtos.find((p) => p.id === item.produtoId);
                    return (
                      <tr key={idx} className="hover:bg-stone-50">
                        <td className="p-2.5 font-bold text-stone-800">
                          {prod?.nome || 'Item'}
                          <span className="text-[10px] text-stone-400 block font-normal">
                            {prod?.subtipo}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold">
                          {item.quantidade} {prod?.unidade}s
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          R$ {item.precoUnitario.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-extrabold text-folha-800">
                          R$ {item.subtotal.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-stone-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {itens.length > 0 && (
                <tfoot className="bg-stone-50 font-bold border-t border-stone-200">
                  <tr>
                    <td colSpan={3} className="p-2.5 text-right uppercase text-stone-600 text-[11px]">
                      Valor Total da Saída:
                    </td>
                    <td className="p-2.5 text-right font-mono text-sm text-folha-800 font-black">
                      R$ {valorTotal.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Payment & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-stone-100 pt-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Status do Pagamento:</label>
              <select
                value={statusPagamento}
                onChange={(e) => setStatusPagamento(e.target.value as StatusPagamento)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold"
              >
                <option value="Recebido">Recebido (Entrada de Receita)</option>
                <option value="A Receber">A Receber (Faturado / Prazo)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Forma de Pagamento:</label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
              >
                <option value="PIX">PIX</option>
                <option value="Boleto">Boleto Bancário</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Transferência Bancária">Transferência Bancária</option>
              </select>
            </div>

            {statusPagamento === 'A Receber' ? (
              <div>
                <label className="font-bold text-amber-700 block mb-1">Data de Vencimento:</label>
                <input
                  type="date"
                  required
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                  className="w-full border border-amber-300 rounded-xl px-3 py-2 bg-amber-50"
                />
              </div>
            ) : (
              <div>
                <label className="font-bold text-folha-700 block mb-1">Recebimento:</label>
                <div className="bg-folha-50 border border-folha-200 rounded-xl px-3 py-2 text-folha-800 font-semibold flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5 text-folha-600" />
                  <span>Liquidado à Vista</span>
                </div>
              </div>
            )}
          </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Observações da Entrega:</label>
                <input
                  type="text"
                  placeholder="Ex: Entregue lote artesanal da fazenda; garrafas de vinho numeradas; caixas de uva/tomate."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                />
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex justify-end items-center space-x-3 p-3.5 sm:p-4 border-t border-stone-200 bg-stone-50 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-200 font-bold min-h-[44px] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={itens.length === 0}
                style={{ backgroundColor: '#964f0b', color: '#ffffff' }}
                className="px-5 py-2.5 rounded-xl bg-recreio-gold-700 hover:bg-recreio-gold-800 disabled:opacity-50 text-white font-bold transition-all shadow-md flex items-center space-x-1.5 min-h-[44px] active:scale-95"
              >
                <DollarSign className="w-4 h-4" />
                <span>Confirmar Saída & Receita</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
