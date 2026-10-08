import React, { useState } from 'react';
import { Produto, CategoriaProduto, UnidadeComercial, Plot } from '../../types';
import { X, PackagePlus } from 'lucide-react';

interface ModalNovoProdutoProps {
  isOpen: boolean;
  plots: Plot[];
  onClose: () => void;
  onSave: (produto: Produto) => void;
}

export const ModalNovoProduto: React.FC<ModalNovoProdutoProps> = ({
  isOpen,
  plots,
  onClose,
  onSave,
}) => {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<CategoriaProduto>('cafe');
  const [subtipo, setSubtipo] = useState('Pacote 250g Grãos');
  const [unidade, setUnidade] = useState<UnidadeComercial>('pacote');
  const [precoPadrao, setPrecoPadrao] = useState<number>(30.0);
  const [estoqueDisponivel, setEstoqueDisponivel] = useState<number>(50);
  const [talhaoOrigemId, setTalhaoOrigemId] = useState<string>('');
  const [descricao, setDescricao] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const novoProduto: Produto = {
      id: `prod-${Date.now()}`,
      nome,
      categoria,
      subtipo,
      unidade,
      precoPadrao,
      estoqueDisponivel,
      talhaoOrigemId: talhaoOrigemId || undefined,
      descricao,
    };

    onSave(novoProduto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto sm:my-8">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-recreio-gold-100 text-recreio-gold-900 border border-recreio-gold-200 flex items-center justify-center font-bold">
              <PackagePlus className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-stone-900">Novo Produto Acabado</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 active:bg-stone-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-scroll overscroll-contain">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Nome Comercial do Produto:</label>
              <input
                type="text"
                required
                placeholder="Ex: Café Especial Bourbon Amarelo 250g..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-semibold focus:ring-2 focus:ring-folha-600 focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Categoria:</label>
                <select
                  value={categoria}
                  onChange={(e) => {
                    const cat = e.target.value as CategoriaProduto;
                    setCategoria(cat);
                    if (cat === 'cafe') {
                      setUnidade('pacote');
                      setSubtipo('Pacote 250g Grãos');
                      setPrecoPadrao(30.0);
                    } else if (cat === 'tomate') {
                      setUnidade('bandeja');
                      setSubtipo('Bandeja 300g');
                      setPrecoPadrao(8.0);
                    } else if (cat === 'uva') {
                      setUnidade('caixa');
                      setSubtipo('Caixa 5kg Uva de Mesa');
                      setPrecoPadrao(45.0);
                    } else if (cat === 'vinho') {
                      setUnidade('garrafa');
                      setSubtipo('Garrafa 750ml');
                      setPrecoPadrao(85.0);
                    }
                  }}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold min-h-[44px]"
                >
                  <option value="cafe">☕ Café em Pacotes</option>
                  <option value="tomate">🍅 Tomate (Cereja ou Rasteiro)</option>
                  <option value="uva">🍇 Uvas (Mesa ou Vinífera)</option>
                  <option value="vinho">🍷 Vinhos Artesanais / Finos</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Unidade de Medida:</label>
                <select
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value as UnidadeComercial)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                >
                  <option value="pacote">Pacote</option>
                  <option value="bandeja">Bandeja</option>
                  <option value="caixa">Caixa</option>
                  <option value="kg">Quilograma (kg)</option>
                  <option value="garrafa">Garrafa (750ml / 500ml)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Tipo / Apresentação:</label>
                <input
                  type="text"
                  placeholder="Ex: 250g Grãos, Caixa 5kg, Garrafa 750ml..."
                  value={subtipo}
                  onChange={(e) => setSubtipo(e.target.value)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Preço Base Sugerido (R$):</label>
                <input
                  type="number"
                  step="0.50"
                  value={precoPadrao}
                  onChange={(e) => setPrecoPadrao(Number(e.target.value))}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold text-folha-800 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Estoque Pronto Inicial:</label>
                <input
                  type="number"
                  min="0"
                  value={estoqueDisponivel}
                  onChange={(e) => setEstoqueDisponivel(Number(e.target.value))}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-bold min-h-[44px]"
                />
              </div>

              {(categoria === 'cafe' || categoria === 'uva' || categoria === 'vinho') && (
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Talhão de Origem (Terroir):</label>
                  <select
                    value={talhaoOrigemId}
                    onChange={(e) => setTalhaoOrigemId(e.target.value)}
                    className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                  >
                    <option value="">Não especificado</option>
                    {plots.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({p.variedade})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Descrição / Notas Sensoriais:</label>
              <textarea
                rows={2}
                placeholder="Ex: Torra média, notas de frutas amarelas e caramelo..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
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
              style={{ backgroundColor: '#964f0b', color: '#ffffff' }}
              className="px-5 py-2.5 rounded-xl bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white font-bold transition-all shadow-md min-h-[44px] active:scale-95"
            >
              Cadastrar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
