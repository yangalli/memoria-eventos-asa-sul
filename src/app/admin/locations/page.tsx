"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, Location } from "@/lib/supabase";
import { Pencil, Trash2, MapPin, Plus } from "lucide-react";

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
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
        Gerenciamento de Locais
      </h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Formulário para adicionar/editar local */}
        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
          <CardHeader className="border-b border-emerald-100/20 bg-emerald-50/50">
            <CardTitle className="text-xl text-emerald-800 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {editingLocation ? "Editar Local" : "Adicionar Novo Local"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Nome do Local</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editingLocation ? editingLocation.name : newLocation.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Centro Comunitário"
                    className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Endereço</Label>
                  <Input
                    id="address"
                    name="address"
                    value={editingLocation ? editingLocation.address : newLocation.address}
                    onChange={handleInputChange}
                    placeholder="Ex: Rua Exemplo, 123"
                    className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                {editingLocation && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    className="border-emerald-300 hover:bg-emerald-50 text-emerald-700"
                  >
                    Cancelar Edição
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {isSubmitting ? (
                    "Salvando..."
                  ) : editingLocation ? (
                    "Atualizar Local"
                  ) : (
                    <>
                      <Plus className="mr-1 h-4 w-4" />
                      Adicionar Local
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de locais */}
        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
          <CardHeader className="border-b border-emerald-100/20 bg-emerald-50/50">
            <CardTitle className="text-xl text-emerald-800">Locais Cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-pulse space-y-4 w-full max-w-md">
                  <div className="h-8 bg-emerald-200/50 rounded-md w-1/2 mx-auto"></div>
                  <div className="h-24 bg-emerald-200/30 rounded-md"></div>
                  <div className="h-24 bg-emerald-200/30 rounded-md"></div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-emerald-50/50">
                      <th className="text-left p-4 border-b text-emerald-800 font-medium">Nome</th>
                      <th className="text-left p-4 border-b text-emerald-800 font-medium">Endereço</th>
                      <th className="text-center p-4 border-b text-emerald-800 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-gray-500">
                          Nenhum local encontrado
                        </td>
                      </tr>
                    ) : (
                      locations.map(location => (
                        <tr key={location.id} className="border-b hover:bg-emerald-50/50">
                          <td className="p-4 font-medium">{location.name}</td>
                          <td className="p-4">{location.address}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditing(location)}
                                className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLocation(location.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-100 hover:text-red-700"
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
    </div>
  );
}
