"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, supabase } from "@/lib/supabase";

export default function ReportsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (error: any) {
        console.error("Error fetching events:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="container mx-auto py-10 px-4 text-center">Carregando relatórios...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Erro</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link href="/">
            <Button>Voltar para Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Relatórios de Eventos</h1>
        <Link href="/">
          <Button variant="outline">Voltar para Início</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>
                {new Date(event.date).toLocaleDateString('pt-BR')} • {event.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="line-clamp-2">{event.description}</p>
                <Link href={`/events/${event.id}/report`}>
                  <Button className="w-full">Ver Relatório</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Nenhum relatório de evento disponível ainda.</p>
          <Link href="/events">
            <Button>Ir para Eventos</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
