"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, User } from "@/lib/supabase";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "" });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "Falha ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      setError("Nome e email são obrigatórios");
      return;
    }

    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Adiciona o novo usuário à lista
        setUsers(prev => [...prev, data[0] as User]);
        setNewUser({ name: "", email: "" });
        setError("");
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      setError(error.message || "Falha ao adicionar usuário");
    } finally {
      setIsAdding(false);
    }
  };

  const removeUser = async (userId: string) => {
    // Confirmar antes de excluir
    if (!confirm("Tem certeza que deseja remover este usuário?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Remove o usuário da lista
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error: any) {
      console.error("Error removing user:", error);
      setError(error.message || "Falha ao remover usuário");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Formulário para adicionar usuário */}
          <form onSubmit={addUser} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md mb-6">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={newUser.name}
                onChange={handleNewUserChange}
                placeholder="Nome do usuário"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Adicionando..." : "Adicionar Usuário"}
              </Button>
            </div>
          </form>

          {/* Lista de usuários */}
          {isLoading ? (
            <div className="text-center py-4">Carregando usuários...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-3 border-b">Nome</th>
                    <th className="text-left p-3 border-b">Email</th>
                    <th className="text-left p-3 border-b">Data de Criação</th>
                    <th className="text-center p-3 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{user.name}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString('pt-BR')
                            : "N/A"}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeUser(user.id)}
                          >
                            Remover
                          </Button>
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
