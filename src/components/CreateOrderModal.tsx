import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, Plus, Minus, Trash2, ShoppingBag, MapPin, User as UserIcon, AlertCircle } from 'lucide-react';

import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import type { Product, ProductCategory } from '../types';
import { categoryLabels } from './ProductManagerModal';
import { Input } from './Input';
import { Button } from './Button';

const itemSchema = z.object({
  productName: z.string().min(1, 'Selecione um produto do cardápio'),
  quantity: z.number({ message: 'Qtd inválida' }).min(1, 'Mínimo 1'),
  unitPrice: z.number({ message: 'Preço inválido' }).min(0.01, 'Preço deve ser maior que zero'),
});

const createOrderSchema = z.object({
  customerName: z.string().min(3, 'O nome do cliente é obrigatório (mín. 3 caracteres)'),
  deliveryAddress: z.string().min(5, 'O endereço de entrega é obrigatório'),
  items: z.array(itemSchema).min(1, 'Adicione pelo menos 1 item ao pedido'),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProductManager?: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onOpenProductManager,
}) => {
  const queryClient = useQueryClient();

  // Buscar produtos disponíveis no backend
  const { data: availableProducts = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products-available'],
    queryFn: () => productService.getAll(true),
    enabled: isOpen,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerName: '',
      deliveryAddress: '',
      items: [{ productName: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items') || [];

  // Agrupar produtos por categoria para renderizar no <optgroup>
  const productsByCategory = React.useMemo(() => {
    const map: Record<string, Product[]> = {};
    availableProducts.forEach((p) => {
      const catName = categoryLabels[p.category as ProductCategory] || p.category;
      if (!map[catName]) map[catName] = [];
      map[catName].push(p);
    });
    return map;
  }, [availableProducts]);

  // Handler para quando o usuário seleciona um produto no dropdown
  const handleProductSelect = (index: number, productIdStr: string) => {
    if (!productIdStr) {
      setValue(`items.${index}.productName`, '');
      setValue(`items.${index}.unitPrice`, 0);
      return;
    }

    const selectedProd = availableProducts.find((p) => p.id.toString() === productIdStr);
    if (selectedProd) {
      setValue(`items.${index}.productName`, selectedProd.name);
      setValue(`items.${index}.unitPrice`, Number(selectedProd.price));
    }
  };

  // Handlers para incrementar e decrementar quantidade via botões - / +
  const handleDecreaseQty = (index: number) => {
    const currentQty = Number(watchedItems[index]?.quantity) || 1;
    const newQty = Math.max(1, currentQty - 1);
    setValue(`items.${index}.quantity`, newQty, { shouldValidate: true });
  };

  const handleIncreaseQty = (index: number) => {
    const currentQty = Number(watchedItems[index]?.quantity) || 1;
    const newQty = currentQty + 1;
    setValue(`items.${index}.quantity`, newQty, { shouldValidate: true });
  };

  // Cálculo automático do total do pedido em tempo real
  const totalPriceCalculated = watchedItems.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  const createMutation = useMutation({
    mutationFn: orderService.create,
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Pedido #${newOrder.id} criado com sucesso! 🎉`);
      handleCloseModal();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Erro ao criar o pedido. Tente novamente.';
      toast.error(msg);
    },
  });

  const onSubmit = (data: CreateOrderFormData) => {
    createMutation.mutate({
      customerName: data.customerName,
      deliveryAddress: data.deliveryAddress,
      items: data.items.map((i) => ({
        productName: i.productName,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    });
  };

  const handleCloseModal = () => {
    reset({
      customerName: '',
      deliveryAddress: '',
      items: [{ productName: '', quantity: 1, unitPrice: 0 }],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-8">
        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#FF5C5C]/10 rounded-2xl text-[#FF5C5C]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-main)]">Novo Pedido de Delivery</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Selecione os produtos do cardápio e defina o endereço de entrega
            </p>
          </div>
        </div>

        {/* Alerta se não houver produtos cadastrados */}
        {!isLoadingProducts && availableProducts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-center flex flex-col items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
            <h3 className="text-sm font-bold">Nenhum produto cadastrado no cardápio</h3>
            <p className="text-xs mt-1 max-w-md">
              Você precisa cadastrar produtos no cardápio antes de criar um novo pedido.
            </p>
            {onOpenProductManager && (
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  onClose();
                  onOpenProductManager();
                }}
                className="mt-4 text-xs py-2 px-4"
              >
                Cadastrar Produtos Agora
              </Button>
            )}
          </div>
        ) : (
          /* Formulário de Pedido */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nome do Cliente"
              placeholder="Ex: João da Silva"
              icon={<UserIcon className="w-4 h-4 text-[var(--text-muted)]" />}
              error={errors.customerName?.message}
              {...register('customerName')}
            />

            <Input
              label="Endereço de Entrega"
              placeholder="Ex: Av. Paulista, 1000 - Ap 42 - Bela Vista, SP"
              icon={<MapPin className="w-4 h-4 text-[var(--text-muted)]" />}
              error={errors.deliveryAddress?.message}
              {...register('deliveryAddress')}
            />

            {/* Seção de Seleção de Itens */}
            <div className="border-t border-[var(--border-color)] pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-[var(--text-main)]">
                  Itens do Pedido ({fields.length})
                </label>
              </div>

              {errors.items?.root?.message && (
                <p className="text-xs text-red-500 font-medium mb-3">{errors.items.root.message}</p>
              )}

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {fields.map((field, index) => {
                  const currentProductName = watchedItems[index]?.productName || '';
                  const selectedProductObj = availableProducts.find(
                    (p) => p.name === currentProductName
                  );
                  const qty = Number(watchedItems[index]?.quantity) || 1;
                  const price = Number(watchedItems[index]?.unitPrice) || 0;
                  const subTotal = qty * price;

                  return (
                    <div
                      key={field.id}
                      className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    >
                      {/* Dropdown de Produto com Optgroup */}
                      <div className="flex-1 w-full">
                        <select
                          value={selectedProductObj ? selectedProductObj.id.toString() : ''}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          className="w-full text-xs font-medium rounded-xl px-3 py-2.5 border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] outline-none focus:border-[#FF5C5C] cursor-pointer"
                        >
                          <option value="">-- Selecione um produto do cardápio --</option>
                          {Object.entries(productsByCategory).map(([catName, prods]) => (
                            <optgroup key={catName} label={catName}>
                              {prods.map((prod) => (
                                <option key={prod.id} value={prod.id}>
                                  {prod.name} (R$ {prod.price.toFixed(2)})
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        {errors.items?.[index]?.productName?.message && (
                          <span className="text-[10px] text-red-500 font-medium block mt-0.5">
                            {errors.items[index]?.productName?.message}
                          </span>
                        )}
                      </div>

                      {/* Controle de Quantidade Customizado (Botões - / + e Edição Manual) */}
                      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-[var(--text-muted)]">Qtd:</span>

                          <div className="flex items-center gap-0.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleDecreaseQty(index)}
                              disabled={qty <= 1}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer font-bold text-sm"
                              title="Diminuir quantidade"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <input
                              type="number"
                              min="1"
                              className="w-10 text-center text-xs font-bold bg-transparent text-[var(--text-main)] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              {...register(`items.${index}.quantity` as const, {
                                valueAsNumber: true,
                              })}
                            />

                            <button
                              type="button"
                              onClick={() => handleIncreaseQty(index)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#FF5C5C]/10 text-[#FF5C5C] hover:bg-[#FF5C5C]/20 transition-all cursor-pointer font-bold text-sm"
                              title="Aumentar quantidade"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="w-24 text-right">
                          <span className="text-xs font-semibold text-[var(--text-muted)] block text-[10px]">
                            Subtotal
                          </span>
                          <span className="text-xs font-bold text-[var(--text-main)]">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(subTotal)}
                          </span>
                        </div>

                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Remover produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botão Grande de Adicionar Produto Abaixo da Lista de Itens */}
              <button
                type="button"
                onClick={() => append({ productName: '', quantity: 1, unitPrice: 0 })}
                className="w-full mt-3 py-3 rounded-2xl border-2 border-dashed border-[#FF5C5C]/50 hover:border-[#FF5C5C] text-[#FF5C5C] hover:bg-[#FF5C5C]/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" /> Adicionar Outro Produto ao Pedido
              </button>
            </div>

            {/* Total Geral e Ações */}
            <div className="border-t border-[var(--border-color)] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[var(--text-muted)] block">Valor Total do Pedido</span>
                <span className="text-xl font-bold text-[#FF5C5C]">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(totalPriceCalculated)}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button type="button" variant="outline" onClick={handleCloseModal} className="w-1/2 sm:w-auto">
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createMutation.isPending}
                  className="w-1/2 sm:w-auto px-6"
                >
                  Confirmar Pedido
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
