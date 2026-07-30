import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, Plus, Trash2, Edit2, UtensilsCrossed, RefreshCw, CheckCircle2 } from 'lucide-react';

import { productService } from '../services/productService';
import type { Product, ProductCategory } from '../types';
import { Input } from './Input';
import { Button } from './Button';

const productSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number({ message: 'Preço inválido' }).min(0.01, 'O preço deve ser maior que zero'),
  category: z.enum(['HAMBURGUER', 'CACHORRO_QUENTE', 'SANDUICHE', 'BEBIDA', 'SOBREMESA'] as const),
  available: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const categoryLabels: Record<ProductCategory, string> = {
  HAMBURGUER: 'Hambúrgueres',
  CACHORRO_QUENTE: 'Cachorros Quentes',
  SANDUICHE: 'Sanduíches',
  BEBIDA: 'Bebidas',
  SOBREMESA: 'Sobremesas',
};

export const ProductManagerModal: React.FC<ProductManagerModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    data: products = [],
    isLoading,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ['products-all'],
    queryFn: () => productService.getAll(false),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 15.0,
      category: 'HAMBURGUER',
      available: true,
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      if (editingProduct) {
        return productService.update(editingProduct.id, data);
      }
      return productService.create(data);
    },
    onSuccess: (savedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products-all'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-available'] });
      toast.success(
        editingProduct
          ? `Produto "${savedProduct.name}" atualizado!`
          : `Produto "${savedProduct.name}" cadastrado com sucesso! 🎉`
      );
      handleCancelForm();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Erro ao salvar o produto.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-all'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-available'] });
      toast.success('Produto removido com sucesso!');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Erro ao remover produto.';
      toast.error(msg);
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('description', product.description || '');
    setValue('price', product.price);
    setValue('category', product.category);
    setValue('available', product.available);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setEditingProduct(null);
    reset({
      name: '',
      description: '',
      price: 15.0,
      category: 'HAMBURGUER',
      available: true,
    });
    setIsFormOpen(false);
  };

  const onSubmit = (data: ProductFormData) => {
    saveMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-hidden">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl relative my-auto max-h-[85vh] flex flex-col overflow-hidden">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho Fixo */}
        <div className="flex items-center justify-between mb-4 pr-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FF5C5C]/10 rounded-2xl text-[#FF5C5C]">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-main)]">Gestão do Cardápio</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Cadastre e edite os produtos disponíveis para pedido no Foody Delivery
              </p>
            </div>
          </div>

          {!isFormOpen && (
            <Button
              variant="primary"
              onClick={() => {
                setEditingProduct(null);
                reset({
                  name: '',
                  description: '',
                  price: 15.0,
                  category: 'HAMBURGUER',
                  available: true,
                });
                setIsFormOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
              className="text-xs py-2 px-3"
            >
              Novo Produto
            </Button>
          )}
        </div>

        {/* Conteúdo com Scroll Interno Garantido (max-h-[85vh]) */}
        <div className="flex-1 overflow-y-auto pr-1.5 space-y-5">
          {/* Formulário de Criação/Edição */}
          {isFormOpen && (
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-main)] border-b border-[var(--border-color)] pb-2">
                {editingProduct ? `Editar Produto: ${editingProduct.name}` : 'Cadastrar Novo Produto'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome do Produto"
                  placeholder="Ex: Hambúrguer Triplo Cheddar"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <div>
                  <label className="text-sm font-medium text-[var(--text-main)] block mb-1.5">
                    Categoria
                  </label>
                  <select
                    className="w-full text-sm rounded-xl px-4 py-2.5 border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] outline-none focus:border-[#FF5C5C]"
                    {...register('category')}
                  >
                    <option value="HAMBURGUER">Hambúrgueres</option>
                    <option value="CACHORRO_QUENTE">Cachorros Quentes</option>
                    <option value="SANDUICHE">Sanduíches</option>
                    <option value="BEBIDA">Bebidas</option>
                    <option value="SOBREMESA">Sobremesas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--text-main)] block mb-1.5">
                    Preço de Venda (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="29.90"
                    className="w-full text-sm rounded-xl px-4 py-2.5 border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] outline-none focus:border-[#FF5C5C]"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price?.message && (
                    <span className="text-xs text-red-500 font-medium">{errors.price.message}</span>
                  )}
                </div>

                <Input
                  label="Descrição / Ingredientes"
                  placeholder="Ex: Pão brioche, 180g blend bovino..."
                  error={errors.description?.message}
                  {...register('description')}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="available"
                  className="w-4 h-4 rounded text-[#FF5C5C] focus:ring-[#FF5C5C]"
                  {...register('available')}
                />
                <label htmlFor="available" className="text-xs font-semibold text-[var(--text-main)] cursor-pointer">
                  Produto disponível para vendas no cardápio
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
                <Button type="button" variant="outline" onClick={handleCancelForm} className="text-xs py-2">
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={saveMutation.isPending} className="text-xs py-2 px-5">
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </Button>
              </div>
            </form>
          )}

          {/* Lista de Produtos Cadastrados */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                {products.length} produto(s) no cardápio
              </span>

              <button
                type="button"
                onClick={() => refetch()}
                className="text-xs text-[#FF5C5C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Atualizar Lista
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-[var(--text-muted)] flex flex-col items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-[#FF5C5C] mb-2" />
                <p className="text-xs">Carregando cardápio...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center border border-[var(--border-color)] rounded-2xl bg-[var(--bg-main)]">
                <p className="text-sm font-semibold text-[var(--text-main)]">Nenhum produto cadastrado</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Clique no botão "Novo Produto" acima para cadastrar seu primeiro item.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 divide-y divide-[var(--border-color)]/40">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-main)] text-sm truncate">
                          {product.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-[10px] font-semibold text-[var(--text-muted)] shrink-0">
                          {categoryLabels[product.category] || product.category}
                        </span>
                        {product.available ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> Disponível
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-500 font-semibold shrink-0">
                            Indisponível
                          </span>
                        )}
                      </div>

                      {product.description && (
                        <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-bold text-sm text-[#FF5C5C]">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(product.price)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="p-1.5 rounded-lg border border-[var(--border-color)] hover:text-[#FF5C5C] transition-colors cursor-pointer"
                          title="Editar produto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remover "${product.name}" do cardápio?`)) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Remover produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-end shrink-0">
          <Button variant="outline" onClick={onClose} className="text-xs py-2 px-5">
            Concluído
          </Button>
        </div>
      </div>
    </div>
  );
};
