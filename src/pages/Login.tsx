import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, LogIn, Mail } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ThemeToggle } from '../components/ThemeToggle';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';

const loginSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      setAuth(
        {
          userId: response.userId,
          name: response.name,
          email: response.email,
          role: response.role,
        },
        response.token
      );

      toast.success(`Bem-vindo(a) de volta, ${response.name}! 👋`);
      navigate('/dashboard');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'E-mail ou senha incorretos. Tente novamente.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--bg-main)] relative overflow-hidden">
      {/* Botão de Tema no Topo Superior Direito */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Background Decorativo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF5C5C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2E2E2E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Central de Login */}
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl relative z-10 backdrop-blur-sm">
        {/* Cabeçalho do Card com LogoCompleta.png */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/LogoCompleta.png"
            alt="Foody Delivery Logo"
            className="h-20 w-auto object-contain mb-3 drop-shadow-md"
          />
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Entre para gerenciar e rastrear pedidos em tempo real
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu.email@foody.com.br"
            icon={<Mail className="w-4 h-4 text-[var(--text-muted)]" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4 text-[var(--text-muted)]" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full mt-2 py-3 font-semibold text-base"
            icon={<LogIn className="w-5 h-5" />}
          >
            Entrar no Sistema
          </Button>
        </form>

        {/* Footer do Card - Link para Registro */}
        <div className="mt-8 text-center text-sm text-[var(--text-muted)] border-t border-[var(--border-color)] pt-5">
          Ainda não possui uma conta?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#FF5C5C] hover:underline hover:text-[#E04848] transition-colors"
          >
            Cadastre-se aqui
          </Link>
        </div>
      </div>
    </div>
  );
};
