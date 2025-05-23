"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, MapPin, Shield } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
          <Shield className="inline-block h-10 w-10 mr-3 align-middle text-emerald-700" />
          Painel Administrativo
        </h1>
        <p className="text-lg text-gray-600">
          Gerencie os recursos do Memory System.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/admin/users" legacyBehavior>
          <a className="block transform transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-xl">
            <Card className="h-full shadow-xl rounded-xl overflow-hidden border-0 hover:shadow-2xl transition-shadow duration-300">
              <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
              <CardHeader className="pb-2 bg-emerald-50/30">
                <CardTitle className="text-2xl font-semibold text-emerald-800 flex items-center">
                  <Users className="h-7 w-7 mr-3 text-emerald-700" />
                  Gerenciar Usuários
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-gray-700 bg-emerald-50/30">
                <p>
                  Visualize, adicione, edite ou remova usuários do sistema.
                  Controle permissões e acesso.
                </p>
              </CardContent>
            </Card>
          </a>
        </Link>

        <Link href="/admin/locations" legacyBehavior>
          <a className="block transform transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-xl">
            <Card className="h-full shadow-xl rounded-xl overflow-hidden border-0 hover:shadow-2xl transition-shadow duration-300">
              <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
              <CardHeader className="pb-2 bg-emerald-50/30">
                <CardTitle className="text-2xl font-semibold text-emerald-800 flex items-center">
                  <MapPin className="h-7 w-7 mr-3 text-emerald-700" />
                  Gerenciar Locais
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-gray-700 bg-emerald-50/30">
                <p>
                  Cadastre e gerencie os locais onde os eventos acontecem.
                  Mantenha as informações de endereço atualizadas.
                </p>
              </CardContent>
            </Card>
          </a>
        </Link>
      </div>
    </div>
  );
}
