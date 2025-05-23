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
import { User } from "@/lib/supabase";
import { Star, PlusCircle, X } from "lucide-react";

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
      <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${value === rating
              ? "bg-emerald-700 text-white shadow-md"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            onClick={() => onChange(name, rating)}
          >
            <Star className={`h-5 w-5 ${value === rating ? "fill-white text-white" : "fill-transparent text-emerald-600"} ${value >= rating ? "opacity-100" : "opacity-70"}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente principal envolvido em Suspense
function ParticipantFeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<{ id: string, title: string }[]>([]);
  const [currentEvent, setCurrentEvent] = useState<{ id: string, title: string } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "" });
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('name');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Se o campo for event_id, atualiza também o currentEvent
    if (name === "event_id") {
      const selectedEvent = events.find(event => event.id === value);
      setCurrentEvent(selectedEvent || null);
    }
  };

  const handleRatingChange = (name: string, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (userId === "new") {
      setShowUserForm(true);
      setSelectedUser(null);
      setFormData(prev => ({
        ...prev,
        name: "",
        email: ""
      }));
    } else if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        setSelectedUser(user);
        setFormData(prev => ({
          ...prev,
          name: user.name,
          email: user.email
        }));
      }
    } else {
      setSelectedUser(null);
      setFormData(prev => ({
        ...prev,
        name: "",
        email: ""
      }));
    }
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const addNewUser = async () => {
    if (!newUser.name || !newUser.email) {
      setError("Nome e email são obrigatórios");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Adiciona o novo usuário à lista e o seleciona
        const createdUser = data[0] as User;
        setUsers(prev => [...prev, createdUser]);
        setSelectedUser(createdUser);
        setFormData(prev => ({
          ...prev,
          name: createdUser.name,
          email: createdUser.email
        }));
        setShowUserForm(false);
        setNewUser({ name: "", email: "" });
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      setError(error.message || "Falha ao adicionar usuário");
    }
  };

  const cancelAddUser = () => {
    setShowUserForm(false);
    setNewUser({ name: "", email: "" });
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
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent text-center">
        Feedback do Participante
      </h1>

      <Card className="border-0 shadow-lg rounded-xl overflow-hidden pb-0">
        <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
        <CardHeader className="py-4 border-emerald-100/20 bg-emerald-50/50">
          <CardTitle className="text-xl text-emerald-800">Compartilhe sua Experiência</CardTitle>

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
              <Label htmlFor="user" className="text-sm font-medium">Selecione um Participante</Label>
              <select
                id="user"
                className="w-full p-2 border rounded-md border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30 focus:outline-none focus:ring focus:ring-opacity-50 mb-2"
                onChange={handleUserSelect}
                value={selectedUser?.id || ""}
              >
                <option value="">Selecione um participante ou crie um novo...</option>
                <option value="new">➕ Adicionar novo participante</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {showUserForm ? (
              <div className="space-y-3 p-4 border rounded-xl bg-emerald-50/50 border-emerald-100 shadow-sm">
                <h3 className="font-medium text-emerald-800 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Adicionar Novo Participante
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="newName" className="text-sm font-medium">Nome</Label>
                  <Input
                    id="newName"
                    name="name"
                    value={newUser.name}
                    onChange={handleNewUserChange}
                    placeholder="João Silva"
                    className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newEmail" className="text-sm font-medium">Email</Label>
                  <Input
                    id="newEmail"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleNewUserChange}
                    placeholder="joao@example.com"
                    className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                    required
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    type="button"
                    onClick={addNewUser}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    Adicionar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelAddUser}
                    className="border-emerald-300 hover:bg-emerald-50 text-emerald-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="João Silva"
                    className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                    required
                    readOnly={!!selectedUser}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                    required
                    readOnly={!!selectedUser}
                  />
                </div>
              </>
            )}

            <div className="space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <h3 className="text-lg font-medium text-emerald-800">Como você avaliaria os seguintes aspectos?</h3>

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
              <Label htmlFor="comments" className="text-sm font-medium">Comentários Adicionais</Label>
              <Textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Compartilhe seus pensamentos sobre o evento..."
                className="min-h-32 border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                rows={4}
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
export default function ParticipantFeedbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ParticipantFeedbackContent />
    </Suspense>
  );
}
