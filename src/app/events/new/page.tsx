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
import { PlusCircle, X, CalendarPlus, Briefcase, UserCircle, MapPinIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      if (!formData.title || !formData.start_date || !formData.end_date ||
        !formData.location_id || !formData.responsible_id) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.");
      }
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        throw new Error("A data de término deve ser posterior à data de início.");
      }

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([formData])
        .select();

      if (eventError) throw eventError;
      if (!eventData || eventData.length === 0) {
        throw new Error("Falha ao criar evento. Verifique os dados e tente novamente.");
      }

      const eventId = eventData[0].id;

      if (workFronts.length > 0) {
        const validWorkFronts = workFronts.filter(wf => wf.name.trim() !== "");
        if (validWorkFronts.length > 0) {
          const workFrontsWithEventId = validWorkFronts.map(front => ({
            ...front,
            event_id: eventId
          }));
          const { error: workFrontError } = await supabase
            .from('work_fronts')
            .insert(workFrontsWithEventId);
          if (workFrontError) throw workFrontError;
        }
      }
      router.push("/events");
    } catch (error: any) {
      console.error("Erro ao criar evento:", error);
      setError(error.message || "Ocorreu uma falha desconhecida ao criar o evento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent flex items-center justify-center">
          <CalendarPlus className="h-10 w-10 mr-3 text-emerald-700" />
          Criar Novo Evento
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Preencha os detalhes abaixo para agendar um novo evento no sistema.
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

            <div className="space-y-2">
              <Label htmlFor="location_id" className="text-sm font-medium text-gray-700 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 text-emerald-700" /> Local
              </Label>
              <Select
                value={formData.location_id}
                onValueChange={(value) => handleChange({ target: { name: "location_id", value } } as any)}
                required
              >
                <SelectTrigger className="w-full p-2 border rounded-md border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30 focus:outline-none focus:ring focus:ring-opacity-50 bg-white">
                  <SelectValue placeholder="Selecione um local..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-emerald-200/70">
                  {locations.length === 0 && (
                    <SelectItem value="loading" disabled className="text-gray-500">
                      Carregando locais...
                    </SelectItem>
                  )}
                  {locations.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.id}
                      className="hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer"
                    >
                      {location.name} ({location.address})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible_id" className="text-sm font-medium text-gray-700 flex items-center">
                <UserCircle className="h-4 w-4 mr-2 text-emerald-700" /> Responsável pelo Evento
              </Label>
              <Select
                value={formData.responsible_id}
                onValueChange={(value) => handleChange({ target: { name: "responsible_id", value } } as any)}
                required
              >
                <SelectTrigger className="w-full p-2 border rounded-md border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30 focus:outline-none focus:ring focus:ring-opacity-50 bg-white">
                  <SelectValue placeholder="Selecione um responsável..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-emerald-200/70">
                  {users.length === 0 && (
                    <SelectItem value="loading" disabled className="text-gray-500">
                      Carregando responsáveis...
                    </SelectItem>
                  )}
                  {users.map((user) => (
                    <SelectItem
                      key={user.id}
                      value={user.id}
                      className="hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer"
                    >
                      {user.name} {user.email ? `(${user.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seção de Frentes de Trabalho Modernizada */}
            <div className="space-y-4 pt-4 border-t border-emerald-100">
              <h3 className="text-lg font-semibold text-emerald-800 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-emerald-700" />
                Frentes de Trabalho (Opcional)
              </h3>
              {workFronts.map((front, index) => (
                <div key={index} className="p-4 border rounded-lg bg-emerald-50/50 border-emerald-200/70 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <Label className="text-md font-medium text-emerald-700">Frente de Trabalho #{index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWorkFront(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 h-8 w-8"
                      aria-label="Remover Frente de Trabalho"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`wf-name-${index}`} className="text-sm font-medium text-gray-700">Nome da Frente</Label>
                    <Input
                      id={`wf-name-${index}`}
                      value={front.name}
                      onChange={(e) => updateWorkFront(index, "name", e.target.value)}
                      placeholder="Ex: Recepção, Limpeza, Decoração"
                      className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`wf-desc-${index}`} className="text-sm font-medium text-gray-700">Descrição da Frente</Label>
                    <Textarea
                      id={`wf-desc-${index}`}
                      value={front.description}
                      onChange={(e) => updateWorkFront(index, "description", e.target.value)}
                      placeholder="Detalhes das responsabilidades da frente"
                      rows={2}
                      className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30 bg-white"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addWorkFront}
                className="w-full mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-4 w-4" /> Adicionar Frente de Trabalho
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between bg-emerald-50/30 border-t border-emerald-100/20 p-6 mt-0">
            <Link href="/events">
              <Button type="button" variant="outline" className="border-emerald-300 hover:bg-emerald-50 text-emerald-700">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              {isSubmitting ? "Salvando Evento..." : "Salvar Evento"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
