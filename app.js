const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const form = $('#reportForm');
let page = 1;
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
const initials = name => name.trim().split(/\s+/).filter(Boolean).map(n => n[0].toUpperCase()).join('. ') + (name.trim() ? '.' : '');
const values = type => $$(`[data-type="${type}"] input`).map(i => i.value.trim()).filter(Boolean);
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
  const natures = values('nature').map(sentenceCase);
  const materials = values('material').map(sentenceCase);
  const people = $$('[data-type="person"]').map(row => {
    const [name, age] = $$('input', row).map(i => i.value.trim());
    return name ? `${initials(name)}${age ? ` - ${age} anos` : ''}.` : '';
  }).filter(Boolean);
  const address = `${sentenceCase(d.street || 'rua xxxxxxxx')}, n° ${d.number || 's/n'} - bairro ${sentenceCase(d.district || 'xxxxxx')}, cidade: ${d.city || 'xxxxxx'}/PI.`;
  const cia = (d.unit || 'xª CIA').replace(/\s*\([^)]*\)/, '');
  const normalizedOperation = operationText(d.operation || '');
  const operation = normalizedOperation === 'serviço ordinário'
    ? ', em *serviço ordinário*'
    : normalizedOperation ? `, durante a *${normalizedOperation}*` : '';
  const team = d.teamPrefix ? ` *${d.teamPrefix}*` : '';
  const intro = `Seguindo as determinações do Comandante do BPROCAM, *MAJOR MARCONI*, a equipe${team} da ${cia}/ROCAM, empregada no *Motopatrulhamento*${operation}, em ${d.city || 'cidade'}/PI, `;
  const history = d.history?.trim() ? d.history.trim() : 'descreva aqui a narrativa dos fatos.';
  return `*POLÍCIA MILITAR DO PIAUÍ*
*DEPARTAMENTO GERAL DE OPERAÇÕES - DGO*
*COMANDO DE POLICIAMENTO ESPECIALIZADO - CPE*

*RELATÓRIO DE OCORRÊNCIA*

*${d.unit ? `${d.unit} / BPROCAM` : 'xª CIA (cidade x) / BPROCAM'}*

*PROTOCOLO:*
- ${d.protocol || 'xxxx'}

*EQUIPE:*
- ${d.teamPrefix || 'ROCAM00'}

*DATA:*
- ${formatDate(d.date)}

*HORÁRIO:*
- ${formatTime(d.time)}

*ENDEREÇO:*
- ${address}

*NATUREZA:*
${natures.length ? natures.map(x => `- ${x};`).join('\n') : '- Não informada;'}

*PRESO/APREENDIDO:*
${people.length ? people.map(x => `- ${x}`).join('\n') : '- Não houve.'}

*MATERIAIS APREENDIDOS:*
${materials.length ? materials.map(x => `- ${x};`).join('\n') : '- Não houve.'}

*HISTÓRICO:*
${intro}${history[0]?.toLowerCase()}${history.slice(1)}

*Maj Marconi - Cmt do BPROCAM*

*POIS SÓ OS FORTES DE ESPÍRITO AQUI CONSEGUEM LUTAR* 🏍️⚡️`;
}

function updatePreview() {
  $('#preview').textContent = buildReport();
  localStorage.setItem('relatoDraft', JSON.stringify(Object.fromEntries(new FormData(form))));
  $('#savedStatus').innerHTML = '<i></i> Salvo agora';
  clearTimeout(updatePreview.timer);
  updatePreview.timer = setTimeout(() => $('#savedStatus').innerHTML = '<i></i> Salvo automaticamente', 1200);
}

function addRow(type, data = []) {
  const list = $(`#${type}List`);
  $('.empty-row', list)?.remove();
  const row = document.createElement('div');
  row.className = `repeat-row ${type === 'person' ? '' : 'single'}`;
  row.dataset.type = type;
  const placeholders = { nature: 'Tráfico de Drogas Art. 33 da Lei Nº 11.343/2006', material: '01 Aparelho Celular Marca/Modelo Cor' };
  row.innerHTML = type === 'person'
    ? `<input aria-label="Nome" placeholder="Nome completo" value="${data[0] || ''}"><input aria-label="Idade" type="number" min="0" placeholder="Idade" value="${data[1] || ''}"><button type="button" class="remove-btn" aria-label="Remover">×</button>`
    : `<input aria-label="${type}" placeholder="${placeholders[type]}" value="${data[0] || ''}"><button type="button" class="remove-btn" aria-label="Remover">×</button>`;
  list.append(row);
  $$('input', row).forEach(i => i.addEventListener('input', updatePreview));
  $('.remove-btn', row).addEventListener('click', () => { row.remove(); ensureEmpty(type); updatePreview(); });
}
function ensureEmpty(type) {
  const list = $(`#${type}List`);
  if (!list.children.length) list.innerHTML = '<div class="empty-row">Nenhum registro adicionado</div>';
}
['nature','person','material'].forEach(ensureEmpty);
$$('[data-add]').forEach(btn => btn.addEventListener('click', () => { addRow(btn.dataset.add); $(`#${btn.dataset.add}List input:last-of-type`)?.focus(); }));

function showPage(next) {
  page = Math.max(1, Math.min(3, next));
  $$('.form-page').forEach(el => el.classList.toggle('active', +el.dataset.page === page));
  $$('.step').forEach(el => el.classList.toggle('active', +el.dataset.step <= page));
  $('#pageCurrent').textContent = page;
  $('#backBtn').style.visibility = page === 1 ? 'hidden' : 'visible';
  $('#nextBtn').innerHTML = page === 3 ? 'Finalizar <span>✓</span>' : 'Continuar <span>→</span>';
  if (innerWidth < 700) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
$('#nextBtn').addEventListener('click', () => {
  const current = $(`.form-page[data-page="${page}"]`);
  const invalid = $$('[required]', current).find(i => !i.value.trim());
  if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
  if (page < 3) showPage(page + 1); else { updatePreview(); showToast('Relatório finalizado e pronto!'); $('.preview-panel').scrollIntoView({behavior:'smooth'}); }
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
  const isPrisoner = field.closest('[data-type="person"]');
  const isException = isPrisoner || field.name === 'protocol' || field.name === 'history';
  if (isException || !field.value.trim()) return;
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
$('#downloadBtn').addEventListener('click', () => { const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buildReport()],{type:'text/plain;charset=utf-8'}));a.download=`ocorrencia-${form.elements.protocol.value || 'rascunho'}.txt`;a.click();URL.revokeObjectURL(a.href); });
$('#themeBtn').addEventListener('click', () => document.body.classList.toggle('light'));
$('#newBtn').addEventListener('click', () => { if (!confirm('Iniciar uma nova ocorrência? O rascunho atual será apagado.')) return; form.reset(); ['nature','person','material'].forEach(t => { $(`#${t}List`).innerHTML=''; ensureEmpty(t); }); localStorage.removeItem('relatoDraft'); $('#charCount').textContent='0'; showPage(1); updatePreview(); });

const draft = JSON.parse(localStorage.getItem('relatoDraft') || 'null');
if (draft) Object.entries(draft).forEach(([key,value]) => { if (form.elements[key]) form.elements[key].value=value; });
form.elements.city.value = CIA_CITIES[form.elements.unit.value] || '';
if (!form.elements.date.value) form.elements.date.value = new Date().toISOString().slice(0,10);
$('#charCount').textContent = form.elements.history.value.length;
updatePreview();
