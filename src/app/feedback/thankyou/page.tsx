import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ThankYouPage() {
  return (
    <div className="container mx-auto py-20 px-4 max-w-md">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Obrigado!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Seu feedback foi enviado com sucesso. Agradecemos sua contribuição para melhorar nossos eventos.
          </p>
          <p>
            Suas percepções nos ajudam a criar experiências melhores para todos na nossa comunidade de voluntários.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button>Voltar para Início</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
