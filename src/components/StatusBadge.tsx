import React from 'react';
import { clsx } from 'clsx';
import type { OrderStatus } from '../types';
import { Clock, ChefHat, Bike, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showIcon?: boolean;
}

interface StatusSelectProps {
  status: OrderStatus;
  onChangeStatus: (newStatus: OrderStatus) => void;
  disabled?: boolean;
}

export const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  RECEBIDO: {
    label: 'Recebido',
    bg: 'bg-sky-100 dark:bg-sky-950/70',
    text: 'text-sky-900 dark:text-sky-300 font-bold',
    border: 'border-sky-300 dark:border-sky-800',
    icon: Clock,
  },
  EM_PREPARO: {
    label: 'Em Preparo',
    bg: 'bg-amber-100 dark:bg-amber-950/70',
    text: 'text-amber-950 dark:text-amber-300 font-bold',
    border: 'border-amber-300 dark:border-amber-800',
    icon: ChefHat,
  },
  SAIU_PARA_ENTREGA: {
    label: 'Saiu para Entrega',
    bg: 'bg-indigo-100 dark:bg-indigo-950/70',
    text: 'text-indigo-950 dark:text-indigo-300 font-bold',
    border: 'border-indigo-300 dark:border-indigo-800',
    icon: Bike,
  },
  ENTREGUE: {
    label: 'Entregue',
    bg: 'bg-emerald-100 dark:bg-emerald-950/70',
    text: 'text-emerald-950 dark:text-emerald-300 font-bold',
    border: 'border-emerald-300 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  CANCELADO: {
    label: 'Cancelado',
    bg: 'bg-rose-100 dark:bg-rose-950/70',
    text: 'text-rose-950 dark:text-rose-300 font-bold',
    border: 'border-rose-300 dark:border-rose-800',
    icon: XCircle,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, showIcon = true }) => {
  const config = statusConfig[status] || statusConfig.RECEBIDO;
  const Icon = config.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-all whitespace-nowrap shadow-2xs',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};

export const StatusSelect: React.FC<StatusSelectProps> = ({ status, onChangeStatus, disabled }) => {
  const config = statusConfig[status] || statusConfig.RECEBIDO;
  const Icon = config.icon;
  const isFinalStatus = status === 'ENTREGUE' || status === 'CANCELADO';

  if (isFinalStatus) {
    return <StatusBadge status={status} />;
  }

  const optionClass =
    'bg-white text-slate-900 dark:bg-zinc-900 dark:text-zinc-100 font-semibold p-2';

  return (
    <div className="relative inline-flex items-center">
      {/* Visual Pill Badge com Alta Legibilidade no Modo Claro */}
      <div
        className={clsx(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-all pointer-events-none z-0 shadow-2xs',
          config.bg,
          config.text,
          config.border
        )}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{config.label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-80 ml-0.5" />
      </div>

      {/* Select invisível por cima com opções estilizadas */}
      <select
        value={status}
        onChange={(e) => onChangeStatus(e.target.value as OrderStatus)}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 font-bold"
        title="Clique para alterar o status"
      >
        <option value="RECEBIDO" className={optionClass}>
          Recebido
        </option>
        <option value="EM_PREPARO" className={optionClass}>
          Em Preparo
        </option>
        <option value="SAIU_PARA_ENTREGA" className={optionClass}>
          Saiu para Entrega
        </option>
        <option value="ENTREGUE" className={optionClass}>
          Entregue
        </option>
        <option value="CANCELADO" className={optionClass}>
          Cancelado
        </option>
      </select>
    </div>
  );
};
