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
              <svg
                viewBox="0 0 500 500"
                className="w-16 h-16 fill-white opacity-90"
                aria-label="Nova Acrópole"
              >
                <path d="M360.69,108.29c-1.64-3.9-3.28-7.8-4.92-11.71l-3.29-7.8-3.28-7.8a3.17,3.17,0,0,0-2.46-1.64H305.31a1.62,1.62,0,0,0-1.64,1.64V252.52c0,1.64,0,3.29,0,4.93V406.18a1.62,1.62,0,0,0,1.64,1.64h41.43a1.63,1.63,0,0,0,1.64-1.64V272.46c0-1.64,0-3.28,0-4.92V108.29Z" />
                <path d="M216.25,188.86a98.71,98.71,0,0,0-42.25,9.85,95.39,95.39,0,0,0-34.44,26.18c-9.85,11.49-17.65,24.55-19.29,39.78-1.64,15.24,1.64,31.16,11.49,42.24a59.38,59.38,0,0,0,36,18.48,142.29,142.29,0,0,0,39.79.82,131,131,0,0,0,37.32-8.21,1.63,1.63,0,0,0,.83-1.64V277.38a1.63,1.63,0,0,0-1.64-1.64H193a1.63,1.63,0,0,0-1.64,1.64v31.16a1.63,1.63,0,0,0,1.64,1.64h20.12a.82.82,0,0,1,.82.82v8.21a1.21,1.21,0,0,1-.82,1.64,62.8,62.8,0,0,1-19.3,3.28,86.19,86.19,0,0,1-23.4-.82c-7.39-1.64-14-4.92-19.29-11.49A49.47,49.47,0,0,1,141.2,283.8a87.31,87.31,0,0,1,9-36A81.86,81.86,0,0,1,169.75,222c8.2-7.39,18.05-13.13,29.54-16.41a91.53,91.53,0,0,1,35.29-1.65,95.22,95.22,0,0,1,33.65,12.32,82.56,82.56,0,0,1,25.44,25.44,83.39,83.39,0,0,1,13.13,35.28,92.07,92.07,0,0,1-1.64,35.29,80.68,80.68,0,0,1-15.6,32,73.87,73.87,0,0,1-28,21.34,83,83,0,0,1-34.61,7.39,108.56,108.56,0,0,1-35.29-3.29,1.4,1.4,0,0,0-1.64.82l-13.13,31.17a1.42,1.42,0,0,0,.82,1.64,177.27,177.27,0,0,0,50.06,9c17.66,0,34.43-3.28,50-9.85a130,130,0,0,0,41.8-27.08,121.55,121.55,0,0,0,27.89-42.25A135.91,135.91,0,0,0,324,278.2a128.27,128.27,0,0,0-9-48.1,124.38,124.38,0,0,0-26.25-41.43,129.13,129.13,0,0,0-41.43-27.89,141.46,141.46,0,0,0-49.68-10.66A167.09,167.09,0,0,0,134.63,158,150.83,150.83,0,0,0,92.38,185.1a2.34,2.34,0,0,0-.82,1.64v39.79a1.08,1.08,0,0,0,1.64.82,113.09,113.09,0,0,1,29.54-25.45,122.09,122.09,0,0,1,36.93-15.59,170.37,170.37,0,0,1,39.79-4.93c3.28-.82,7.38,0,11.48,0h4.92c.82,1.64.82,2.46,0,3.28a60.06,60.06,0,0,0-3.28,5.75h0Z" />
              </svg>
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
