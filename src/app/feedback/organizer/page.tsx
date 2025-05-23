"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { ClipboardList, Users, MinusCircle, PlusCircle, DollarSign, X } from "lucide-react";

// Componente principal envolvido em Suspense
function OrganizerFeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<{ id: string, title: string }[]>([]);
  const [currentEvent, setCurrentEvent] = useState<{ id: string, title: string } | null>(null);
  const [volunteers, setVolunteers] = useState([""]); // Start with one empty volunteer field
  const [formData, setFormData] = useState({
    event_id: eventId || "",
    organizer_name: "",
    total_expenses: 0,
    challenges: "",
    suggestions: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, title')
          .order('start_date', { ascending: false });

        if (error) throw error;
        setEvents(data || []);

        // Se temos um eventId na URL, verificar se ele existe nos dados e setar o evento atual
        if (eventId) {
          const selectedEvent = data?.find(event => event.id === eventId);
          if (selectedEvent) {
            setCurrentEvent(selectedEvent);
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Se o campo for event_id, atualiza também o currentEvent
    if (name === "event_id") {
      const selectedEvent = events.find(event => event.id === value);
      setCurrentEvent(selectedEvent || null);
    }
  };

  const handleVolunteerChange = (index: number, value: string) => {
    const newVolunteers = [...volunteers];
    newVolunteers[index] = value;
    setVolunteers(newVolunteers);
  };

  const addVolunteerField = () => {
    setVolunteers([...volunteers, ""]);
  };

  const removeVolunteerField = (index: number) => {
    if (volunteers.length > 1) {
      const newVolunteers = [...volunteers];
      newVolunteers.splice(index, 1);
      setVolunteers(newVolunteers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Filter out empty volunteer names
      const filteredVolunteers = volunteers.filter(v => v.trim() !== "");

      const data = {
        ...formData,
        volunteers: filteredVolunteers,
        total_expenses: Number(formData.total_expenses),
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('organizer_feedback')
        .insert([data])
        .select();

      if (insertError) throw insertError;

      console.log("Organizer feedback submitted:", insertedData);

      // Redirect to thank you page
      router.push("/feedback/thankyou");
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      setError(error.message || "Falha ao enviar feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent text-center">
        Feedback do Organizador
      </h1>

      <Card className="border-0 shadow-lg rounded-xl overflow-hidden pb-0">
        <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
        <CardHeader className="py-4 border-emerald-100/20 bg-emerald-50/50">
          <CardTitle className="text-xl text-emerald-800 flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Anotações do Evento
          </CardTitle>
          {currentEvent && (
            <p className="text-emerald-700 font-medium">Evento: {currentEvent.title}</p>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <X className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="event_id" className="text-sm font-medium">Selecione o Evento</Label>
              <select
                id="event_id"
                name="event_id"
                value={formData.event_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30 focus:outline-none focus:ring focus:ring-opacity-50"
                required
              >
                <option value="">Selecione um evento...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizer_name" className="text-sm font-medium">Seu Nome</Label>
              <Input
                id="organizer_name"
                name="organizer_name"
                value={formData.organizer_name}
                onChange={handleChange}
                placeholder="João Silva"
                className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_expenses" className="text-sm font-medium">Despesas Totais</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-800">
                  <DollarSign className="h-4 w-4" />
                </div>
                <Input
                  id="total_expenses"
                  name="total_expenses"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_expenses}
                  onChange={handleChange}
                  placeholder="0,00"
                  className="pl-10 border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Voluntários
              </Label>
              {volunteers.map((volunteer, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={volunteer}
                    onChange={(e) => handleVolunteerChange(index, e.target.value)}
                    placeholder="Nome do voluntário"
                    className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeVolunteerField(index)}
                    disabled={volunteers.length === 1}
                    className="h-9 w-9 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 disabled:opacity-50"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-2"
                onClick={addVolunteerField}
              >
                <PlusCircle className="h-4 w-4" /> Adicionar Voluntário
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges" className="text-sm font-medium">Desafios Enfrentados</Label>
              <Textarea
                id="challenges"
                name="challenges"
                value={formData.challenges}
                onChange={handleChange}
                placeholder="Descreva quaisquer desafios que você enfrentou durante o evento..."
                className="min-h-24 border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestions" className="text-sm font-medium">Sugestões de Melhoria</Label>
              <Textarea
                id="suggestions"
                name="suggestions"
                value={formData.suggestions}
                onChange={handleChange}
                placeholder="Quaisquer sugestões para eventos futuros..."
                className="min-h-24 border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between bg-emerald-50/50 border-t border-emerald-100/20 p-6 mt-6">
            <Link href="/">
              <Button type="button" variant="outline" className="border-emerald-300 hover:bg-emerald-50 text-emerald-700">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              {isSubmitting ? "Enviando..." : "Enviar Feedback"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Componente de fallback para o Suspense
function Loading() {
  return (
    <div className="container mx-auto py-10 px-4 text-center">
      <div className="animate-pulse space-y-4 max-w-md mx-auto">
        <div className="h-8 bg-emerald-200 rounded w-3/4 mx-auto"></div>
        <div className="h-64 bg-emerald-200/50 rounded"></div>
        <div className="h-32 bg-emerald-200/50 rounded"></div>
      </div>
    </div>
  );
}

// Componente principal que exportamos
export default function OrganizerFeedbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrganizerFeedbackContent />
    </Suspense>
  );
}
