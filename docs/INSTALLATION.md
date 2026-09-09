# Instalação individual

O instalador pertence a este pacote; não é um comando oficial `ravi apps install`.
Execute com seu usuário de sistema, no computador onde seu Ravi está instalado.
Não use sudo. Cada integrante usa seu próprio ambiente e suas integrações.

## Instalar e abrir

`bun run install:workspace` copia apenas o App e licenças para
`<estado-Ravi>/apps/workspace-hub`. Cria configuração vazia e exclusiva em
`<estado-Ravi>/workspace-hub-installation/data/config.json`, com acesso privado.
O estado é o já configurado pelo Ravi; sem personalização, `~/.ravi`.
Para um diretório de estado não padrão, o instalador aceita `--state-dir <caminho>`;
isso escolhe um destino de arquivos, não muda o ambiente ou identidade runtime.
O diretório deve existir. Nenhum banco ou contexto Ravi é criado para testes.

Peça ao seu Ravi para executar `ravi workspace-hub open`. Esse comando abre um
serviço local na porta 4318, usando a configuração instalada. A URL aparece na
saída. `--port <porta>` permite outra porta, com preferências de navegador separadas
por origem. Ctrl+C encerra o serviço. No primeiro acesso, use Configurar fontes.
O serviço precisa do contexto do seu Ravi para ler suas fontes; expiração ou recusa
é mostrada como indisponibilidade. Nenhuma credencial é enviada ao browser.

`bun run doctor:workspace` confere integridade do App, versão e configuração.
`ravi apps check workspace-hub --json` valida o manifesto no registry nativo.
O instalador não concede `use:app` ou `execute:app`; o seu Ravi aplica seu contrato
normal de permissões. Uma recusa nunca deve ser contornada com identidade falsa.

## Atualização e backup

Encerre os processos locais que estiverem usando o App antes de atualizar. Se
você ativou operação recorrente opcional, pause seu próprio cron antes da troca e
retome após conferir o diagnóstico. A instalação padrão não cria cron ou site.

Use `git pull --ff-only` no clone limpo, seguido de `bun run update:workspace`,
ou rode o mesmo comando dentro de um novo pacote extraído. Um App não gerenciado
ou modificado é recusado. Não apague mudanças pessoais para passar pela verificação.
A nova cópia precisa executar o handler antes da troca. Código anterior e dados são
copiados para backups privados, fora do diretório de descoberta do App.

`bun run backup:workspace` imprime o diretório de um backup local de código/dados.
Ele pode conter seus dados privados: não versionar nem compartilhar esse diretório.
Não inclui chaves de provedores ou configurações do Ravi, pois não são propriedade
do pacote. Marca com arquivos externos requer backup desses arquivos pelo proprietário.

O contrato atual usa `workspace.config/v1`. Atualizações v1 preservam os bytes
existentes; defaults novos são aditivos na leitura. Schema desconhecido recusa a
atualização. Não há migração automática destrutiva ou conversão de identidade.
Preferências de widgets no browser permanecem por installationId e origem, fora
do backup de disco. O uso do mesmo endereço preserva essas preferências.

## Recuperar

- `bun run rollback:workspace`: restaura a versão anterior de código, com verificação
  de integridade e novo backup. Mantém configuração e dados atuais.
- `bun run restore:workspace --backup <diretório-do-backup>`: restaura explicitamente
  os dados locais de um backup íntegro desta instalação. Faz backup dos dados
  substituídos. Não troca versão do código. Operações com cron/publicação exigem
  revisão separada, pois têm estado externo que não se restaura copiando arquivos.
- `bun run recover:workspace`: reconcilia uma troca de código interrompida usando
  o journal e cópia anterior. Só remove lock de processo comprovadamente encerrado
  nesta máquina; não rouba lock ativo nem usa prazo para presumir encerramento.

Em uma interrupção de restauração de dados, a cópia anterior fica no caminho
`backups/<id>/replaced-data`; preserve-a e use o backup completo para recuperar.
Não há serviço automático de recuperação ou retenção que remova backups.

## Desinstalar

Encerre a prévia e qualquer rotina opcional que você cadastrou para este App.
`bun run uninstall:workspace` retira apenas a cópia gerenciada do App, mantendo
backups, configuração e dados para reinstalação. Não apaga outros Apps, contas,
credenciais ou Pages. Rotinas encontradas em `data/operations` ainda marcadas como
scheduled impedem a remoção até serem reconciliadas pelo proprietário. Operações
avançadas guardadas em outros diretórios são gerenciadas separadamente, conforme
OPERATIONS.md. Não é um comando para apagar a conta Ravi ou revogar integrações.

## Compartilhar com o time

Compartilhe o link do repositório/release **privados**, ou somente o arquivo de
release auditado com colegas. Não compartilhe o diretório instalado, estado,
backups, configuração ou snapshots. O acesso ao GitHub continua sendo o acesso
normal do integrante ao repositório privado; o pacote também pode ser entregue
pelo proprietário a quem não usa GitHub. Cada pessoa executa sua instalação.
