"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, ParticipantFeedback, OrganizerFeedback, Location, supabase } from "@/lib/supabase";
import { Calendar, Clock, MapPin, ChevronLeft, BarChart2, MessageSquare, Clipboard } from "lucide-react";

export default function EventReportPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [participantFeedback, setParticipantFeedback] = useState<ParticipantFeedback[]>([]);
  const [organizerFeedback, setOrganizerFeedback] = useState<OrganizerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', params.id)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        // Fetch location details if location_id exists
        if (eventData.location_id) {
          const { data: locationData, error: locationError } = await supabase
            .from('locations')
            .select('*')
            .eq('id', eventData.location_id)
            .single();

          if (!locationError) {
            setLocation(locationData);
          }
        }

        // Fetch participant feedback
        const { data: participantData, error: participantError } = await supabase
          .from('participant_feedback')
          .select('*')
          .eq('event_id', params.id);

        if (participantError) throw participantError;
        setParticipantFeedback(participantData || []);

        // Fetch organizer feedback
        const { data: organizerData, error: organizerError } = await supabase
          .from('organizer_feedback')
          .select('*')
          .eq('event_id', params.id);

        if (organizerError) throw organizerError;
        setOrganizerFeedback(organizerData || []);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const calculateAverageRatings = () => {
    if (participantFeedback.length === 0) return null;

    const totals = {
      art: 0,
      food: 0,
      group: 0,
      conversations: 0,
    };

    participantFeedback.forEach((feedback) => {
      totals.art += feedback.enjoyed_art;
      totals.food += feedback.enjoyed_food;
      totals.group += feedback.enjoyed_group;
      totals.conversations += feedback.enjoyed_conversations;
    });

    const count = participantFeedback.length;
    return {
      art: (totals.art / count).toFixed(1),
      food: (totals.food / count).toFixed(1),
      group: (totals.group / count).toFixed(1),
      conversations: (totals.conversations / count).toFixed(1),
      overall: ((totals.art + totals.food + totals.group + totals.conversations) / (count * 4)).toFixed(1),
    };
  };

  // Formatar a data e hora
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const averageRatings = calculateAverageRatings();

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

  // Processar datas de início e fim
  const startDateTime = formatDateTime(event.start_date);
  const endDateTime = formatDateTime(event.end_date);

  // Verificar se o evento acontece no mesmo dia
  const isSameDay = startDateTime.date === endDateTime.date;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col gap-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
            {event.title} - Relatório
          </h1>
          <Link href="/events">
            <Button
              variant="outline"
              className="border-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 group"
            >
              <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Voltar para Eventos
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
          <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
          <CardHeader>
            <CardTitle className="text-emerald-800">Detalhes do Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-700">
              <p className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-emerald-700" />
                <strong>Data: </strong>
                <span className="ml-1">
                  {isSameDay ? (
                    <span>{startDateTime.date}</span>
                  ) : (
                    <span>{startDateTime.date} até {endDateTime.date}</span>
                  )}
                </span>
              </p>
              <p className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-emerald-700" />
                <strong>Horário: </strong>
                <span className="ml-1">
                  {isSameDay ? (
                    <span>{startDateTime.time} - {endDateTime.time}</span>
                  ) : (
                    <span>Início: {startDateTime.time} | Término: {endDateTime.time}</span>
                  )}
                </span>
              </p>
              {location ? (
                <p className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-700" />
                  <strong>Local: </strong>
                  <span className="ml-1">{location.name} - {location.address}</span>
                </p>
              ) : event.location ? (
                <p className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-700" />
                  <strong>Local: </strong>
                  <span className="ml-1">{event.location}</span>
                </p>
              ) : null}
              <div className="pt-2 mt-2 border-t border-gray-100">
                <p className="font-medium text-emerald-800 mb-2">Descrição:</p>
                <p className="text-gray-600">{event.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {averageRatings && (
          <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
            <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
            <CardHeader className="flex flex-row items-center gap-2">
              <BarChart2 className="h-5 w-5 text-emerald-700" />
              <CardTitle className="text-emerald-800">Resumo de Feedback dos Participantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-emerald-50 p-4 rounded-lg mb-4 border border-emerald-100">
                <p className="font-medium text-emerald-800 mb-2 text-center">Avaliação Geral: {averageRatings.overall}/5</p>
                <p className="text-center text-sm text-gray-500">Baseado em {participantFeedback.length} respostas</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Arte e Decorações:</p>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-medium">
                      {averageRatings.art}/5
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="font-medium">Comida e Bebidas:</p>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-medium">
                      {averageRatings.food}/5
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Experiência em Grupo:</p>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-medium">
                      {averageRatings.group}/5
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="font-medium">Conversas:</p>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-medium">
                      {averageRatings.conversations}/5
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
          <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-700" />
            <CardTitle className="text-emerald-800">Comentários dos Participantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {participantFeedback.length > 0 ? (
                participantFeedback.map((feedback) => (
                  <div key={feedback.id} className="border-b pb-5 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-emerald-800">{feedback.name}</p>
                      <div className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                        Média: {((feedback.enjoyed_art + feedback.enjoyed_food + feedback.enjoyed_group + feedback.enjoyed_conversations) / 4).toFixed(1)}/5
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">
                      Arte: {feedback.enjoyed_art}/5 • Comida: {feedback.enjoyed_food}/5 •
                      Grupo: {feedback.enjoyed_group}/5 • Conversas: {feedback.enjoyed_conversations}/5
                    </p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {feedback.comments || "Nenhum comentário fornecido."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhum feedback de participante ainda.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
          <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
          <CardHeader className="flex flex-row items-center gap-2">
            <Clipboard className="h-5 w-5 text-emerald-700" />
            <CardTitle className="text-emerald-800">Anotações dos Organizadores</CardTitle>
          </CardHeader>
          <CardContent>
            {organizerFeedback.length > 0 ? (
              <div className="space-y-6">
                {organizerFeedback.map((feedback) => (
                  <div key={feedback.id} className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <p className="font-medium text-emerald-800 text-lg mb-3">{feedback.organizer_name}</p>
                    <div className="space-y-3 text-gray-700">
                      <p>
                        <span className="font-medium">Despesas Totais:</span>{" "}
                        <span className="bg-white px-2 py-1 rounded-md border border-emerald-200">
                          R$ {feedback.total_expenses.toFixed(2)}
                        </span>
                      </p>

                      <div>
                        <p className="font-medium mb-1">Voluntários:</p>
                        <div className="flex flex-wrap gap-2">
                          {feedback.volunteers.map((volunteer, idx) => (
                            <span key={idx} className="bg-white px-2 py-1 rounded-md text-sm border border-emerald-200">
                              {volunteer}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="font-medium mb-1">Desafios:</p>
                        <p className="bg-white p-2 rounded-md border border-emerald-200">{feedback.challenges || "Nenhum relatado"}</p>
                      </div>

                      <div>
                        <p className="font-medium mb-1">Sugestões:</p>
                        <p className="bg-white p-2 rounded-md border border-emerald-200">{feedback.suggestions || "Nenhuma fornecida"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhuma anotação de organizador ainda.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
