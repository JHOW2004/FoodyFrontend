import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { LogOut, Package } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Navbar Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src="/LogoCompleta.png" alt="Foody Delivery Logo" className="h-9 w-auto" />
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

      {/* Container Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)]">Painel de Pedidos</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Acompanhe e atualize os pedidos de delivery em tempo real
            </p>
          </div>
        </div>

        {/* Card temporário para validar o fluxo da Sub-etapa 6.3 */}
        <div className="p-8 border border-[var(--border-color)] bg-[var(--bg-card)] rounded-2xl text-center flex flex-col items-center justify-center">
          <Package className="w-12 h-12 text-[#FF5C5C] mb-3" />
          <h2 className="text-lg font-semibold text-[var(--text-main)]">Autenticação Concluída com Sucesso!</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md">
            Você está autenticado no sistema como <strong>{user?.email}</strong>. Na próxima sub-etapa (6.4), a tabela de pedidos completa será integrada aqui.
          </p>
        </div>
      </main>
    </div>
  );
};
