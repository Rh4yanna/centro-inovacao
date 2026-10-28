import { Buffer } from 'node:buffer';
import { test, expect } from '@playwright/test';

const institution = { id: 'i1', nome: 'Instituição Alfa' };
async function setup(page, role = 'admin_geral', handler = () => null) {
  const calls = [];
  await page.route('**/api/**', async route => {
    const req = route.request(); const url = new URL(req.url()); const path = url.pathname;
    if (!path.startsWith('/api/')) return route.continue();
    calls.push({ path, method: req.method() });
    const custom = await handler(path, req, url);
    if (custom) return route.fulfill(custom);
    if (path === '/api/sessao') return route.fulfill({ json: { id: 'u1', nome: 'Pessoa de teste', papel: role, menu: [] } });
    if (path === '/api/dominios') return route.fulfill({ json: { tiposInstituicao: [], areasAtuacao: [], statusInstituicao: [] } });
    if (path === '/api/governanca/eventos/e1') return route.fulfill({ json: { versao: 1, evento: { id: 'e1', titulo: 'Encontro CTI' } } });
    if (path === '/api/governanca/minha-instituicao') return route.fulfill({ json: { versao: 1, instituicao: { nomeFantasia: 'Alfa' }, solicitacoes: [] } });
    if (path.startsWith('/api/governanca')) return route.fulfill({ status: 404, json: { erro: { mensagem: 'Serviço indisponível' } } });
    return route.fulfill({ json: { dados: [] } });
  });
  return calls;
}
test('contas e importações bloqueiam diretoria inclusive por URL', async ({page}) => {
  const calls = await setup(page, 'diretoria');
  for (const path of ['/contas', '/importacoes']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: 'Acesso indisponivel' })).toBeVisible();
  }
  expect(calls.some(c => ['/api/governanca/contas', '/api/governanca/importacoes'].includes(c.path))).toBe(false);
});
test('conta exige revisão e vínculo institucional antes de gravar', async ({page}) => {
  let payload;
  await setup(page, 'admin_geral', (path, req) => {
    if (path !== '/api/governanca/contas') return null;
    if (req.method() === 'POST') { payload = req.postDataJSON(); return { json: { versao: 1, confirmado: true } }; }
    return { json: { versao: 1, dados: [], instituicoes: [institution] } };
  });
  await page.goto('/contas');
  await page.getByRole('button', { name: 'Nova conta', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nome', { exact: true }).fill('Nova Pessoa');
  await dialog.getByLabel('E-mail', { exact: true }).fill('nova@example.com');
  await dialog.getByRole('combobox', { name: 'Instituição', exact: true }).selectOption('i1');
  await dialog.getByRole('button', { name: 'Revisar acesso' }).click();
  expect(payload).toBeUndefined();
  await dialog.getByRole('button', { name: 'Confirmar acesso' }).click();
  await expect.poll(() => payload?.instituicaoId).toBe('i1');
  expect(payload.papel).toBe('representante_instituicao');
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('importação não grava arquivo inválido e confirmação usa a prévia validada', async ({page}) => {
  let valid = false; let committed;
  await setup(page, 'admin_geral', (path, req) => {
    if (path === '/api/governanca/importacoes') return { json: { versao: 1, dados: [] } };
    if (path.endsWith('/importacoes/validar')) return { json: { versao: 1, previa: { id: 'previa1', validos: valid ? 1 : 0, duplicados: 0, erros: valid ? [] : [{ linha: 2, mensagem: 'CNPJ inválido' }], colunas: ['nomeFantasia'], amostra: [{ nomeFantasia: 'Alfa' }] } } };
    if (path.endsWith('/importacoes/confirmar')) { committed = req.postDataJSON(); return { json: { versao: 1, confirmado: true, importacao: { id: 'imp1', importados: 1, status: 'concluida' } } }; }
  });
  await page.goto('/importacoes');
  await page.locator('input[type=file]').setInputFiles({ name: 'instituicoes.csv', mimeType: 'text/csv', buffer: Buffer.from('nomeFantasia;cnpj\nAlfa;123') });
  await page.getByRole('button', { name: 'Validar arquivo' }).click();
  await expect(page.getByText('Linha 2: CNPJ inválido')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirmar importação de 0 registros' })).toBeDisabled();
  expect(committed).toBeUndefined();
  valid = true;
  await page.getByRole('button', { name: 'Validar arquivo' }).click();
  await page.getByRole('button', { name: 'Confirmar importação de 1 registros' }).click();
  await expect.poll(() => committed?.previaId).toBe('previa1');
  await expect(page.getByText('Importação imp1: concluida. 1 registros importados.')).toBeVisible();
});
test('notificações vêm da API e marcação só muda após confirmação', async ({page}) => {
  let marked = false;
  await setup(page, 'representante_instituicao', (path, req) => {
    if (path === '/api/governanca/notificacoes') return { json: { versao: 1, dados: [{ id: 'n1', titulo: 'Convocação recebida', mensagem: 'Reunião de novembro', lidaEm: marked ? '2026-10-26' : null, destino: '/minha-instituicao' }], preferencias: {} } };
    if (path.endsWith('/n1/lida') && req.method() === 'POST') { marked = true; return { json: { versao: 1, confirmado: true } }; }
  });
  await page.goto('/notificacoes');
  await expect(page.getByRole('heading', { name: 'Convocação recebida' })).toBeVisible();
  await page.getByRole('button', { name: 'Marcar como lida' }).click();
  await expect(page.getByRole('button', { name: 'Marcar como lida' })).toHaveCount(0);
  await page.getByLabel('Somente não lidas').check();
  await expect(page.getByText('Nenhuma notificação para este filtro.')).toBeVisible();
});
test('auditoria pagina e reinicia a paginação ao aplicar filtros', async ({page}) => {
  const queries = [];
  await setup(page, 'diretoria', (path, req, url) => {
    if (path !== '/api/governanca/auditoria') return null;
    queries.push(Object.fromEntries(url.searchParams));
    return { json: { versao: 1, dados: [{ id: url.searchParams.get('cursor') || 'a1', autorNome: 'Ana', acao: 'Atualização', recursoNome: 'Alfa', antes: { nome: 'Anterior' }, depois: { nome: 'Novo' } }], proximoCursor: url.searchParams.get('cursor') ? null : 'cursor2' } };
  });
  await page.goto('/auditoria');
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await expect(page.getByText('Página 2')).toBeVisible();
  await page.getByLabel('Nome do autor').fill('Ana');
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
  await expect(page.getByText('Página 1')).toBeVisible();
  await expect.poll(() => queries.at(-1)?.autor).toBe('Ana');
  expect(queries.at(-1).cursor).toBe('');
});
test('convocação exige confirmação dos destinatários antes de enviar', async ({page}) => {
  let sent;
  await setup(page, 'diretoria', (path, req) => {
    if (path.endsWith('/organizacao')) return { json: { versao: 1, instituicoes: [institution], convocacoes: [], encaminhamentos: [], responsaveis: [] } };
    if (path.endsWith('/convocacoes') && req.method() === 'POST') { sent = req.postDataJSON(); return { json: { versao: 1, confirmado: true } }; }
  });
  await page.goto('/eventos/e1');
  await page.getByLabel('Assunto', { exact: true }).fill('Convocação CTI');
  await page.getByLabel('Mensagem', { exact: true }).fill('Convidamos a instituição para o encontro.');
  await page.getByLabel('Instituição Alfa', { exact: true }).check();
  await page.getByRole('button', { name: 'Revisar convocação' }).click();
  expect(sent).toBeUndefined();
  await expect(page.getByRole('dialog')).toContainText('Instituição Alfa');
  await page.getByRole('button', { name: 'Confirmar envio' }).click();
  await expect.poll(() => sent?.instituicoes).toEqual(['i1']);
  expect(sent.chaveOperacao).toBeTruthy();
});
test('encaminhamento salva responsável e prazo sem alterar pauta', async ({page}) => {
  let saved;
  await setup(page, 'diretoria', (path, req) => {
    if (path.endsWith('/organizacao')) return { json: { versao: 1, instituicoes: [], convocacoes: [], encaminhamentos: [], responsaveis: [{ id: 'p1', nome: 'Ana' }] } };
    if (path.endsWith('/encaminhamentos') && req.method() === 'POST') { saved = req.postDataJSON(); return { json: { versao: 1, confirmado: true } }; }
  });
  await page.goto('/eventos/e1');
  await page.getByRole('button', { name: 'Novo encaminhamento' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Título', { exact: true }).fill('Publicar relatório');
  await dialog.getByRole('combobox', { name: 'Responsável', exact: true }).selectOption('p1');
  await dialog.getByLabel('Prazo', { exact: true }).fill('2026-12-01');
  await dialog.getByRole('button', { name: 'Salvar encaminhamento' }).click();
  await expect.poll(() => saved?.prazo).toBe('2026-12-01');
  expect(saved.responsavelId).toBe('p1');
});
test('representante pede correção sem alterar diretamente a presença', async ({page}) => {
  let sent;
  const calls = await setup(page, 'representante_instituicao', (path, req) => {
    if (path === '/api/governanca/minha-instituicao') return {json:{versao:1,instituicao:{nomeFantasia:'Alfa'},solicitacoes:sent ? [{id:'s1',tipo:'correcao_presenca',status:'pendente',criadoEm:'2026-10-27T12:00:00Z'}] : []}};
    if (path === '/api/governanca/minha-instituicao/presencas') return { json: { versao: 1, dados: [{ id: 'pr1', atividadeTitulo: 'Reunião CTI', nome: 'Ana', statusPresenca: 'ausente' }] } };
    if (path.endsWith('/solicitacoes') && req.method() === 'POST') { sent = req.postDataJSON(); return { json: { versao: 1, confirmado: true, solicitacao: { id: 's1' } } }; }
  });
  await page.goto('/minha-instituicao');
  await page.getByRole('button', { name: 'Solicitar correção', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: 'Presença solicitada' }).selectOption('justificada');
  await dialog.getByLabel('Justificativa', { exact: true }).fill('Compromisso institucional no mesmo horário.');
  await dialog.getByRole('button', { name: 'Enviar solicitação', exact: true }).click();
  await expect.poll(() => sent?.tipo).toBe('correcao_presenca');
  expect(sent.presencaId).toBe('pr1');
  await expect(page.getByRole('heading',{name:'correcao_presenca',exact:true})).toBeVisible();
  await expect(page.getByText(/pendente.*27\/10\/2026/)).toBeVisible();
  expect(calls.some(c => c.path.endsWith('/presencas') && c.method !== 'GET')).toBe(false);
});
test('fila offline preserva falhas e reutiliza chave na tentativa seguinte', async ({page}) => {
  let fail = true; const keys = [];
  await setup(page, 'diretoria', (path, req) => {
    if (path.endsWith('/credenciamento')) return { json: { versao: 1, status: 'aberto', registroOfflineHabilitado: true, pessoas: [{ id: 'p1', nome: 'Ana' }], instituicoes: [institution], participantes: [] } };
    if (path === '/api/governanca/eventos/e1/presencas' && req.method() === 'POST') { keys.push(req.postDataJSON().chaveOperacao); return fail ? { status: 503, json: { erro: { mensagem: 'Serviço temporariamente indisponível' } } } : { json: { versao: 1, confirmado: true } }; }
  });
  await page.goto('/eventos/e1');
  await page.getByRole('combobox', { name: 'Participante', exact: true }).selectOption('p1');
  await page.getByLabel('Justificativa da inclusão ou correção').fill('Falha da conexão no local');
  await page.getByRole('button', { name: 'Guardar presença para enviar depois' }).click();
  await expect(page.getByText('Ana · presente · Pendente de envio')).toBeVisible();
  expect(keys).toHaveLength(0);
  await page.reload();
  await page.getByRole('button', { name: 'Enviar presenças pendentes' }).click();
  await expect(page.getByText('Ana · presente · Pendente de envio')).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'Serviço temporariamente indisponível' })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Enviar presenças pendentes' }).click();
  await expect(page.getByText('Nenhuma presença pendente nesta atividade.')).toBeVisible();
  expect(keys).toHaveLength(2); expect(keys[0]).toBe(keys[1]);
});

test('instituição confirma participação com representante vinculado', async ({page}) => {
  let sent;
  await setup(page, 'representante_instituicao', (path, req) => {
    if (path === '/api/governanca/minha-instituicao/convocacoes') return { json: { versao: 1, dados: [{ id: 'c1', titulo: 'Reunião de planejamento', podeResponder: true, versaoRegistro: 2 }], representantes: [{ id: 'p1', nome: 'Ana' }] } };
    if (path.endsWith('/c1/resposta')) { sent = req.postDataJSON(); return { json: { versao: 1, confirmado: true } }; }
  });
  await page.goto('/minha-instituicao');
  await page.getByRole('button', { name: 'Responder convocação' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: 'Representante', exact: true }).selectOption('p1');
  await dialog.getByRole('button', { name: 'Enviar resposta' }).click();
  await expect.poll(() => sent?.representanteId).toBe('p1');
  expect(sent.resposta).toBe('confirmada'); expect(sent.versaoRegistro).toBe(2);
});
test('substituição usa vínculo e ofício sem encerrar o representante diretamente', async ({page}) => {
  let sent;
  const calls = await setup(page, 'representante_instituicao', (path, req) => {
    if (path === '/api/governanca/minha-instituicao/representantes') return { json: { versao: 1, dados: [{ vinculoId: 'v1', nome: 'Ana', tipo: 'titular', status: 'ativo' }], oficios: [{ id: 'd1', nome: 'Ofício de substituição' }] } };
    if (path.endsWith('/solicitacoes') && req.method() === 'POST') { sent = req.postDataJSON(); return { json: { versao: 1, confirmado: true, solicitacao: { id: 's1' } } }; }
  });
  await page.goto('/minha-instituicao');
  await page.getByRole('combobox', { name: 'Representante atual', exact: true }).selectOption('v1');
  await page.getByLabel('Nome do novo representante').fill('Bruno');
  await page.getByLabel('Cargo na instituição').fill('Coordenador');
  await page.getByRole('combobox', { name: 'Ofício enviado', exact: true }).selectOption('d1');
  await page.getByLabel('Motivo', { exact: true }).fill('Atualização da representação institucional');
  await page.getByRole('button', { name: 'Enviar solicitação de representação' }).click();
  await expect.poll(() => sent?.tipo).toBe('substituicao_representante');
  expect(sent.representanteAnteriorId).toBe('v1'); expect(sent.oficioId).toBe('d1'); expect(sent.novoRepresentante.nome).toBe('Bruno');
  expect(calls.some(c => c.method !== 'GET' && c.path.includes('/vinculos/'))).toBe(false);
});

test('cadastro incompleto avisa razao social antes de enviar', async ({page}) => {
  let sent;
  await setup(page,'representante_instituicao',(path,req) => {
    if (path === '/api/governanca/minha-instituicao') return {json:{versao:1,instituicao:{nomeFantasia:'Alfa',cnpj:'12345678000100',razaoSocial:''},solicitacoes:[]}};
    if (path.endsWith('/solicitacoes') && req.method() === 'POST') {sent=req.postDataJSON();return {json:{versao:1,solicitacao:{id:'s1'}}};}
  });
  await page.goto('/minha-instituicao');
  await page.getByLabel('Justificativa da solicitação').fill('Atualizar cadastro');
  await page.getByRole('button',{name:'Solicitar alteração',exact:true}).click();
  await expect(page.getByRole('alert').filter({hasText:'Preencha os campos obrigatórios: Razão social.'})).toBeVisible();
  expect(sent).toBeUndefined();
  await page.getByLabel('Razão social',{exact:true}).fill('Alfa Ltda');
  await page.getByRole('button',{name:'Solicitar alteração',exact:true}).click();
  await expect.poll(()=>sent?.alteracoes?.razaoSocial).toBe('Alfa Ltda');
});

test('representante logado nao recebe chamada para login e datas civis preservam o dia', async ({page}) => {
  await setup(page,'representante_instituicao',path => path === '/api/governanca/publico' ? {json:{versao:1,instituicoes:[],calendario:[{id:'a1',tipo:'evento',titulo:'Agenda teste',data:'2026-10-27'}]}} : null);
  for (const path of ['/dashboard','/publico']) {
    await page.goto(path);
    await expect(page.getByRole('heading',{name:'Agenda teste'})).toBeVisible();
    await expect(page.getByText('27/10/2026', {exact:false})).toBeVisible();
    await expect(page.getByRole('link',{name:'Acessar minha conta'})).toHaveCount(0);
  }
});
