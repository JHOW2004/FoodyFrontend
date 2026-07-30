import React from 'react';
import type { Order } from '../types';
import { ShoppingBag, Clock, ChefHat, Bike, CheckCircle2, DollarSign } from 'lucide-react';

interface MetricsCardsProps {
  orders: Order[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ orders }) => {
  const totalOrders = orders.length;
  const recebidos = orders.filter((o) => o.status === 'RECEBIDO').length;
  const emPreparo = orders.filter((o) => o.status === 'EM_PREPARO').length;
  const saiuParaEntrega = orders.filter((o) => o.status === 'SAIU_PARA_ENTREGA').length;
  const entregues = orders.filter((o) => o.status === 'ENTREGUE').length;

  const faturamentoTotal = orders
    .filter((o) => o.status !== 'CANCELADO')
    .reduce((acc, o) => acc + (o.totalPrice || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const cards = [
    {
      title: 'Total de Pedidos',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-100 dark:bg-zinc-800',
    },
    {
      title: 'Recebidos',
      value: recebidos,
      icon: Clock,
      color: 'text-sky-700 dark:text-sky-400',
      bgColor: 'bg-sky-100 dark:bg-sky-950/60',
    },
    {
      title: 'Em Preparo',
      value: emPreparo,
      icon: ChefHat,
      color: 'text-amber-800 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-950/60',
    },
    {
      title: 'Saiu p/ Entrega',
      value: saiuParaEntrega,
      icon: Bike,
      color: 'text-indigo-700 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-950/60',
    },
    {
      title: 'Concluídos',
      value: entregues,
      icon: CheckCircle2,
      color: 'text-emerald-800 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/60',
    },
    {
      title: 'Faturamento Total',
      value: formatCurrency(faturamentoTotal),
      icon: DollarSign,
      color: 'text-[#FF5C5C]',
      bgColor: 'bg-[#FF5C5C]/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-[#FF5C5C]/40 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--text-muted)] truncate">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4 shrink-0" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-[var(--text-main)] truncate mt-1">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
