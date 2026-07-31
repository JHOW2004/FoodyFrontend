import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, ShieldCheck, User as UserIcon, UserPlus } from 'lucide-react';
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

const registerSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').max(100, 'Nome muito longo'),
    email: z.string().min(1, 'O e-mail é obrigatório').email('E-mail inválido'),
    password: z
      .string()
      .min(10, 'A senha deve ter no mínimo 10 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos 1 letra maiúscula')
      .regex(/[a-z]/, 'A senha deve conter pelo menos 1 letra minúscula')
      .regex(/[0-9]/, 'A senha deve conter pelo menos 1 número')
      .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos 1 caractere especial (!@#$%...)'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      setAuth(
        {
          userId: response.userId,
          name: response.name,
          email: response.email,
          role: response.role,
        },
        response.token
      );

      toast.success('Conta criada com sucesso! Seja bem-vindo(a) 🚀');
      navigate('/dashboard');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao realizar cadastro. Tente novamente.';
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

      {/* Card Central de Cadastro */}
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl relative z-10 backdrop-blur-sm my-6">
        {/* Cabeçalho do Card com LogoCompleta.png */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/LogoCompleta.png"
            alt="Foody Delivery Logo"
            className="h-20 w-auto object-contain mb-3 drop-shadow-md"
          />
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Cadastre-se para acessar o painel completo de pedidos
          </p>
        </div>

        {/* Formulário de Registro */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <Input
            label="Nome Completo"
            type="text"
            placeholder="Ex: Ana Souza"
            icon={<UserIcon className="w-4 h-4 text-[var(--text-muted)]" />}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="E-mail"
            type="email"
            placeholder="ana.souza@foody.com.br"
            icon={<Mail className="w-4 h-4 text-[var(--text-muted)]" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <Input
              label="Senha de Acesso"
              type="password"
              placeholder="Ex: P@ssword123"
              icon={<Lock className="w-4 h-4 text-[var(--text-muted)]" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="mt-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF5C5C] shrink-0 mt-0.5" />
              <span>
                A senha deve ter no mínimo <strong>10 caracteres</strong>, contendo{' '}
                <strong>maiúscula</strong>, <strong>minúscula</strong>, <strong>número</strong> e{' '}
                <strong>caractere especial (!@#$)</strong>.
              </span>
            </div>
          </div>

          <Input
            label="Confirmar Senha"
            type="password"
            placeholder="Repita a senha"
            icon={<Lock className="w-4 h-4 text-[var(--text-muted)]" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full mt-3 py-3 font-semibold text-base"
            icon={<UserPlus className="w-5 h-5" />}
          >
            Cadastrar Conta
          </Button>
        </form>

        {/* Footer do Card - Link para Login */}
        <div className="mt-6 text-center text-sm text-[var(--text-muted)] border-t border-[var(--border-color)] pt-4">
          Já tem uma conta cadastrada?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#FF5C5C] hover:underline hover:text-[#E04848] transition-colors"
          >
            Faça login aqui
          </Link>
        </div>
      </div>
    </div>
  );
};
