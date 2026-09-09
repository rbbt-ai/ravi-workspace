# Contrato do App

O pacote usa `ravi.app/v1`, App ID `workspace-hub`, e requer Bun. O ID evita
colisão com o comando nativo `ravi workspace`. A prova foi executada com a CLI
Ravi instalada 3.260715.3 e Bun 1.3.14; outras versões ainda não foram certificadas.

## Descoberta e operação

O diretório completo `src/apps/workspace-hub` é a unidade de instalação. O
registry nativo descobre Apps em `apps/<app-id>` dentro do diretório de estado
Ravi da instalação. Não substitua um App existente sem verificar sua procedência.
A instalação manual desse diretório em estado vazio foi validada; um instalador
versionado com migração e rollback faz parte das fases seguintes.

Após instalar no próprio Ravi:

```sh
ravi apps show workspace-hub --json
ravi apps check workspace-hub --json
ravi workspace-hub status --json
```

O comando `status` executa código real: lê seu manifesto e frontend, calcula o
SHA-256 do frontend e informa versão, data de inspeção e configuração ainda vazia.
Não consulta contas ou fontes pessoais. Manifest validation verifica metadados,
sem executar o handler. Um check aprovado não garante que um handler ausente possa
ser executado; o diagnóstico operacional é uma verificação separada.

## Permissões

A operação de leitura exige `use` em `app:workspace-hub` no contrato nativo.
`permissions.required` no manifesto é uma declaração, não um grant. A permissão
`execute` no App é necessária para operações marcadas mutating. `init` e `build` são mutating: escrevem configuração ou a saída escolhida. Nenhuma dessas operações altera contas, fontes, grants ou o núcleo do Ravi. Acesso ao grupo CLI também não substitui acesso ao App.

Não altere identidades ou variáveis do Ravi para passar por uma recusa. Quando for
necessário um executor externo, use o contrato nativo de contexto emitido com
capacidades mínimas. A prova inicial verificou a decisão do provider nativo em
memória. O percurso completo com contexto emitido para um segundo usuário ainda
precisa ser validado no piloto.

## Interface separada

O diagnóstico fica em `ui/index.html`; o shell completo e seus componentes ficam em `ui/workspace/`, com build em `lib/build.mjs`, fora do manifesto declarativo. A rota do
manifesto não representa hospedagem automática desse bundle pelo Console.

Para revisar localmente o diagnóstico do pacote:

```sh
bun src/apps/workspace-hub/cli.mjs preview
```

A saída informa a porta escolhida em `127.0.0.1`; Ctrl+C encerra o processo.
Sem flags, esta interface é o diagnóstico de instalação. A Home completa usa `preview --workspace --config <arquivo> [--snapshot <arquivo>]`. Veja CONFIGURATION.md. A gestão e coleta das fontes serão integradas nas fases seguintes. Acesso remoto autenticado não é fornecido por esse servidor de prévia.

## Limites da prova

- Estados e diretórios temporários na mesma máquina não são dois usuários reais.
- Teste de viewport móvel não é teste físico de iPhone.
- Ainda não há publicação, atualização automática ou instalação no Marketplace.
- Nenhum dado operacional acompanha este pacote.

## Operações da configuração inicial

`discover --config` é somente leitura do inventário visível. `collect --config`
gera o snapshot externo; `setup --config [--port]` abre o serviço loopback com
revisão, salvar, coleta e importação. Ambos são mutating no manifesto.
Nenhuma dessas declarações concede acesso nativo, hospeda UI ou instala o App.
Arquivos de configuração e snapshot são externos, conforme ONBOARDING.md.
