"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase, WorkFront, User, Event } from "@/lib/supabase";
import { Plus, Edit, Trash2, Briefcase, User as UserIcon, Calendar, X } from "lucide-react";

type WorkFrontWithDetails = WorkFront & {
  responsible_details?: User;
  event_details?: Event;
};

export default function WorkFrontsAdminPage() {
  const [workFronts, setWorkFronts] = useState<WorkFrontWithDetails[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingWorkFront, setEditingWorkFront] = useState<WorkFrontWithDetails | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    responsible_id: "",
    event_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar frentes de trabalho
      const { data: workFrontsData, error: workFrontsError } = await supabase
        .from('work_fronts')
        .select('*')
        .order('name');

      if (workFrontsError) throw workFrontsError;

      // Buscar usuários admin/secretary
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('role', ['admin', 'secretary'])
        .order('name');

      if (usersError) throw usersError;

      // Buscar eventos
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('title');

      if (eventsError) throw eventsError;

      // Enriquecer frentes de trabalho com detalhes
      const workFrontsWithDetails = await Promise.all(
        (workFrontsData || []).map(async (workFront) => {
          const workFrontWithDetails: WorkFrontWithDetails = { ...workFront };

          // Buscar detalhes do responsável
          if (workFront.responsible_id) {
            const responsible = usersData?.find(user => user.id === workFront.responsible_id);
            if (responsible) {
              workFrontWithDetails.responsible_details = responsible;
            }
          }

          // Buscar detalhes do evento
          if (workFront.event_id) {
            const event = eventsData?.find(event => event.id === workFront.event_id);
            if (event) {
              workFrontWithDetails.event_details = event;
            }
          }

          return workFrontWithDetails;
        })
      );

      setWorkFronts(workFrontsWithDetails);
      setUsers(usersData || []);
      setEvents(eventsData || []);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (!formData.name || !formData.event_id) {
        throw new Error("Nome e evento são obrigatórios");
      }

      if (editingWorkFront) {
        // Atualizar frente existente
        const { error } = await supabase
          .from('work_fronts')
          .update(formData)
          .eq('id', editingWorkFront.id);

        if (error) throw error;
      } else {
        // Criar nova frente
        const { error } = await supabase
          .from('work_fronts')
          .insert([formData]);

        if (error) throw error;
      }

      // Recarregar dados e resetar formulário
      await fetchData();
      resetForm();
    } catch (error: any) {
      console.error("Erro ao salvar frente:", error);
      setError(error.message);
    }
  };

  const handleEdit = (workFront: WorkFrontWithDetails) => {
    setEditingWorkFront(workFront);
    setFormData({
      name: workFront.name,
      description: workFront.description || "",
      responsible_id: workFront.responsible_id || "",
      event_id: workFront.event_id,
    });
    setShowForm(true);
  };

  const handleDelete = async (workFrontId: string) => {
    setDeletingId(workFrontId);
    try {
      const { error } = await supabase
        .from('work_fronts')
        .delete()
        .eq('id', workFrontId);

      if (error) throw error;

      setWorkFronts(workFronts => workFronts.filter(wf => wf.id !== workFrontId));
    } catch (error: any) {
      console.error("Erro ao excluir frente:", error);
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      responsible_id: "",
      event_id: "",
    });
    setEditingWorkFront(null);
    setShowForm(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
          Gerenciar Frentes de Trabalho
        </h1>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg group"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Frente
        </Button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <X className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <Card className="mb-8 border-0 shadow-lg rounded-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {editingWorkFront ? "Editar Frente de Trabalho" : "Nova Frente de Trabalho"}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Frente *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Organização do Local"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_id">Evento *</Label>
                  <Select
                    value={formData.event_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, event_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible_id">Responsável</Label>
                <Select
                  value={formData.responsible_id || "none"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, responsible_id: value === "none" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum responsável</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role}) - {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva as responsabilidades desta frente..."
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800">
                {editingWorkFront ? "Salvar Alterações" : "Criar Frente"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Lista de Frentes */}
      {workFronts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workFronts.map((workFront) => {
            const isDeleting = deletingId === workFront.id;

            return (
              <Card key={workFront.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex-1">{workFront.name}</CardTitle>
                    <div className="flex gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(workFront)}
                        className="h-8 w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                        title="Editar frente"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isDeleting}
                            className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Excluir frente"
                          >
                            {isDeleting ? (
                              <div className="h-3 w-3 animate-spin border border-red-400 border-t-transparent rounded-full" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Frente de Trabalho</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a frente "{workFront.name}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(workFront.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardDescription className="space-y-2">
                    {workFront.event_details && (
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-emerald-700" />
                        <span>{workFront.event_details.title}</span>
                      </div>
                    )}
                    {workFront.responsible_details && (
                      <div className="flex items-center text-sm">
                        <UserIcon className="w-4 h-4 mr-2 text-emerald-700" />
                        <span>{workFront.responsible_details.name}</span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                {workFront.description && (
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3">{workFront.description}</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl shadow-inner">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground mb-6 text-lg">Nenhuma frente de trabalho encontrada.</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Primeira Frente
          </Button>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/admin">
          <Button variant="ghost" className="hover:bg-emerald-50 text-emerald-800">
            Voltar para Admin
          </Button>
        </Link>
      </div>
    </div>
  );
}
