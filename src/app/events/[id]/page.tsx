"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Event, WorkFront, Location, User, supabase } from "@/lib/supabase";
import { Calendar, Clock, MapPin, User as UserIcon, MessageSquare, ClipboardList } from "lucide-react";

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
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
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
          <Link href="/events">
            <Button className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-300">
              Voltar para Eventos
            </Button>
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
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card className="overflow-hidden border-0 shadow-xl rounded-xl bg-white">
        <div className="h-3 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
        <CardHeader className="pt-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
            {event.title}
          </CardTitle>
          <CardDescription className="space-y-2 mt-4 text-base">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-emerald-700" />
              {isSameDay ? (
                // Evento em um único dia
                <span>{startDateTime.date}</span>
              ) : (
                // Evento em múltiplos dias
                <span>{startDateTime.date} até {endDateTime.date}</span>
              )}
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-emerald-700" />
              {isSameDay ? (
                // Evento em um único dia
                <span>{startDateTime.time} - {endDateTime.time}</span>
              ) : (
                // Evento em múltiplos dias
                <span>Início: {startDateTime.time} | Término: {endDateTime.time}</span>
              )}
            </div>
            {location && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-emerald-700" />
                <span>{location.name} - {location.address}</span>
              </div>
            )}
            {responsible && (
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-emerald-700" />
                <span>Responsável: {responsible.name}</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="bg-emerald-50 p-6 rounded-xl">
            <h3 className="font-medium text-lg mb-3 text-emerald-800">Descrição</h3>
            <p className="whitespace-pre-line text-gray-700">{event.description}</p>
          </div>

          {workFronts.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg text-emerald-800 border-b border-emerald-200 pb-2">Frentes de Trabalho</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {workFronts.map((front) => (
                  <div
                    key={front.id}
                    className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-300 bg-white"
                  >
                    <h4 className="font-medium text-emerald-700">{front.name}</h4>
                    <p className="text-sm text-gray-600 mt-2">{front.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between flex-wrap gap-3 bg-emerald-50 border-t p-6">
          <Link href="/events">
            <Button
              variant="outline"
              className="border-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300"
            >
              Voltar para Eventos
            </Button>
          </Link>

          <div className="flex gap-3 flex-wrap">
            <Link href={`/feedback/participant?event=${event.id}`}>
              <Button
                variant="secondary"
                className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Adicionar Feedback
              </Button>
            </Link>

            <Link href={`/feedback/organizer?event=${event.id}`}>
              <Button
                variant="secondary"
                className="bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white transition-all duration-300"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Anotações do Organizador
              </Button>
            </Link>

            <Link href={`/events/${event.id}/report`}>
              <Button className="bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 transition-all duration-300">
                Ver Relatório
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
