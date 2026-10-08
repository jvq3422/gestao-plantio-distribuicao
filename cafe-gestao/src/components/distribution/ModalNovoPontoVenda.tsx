import React, { useState } from 'react';
import { PontoVenda, TipoPontoVenda, CondicaoPagamento } from '../../types';
import { X, Store } from 'lucide-react';

interface ModalNovoPontoVendaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pdv: PontoVenda) => void;
}

export const ModalNovoPontoVenda: React.FC<ModalNovoPontoVendaProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoPontoVenda>('Cafeteria Especial');
  const [cidade, setCidade] = useState('Varginha - MG');
  const [contato, setContato] = useState('');
  const [telefone, setTelefone] = useState('');
  const [condicaoPagamento, setCondicaoPagamento] = useState<CondicaoPagamento>('15 dias');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const novoPdv: PontoVenda = {
      id: `pdv-${Date.now()}`,
      nome,
      tipo,
      cidade,
      contato,
      telefone,
      condicaoPagamento,
    };

    onSave(novoPdv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto sm:my-8">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-recreio-gold-100 text-recreio-gold-900 border border-recreio-gold-200 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-stone-900">Novo Ponto de Venda (PDV)</h3>
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
              <label className="font-bold text-stone-700 block mb-1">Nome do Estabelecimento / Canal:</label>
              <input
                type="text"
                required
                placeholder="Ex: Cafeteria Aroma das Gerais, Empório do Sul..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-semibold focus:ring-2 focus:ring-folha-600 focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Tipo de Canal:</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoPontoVenda)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                >
                  <option value="Cafeteria Especial">Cafeteria Especial</option>
                  <option value="Empório / Mercearia Gourmet">Empório / Mercearia Gourmet</option>
                  <option value="Supermercado Local">Supermercado Local</option>
                  <option value="Restaurante / Pizzaria">Restaurante / Pizzaria</option>
                  <option value="Feira do Produtor">Feira do Produtor</option>
                  <option value="Venda Direta / Porteira">Venda Direta / Porteira</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Cidade / Região:</label>
                <input
                  type="text"
                  placeholder="Ex: Três Pontas - MG"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Pessoa de Contato:</label>
                <input
                  type="text"
                  placeholder="Ex: Maria (Gerente)"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Telefone / WhatsApp:</label>
                <input
                  type="text"
                  placeholder="Ex: (35) 99999-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Condição de Pagamento Acordada:</label>
                <select
                  value={condicaoPagamento}
                  onChange={(e) => setCondicaoPagamento(e.target.value as CondicaoPagamento)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-semibold min-h-[44px]"
                >
                  <option value="À Vista">À Vista (PIX / Dinheiro na Entrega)</option>
                  <option value="15 dias">Faturado para 15 dias</option>
                  <option value="30 dias">Faturado para 30 dias (Boleto)</option>
                  <option value="Consignado">Consignado (Paga conforme vende)</option>
                </select>
              </div>
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
              Cadastrar Ponto de Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
