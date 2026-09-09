# Pacote distribuível

Versão: `0.1.0-alpha.7`. O repositório público e o pacote contêm código, manifesto, componentes de frontend, documentos, licenças e testes. Não incluem configuração de instalação, snapshot ou credenciais. O frontend completo é gerado após `init`, com o UUID e as fontes daquela instalação; nenhum UUID compartilhado é embutido na release.

## Pré-requisitos

- Bun 1.3.14 ou superior para o App e testes JavaScript.
- Python 3.11 ou superior e Git para empacotar. Validação desta versão em Python 3.14.6.
- A prova do contrato nativo foi feita com Ravi 3.260715.3. Compatibilidade com outras versões precisa ser verificada.

Não é necessário instalar dependências de npm/PyPI para construir este pacote.

## Checkout limpo e allowlist

`distribution/contents.json` lista **todos** os arquivos distribuídos, sem glob. Alterar o conteúdo do pacote exige revisar essa lista. O empacotador recusa arquivo extra mesmo ignorado pelo Git, link simbólico, conteúdo sensível reconhecido, arquivo operacional, versão divergente e checkout sujo. `.git/` não faz parte do arquivo distribuído.

Guarde configuração, snapshots, logs, resultados de testes e saída de build fora do checkout. Os testes Python usam `-B` para não criar cache nele.

```sh
bun test tests
python3 -B -m unittest discover -s tests -p 'test_*.py'
python3 scripts/distribution.py audit
python3 scripts/distribution.py build --out ../releases/ravi-workspace-0.1.0-alpha.3.tar.gz
```

Todos os comandos do empacotador retornam JSON. `build` informa SHA-256, commit, versão, quantidade de arquivos e tamanho. O arquivo é publicado atomicamente e não sobrescreve um pacote existente. Use destinos diferentes para verificar reprodutibilidade.

O tar inclui arquivos ordenados, modo 0644, proprietário/grupo vazios, IDs e timestamps zero. O gzip usa nome vazio e timestamp zero. O manifesto interno contém hashes, tamanhos e commit/árvore de origem, sem caminhos absolutos ou horário do build. Dois checkouts do mesmo commit devem produzir bytes idênticos com a mesma versão das ferramentas; isso é verificado antes de distribuir. Não se afirma equivalência binária entre versões diferentes de Python/zlib sem teste.

## Verificação e uso

Obtenha o SHA-256 pela release oficial e seu recibo de preparação. Não use um checksum recebido de uma origem desconhecida como prova de autoria.

```sh
python3 scripts/distribution.py verify ../releases/ravi-workspace-0.1.0-alpha.3.tar.gz --sha256 <sha256-do-recibo>
```

O verificador confere o arquivo externo, metadados, caminhos, allowlist e cada hash interno sem extrair conteúdo. A verificação é de integridade; não é uma assinatura digital. Depois de verificar, extraia em diretório novo e siga [CONFIGURATION.md](CONFIGURATION.md). A configuração inicial não concede acesso a fontes nem altera o Ravi vivo.

O diretório de App é `src/apps/workspace-hub/`. A CLI nativa descobre esse diretório em `apps/<id>` do estado Ravi, mas não foi encontrado instalador/atualizador oficial. Não substituir diretórios existentes nem criar grants automaticamente. Lifecycle e migrações serão entregues na fase correspondente.

## Distribuição do código

O repositório contém apenas o histórico auditado do produto. Snapshots e dados privados nunca devem entrar no Git, mesmo em repositório privado. Não reutilizar os workflows/deploys de outro produto. O repositório e as releases do código são públicos. As instalações e os dados de cada usuário continuam separados; publicar o código não publica o Workspace pessoal. Não há marketplace ou contas de piloto embutidas.

## Limites

O pacote inclui Home, orientação inicial, consulta de fontes, instalação individual, atualização e recuperação. Um checkout limpo e duas configurações na mesma máquina não certificam dois usuários reais. A visibilidade pública do repositório não altera a licença do produto; componentes terceiros mantêm suas licenças próprias.
