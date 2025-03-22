# Convenção de Commits

Este projeto segue a especificação [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit. Isso ajuda a criar um histórico de commits mais legível e permite versionamento automático e geração de changelog.

## Formato da Mensagem de Commit

Cada mensagem de commit consiste em um **cabeçalho**, um **corpo** e um **rodapé**. O cabeçalho tem um formato especial que inclui um **tipo**, um **escopo** opcional e um **assunto**:

```
<tipo>(<escopo>): <assunto>

<corpo>

<rodapé>
```

### Tipos

- **feat**: Uma nova funcionalidade
- **fix**: Correção de um bug
- **docs**: Alterações apenas na documentação
- **style**: Alterações que não afetam o significado do código (espaços em branco, formatação, etc)
- **refactor**: Uma alteração de código que não corrige um bug nem adiciona uma funcionalidade
- **perf**: Uma alteração de código que melhora o desempenho
- **test**: Adicionando testes ausentes ou corrigindo testes existentes
- **build**: Alterações que afetam o sistema de build ou dependências externas
- **ci**: Alterações em nossos arquivos e scripts de configuração de CI
- **chore**: Outras alterações que não modificam arquivos src ou test
- **revert**: Reverte um commit anterior

### Exemplos

```
feat(map): add marker clustering for better performance

fix(route): correct calculation of return path

docs(readme): update installation instructions

refactor(address-panel): simplify address validation logic
```

### Validação de Commit

Este projeto usa [commitlint](https://commitlint.js.org/) e [husky](https://typicode.github.io/husky/) para validar mensagens de commit. Se sua mensagem de commit não seguir o formato convencional, ela será rejeitada.

## Importante

Lembre-se que, embora este arquivo esteja em português para facilitar o entendimento, **as mensagens de commit devem ser escritas em inglês**.