"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, ParticipantFeedback, OrganizerFeedback, supabase } from "@/lib/supabase";

export default function EventReportPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
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

  const averageRatings = calculateAverageRatings();

  if (loading) {
    return <div className="container mx-auto py-10 px-4 text-center">Carregando relatório...</div>;
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
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{event.title} - Relatório</h1>
          <Link href="/events">
            <Button variant="outline">Voltar para Eventos</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString('pt-BR')}</p>
              <p><strong>Local:</strong> {event.location}</p>
              <p><strong>Descrição:</strong> {event.description}</p>
            </div>
          </CardContent>
        </Card>

        {averageRatings && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Feedback dos Participantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p><strong>Respostas:</strong> {participantFeedback.length}</p>
                  <p><strong>Avaliação Geral:</strong> {averageRatings.overall}/5</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Arte e Decorações:</strong> {averageRatings.art}/5</p>
                  <p><strong>Comida e Bebidas:</strong> {averageRatings.food}/5</p>
                  <p><strong>Experiência em Grupo:</strong> {averageRatings.group}/5</p>
                  <p><strong>Conversas:</strong> {averageRatings.conversations}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Comentários dos Participantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {participantFeedback.length > 0 ? (
                participantFeedback.map((feedback) => (
                  <div key={feedback.id} className="border-b pb-3 last:border-b-0">
                    <p className="font-medium">{feedback.name}</p>
                    <p className="text-muted-foreground text-sm">
                      Arte: {feedback.enjoyed_art}/5 • Comida: {feedback.enjoyed_food}/5 •
                      Grupo: {feedback.enjoyed_group}/5 • Conversas: {feedback.enjoyed_conversations}/5
                    </p>
                    <p className="mt-2">{feedback.comments || "Nenhum comentário fornecido."}</p>
                  </div>
                ))
              ) : (
                <p>Nenhum feedback de participante ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anotações dos Organizadores</CardTitle>
          </CardHeader>
          <CardContent>
            {organizerFeedback.length > 0 ? (
              <div className="space-y-4">
                {organizerFeedback.map((feedback) => (
                  <div key={feedback.id} className="space-y-2">
                    <p><strong>Organizador:</strong> {feedback.organizer_name}</p>
                    <p><strong>Despesas Totais:</strong> R$ {feedback.total_expenses.toFixed(2)}</p>
                    <p><strong>Voluntários:</strong> {feedback.volunteers.join(", ")}</p>
                    <p><strong>Desafios:</strong> {feedback.challenges || "Nenhum relatado"}</p>
                    <p><strong>Sugestões:</strong> {feedback.suggestions || "Nenhuma fornecida"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhuma anotação de organizador ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
