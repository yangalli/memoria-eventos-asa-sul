"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase, Location, User } from "@/lib/supabase";
import { PlusCircle, X } from "lucide-react";

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location_id: "",
    responsible_id: "",
  });

  const [workFronts, setWorkFronts] = useState<{
    id?: string;
    name: string;
    description: string;
  }[]>([]);

  useEffect(() => {
    // Carregar locais disponíveis
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('name');

        if (error) throw error;
        setLocations(data || []);
      } catch (error) {
        console.error("Erro ao carregar locais:", error);
      }
    };

    // Carregar usuários disponíveis (responsáveis)
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('name');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    };

    fetchLocations();
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addWorkFront = () => {
    setWorkFronts([...workFronts, { name: "", description: "" }]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validar campos obrigatórios
      if (!formData.title || !formData.start_date || !formData.end_date ||
        !formData.location_id || !formData.responsible_id) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      // Validar que a data de término é posterior à data de início
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        throw new Error("A data de término deve ser posterior à data de início");
      }

      // Inserir evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([formData])
        .select();

      if (eventError) throw eventError;

      if (!eventData || eventData.length === 0) {
        throw new Error("Falha ao criar evento");
      }

      const eventId = eventData[0].id;

      // Inserir frentes de trabalho, se houver
      if (workFronts.length > 0) {
        const workFrontsWithEventId = workFronts.map(front => ({
          ...front,
          event_id: eventId
        }));

        const { error: workFrontError } = await supabase
          .from('work_fronts')
          .insert(workFrontsWithEventId);

        if (workFrontError) throw workFrontError;
      }

      console.log("Evento criado:", eventData);

      // Redirecionar para a página de eventos
      router.push("/events");
    } catch (error: any) {
      console.error("Erro ao criar evento:", error);
      setError(error.message || "Falha ao criar evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Evento</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Título do Evento</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Digite o título do evento"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o evento"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data e Hora de Início</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Data e Hora de Término</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_id">Local</Label>
              <select
                id="location_id"
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Selecione um local...</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.address}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible_id">Responsável pelo Evento</Label>
              <select
                id="responsible_id"
                name="responsible_id"
                value={formData.responsible_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Selecione um responsável...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Frentes de Trabalho (opcional) */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Frentes de Trabalho</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addWorkFront}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" /> Adicionar
                </Button>
              </div>

              {workFronts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Adicione frentes de trabalho para o evento (opcional)
                </p>
              ) : (
                <div className="space-y-4">
                  {workFronts.map((front, index) => (
                    <div key={index} className="p-3 border rounded-md relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => removeWorkFront(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="space-y-2">
                        <Label htmlFor={`workFront-${index}-name`}>Nome da Frente</Label>
                        <Input
                          id={`workFront-${index}-name`}
                          value={front.name}
                          onChange={(e) => updateWorkFront(index, 'name', e.target.value)}
                          placeholder="Ex: Decoração, Alimentação, etc."
                          required
                        />
                      </div>

                      <div className="space-y-2 mt-2">
                        <Label htmlFor={`workFront-${index}-description`}>Descrição da Necessidade</Label>
                        <Textarea
                          id={`workFront-${index}-description`}
                          value={front.description}
                          onChange={(e) => updateWorkFront(index, 'description', e.target.value)}
                          placeholder="Descreva o que essa frente de trabalho precisa"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Link href="/events">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Evento"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
