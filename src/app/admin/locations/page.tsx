"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, Location } from "@/lib/supabase";
import { Pencil, Trash2 } from "lucide-react";

export default function LocationManagementPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newLocation, setNewLocation] = useState({ name: "", address: "" });
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar locais:", error);
      setError(error.message || "Falha ao carregar locais");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingLocation) {
      setEditingLocation({ ...editingLocation, [name]: value });
    } else {
      setNewLocation({ ...newLocation, [name]: value });
    }
  };

  const resetForm = () => {
    setNewLocation({ name: "", address: "" });
    setEditingLocation(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (editingLocation) {
        // Editar local existente
        const { error } = await supabase
          .from('locations')
          .update({
            name: editingLocation.name,
            address: editingLocation.address
          })
          .eq('id', editingLocation.id);

        if (error) throw error;

        // Atualizar lista local
        setLocations(prev =>
          prev.map(location =>
            location.id === editingLocation.id ? editingLocation : location
          )
        );

        resetForm();
      } else {
        // Adicionar novo local
        if (!newLocation.name || !newLocation.address) {
          throw new Error("Nome e endereço são obrigatórios");
        }

        const { data, error } = await supabase
          .from('locations')
          .insert([newLocation])
          .select();

        if (error) throw error;

        // Adicionar à lista local
        if (data && data.length > 0) {
          setLocations(prev => [...prev, data[0] as Location]);
          resetForm();
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar local:", error);
      setError(error.message || "Falha ao salvar local");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (location: Location) => {
    setEditingLocation(location);
    setNewLocation({ name: "", address: "" });
  };

  const cancelEditing = () => {
    setEditingLocation(null);
  };

  const removeLocation = async (locationId: string) => {
    // Confirmar antes de excluir
    if (!confirm("Tem certeza que deseja remover este local? Isso pode afetar eventos existentes.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

      if (error) throw error;

      // Remover da lista local
      setLocations(prev => prev.filter(location => location.id !== locationId));
    } catch (error: any) {
      console.error("Erro ao remover local:", error);
      setError(error.message || "Falha ao remover local");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Locais</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Formulário para adicionar/editar local */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md mb-6">
            <div>
              <Label htmlFor="name">Nome do Local</Label>
              <Input
                id="name"
                name="name"
                value={editingLocation ? editingLocation.name : newLocation.name}
                onChange={handleInputChange}
                placeholder="Ex: Centro Comunitário"
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                value={editingLocation ? editingLocation.address : newLocation.address}
                onChange={handleInputChange}
                placeholder="Ex: Rua Exemplo, 123"
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : editingLocation ? "Atualizar Local" : "Adicionar Local"}
              </Button>
              {editingLocation && (
                <Button type="button" variant="outline" onClick={cancelEditing}>
                  Cancelar Edição
                </Button>
              )}
            </div>
          </form>

          {/* Lista de locais */}
          {isLoading ? (
            <div className="text-center py-4">Carregando locais...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-3 border-b">Nome</th>
                    <th className="text-left p-3 border-b">Endereço</th>
                    <th className="text-center p-3 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4">
                        Nenhum local encontrado
                      </td>
                    </tr>
                  ) : (
                    locations.map(location => (
                      <tr key={location.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{location.name}</td>
                        <td className="p-3">{location.address}</td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(location)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLocation(location.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
