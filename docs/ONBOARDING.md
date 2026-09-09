# Configuração inicial e fontes

O Workspace pode ser configurado pelo próprio shell e consultar fontes disponíveis
no Ravi que o executa. As operações trabalham com uma configuração externa por
instalação. A escolha de uma fonte não concede acesso nem altera contas.

## Abrir a configuração

Depois de disponibilizar o App no seu Ravi, o contrato é:

```sh
ravi workspace-hub init --config /caminho/privado/workspace.json --json
ravi workspace-hub setup --config /caminho/privado/workspace.json --json
```

O instalador completo pertence ao lifecycle do produto. A CLI Ravi verificada não
expôs um comando oficial install/update. Para desenvolvimento a partir do checkout,
execute o mesmo handler, sem instalar nada no estado vivo:

```sh
bun src/apps/workspace-hub/cli.mjs init --config /caminho/privado/workspace.json --json
bun src/apps/workspace-hub/cli.mjs setup --config /caminho/privado/workspace.json --json
```

Use o endereço loopback impresso. O botão **Configurar fontes** no topo abre o
diálogo de configuração, preservando Home, Trabalho, Agentes, Alerts e Connectors.
O setup só está disponível no serviço local; o mesmo botão num HTML estático explica
que a configuração deve ser aberta no Ravi local. O serviço não é acesso remoto,
broker durável, autenticação humana ou rotina automática.

1. Informe nome, fuso, janela de tarefas/reuniões e aparência inicial.
2. Escolha fontes, agentes, conversas, projetos e tarefas do inventário visível.
3. Confira a revisão. **Cancelar** não grava a configuração.
4. **Salvar configuração** grava a seleção local; ainda não afirma acesso.
5. **Consultar fontes** executa leituras reais e mostra o resultado de cada fonte.
6. **Abrir Home** recarrega os dados da configuração. Personalize os widgets na Home.

O nome do agente pode vir do cadastro ou de um vínculo nativo de sessão. Um vínculo
não comprova acesso ao perfil completo; a origem é exibida junto ao registro. A
seleção de conversas usa metadados e não lê mensagens. Recência não é execução.

## Fontes implementadas

| Fonte | Contrato de leitura | Limite |
|---|---|---|
| Projetos | `ravi projects list`, JSON paginado | Cadastro visível; não refaz síntese semântica |
| Tarefas | `ravi tasks list`, cursor e janela updated_at | Prazo ausente permanece nulo |
| Agentes | `ravi agents list` e vínculos de sessões | Não implica permissão sobre todos os perfis |
| Conversas | tabela paginada `ravi sessions list` | Metadados; sem histórico, evals/crons/tasks efêmeras |
| Google Calendar | integração Google Workspace existente | Agenda primary, conta esperada e dia civil do fuso |
| tl;dv | API existente, lista e confirmação individual de transcrição | Até cinco recentes; sem transcrição persistida |
| Pipeline/análises/Alerts/atividade | importação explícita de snapshot revisado | Sem novo coletor automático; mantém datas originais |

Projetos/agentes usam JSON de leitura. A versão Ravi inspecionada truncou o JSON
de sessões mesmo com limit 1. O adaptador de sessões usa o contrato de tabela de
metadados já utilizado pelo observador existente, com cabeçalho, paginação,
contagens e duplicatas validados. Mudança desse contrato falha explicitamente;
não tenta adivinhar colunas. Tasks usam páginas de um registro para evitar o mesmo
problema com metadados volumosos. Inventário de tarefas limitado a 200 páginas;
demais inventários limitados a 2.000 registros. Alcance visível não é inventário
global garantido. Sem acesso/contrato válido, a fonte fica indisponível.

`discover --config <arquivo> --json` consulta o inventário e mostra a revisão.
`collect --config <arquivo> --json` grava os dados selecionados em
`<arquivo>.snapshot.json`. Nenhum comando arbitrário ou endpoint de execução é
aceito. Cada chamada usa o contexto Ravi recebido; não cria, renova ou persiste
uma identidade Ravi. Se o contexto expirar, as consultas falham preservando dados.

## Integrações opcionais

Google e tl;dv dependem de acessos previamente autorizados no Ravi do usuário.
Esta fase não faz consentimento OAuth, nova conta, rotação ou revogação. Não envie
credenciais pelo chat, arquivo de configuração ou frontend.

O backend consulta em memória o contrato legado existente:

- Google: `integrations.google_calendar.workspace.client_id`, `.client_secret`
  e `.refresh_token`; token temporário em memória, Calendar API v3. Informe na
  configuração a conta esperada; o backend confirma `primary.id` antes dos eventos.
- tl;dv: `integrations.tldv.apiKey`, header `x-api-key` e base
  `https://pasta.tldv.io/v1alpha1`. Não há App/broker dedicado inferido. O titular
  da chave não é verificado pela listagem, e a interface declara esse limite.

Google usa dias civis, inclusive mudanças de horário de verão, paginação completa,
deduplicação e exclusão de cancelamentos/convites recusados. tl;dv confirma IDs,
datas e transcrições não vazias; 404 é ausência, outros erros preservam o cache.
Não classifica temas pelo título. Sínteses precisam de evidência revisada importada;
sem ela, a interface informa conteúdo não revisado. Transcrições ficam somente em
memória durante a consulta e não são enviadas ao frontend.

Trocar a conta esperada de uma agenda com cache exige revisão da fonte, portanto
é recusado neste corte. Não reutilizar dados da conta anterior como se fossem da
nova. Os controles do provedor são links, nunca operações simuladas.

## Importar um snapshot revisado

Na etapa de resultado da configuração há um seletor de arquivo. **Validar e
importar** aceita `workspace.snapshot/v1` da mesma `installationId`, no contrato
de [CONFIGURATION.md](CONFIGURATION.md). O arquivo substitui o snapshot inteiro,
após validação. Não altera configuração, acesso, contas ou agendamentos.

Prepare o arquivo com seu agente/integração autorizada, usando dados reais e as
datas originais. Selecione os IDs/fontes que quer incluir antes de importar.
Inclua apenas campos de apresentação revisados; nunca conversas, transcrições
integrais, credenciais ou conteúdo de runtime. Links devem usar HTTPS e origens
explicitamente permitidas na configuração. Recusa de versão, identidade, origem,
conteúdo ou data anterior conserva o snapshot atual. O limite da importação pela
UI é 900 KB. Arquivos e dados permanecem externos ao pacote e ao GitHub.

Uma consulta posterior não renova a data do pipeline/análises/Alerts importados:
eles ficam sinalizados como versão anterior sem adaptador automático. Nenhum dado
indisponível vira exemplo fictício, nenhum prazo ou percentual é inventado.

## Concorrência e falhas

O setup escuta somente em 127.0.0.1. Host, Origin, JSON e nonce efêmero são validados
antes das operações. Não há CORS liberado, rotas de arquivos privados ou shell
acionável pelo navegador. O nonce protege a sessão local; não é uma credencial de
provedor e não é mecanismo de identidade remota. Encerre o processo local ao acabar.

Salvar exige revisão atual da configuração e inventário recente; uma janela antiga
não sobrescreve outra. Lock, validação e rename atômico protegem os arquivos. Falha
preserva os últimos registros e datas, com estado stale/unavailable. Lista vazia
confirmada remove registros antigos daquele recorte. Um lock abandonado requer
verificar ausência do processo antes de removê-lo. Lifecycle/backup/rollback
completo e operação por usuário continuam em fases posteriores.

Runtime App: leitura `use:app:workspace-hub`, mutação `execute:app:workspace-hub`,
além da autoridade específica sobre as fontes consultadas. Manifesto não concede
grants. Não substituir variáveis Ravi, simular identidades ou ampliar permissões
para contornar uma negação. Inspecione o contrato/denial real.
