"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, supabase } from "@/lib/supabase";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (error: any) {
        console.error("Error fetching event:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  if (loading) {
    return <div className="container mx-auto py-10 px-4 text-center">Carregando detalhes do evento...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Erro</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link href="/events">
            <Button>Voltar para Eventos</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="container mx-auto py-10 px-4 text-center">Evento não encontrado</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Data</h3>
            <p>{new Date(event.date).toLocaleDateString('pt-BR')}</p>
          </div>

          <div>
            <h3 className="font-medium">Local</h3>
            <p>{event.location}</p>
          </div>

          <div>
            <h3 className="font-medium">Descrição</h3>
            <p className="whitespace-pre-line">{event.description}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between flex-wrap gap-2">
          <Link href="/events">
            <Button variant="outline">Voltar para Eventos</Button>
          </Link>

          <div className="flex gap-2">
            <Link href={`/feedback/participant?event=${event.id}`}>
              <Button variant="secondary">Adicionar Feedback de Participante</Button>
            </Link>

            <Link href={`/feedback/organizer?event=${event.id}`}>
              <Button variant="secondary">Adicionar Anotações do Organizador</Button>
            </Link>

            <Link href={`/events/${event.id}/report`}>
              <Button>Ver Relatório</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
