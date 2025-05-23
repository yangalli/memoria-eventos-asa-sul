# Sistema de Memória de Eventos

Uma aplicação web para registrar memórias de eventos para organizações voluntárias. Este sistema permite coletar feedback tanto de participantes quanto de organizadores, e gera relatórios abrangentes para melhorar eventos futuros.

## Funcionalidades

- Gerenciamento de eventos (criar, visualizar e acompanhar eventos)
- Coleta de feedback dos participantes (arte, comida, experiência em grupo, conversas)
- Coleta de feedback dos organizadores (despesas, voluntários, desafios, sugestões)
- Relatórios abrangentes de eventos
- Design responsivo para todos os dispositivos

## Tecnologias Utilizadas

- [Next.js 15](https://nextjs.org/) - Framework React
- [TypeScript](https://www.typescriptlang.org/) - Segurança de tipos
- [Tailwind CSS](https://tailwindcss.com/) - CSS utilitário
- [shadcn/ui](https://ui.shadcn.com/) - Biblioteca de componentes UI
- [Supabase](https://supabase.com/) - Backend e banco de dados

## Como Começar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env.local` com suas credenciais do Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
   ```
4. Execute o servidor de desenvolvimento:
```bash
npm run dev
   ```

## Configuração do Supabase

1. Crie um novo projeto Supabase
2. Configure as seguintes tabelas no banco de dados Supabase:
   - `events`
   - `participant_feedback`
   - `organizer_feedback`
3. Os esquemas das tabelas devem corresponder aos tipos TypeScript definidos em `src/lib/supabase.ts`

## Implantação

A aplicação pode ser implantada em plataformas como Vercel ou Netlify.

## Licença

MIT
