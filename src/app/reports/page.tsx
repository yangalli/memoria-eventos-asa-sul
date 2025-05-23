"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, supabase } from "@/lib/supabase";
import { Calendar, Clock, ArrowRight } from "lucide-react";

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
          .order('start_date', { ascending: false });

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

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
          Relatórios de Eventos
        </h1>
        <Link href="/">
          <Button
            variant="outline"
            className="border-2 hover:bg-emerald-50 transition-all duration-300"
          >
            Voltar para Início
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => {
          const startDateTime = formatDateTime(event.start_date);
          const endDateTime = formatDateTime(event.end_date);
          const isSameDay = startDateTime.date === endDateTime.date;

          return (
            <Card
              key={event.id}
              className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-xl"
            >
              <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
              <CardHeader className="pt-6">
                <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
                <CardDescription className="text-sm space-y-1 mt-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-emerald-700" />
                    {isSameDay ? (
                      <span>{startDateTime.date}</span>
                    ) : (
                      <span>{startDateTime.date} até {endDateTime.date}</span>
                    )}
                  </div>
                  {isSameDay && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-emerald-700" />
                      <span>{startDateTime.time} - {endDateTime.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center">
                      <span className="text-gray-600">{event.location}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <p className="line-clamp-2 text-gray-600">{event.description}</p>
                  <Link href={`/events/${event.id}/report`}>
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 transition-all duration-300 group"
                    >
                      Ver Relatório
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-16 bg-emerald-50 rounded-xl shadow-inner my-10">
          <p className="text-muted-foreground mb-6 text-lg">Nenhum relatório de evento disponível ainda.</p>
          <Link href="/events">
            <Button className="bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 transition-all duration-300">
              Ir para Eventos
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
