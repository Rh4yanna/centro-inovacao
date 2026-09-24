import { test, expect } from '@playwright/test';
async function mockApi(page, role = 'leitura') {
  await page.route('**/api/**', async route => {
    const p = new URL(route.request().url()).pathname;
    if (!p.startsWith('/api/')) return route.continue();
    let data = {dados:[]};
    if(p === '/api/sessao') {
      if(!role) return route.fulfill({status:401,json:{erro:{mensagem:'Sem sessão'}}});
      data = {id:'u1',nome:'Usuário de teste',papel:role,menu:['dashboard','instituicoes','representantes','reunioes','presencas'].map(v=>({href:`/${v}`,rotulo:v}))};
    }
    if(p === '/api/dominios') data = {tiposInstituicao:[],areasAtuacao:[],statusInstituicao:[]};
    if(p === '/api/reunioes') data = {dados:[{id:'r1',titulo:'Encontro de teste',data:'2026-09-24',horaInicio:'10:00',local:'Auditório',status:'encerrada'}]};
    if(p.endsWith('/participantes')) data = {dados:[{presencaId:'p1',nome:'Ana Teste',pessoaId:'ana',instituicao:'Instituição Alfa',instituicaoId:'alfa',tipo:'representante',statusPresenca:'presente'},{presencaId:'p2',nome:'Bruno Teste',pessoaId:'bruno',instituicao:'Instituição Beta',instituicaoId:'beta',tipo:'convidado',statusPresenca:'ausente'}]};
    return route.fulfill({json:data});
  });
}
test('sem sessão redireciona e recuperação tem endereço próprio', async ({page})=>{
  await mockApi(page,null);await page.goto('/presencas');await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('button',{name:/Esqueceu/}).click();await expect(page).toHaveURL(/\/esqueci-senha$/);
  await page.getByRole('button',{name:/Voltar para o login/}).click();await expect(page).toHaveURL(/\/login$/);
});
test('consulta não vê cadastro nem acessa formulário por URL',async({page})=>{
  await mockApi(page);await page.goto('/representantes');await expect(page.getByRole('heading',{name:'Representantes',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:/Adicionar representante/})).toHaveCount(0);
  await page.goto('/representantes/novo');await expect(page.getByRole('heading',{name:'Acesso indisponivel'})).toBeVisible();
});
test('gestor tem formulário disponível',async({page})=>{
  await mockApi(page,'gestor');await page.goto('/representantes/novo');await expect(page.getByRole('heading',{name:'Adicionar representante'})).toBeVisible();
});
test('presenças filtra status, instituição e convidado; página cabe na tela',async({page})=>{
  await mockApi(page);await page.goto('/presencas');await expect(page.getByRole('cell',{name:'Ana Teste',exact:true})).toBeVisible();
  await page.getByRole('combobox',{name:'Presença',exact:true}).selectOption('convidado');await expect(page.getByRole('cell',{name:'Ana Teste',exact:true})).toHaveCount(0);await expect(page.getByRole('cell',{name:'Bruno Teste',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Limpar filtros'}).click();await page.getByRole('combobox',{name:'Instituição',exact:true}).selectOption('Instituição Alfa');await expect(page.getByRole('cell',{name:'Bruno Teste',exact:true})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
async function representativeApi(page, role, deleteStatus) {
  await mockApi(page, role);
  let deleted = false;
  let calls = 0;
  const person = {id:'teste',nome:'Representante Teste',vinculos:[]};
  await page.route('**/api/representantes**', async route => {
    const req = route.request();
    if(req.method() === 'DELETE') {
      calls++;
      if(deleteStatus === 204) {deleted = true; return route.fulfill({status:204});}
      return route.fulfill({status:deleteStatus,json:{erro:{mensagem:'Método não permitido'}}});
    }
    const path = new URL(req.url()).pathname;
    return route.fulfill({json:path.endsWith('/teste') ? person : {dados:deleted ? [] : [person]}});
  });
  return () => calls;
}
test('exclusão exige confirmação e mantém cadastro se backend não suporta', async ({page}) => {
  const calls = await representativeApi(page,'administrador',405);
  await page.goto('/representantes/teste');
  await page.getByRole('button',{name:'Excluir representante',exact:true}).click();
  expect(calls()).toBe(0);
  await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  expect(calls()).toBe(0);
  await page.getByRole('button',{name:'Excluir representante',exact:true}).click();
  await page.getByRole('button',{name:'Confirmar exclusão'}).click();
  await expect(page.getByRole('alert')).toContainText('A API não disponibilizou');
  await expect(page).toHaveURL(/\/representantes\/teste$/);
  expect(calls()).toBe(1);
});
test('exclusão bem sucedida retorna à lista sem o representante',async({page})=>{
  const calls=await representativeApi(page,'administrador',204);
  await page.goto('/representantes/teste');
  await page.getByRole('button',{name:'Excluir representante',exact:true}).click();
  await page.getByRole('button',{name:'Confirmar exclusão'}).click();
  await expect(page).toHaveURL(/\/representantes$/);
  await expect(page.getByText('Nenhum representante encontrado.')).toBeVisible();
  expect(calls()).toBe(1);
});
test('gestor não pode ver botão de exclusão de representante',async({page})=>{
  await representativeApi(page,'gestor',204);
  await page.goto('/representantes/teste');
  await expect(page.getByRole('heading',{name:'Representante Teste',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Excluir representante',exact:true})).toHaveCount(0);
});
