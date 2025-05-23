"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "./supabase";
import { useRouter, usePathname } from "next/navigation";

// Definir o tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

// Criar o contexto com um valor padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => { },
  logout: () => { },
  isAuthenticated: false,
  hasRole: () => false,
});

// Hook para usar o contexto
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Verificar se temos um usuário na sessão/localStorage quando o componente for montado
  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("Usuário carregado do localStorage:", parsedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Verificar permissões com base na rota atual
  useEffect(() => {
    if (loading) return;

    const publicRoutes = [
      "/feedback/participant",
      "/feedback/organizer",
      "/feedback/thankyou",
      "/auth/login"
    ];

    const adminRoutes = ["/admin"];
    const secretaryRoutes = ["/events", "/reports"];

    // Verificar se é uma rota pública
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

    if (isPublicRoute) {
      return; // Permitir acesso às rotas públicas
    }

    // Se não estiver autenticado e não for uma rota pública, redirecionar para login
    if (!user) {
      console.log("Usuário não autenticado, redirecionando para login");
      router.push("/auth/login");
      return;
    }

    // Verificar permissões para rotas administrativas
    const isAdminRoute = adminRoutes.some(route => pathname?.startsWith(route));
    if (isAdminRoute && user.role !== "admin") {
      console.log("Acesso negado à rota de admin:", pathname);
      router.push("/"); // Redirecionar usuários não-admin para a página inicial
      return;
    }

    // Verificar permissões para rotas de secretário
    const isSecretaryRoute = secretaryRoutes.some(route => pathname?.startsWith(route));
    if (isSecretaryRoute) {
      // Normalizar o papel para comparação de strings
      const userRole = user.role ? String(user.role).toLowerCase() : '';
      console.log("Verificando acesso à rota de secretário:", pathname, "Papel do usuário:", userRole);

      if (userRole !== "admin" && userRole !== "secretary") {
        console.log("Acesso negado à rota de secretário");
        router.push("/"); // Redirecionar usuários sem permissão para a página inicial
      }
    }
  }, [pathname, user, loading, router]);

  // Função para fazer login
  const login = (loggedUser: User) => {
    console.log("Login de usuário:", loggedUser);
    setUser(loggedUser);
    localStorage.setItem("user", JSON.stringify(loggedUser));
  };

  // Função para fazer logout
  const logout = () => {
    console.log("Logout de usuário");
    setUser(null);
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  // Função para verificar se o usuário tem um determinado papel
  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;

    // Normalizar o papel do usuário para comparação
    const userRole = user.role ? String(user.role).toLowerCase() as UserRole : 'user';

    if (Array.isArray(roles)) {
      const normalizedRoles = roles.map(r => String(r).toLowerCase() as UserRole);
      return normalizedRoles.includes(userRole);
    }

    return userRole === String(roles).toLowerCase();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
