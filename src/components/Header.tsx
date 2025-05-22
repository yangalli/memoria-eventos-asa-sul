import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          Sistema de Memória de Eventos
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/events">
            <Button variant="ghost">Eventos</Button>
          </Link>

          <Link href="/feedback/participant">
            <Button variant="ghost">Feedback</Button>
          </Link>

          <Link href="/reports">
            <Button variant="ghost">Relatórios</Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Admin</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/users">Gerenciar Usuários</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/locations">Gerenciar Locais</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
