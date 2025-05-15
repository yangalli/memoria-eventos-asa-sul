"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function OrganizerFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<{ id: string, title: string }[]>([]);
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
          .order('date', { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      <Card>
        <CardHeader>
          <CardTitle>Feedback do Organizador</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="event_id">Selecione o Evento</Label>
              <select
                id="event_id"
                name="event_id"
                value={formData.event_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
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
              <Label htmlFor="organizer_name">Seu Nome</Label>
              <Input
                id="organizer_name"
                name="organizer_name"
                value={formData.organizer_name}
                onChange={handleChange}
                placeholder="João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_expenses">Despesas Totais</Label>
              <Input
                id="total_expenses"
                name="total_expenses"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_expenses}
                onChange={handleChange}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Voluntários</Label>
              {volunteers.map((volunteer, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={volunteer}
                    onChange={(e) => handleVolunteerChange(index, e.target.value)}
                    placeholder="Nome do voluntário"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeVolunteerField(index)}
                    disabled={volunteers.length === 1}
                  >
                    -
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={addVolunteerField}
              >
                Adicionar Voluntário
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">Desafios Enfrentados</Label>
              <Textarea
                id="challenges"
                name="challenges"
                value={formData.challenges}
                onChange={handleChange}
                placeholder="Descreva quaisquer desafios que você enfrentou durante o evento..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestions">Sugestões de Melhoria</Label>
              <Textarea
                id="suggestions"
                name="suggestions"
                value={formData.suggestions}
                onChange={handleChange}
                placeholder="Quaisquer sugestões para eventos futuros..."
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Link href="/">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Feedback"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
