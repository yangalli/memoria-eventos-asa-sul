"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, Location, User, supabase } from "@/lib/supabase";
import { Calendar, Clock, MapPin, User as UserIcon, ArrowRight, Plus } from "lucide-react";

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
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-red-700">Erro</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-300">
              Voltar para Início
            </Button>
          </Link>
        </div>
      </div>
    );
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
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
          Eventos
        </h1>
        <Link href="/events/new">
          <Button className="bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg group">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Novo Evento
          </Button>
        </Link>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const startDateTime = formatDateTime(event.start_date);
            const endDateTime = formatDateTime(event.end_date);
            const sameDay = isSameDay(event.start_date, event.end_date);

            return (
              <Card
                key={event.id}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-xl"
              >
                <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
                <CardHeader className="pt-6">
                  <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
                  <CardDescription className="text-sm space-y-1.5 mt-2">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-emerald-700" />
                      {sameDay ? (
                        <span>{startDateTime.date}</span>
                      ) : (
                        <span>{startDateTime.date} até {endDateTime.date}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-emerald-700" />
                      {sameDay ? (
                        <span>{startDateTime.time} - {endDateTime.time}</span>
                      ) : (
                        <span>Início: {startDateTime.time}</span>
                      )}
                    </div>
                    {event.location_details && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-emerald-700" />
                        <span className="line-clamp-1">{event.location_details.name}</span>
                      </div>
                    )}
                    {event.responsible_details && (
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2 text-emerald-700" />
                        <span className="line-clamp-1">{event.responsible_details.name}</span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-gray-600">{event.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between gap-4">
                  <Link href={`/events/${event.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 group"
                    >
                      Ver Detalhes
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Button>
                  </Link>
                  <Link href={`/events/${event.id}/report`} className="flex-1">
                    <Button
                      variant="secondary"
                      className="w-full bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white transition-all duration-300"
                    >
                      Ver Relatório
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl shadow-inner my-10">
          <p className="text-muted-foreground mb-6 text-lg">Nenhum evento encontrado. Crie seu primeiro evento!</p>
          <Link href="/events/new">
            <Button className="bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Criar Evento
            </Button>
          </Link>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/">
          <Button variant="ghost" className="hover:bg-emerald-50 text-emerald-800 transition-colors duration-300">
            Voltar para Início
          </Button>
        </Link>
      </div>
    </div>
  );
}
