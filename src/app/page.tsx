"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

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
    return null; // Não renderizar nada enquanto redireciona
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Sistema de Memória de Eventos</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Acompanhe e lembre-se dos eventos da sua organização a partir de múltiplas perspectivas
        </p>
        {user && (
          <p className="mt-2 text-lg text-primary">
            Bem-vindo(a), {user.name}!
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Cards visíveis para secretários e administradores */}
        {hasRole(['secretary', 'admin']) && (
          <Card>
            <CardHeader>
              <CardTitle>Eventos</CardTitle>
              <CardDescription>
                Crie e gerencie os eventos da sua organização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Adicione novos eventos, visualize eventos futuros e passados, e gerencie detalhes dos eventos.</p>
            </CardContent>
            <CardFooter>
              <Link href="/events" className="w-full">
                <Button className="w-full">Ver Eventos</Button>
              </Link>
            </CardFooter>
          </Card>
        )}

        {/* Cards visíveis para todos os usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback dos Participantes</CardTitle>
            <CardDescription>
              Colete feedback dos participantes do evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Reúna informações sobre arte, comida, experiência em grupo, conversas e muito mais.</p>
          </CardContent>
          <CardFooter>
            <Link href="/feedback/participant" className="w-full">
              <Button className="w-full">Compartilhar Feedback</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anotações dos Organizadores</CardTitle>
            <CardDescription>
              Documente as perspectivas dos organizadores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Acompanhe despesas, voluntários, desafios enfrentados e sugestões para eventos futuros.</p>
          </CardContent>
          <CardFooter>
            <Link href="/feedback/organizer" className="w-full">
              <Button className="w-full">Adicionar Anotações</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Cards visíveis para secretários e administradores */}
        {hasRole(['secretary', 'admin']) && (
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>
                Visualize e analise dados dos eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Acesse estatísticas, feedbacks consolidados e informações detalhadas sobre os eventos.</p>
            </CardContent>
            <CardFooter>
              <Link href="/reports" className="w-full">
                <Button className="w-full">Ver Relatórios</Button>
              </Link>
            </CardFooter>
          </Card>
        )}

        {/* Card visível apenas para administradores */}
        {hasRole('admin') && (
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Controle usuários e seus níveis de acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Adicione, edite ou remova usuários do sistema e gerencie permissões de acesso.</p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/users" className="w-full">
                <Button className="w-full">Gerenciar Usuários</Button>
              </Link>
            </CardFooter>
          </Card>
        )}

        {/* Card visível apenas para administradores */}
        {hasRole('admin') && (
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Locais</CardTitle>
              <CardDescription>
                Administre locais para eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cadastre e gerencie locais onde os eventos podem acontecer.</p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/locations" className="w-full">
                <Button className="w-full">Gerenciar Locais</Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
