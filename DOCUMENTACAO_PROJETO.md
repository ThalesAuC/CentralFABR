# FABR Central - Documentação e Planejamento de Arquitetura

## 1. Visão Geral do Projeto
Uma plataforma orientada à comunidade (*Community-driven*) voltada para o Futebol Americano no Brasil (FABR). O principal objetivo é centralizar o anúncio de equipes, vagas e *tryouts* (peneiras), facilitando o recrutamento de novos jogadores e aquecendo a formação de atletas nacionais. O projeto tem forte apelo comunitário, permitindo que os próprios jogadores, fãs ou treinadores anunciem a existência de vagas pela região.

## 2. Frontend Atual (Implementado)
O projeto atual foi inteiramente estilizado do zero com design moderno (*Glassmorphism*, paletas vibrantes que remetem ao campo e dark mode), sendo estruturado puramente em Frontend Vanilla (HTML5, CSS3, JS).
- **`index.html`**: A página principal de catálogo. Otimizada para buscas, renderiza a lista de times trazendo à tona aqueles que estão com vagas abertas.
- **`cadastro.html`**: Formulário simplificado e voltado à comunidade. Engloba checagens de processo seletivo, tipo de *reporter* (organizador x fã) e campos obrigatórios visando recrutamento (Local do Treino e Link de Inscrição).
- **`styles.css`**: CSS extremamente modular que engloba toda responsividade do sistema, componentes visuais para *badges* (ex: "PENEIRA ABERTA") e efeitos interativos de foco nos botões de CTA.
- **`script.js`**: A engrenagem atual do protótipo. Contém o *Mock* (dados estáticos) para testar os visualizadores sem ter o backend pronto e a lógica do formulário, que embala perfeitamente os links, toggle das moderações de campos de e-mail e emulação visual da submissão para moderação.

## 3. Comunicação (Payload Esperado pela API)
Quando a futura API for desenhada, o fluxo do frontend aguarda receber e enviar objetos seguindo esta convenção JSON estruturada.

```json
{
  "reporterType": "comunidade | organizacao",
  "orgEmail": "contato@galofa.com | null",
  "name": "Nome do Time",
  "city": "Belo Horizonte",
  "state": "MG",
  "logoUrl": "https://(urldoescudo)",
  "trainingLocation": "Endereço do CT",
  "tryoutLink": "https://forms.gle/...",
  "isOpenTryout": true,
  "social": { 
      "instagram": "arroba_inst", 
      "youtube": "meucanaloficial" 
  }
}
```

## 4. Arquitetura do Futuro Back-End Recomendada
Baseado na necessidade do portal focar altamente em leitura (alto tráfego diário) e escritas estritas e moderadas (baixo volume, necessidade de checagens fortes).

### Metodologia de Design
**Arquitetura Limpa (Clean Architecture)** baseada na segregação de Interfaces. O código é fatiado em:
1. **Controllers**: Recebem os envios de JSON do Front e confirmam a sanidade (se vieram URLs seguras, emails válidos).
2. **Services**: Contêm a "Regra de Negócio". Onde será instruído que toda equipe nova nasce com o modelo de `status=pending` obrigatoriamente, além da formatação dos dados.
3. **Repositories**: Blindagem do Banco de dados; funções padronizadas para injetar ou retirar dados do armazenamento definitivo.

### Stack de Otimização Alta
Para garantir máxima velocidade mantendo padrão profissional, recomenda-se:
* **Node.js em TypeScript rodando Fastify**: Um servidor ultra veloz de JavaScript tipado, fácil de gerenciar, manter em paralelo ao front-end e extremamente elástico com ORMs.
* *(Alternativa Hardcore)* **Go (Golang)**: Se a prioridade for zero despesa de infraestrutura de servidor a longo prazo, sendo Go a linguagem que vai aguentar picos massivos de tráfego usando pouquíssima memória (compilado para performar próximo ao C/Rust).

### O Coração do Banco Dados: PostgreSQL + Prisma ORM
PostgreSQL é a base relacional perfeita, permitindo criar restrições seguras para relacionamentos de `City`, `State`, e `Moderation_Status`. O acoplamento de ferramentas como o **Prisma (TypeScript)** injetaria ainda mais segurança a transação dos tipos dos Objetos de submissão do formulário.

### Lógica de Moderação
No fluxo da API, existirá um painel (Painel Admin via Login JWT). Todos os relatórios do `cadastro.html` entram ocultos para o público.
O Administrador visualiza o payload recém-chegado (com prioridade para e-mails institucionais caso seja preenchido por *coaches* na aba 'organização') e clica em **Aprovar**.
Isso altera o dado `status` da Entidade Time mudando de "Pendente" para "Aprovado".

### Caching com REDIS (Blindando Servidores)
O frontend consome a rota `GET /api/teams` o tempo todo (sempre que a página reinicia ou carrega o Search). 
Ligar o Banco POSTGRES a todas essas buscas diretas encareceria a hospedagem. O uso de **Redis** é aconselhado atuar como "middleware":
O acesso #1 do dia gera a ida no Banco em busca da Tabela, o Access Controller copia os dados pro Redis, e pelas próximas horas de milhares de acessos a reposta virá diretamente da RAM através do Redis na casa dos Milissegundos, salvando custo total operacional.
