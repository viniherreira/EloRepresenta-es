// ── STATE ──
const db = {
  clientes: JSON.parse(localStorage.getItem('elo_clientes') || '[]'),
  importadoras: JSON.parse(localStorage.getItem('elo_importadoras') || '[]'),
  pedidos: JSON.parse(localStorage.getItem('elo_pedidos') || '[]'),
};

let itemCount = 0;
let vencCount = 0;

function save(key) { localStorage.setItem('elo_' + key, JSON.stringify(db[key])); }

// ── NAVIGATION ──
const pageTitles = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  importadoras: 'Importadoras',
  pedidos: 'Romaneios',
  'novo-pedido': 'Novo Romaneio',
};

function showPage(id, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.getElementById('page-title').textContent = pageTitles[id] || id;
  if (navEl) navEl.classList.add('active');
  if (id === 'dashboard') renderDashboard();
  if (id === 'clientes') renderClientes();
  if (id === 'importadoras') renderImportadoras();
  if (id === 'pedidos') renderPedidos();
  if (id === 'novo-pedido') initNovoPedido();
}

// ── TOAST ──
function toast(msg, type = '') {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── MODAL ──
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

// ── FORMAT ──
function fmtCurrency(v) {
  return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return d + '/' + m + '/' + y;
}

// ── DASHBOARD ──
function renderDashboard() {
  document.getElementById('stat-pedidos').textContent = db.pedidos.length;
  document.getElementById('stat-clientes').textContent = db.clientes.length;
  document.getElementById('stat-importadoras').textContent = db.importadoras.length;
  const last = db.pedidos[db.pedidos.length - 1];
  document.getElementById('stat-ultimo').textContent = last ? last.numero : '—';

  const cont = document.getElementById('dash-recent');
  if (!db.pedidos.length) {
    cont.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><h3>Nenhum romaneio emitido</h3><p>Crie o primeiro romaneio para começar.</p></div>';
    return;
  }
  const recent = [...db.pedidos].reverse().slice(0, 5);
  cont.innerHTML = '<table><thead><tr><th>Nº</th><th>Data</th><th>Cliente</th><th>Fornecedor</th><th>Valor Total</th></tr></thead><tbody>' +
    recent.map(p => `<tr><td><span class="badge badge-purple">${p.numero}</span></td><td>${fmtDate(p.data)}</td><td>${p.cliente}</td><td>${p.fornecedor}</td><td style="font-weight:600">${fmtCurrency(p.total)}</td></tr>`).join('') +
    '</tbody></table>';
}

// ── CLIENTES ──
function saveCliente() {
  const emails = [...document.querySelectorAll('.cli-email')].map(e => e.value).filter(Boolean);
  const tipo = document.querySelector('input[name="cli-tipo"]:checked')?.value || 'PF';
  const obj = {
    id: Date.now(),
    nome: document.getElementById('cli-nome').value,
    apelido: document.getElementById('cli-apelido').value,
    fantasia: document.getElementById('cli-fantasia').value,
    tipo,
    doc: document.getElementById('cli-doc').value,
    ie: document.getElementById('cli-ie').value,
    situacao: document.getElementById('cli-situacao').value,
    endereco: document.getElementById('cli-endereco').value,
    cidade: document.getElementById('cli-cidade').value,
    estado: document.getElementById('cli-estado').value,
    cep: document.getElementById('cli-cep').value,
    tel: document.getElementById('cli-tel').value,
    cel: document.getElementById('cli-cel').value,
    transp: document.getElementById('cli-transp').value,
    emails,
  };
  if (!obj.nome) { toast('Informe o nome do cliente.'); return; }
  db.clientes.push(obj);
  save('clientes');
  closeModal('modal-cliente');
  renderClientes();
  toast('Cliente salvo!', 'success');
}

function renderClientes() {
  const tbody = document.getElementById('tbody-clientes');
  if (!db.clientes.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="padding:0"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg><h3>Nenhum cliente cadastrado</h3><p>Clique em "Novo Cliente" para adicionar.</p></div></td></tr>';
    return;
  }
  const sitBadge = s => s === 'Ativo' ? 'badge-green' : s === 'Inativo' ? 'badge-yellow' : 'badge-red';
  tbody.innerHTML = db.clientes.map((c, i) => `
    <tr>
      <td><strong>${c.nome}</strong></td>
      <td>${c.apelido}</td>
      <td><span class="badge badge-blue">${c.tipo}</span></td>
      <td><code style="font-size:12px">${c.doc}</code></td>
      <td>${c.cidade}${c.estado ? ' – ' + c.estado : ''}</td>
      <td>${c.cel || c.tel}</td>
      <td><span class="badge ${sitBadge(c.situacao)}">${c.situacao}</span></td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteItem('clientes',${i})">✕</button></td>
    </tr>`).join('');
}

// ── IMPORTADORAS ──
function saveImportadora() {
  const obj = {
    id: Date.now(),
    apelido: document.getElementById('imp-apelido').value,
    nome: document.getElementById('imp-nome').value,
    fantasia: document.getElementById('imp-fantasia').value,
    cnpj: document.getElementById('imp-cnpj').value,
    cpf: document.getElementById('imp-cpf').value,
    pix: document.getElementById('imp-pix').value,
    banco: document.getElementById('imp-banco').value,
    agencia: document.getElementById('imp-agencia').value,
    tipoConta: document.getElementById('imp-tipo-conta').value,
    conta: document.getElementById('imp-conta').value,
    comissao: document.getElementById('imp-comissao').value,
    fatorX: document.getElementById('imp-fatorx').value,
  };
  if (!obj.apelido && !obj.nome) { toast('Informe o nome da importadora.'); return; }
  db.importadoras.push(obj);
  save('importadoras');
  closeModal('modal-importadora');
  renderImportadoras();
  toast('Importadora salva!', 'success');
}

function renderImportadoras() {
  const tbody = document.getElementById('tbody-importadoras');
  if (!db.importadoras.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="padding:0"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg><h3>Nenhuma importadora cadastrada</h3><p>Clique em "Nova Importadora" para adicionar.</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = db.importadoras.map((imp, i) => `
    <tr>
      <td><strong>${imp.apelido}</strong></td>
      <td>${imp.fantasia || imp.nome}</td>
      <td><code style="font-size:12px">${imp.cnpj}</code></td>
      <td>${imp.banco}</td>
      <td>${imp.pix}</td>
      <td>${imp.comissao ? imp.comissao + '%' : '—'}</td>
      <td>${imp.fatorX || '1'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteItem('importadoras',${i})">✕</button></td>
    </tr>`).join('');
}

// ── PEDIDOS ──
function renderPedidos() {
  const tbody = document.getElementById('tbody-pedidos');
  if (!db.pedidos.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="padding:0"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg><h3>Nenhum romaneio emitido</h3><p>Clique em "Novo Romaneio" para criar.</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = [...db.pedidos].reverse().map((p, i) => `
    <tr>
      <td><span class="badge badge-purple">${p.numero}</span></td>
      <td>${fmtDate(p.data)}</td>
      <td>${p.cliente}</td>
      <td>${p.fornecedor}</td>
      <td>${p.nf}</td>
      <td style="font-weight:600">${fmtCurrency(p.total)}</td>
      <td>${p.transporte}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="verRomaneio(${db.pedidos.length - 1 - i})">Ver PDF</button>
      </td>
    </tr>`).join('');
}

// ── NOVO PEDIDO ──
function initNovoPedido() {
  itemCount = 0; vencCount = 0;
  document.getElementById('items-tbody').innerHTML = '';
  document.getElementById('vencimentos-list').innerHTML = '';
  document.getElementById('ped-data').value = new Date().toISOString().split('T')[0];
  document.getElementById('ped-numero').value = String(db.pedidos.length + 1).padStart(5, '0');

  // populate selects
  const cs = document.getElementById('ped-cliente');
  cs.innerHTML = '<option value="">— Selecione o cliente —</option>' +
    db.clientes.map(c => `<option value="${c.nome}">${c.apelido || c.nome}</option>`).join('');
  const fs = document.getElementById('ped-fornecedor');
  fs.innerHTML = '<option value="">— Selecione a importadora —</option>' +
    db.importadoras.map(imp => `<option value="${imp.apelido || imp.nome}">${imp.apelido || imp.nome}</option>`).join('');

  addItem();
}

function addItem() {
  itemCount++;
  const id = itemCount;
  const tr = document.createElement('tr');
  tr.id = 'item-row-' + id;
  tr.innerHTML = `
    <td><input type="number" placeholder="0" min="0" step="1" onchange="calcRow(${id})" id="it-qty-${id}"></td>
    <td>
      <select id="it-unid-${id}">
        <option>DZ</option><option>UN</option><option>PC</option><option>KG</option><option>CX</option><option>PAR</option><option>M</option>
      </select>
    </td>
    <td><input type="text" placeholder="Ref." id="it-ref-${id}"></td>
    <td><input type="text" placeholder="Nome do produto" id="it-prod-${id}"></td>
    <td><input type="number" placeholder="0" min="0" max="100" step="0.1" onchange="calcRow(${id})" id="it-desc-${id}"></td>
    <td><input type="number" placeholder="0.00" min="0" step="0.01" onchange="calcRow(${id})" id="it-preco-${id}"></td>
    <td class="total-cell" id="it-total-${id}">R$ 0,00</td>
    <td><button class="remove-row" onclick="removeItem(${id})">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button></td>`;
  document.getElementById('items-tbody').appendChild(tr);
}

function removeItem(id) {
  document.getElementById('item-row-' + id)?.remove();
  calcTotals();
}

function calcRow(id) {
  const qty = parseFloat(document.getElementById('it-qty-' + id)?.value) || 0;
  const price = parseFloat(document.getElementById('it-preco-' + id)?.value) || 0;
  const desc = parseFloat(document.getElementById('it-desc-' + id)?.value) || 0;
  const subtotal = qty * price;
  const discount = subtotal * desc / 100;
  const total = subtotal - discount;
  const cell = document.getElementById('it-total-' + id);
  if (cell) cell.textContent = fmtCurrency(total);
  calcTotals();
}

function calcTotals() {
  let subtotal = 0, desconto = 0;
  for (let i = 1; i <= itemCount; i++) {
    const row = document.getElementById('item-row-' + i);
    if (!row) continue;
    const qty = parseFloat(document.getElementById('it-qty-' + i)?.value) || 0;
    const price = parseFloat(document.getElementById('it-preco-' + i)?.value) || 0;
    const desc = parseFloat(document.getElementById('it-desc-' + i)?.value) || 0;
    const sub = qty * price;
    subtotal += sub;
    desconto += sub * desc / 100;
  }
  const total = subtotal - desconto;
  document.getElementById('tot-subtotal').textContent = fmtCurrency(subtotal);
  document.getElementById('tot-desconto').textContent = fmtCurrency(desconto);
  document.getElementById('tot-total').textContent = fmtCurrency(total);
}

function addVencimento() {
  vencCount++;
  const div = document.createElement('div');
  div.className = 'venc-item';
  div.id = 'venc-' + vencCount;
  div.innerHTML = `
    <span class="venc-label">Parcela ${vencCount}</span>
    <input type="text" class="field venc-input" placeholder="Ex: 30 dias" style="padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13.5px;outline:none">
    <input type="date" class="field" style="padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13.5px;outline:none">
    <input type="number" class="field venc-val" placeholder="R$ 0,00" style="padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13.5px;outline:none">
    <button class="remove-row" onclick="this.parentElement.remove()">✕</button>`;
  document.getElementById('vencimentos-list').appendChild(div);
}

function collectItems() {
  const items = [];
  for (let i = 1; i <= itemCount; i++) {
    const row = document.getElementById('item-row-' + i);
    if (!row) continue;
    const qty = document.getElementById('it-qty-' + i)?.value;
    if (!qty) continue;
    items.push({
      qty: parseFloat(qty) || 0,
      unid: document.getElementById('it-unid-' + i)?.value,
      ref: document.getElementById('it-ref-' + i)?.value,
      produto: document.getElementById('it-prod-' + i)?.value,
      desc: parseFloat(document.getElementById('it-desc-' + i)?.value) || 0,
      preco: parseFloat(document.getElementById('it-preco-' + i)?.value) || 0,
      total: (parseFloat(document.getElementById('it-qty-' + i)?.value) || 0) * (parseFloat(document.getElementById('it-preco-' + i)?.value) || 0) * (1 - (parseFloat(document.getElementById('it-desc-' + i)?.value) || 0) / 100),
    });
  }
  return items;
}

function collectVencimentos() {
  const venc = [];
  document.querySelectorAll('[id^="venc-"]').forEach(div => {
    const inputs = div.querySelectorAll('input');
    if (inputs[0] && inputs[0].value) {
      venc.push({ prazo: inputs[0].value, data: inputs[1]?.value, valor: inputs[2]?.value });
    }
  });
  return venc;
}

function buildPedidoObj() {
  const items = collectItems();
  let subtotal = 0, desconto = 0;
  items.forEach(it => {
    const sub = it.qty * it.preco;
    subtotal += sub;
    desconto += sub * it.desc / 100;
  });
  return {
    numero: document.getElementById('ped-numero').value,
    data: document.getElementById('ped-data').value,
    nf: document.getElementById('ped-nf').value,
    coleta: document.getElementById('ped-coleta').value,
    cliente: document.getElementById('ped-cliente').value,
    fornecedor: document.getElementById('ped-fornecedor').value,
    vendedor: document.getElementById('ped-vendedor').value,
    numImp: document.getElementById('ped-num-imp').value,
    transporte: document.getElementById('ped-transporte').value,
    obs: document.getElementById('ped-obs').value,
    items,
    vencimentos: collectVencimentos(),
    subtotal,
    desconto,
    total: subtotal - desconto,
  };
}

function savePedido() {
  const p = buildPedidoObj();
  if (!p.cliente) { toast('Selecione o cliente.'); return; }
  if (!p.items.length) { toast('Adicione pelo menos um item.'); return; }
  db.pedidos.push(p);
  save('pedidos');
  toast('Romaneio salvo!', 'success');
  showPage('pedidos', null);
}

// ── ROMANEIO HTML ──
function buildRomaneioHTML(p) {
  const itemRows = p.items.map(it => `
    <tr>
      <td style="text-align:center">${it.qty}</td>
      <td style="text-align:center">${it.unid}</td>
      <td>${it.ref}</td>
      <td>${it.produto}</td>
      <td style="text-align:center">${it.desc ? it.desc + '%' : '—'}</td>
      <td style="text-align:right">${fmtCurrency(it.preco)}</td>
      <td style="text-align:right;font-weight:600">${fmtCurrency(it.total)}</td>
    </tr>`).join('');

  const vencRows = p.vencimentos?.map(v => `VENCIMENTO: ${v.prazo} - ${fmtDate(v.data)} - ${fmtCurrency(v.valor)}`).join('\n') || '';

  const imp = db.importadoras.find(i => (i.apelido || i.nome) === p.fornecedor) || {};
  const obsLines = [
    vencRows,
    imp.nome ? imp.nome + (imp.fantasia ? ' / ' + imp.fantasia : '') : '',
    imp.banco ? imp.banco + (imp.agencia ? '  AG: ' + imp.agencia : '') + (imp.conta ? '  CC: ' + imp.conta : '') : '',
    imp.cnpj ? 'CNPJ: ' + imp.cnpj : '',
    p.obs,
  ].filter(Boolean).join('\n');

  return `
  <div class="romaneio-preview">
    <div class="rom-header">
      <div class="rom-logo-area">
        <div class="rom-logo-box">E</div>
        <div class="rom-logo-info">
          <strong style="font-size:14px;color:#1A0D20">Elo Representações</strong><br>
          e-mail: elorepresentacao25@gmail.com<br>
          fone: (11) 91281-7885 / (11) 98320-8065
        </div>
      </div>
      <div class="rom-number">
        <div class="label">Romaneio</div>
        <div class="value">${String(p.numero).padStart(5,'0')}</div>
      </div>
    </div>
    <table class="rom-meta-table">
      <tr><td>Data</td><td>${fmtDate(p.data)}</td><td>Coleta</td><td>${p.coleta}</td></tr>
      <tr><td>Cliente</td><td>${p.cliente}</td><td>Nota Fiscal</td><td>${p.nf}</td></tr>
      <tr><td>Fornecedor</td><td>${p.fornecedor}</td><td>Transporte</td><td>${p.transporte}</td></tr>
      <tr><td>Vendedor(a)</td><td>${p.vendedor}</td><td>Nº Pedido Imp.</td><td>${p.numImp}</td></tr>
    </table>
    <table class="rom-items">
      <thead>
        <tr>
          <th style="text-align:center">Quant</th>
          <th style="text-align:center">Unid</th>
          <th>Referência</th>
          <th>Produto</th>
          <th style="text-align:center">Desc</th>
          <th style="text-align:right">Preço</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class="rom-totals">
      <div class="rom-totals-box">
        <div class="rom-totals-row"><span>Valor</span><span>${fmtCurrency(p.subtotal)}</span></div>
        <div class="rom-totals-row"><span>Desconto</span><span>${fmtCurrency(p.desconto)}</span></div>
        <div class="rom-totals-row"><span>Imposto</span><span>—</span></div>
        <div class="rom-totals-row final"><span>VALOR TOTAL</span><span>${fmtCurrency(p.total)}</span></div>
      </div>
    </div>
    ${obsLines ? `<div class="rom-obs"><strong>OBSERVAÇÃO</strong><br><pre style="font-family:inherit;white-space:pre-wrap;font-size:12px;margin-top:8px">${obsLines}</pre></div>` : ''}
  </div>`;
}

function previewRomaneio() {
  const p = buildPedidoObj();
  document.getElementById('preview-content').innerHTML = buildRomaneioHTML(p);
  openModal('modal-preview');
}

function verRomaneio(idx) {
  const p = db.pedidos[idx];
  document.getElementById('preview-content').innerHTML = buildRomaneioHTML(p);
  openModal('modal-preview');
}

function gerarPDF() {
  const p = document.getElementById('preview-content').innerHTML || buildRomaneioHTML(buildPedidoObj());
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Romaneio</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0} body{font-family:'Poppins',sans-serif;background:#fff;color:#1A0D20}
    .romaneio-preview{padding:32px;max-width:800px;margin:0 auto}
    .rom-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
    .rom-logo-area{display:flex;align-items:center;gap:12px}
    .rom-logo-box{width:60px;height:52px;background:linear-gradient(135deg,#47263b,#e5d8af);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Poppins',sans-serif;font-weight:700;font-size:20px}
    .rom-logo-info{font-size:11px;color:#7a5f6e;line-height:1.8}
    .rom-number{text-align:right}.rom-number .label{font-size:10px;color:#7a5f6e;text-transform:uppercase;letter-spacing:.1em}
    .rom-number .value{font-size:26px;font-weight:700;color:#47263b;font-family:'Poppins',sans-serif;font-weight:700}
    .rom-meta-table{width:100%;border-collapse:collapse;margin-bottom:18px;border:1px solid #d9ccd2;border-radius:8px;overflow:hidden}
    .rom-meta-table td{padding:8px 12px;border-bottom:1px solid #d9ccd2;font-size:12.5px}
    .rom-meta-table td:first-child,.rom-meta-table td:nth-child(3){font-weight:600;background:#ede5e9}
    .rom-meta-table tr:last-child td{border-bottom:none}
    .rom-items{width:100%;border-collapse:collapse;margin-bottom:18px}
    .rom-items th{background:#47263b;color:#fff;padding:8px 10px;font-size:11.5px;text-align:left}
    .rom-items td{padding:8px 10px;border-bottom:1px solid #d9ccd2;font-size:12.5px}
    .rom-totals{display:flex;justify-content:flex-end;margin-bottom:20px}
    .rom-totals-box{width:260px}
    .rom-totals-row{display:flex;justify-content:space-between;padding:6px 12px;border-bottom:1px solid #d9ccd2;font-size:12.5px}
    .rom-totals-row.final{background:#47263b;color:#e5d8af;font-weight:700;font-size:13.5px}
    .rom-obs{border:1px solid #d9ccd2;border-radius:6px;padding:12px;font-size:11.5px;color:#7a5f6e}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>${p}<script>window.onload=()=>window.print()<\/script></body></html>`);
  win.document.close();
}

// ── DELETE ──
function deleteItem(key, idx) {
  if (!confirm('Remover este item?')) return;
  db[key].splice(idx, 1);
  save(key);
  if (key === 'clientes') renderClientes();
  if (key === 'importadoras') renderImportadoras();
  if (key === 'pedidos') renderPedidos();
  toast('Item removido.');
}

// ── FILTER ──
function filterTable(type) {
  const q = document.getElementById('search-' + type)?.value.toLowerCase() || '';
  const rows = document.querySelectorAll('#tbody-' + type + ' tr');
  rows.forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ── INIT ──
renderDashboard();
