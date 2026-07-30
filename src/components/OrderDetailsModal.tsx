import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  X,
  ShoppingBag,
  User as UserIcon,
  MapPin,
  History,
  Calendar,
  DollarSign,
  ArrowRight,
  UserCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import { orderService } from '../services/orderService';
import type { Order, OrderStatusHistory } from '../types';
import { StatusBadge } from './StatusBadge';

interface OrderDetailsModalProps {
  orderId: number;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  // Buscar detalhes do pedido
  const {
    data: order,
    isLoading: isLoadingOrder,
    isError: isErrorOrder,
    refetch: refetchOrder,
  } = useQuery<Order>({
    queryKey: ['order-details', orderId],
    queryFn: () => orderService.getById(orderId),
  });

  // Buscar histórico de auditoria
  const {
    data: historyList = [],
    isLoading: isLoadingHistory,
  } = useQuery<OrderStatusHistory[]>({
    queryKey: ['order-history', orderId],
    queryFn: () => orderService.getHistory(orderId),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-hidden">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-auto max-h-[85vh] flex flex-col overflow-hidden">
        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoadingOrder ? (
          <div className="py-16 text-center text-[var(--text-muted)] flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#FF5C5C] mb-3" />
            <p className="text-sm font-medium">Carregando detalhes do pedido #{orderId}...</p>
          </div>
        ) : isErrorOrder || !order ? (
          <div className="py-12 text-center text-rose-500 flex flex-col items-center justify-center">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p className="text-sm font-semibold">Não foi possível carregar as informações do pedido.</p>
            <button
              type="button"
              onClick={() => refetchOrder()}
              className="mt-3 text-xs font-semibold text-[#FF5C5C] underline cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {/* Cabeçalho Fixo do Modal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pr-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FF5C5C]/10 rounded-2xl text-[#FF5C5C]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[var(--text-main)]">
                      Pedido #{order.id}
                    </h2>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Realizado em{' '}
                    {format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>

            {/* Alternador de Abas */}
            <div className="flex border-b border-[var(--border-color)] mb-4 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`py-2.5 px-4 font-semibold text-xs transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'details'
                    ? 'border-[#FF5C5C] text-[#FF5C5C]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Detalhes & Itens ({order.items?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`py-2.5 px-4 font-semibold text-xs transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'border-[#FF5C5C] text-[#FF5C5C]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <History className="w-4 h-4" /> Linha do Tempo & Histórico ({historyList.length})
              </button>
            </div>

            {/* Conteúdo com Scroll Interno Limitado à Altura do Modal */}
            <div className="flex-1 overflow-y-auto pr-1.5 space-y-5">
              {/* Conteúdo da Aba 1: Detalhes & Itens */}
              {activeTab === 'details' && (
                <div className="space-y-5">
                  {/* Dados do Cliente e Endereço */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                        Cliente
                      </span>
                      <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-[var(--text-main)]">
                        <UserIcon className="w-4 h-4 text-[#FF5C5C]" />
                        {order.customerName}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                        Endereço de Entrega
                      </span>
                      <div className="flex items-start gap-2 font-semibold text-xs text-[var(--text-main)]">
                        <MapPin className="w-4 h-4 text-[#FF5C5C] shrink-0 mt-0.5" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabela de Produtos Comprados */}
                  <div>
                    <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      Produtos Solicitados ({order.items?.length || 0})
                    </h3>

                    <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden max-h-56 overflow-y-auto shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-[var(--bg-main)] border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold z-10">
                          <tr>
                            <th className="px-4 py-2.5">Produto</th>
                            <th className="px-4 py-2.5 text-center">Qtd</th>
                            <th className="px-4 py-2.5 text-right">Valor Unitário</th>
                            <th className="px-4 py-2.5 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
                          {order.items?.map((item, idx) => {
                            const subTotalCalculated = item.quantity * item.unitPrice;
                            return (
                              <tr key={item.id || idx} className="hover:bg-[var(--bg-card-hover)]">
                                <td className="px-4 py-2.5 font-semibold text-[var(--text-main)]">
                                  {item.productName}
                                </td>
                                <td className="px-4 py-2.5 text-center font-bold text-[var(--text-main)]">
                                  {item.quantity}x
                                </td>
                                <td className="px-4 py-2.5 text-right text-[var(--text-muted)]">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                  }).format(item.unitPrice)}
                                </td>
                                <td className="px-4 py-2.5 text-right font-bold text-[var(--text-main)]">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                  }).format(subTotalCalculated)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Valor Total Geral */}
                  <div className="p-3.5 rounded-2xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#FF5C5C] font-semibold text-xs">
                      <DollarSign className="w-5 h-5" /> Total do Pedido
                    </div>
                    <span className="text-xl font-extrabold text-[#FF5C5C]">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(order.totalPrice)}
                    </span>
                  </div>
                </div>
              )}

              {/* Aba 2: Linha do Tempo com Alinhamento Flex Estrutural 100% Perfeito */}
              {activeTab === 'history' && (
                <div className="py-2">
                  {isLoadingHistory ? (
                    <div className="py-12 text-center text-[var(--text-muted)] flex flex-col items-center justify-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-[#FF5C5C] mb-3" />
                      <p className="text-sm font-medium">Carregando histórico de auditoria...</p>
                    </div>
                  ) : historyList.length === 0 ? (
                    <div className="py-8 text-center text-[var(--text-muted)]">
                      <p className="text-sm">Nenhum registro de histórico encontrado.</p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto pr-2">
                      {historyList.map((item, idx) => {
                        const isLast = idx === historyList.length - 1;

                        return (
                          <div key={item.id || idx} className="flex gap-4 min-h-[64px]">
                            {/* Coluna do Eixo da Timeline com Alinhamento Central Nativo */}
                            <div className="w-6 flex flex-col items-center shrink-0 relative">
                              {/* Linha Vertical Cinza */}
                              {!isLast && (
                                <div className="absolute top-3 bottom-0 w-0.5 bg-[var(--border-color)] left-1/2 -translate-x-1/2" />
                              )}
                              {/* Marcador Vermelho Perfeitamente Centralizado no Eixo */}
                              <div className="w-3 h-3 rounded-full bg-[#FF5C5C] ring-4 ring-[#FF5C5C]/20 shadow-xs z-10 mt-1.5 shrink-0" />
                            </div>

                            {/* Coluna de Conteúdo */}
                            <div className="flex-1 pb-6 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                {item.previousStatus && (
                                  <>
                                    <StatusBadge status={item.previousStatus} showIcon={false} />
                                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                  </>
                                )}
                                <StatusBadge status={item.newStatus} />
                              </div>

                              {item.description && (
                                <p className="text-xs font-medium text-[var(--text-main)] mt-0.5">
                                  {item.description}
                                </p>
                              )}

                              <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-1">
                                <span className="flex items-center gap-1">
                                  <UserCheck className="w-3 h-3 text-[var(--text-muted)]" />
                                  {item.updatedBy || 'Sistema'}
                                </span>
                                <span>•</span>
                                <span>
                                  {format(new Date(item.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                                    locale: ptBR,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rodapé Fixo do Modal */}
            <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] text-xs font-semibold transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
