"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { FiUser, FiLock, FiX } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Verificar usuário e senha no Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error("Usuário não encontrado");
      }

      // Em um sistema real, você deve usar autenticação do Supabase
      // Aqui estamos apenas simulando a verificação para fins de demonstração
      // Em produção, nunca armazene senhas em texto simples!

      // Simulação de verificação de senha (em produção, use Auth)
      if (data.password !== formData.password) {
        throw new Error("Senha incorreta");
      }

      // Log para depuração
      console.log("Usuário autenticado:", {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      });

      // Garantir que o papel do usuário seja uma string válida
      const userRole = data.role ? String(data.role).toLowerCase() : 'user';

      // Salvar dados do usuário na sessão
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: userRole, // Garantir que estamos usando uma string
      };

      localStorage.setItem('user', JSON.stringify(userData));

      // Redirecionar com base no papel do usuário
      if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'secretary') {
        console.log("Redirecionando para /events como secretário");
        router.push('/events');
      } else {
        router.push('/feedback/participant');
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setError(error.message || "Falha ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-[0.05] bg-repeat"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-emerald-700/20 to-transparent blur-3xl transform -translate-y-1/4 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-emerald-700/20 to-transparent blur-3xl transform translate-y-1/4 -translate-x-1/4"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Memory System</h1>
          <p className="text-emerald-100/80 mt-2">Sistema de Memória de Eventos</p>
          <div className="mt-4 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-lg p-4 flex items-center justify-center">
              <Image
                src="/images/logo.jpg"
                alt="Nova Acrópole"
                width={80}
                height={80}
                className="opacity-90 rounded-full"
              />
            </div>
          </div>
        </div>

        <Card className="w-full backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl font-semibold text-white">Entrar no Sistema</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-white px-4 py-3 rounded-md flex items-center justify-between">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError("")} className="text-white hover:text-red-200">
                    <FiX size={18} />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-800">
                    <FiUser size={16} />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="pl-10 py-5 h-10 bg-white/90 border-white/20 focus:border-white text-emerald-900 placeholder:text-emerald-900/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white">Senha</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-800">
                    <FiLock size={16} />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-10 py-5 h-10 bg-white/90 border-white/20 focus:border-white text-emerald-900 placeholder:text-emerald-900/50"
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
              <Button
                type="submit"
                className="w-full py-5 h-10 bg-emerald-700 hover:bg-emerald-600 transition-all duration-200 font-medium text-white"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="text-center text-sm text-white/80 mt-4 flex flex-col sm:flex-row justify-center items-center gap-1">
                <span>Acesso público aos formulários:</span>
                <div>
                  <Link href="/feedback/participant" className="text-white hover:text-emerald-200 transition-colors font-medium">
                    Participante
                  </Link>
                  <span className="mx-1">ou</span>
                  <Link href="/feedback/organizer" className="text-white hover:text-emerald-200 transition-colors font-medium">
                    Organizador
                  </Link>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
