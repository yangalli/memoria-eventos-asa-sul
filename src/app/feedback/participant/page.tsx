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

// Custom rating component
const RatingInput = ({
  name,
  label,
  value,
  onChange
}: {
  name: string;
  label: string;
  value: number;
  onChange: (name: string, value: number) => void
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={`w-10 h-10 rounded-full flex items-center justify-center ${value === rating
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
              }`}
            onClick={() => onChange(name, rating)}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ParticipantFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<{ id: string, title: string }[]>([]);
  const [formData, setFormData] = useState({
    event_id: eventId || "",
    name: "",
    email: "",
    enjoyed_art: 0,
    enjoyed_food: 0,
    enjoyed_group: 0,
    enjoyed_conversations: 0,
    comments: "",
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

  const handleRatingChange = (name: string, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate ratings - all should be selected
      if (formData.enjoyed_art === 0 || formData.enjoyed_food === 0 ||
        formData.enjoyed_group === 0 || formData.enjoyed_conversations === 0) {
        throw new Error("Por favor, avalie todas as categorias");
      }

      const { data, error: insertError } = await supabase
        .from('participant_feedback')
        .insert([formData])
        .select();

      if (insertError) throw insertError;

      console.log("Feedback submitted:", data);

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
          <CardTitle>Feedback do Participante</CardTitle>
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
              <Label htmlFor="name">Seu Nome</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Como você avaliaria os seguintes aspectos? (1-5)</h3>

              <RatingInput
                name="enjoyed_art"
                label="Arte e Decorações"
                value={formData.enjoyed_art}
                onChange={handleRatingChange}
              />

              <RatingInput
                name="enjoyed_food"
                label="Comida e Bebidas"
                value={formData.enjoyed_food}
                onChange={handleRatingChange}
              />

              <RatingInput
                name="enjoyed_group"
                label="Experiência em Grupo"
                value={formData.enjoyed_group}
                onChange={handleRatingChange}
              />

              <RatingInput
                name="enjoyed_conversations"
                label="Conversas e Interações"
                value={formData.enjoyed_conversations}
                onChange={handleRatingChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comentários Adicionais</Label>
              <Textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Compartilhe seus pensamentos sobre o evento..."
                rows={4}
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
