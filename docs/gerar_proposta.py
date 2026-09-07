from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET

DEST = Path(__file__).parent / 'Proposta-de-tabelas-Ecossistema-de-Inovacao.docx'
parts = []

def p(text, style=None):
    props = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>' if style else ''
    parts.append(f'<w:p>{props}<w:r><w:t xml:space="preserve">{escape(text)}</w:t></w:r></w:p>')

def table(rows):
    xml = '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>'
    for edge in ['top','left','bottom','right','insideH','insideV']:
        xml += f'<w:{edge} w:val="single" w:sz="4" w:color="D6D6D6"/>'
    xml += '</w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="3400"/><w:gridCol w:w="5900"/></w:tblGrid>'
    for n, row in enumerate(rows):
        xml += '<w:tr>' + ('<w:trPr><w:tblHeader/></w:trPr>' if n == 0 else '')
        for cell in row:
            xml += '<w:tc><w:tcPr>' + ('<w:shd w:fill="EFE5F7"/>' if n == 0 else '') + '</w:tcPr><w:p><w:r>'
            xml += ('<w:rPr><w:b/></w:rPr>' if n == 0 else '') + f'<w:t>{escape(cell)}</w:t></w:r></w:p></w:tc>'
        xml += '</w:tr>'
    parts.append(xml + '</w:tbl>')

p('Ecossistema de Inovação', 'Title')
p('Proposta inicial de tabelas para o backend', 'Subtitle')
p('Documento para alinhamento com a equipe responsável • Versão 1.0 • 06/09/2026')
p('1. Objetivo e escopo', 'Heading1')
p('Organizar os dados necessários às telas de login, dashboard, instituições, cadastro, edição, detalhes e relatórios apresentadas no protótipo. O desenvolvimento atual contempla apenas o frontend, com dados demonstrativos e armazenamento local de instituições. Este documento é uma proposta para discussão, não um esquema de banco já implementado.')
p('As tabelas de representantes, reuniões e presenças são preliminares: seus fluxos completos ainda precisam ser validados. Os nomes e campos abaixo podem ser ajustados conforme as decisões da equipe de backend.')
p('2. Convenções sugeridas', 'Heading1')
p('• id: chave primária; campos terminados em _id: chaves estrangeiras. A equipe deve padronizar UUID ou identificador numérico.')
p('• CNPJ, telefone e CEP: texto, preservando zeros à esquerda. Normalizar CNPJ e CEP para comparação e validação.')
p('• Datas de fundação e início/fim de vínculo: data. Eventos, criação e atualização: data/hora com política de fuso horário definida.')
p('• Campos apresentados são uma lista inicial. Obrigatoriedade, índices, valores de status e regras de exclusão devem ser definidos no esquema final.')
p('3. Tabelas propostas', 'Heading1')

items = [
('usuarios', 'Acesso ao sistema e identificação dos responsáveis por alterações.', [('id','Chave primária'),('nome, email','Identificação; e-mail único'),('senha_hash','Hash da senha; nunca armazenar a senha em texto puro'),('perfil, ativo','Perfil de acesso e habilitação do usuário'),('criado_em, atualizado_em','Datas de controle')]),
('instituicoes', 'Cadastro central das instituições do ecossistema.', [('id','Chave primária'),('nome, cnpj','Identificação; CNPJ único'),('data_fundacao, status','Fundação e situação: ativa ou inativa'),('email, telefone, site','Contatos institucionais'),('tipo_instituicao_id','FK para tipos_instituicao'),('area_atuacao_id','FK para areas_atuacao; área principal'),('descricao','Descrição com limite de 500 caracteres, conforme o protótipo'),('criado_em, atualizado_em','Datas de controle'),('criado_por, atualizado_por','FKs para usuarios')]),
('enderecos_instituicoes', 'Endereço cadastral de cada instituição.', [('id','Chave primária'),('instituicao_id','FK para instituicoes; único se houver apenas um endereço por instituição'),('logradouro, numero, bairro','Localização; número como texto para permitir “s/n”'),('cidade, estado, cep, complemento','Demais dados do endereço')]),
('tipos_instituicao', 'Catálogo de tipos para classificação e filtros.', [('id','Chave primária'),('nome, ativo','Nome único e disponibilidade no cadastro')]),
('areas_atuacao', 'Catálogo de áreas como Educação, Tecnologia e Saúde.', [('id','Chave primária'),('nome, ativo','Nome único e disponibilidade no cadastro')]),
('representantes', 'Pessoas que representam as instituições.', [('id','Chave primária'),('nome, email, telefone','Identificação e contato'),('status','Situação do representante'),('criado_em, atualizado_em','Datas de controle')]),
('instituicao_representantes', 'Vínculo entre uma pessoa e a instituição que representa.', [('id','Chave primária'),('instituicao_id','FK para instituicoes'),('representante_id','FK para representantes'),('cargo','Cargo ou função na instituição'),('data_inicio, data_fim, ativo','Vigência e situação do vínculo')]),
('reunioes', 'Agenda, local e informações dos encontros.', [('id','Chave primária'),('titulo, descricao','Identificação e objetivo'),('inicio_em, fim_em','Data e horário de início e encerramento'),('local, endereco','Localização da reunião'),('status','Situação da reunião; valores a definir'),('criado_por, criado_em, atualizado_em','FK para usuarios e datas de controle')]),
('reuniao_participantes', 'Convites, confirmações e presença, mantendo a instituição representada.', [('id','Chave primária'),('reuniao_id','FK para reunioes'),('instituicao_representante_id','FK para instituicao_representantes'),('status_confirmacao, confirmado_em','Resposta ao convite e data/hora da confirmação'),('status_presenca, entrada_em','Situação de presença e horário de entrada'),('registrado_por','FK para usuarios; responsável pelo registro')]),
('documentos_instituicoes', 'Metadados dos arquivos anexados às instituições.', [('id','Chave primária'),('instituicao_id','FK para instituicoes'),('nome, caminho_arquivo','Nome exibido e chave/localização no serviço de armazenamento'),('tipo_mime, tamanho_bytes','Tipo e tamanho do arquivo'),('enviado_por, enviado_em','FK para usuarios e data/hora do envio')]),
('notificacoes', 'Avisos apresentados no sino para cada usuário.', [('id','Chave primária'),('usuario_id','FK para usuarios; destinatário'),('titulo, mensagem, link_destino','Conteúdo e destino interno do aviso'),('criado_em, lido_em','Criação e leitura; lido_em nulo indica não lida')]),
('recuperacoes_senha', 'Solicitações de redefinição de senha.', [('id','Chave primária'),('usuario_id','FK para usuarios'),('token_hash','Hash do token de recuperação'),('criado_em, expira_em, utilizado_em','Criação, validade e utilização; token de uso único')]),
('logs_auditoria', 'Histórico das ações sobre os cadastros.', [('id','Chave primária'),('usuario_id','FK para usuarios; autor da ação'),('entidade, registro_id, acao','Tabela/entidade, registro afetado e operação realizada'),('alteracoes','Mudanças relevantes; formato a definir, por exemplo JSON'),('criado_em','Data/hora da ação')]),
]
for idx, (name, purpose, fields) in enumerate(items, 1):
    p(f'3.{idx}. {name}', 'Heading2')
    p(purpose)
    table([('Campo(s)', 'Descrição / regra')] + fields)

p('4. Relacionamentos principais', 'Heading1')
for line in [
    'tipos_instituicao 1 → N instituicoes; areas_atuacao 1 → N instituicoes (uma área principal por instituição).',
    'instituicoes 1 → 0..1 enderecos_instituicoes, na proposta de um único endereço cadastral.',
    'instituicoes N ↔ N representantes, por meio de instituicao_representantes.',
    'reunioes 1 → N reuniao_participantes; instituicao_representantes 1 → N reuniao_participantes.',
    'instituicoes 1 → N documentos_instituicoes.',
    'usuarios 1 → N notificacoes, recuperacoes_senha e logs_auditoria.',
    'Campos criado_por, atualizado_por, enviado_por e registrado_por apontam para usuarios.',
]: p('• ' + line)
p('5. Regras e decisões pendentes', 'Heading1')
for line in [
    'Impedir e-mails de acesso e CNPJs duplicados. Definir se representantes podem compartilhar e-mail.',
    'Impedir duplicidade do par reuniao_id + instituicao_representante_id. Definir se a mesma pessoa pode representar duas instituições no mesmo encontro.',
    'Preservar os vínculos históricos quando um representante trocar de instituição. Encerrar o vínculo antigo em vez de alterar sua instituição.',
    'Definir se há múltiplas áreas de atuação. Se houver, incluir instituicao_areas_atuacao como tabela de associação.',
    'Definir os perfis e permissões. Se forem configuráveis, substituir o campo simples de perfil por tabelas de perfis, permissões e vínculos.',
    'Decidir a política de exclusão. A exclusão definitiva indicada no protótipo deve ser conciliada com a preservação dos registros de presença e auditoria; considerar exclusão lógica e restrições de chave estrangeira.',
    'Distinguir confirmação de participação e presença efetiva. Confirmado não significa presente.',
    'Definir como o check-in será feito e se haverá saída ou presença parcial. QR Code com tokens próprios pode exigir uma tabela adicional.',
    'Definir regras de envio de notificações e recuperação de senha. O frontend atual não envia e-mails.',
    'Armazenar arquivos fora do banco e manter os metadados em documentos_instituicoes. Definir limites, formatos e permissões de download.',
    'Não registrar senhas, tokens ou segredos nos logs de auditoria.',
]: p('• ' + line)
p('6. Dashboard e relatórios', 'Heading1')
p('Não é necessária uma tabela própria para o dashboard ou para relatórios gerados sob demanda inicialmente. Os resultados podem ser calculados por consultas aos cadastros, reuniões e participantes. Se for necessário manter histórico de exportações, geração assíncrona ou arquivos gerados, a equipe poderá acrescentar uma tabela de exportacoes_relatorios.')
table([('Indicador / informação', 'Origem e definição pendente'), ('Instituições ativas', 'Contagem de instituicoes com status ativo.'), ('Representações', 'Definir se conta pessoas distintas ou vínculos ativos.'), ('Média de presença', 'Definir numerador, denominador, reuniões elegíveis e tratamento de cancelamentos e justificativas.'), ('Evolução mensal', 'Agregar presença por mês usando a fórmula acordada.'), ('Participação por instituição', 'Agrupar participantes pelo vínculo institucional; definir período e critério de ranking.'), ('Próximas reuniões', 'Reuniões futuras, ordenadas por inicio_em, com confirmações agregadas.'), ('Última participação', 'Reunião mais recente com presença registrada para a instituição.')])
p('Os relatórios devem respeitar instituição, tipo e período selecionados. No frontend demonstrativo atual, a exportação usa impressão para PDF e CSV compatível com Excel; a exportação XLSX nativa mostrada no protótipo ainda deve ser implementada.')
p('7. Próximo alinhamento com a equipe', 'Heading1')
p('Validar esta proposta; definir obrigatoriedade dos campos e regras de negócio; confirmar as telas dos demais módulos; estabelecer o contrato da API (rotas, payloads, paginação, filtros, erros e autenticação). O frontend pode continuar sendo desenvolvido com mocks enquanto essas definições são feitas.')

ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
document = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="{ns}"><w:body>' + ''.join(parts) + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>'
styles = f'''<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="{ns}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120"/></w:pPr></w:pPrDefault></w:docDefaults>'''
for key, size in [('Title',36),('Subtitle',28),('Heading1',28),('Heading2',24)]:
    styles += f'<w:style w:type="paragraph" w:styleId="{key}"><w:name w:val="{key}"/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="120"/></w:pPr><w:rPr><w:b/><w:color w:val="51068A"/><w:sz w:val="{size}"/></w:rPr></w:style>'
styles += '</w:styles>'
files = {
    '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/_rels/document.xml.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'word/document.xml': document,
    'word/styles.xml': styles,
}
with ZipFile(DEST, 'w', ZIP_DEFLATED) as archive:
    for name, content in files.items():
        ET.fromstring(content)
        archive.writestr(name, content.encode('utf-8'))
with ZipFile(DEST) as archive:
    assert archive.testzip() is None
    root = ET.fromstring(archive.read('word/document.xml'))
    assert len(root.findall(f'.//{{{ns}}}tbl')) == 14
print(f'Arquivo gerado e estrutura validada: {DEST}')
