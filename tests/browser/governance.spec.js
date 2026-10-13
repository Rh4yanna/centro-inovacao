import { Buffer } from 'node:buffer';
import { test, expect } from '@playwright/test';

async function setup(page, papel = null, handler = () => null) {
  const calls = [];
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (!path.startsWith('/api/')) return route.continue();
    calls.push({path,method:route.request().method()});
    const custom = await handler(path, route.request());
    if (custom) return route.fulfill(custom);
    if(path === '/api/sessao') return route.fulfill(papel ? {json:{nome:'Pessoa teste',papel,menu:[]}} : {status:401,json:{erro:{mensagem:'Sem sessão'}}});
    if(path === '/api/dominios') return route.fulfill({json:{tiposInstituicao:[],areasAtuacao:[],statusInstituicao:[]}});
    if(path.startsWith('/api/governanca')) return route.fulfill({status:404,json:{erro:{mensagem:'Indisponível'}}});
    return route.fulfill({json:{dados:[]}});
  });
  return calls;
}
test('dashboard público abre sem login e não consulta cadastros privados', async ({page}) => {
  const calls = await setup(page,null,path => path === '/api/governanca/publico' ? {json:{versao:1,indicadores:{instituicoes:2},instituicoes:[{id:'1',nome:'Instituição autorizada',autorizaDivulgacao:true,vertente:'Educação'},{id:'2',nome:'Instituição reservada',autorizaDivulgacao:false}],calendario:[],diretoria:[]}} : null);
  await page.goto('/publico');
  await expect(page.getByRole('heading',{name:'Ciência, tecnologia e inovação'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Instituição autorizada'})).toBeVisible();
  await expect(page.getByText('Instituição reservada')).toHaveCount(0);
  expect(calls.some(c => ['/api/instituicoes','/api/representantes','/api/indicadores'].includes(c.path))).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('API ausente mostra indisponibilidade sem simular registros', async ({page}) => {
  await setup(page);
  await page.goto('/publico');
  await expect(page.getByRole('alert')).toContainText('ainda não está disponível');
  await expect(page).toHaveURL(/\/publico$/);
});
test('representante solicita alterações da própria instituição sem acessar listas privadas', async ({page}) => {
  let payload;
  const calls = await setup(page,'representante_instituicao',(path,request) => {
    if (path === '/api/governanca/minha-instituicao') return {json:{versao:1,instituicao:{nomeFantasia:'Instituição Alfa',razaoSocial:'Alfa Ltda',cnpj:'12345678000100'},solicitacoes:[]}};
    if (path === '/api/governanca/minha-instituicao/solicitacoes') {payload=request.postDataJSON();return {json:{versao:1,solicitacao:{id:'s1'}}};}
  });
  await page.goto('/minha-instituicao');
  await page.getByLabel('Telefone',{exact:true}).fill('42999999999');
  await page.getByLabel('Justificativa da solicitação').fill('Atualização do contato');
  await page.getByRole('button',{name:'Solicitar alteração',exact:true}).click();
  await expect.poll(() => payload?.alteracoes?.telefone).toBe('42999999999');
  expect(calls.some(c => ['/api/instituicoes','/api/representantes','/api/reunioes'].includes(c.path))).toBe(false);
  await expect(page.getByRole('navigation',{name:'Menu principal'}).getByRole('link')).toHaveCount(2);
  await page.goto('/representantes/novo');
  await expect(page.getByRole('heading',{name:'Acesso indisponivel'})).toBeVisible();
});
test('diretoria cria evento em recurso separado de reuniões', async ({page}) => {
  let event;
  await setup(page,'diretoria',(path,request) => {
    if(path === '/api/governanca/eventos/configuracao') return {json:{versao:1}};
    if(path === '/api/governanca/eventos' && request.method() === 'POST') {event=request.postDataJSON();return {json:{versao:1,evento:{...event,id:'e1'}}};}
    if(path === '/api/governanca/eventos/e1') return {json:{versao:1,evento:{...event,id:'e1'}}};
  });
  await page.goto('/eventos/novo');
  await page.getByLabel('Título',{exact:true}).fill('Workshop CTI');
  await page.getByRole('combobox',{name:'Categoria',exact:true}).selectOption('workshop');
  await page.getByLabel('Data',{exact:true}).fill('2026-11-01');
  await page.getByLabel('Horário inicial').fill('10:00');
  await page.getByRole('combobox',{name:'Modalidade',exact:true}).selectOption('presencial');
  await page.getByLabel('Organização responsável').fill('Fórum CTI');
  await page.getByRole('button',{name:'Salvar evento'}).click();
  await expect(page).toHaveURL(/\/eventos\/e1$/);
  expect(event.titulo).toBe('Workshop CTI');
});
test('check-in só confirma após sucesso do servidor e preserva erro de duplicidade', async ({page}) => {
  let confirmed = false;
  await setup(page,null,(path,request) => {
    if(path !== '/api/governanca/checkin/token-teste') return null;
    if(request.method() === 'POST') return confirmed ? {json:{versao:1,presenca:{horarioCheckin:'2026-10-10T12:00:00Z'}}} : {status:409,json:{erro:{mensagem:'Presença já registrada.'}}};
    return {json:{versao:1,aberto:true,permiteConvidados:true,atividade:{titulo:'Workshop CTI',data:'2026-10-10'},instituicoes:[]}};
  });
  await page.goto('/checkin/token-teste');
  await page.getByLabel('Nome completo',{exact:true}).fill('Ana Teste');
  await page.getByLabel('Assinatura: digite seu nome completo').fill('Ana Teste');
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Confirmar minha presença'}).click();
  await expect(page.getByRole('alert')).toHaveText('Presença já registrada.');
  await expect(page.getByRole('heading',{name:'Presença confirmada'})).toHaveCount(0);
  confirmed=true;
  await page.getByRole('button',{name:'Confirmar minha presença'}).click();
  await expect(page.getByRole('heading',{name:'Presença confirmada'})).toBeVisible();
});
test('check-in fechado não oferece confirmação', async ({page}) => {
  await setup(page,null,path => path.includes('/checkin/') ? {json:{versao:1,aberto:false,atividade:{titulo:'Atividade encerrada'}}} : null);
  await page.goto('/checkin/encerrado');
  await expect(page.getByText('O período de check-in está encerrado ou ainda não começou.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Confirmar minha presença'})).toHaveCount(0);
});

test('aprovação exige confirmação e preserva solicitação quando servidor recusa', async ({page}) => {
  let decisions=0;
  await setup(page,'diretoria',(path,request) => {
    if(path === '/api/governanca/solicitacoes') return {json:{versao:1,dados:[{id:'s1',instituicaoNome:'Instituição Alfa',tipo:'alteracao_cadastral',status:'pendente',alteracoes:{telefone:'42999999999'},versaoRegistro:3}]}};
    if(path.endsWith('/decisao') && request.method() === 'POST') { decisions++; return {status:409,json:{erro:{mensagem:'Solicitação foi alterada. Atualize a página.'}}}; }
  });
  await page.goto('/solicitacoes');
  await page.getByRole('button',{name:'Aprovar',exact:true}).click();
  expect(decisions).toBe(0);
  await page.getByLabel('Parecer').fill('Documentação conferida');
  await page.getByRole('button',{name:'Confirmar decisão'}).click();
  await expect(page.getByRole('alert')).toHaveText('Solicitação foi alterada. Atualize a página.');
  expect(decisions).toBe(1);
  await expect(page.getByText('alteracao_cadastral · pendente')).toBeVisible();
});

test('upload envia multipart e só anuncia recebimento após confirmação', async ({page}) => {
  let uploaded=false;
  await setup(page,'representante_instituicao',(path,request) => {
    if(path === '/api/governanca/minha-instituicao') return {json:{versao:1,instituicao:{nomeFantasia:'Alfa'},solicitacoes:[]}};
    if(path.endsWith('/documentos')) {
      if(request.method() === 'POST') {
        expect(request.headers()['content-type']).toContain('multipart/form-data; boundary=');
        uploaded=true;
        return {json:{versao:1,documento:{id:'doc1'}}};
      }
      return {json:{versao:1,podeEnviar:true,dados:uploaded ? [{id:'doc1',nome:'logo.png',tipo:'logo',status:'em_analise',versaoArquivo:1}] : []}};
    }
  });
  await page.goto('/minha-instituicao');
  await page.locator('input[type=file]').setInputFiles({name:'logo.png',mimeType:'image/png',buffer:Buffer.from('arquivo de teste')});
  await page.getByRole('button',{name:'Enviar arquivo'}).click();
  await expect(page.getByRole('status').filter({hasText:'Arquivo recebido.'})).toBeVisible();
  await expect(page.getByText('logo.png · logo · versão 1 · em_analise')).toBeVisible();
  expect(uploaded).toBe(true);
});
