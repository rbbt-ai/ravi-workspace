# Ravi Workspace

Workspace em preparação para instalação no Ravi de cada usuário. O pacote já contém o shell Home, Trabalho, Agentes, Alerts e Connectors, widgets configuráveis e temas Day/Dark. Marca, identidade, fuso, seleção e dados pertencem à configuração de cada instalação.

- App ID: `workspace-hub`; versão `0.1.0-alpha.4`.
- Código: `src/apps/workspace-hub/`.
- [Configurar e gerar a Home](docs/CONFIGURATION.md).
- [Construir e verificar o pacote](docs/DISTRIBUTION.md).
- [Contrato nativo do App e permissões](docs/APP-CONTRACT.md).
- Diagnóstico do pacote: `bun run status`.
- Testes isolados: `bun test tests`.

Nenhuma conta, snapshot, conversa, reunião, credencial ou asset proprietário acompanha o pacote. Os dados utilizados nos testes unitários são fixtures locais aos testes. Uma instalação sem fontes começa vazia, com estados explícitos.

A configuração inicial completa de fontes, operação independente, atualização e piloto seguem em implementação. Esta versão ainda não representa uma instalação certificada para outro usuário. Não copie o diretório operacional de outra pessoa para o pacote.

## Configurar e consultar fontes

O setup local agora oferece seleção, revisão e consulta real de fontes.
Veja [ONBOARDING.md](docs/ONBOARDING.md) para uso, alcance e limites.
