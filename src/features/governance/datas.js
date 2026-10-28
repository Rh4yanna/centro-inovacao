export function formatarData(value, comHora = false) {
  if (!value) return 'Não informado';
  const texto = String(value);
  // Datas civis não devem mudar de dia por causa do fuso horário.
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(texto) ? `${texto}T12:00:00` : texto);
  if (Number.isNaN(date.getTime())) return 'Data inválida';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    ...(comHora && texto.includes('T') ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}
