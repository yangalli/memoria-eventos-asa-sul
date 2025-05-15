import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Sistema de Memória de Eventos</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Acompanhe e lembre-se dos eventos da sua organização a partir de múltiplas perspectivas
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
      </div>

      <div className="mt-12 text-center">
        <Link href="/reports">
          <Button variant="outline" size="lg">
            Ver Relatórios de Eventos
          </Button>
        </Link>
      </div>
    </div>
  );
}
