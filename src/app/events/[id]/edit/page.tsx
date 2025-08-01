"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase, Location, User, Event } from "@/lib/supabase";
import { PlusCircle, X, Edit, Briefcase, UserCircle, MapPinIcon, MessageSquareText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WorkFront = {
  id?: string;
  name: string;
  description: string;
  event_id?: string;
  responsible_id?: string;
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [event, setEvent] = useState<Event | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location_id: "",
    responsible_id: "",
  });

  const [workFronts, setWorkFronts] = useState<WorkFront[]>([]);
  const [originalWorkFronts, setOriginalWorkFronts] = useState<WorkFront[]>([]);

  const [feedbackQuestions, setFeedbackQuestions] = useState<{ id?: string; question: string; event_id?: string }[]>([]);
  const [originalFeedbackQuestions, setOriginalFeedbackQuestions] = useState<{ id?: string; question: string; event_id?: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados do evento
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;
        if (!eventData) throw new Error("Evento não encontrado");

        setEvent(eventData);

        // Formatar datas para o input datetime-local
        const formatDateForInput = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toISOString().slice(0, 16);
        };

        setFormData({
          title: eventData.title || "",
          description: eventData.description || "",
          start_date: formatDateForInput(eventData.start_date),
          end_date: formatDateForInput(eventData.end_date),
          location_id: eventData.location_id || "",
          responsible_id: eventData.responsible_id || "",
        });

        // Buscar frentes de trabalho
        const { data: workFrontsData, error: workFrontsError } = await supabase
          .from('work_fronts')
          .select('*')
          .eq('event_id', eventId);

        if (workFrontsError) throw workFrontsError;

        const workFrontsFormatted = workFrontsData || [];
        setWorkFronts(workFrontsFormatted);
        setOriginalWorkFronts(workFrontsFormatted);

        // Buscar perguntas de feedback do evento
        const feedbackQuestionsFormatted = eventData.feedback_questions || [];
        setFeedbackQuestions(feedbackQuestionsFormatted);
        setOriginalFeedbackQuestions(feedbackQuestionsFormatted);

        // Buscar locais
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*')
          .order('name');
        if (locationsError) throw locationsError;
        setLocations(locationsData || []);

        // Buscar usuários
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('name');
        if (usersError) throw usersError;
        setUsers(usersData || []);

      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
        setError(error.message || "Erro ao carregar dados do evento");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addWorkFront = () => {
    setWorkFronts([...workFronts, { name: "", description: "", responsible_id: "" }]);
  };

  const removeWorkFront = (index: number) => {
    const updatedWorkFronts = [...workFronts];
    updatedWorkFronts.splice(index, 1);
    setWorkFronts(updatedWorkFronts);
  };

  const updateWorkFront = (index: number, field: string, value: string) => {
    const updatedWorkFronts = [...workFronts];
    updatedWorkFronts[index] = {
      ...updatedWorkFronts[index],
      [field]: value
    };
    setWorkFronts(updatedWorkFronts);
  };

  const addFeedbackQuestion = () => {
    setFeedbackQuestions([...feedbackQuestions, { question: "" }]);
  };

  const removeFeedbackQuestion = (index: number) => {
    const updatedQuestions = [...feedbackQuestions];
    updatedQuestions.splice(index, 1);
    setFeedbackQuestions(updatedQuestions);
  };

  const updateFeedbackQuestion = (index: number, value: string) => {
    const updatedQuestions = [...feedbackQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      question: value
    };
    setFeedbackQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!formData.title || !formData.start_date || !formData.end_date ||
        !formData.location_id || !formData.responsible_id) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.");
      }
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        throw new Error("A data de término deve ser posterior à data de início.");
      }

      // Atualizar evento
      const { error: eventError } = await supabase
        .from('events')
        .update(formData)
        .eq('id', eventId);

      if (eventError) throw eventError;

      // Gerenciar frentes de trabalho
      const currentWorkFronts = workFronts.filter(wf => wf.name.trim() !== "");

      // Identificar frentes para deletar (estavam no original mas não estão mais)
      const workFrontsToDelete = originalWorkFronts.filter(original =>
        !currentWorkFronts.find(current => current.id === original.id)
      );

      // Deletar frentes removidas
      for (const workFront of workFrontsToDelete) {
        if (workFront.id) {
          const { error: deleteError } = await supabase
            .from('work_fronts')
            .delete()
            .eq('id', workFront.id);
          if (deleteError) throw deleteError;
        }
      }

      // Atualizar ou inserir frentes
      for (const workFront of currentWorkFronts) {
        if (workFront.id) {
          // Atualizar frente existente
          const { error: updateError } = await supabase
            .from('work_fronts')
            .update({
              name: workFront.name,
              description: workFront.description,
              responsible_id: workFront.responsible_id || null
            })
            .eq('id', workFront.id);
          if (updateError) throw updateError;
        } else {
          // Inserir nova frente
          const { error: insertError } = await supabase
            .from('work_fronts')
            .insert([{
              name: workFront.name,
              description: workFront.description,
              responsible_id: workFront.responsible_id || null,
              event_id: eventId
            }]);
          if (insertError) throw insertError;
        }
      }

      // Atualizar perguntas de feedback no evento
      const validFeedbackQuestions = feedbackQuestions.filter(q => q.question.trim() !== "");
      const { error: updateFeedbackError } = await supabase
        .from('events')
        .update({ feedback_questions: validFeedbackQuestions })
        .eq('id', eventId);
      if (updateFeedbackError) throw updateFeedbackError;

      router.push("/events");
    } catch (error: any) {
      console.error("Erro ao atualizar evento:", error);
      setError(error.message || "Ocorreu uma falha desconhecida ao atualizar o evento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-red-700">Evento não encontrado</h2>
          <p className="text-red-600 mb-6">O evento solicitado não foi encontrado.</p>
          <Link href="/events">
            <Button className="bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700">
              Voltar para Eventos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent flex items-center justify-center">
          <Edit className="h-10 w-10 mr-3 text-emerald-700" />
          Editar Evento
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Atualize as informações do evento "{event.title}".
        </p>
      </header>

      <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-6 pt-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <X className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">Título do Evento</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Palestra sobre Filosofia"
                className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detalhes sobre o evento, tópicos, convidados, etc."
                rows={4}
                className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">Data e Hora de Início</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-sm font-medium text-gray-700">Data e Hora de Término</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location_id" className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  Local
                </Label>
                <Select value={formData.location_id} onValueChange={(value) => setFormData(prev => ({ ...prev, location_id: value }))}>
                  <SelectTrigger className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30">
                    <SelectValue placeholder="Selecione um local" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} - {location.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible_id" className="text-sm font-medium text-gray-700 flex items-center">
                  <UserCircle className="h-4 w-4 mr-1" />
                  Responsável
                </Label>
                <Select value={formData.responsible_id} onValueChange={(value) => setFormData(prev => ({ ...prev, responsible_id: value }))}>
                  <SelectTrigger className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30">
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700 flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                Frentes de Trabalho
              </Label>
              {workFronts.map((workFront, index) => (
                <Card key={index} className="p-4 border border-emerald-100 bg-emerald-50/30">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-emerald-800">Frente {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWorkFront(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Nome da frente de trabalho"
                        value={workFront.name}
                        onChange={(e) => updateWorkFront(index, 'name', e.target.value)}
                        className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                      />
                      <Textarea
                        placeholder="Descrição da frente de trabalho"
                        value={workFront.description}
                        onChange={(e) => updateWorkFront(index, 'description', e.target.value)}
                        rows={2}
                        className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                      />
                      <Select
                        value={workFront.responsible_id || "none"}
                        onValueChange={(value) => updateWorkFront(index, 'responsible_id', value === "none" ? "" : value)}
                      >
                        <SelectTrigger className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30">
                          <SelectValue placeholder="Selecione um responsável..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum responsável</SelectItem>
                          {users.filter(user => user.role === 'admin' || user.role === 'secretary').map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role}) - {user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addWorkFront}
                className="w-full border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Adicionar Frente de Trabalho
              </Button>
            </div>

            {/* Seção de Perguntas de Feedback */}
            <div className="space-y-4 pt-4 border-t border-emerald-100">
              <h3 className="text-lg font-semibold text-emerald-800 flex items-center">
                <MessageSquareText className="h-5 w-5 mr-2 text-emerald-700" />
                Perguntas de Feedback (Opcional)
              </h3>

              <p className="text-sm text-gray-600">
                Adicione perguntas para o formulário de feedback dos participantes. Cada pergunta será avaliada em uma escala de 1 a 5.
              </p>

              {feedbackQuestions.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  Nenhuma pergunta de feedback adicionada. Adicione perguntas abaixo.
                </div>
              )}

              {feedbackQuestions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg bg-emerald-50/50 border-emerald-200/70 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <Label className="text-md font-medium text-emerald-700">Pergunta #{index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeedbackQuestion(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 h-8 w-8"
                      aria-label="Remover Pergunta"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`question-${index}`} className="text-sm font-medium text-gray-700">Texto da Pergunta</Label>
                    <Input
                      id={`question-${index}`}
                      value={question.question}
                      onChange={(e) => updateFeedbackQuestion(index, e.target.value)}
                      placeholder="Ex: Como você avaliaria a qualidade das apresentações?"
                      className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30 bg-white"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addFeedbackQuestion}
                className="w-full mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-4 w-4" /> Adicionar Pergunta de Feedback
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between bg-emerald-50/50 border-t border-emerald-100/20 p-6">
            <Link href="/events">
              <Button type="button" variant="outline" className="border-emerald-300 hover:bg-emerald-50 text-emerald-700">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
