export function exportarCsv(nome, rows) {
  const csv = '\ufeff' + rows.map(row => row.map(value => '"' + String(value ?? '').replace(/^[\s]*[=+@-]/, "'$&").replaceAll('"', '""') + '"').join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = nome; link.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
}
export function imprimirTabela(title, rows) {
  const frame = document.createElement('iframe'); frame.title = 'Impressão do relatório'; frame.style.cssText = 'position:fixed;width:0;height:0;border:0'; document.body.append(frame);
  const doc = frame.contentDocument;
  const heading = doc.createElement('h1'); heading.textContent = title; doc.body.append(heading);
  const style = doc.createElement('style'); style.textContent = 'body{font:12px Arial}table{border-collapse:collapse;width:100%}td{border:1px solid #bbb;padding:6px;overflow-wrap:anywhere}'; doc.head.append(style);
  const table = doc.createElement('table');
  for(const row of rows) {const tr=doc.createElement('tr'); for(const value of row) {const td=doc.createElement('td');td.textContent=String(value ?? '');tr.append(td);} table.append(tr);}
  doc.body.append(table); frame.contentWindow.focus(); frame.contentWindow.print(); setTimeout(()=>frame.remove(),60000);
}
