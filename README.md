# Relato PM

Gerador responsivo de relatórios de ocorrência, com pré-visualização instantânea e texto pronto para colar no WhatsApp.

## Executar

Na pasta do projeto, utilize uma porta livre:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Recursos

- formulário guiado em três etapas;
- prévia em tempo real com marcações do WhatsApp;
- dia da semana e endereço formatados automaticamente;
- conversão de nomes completos em iniciais;
- listas de naturezas, envolvidos e materiais;
- correção ortográfica local do histórico;
- rascunho salvo automaticamente no navegador;
- cópia para a área de transferência e download em `.txt`;
- layout responsivo e tema claro/escuro.

A correção ortográfica é executada inteiramente no navegador. Nenhum dado é enviado para serviços de inteligência artificial ou outros servidores externos.
