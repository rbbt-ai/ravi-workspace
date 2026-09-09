# Ravi Workspace

Seu Workspace no seu Ravi: Home com widgets, Trabalho, Agentes, Alerts e Connectors, em Day/Dark. Cada pessoa instala sua cópia e escolhe suas fontes. Não há dados, contas ou configurações de outra pessoa no pacote.

## Instalar

Requer Ravi instalado e Bun 1.3.14 ou superior. No seu computador, com acesso ao repositório privado:

```sh
git clone https://github.com/rbbt-ai/ravi-workspace.git
cd ravi-workspace
bun run install:workspace
```

Também funciona a partir do pacote `.tar.gz` da [versão privada](https://github.com/rbbt-ai/ravi-workspace/releases): extraia, entre na pasta e rode o mesmo comando.

Depois, peça ao **seu Ravi**: **“Abra meu Workspace com `ravi workspace-hub open`.”**
Abra o endereço local informado (por padrão http://127.0.0.1:4318), clique em **Configurar fontes**, selecione o que usar e consulte suas fontes. A Home começa vazia. Google Calendar, tl;dv e pipeline são opcionais; ausência de integração aparece explicitamente.

## Atualizar ou voltar

Encerre a prévia antes de trocar a versão. No clone sem alterações locais:

```sh
git pull --ff-only
bun run update:workspace
```

No pacote baixado, extraia a nova versão em outra pasta e rode `bun run update:workspace` nela. Configuração, seleção, dados e identificador da instalação são preservados. Reabra o Workspace no mesmo endereço para manter as preferências do navegador.

```sh
bun run doctor:workspace
bun run backup:workspace
bun run rollback:workspace
```

`rollback` volta o código à versão anterior, mantendo os dados atuais. [Recuperação e desinstalação](docs/INSTALLATION.md).

## Alcance desta versão

Versão **0.1.0-alpha.6**, prévia interna privada. Instalação e recuperação são do pacote, sem editar o núcleo Ravi, conceder permissões ou copiar credenciais. O diretório padrão segue o estado já configurado do Ravi, normalmente `~/.ravi`.

A Home local usa o ambiente de cada pessoa. Permissões e integrações existentes são respeitadas. O navegador remoto não executa comandos do computador: acesso remoto privado e atualização periódica são opcionais, descritos em [OPERATIONS.md](docs/OPERATIONS.md).

Instalação, atualização, rollback e HTTP foram testados localmente em diretórios separados. Uso em outros computadores, login cruzado, cron de terceiros e iPhone físico ainda não foram certificados; não são pré-condições para compartilhar esta prévia.

- [Configuração e fontes](docs/ONBOARDING.md)
- [Instalação, backup e recuperação](docs/INSTALLATION.md)
- [Contrato Ravi App](docs/APP-CONTRACT.md)
- [Build e verificação do pacote](docs/DISTRIBUTION.md)

Testes: `bun test tests` e `python3 -B -m unittest discover -s tests -p 'test_*.py'`.
