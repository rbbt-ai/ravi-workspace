# Operação privada por instalação

Prévia 0.1.0-alpha.5. O código de operação e os testes locais estão disponíveis.
O aceite da fase 5 ainda exige dois usuários reais, cada um com seu Ravi, fontes,
conta Console e projeto privado próprios. Testes com funções injetadas não provam
isolamento no provedor. Não ative um piloto ou contas de terceiros sem autorização.

## Topologia suportada

Cada usuário executa o pacote no seu ambiente Ravi, sob um usuário de sistema
próprio, com diretório privado e suas credenciais de provedores. O pacote não chama
outro Mac, sessão ou conta central. Não é um servidor multiusuário: processos sob
o mesmo usuário de sistema compartilham autoridade de filesystem; UUIDs não são
uma barreira de segurança. A prévia/setup loopback é para máquina pessoal confiável,
não autentica outros usuários locais nem fornece acesso remoto.

O acesso remoto usa Ravi Pages **private**, autenticado pelo Console. Cada
instalação usa projeto com um único membro e hostname derivado de installationId.
A CLI expõe contagem de membros, não uma allowlist por pessoa. A conta Console
que preparou a operação é conferida a cada ciclo; outra conta ou membership
maior que um interrompe novas publicações. Uma alteração de membership também
pode dar acesso a publicações antigas: interromper o coletor não revoga esse acesso.
O proprietário precisa manter a membership adequada no Console.

Não há service principal Ravi durável neste contrato. O cron é do tipo **agent**,
em sessão isolada, e cada turno recebe autoridade nativa nova. O processo curto
herda essa autoridade; não emite contextos, modifica ambiente, guarda chaves ou
renova TTL. O resumo nativo deve corresponder ao agente e principal/compartimento
registrados. Se o cron materializar outro principal, o ciclo falha fechado; o
piloto precisa verificar essa compatibilidade antes de considerar a rotina ativa.
Não troque por shell cron, admin-bootstrap ou identidade simulada.

## Preparação local revisável

Finalize o setup e selecione suas fontes antes de preparar a operação. As operações
podem ser invocadas pelo CLI do pacote antes de instalar o App. Use caminhos reais
absolutos, sem symlinks; no macOS `/tmp` e `/var` podem ser aliases do sistema.

```sh
bun src/apps/workspace-hub/cli.mjs prepare-operation \
  --config <configuração-absoluta> --root <diretório-privado-absoluto> \
  --project <projeto-Console-próprio> --interval 15 --json
```

`<...>` representa informação da instalação, não valores prontos para executar.
O comando consulta identidade e projeto, cria `<root>/<installationId>` com 0700
e arquivos 0600. Copia a configuração e o snapshot selecionado para esse estado;
as fontes originais permanecem. Assets opcionais continuam externos. Nunca coloque
o estado dentro do repositório/pacote. Duas execuções idênticas retornam `existing`;
colisões ou mudanças exigem nova revisão e não sobrescrevem estado.

A cópia gerenciada contém:

- `operation.json`: versão, instalação, conta Console, agente/principal, UID/host,
  projeto, site exclusivo, cadência e hash da configuração; nenhuma credencial.
- `config.json` e `config.json.access.json`: configuração e vínculo de leitura
  verificado via `ravi self whoami`; não são grants.
- `config.json.snapshot.json`: última coleta válida, somente campos de apresentação.
- `generations/<hash>/`: HTML e snapshot validados; `current.json` aponta para a
  geração concluída. Não há recuperação automática de lock abandonado.
- `published.json`: último recibo confirmado. `pending.json` conserva os bytes e
  a chave de idempotência quando o resultado externo fica ambíguo.
- `last-attempt.json`: data e código mínimo de erro, sem saída nativa bruta.

Clonar uma configuração com o mesmo installationId não cria outra instalação.
Use `init` para uma instalação diferente. Configuração gerenciada fica fixada pelo
hash: editar fontes ou preferências de configuração exige revisão operacional;
este corte não implementa migração automática. Preferências dos widgets no
navegador continuam separadas por installationId e não mudam esse hash.

## Ciclo e publicação

```sh
bun src/apps/workspace-hub/cli.mjs refresh --operation <diretório-da-instalação> --json
bun src/apps/workspace-hub/cli.mjs operation-status --operation <diretório-da-instalação> --json
```

`refresh` consulta as fontes no contexto atual, projeta apenas a seleção permitida
e prepara uma geração atômica. Um segundo ciclo dentro da cadência retorna
`not_due`. Lock concorrente falha, sem roubar o lock. Falhas de todas as fontes
preservam geração e cache; falha parcial preserva dados/datas válidos e marca a
fonte indisponível/desatualizada. Metadados de Conexões sozinhos não provam coleta.

`refresh --publish` acrescenta publicação externa explícita. É destinado a uma
instalação cujo proprietário já aprovou o projeto e o uso dos dados. Confere
identidade/membership novamente, recusa site público/alheio, usa um site exclusivo
private e envia **somente index.html**, com dados de apresentação incorporados.
Não envia config, snapshot bruto, identidade, reviews ou arquivos do diretório.
Após revisão local, `refresh --publish` usa a mesma geração dentro da cadência,
sem substituí-la por outra coleta. O recibo exige confirmação da release ativa; falha não é sucesso. Uma publicação
ambígua é retomada com os mesmos bytes/chave, sem coletar outro lote primeiro.

O pacote não altera visibilidade/membership existente nem revoga contas.
HTML é snapshot; não executa CLIs do computador pelo navegador. Links internos
usam hash, inclusive Home/Trabalho/Agentes/Alerts/Connectors e detalhes.

## Agendamento idempotente

```sh
bun src/apps/workspace-hub/cli.mjs schedule --operation <diretório-da-instalação> --json
```

Sem `--apply`, verifica inventário nativo completo e devolve o plano. Com `--apply`,
cria um único cron `workspace-hub:<installationId>` pertencente ao agente aprovado,
em modo agent/isolated, e confere agente, conta, sessão de resposta e
cadência em `cron show`. Sem conta/sessão de origem confirmadas, o plano é recusado. Não cria nem troca agent/grants.
A descrição fixa identifica diretório e instalação. Conflito, duplicação ou
configuração divergente são recusados; nenhum cron alheio é alterado. A intenção
é gravada antes do add: timeout ambíguo requer reconciliação e nunca provoca outro
add sem verificar inventário. Um resultado `scheduled` confirma cadastro, não
execução/coleta; o primeiro tick e seu recibo precisam ser observados no piloto.

Permissões do App (`use:app:workspace-hub` para leitura e
`execute:app:workspace-hub` para mutação) são separadas da autoridade para self,
Projects/Tasks/agentes/sessões/settings, Console/Pages e cron. A configuração não
concede capacidades. Cada fonte verifica seu acesso pelo contrato nativo; o
Google confere a conta esperada. tl;dv não prova o titular da chave pela listagem.

## Validação antes do aceite real

Em cada ambiente autorizado: preparar, coletar, revisar Home, publicar private,
verificar recusa anônima e da outra conta, login próprio, links diretos, cron único
e dois ticks reais. No ambiente B, interromper o ambiente A não pode impedir coleta
ou acesso; comparar IDs/projetos/contas distintos e verificar ausência de dados
cruzados. Não usar a chave ou fontes de um participante no ambiente do outro.

Os testes isolados cobrem expiração/recusa, troca de principal/conta, membership,
cache, arquivos privados, symlinks, concorrência, publicação ambígua e cron
idempotente. Não executam grants, contas, cron ou publicação reais de terceiros.
Instalador, migrações, retenção de gerações, backup, recuperação de preparação/lock
interrompidos e desinstalação completa pertencem à fase 6.
