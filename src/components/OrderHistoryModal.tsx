import React from 'react';

interface OrderHistoryModalProps {
  orderId: number;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ orderId, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">Histórico do Pedido #{orderId}</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          A linha do tempo de auditoria será ativada na próxima sub-etapa (6.5).
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
