# Descoberta e atualização do contexto

O motor está incluído no App `workspace-hub`. Não depende de uma instalação,
marca, conta ou Page de pipeline específica. Dados ficam ao lado da configuração,
em `<config>.context.json`, fora do código distribuído. Cada arquivo confere a
installationId. Configurações gerenciadas também exigem a identidade operacional
já vinculada. A mesma conta do sistema operacional não é isolamento entre pessoas.

## Identidade e fontes

O login canônico é `ravi login`; a CLI cuida do navegador e das credenciais. O
Workspace só projeta identidade, organização e estados. `ravi whoami --json`
confirma usuário e organização atuais antes de coletar. A versão atual da CLI
não lista memberships: o assistente apresenta a organização confirmada e permite
refazer o login. Não simula um seletor de organizações inacessíveis. Trocar conta,
organização ou recorte invalida o mapa servido para esse escopo; a versão anterior
fica em um arquivo privado de recuperação, nunca é mesclada na nova organização.

- `cloud projects list`: containers de recursos pertencentes à organização.
- `pages published <container>`: catálogo autorizado, com versões deduplicadas.
  A leitura do catálogo é rotulada **metadados**; não certifica leitura do HTML.
- `artifacts list --rich` e `artifacts show`: catálogo local independente. O usuário
  escolhe quais materiais pertencem ao seu recorte. Blobs de texto/HTML/JSON de
  até 1 MB são amostrados no início, meio e fim. Imagens/PDFs e blobs indisponíveis
  ficam como metadados; não há OCR ou compreensão visual fictícia.
- `projects`, `tasks`, `agents`: contratos nativos de inventário. Cadastros
  comerciais/técnicos não são automaticamente iguais aos containers do Console.
- `sessions read --workspace`: até 30 mensagens normalizadas por conversa
  escolhida, filtradas pela janela de 1–90 dias. Nomes sugerem candidatos; conteúdo
  confirma relações. Mensagens de rotina e metadados do canal não são instruções.
- Gmail: conexão Google explícita, conta esperada e capacidades `gmail.message.list`
  e `gmail.message.read` verificadas. O login do Console não é a conta Gmail.
  O botão Conectar solicita `gmail.readonly` pelo fluxo nativo `connectors connect`;
  as permissões efetivas continuam sendo as apresentadas pelo Google/provedor.
  Sem envio, alteração de mensagens ou leitura de anexos. Consulta paginada de até
  80 mensagens por ciclo, com janela, marcadores e busca adicionais. O recorte
  parcial é explícito. O período é revalidado nas datas dos resultados.

Nenhuma conta é conectada apenas por abrir o assistente. Conexão pendente,
recusada ou indisponível não é conexão confirmada. Calendar e tl;dv continuam no
configurador de widgets e não emprestam automaticamente seus acessos ao Gmail.

Na CLI testada, algumas saídas JSON em pipe encerram em cerca de 64 KB. O
adaptador tenta uma leitura por PTY **somente** para os comandos de leitura de
artifacts/sessions afetados, após saída bem-sucedida porém incompleta. Requer
Python 3/POSIX nesses casos. Não muda ambiente Ravi, identidade ou permissões;
recusas não acionam fallback. Todo o JSON fica em memória, nunca em arquivo ou
no navegador. Tempo/tamanho/erro de contrato são limitados.

## Síntese e correções

O coletor gera um lote de até 32 trechos de 1.600 caracteres. Conteúdo pertinente
e cadastros precedem metadados; a cobertura informa o que ficou fora do lote.
IDs e fingerprints distinguem fontes já revistas de alterações. Cada síntese tem
sua data, separada de coleta e data original. Uma mudança de cadastro não é uma
análise. Uma conversa pode alimentar vários projetos; uma iniciativa pode reunir
vários grupos e versões de artefatos.

`context-analyze` pede ao agente selecionado da própria instalação que leia
[CONTEXT-REVIEW.md](../src/apps/workspace-hub/CONTEXT-REVIEW.md). É uma requisição de
automação em sessão exclusiva da instalação/organização, não chat humano nem
continuação de DM. O navegador não recebe contexto Ravi e não executa comandos
arbitrários. O pacote não cria agentes, permissões ou identidade durável.

O resultado só entra pelo `context-apply`, validando lote, baseHash, prazo,
decisão de cada evidência e referências. Metadados sozinhos não criam um projeto
entendido. Conteúdo das fontes é dado não confiável, nunca instrução. Um envio
aceito não prova resultado: a UI aguarda o patch validado. Envio ambíguo não é
repetido automaticamente. Lote expirado/ambíguo pode ser descartado explicitamente;
patch tardio é recusado. Falhas conservam o mapa válido.

A revisão humana permite renomear, ajustar cliente/objetivo, unir, separar e
excluir. Vínculos e exclusões são preservados; uma análise não recria duplicatas
nem desfaz correções. Resumo, ações e situação podem evoluir com novas evidências.
São recomendações/pendências sustentadas, sem criar Tasks ou inventar percentuais.

## Atualização

A opção de atualização automática consulta mudanças a cada 15 minutos enquanto
o serviço local estiver aberto. Um lote por vez. Após confirmar o mapa inicial,
novidades geram análise no agente escolhido. A UI consulta o resultado local e
atualiza cards/detalhes sem substituir preferências. Fechar o processo encerra
esse ciclo; não é serviço remoto nem credencial Ravi permanente.

A operação privada existente também incorpora o contexto na preparação e no
refresh. Continua com cron agent identificado por installationId, verificação de
identidade/projeto privado e última publicação válida. Nenhum segundo cron é
criado pelo assistente. Configure o recorte no arquivo daquela operação; ela é
uma cópia deliberada da configuração, não sincronização implícita entre pastas.
Pages continua estática: login, conexão, coleta e análise são locais ao Ravi.

## Operações para o Ravi

- `context-status --config <arquivo>`: estado seguro, sem corpo das evidências.
- `context-collect --config <arquivo>`: coleta e prepara lote; não faz a síntese.
- `context-packet --config <arquivo>`: leitura privada do lote para análise.
- `context-analyze --config <arquivo>`: pedido único ao agente escolhido.
- `context-apply --config <arquivo> --patch <arquivo-privado>`: valida/aplica.

Todas aceitam `--json`. Não publique configuração, lote, corpos de e-mail, estado
ou mapas privados no repositório. O manifesto declara operações, não concede acesso.
