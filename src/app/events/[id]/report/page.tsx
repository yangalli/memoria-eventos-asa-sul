"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, ParticipantFeedback, OrganizerFeedback, Location, supabase } from "@/lib/supabase";
import { Calendar, Clock, MapPin, ChevronLeft, BarChart2, MessageSquare, Clipboard, Download } from "lucide-react";
// PDF/Excel libs
import * as XLSX from "xlsx";

export default function EventReportPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [participantFeedback, setParticipantFeedback] = useState<ParticipantFeedback[]>([]);
  const [organizerFeedback, setOrganizerFeedback] = useState<OrganizerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
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
          .eq('event_id', eventId);

        if (participantError) throw participantError;
        setParticipantFeedback(participantData || []);

        // Fetch organizer feedback
        const { data: organizerData, error: organizerError } = await supabase
          .from('organizer_feedback')
          .select('*')
          .eq('event_id', eventId);

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
  }, [eventId]);

  const calculateAverageRatings = () => {
    if (participantFeedback.length === 0) return null;

    // Get feedback questions from the event
    const feedbackQuestions = event?.feedback_questions || [];
    if (feedbackQuestions.length === 0) return null;

    // Calculate totals for each question
    const questionTotals: Record<string, number> = {};
    const questionCounts: Record<string, number> = {};

    // Initialize totals and counts
    feedbackQuestions.forEach((_, index) => {
      const questionKey = `question_${index}`;
      questionTotals[questionKey] = 0;
      questionCounts[questionKey] = 0;
    });

    // Sum up all responses
    participantFeedback.forEach((feedback) => {
      if (feedback.feedback_responses) {
        Object.entries(feedback.feedback_responses).forEach(([key, value]) => {
          if (key.startsWith('question_') && typeof value === 'number' && value > 0) {
            questionTotals[key] += value;
            questionCounts[key] += 1;
          }
        });
      }
    });

    // Calculate averages
    const averages: Record<string, string> = {};
    let totalSum = 0;
    let totalCount = 0;

    feedbackQuestions.forEach((_, index) => {
      const questionKey = `question_${index}`;
      const count = questionCounts[questionKey];
      if (count > 0) {
        const average = questionTotals[questionKey] / count;
        averages[questionKey] = average.toFixed(1);
        totalSum += questionTotals[questionKey];
        totalCount += count;
      } else {
        averages[questionKey] = "0.0";
      }
    });

    const overallAverage = totalCount > 0 ? (totalSum / totalCount).toFixed(1) : "0.0";

    return {
      questions: averages,
      overall: overallAverage,
      questionCount: feedbackQuestions.length
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

  // Handler para exportação PDF usando html2pdf.js
  const handleExportPDF = async () => {
    console.log("PDF button clicked");
    try {
      if (!reportRef.current) {
        console.log("reportRef is null");
        return;
      }
      const html2pdf = (await import("html2pdf.js")).default;
      html2pdf()
        .set({
          margin: 0.5,
          filename: `relatorio-evento-${event?.title || eventId}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#fff" },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
        })
        .from(reportRef.current)
        .save();
    } catch (err) {
      console.error("PDF export error:", err);
    }
  };

  const handleExportExcel = () => {
    // Get feedback questions from the event
    const feedbackQuestions = event?.feedback_questions || [];

    // Participantes
    const participantSheet = XLSX.utils.json_to_sheet(participantFeedback.map(fb => {
      const row: any = {
        Nome: fb.name,
        Email: fb.email,
        "Comentários": fb.comments
      };

      // Add dynamic feedback questions
      feedbackQuestions.forEach((question, index) => {
        const questionKey = `question_${index}`;
        const response = fb.feedback_responses?.[questionKey] || 0;
        row[`Pergunta ${index + 1}`] = response;
      });

      // Calculate average from dynamic responses
      const responses = Object.values(fb.feedback_responses || {}).filter(v => typeof v === 'number' && v > 0);
      const average = responses.length > 0 ? (responses.reduce((a, b) => a + b, 0) / responses.length).toFixed(1) : "0.0";
      row["Média"] = average;

      return row;
    }));
    // Organizadores
    const organizerSheet = XLSX.utils.json_to_sheet(organizerFeedback.map(fb => ({
      "Organizador": fb.organizer_name,
      "Despesas Totais": fb.total_expenses,
      "Voluntários": fb.volunteers.join(", "),
      "Desafios": fb.challenges,
      "Sugestões": fb.suggestions
    })));
    // Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, participantSheet, "Participantes");
    XLSX.utils.book_append_sheet(wb, organizerSheet, "Organizadores");
    XLSX.writeFile(wb, `relatorio-evento-${event?.title || eventId}.xlsx`);
  };

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
      <div className="flex flex-col gap-8 max-w-4xl mx-auto" ref={reportRef}>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
            {event.title} - Relatório
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF} className="flex items-center gap-2 border-emerald-300">
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel} className="flex items-center gap-2 border-emerald-300">
              <Download className="h-4 w-4" /> Excel
            </Button>
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

              <div className="space-y-4 mt-6">
                {event?.feedback_questions?.map((question, index) => {
                  const questionKey = `question_${index}`;
                  const average = averageRatings.questions[questionKey] || "0.0";
                  return (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-100">
                      <p className="font-medium text-gray-700">{question.question}</p>
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md font-medium">
                        {average}/5
                      </span>
                    </div>
                  );
                })}
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
                participantFeedback.map((feedback) => {
                  // Calculate average from dynamic responses
                  const responses = Object.values(feedback.feedback_responses || {}).filter(v => typeof v === 'number' && v > 0);
                  const average = responses.length > 0 ? (responses.reduce((a, b) => a + b, 0) / responses.length).toFixed(1) : "0.0";

                  return (
                    <div key={feedback.id} className="border-b pb-5 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-emerald-800">{feedback.name}</p>
                        <div className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                          Média: {average}/5
                        </div>
                      </div>
                      {event?.feedback_questions && event.feedback_questions.length > 0 && (
                        <div className="text-gray-500 text-sm mb-3 space-y-1">
                          {event.feedback_questions.map((question, index) => {
                            const questionKey = `question_${index}`;
                            const response = feedback.feedback_responses?.[questionKey] || 0;
                            return (
                              <p key={index} className="text-xs">
                                <span className="font-medium">{question.question}:</span> {response}/5
                              </p>
                            );
                          })}
                        </div>
                      )}
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {feedback.comments || "Nenhum comentário fornecido."}
                      </p>
                    </div>
                  );
                })
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
            <CardTitle className="text-emerald-800">Anotações dos Coordenadores</CardTitle>
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
