# Relato PM

Gerador responsivo de relatórios operacionais, com pré-visualização instantânea e texto pronto para colar no WhatsApp.

## Executar

Na pasta do projeto, utilize uma porta livre:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Recursos

- página inicial para escolher entre relatório de ocorrência, de serviço ou de trânsito;
- formulário guiado em três etapas, adaptado ao modelo escolhido;
- seções próprias para atividades e recursos de serviço, ou envolvidos e veículos de trânsito;
- prévia em tempo real com marcações do WhatsApp;
- dia da semana e endereço formatados automaticamente;
- conversão de nomes completos em iniciais;
- listas de naturezas, envolvidos e materiais;
- correção ortográfica local do histórico;
- rascunhos separados por tipo de relatório, salvos automaticamente no navegador;
- cópia para a área de transferência e download em `.txt`;
- layout responsivo e tema claro/escuro.

A correção ortográfica é executada inteiramente no navegador. Nenhum dado é enviado para serviços de inteligência artificial ou outros servidores externos.
