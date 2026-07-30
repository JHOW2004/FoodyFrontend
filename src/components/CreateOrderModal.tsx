import React from 'react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">Criar Novo Pedido</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          O formulário completo de criação de pedido será ativado na próxima sub-etapa (6.5).
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
