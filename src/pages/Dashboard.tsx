import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  Plus,
  LogOut,
  History,
  Trash2,
  RefreshCw,
  ShoppingBag,
  Filter,
} from 'lucide-react';

import { useAuthStore } from '../stores/useAuthStore';
import { orderService } from '../services/orderService';
import type { Order, OrderStatus } from '../types';
import { StatusBadge, statusConfig } from '../components/StatusBadge';
import { MetricsCards } from '../components/MetricsCards';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { OrderHistoryModal } from '../components/OrderHistoryModal';

const columnHelper = createColumnHelper<Order>();

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedHistoryOrderId, setSelectedHistoryOrderId] = useState<number | null>(null);

  // Buscar lista de pedidos via TanStack Query
  const {
    data: orders = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: orderService.getAll,
  });

  // Mutation para atualização rápida de status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      orderService.updateStatus(id, { status }),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(
        `Status do Pedido #${updatedOrder.id} alterado para "${statusConfig[updatedOrder.status].label}"! 🚀`
      );
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Erro ao atualizar status do pedido.';
      toast.error(msg);
    },
  });

  // Mutation para exclusão de pedido
  const deleteOrderMutation = useMutation({
    mutationFn: (id: number) => orderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedido excluído com sucesso!');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Erro ao excluir pedido.';
      toast.error(msg);
    },
  });

  const handleDelete = (id: number, customerName: string) => {
    if (confirm(`Tem certeza que deseja excluir o pedido #${id} de "${customerName}"?`)) {
      deleteOrderMutation.mutate(id);
    }
  };

  // Filtragem de pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchLower) ||
        order.deliveryAddress.toLowerCase().includes(searchLower) ||
        order.id.toString().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchTerm]);

  // Colunas da Tabela TanStack Table
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
            #{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('customerName', {
        header: 'Cliente / Endereço',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div>
              <div className="font-semibold text-sm text-[var(--text-main)]">{row.customerName}</div>
              <div className="text-xs text-[var(--text-muted)] truncate max-w-xs" title={row.deliveryAddress}>
                {row.deliveryAddress}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('items', {
        header: 'Itens',
        cell: (info) => {
          const items = info.getValue() || [];
          return (
            <div className="text-xs">
              <span className="font-medium text-[var(--text-main)]">
                {items.reduce((acc, item) => acc + item.quantity, 0)} produto(s)
              </span>
              <div className="text-[var(--text-muted)] truncate max-w-xs">
                {items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('totalPrice', {
        header: 'Total (R$)',
        cell: (info) => (
          <span className="font-bold text-sm text-[var(--text-main)]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              info.getValue() || 0
            )}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status Atual',
        cell: (info) => {
          const order = info.row.original;
          const isFinalStatus = order.status === 'ENTREGUE' || order.status === 'CANCELADO';

          return (
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />

              {!isFinalStatus && (
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatusMutation.mutate({
                      id: order.id,
                      status: e.target.value as OrderStatus,
                    })
                  }
                  disabled={updateStatusMutation.isPending}
                  className="text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] p-1 outline-none focus:ring-1 focus:ring-[#FF5C5C] cursor-pointer"
                >
                  <option value="RECEBIDO">Alterar ➔ RECEBIDO</option>
                  <option value="EM_PREPARO">Alterar ➔ EM_PREPARO</option>
                  <option value="SAIU_PARA_ENTREGA">Alterar ➔ SAIU_PARA_ENTREGA</option>
                  <option value="ENTREGUE">Alterar ➔ ENTREGUE</option>
                  <option value="CANCELADO">Alterar ➔ CANCELADO</option>
                </select>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Data / Hora',
        cell: (info) => {
          try {
            return (
              <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                {format(new Date(info.getValue()), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </span>
            );
          } catch {
            return <span className="text-xs text-[var(--text-muted)]">-</span>;
          }
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Ações',
        cell: (info) => {
          const order = info.row.original;
          return (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedHistoryOrderId(order.id)}
                className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[#FF5C5C] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
                title="Ver Histórico / Timeline"
              >
                <History className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(order.id, order.customerName)}
                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                title="Excluir Pedido"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      }),
    ],
    [updateStatusMutation]
  );

  const table = useReactTable({
    data: filteredOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Header Fixo */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <img src="/LogoCompleta.png" alt="Foody Delivery Logo" className="h-9 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-[var(--text-main)]">{user?.name}</span>
            <span className="text-xs text-[var(--text-muted)]">{user?.email}</span>
          </div>
          <ThemeToggle />
          <Button variant="outline" onClick={logout} icon={<LogOut className="w-4 h-4" />}>
            Sair
          </Button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Título e Botão de Novo Pedido */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
              Gestão de Pedidos
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Rastreamento em tempo real e atualização de status dos pedidos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              isLoading={isRefetching}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Atualizar
            </Button>

            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              icon={<Plus className="w-5 h-5" />}
              className="py-2.5 px-5 font-semibold text-sm shadow-md"
            >
              Novo Pedido
            </Button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <MetricsCards orders={orders} />

        {/* Filtros e Busca */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por cliente, endereço ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none focus:border-[#FF5C5C] focus:ring-2 focus:ring-[#FF5C5C]/20 transition-all"
            />
          </div>

          {/* Filtros por Status */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>

            {(
              [
                { key: 'ALL', label: 'Todos' },
                { key: 'RECEBIDO', label: 'Recebido' },
                { key: 'EM_PREPARO', label: 'Em Preparo' },
                { key: 'SAIU_PARA_ENTREGA', label: 'Saiu p/ Entrega' },
                { key: 'ENTREGUE', label: 'Entregue' },
                { key: 'CANCELADO', label: 'Cancelado' },
              ] as const
            ).map((tab) => {
              const isSelected = selectedStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF5C5C] text-white shadow-xs'
                      : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[#FF5C5C]/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabela de Pedidos */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="p-12 text-center text-[var(--text-muted)] flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-[#FF5C5C] mb-3" />
              <p className="text-sm font-medium">Carregando pedidos do servidor...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-[var(--text-muted)] flex flex-col items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-[var(--text-muted)] opacity-50 mb-3" />
              <p className="text-base font-semibold text-[var(--text-main)]">Nenhum pedido encontrado</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
                Tente ajustar seus filtros de busca ou crie um novo pedido no botão acima.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b border-[var(--border-color)] bg-[var(--bg-main)]/60 text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider"
                    >
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-6 py-4">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors text-sm"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação da Tabela */}
          {filteredOrders.length > 0 && (
            <div className="px-6 py-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>
                Exibindo {table.getRowModel().rows.length} de {filteredOrders.length} pedido(s)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] disabled:opacity-40 cursor-pointer hover:border-[#FF5C5C]/50"
                >
                  Anterior
                </button>

                <span className="font-medium text-[var(--text-main)]">
                  Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </span>

                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] disabled:opacity-40 cursor-pointer hover:border-[#FF5C5C]/50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Criação de Pedido */}
      {isCreateModalOpen && (
        <CreateOrderModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      )}

      {/* Modal de Histórico do Pedido */}
      {selectedHistoryOrderId !== null && (
        <OrderHistoryModal
          orderId={selectedHistoryOrderId}
          onClose={() => setSelectedHistoryOrderId(null)}
        />
      )}
    </div>
  );
};
