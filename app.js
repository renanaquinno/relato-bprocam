const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const form = $('#reportForm');
let page = 1;
let reportType = null;
const REPORT_TYPES = {
  occurrence: {
    title: 'RELATÓRIO DE OCORRÊNCIA', noun: 'ocorrência', step1: 'Dados da ocorrência', step2: 'Envolvidos e materiais',
    page1: 'Dados da ocorrência', page1Help: 'Informações básicas para identificar o atendimento.', location: 'Local da ocorrência',
    page2: 'Envolvidos e materiais', nature: ['Natureza', 'Infrações ou fatos relacionados.'], person: ['Presos / apreendidos', 'Informe nome completo; o relatório exibirá apenas as iniciais.'], material: ['Materiais apreendidos', 'Descreva objetos e respectivas quantidades.'], history: 'Histórico da ocorrência',
    placeholders: ['Tráfico de Drogas Art. 33 da Lei Nº 11.343/2006', 'Nome completo', 'Idade', '01 Aparelho Celular Marca/Modelo Cor']
  },
  service: {
    title: 'RELATÓRIO DE SERVIÇO', noun: 'serviço', step1: 'Dados do serviço', step2: 'Atividades e recursos',
    page1: 'Dados do serviço', page1Help: 'Informações do turno ou da missão executada.', location: 'Local de atuação',
    page2: 'Atividades e recursos', nature: ['Atividades realizadas', 'Ações, pontos-base, patrulhamentos ou missões.'], person: ['Policiais empregados', 'Informe o nome e a função de cada policial.'], material: ['Recursos empregados', 'Viaturas, motocicletas e demais equipamentos.'], history: 'Resumo do serviço',
    placeholders: ['Patrulhamento ostensivo na área central', 'Nome ou matrícula', 'Função', '02 motocicletas ROCAM']
  },
  traffic: {
    title: 'RELATÓRIO DE TRÂNSITO', noun: 'trânsito', step1: 'Dados do atendimento', step2: 'Natureza da infração',
    page1: 'Dados do atendimento de trânsito', page1Help: 'Informações básicas da fiscalização ou do sinistro.', location: 'Local do fato ou fiscalização',
    page2: 'Natureza da ocorrência', nature: ['Natureza / enquadramento', 'Selecione uma das infrações cadastradas do CTB.'], person: ['Condutores / envolvidos', 'Informe nome completo e idade, quando disponível.'], material: ['Veículos / documentos', 'Informe placa, modelo, cor e documentos recolhidos.'], history: 'Histórico da fiscalização',
    placeholders: ['Art. 230, IV, do CTB', 'Nome completo', 'Idade', 'Honda CG 160, placa ABC1D23, cor preta']
  }
};
const SERVICE_STATS = [
  ['people', 'Pessoas'], ['motorcycles', 'Motos'], ['cars', 'Carro'],
  ['firearms', 'Arma de Fogo'], ['ammunition', 'Munições'], ['recovered', 'Veículos recuperados'],
  ['cop', 'COP'], ['tco', 'TCO', true], ['bo', 'B.O.', true], ['ait', 'A.I.T.', true],
  ['removal', 'Remoção Veículo', true], ['conducted', 'Pessoas conduzidas']
];
const TRAFFIC_INFRACTIONS = [
  'Art. 162, I, do CTB — Dirigir sem possuir CNH, PPD ou ACC — Multa: R$ 880,41',
  'Art. 162, II, do CTB — Dirigir com habilitação cassada ou suspensa — Multa: R$ 880,41',
  'Art. 162, III, do CTB — Dirigir com categoria diferente da exigida — Multa: R$ 586,94',
  'Art. 162, V, do CTB — Dirigir com habilitação vencida há mais de 30 dias — Multa: R$ 293,47',
  'Art. 163 c/c Art. 162 do CTB — Entregar a direção a pessoa não habilitada ou irregular — Multa: conforme a irregularidade do art. 162',
  'Art. 164 c/c Art. 162 do CTB — Permitir posse do veículo a pessoa não habilitada ou irregular — Multa: conforme a irregularidade do art. 162',
  'Art. 165 do CTB — Dirigir sob influência de álcool ou outra substância psicoativa — Multa: R$ 2.934,70',
  'Art. 165-A do CTB — Recusar teste, exame clínico, perícia ou outro procedimento — Multa: R$ 2.934,70',
  'Art. 167 do CTB — Deixar de usar cinto de segurança — Multa: R$ 195,23',
  'Art. 168 do CTB — Transportar criança sem observar as normas de segurança — Multa: R$ 293,47',
  'Art. 169 do CTB — Dirigir sem atenção ou sem os cuidados indispensáveis — Multa: R$ 88,38',
  'Art. 170 do CTB — Dirigir ameaçando pedestres ou demais veículos — Multa: R$ 293,47',
  'Art. 175 do CTB — Realizar manobra perigosa, arrancada brusca ou derrapagem — Multa: R$ 2.934,70',
  'Art. 181 do CTB — Estacionar em desacordo com a regulamentação — Multa: conforme o inciso e a situação',
  'Art. 182 do CTB — Parar em desacordo com a regulamentação — Multa: conforme o inciso e a situação',
  'Art. 195 do CTB — Desobedecer às ordens da autoridade ou do agente de trânsito — Multa: R$ 195,23',
  'Art. 208 do CTB — Avançar sinal vermelho ou sinal de parada obrigatória — Multa: R$ 293,47',
  'Art. 218 do CTB — Transitar em velocidade superior à máxima permitida — Multa: R$ 130,16, R$ 195,23 ou R$ 880,41, conforme o percentual excedido',
  'Art. 230, IV, do CTB — Conduzir veículo sem placa de identificação — Multa: R$ 293,47',
  'Art. 230, V, do CTB — Conduzir veículo não registrado e devidamente licenciado — Multa: R$ 293,47',
  'Art. 230, IX, do CTB — Conduzir veículo sem equipamento obrigatório ou com ele ineficiente — Multa: R$ 195,23',
  'Art. 230, XVIII, do CTB — Conduzir veículo em mau estado de conservação — Multa: R$ 195,23',
  'Art. 232 do CTB — Conduzir veículo sem os documentos de porte obrigatório — Multa: R$ 88,38',
  'Art. 244, I, do CTB — Conduzir motocicleta sem capacete de segurança — Multa: R$ 293,47',
  'Art. 244, II, do CTB — Transportar passageiro sem capacete ou fora do assento adequado — Multa: R$ 293,47',
  'Art. 244, V, do CTB — Transportar criança menor de 10 anos em motocicleta — Multa: R$ 293,47',
  'Art. 250, I, do CTB — Deixar de manter acesa a luz baixa nas situações obrigatórias — Multa: R$ 130,16',
  'Art. 252, IV, do CTB — Dirigir usando calçado que não se firme nos pés — Multa: R$ 130,16',
  'Art. 252, V, do CTB — Dirigir com apenas uma das mãos fora das situações permitidas — Multa: R$ 130,16',
  'Art. 252, VI, do CTB — Dirigir utilizando fones nos ouvidos — Multa: R$ 130,16',
  'Art. 252, parágrafo único, do CTB — Dirigir segurando ou manuseando telefone celular — Multa: R$ 293,47'
];
$('#trafficInfractions').innerHTML = TRAFFIC_INFRACTIONS.map(item => `<option value="${item}"></option>`).join('');
const CIA_CITIES = {
  '1ª CIA (Teresina)': 'Teresina',
  '2ª CIA (Parnaíba)': 'Parnaíba',
  '3ª CIA (Picos)': 'Picos',
  '4ª CIA (Floriano)': 'Floriano'
};
['ROCAM', 'PLDROCAM'].forEach(group => {
  for (let number = 1; number <= 15; number++) {
    const prefix = `${group}${String(number).padStart(2, '0')}`;
    form.elements.teamPrefix.add(new Option(prefix, prefix));
  }
});

const formatDate = value => {
  if (!value) return '00/00/0000 (Dia da semana)';
  const date = new Date(`${value}T12:00:00`);
  const day = date.toLocaleDateString('pt-BR');
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  return `${day} (${weekday[0].toUpperCase()}${weekday.slice(1)})`;
};
const formatTime = value => value ? `${value.replace(':', 'h')}min.` : '00h00min.';
const formatDocumentNumber = value => /^s\s*\/\s*n$/i.test((value || '').trim()) ? 'S/N' : (value || '').trim();
const initials = name => name.trim().split(/\s+/).filter(Boolean).map(n => n[0].toUpperCase()).join('. ') + (name.trim() ? '.' : '');
const values = type => $$(`[data-type="${type}"] input, [data-type="${type}"] select`).map(field => field.value.trim()).filter(Boolean);
const sentenceCase = value => value
  .split(/(\n\s*\n)/)
  .map(part => /\S/.test(part) && !/^\n/.test(part)
    ? part.trim().toLocaleLowerCase('pt-BR').replace(/^\p{L}/u, letter => letter.toLocaleUpperCase('pt-BR'))
    : part)
  .join('');
const operationText = value => {
  const clean = value.trim().replace(/^opera[cç][aã]o\s+/i, '');
  if (!clean) return '';
  if (/^(servi[cç]o\s+)?ordin[aá]rio$/i.test(clean)) return 'serviço ordinário';
  return `OPERAÇÃO ${clean.toLocaleUpperCase('pt-BR')}`;
};

function technicalNarrative(raw) {
  const facts = raw.trim().replace(/\s+/g, ' ');
  const lower = facts.toLocaleLowerCase('pt-BR');
  const materials = values('material');
  const people = $$('[data-type="person"]').map(row => {
    const [name] = $$('input', row);
    return name.value.trim() ? initials(name.value) : '';
  }).filter(Boolean);
  const has = (...terms) => terms.some(term => lower.includes(term));
  const arrested = has('preso', 'prisão', 'prendemos', 'voz de prisão', 'detido', 'capturado');
  const approached = has('abord', 'suspeito', 'indivíduo', 'individuo', 'cara');
  const firearm = has('armado', 'arma de fogo', 'revólver', 'revolver', 'pistola', 'munição', 'municao') || materials.some(item => /arma|rev[oó]lver|pistola|muni[cç][aã]o|calibre/i.test(item));
  const drugs = has('droga', 'entorpecente', 'maconha', 'cocaína', 'cocaina', 'crack', 'ice') || materials.some(item => /droga|maconha|coca[ií]na|crack|ice|entorpecente/i.test(item));
  const warrant = has('mandado', 'foragido', 'ordem judicial');
  const aggression = has('agress', 'lesão', 'lesao', 'ferido', 'sangue', 'violência', 'violencia');
  const reported = has('falou', 'informou', 'relatou', 'denúncia', 'denuncia', 'acionada', 'copom', 'transeunte');
  const materialText = materials.length ? materials.map(sentenceCase).join('; ') : '';
  const identified = people.length ? `, identificado pelas iniciais ${people.join(', ')}` : '';

  if (firearm && reported) {
    const seizure = materialText
      ? `Durante o procedimento, foram localizados e apreendidos os seguintes materiais: ${materialText}.`
      : 'Durante a busca pessoal e a varredura no perímetro, [informar se algum armamento, munição ou outro material foi localizado e indicar o local exato da localização].';
    const outcome = arrested
      ? `Diante dos fatos, foi dada voz de prisão ao abordado${identified}, que foi informado de seus direitos constitucionais e conduzido, juntamente com o material apreendido, à autoridade policial competente para a adoção dos procedimentos legais cabíveis.`
      : `Concluída a averiguação, [informar o resultado da abordagem e a providência adotada: liberação, condução, apreensão ou prisão]${identified}.`;
    return `A guarnição encontrava-se em patrulhamento ostensivo e preventivo quando foi solicitada por [informar se COPOM, transeunte ou denunciante identificado]. Conforme o relato recebido, um indivíduo do sexo masculino, com [inserir características físicas e vestimentas informadas], supostamente estaria portando uma arma de fogo nas imediações.

De posse das informações repassadas e com o objetivo de averiguar a veracidade dos fatos, a equipe deslocou-se de imediato ao local indicado. Nas proximidades, a guarnição visualizou um indivíduo cujas características [informar se coincidiam integral ou parcialmente com as repassadas], procedendo à aproximação com segurança.

Diante dos elementos objetivos informados e observados no local, foi dada voz de abordagem e realizada busca pessoal, em conformidade com os procedimentos técnicos operacionais. ${seizure}

${outcome}`;
  }

  if (warrant) {
    return `Após o recebimento das informações e a confirmação da existência de mandado judicial, a equipe iniciou diligências nos locais indicados com o objetivo de localizar o indivíduo${identified}.

Durante as diligências, o alvo foi localizado em [informar local e circunstâncias]. A equipe realizou a abordagem, confirmou a ordem judicial vigente e adotou os procedimentos de segurança previstos.

${arrested ? 'Foi dada voz de prisão ao indivíduo, que foi informado de seus direitos constitucionais e conduzido à autoridade policial competente para o cumprimento do mandado e demais providências legais cabíveis.' : '[Informar se houve cumprimento do mandado, condução ou se as diligências foram encerradas sem localização do alvo].'}`;
  }

  if (drugs) {
    return `Durante o patrulhamento, a equipe tomou conhecimento de possível ocorrência relacionada a substâncias entorpecentes. Diante das informações disponíveis, foram iniciadas diligências para averiguação dos fatos descritos pelo comunicante.

No local indicado, a equipe realizou a abordagem e os procedimentos de segurança pertinentes. ${materialText ? `Durante as buscas, foram localizados e apreendidos os seguintes materiais: ${materialText}.` : '[Descrever o local da busca, a substância encontrada, quantidade, acondicionamento e demais materiais relacionados].'}

${arrested ? `Diante dos fatos, foi dada voz de prisão ao envolvido${identified}, que foi conduzido, juntamente com o material apreendido, à autoridade policial competente para os procedimentos legais cabíveis.` : '[Informar a identificação dos envolvidos e a providência adotada ao final da ocorrência].'}`;
  }

  if (aggression) {
    return `A equipe foi acionada para averiguar uma ocorrência de possível agressão. De posse das informações iniciais, deslocou-se ao local indicado, onde realizou o levantamento das circunstâncias e buscou identificar a vítima, testemunhas e o possível autor.

No local, foi constatado o seguinte relato: ${sentenceCase(facts)}

Após a coleta das informações disponíveis, a equipe realizou as diligências pertinentes. [Informar atendimento médico, identificação ou localização do autor e demais providências adotadas].

Ao final, os dados foram registrados e [informar se os envolvidos foram orientados, conduzidos ou apresentados à autoridade policial competente].`;
  }

  const opening = reported ? 'Após receber as informações sobre a ocorrência, a equipe iniciou a averiguação dos fatos.' : 'Durante o patrulhamento ostensivo e preventivo, a equipe deparou-se com a situação relatada.';
  const procedure = approached ? 'Foram adotados os procedimentos de aproximação e segurança, com a identificação dos envolvidos e a verificação das circunstâncias apresentadas.' : 'A guarnição realizou as diligências necessárias, colheu as informações disponíveis e verificou as circunstâncias no local.';
  return `${opening}

Conforme informado: ${sentenceCase(facts)}

${procedure}${materialText ? ` Durante a ação, foram relacionados os seguintes materiais: ${materialText}.` : ''}

[Informar o desfecho da ocorrência, as orientações prestadas e eventual condução à autoridade competente].`;
}

function buildReport() {
  const d = Object.fromEntries(new FormData(form));
  if (reportType === 'service') return buildServiceReport(d);
  if (reportType === 'traffic') return buildTrafficReport(d);
  const natures = values('nature').map(sentenceCase);
  const materials = values('material').map(sentenceCase);
  const people = $$('[data-type="person"]').map(row => {
    const [name, age] = $$('input', row).map(i => i.value.trim());
    if (!name) return '';
    if (reportType === 'service') return `${sentenceCase(name)}${age ? ` - ${sentenceCase(age)}` : ''}.`;
    return `${initials(name)}${age ? ` - ${age} anos` : ''}.`;
  }).filter(Boolean);
  const victims = $$('[data-type="victim"]').map(row => {
    const [name, age] = $$('input', row).map(i => i.value.trim());
    return name ? `${initials(name)}${age ? ` - ${age} anos` : ''}.` : '';
  }).filter(Boolean);
  const address = `${sentenceCase(d.street || 'rua xxxxxxxx')}, n° ${d.number || 's/n'} - bairro ${sentenceCase(d.district || 'xxxxxx')}, cidade: ${d.city || 'xxxxxx'}/PI.`;
  const cia = (d.unit || 'xª CIA').replace(/\s*\([^)]*\)/, '');
  const normalizedOperation = d.occurrenceOperation
    ? operationText(d.occurrenceOperationName || '')
    : '';
  const employment = normalizedOperation && normalizedOperation !== 'serviço ordinário'
    ? `empregada na *${normalizedOperation}*`
    : `empregada no *Motopatrulhamento*${normalizedOperation === 'serviço ordinário' ? ', em *serviço ordinário*' : ''}`;
  const team = d.teamPrefix ? ` *${d.teamPrefix}*` : '';
  const intro = `Seguindo as determinações do Comandante do BPROCAM, *MAJOR MARCONI*, a equipe${team} da ${cia}/ROCAM, ${employment}, em ${d.city || 'cidade'}/PI, `;
  const history = d.history?.trim() ? d.history.trim() : 'descreva aqui a narrativa dos fatos.';
  const commonHeader = `*POLÍCIA MILITAR DO PIAUÍ*
*DEPARTAMENTO GERAL DE OPERAÇÕES - DGO*
*COMANDO DE POLICIAMENTO ESPECIALIZADO - CPE*

*${REPORT_TYPES[reportType || 'occurrence'].title}*

*${d.unit ? `${d.unit} / BPROCAM` : 'xª CIA (cidade x) / BPROCAM'}*

*PROTOCOLO:*
- ${formatDocumentNumber(d.protocol) || 'xxxx'}${d.boTco ? `\n- BO/TCO: ${formatDocumentNumber(d.boTco)}` : ''}

*EQUIPE:*
- ${d.teamPrefix || 'ROCAM00'}

*DATA:*
- ${formatDate(d.date)}

*HORÁRIO:*
- ${formatTime(d.time)}

*ENDEREÇO:*
- ${address}`;
  const historyBlock = `*HISTÓRICO:*
${intro}${history[0]?.toLowerCase()}${history.slice(1)}`;
  let details;
  if (reportType === 'service') details = `*ATIVIDADES REALIZADAS:*
${natures.length ? natures.map(x => `- ${x};`).join('\n') : '- Não informadas;'}

*POLICIAIS EMPREGADOS:*
${people.length ? people.map(x => `- ${x}`).join('\n') : '- Não informados.'}

*RECURSOS EMPREGADOS:*
${materials.length ? materials.map(x => `- ${x};`).join('\n') : '- Não informados.'}`;
  else if (reportType === 'traffic') details = `*TIPO DE OCORRÊNCIA:*
${natures.length ? natures.map(x => `- ${x};`).join('\n') : '- Não informado;'}

*CONDUTORES / ENVOLVIDOS:*
${people.length ? people.map(x => `- ${x}`).join('\n') : '- Não houve.'}

*VEÍCULOS / DOCUMENTOS:*
${materials.length ? materials.map(x => `- ${x};`).join('\n') : '- Não houve.'}`;
  else details = `*NATUREZA:*
${natures.length ? natures.map(x => `- ${x};`).join('\n') : '- Não informada;'}

*PRESO/APREENDIDO:*
${people.length ? people.map(x => `- ${x}`).join('\n') : '- Não houve.'}

*VÍTIMA:*
${victims.length ? victims.map(x => `- ${x}`).join('\n') : '- Não houve.'}

*MATERIAIS APREENDIDOS:*
${materials.length ? materials.map(x => `- ${x};`).join('\n') : '- Não houve.'}`;
  return `${commonHeader}

${details}

${historyBlock}

*Maj Marconi - Cmt do BPROCAM*

*POIS SÓ OS FORTES DE ESPÍRITO AQUI CONSEGUEM LUTAR* 🏍️ ⚡`;
}

function buildTrafficReport(d) {
  const natures = values('nature');
  const unit = d.unit ? `${d.unit} - BPROCAM` : '1ª CIA (Teresina) - BPROCAM';
  const cia = (d.unit || '1ª CIA').replace(/\s*\([^)]*\)/, '');
  const operationName = (d.trafficOperationName || '').trim().replace(/^opera[cç][aã]o\s+/i, '');
  const employment = d.trafficOperation
    ? `empregada na *OPERAÇÃO ${(operationName || 'NÃO INFORMADA').toLocaleUpperCase('pt-BR')}*`
    : 'empregada no *Motopatrulhamento*';
  const streetAddress = [d.street, d.number].filter(Boolean).join(' ').trim();
  const address = [streetAddress, d.district].filter(Boolean).join(', ') || 'Endereço não informado';
  const history = d.history?.trim() || 'Descreva a dinâmica da fiscalização e as medidas administrativas adotadas.';
  const trafficTime = d.time ? `${d.time.slice(0, 2)}H:${d.time.slice(3)}` : '00H:00';
  return `*POLÍCIA MILITAR DO PIAUÍ*
*DEPARTAMENTO GERAL DE OPERAÇÕES - DGO*
*COMANDO DE POLICIAMENTO ESPECIALIZADO - CPE*

*RELATÓRIO DE TRÂNSITO*

*${unit}*

*PROTOCOLO:*
- CICC: ${formatDocumentNumber(d.protocol) || 'S/N'}
- B.O: ${formatDocumentNumber(d.boTco) || 'S/N'}

*DATA:*
- ${formatDate(d.date)}

*HORÁRIO:*
- ${trafficTime}

*ENDEREÇO:*
- ${address}

*NATUREZA:*
${natures.length ? natures.map(item => `- ${item}`).join('\n') : '- Não informada'}


*HISTÓRICO:*

Seguindo as determinações do Comandante do BPROCAM, *MAJOR MARCONI*, a equipe *${d.teamPrefix || 'ROCAM00'}* da ${cia}/ROCAM, ${employment}, em ${d.city || 'cidade'}/PI, ${history[0]?.toLocaleLowerCase('pt-BR')}${history.slice(1)}

*Maj Marconi - Cmt do BPROCAM*

*POIS SÓ OS FORTES DE ESPÍRITO AQUI CONSEGUEM LUTAR!* 🏍️ ⚡`;
}

function buildServiceReport(d) {
  const unit = (d.unit || '4ª CIA (Floriano)').replace(/\s*\(([^)]+)\)/, ' - $1').toLocaleUpperCase('pt-BR');
  const team = d.teamPrefix || 'ROCAM00';
  const date = d.date ? new Date(`${d.date}T12:00:00`).toLocaleDateString('pt-BR') : '00/00/0000';
  const start = d.time || '00:00';
  const end = d.endTime || '00:00';
  const serviceHeading = d.serviceType === 'operation'
    ? `OPERAÇÃO ${(d.serviceOperationName || 'NÃO INFORMADA').replace(/^opera[cç][aã]o\s+/i, '').toLocaleUpperCase('pt-BR')}`
    : d.serviceType === 'planned' ? 'SERVIÇO PLANEJADA' : 'SERVIÇO ORDINÁRIO';
  const personnel = $$('[data-type="servicePerson"]').map((row, index) => {
    const name = $('input', row).value.trim();
    return name ? `${index + 1} - ${name.toLocaleUpperCase('pt-BR')}` : '';
  }).filter(Boolean);
  const stats = SERVICE_STATS.map(([key, label, references]) => {
    const enabled = $(`[data-stat="${key}"] .stat-check`).checked;
    let quantity = enabled ? ($(`[data-stat="${key}"] .stat-quantity`).value || '0') : '0';
    const numbers = references && enabled
      ? $$(`[data-stat="${key}"] .stat-reference`).map(input => input.value.trim()).filter(Boolean)
      : [];
    if (numbers.length && Number(quantity) < numbers.length) quantity = String(numbers.length);
    const formatted = String(Math.max(0, Number.parseInt(quantity, 10) || 0)).padStart(2, '0');
    return `> ${label}: ${formatted}${numbers.length ? ` (${numbers.join(', ')})` : ''}`;
  }).join('\n');
  return `*POLÍCIA MILITAR DO PIAUÍ*
*CPE*
*BATALHÃO ROCAM*
*${unit}*

*${serviceHeading}*
*${team}*

      *ENCERRAMENTO*

*Data:* ${date}
*Horário:* ${start} ÀS ${end}H
*Local:* ${d.serviceLocation || 'Não informado'}

${personnel.length ? personnel.join('\n') : '1 - EQUIPE NÃO INFORMADA'}


Equipe *${team}* encerrando o serviço de motopatrulhamento conforme os seguintes dados:

*Abordagem*
${stats}`;
}

function updatePreview() {
  $('#preview').textContent = buildReport();
  if (reportType) localStorage.setItem(`relatoDraft-${reportType}`, JSON.stringify(Object.fromEntries(new FormData(form))));
  $('#savedStatus').innerHTML = '<i></i> Salvo agora';
  clearTimeout(updatePreview.timer);
  updatePreview.timer = setTimeout(() => $('#savedStatus').innerHTML = '<i></i> Salvo automaticamente', 1200);
}

function addRow(type, data = []) {
  const list = $(`#${type}List`);
  $('.empty-row', list)?.remove();
  const row = document.createElement('div');
  row.className = `repeat-row ${type === 'person' || type === 'victim' ? '' : 'single'}`;
  row.dataset.type = type;
  const placeholders = REPORT_TYPES[reportType || 'occurrence'].placeholders;
  if (type === 'nature' && reportType === 'traffic') {
    row.innerHTML = `<select aria-label="Natureza da infração"><option value="">Selecione uma infração</option>${TRAFFIC_INFRACTIONS.map(item => `<option value="${item}"${item === data[0] ? ' selected' : ''}>${item}</option>`).join('')}</select><button type="button" class="remove-btn" aria-label="Remover">×</button>`;
  } else {
    row.innerHTML = type === 'person' || type === 'victim'
      ? `<input aria-label="Nome" placeholder="${placeholders[1]}" value="${data[0] || ''}"><input aria-label="Complemento" ${reportType === 'service' ? '' : 'type="number" min="0"'} placeholder="${placeholders[2]}" value="${data[1] || ''}"><button type="button" class="remove-btn" aria-label="Remover">×</button>`
      : `<input aria-label="${type}" placeholder="${type === 'nature' ? placeholders[0] : placeholders[3]}" value="${data[0] || ''}"><button type="button" class="remove-btn" aria-label="Remover">×</button>`;
  }
  list.append(row);
  $$('input, select', row).forEach(field => field.addEventListener('input', updatePreview));
  $('.remove-btn', row).addEventListener('click', () => { row.remove(); ensureEmpty(type); updatePreview(); });
}
function ensureEmpty(type) {
  const list = $(`#${type}List`);
  if (!list.children.length) list.innerHTML = '<div class="empty-row">Nenhum registro adicionado</div>';
}
['nature','person','victim','material'].forEach(ensureEmpty);
$$('[data-add]').forEach(btn => btn.addEventListener('click', () => { addRow(btn.dataset.add); $(`#${btn.dataset.add}List input:last-of-type, #${btn.dataset.add}List select:last-of-type`)?.focus(); }));

function addServicePerson(value = '') {
  const list = $('#servicePersonList');
  $('.empty-row', list)?.remove();
  const row = document.createElement('div');
  row.className = 'repeat-row single service-person-row';
  row.dataset.type = 'servicePerson';
  row.innerHTML = `<span class="person-order">${list.children.length + 1}</span><input aria-label="Policial" placeholder="SGT ROBERTO" value="${value.toLocaleUpperCase('pt-BR')}"><button type="button" class="remove-btn" aria-label="Remover">×</button>`;
  list.append(row);
  $('input', row).addEventListener('input', event => {
    event.target.value = event.target.value.toLocaleUpperCase('pt-BR');
    updatePreview();
  });
  $('.remove-btn', row).addEventListener('click', () => { row.remove(); renumberServicePeople(); updatePreview(); });
}

function renumberServicePeople() {
  const rows = $$('#servicePersonList [data-type="servicePerson"]');
  rows.forEach((row, index) => $('.person-order', row).textContent = index + 1);
  if (!rows.length) $('#servicePersonList').innerHTML = '<div class="empty-row">Nenhum policial adicionado</div>';
}

function addStatReference(statRow) {
  const list = $('.stat-references', statRow);
  const line = document.createElement('div');
  line.className = 'stat-reference-row';
  line.innerHTML = `<input class="stat-reference" placeholder="Número do documento"><button type="button" class="remove-btn" aria-label="Remover número">×</button>`;
  list.append(line);
  syncStatQuantity(statRow);
  $('input', line).addEventListener('input', updatePreview);
  $('button', line).addEventListener('click', () => { line.remove(); syncStatQuantity(statRow); updatePreview(); });
  $('input', line).focus();
}

function syncStatQuantity(statRow) {
  const quantity = $('.stat-quantity', statRow);
  if (quantity) quantity.value = $$('.stat-reference-row', statRow).length;
}

function createServiceStats() {
  $('#serviceStats').innerHTML = '';
  SERVICE_STATS.forEach(([key, label, hasReferences]) => {
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.dataset.stat = key;
    row.innerHTML = `<div class="stat-main"><label class="stat-toggle"><input type="checkbox" class="stat-check"><span></span><b>${label}</b></label><div class="stat-value" hidden><label>Quantidade<input type="number" min="${hasReferences ? '0' : '1'}" class="stat-quantity" value="${hasReferences ? '0' : '1'}" ${hasReferences ? 'readonly aria-label="Quantidade calculada automaticamente"' : ''}></label></div></div>${hasReferences ? `<div class="stat-documents" hidden><div class="stat-reference-head"><span>Números correspondentes</span><button type="button" class="add-btn stat-add">＋ Adicionar número</button></div><div class="stat-references"></div></div>` : ''}`;
    $('#serviceStats').append(row);
    const checkbox = $('.stat-check', row);
    checkbox.addEventListener('change', () => {
      $('.stat-value', row).hidden = !checkbox.checked;
      if (hasReferences) {
        $('.stat-documents', row).hidden = !checkbox.checked;
        if (checkbox.checked && !$('.stat-reference', row)) addStatReference(row);
      }
      updatePreview();
    });
    $('.stat-quantity', row).addEventListener('input', updatePreview);
    if (hasReferences) $('.stat-add', row).addEventListener('click', () => addStatReference(row));
  });
}

function updateServiceOperationField() {
  const isOperation = reportType === 'service' && form.elements.serviceType.value === 'operation';
  $('#serviceOperationField').hidden = !isOperation;
  form.elements.serviceOperationName.required = isOperation;
  if (!isOperation) form.elements.serviceOperationName.value = '';
}

function updateServiceTypeFromPrefix() {
  if (reportType !== 'service') return;
  const prefix = form.elements.teamPrefix.value.trim();
  if (/^(?:PDL|PLD)/i.test(prefix)) {
    form.elements.serviceType.value = 'planned';
    updateServiceOperationField();
  } else if (/^ROCAM/i.test(prefix)) {
    form.elements.serviceType.value = 'ordinary';
    updateServiceOperationField();
  }
}

function updateTrafficOperationField() {
  const enabled = reportType === 'traffic' && $('#trafficOperationCheck').checked;
  $('#trafficOperationNameField').hidden = !enabled;
  form.elements.trafficOperationName.required = enabled;
  if (!enabled) form.elements.trafficOperationName.value = '';
}

function updateOccurrenceOperationField() {
  const enabled = reportType === 'occurrence' && $('#occurrenceOperationCheck').checked;
  $('#occurrenceOperationNameField').hidden = !enabled;
  form.elements.occurrenceOperationName.required = enabled;
  if (!enabled) form.elements.occurrenceOperationName.value = '';
}

$('#addServicePerson').addEventListener('click', () => { addServicePerson(); $('#servicePersonList input:last-of-type')?.focus(); });
form.elements.serviceType.addEventListener('change', () => { updateServiceOperationField(); updatePreview(); });
form.elements.teamPrefix.addEventListener('change', () => { updateServiceTypeFromPrefix(); updatePreview(); });
$('#trafficOperationCheck').addEventListener('change', () => { updateTrafficOperationField(); updatePreview(); });
$('#occurrenceOperationCheck').addEventListener('change', () => { updateOccurrenceOperationField(); updatePreview(); });
createServiceStats();
renumberServicePeople();

function applyReportType(type) {
  reportType = type;
  const config = REPORT_TYPES[type];
  $('#reportPicker').hidden = false;
  $('#reportEditor').hidden = false;
  $('#stepOneLabel').textContent = config.step1;
  $('#stepTwoLabel').textContent = config.step2;
  $('#pageOneTitle').textContent = config.page1;
  $('#pageOneDescription').textContent = config.page1Help;
  $('#locationTitle').textContent = config.location;
  $('#pageTwoTitle').textContent = config.page2;
  $('#natureTitle').textContent = config.nature[0]; $('#natureHelp').textContent = config.nature[1];
  $('#personTitle').textContent = config.person[0]; $('#personHelp').textContent = config.person[1];
  $('#materialTitle').textContent = config.material[0]; $('#materialHelp').textContent = config.material[1];
  $('#historyTitle').textContent = config.history;
  const isService = type === 'service';
  const isTraffic = type === 'traffic';
  const isOccurrence = type === 'occurrence';
  $$('.service-only').forEach(element => element.hidden = !isService);
  $('#standardLocation').hidden = isService;
  $('#protocolField').hidden = isService;
  $('#boTcoField').hidden = isService;
  $('#protocolField > span').innerHTML = isTraffic ? 'Protocolo CICC' : 'Protocolo <b>*</b>';
  $('#boTcoField > span').textContent = isTraffic ? 'Número do B.O' : 'Número do BO/TCO';
  form.elements.protocol.placeholder = isTraffic ? 'S/N ou número do CICC' : 'Ex.: CICC/THE20260112345-123-OC-PM';
  form.elements.boTco.placeholder = isTraffic ? 'S/N ou número do B.O' : 'Ex.: 00202126/2026';
  $('#genericDetails').hidden = isService;
  $('#personSection').hidden = isTraffic;
  $('#personDivider').hidden = isTraffic;
  $('#victimSection').hidden = !isOccurrence;
  $('#victimDivider').hidden = !isOccurrence;
  $('#materialSection').hidden = isTraffic;
  $('#materialDivider').hidden = isTraffic;
  $('#serviceDetails').hidden = !isService;
  $('#standardHistoryFields').hidden = isService;
  $('#standardOperationField').hidden = true;
  $('#occurrenceOperationControl').hidden = !isOccurrence;
  $('#trafficOperationControl').hidden = !isTraffic;
  $('#serviceReview').hidden = !isService;
  form.elements.endTime.required = isService;
  form.elements.serviceLocation.required = isService;
  form.elements.serviceType.required = isService;
  form.elements.protocol.required = !isService && !isTraffic;
  form.elements.protocol.disabled = isService;
  form.elements.boTco.disabled = isService;
  form.elements.history.required = !isService;
  form.elements.operation.required = false;
  form.elements.operation.placeholder = 'Digite ordinário ou o nome da operação';
  $('#operationHelp').textContent = '“Ordinário” será exibido como serviço ordinário. Outros nomes serão precedidos por OPERAÇÃO.';
  form.elements.history.placeholder = isTraffic ? 'Ex.: Em patrulhamento na zona Centro Sul, no bairro Centro, a equipe deparou-se com...' : 'Ex.: Durante patrulhamento, a equipe visualizou um indivíduo em atitude suspeita...';
  ['street', 'district', 'city'].forEach(name => form.elements[name].required = !isService);
  $('.hero h1', $('#reportEditor')).innerHTML = `${config.title.replace('RELATÓRIO DE ', 'Relatório de ').toLocaleLowerCase('pt-BR').replace(/^./, c => c.toUpperCase())}.<br><em>Claro e padronizado.</em>`;
  $('#heroDescription').textContent = `Preencha os dados do relatório de ${config.noun} e gere um texto revisado e pronto para compartilhar.`;
  form.reset();
  ['nature','person','victim','material'].forEach(t => { $(`#${t}List`).innerHTML = ''; ensureEmpty(t); });
  $('#servicePersonList').innerHTML = '';
  renumberServicePeople();
  createServiceStats();
  const legacyDraft = type === 'occurrence' ? localStorage.getItem('relatoDraft') : null;
  const draft = JSON.parse(localStorage.getItem(`relatoDraft-${type}`) || legacyDraft || 'null');
  if (draft) Object.entries(draft).forEach(([key,value]) => {
    if (!form.elements[key]) return;
    if (form.elements[key].type === 'checkbox') form.elements[key].checked = Boolean(value);
    else form.elements[key].value = value;
  });
  if (!form.elements.city.value) form.elements.city.value = CIA_CITIES[form.elements.unit.value] || '';
  if (!form.elements.date.value) form.elements.date.value = new Date().toISOString().slice(0,10);
  if (isService && !form.elements.time.value) form.elements.time.value = '06:00';
  if (isService && !form.elements.endTime.value) form.elements.endTime.value = '12:00';
  updateServiceTypeFromPrefix();
  updateServiceOperationField();
  updateOccurrenceOperationField();
  updateTrafficOperationField();
  $('#charCount').textContent = form.elements.history.value.length;
  $('#newBtn').innerHTML = '<span>＋</span> Novo relatório';
  showPage(1);
  updatePreview();
  requestAnimationFrame(() => scrollElementVertically(form));
}

function showReportPicker() {
  reportType = null;
  $('#reportEditor').hidden = true;
  $('#reportPicker').hidden = false;
  document.activeElement?.blur();
  requestAnimationFrame(() => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    root.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    requestAnimationFrame(() => { root.style.scrollBehavior = previousBehavior; });
  });
}

$$('[data-report]').forEach(card => card.addEventListener('click', () => applyReportType(card.dataset.report)));
$('.brand').addEventListener('click', e => { e.preventDefault(); showReportPicker(); });

function showPage(next) {
  page = Math.max(1, Math.min(3, next));
  $$('.form-page').forEach(el => el.classList.toggle('active', +el.dataset.page === page));
  $$('.step').forEach(el => el.classList.toggle('active', +el.dataset.step <= page));
  $('#pageCurrent').textContent = page;
  $('#backBtn').style.visibility = page === 1 ? 'hidden' : 'visible';
  $('#nextBtn').innerHTML = page === 3 ? 'Finalizar <span>✓</span>' : 'Continuar <span>→</span>';
  if (innerWidth < 700) scrollElementVertically(form);
}

function scrollElementVertically(element) {
  const offset = innerWidth < 620 ? 78 : 98;
  scrollTo({ top: element.getBoundingClientRect().top + scrollY - offset, left: 0, behavior: 'smooth' });
}
$('#nextBtn').addEventListener('click', () => {
  const current = $(`.form-page[data-page="${page}"]`);
  const invalid = $$('[required]:not([disabled])', current).find(field => {
    const hiddenContainer = field.closest('[hidden]');
    return !hiddenContainer && !field.value.trim();
  });
  if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
  if (page < 3) showPage(page + 1); else { updatePreview(); showToast('Relatório finalizado e pronto!'); scrollElementVertically($('.preview-panel')); }
});
$('#backBtn').addEventListener('click', () => showPage(page - 1));
$$('.step').forEach(s => s.addEventListener('click', () => showPage(+s.dataset.step)));
form.addEventListener('input', e => {
  if (e.target.name === 'history') {
    delete e.target.dataset.aiGenerated;
    $('#charCount').textContent = e.target.value.length;
  }
  updatePreview();
});
form.addEventListener('focusout', e => {
  const field = e.target;
  if (!field.matches('input, textarea') || field.readOnly || field.type === 'number') return;
  if (field.name === 'protocol' || field.name === 'boTco') {
    field.value = formatDocumentNumber(field.value);
    updatePreview();
    return;
  }
  if (field.closest('[data-type="servicePerson"]')) {
    field.value = field.value.toLocaleUpperCase('pt-BR');
    updatePreview();
    return;
  }
  const isPrisoner = field.closest('[data-type="person"]');
  const isException = isPrisoner || field.name === 'history' || field.name === 'serviceLocation';
  if (isException || !field.value.trim()) return;
  if (reportType === 'traffic' && (field.closest('[data-type="nature"]') || ['street', 'district', 'operation'].includes(field.name))) return;
  field.value = field.name === 'operation' ? operationText(field.value) : sentenceCase(field.value);
  if (field.name === 'history') $('#charCount').textContent = field.value.length;
  updatePreview();
});
form.elements.unit.addEventListener('change', e => {
  form.elements.city.value = CIA_CITIES[e.target.value] || '';
  updatePreview();
});

$('#spellcheckBtn').addEventListener('click', () => {
  const area = form.elements.history;
  if (!area.value.trim()) { area.focus(); showToast('Escreva a narrativa primeiro'); return; }
  const corrections = {
    'acompanhemento':'acompanhamento','agressao':'agressão','apreensao':'apreensão',
    'apreendido':'apreendido','cabiveis':'cabíveis','caracteristicas':'características','cocaina':'cocaína',
    'conducao':'condução','denuncia':'denúncia','diligencias':'diligências','encontrado':'encontrado',
    'enctrado':'encontrado','flagrancia':'flagrância','guarnicao':'guarnição','historico':'histórico',
    'individuo':'indivíduo','infracoes':'infrações','municao':'munição',
    'municoes':'munições','operacao':'operação','ocorrencia':'ocorrência','patruladno':'patrulhando',
    'patrulhamneto':'patrulhamento','policia':'polícia','prisao':'prisão','procedimentos':'procedimentos',
    'providencias':'providências','revolver':'revólver','substancia':'substância','substancias':'substâncias',
    'suspeicao':'suspeição','tatico':'tático','tecnica':'técnica','tecnico':'técnico','tauros':'Taurus',
    'trafico':'tráfico','transito':'trânsito','verificacao':'verificação','vitima':'vítima'
  };
  let count = 0;
  let text = area.value.replace(/\p{L}+/gu, word => {
    const replacement = corrections[word.toLocaleLowerCase('pt-BR')];
    if (!replacement || replacement === word) return word;
    count++;
    if (word === word.toLocaleUpperCase('pt-BR')) return replacement.toLocaleUpperCase('pt-BR');
    if (/^\p{Lu}/u.test(word)) return replacement[0].toLocaleUpperCase('pt-BR') + replacement.slice(1);
    return replacement;
  });
  text = text.replace(/\barma de foto\b/gi, match => { count++; return match[0] === 'A' ? 'Arma de fogo' : 'arma de fogo'; });
  area.value = text;
  $('#charCount').textContent = area.value.length;
  updatePreview();
  showToast(count ? `${count} correção${count > 1 ? 'ões' : ''} aplicada${count > 1 ? 's' : ''}` : 'Nenhum erro conhecido encontrado');
});

function showToast(message) { const t=$('#toast'); t.textContent=message; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }
$('#copyBtn').addEventListener('click', async () => { try { await navigator.clipboard.writeText(buildReport()); showToast('Relatório copiado para o WhatsApp!'); } catch { const t=document.createElement('textarea');t.value=buildReport();document.body.append(t);t.select();document.execCommand('copy');t.remove();showToast('Relatório copiado!'); } });
$('#downloadBtn').addEventListener('click', () => { const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buildReport()],{type:'text/plain;charset=utf-8'}));a.download=`${reportType || 'relatorio'}-${form.elements.protocol.value || 'rascunho'}.txt`;a.click();URL.revokeObjectURL(a.href); });
$('#themeBtn').addEventListener('click', () => document.body.classList.toggle('light'));
$('#newBtn').addEventListener('click', showReportPicker);
