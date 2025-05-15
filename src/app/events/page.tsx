"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, supabase } from "@/lib/supabase";

export default function EventsPage() {
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
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="container mx-auto py-10 px-4 text-center">Carregando eventos...</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Eventos</h1>
        <Link href="/events/new">
          <Button>Adicionar Novo Evento</Button>
        </Link>
      </div>

      {events.length > 0 ? (
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
                <p className="line-clamp-3">{event.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/events/${event.id}`}>
                  <Button variant="outline">Ver Detalhes</Button>
                </Link>
                <Link href={`/events/${event.id}/report`}>
                  <Button variant="secondary">Ver Relatório</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Nenhum evento encontrado. Crie seu primeiro evento!</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="ghost">Voltar para Início</Button>
        </Link>
      </div>
    </div>
  );
}
