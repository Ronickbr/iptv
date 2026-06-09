# Gerenciamento da Landing Page

Este documento explica como usar o sistema de gerenciamento da landing page do IPTV Manager.

## Visão Geral

O sistema permite que administradores configurem dinamicamente o conteúdo da landing page através de uma interface administrativa, incluindo:

- **Logo**: URL, texto alternativo e dimensões
- **Informações de Contato**: Email, telefone, WhatsApp, endereço e horário de funcionamento
- **Seção Hero**: Título, subtítulo, descrição e textos dos botões
- **Estatísticas**: Números de clientes, uptime, canais e suporte
- **Recursos**: Título, subtítulo e lista de recursos com ícones
- **Planos**: Configuração completa dos planos de assinatura
- **Footer**: Informações da empresa, links e redes sociais

## Como Acessar

1. Faça login como administrador
2. Acesse o painel administrativo
3. Clique em "Landing Page" no menu lateral
4. Configure as seções desejadas
5. Clique em "Salvar" para aplicar as alterações

## Estrutura dos Arquivos

### Componentes Principais

- **`src/app/components/LandingPageConfig.tsx`**: Interface de configuração
- **`src/app/dashboard/admin/landing-page/page.tsx`**: Página administrativa
- **`src/app/hooks/useLandingPageSettings.ts`**: Hook para gerenciar configurações
- **`src/app/page.tsx`**: Landing page principal (atualizada para usar configurações)

### Hook de Configurações

O hook `useLandingPageSettings` fornece:

```typescript
const {
  settings,        // Configurações atuais
  loading,         // Estado de carregamento
  error,           // Erros
  saveSettings,    // Função para salvar
  updateSection,   // Atualizar seção específica
  resetToDefault   // Resetar para padrão
} = useLandingPageSettings()
```

## Configurações Disponíveis

### Logo
- **URL**: Link para a imagem do logo
- **Texto Alternativo**: Descrição para acessibilidade
- **Largura/Altura**: Dimensões em pixels

### Contato
- **Email**: Email principal de contato
- **Telefone**: Número de telefone
- **WhatsApp**: Número do WhatsApp
- **Endereço**: Localização da empresa
- **Horário**: Horário de funcionamento

### Hero Section
- **Título**: Título principal
- **Subtítulo**: Subtítulo destacado
- **Descrição**: Texto descritivo
- **CTA Primário**: Texto do botão principal
- **CTA Secundário**: Texto do botão secundário

### Estatísticas
- **Clientes**: Número de clientes ativos
- **Uptime**: Porcentagem de disponibilidade
- **Canais**: Quantidade de canais
- **Suporte**: Disponibilidade do suporte

### Recursos
- **Título**: Título da seção
- **Subtítulo**: Subtítulo da seção
- **Items**: Lista de recursos com:
  - Título
  - Descrição
  - Ícone (tv, globe, smartphone, shield, zap, users)

### Planos
Configuração completa para 4 tipos de planos:
- **Mensal**: Nome, preço e recursos
- **Trimestral**: Nome, preço, preço original, desconto e recursos
- **Semestral**: Nome, preço, preço original, desconto e recursos
- **Anual**: Nome, preço, preço original, desconto e recursos

### Footer
- **Nome da Empresa**: Nome exibido no footer
- **Descrição**: Descrição da empresa
- **Copyright**: Texto de direitos autorais
- **Redes Sociais**: Links para Facebook, Instagram, Twitter, YouTube
- **Links**: Seções de links (Produto, Suporte, Empresa)

## Persistência de Dados

As configurações são salvas em duas camadas:

1. **LocalStorage**: Para acesso rápido e funcionamento offline
2. **API**: Para sincronização entre dispositivos (quando disponível)

### Endpoints da API

- **GET** `/api/landing-page/settings` - Buscar configurações
- **PUT** `/api/admin/landing-page` - Salvar configurações (admin)

## Ícones Disponíveis

Para a seção de recursos, os seguintes ícones estão disponíveis:

- `tv` - Ícone de televisão
- `globe` - Ícone de globo
- `smartphone` - Ícone de smartphone
- `shield` - Ícone de escudo
- `zap` - Ícone de raio
- `users` - Ícone de usuários

## Exemplo de Uso

```typescript
// Atualizar configurações do logo
const { updateSection } = useLandingPageSettings()

updateSection('logo', {
  url: 'https://nova-url-logo.com/logo.png',
  alt: 'Novo Logo',
  width: 150,
  height: 50
})
```

## Validações

- URLs devem ser válidas
- Dimensões devem ser números positivos
- Emails devem ter formato válido
- Telefones devem seguir padrão brasileiro

## Backup e Restauração

As configurações podem ser:

1. **Exportadas**: Através do localStorage
2. **Importadas**: Carregando arquivo JSON
3. **Resetadas**: Voltando aos valores padrão

## Troubleshooting

### Configurações não salvam
- Verifique se está logado como administrador
- Confirme se a API está funcionando
- Verifique o console para erros

### Imagens não carregam
- Confirme se as URLs estão acessíveis
- Verifique se as dimensões estão corretas
- Teste as URLs em uma nova aba

### Alterações não aparecem
- Limpe o cache do navegador
- Verifique se as configurações foram salvas
- Recarregue a página

## Próximas Funcionalidades

- [ ] Upload de imagens direto no painel
- [ ] Preview em tempo real
- [ ] Histórico de alterações
- [ ] Templates pré-configurados
- [ ] Configuração de cores e temas
- [ ] Suporte a múltiplos idiomas