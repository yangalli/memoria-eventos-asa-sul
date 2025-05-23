import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="container mx-auto py-20 px-4 max-w-lg">
      <Card className="text-center border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
        <CardHeader className="pb-2">
          <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-800">
            Feedback Recebido!
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8">
          <p className="mb-4 text-gray-700">
            Seu feedback foi enviado com sucesso. Agradecemos sua contribuição para melhorar nossos eventos.
          </p>
          <p className="text-gray-600">
            Suas percepções nos ajudam a criar experiências melhores para todos na nossa comunidade de voluntários.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-8">
          <Link href="/">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2">
              <Home className="h-4 w-4" />
              Voltar para Início
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
