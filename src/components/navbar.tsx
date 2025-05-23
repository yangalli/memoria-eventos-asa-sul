"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiFileText,
  FiCalendar,
  FiBarChart2,
  FiMapPin,
  FiSettings
} from "react-icons/fi";

export function Navbar() {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verificar se estamos em uma página de admin
  const isAdminPage = pathname?.startsWith('/admin');

  // Detectar quando a página é rolada para aplicar efeitos visuais
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${isAdminPage
      ? scrolled
        ? 'bg-emerald-900 shadow-md'
        : 'bg-emerald-900'
      : scrolled
        ? 'bg-emerald-900/95 backdrop-blur-md shadow-md'
        : 'bg-emerald-900/90 backdrop-blur-md'
      }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo e nome do sistema */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              Memory System
            </span>
          </Link>

          {/* Menu de navegação para desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Links para todos os usuários autenticados */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`flex items-center gap-1 text-white hover:bg-emerald-800 ${pathname?.startsWith('/feedback') ? 'bg-emerald-800 font-medium' : ''
                  }`}>
                  <FiFileText size={16} />
                  <span>Feedback</span>
                  <FiChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-emerald-800 border-emerald-700 text-white">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/feedback/participant"
                      className={`flex items-center gap-2 w-full text-white hover:bg-emerald-700 ${pathname?.startsWith('/feedback/participant') ? 'bg-emerald-700 font-medium' : ''
                        }`}
                    >
                      <span>Participante</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/feedback/organizer"
                      className={`flex items-center gap-2 w-full text-white hover:bg-emerald-700 ${pathname?.startsWith('/feedback/organizer') ? 'bg-emerald-700 font-medium' : ''
                        }`}
                    >
                      <span>Organizador</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Links para secretários e administradores */}
            {hasRole(['secretary', 'admin']) && (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className={`text-white hover:bg-emerald-800 ${pathname?.startsWith('/events') ? 'bg-emerald-800 font-medium' : ''}`}
                >
                  <Link href="/events" className="flex items-center gap-1">
                    <FiCalendar size={16} />
                    <span>Eventos</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className={`text-white hover:bg-emerald-800 ${pathname?.startsWith('/reports') ? 'bg-emerald-800 font-medium' : ''}`}
                >
                  <Link href="/reports" className="flex items-center gap-1">
                    <FiBarChart2 size={16} />
                    <span>Relatórios</span>
                  </Link>
                </Button>
              </>
            )}

            {/* Links apenas para administradores */}
            {hasRole('admin') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isAdminPage ? "default" : "ghost"}
                    className={`flex items-center gap-1 text-white hover:bg-emerald-800 ${isAdminPage ? 'bg-emerald-700 hover:bg-emerald-600' : ''
                      }`}
                  >
                    <FiSettings size={16} className="mr-1" />
                    <span>Admin</span>
                    <FiChevronDown size={14} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-emerald-800 border-emerald-700 text-white">
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin/users"
                        className={`flex items-center gap-2 w-full text-white hover:bg-emerald-700 ${pathname?.startsWith('/admin/users') ? 'bg-emerald-700 font-medium' : ''
                          }`}
                      >
                        <FiUser size={16} />
                        <span>Usuários</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin/locations"
                        className={`flex items-center gap-2 w-full text-white hover:bg-emerald-700 ${pathname?.startsWith('/admin/locations') ? 'bg-emerald-700 font-medium' : ''
                          }`}
                      >
                        <FiMapPin size={16} />
                        <span>Locais</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Informações do usuário e botão de logout para desktop */}
          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-sm text-white hover:bg-emerald-800"
                >
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="font-medium text-white">{user?.name}</div>
                    <div className="text-xs text-emerald-100/80 capitalize">{user?.role}</div>
                  </div>
                  <FiChevronDown size={14} className="text-emerald-100/80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-emerald-800 border-emerald-700 text-white">
                <DropdownMenuItem onClick={logout} className="text-white hover:bg-red-700 focus:bg-red-700">
                  <FiLogOut size={16} className="mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Botão de menu mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-emerald-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </Button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col">
                <div className="font-medium mb-1 text-white">Feedback</div>
                <Link
                  href="/feedback/participant"
                  className={`pl-2 py-2 text-sm ${pathname?.startsWith('/feedback/participant') ? 'text-white bg-emerald-800 rounded' : 'text-emerald-100/80'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Participante
                </Link>
                <Link
                  href="/feedback/organizer"
                  className={`pl-2 py-2 text-sm ${pathname?.startsWith('/feedback/organizer') ? 'text-white bg-emerald-800 rounded' : 'text-emerald-100/80'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Organizador
                </Link>
              </div>

              {hasRole(['secretary', 'admin']) && (
                <>
                  <Link
                    href="/events"
                    className={`py-2 flex items-center gap-2 ${pathname?.startsWith('/events') ? 'text-white bg-emerald-800 rounded pl-2' : 'text-emerald-100/80 pl-2'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiCalendar size={16} />
                    <span>Eventos</span>
                  </Link>
                  <Link
                    href="/reports"
                    className={`py-2 flex items-center gap-2 ${pathname?.startsWith('/reports') ? 'text-white bg-emerald-800 rounded pl-2' : 'text-emerald-100/80 pl-2'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiBarChart2 size={16} />
                    <span>Relatórios</span>
                  </Link>
                </>
              )}

              {hasRole('admin') && (
                <div className="flex flex-col">
                  <div className="font-medium mb-1 flex items-center gap-1 text-white">
                    <FiSettings size={14} />
                    <span>Admin</span>
                  </div>
                  <Link
                    href="/admin/users"
                    className={`pl-2 py-2 text-sm flex items-center gap-2 ${pathname?.startsWith('/admin/users') ? 'text-white bg-emerald-800 rounded' : 'text-emerald-100/80'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser size={16} />
                    <span>Usuários</span>
                  </Link>
                  <Link
                    href="/admin/locations"
                    className={`pl-2 py-2 text-sm flex items-center gap-2 ${pathname?.startsWith('/admin/locations') ? 'text-white bg-emerald-800 rounded' : 'text-emerald-100/80'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiMapPin size={16} />
                    <span>Locais</span>
                  </Link>
                </div>
              )}

              <div className="pt-2 border-t border-emerald-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-white">{user?.name}</div>
                      <div className="text-xs text-emerald-100/80 capitalize">{user?.role}</div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={logout}
                    className="h-8 bg-red-600 hover:bg-red-700"
                  >
                    <FiLogOut size={14} className="mr-1" />
                    Sair
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
