"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, Location, User, supabase } from "@/lib/supabase";
import { Calendar, Clock, MapPin, User as UserIcon } from "lucide-react";

type EventWithDetails = Event & {
  location_details?: Location;
  responsible_details?: User;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('start_date', { ascending: false });

        if (error) throw error;

        const eventsWithDetails = await Promise.all(
          (data || []).map(async (event) => {
            const eventWithDetails: EventWithDetails = { ...event };

            // Buscar detalhes do local
            if (event.location_id) {
              const { data: locationData } = await supabase
                .from('locations')
                .select('*')
                .eq('id', event.location_id)
                .single();

              if (locationData) {
                eventWithDetails.location_details = locationData;
              }
            }

            // Buscar detalhes do responsável
            if (event.responsible_id) {
              const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', event.responsible_id)
                .single();

              if (userData) {
                eventWithDetails.responsible_details = userData;
              }
            }

            return eventWithDetails;
          })
        );

        setEvents(eventsWithDetails);
      } catch (error: any) {
        console.error("Erro ao carregar eventos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="container mx-auto py-10 px-4 text-center">Carregando eventos...</div>;
  }

  // Formatar a data e hora
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Verificar se o evento acontece no mesmo dia
  const isSameDay = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start.toDateString() === end.toDateString();
  };

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
          {events.map((event) => {
            const startDateTime = formatDateTime(event.start_date);
            const endDateTime = formatDateTime(event.end_date);
            const sameDay = isSameDay(event.start_date, event.end_date);

            return (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center text-sm mt-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      {sameDay ? (
                        <span>{startDateTime.date}</span>
                      ) : (
                        <span>{startDateTime.date} até {endDateTime.date}</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {sameDay ? (
                        <span>{startDateTime.time} - {endDateTime.time}</span>
                      ) : (
                        <span>Início: {startDateTime.time}</span>
                      )}
                    </div>
                    {event.location_details && (
                      <div className="flex items-center text-sm mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location_details.name}
                      </div>
                    )}
                    {event.responsible_details && (
                      <div className="flex items-center text-sm mt-1">
                        <UserIcon className="w-4 h-4 mr-1" />
                        {event.responsible_details.name}
                      </div>
                    )}
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
            );
          })}
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
