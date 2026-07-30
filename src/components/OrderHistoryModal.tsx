import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, History, UserCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

import { orderService } from '../services/orderService';
import type { OrderStatusHistory } from '../types';
import { StatusBadge } from './StatusBadge';

interface OrderHistoryModalProps {
  orderId: number;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ orderId, onClose }) => {
  const {
    data: historyList = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<OrderStatusHistory[]>({
    queryKey: ['order-history', orderId],
    queryFn: () => orderService.getHistory(orderId),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative my-8">
        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#FF5C5C]/10 rounded-2xl text-[#FF5C5C]">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-main)]">
              Histórico & Linha do Tempo
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Auditoria de alterações e transições do <strong>Pedido #{orderId}</strong>
            </p>
          </div>
        </div>

        {/* Conteúdo da Timeline */}
        {isLoading ? (
          <div className="py-12 text-center text-[var(--text-muted)] flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#FF5C5C] mb-3" />
            <p className="text-sm font-medium">Buscando histórico de auditoria...</p>
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-rose-500 flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm font-semibold">Não foi possível carregar o histórico.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-xs font-semibold text-[#FF5C5C] underline cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        ) : historyList.length === 0 ? (
          <div className="py-8 text-center text-[var(--text-muted)]">
            <p className="text-sm">Nenhum registro de histórico encontrado para este pedido.</p>
          </div>
        ) : (
          <div className="relative pl-7 ml-2 space-y-6 before:absolute before:left-1.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-[var(--border-color)] max-h-96 overflow-y-auto pr-2">
            {historyList.map((item, idx) => (
              <div key={item.id || idx} className="relative flex flex-col gap-1.5">
                {/* Ponto / Marcador da Timeline perfeitamente alinhado à linha vertical */}
                <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-[#FF5C5C] ring-4 ring-[#FF5C5C]/20 shadow-xs" />

                {/* Transição de Status */}
                <div className="flex items-center gap-2 flex-wrap">
                  {item.previousStatus && (
                    <>
                      <StatusBadge status={item.previousStatus} showIcon={false} />
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </>
                  )}
                  <StatusBadge status={item.newStatus} />
                </div>

                {/* Descrição */}
                {item.description && (
                  <p className="text-xs font-medium text-[var(--text-main)] mt-0.5">
                    {item.description}
                  </p>
                )}

                {/* Rodapé do Item (Usuário e Data) */}
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
            ))}
          </div>
        )}

        {/* Fechar */}
        <div className="mt-8 pt-4 border-t border-[var(--border-color)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] text-sm font-semibold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
