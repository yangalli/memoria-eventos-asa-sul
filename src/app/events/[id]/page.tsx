"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Event, WorkFront, Location, User, supabase } from "@/lib/supabase";
import { Calendar, Clock, MapPin, User as UserIcon } from "lucide-react";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [responsible, setResponsible] = useState<User | null>(null);
  const [workFronts, setWorkFronts] = useState<WorkFront[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Buscar o evento
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', params.id)
          .single();

        if (eventError) throw eventError;

        if (!eventData) {
          throw new Error("Evento não encontrado");
        }

        setEvent(eventData);

        // Buscar as informações do local
        if (eventData.location_id) {
          const { data: locationData } = await supabase
            .from('locations')
            .select('*')
            .eq('id', eventData.location_id)
            .single();

          setLocation(locationData || null);
        }

        // Buscar as informações do responsável
        if (eventData.responsible_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', eventData.responsible_id)
            .single();

          setResponsible(userData || null);
        }

        // Buscar as frentes de trabalho
        const { data: workFrontsData } = await supabase
          .from('work_fronts')
          .select('*')
          .eq('event_id', params.id)
          .order('name');

        setWorkFronts(workFrontsData || []);

      } catch (error: any) {
        console.error("Erro ao carregar detalhes do evento:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
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

  // Formatar a data e hora
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const startDateTime = formatDateTime(event.start_date);
  const endDateTime = formatDateTime(event.end_date);

  // Verificar se o evento acontece no mesmo dia
  const isSameDay = startDateTime.date === endDateTime.date;

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center text-sm mt-2">
              <Calendar className="w-4 h-4 mr-1" />
              {isSameDay ? (
                // Evento em um único dia
                <span>{startDateTime.date}</span>
              ) : (
                // Evento em múltiplos dias
                <span>{startDateTime.date} até {endDateTime.date}</span>
              )}
            </div>
            <div className="flex items-center text-sm mt-1">
              <Clock className="w-4 h-4 mr-1" />
              {isSameDay ? (
                // Evento em um único dia
                <span>{startDateTime.time} - {endDateTime.time}</span>
              ) : (
                // Evento em múltiplos dias
                <span>Início: {startDateTime.time} | Término: {endDateTime.time}</span>
              )}
            </div>
            {location && (
              <div className="flex items-center text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {location.name} - {location.address}
              </div>
            )}
            {responsible && (
              <div className="flex items-center text-sm mt-1">
                <UserIcon className="w-4 h-4 mr-1" />
                Responsável: {responsible.name}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-2">Descrição</h3>
            <p className="whitespace-pre-line">{event.description}</p>
          </div>

          {workFronts.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-3">Frentes de Trabalho</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workFronts.map((front) => (
                  <div key={front.id} className="border rounded-md p-3">
                    <h4 className="font-medium">{front.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{front.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between flex-wrap gap-2">
          <Link href="/events">
            <Button variant="outline">Voltar para Eventos</Button>
          </Link>

          <div className="flex gap-2 flex-wrap">
            <Link href={`/feedback/participant?event=${event.id}`}>
              <Button variant="secondary">Adicionar Feedback</Button>
            </Link>

            <Link href={`/feedback/organizer?event=${event.id}`}>
              <Button variant="secondary">Anotações do Organizador</Button>
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
