# Configuração inicial e fontes

O Workspace pode ser configurado pelo próprio shell e consultar fontes disponíveis
no Ravi que o executa. As operações trabalham com uma configuração externa por
instalação. A escolha de uma fonte não concede acesso nem altera contas.

## Começar após instalar

Peça ao **seu Ravi**: **“Abra meu Workspace com `ravi workspace-hub open`.”**
Abra o endereço local que ele informar. No primeiro acesso, aparece **Vamos preencher sua Home**.

1. **Escolher meus dados** consulta agentes, conversas, projetos e tarefas disponíveis no seu Ravi.
2. Os registros visíveis vêm pré-selecionados para revisão. Abra cada lista para selecionar ou remover itens; **Selecionar todos** e **Limpar seleção** ajudam em listas maiores. Selecionar uma conversa inclui seu agente; remover o agente também remove suas conversas da seleção.
3. **Revisar seleção** mostra as fontes e os totais que serão usados. **Voltar** permite ajustar; **Cancelar** não grava nada.
4. **Salvar e carregar Home** salva a escolha e consulta as fontes. O resultado distingue dados carregados, recorte vazio e fonte indisponível.
5. **Abrir minha Home** exibe os dados. Use o editor de widgets para organizar a página.

Google Calendar e tl;dv ficam em **Agenda e reuniões (opcional)**. Não são necessários para começar. Nome, fuso, período e aparência estão em **Preferências da Home**. Arquivos revisados e links ficam na seção avançada.

**Explorar primeiro** fecha a orientação sem salvar. O convite **Escolher meus dados** continua visível na Home, inclusive após recarregar a página. Instalações já configuradas abrem normalmente, com **Configurar fontes** no topo para editar a seleção.

### Quando os dados não aparecem

- **Consulta confirmada, nenhum registro:** confira os itens selecionados e o período em Preferências. Uma lista vazia confirmada é diferente de falta de acesso.
- **Consulta indisponível / acesso recusado:** peça ao seu Ravi: “Verifique o acesso às minhas fontes e reabra o Workspace.” Depois use **Tentar novamente**. O Workspace não amplia permissões por conta própria.
- **Seleção salva; consulta não concluída:** use **Tentar consulta novamente**. Não é preciso refazer a seleção. Os dados anteriores são preservados.
- **Google ou tl;dv não configurado:** configure a integração no seu Ravi primeiro; não cole senhas, tokens ou chaves nesta interface. Use as outras fontes enquanto isso.
- **Home vazia na alpha.6:** encerre a prévia, atualize com `bun run update:workspace` na pasta da versão nova e peça ao Ravi para abrir novamente. A configuração existente é preservada.

## Configuração explícita (avançado)

Para uma configuração externa escolhida por você:

```sh
ravi workspace-hub init --config /caminho/privado/workspace.json --json
ravi workspace-hub setup --config /caminho/privado/workspace.json --json
```

O instalador do pacote cria a configuração padrão usada por `open`. A CLI Ravi não expõe um instalador oficial de Apps; usamos o lifecycle documentado em [INSTALLATION.md](INSTALLATION.md).

O setup funciona no serviço local, com os acessos do Ravi que o executa. Uma página estática explica que a configuração deve ser aberta no Ravi local. Não é autenticação remota nem rotina automática de atualização.

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
verificar ausência do processo antes de removê-lo. Instalação, backup e rollback estão documentados em [INSTALLATION.md](INSTALLATION.md).

Runtime App: leitura `use:app:workspace-hub`, mutação `execute:app:workspace-hub`,
além da autoridade específica sobre as fontes consultadas. Manifesto não concede
grants. Não substituir variáveis Ravi, simular identidades ou ampliar permissões
para contornar uma negação. Inspecione o contrato/denial real.
