# Configuração por instalação

O pacote contém o shell Home, Trabalho, Agentes, Alerts e Connectors. O shell é gerado a partir de configuração e, opcionalmente, um snapshot de apresentação. O código não procura arquivos de outro usuário nem consulta serviços no navegador.

Requer Bun 1.3.14 ou superior. A partir da raiz do pacote:

```sh
bun src/apps/workspace-hub/cli.mjs init --config ../minha-instalacao/config.json --json
bun src/apps/workspace-hub/cli.mjs build --config ../minha-instalacao/config.json --out ../minha-instalacao/build --json
bun src/apps/workspace-hub/cli.mjs preview --workspace --config ../minha-instalacao/config.json --port 0 --json
```

`init` gera um UUID e recusa sobrescrever configuração existente. Mantenha código, configuração e dados em diretórios separados. A prévia informa sua porta e atende apenas loopback; não é hospedagem remota autenticada. `Ctrl+C` encerra o processo criado. O diagnóstico anterior continua em `status --json` e `preview` sem `--workspace`.

## Campos

O contrato `workspace.config/v1` está em `lib/config.mjs`, junto dos valores padrão. Campos desconhecidos são recusados.

| Campo | Uso |
| --- | --- |
| `installationId` | Identificador estável e único. Se mudar, muda o espaço de preferências. |
| `workspaceName`, `owner.name`, `owner.context`, `projectName` | Nome e identidade exibidos; nenhum deles autoriza acesso. |
| `brand.wordmark` | Texto da marca, até 16 caracteres. |
| `brand.logoFile` | PNG, JPEG ou WebP local; caminho relativo ao arquivo de configuração ou absoluto. |
| `brand.displayFontRegular`, `brand.displayFontBold` | Fontes WOFF2 ou OpenType locais autorizadas para essa instalação. |
| `defaultTheme` | `system`, `day` ou `dark`. Preferência do navegador prevalece. |
| `theme.day`, `theme.dark` | Sobrescritas de tokens conhecidos com cor hexadecimal de seis dígitos. |
| `locale`, `timezone` | Formatação e fuso de exibição. A agenda preserva seu dia civil informado pela fonte. |
| `historyDays` | Preferência para futura coleta; não altera nem simula uma consulta existente. |
| `widgets` | Lista ordenada `{id,size}`; `null` usa padrão, `[]` inicia Home vazia. |
| `sources` | Fontes habilitadas para projeção. Vazio não importa registros. |
| `selection` | IDs explícitos de agentes, sessões, projetos, tarefas, registros e fontes. `alertAgents` usa o identificador próprio do inventário de Alerts. |
| `allowedOrigins` | Origens HTTPS permitidas nos links externos. Não é permissão de coleta. |

Widgets disponíveis: `agenda`, `urgent`, `agents`, `activity`, `projects`, `pipeline`, `meetings`, `decisions`, `changes`. Tamanhos: `compact` e `wide`. A Home permite escolher, ordenar e redimensionar; cancelar conserva a seleção salva.

Preferências usam `ravi-workspace:<installationId>:widgets:v1` e `ravi-workspace:<installationId>:theme:v1`. A separação foi testada no mesmo domínio. Isso organiza preferências; não substitui autenticação, isolamento de armazenamento ou permissões de usuário. Esses contratos operacionais pertencem às fases seguintes.

## Snapshot externo

`build` e `preview --workspace` aceitam `--snapshot <arquivo>`. O contrato é `workspace.snapshot/v1`, com `installationId` correspondente, `capturedAt`, `sourceStates` e `presentation`. O adaptador está em `lib/snapshot.mjs`; validação do conteúdo exibido está em `lib/presentation.mjs`. Não há importação automática de payloads de provedores.

As fontes são agenda, reuniões, pipeline, Projects, Tasks, agentes, Alerts, atividade, conexões e análise de projetos. Cada fonte mantém estado e data próprios. `ready` significa que a captura foi confirmada naquela data, não que a conexão esteja funcionando agora. Sem consulta, a UI informa fonte não configurada/indisponível; zero registros só representa uma captura confirmada. Atividade de runtime perde validade visual em até 60 segundos. Coleta, reunião e síntese continuam com datas distintas.

O envelope só aceita campos de apresentação. Segredos, prompts, comandos, transcrições integrais e mensagens brutas são recusados. A análise de reuniões admite apenas tema, prévia limitada, tópicos, datas e coordenadas dos trechos. Não envie uma transcrição integral com outro nome de campo. Selecionar um registro implica incluir seu contexto já revisado; a seleção não substitui auditoria da origem e autorização de leitura.

As configurações e snapshots privados não pertencem ao repositório. O HTML gerado contém os registros selecionados: mantenha-o privado. `build` valida tudo antes de substituir `index.html`, preserva a versão anterior em caso de falha e recusa substituir saída de outra instalação. Um lock evita builds simultâneos no mesmo diretório. Se o processo for interrompido abruptamente, confira que não está rodando antes de remover o lock; ele não é removido automaticamente por idade.

## Marca e licenças

O pacote usa um símbolo genérico próprio e inclui Montserrat e Geist Mono sob SIL Open Font License, com seus avisos em `ui/workspace/fonts/`. Anime.js permanece acompanhado da licença MIT em `ui/workspace/vendor/ANIME-LICENSE.md`.

O coelho oficial e as fontes de identidade da instalação original não são distribuídos. O proprietário pode referenciar seus assets externos na configuração privada; o build os incorpora somente na saída dessa instalação. Verifique autorização para os assets antes de compartilhar essa saída. O nome comercial e a licença de distribuição do produto serão tratados na preparação da release.

## Limites desta versão

Esta fase separa o produto da configuração existente. Não instala um App no Ravi vivo, não migra a instalação anterior, não cria cron, não conecta contas e não publica no Console. Connectors preserva contexto e revisão de impacto; ações de gerenciamento continuam dependendo dos contratos locais da instalação. Onboarding é fase 4, operação independente é fase 5 e atualização/migração/recuperação completa é fase 6. Os testes com duas configurações ocorreram na mesma máquina; não são um piloto com duas pessoas.

## Integrações existentes e setup

A configuração v1 aceita o campo opcional `integrations`, com defaults desligados:
`agenda: {mode: "off", account: ""}` e `meetings: {mode: "off"}`.
Modes ativos: `google-workspace` para agenda e `tldv` para reuniões.
Credenciais nunca integram a configuração. O campo é backend e não entra no
config da Home; o setup local exibe apenas seleção e conta esperada.
Veja [ONBOARDING.md](ONBOARDING.md).
