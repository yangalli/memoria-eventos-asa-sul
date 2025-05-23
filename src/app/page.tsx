"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, MessageSquare, ClipboardEdit, BarChart3, Users, MapPin } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 p-4">
        <div className="text-center text-white">
          <p className="text-xl">Carregando...</p> {/* Ou um spinner */}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent flex items-center justify-center">
          <LayoutDashboard className="h-10 w-10 md:h-12 md:w-12 mr-3 text-emerald-700" />
          Memory System
        </h1>
        <p className="mt-3 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Acompanhe e lembre-se dos eventos da sua organização a partir de múltiplas perspectivas.
        </p>
        {user && (
          <p className="mt-4 text-xl text-emerald-700 font-semibold">
            Bem-vindo(a), {user.name}!
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Cards visíveis para secretários e administradores */}
        {hasRole(['secretary', 'admin']) && (
          <Link href="/events" legacyBehavior>
            <a className="block transform transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-xl">
              <Card className="h-full border-0 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
                <CardHeader className="pb-3 bg-emerald-50/30">
                  <CardTitle className="text-xl font-semibold text-emerald-800 flex items-center">
                    <CalendarDays className="h-6 w-6 mr-3 text-emerald-700" />
                    Eventos
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 pt-1">Crie e gerencie os eventos.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow text-gray-700 bg-emerald-50/30">
                  <p>Adicione novos eventos, visualize futuros e passados, e gerencie seus detalhes.</p>
                </CardContent>
                <CardFooter className="bg-emerald-50/30 pt-4 pb-5 border-t border-emerald-100/30">
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">Ver Eventos</Button>
                </CardFooter>
              </Card>
            </a>
          </Link>
        )}

        {/* Cards visíveis para todos os usuários */}
        <Link href="/feedback/participant" legacyBehavior>
          <a className="block transform transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-xl">
            <Card className="h-full border-0 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
              <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
              <CardHeader className="pb-3 bg-emerald-50/30">
                <CardTitle className="text-xl font-semibold text-emerald-800 flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3 text-emerald-700" />
                  Feedback dos Participantes
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 pt-1">Colete o feedback dos participantes.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow text-gray-700 bg-emerald-50/30">
                <p>Reúna informações sobre arte, comida, experiência em grupo, conversas e mais.</p>
              </CardContent>
              <CardFooter className="bg-emerald-50/30 pt-4 pb-5 border-t border-emerald-100/30">
                <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">Compartilhar Feedback</Button>
              </CardFooter>
            </Card>
          </a>
        </Link>

        <Link href="/feedback/organizer" legacyBehavior>
          <a className="block transform transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-xl">
            <Card className="h-full border-0 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
              <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
              <CardHeader className="pb-3 bg-emerald-50/30">
                <CardTitle className="text-xl font-semibold text-emerald-800 flex items-center">
                  <ClipboardEdit className="h-6 w-6 mr-3 text-emerald-700" />
                  Anotações dos Organizadores
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 pt-1">Documente as perspectivas dos organizadores.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow text-gray-700 bg-emerald-50/30">
                <p>Acompanhe despesas, voluntários, desafios e sugestões para eventos futuros.</p>
              </CardContent>
              <CardFooter className="bg-emerald-50/30 pt-4 pb-5 border-t border-emerald-100/30">
                <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">Adicionar Anotações</Button>
              </CardFooter>
            </Card>
          </a>
        </Link>

        {/* Cards visíveis para secretários e administradores */}
        {hasRole(['secretary', 'admin']) && (
          <Link href="/reports" legacyBehavior>
            <a className="block transform transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-xl">
              <Card className="h-full border-0 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
                <CardHeader className="pb-3 bg-emerald-50/30">
                  <CardTitle className="text-xl font-semibold text-emerald-800 flex items-center">
                    <BarChart3 className="h-6 w-6 mr-3 text-emerald-700" />
                    Relatórios
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 pt-1">Visualize e analise dados dos eventos.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow text-gray-700 bg-emerald-50/30">
                  <p>Acesse estatísticas e feedbacks consolidados sobre os eventos realizados.</p>
                </CardContent>
                <CardFooter className="bg-emerald-50/30 pt-4 pb-5 border-t border-emerald-100/30">
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">Ver Relatórios</Button>
                </CardFooter>
              </Card>
            </a>
          </Link>
        )}

        {/* Card visível apenas para administradores */}
        {hasRole('admin') && (
          <Link href="/admin/users" legacyBehavior>
            <a className="block transform transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-xl">
              <Card className="h-full border-0 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
                <CardHeader className="pb-3 bg-emerald-50/30">
                  <CardTitle className="text-xl font-semibold text-emerald-800 flex items-center">
                    <Users className="h-6 w-6 mr-3 text-emerald-700" />
                    Gerenciamento de Usuários
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 pt-1">Controle usuários e seus acessos.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow text-gray-700 bg-emerald-50/30">
                  <p>Adicione, edite ou remova usuários e gerencie suas permissões no sistema.</p>
                </CardContent>
                <CardFooter className="bg-emerald-50/30 pt-4 pb-5 border-t border-emerald-100/30">
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">Gerenciar Usuários</Button>
                </CardFooter>
              </Card>
            </a>
          </Link>
        )}

        {/* Card visível apenas para administradores */}
        {hasRole('admin') && (
          <Link href="/admin/locations" legacyBehavior>
            <a className="block transform transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-xl">
              <Card className="h-full border-0 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
                <CardHeader className="pb-3 bg-emerald-50/30">
                  <CardTitle className="text-xl font-semibold text-emerald-800 flex items-center">
                    <MapPin className="h-6 w-6 mr-3 text-emerald-700" />
                    Gerenciamento de Locais
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 pt-1">Administre os locais para eventos.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow text-gray-700 bg-emerald-50/30">
                  <p>Cadastre e gerencie os diferentes locais onde os eventos podem acontecer.</p>
                </CardContent>
                <CardFooter className="bg-emerald-50/30 pt-4 pb-5 border-t border-emerald-100/30">
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">Gerenciar Locais</Button>
                </CardFooter>
              </Card>
            </a>
          </Link>
        )}
      </div>
    </div>
  );
}
