/* Tab/subtab switching and per-section rendering. 4 sub-tabs:
   Overview · Adoption · Product & Search · Cart. */

function fmtNum(n) { return Number(n).toLocaleString(); }

function cardHeader(title, opts = {}) {
  const info = opts.info ? `<span class="info-icon" title="${opts.info}">i</span>` : '';
  const right = opts.filter
    ? `<button class="mini-filter-btn">${opts.filter} <span class="caret">&#9662;</span></button>`
    : `<span class="download-icon" title="Download">&#8681;</span>`;
  return `<div class="card-header-row"><div class="card-title">${title}${info}</div>${right}</div>`;
}

/* Inline table cell: a small bar (width = fillPct, scaled to the column max) + a value label.
   Cell content is inserted raw by renderTable (not escaped), so embedded markup is safe here. */
function barCell(text, fillPct) {
  const w = Math.max(3, Math.min(100, fillPct));
  return `<div class="bar-cell"><span class="bar-track"><span class="bar-fill" style="width:${w.toFixed(0)}%"></span></span><span class="bar-num">${text}</span></div>`;
}

function statCard(value, label, sub, highlight) {
  return `<div class="stat-card ${highlight ? 'highlight-card' : ''}">
    <div class="stat-card-value">${value}</div>
    <div class="stat-card-label">${label}</div>
    <div class="stat-card-sub">${sub}</div>
  </div>`;
}

function kpiRowHTML(kpi, highlight) {
  return `<div class="kpi-row ${highlight ? 'highlight' : ''}" data-key="${kpi.key}">
    <div class="kpi-main">
      <div class="kpi-label">${kpi.label}</div>
      <div class="kpi-value">${kpi.value}</div>
      <div class="kpi-delta ${kpi.good ? 'positive' : 'negative'}">${kpi.delta}</div>
    </div>
    <div class="kpi-sparkline">${renderSparkline(kpi.trend)}</div>
  </div>`;
}

/* Responsive HTML horizontal bar list (label · track · value). Text stays a fixed size at any width —
   unlike an SVG bar chart stretched to 100%, whose whole coordinate system (text included) scales up. */
function barListHTML(items) {
  const max = Math.max(...items.map(i => i.value), 1);
  return `<div class="hbar-list">${items.map(i => {
    const w = Math.max(2, (i.value / max) * 100);
    return `<div class="hbar-row">
      <div class="hbar-label">${i.label}</div>
      <div class="hbar-track"><span class="hbar-fill" style="width:${w.toFixed(1)}%"></span></div>
      <div class="hbar-val">${fmtNum(i.value)}</div>
    </div>`;
  }).join('')}</div>`;
}

/* Responsive HTML vertical column chart (value atop bar, label beneath). Same fix as barListHTML:
   an SVG stretched to width:100% scales its baked-in text up, so build the columns in HTML instead. */
function columnChartHTML(items) {
  const max = Math.max(...items.map(i => i.value), 1);
  return `<div class="vbar-chart">${items.map(i => {
    const h = Math.max(4, (i.value / max) * 100);
    return `<div class="vbar-col">
      <div class="vbar-track"><span class="vbar-fill" style="height:${h.toFixed(1)}%"><span class="vbar-value">${fmtNum(i.value)}</span></span></div>
      <div class="vbar-label">${i.label}</div>
    </div>`;
  }).join('')}</div>`;
}

/* ---------- Tab 1: Overview — headline KPIs (click one to plot it), sessions chart, subagent mix ---------- */
let ovSelectedKpi = null;

function renderOverview() {
  const cohort = SHOPPER_AGENT_DATA.cohorts.agent;
  if (!ovSelectedKpi) ovSelectedKpi = cohort.kpis[0].key;

  const chartHTML = `<div class="card" id="ov-chart"></div>`;
  const kpiHTML = `<div class="card kpi-stack">${cohort.kpis.map(k => kpiRowHTML(k, k.key === ovSelectedKpi)).join('')}</div>`;

  const subagentsHTML = `<div class="card">
    ${cardHeader('Top Subagents', { info: 'Sessions and revenue handled by each subagent' })}
    ${renderTable(['Subagent', 'Sessions ↓', '% of Sessions', 'Revenue'],
      SHOPPER_AGENT_DATA.topIntents.map(t => [t.intent, fmtNum(t.sessions), t.pct + '%', t.revenue ? ('$' + fmtNum(t.revenue)) : '—']))}
  </div>`;

  document.getElementById('panel-overview').innerHTML = `
    <div class="row">
      <div style="flex:1.6">${chartHTML}</div>
      <div style="flex:1">${kpiHTML}</div>
    </div>
    ${subagentsHTML}
  `;

  renderOverviewChart();

  // Click a KPI card to plot its daily series — mirrors the real Home dashboard's metric selector.
  document.querySelector('#panel-overview .kpi-stack').onclick = e => {
    const row = e.target.closest('.kpi-row');
    if (!row) return;
    ovSelectedKpi = row.dataset.key;
    document.querySelectorAll('#panel-overview .kpi-row').forEach(r =>
      r.classList.toggle('highlight', r.dataset.key === ovSelectedKpi));
    renderOverviewChart();
  };
}

function renderOverviewChart() {
  const cohort = SHOPPER_AGENT_DATA.cohorts.agent;
  const rev = SHOPPER_AGENT_DATA.revenue;
  const labels = SHOPPER_AGENT_DATA.weekLabels;
  const kpi = cohort.kpis.find(k => k.key === ovSelectedKpi) || cohort.kpis[0];

  // Daily series behind each headline KPI. Sessions/Revenue/AOV reuse arrays already reconciled elsewhere in
  // the data set; Conversion Rate is derived per-day from orders ÷ sessions, so it ties to the same anchors.
  const seriesByKey = {
    sessions: cohort.dailySessions,
    revenue: rev.dailyRevenue,
    conversionRate: cohort.dailySessions.map((s, i) => +(rev.dailyOrders[i] / s * 100).toFixed(2)),
    aov: rev.aovAgent
  };
  const captionByKey = {
    sessions: 'agent sessions this week',
    revenue: 'agent-attributed revenue this week',
    conversionRate: 'of agent sessions converted to an order',
    aov: 'average agent order value this week'
  };
  const raw = seriesByKey[kpi.key] || cohort.dailySessions;
  const series = raw.map((v, i) => ({ label: labels[i], value: v }));

  document.getElementById('ov-chart').innerHTML = `
    ${cardHeader(kpi.label, { info: 'Daily ' + kpi.label.toLowerCase() + ', last 7 days' })}
    <div class="chart-card-header">
      <div class="chart-big-number">${kpi.value}</div>
      <div class="chart-avg-number">${captionByKey[kpi.key] || ''}</div>
    </div>
    ${renderLineChart(series)}
  `;
}

/* ---------- Tab 2: Session Flow — All -> 4 subagents -> downstream; click a subagent to drill in ---------- */
let sfSelectedIntent = null;

function renderSessionFlow() {
  const branches = SHOPPER_AGENT_DATA.funnelByIntent;
  const shareOf = {};
  SHOPPER_AGENT_DATA.topIntents.forEach(t => { shareOf[t.intent] = t.pct; });
  const totalSessions = SHOPPER_AGENT_DATA.topIntents.reduce((sum, t) => sum + t.sessions, 0);
  const maxShare = Math.max(...branches.map(b => shareOf[b.intent] || 0));

  const rootHTML = `<div class="sf-root">
    <div class="sf-root-label">All Sessions</div>
    <div class="sf-root-count">${fmtNum(totalSessions)}</div>
    <div class="sf-root-pct">100%</div>
  </div>`;

  // Fan-out lines from the root to each branch row; stroke thickness scales with each subagent's share.
  const lines = branches.map((b, i) => {
    const yc = ((i + 0.5) / branches.length) * 100;
    const sw = Math.max(1.2, (shareOf[b.intent] / maxShare) * 9);
    const dPath = `M0,50 C50,50 50,${yc.toFixed(1)} 100,${yc.toFixed(1)}`;
    return `<path data-intent="${b.intent}" data-d="${dPath}" d="${dPath}" fill="none" stroke="#0176d3" stroke-width="${sw.toFixed(1)}" vector-effect="non-scaling-stroke"/>`;
  }).join('');
  const connectorHTML = `<svg class="sf-connector" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>`;

  const rowsHTML = branches.map(b => {
    const start = b.stages[0].count;
    const chevrons = b.stages
      .map((s, i) => renderFunnelStage(s, Math.max(0.22, s.count / start), i))
      .join('<div class="funnel-connector"></div>');
    const shareFill = (shareOf[b.intent] / maxShare) * 100;
    return `<div class="sf-row" data-intent="${b.intent}" title="Click to drill into ${b.intent}">
      <div class="sf-row-head">
        <div class="sf-row-name">${b.intent} <span class="sf-row-caret">&#9656;</span></div>
        <div class="sf-share-bar"><span class="sf-share-fill" style="width:${shareFill.toFixed(1)}%"></span></div>
        <div class="sf-row-share">${fmtNum(b.stages[0].count)} sessions &middot; ${shareOf[b.intent]}%</div>
      </div>
      <div class="funnel-row">${chevrons}</div>
    </div>`;
  }).join('');

  document.getElementById('panel-sessions').innerHTML = `
    <div class="card">
      ${cardHeader('Session Flow', { info: 'All agent sessions, split by subagent, then downstream steps. Click a subagent to focus on it.' })}
      <div class="sf-controls">
        <button class="sf-back">&#8592; All subagents</button>
        <span class="sf-focus-label"></span>
      </div>
      <div class="sf-wrap">
        ${rootHTML}
        ${connectorHTML}
        <div class="sf-rows">${rowsHTML}</div>
      </div>
      <div class="funnel-note">All ${fmtNum(totalSessions)} agent sessions route to exactly one subagent — the share at each branch is of all sessions. Percentages beneath each step are of that subagent's own sessions.</div>
    </div>
    <div class="card" id="sf-detail"></div>
  `;

  // Click a branch to focus it; click it again — or Back — to return to the full split.
  document.querySelector('.sf-rows').onclick = e => {
    const row = e.target.closest('.sf-row');
    if (row) selectSubagent(row.dataset.intent);
  };
  document.querySelector('#panel-sessions .sf-back').onclick = () => selectSubagent(null);

  applySessionSelection();
}

function selectSubagent(intent) {
  // Clicking the focused subagent again (or Back, which passes null) returns to the full split.
  sfSelectedIntent = (intent && intent === sfSelectedIntent) ? null : intent;
  applySessionSelection();
}

function applySessionSelection() {
  const focused = sfSelectedIntent;
  const panel = document.getElementById('panel-sessions');

  // Focus mode hides the other subagents entirely; overview shows all four.
  panel.querySelectorAll('.sf-row').forEach(row => {
    const on = row.dataset.intent === focused;
    row.classList.toggle('selected', !!focused && on);
    row.classList.toggle('sf-hidden', !!focused && !on);
  });

  // Fan-out lines: full fan in overview; a single straight line to the centered branch in focus.
  panel.querySelectorAll('.sf-connector path').forEach(p => {
    if (!focused) {
      p.setAttribute('stroke-opacity', '0.45');
      p.setAttribute('d', p.dataset.d);
    } else if (p.dataset.intent === focused) {
      p.setAttribute('stroke-opacity', '0.85');
      p.setAttribute('d', 'M0,50 C50,50 50,50 100,50');
    } else {
      p.setAttribute('stroke-opacity', '0');
    }
  });

  const detail = document.getElementById('sf-detail');
  const back = panel.querySelector('.sf-back');
  const label = panel.querySelector('.sf-focus-label');
  if (focused) {
    detail.style.display = '';
    detail.innerHTML = renderSubagentDetail(focused);
    back.style.display = '';
    label.textContent = 'Focused on ' + focused;
  } else {
    detail.style.display = 'none';
    detail.innerHTML = '';
    back.style.display = 'none';
    label.textContent = 'Click a subagent to focus on it';
  }
}

function renderSubagentDetail(intent) {
  const ti = SHOPPER_AGENT_DATA.topIntents.find(t => t.intent === intent) || {};
  const df = SHOPPER_AGENT_DATA.deflectionByIntent.find(d => d.intent === intent) || {};
  const det = SHOPPER_AGENT_DATA.subagentDetail[intent] || { steps: [], stepLabel: '', note: '' };

  const revText = ti.revenue ? '$' + fmtNum(ti.revenue) : '—';
  const revSub = ti.revenue ? 'attributed to this subagent' : 'service subagent — no direct revenue';
  const ansText = df.ratePct ? df.ratePct + '%' : '—';
  const ansSub = df.totalAsked ? fmtNum(df.totalAsked - df.noAnswer) + ' of ' + fmtNum(df.totalAsked) + ' questions' : '';

  const statsHTML = `<div class="stat-row">
    ${statCard(fmtNum(ti.sessions), 'Sessions', ti.pct + '% of all agent sessions', false)}
    ${statCard(revText, 'Revenue', revSub, false)}
    ${statCard(ansText, 'Questions Answered', ansSub, false)}
  </div>`;

  const breakdownHTML = barListHTML(det.steps.map(s => ({ label: s.label, value: s.count })));

  // Product Expert (the revenue path) gets an extra PDP-outcome lens.
  let extraHTML = '';
  if (intent === 'Product Expert' && SHOPPER_AGENT_DATA.funnel.pdpBreakdown) {
    const pdp = SHOPPER_AGENT_DATA.funnel.pdpBreakdown;
    extraHTML = `<div class="sf-detail-block">
      <div class="sf-detail-subtitle">PDP outcomes <span class="sf-detail-sub">of 402 sessions that opened a product page</span></div>
      <div class="stat-row">
        ${pdp.map(o => statCard(fmtNum(o.count), o.outcome, o.pct + '%', o.outcome === 'Add to Cart')).join('')}
      </div>
    </div>`;
  }

  return `
    <div class="sf-detail-head">Drill-down: <strong>${intent}</strong> subagent</div>
    ${statsHTML}
    <div class="sf-detail-block">
      <div class="sf-detail-subtitle">${det.stepLabel}</div>
      ${breakdownHTML}
      <div class="sf-detail-note">${det.note}</div>
    </div>
    ${extraHTML}
  `;
}

/* ---------- Tab 3: Revenue — money outcomes and order attribution ---------- */
function renderRevenue() {
  const r = SHOPPER_AGENT_DATA.revenue;
  const labels = SHOPPER_AGENT_DATA.weekLabels;
  const mkSeries = arr => arr.map((v, i) => ({ label: labels[i], value: v }));
  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const totalRevenue = sum(r.dailyRevenue);
  const totalOrders = sum(r.dailyOrders);

  const revenueHTML = `<div class="card">
    ${cardHeader('Revenue', { info: 'Daily agent-attributed revenue, last 7 days' })}
    <div class="chart-card-header">
      <div class="chart-big-number">$${fmtNum(totalRevenue)}</div>
      <div class="chart-avg-number">agent-attributed revenue this week</div>
    </div>
    ${renderLineChart(mkSeries(r.dailyRevenue))}
  </div>`;

  const ordersHTML = `<div class="card">
    ${cardHeader('Orders', { info: 'Daily agent-attributed orders, last 7 days' })}
    <div class="chart-card-header">
      <div class="chart-big-number">${fmtNum(totalOrders)}</div>
      <div class="chart-avg-number">agent-attributed orders this week</div>
    </div>
    ${renderLineChart(mkSeries(r.dailyOrders))}
  </div>`;

  const aovAgentHTML = `<div class="card">
    ${cardHeader('Average Order Value — With Agent', { info: 'Daily AOV for agent-assisted orders' })}
    <div class="chart-card-header">
      <div class="chart-big-number">$${r.aovAgentHeadline.toFixed(2)}</div>
      <div class="chart-avg-number">+15% vs. orders placed without the agent</div>
    </div>
    ${renderLineChart(mkSeries(r.aovAgent))}
  </div>`;

  const aovNoAgentHTML = `<div class="card">
    ${cardHeader('Average Order Value — No Agent', { info: 'Daily AOV for orders placed without the agent' })}
    <div class="chart-card-header">
      <div class="chart-big-number">$${r.aovNoAgentHeadline.toFixed(2)}</div>
      <div class="chart-avg-number">baseline shopper order value</div>
    </div>
    ${renderLineChart(mkSeries(r.aovNoAgent))}
  </div>`;

  const attributionHTML = `<div class="card">
    ${cardHeader('Order Attribution', { info: 'How agent-assisted orders were completed' })}
    <div class="stat-row">
      ${statCard(fmtNum(r.ordersTiedToAgent), 'Orders Tied to an Agent', 'shopper engaged the agent, then purchased', true)}
      ${statCard(fmtNum(r.ordersDirectFromAgent), 'Orders Direct from an Agent', 'completed via agent express checkout', false)}
    </div>
  </div>`;

  const bs = [...SHOPPER_AGENT_DATA.topProducts.bestSellers].sort((a, b) => b.revenue - a.revenue);
  const maxRev = Math.max(...bs.map(p => p.revenue));
  const bestSellersHTML = `<div class="card">
    ${cardHeader('Top Selling Products via Agent', { info: 'Best-selling products in agent-assisted sessions', filter: 'ALL PRODUCTS' })}
    ${renderTable(['Product', 'Units', 'Revenue ↓'],
      bs.map(p => [p.name, fmtNum(p.units), barCell('$' + fmtNum(p.revenue), p.revenue / maxRev * 100)]))}
  </div>`;

  document.getElementById('panel-revenue').innerHTML = `
    <div class="grid-2">${revenueHTML}${ordersHTML}</div>
    <div class="grid-2">${aovAgentHTML}${aovNoAgentHTML}</div>
    <div class="grid-2" style="align-items:start">${bestSellersHTML}${attributionHTML}</div>
  `;
}

/* ---------- Tab 4: Adoption — monthly growth lenses ---------- */
function renderAdoption() {
  const a = SHOPPER_AGENT_DATA.adoption;
  const mkSeries = arr => arr.map((v, i) => ({ label: a.months[i], value: v }));
  const last = arr => arr[arr.length - 1];

  const overallHTML = `<div class="card">
    ${cardHeader('Overall Sessions', { info: 'Agent-engaged share of all storefront sessions, by month' })}
    <div class="chart-card-header">
      <div class="chart-big-number">${last(a.overallSessionsPct)}%</div>
      <div class="chart-avg-number">of storefront sessions engaged the agent last month</div>
    </div>
    ${renderLineChart(mkSeries(a.overallSessionsPct))}
  </div>`;

  const usersHTML = `<div class="card">
    ${cardHeader('Overall Users', { info: 'Monthly unique shoppers who engaged the agent' })}
    <div class="chart-card-header">
      <div class="chart-big-number">${fmtNum(last(a.monthlyUsers))}</div>
      <div class="chart-avg-number">monthly active agent users</div>
    </div>
    ${renderLineChart(mkSeries(a.monthlyUsers))}
  </div>`;

  const deviceHTML = `<div class="card">
    ${cardHeader('Mobile vs Web', { info: 'Agent sessions by device this month' })}
    ${columnChartHTML(a.deviceMonthly.map(d => ({ label: d.type, value: d.count })))}
  </div>`;

  const repeatHTML = `<div class="card">
    ${cardHeader('Repeat Users', { info: 'Share of monthly agent users who had a prior agent session' })}
    <div class="chart-card-header">
      <div class="chart-big-number">${last(a.repeatUsersPct)}%</div>
      <div class="chart-avg-number">of agent users returned this month</div>
    </div>
    ${renderLineChart(mkSeries(a.repeatUsersPct))}
  </div>`;

  const fmtDur = s => Math.floor(s / 60) + 'm ' + String(s % 60).padStart(2, '0') + 's';
  const durationHTML = `<div class="card">
    ${cardHeader('Avg Session Duration', { info: 'Average agent session length by device' })}
    <div class="stat-row">
      ${a.sessionDuration.map(d => statCard(fmtDur(d.seconds), d.type, 'average session length', false)).join('')}
    </div>
  </div>`;

  document.getElementById('panel-adoption').innerHTML = `
    <div class="grid-2">${overallHTML}${usersHTML}</div>
    <div class="grid-2">${deviceHTML}${repeatHTML}</div>
    ${durationHTML}
  `;
}

/* ---------- Tab 5: Product & Search — product/event-level performance ---------- */
function renderProducts() {
  const pe = SHOPPER_AGENT_DATA.productEngagement;
  const s = pe.search;

  const searchStatHTML = `<div class="card">
    ${cardHeader('Product Search', { info: 'How shoppers search and how the surfaced results perform' })}
    <div class="stat-row">
      ${statCard(fmtNum(s.totalSearches), 'Agent Searches', 'across product-expert sessions', false)}
      ${statCard(s.avgResults.toFixed(1), 'Avg Results / Search', fmtNum(s.resultsDisplayed) + ' shown total', false)}
    </div>
  </div>`;

  const utterancesHTML = `<div class="card">
    ${cardHeader('Top Search Utterances', { info: 'Most common terms and phrases shoppers searched' })}
    ${renderTable(['Search Term', 'Searches ↓'], s.utterances.map(u => [u.term, fmtNum(u.count)]))}
  </div>`;

  const maxCtr = Math.max(...s.productImpressions.map(p => p.ctr));
  const searchProductsHTML = `<div class="card">
    ${cardHeader('Products Shown in Search', { info: 'Impressions vs. click-through for each product surfaced in the carousel' })}
    ${renderTable(['Product', 'Impressions ↓', 'Clicks', 'CTR'],
      s.productImpressions.map(p => [p.name, fmtNum(p.impressions), fmtNum(p.clicks), barCell(p.ctr + '%', p.ctr / maxCtr * 100)]))}
  </div>`;

  const pd = pe.productDetails;
  const maxAtc = Math.max(...pd.products.map(p => p.atcRate));
  const productDetailsHTML = `<div class="card">
    ${cardHeader('Product Details', { info: 'Detail-view engagement and per-product add-to-cart performance' })}
    <div class="stat-row">
      ${statCard(fmtNum(pd.detailViews), 'Product Detail Views', 'from carousel click-thrus', false)}
      ${statCard(fmtNum(pd.addToCartClicks), 'Add-to-Cart Clicks', 'from a product detail view', false)}
      ${statCard(pd.addToCartRate + '%', 'PDP Add-to-Cart Rate', 'adds / detail views', false)}
    </div>
    <div style="margin-top:14px">${renderTable(['Product', 'Detail Views ↓', 'Add-to-Carts', 'ATC Rate'],
      pd.products.map(p => [p.name, fmtNum(p.views), fmtNum(p.addToCarts), barCell(p.atcRate + '%', p.atcRate / maxAtc * 100)]))}</div>
  </div>`;

  const mc = SHOPPER_AGENT_DATA.mostComparedProducts;
  const maxCmp = Math.max(...mc.map(p => p.count));
  const comparisonHTML = `<div class="card">
    ${cardHeader('Product Comparison', { info: 'Head-to-head comparisons requested via the agent, ranked by pair' })}
    ${renderTable(['Product Pair', 'Comparisons ↓'],
      mc.map(p => [p.pair, barCell(fmtNum(p.count), p.count / maxCmp * 100)]))}
  </div>`;

  document.getElementById('panel-products').innerHTML = `
    ${searchStatHTML}
    <div class="grid-2" style="align-items:start">${utterancesHTML}${comparisonHTML}</div>
    ${searchProductsHTML}
    ${productDetailsHTML}
  `;
}

/* ---------- Tab 6: Cart — cart views and checkout outcomes ---------- */
function renderCart() {
  const cv = SHOPPER_AGENT_DATA.productEngagement.cartView;
  const c = SHOPPER_AGENT_DATA.cart;
  const st = cv.stages;
  const maxCV = st[0].count;

  // #2 — Basket economics (replaces the old stat cards that just restated the funnel counts).
  const econHTML = `<div class="card">
    ${cardHeader('Cart Economics', { info: 'Basket value across all agent-assisted carts' })}
    <div class="stat-row">
      ${statCard('$' + c.avgCartValue.toFixed(2), 'Avg Cart Value', 'across ' + fmtNum(maxCV) + ' agent carts', false)}
      ${statCard(c.unitsPerCart.toFixed(1), 'Units per Cart', 'items per cart, average', false)}
      ${statCard('$' + fmtNum(c.convertedRevenue), 'Cart Value Converted', c.convertedPct + '% of $' + fmtNum(c.totalCartValue) + ' in carts', true)}
    </div>
  </div>`;

  // #4 — Express vs standard checkout split, surfaced as a real viz.
  const cm = c.checkoutMethods;
  const methodHTML = `<div class="card">
    ${cardHeader('Checkout Method', { info: 'How agent-assisted orders completed' })}
    ${barListHTML(cm.map(m => ({ label: m.method, value: m.count })))}
    <div class="funnel-note">${fmtNum(cm[0].count + cm[1].count)} agent-assisted orders — ${fmtNum(cm[0].count)} via express checkout (${cm[0].pct}%), ${fmtNum(cm[1].count)} via standard checkout (${cm[1].pct}%).</div>
  </div>`;

  // #5 — Agent vs no-agent at the cart stage (reuses the compare-card + lift-badge styling).
  const cmpHTML = `<div class="card">
    ${cardHeader('Agent vs. No Agent — Cart Performance', { info: 'Cart outcomes for agent-assisted vs unassisted sessions' })}
    <div class="stat-row">
      ${c.comparison.map(m => `<div class="stat-card" style="text-align:left">
        <div class="compare-card">
          <div class="compare-metric">${m.metric}</div>
          <div class="compare-values">
            <div class="compare-value-block"><div class="compare-value-label">Agent</div><div class="compare-value">${m.agent}</div></div>
            <div class="compare-value-block"><div class="compare-value-label">No Agent</div><div class="compare-value">${m.noAgent}</div></div>
          </div>
          <span class="lift-badge">${m.lift}</span>
        </div>
      </div>`).join('')}
    </div>
  </div>`;

  document.getElementById('panel-cart').innerHTML = `
    ${econHTML}
    ${methodHTML}
    ${cmpHTML}
  `;
}

function initSubTabs() {
  document.querySelectorAll('.subtab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.subtab).classList.add('active');
    });
  });
}

function renderAll() {
  renderOverview();
  renderSessionFlow();
  renderRevenue();
  renderAdoption();
  renderProducts();
  renderCart();
  initSubTabs();
}

document.addEventListener('DOMContentLoaded', renderAll);
