"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

// Componente principal
function UsersContent() {
  const { hasRole } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Verificar se o usuário tem permissão de admin
  useEffect(() => {
    if (!hasRole("admin")) {
      router.push("/");
    }
  }, [hasRole, router]);

  // Carregar lista de usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("name");

        if (error) throw error;
        setUsers(data || []);
      } catch (error: any) {
        console.error("Erro ao carregar usuários:", error);
        setError(error.message);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (isEditing) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from("users")
          .update({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            ...(formData.password ? { password: formData.password } : {})
          })
          .eq("id", formData.id);

        if (error) throw error;
      } else {
        // Criar novo usuário
        const { error } = await supabase
          .from("users")
          .insert([
            {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role: formData.role,
            },
          ]);

        if (error) throw error;
      }

      // Recarregar a lista e resetar o formulário
      const { data } = await supabase.from("users").select("*").order("name");
      setUsers(data || []);
      resetForm();
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editUser = (user: User) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "", // Não incluir senha existente por segurança
      role: user.role as UserRole || "user",
    });
    setIsEditing(true);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;

      // Atualizar a lista após excluir
      setUsers(users.filter((user) => user.id !== id));
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      setError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
        Gerenciamento de Usuários
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulário de usuário */}
        <Card className="md:col-span-1 border-0 shadow-lg rounded-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
          <CardHeader className="border-b border-emerald-100/20 bg-emerald-50/50">
            <CardTitle className="text-xl text-emerald-800">
              {isEditing ? "Editar Usuário" : "Adicionar Usuário"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                  required
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
                  className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {isEditing ? "Senha (deixe em branco para manter)" : "Senha"}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30"
                  required={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">Nível de Acesso</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-emerald-200/70 focus:border-emerald-500 focus:ring-emerald-500/30 focus:outline-none focus:ring focus:ring-opacity-50"
                  required
                >
                  <option value="user">Usuário</option>
                  <option value="secretary">Secretário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-emerald-300 hover:bg-emerald-50 text-emerald-700"
                >
                  {isEditing ? "Cancelar" : "Limpar"}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {isSubmitting
                    ? "Salvando..."
                    : isEditing
                      ? "Atualizar"
                      : "Adicionar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de usuários */}
        <Card className="md:col-span-2 border-0 shadow-lg rounded-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
          <CardHeader className="border-b border-emerald-100/20 bg-emerald-50/50">
            <CardTitle className="text-xl text-emerald-800">Usuários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-emerald-50/50">
                  <TableRow>
                    <TableHead className="font-medium">Nome</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">Nível</TableHead>
                    <TableHead className="text-right font-medium">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-emerald-50/50">
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                              ? 'bg-emerald-100 text-emerald-800'
                              : user.role === 'secretary'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {user.role || "user"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editUser(user)}
                            className="mr-2 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
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
        <div className="h-64 bg-emerald-200/50 rounded"></div>
      </div>
    </div>
  );
}

// Componente principal que exportamos
export default function UsersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <UsersContent />
    </Suspense>
  );
}
