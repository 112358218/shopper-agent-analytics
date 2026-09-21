/* Generic, data-agnostic SVG chart builders. Numbers in, markup out — no page/data knowledge. */

let __chartIdCounter = 0;

function fmtNumChart(n) { return Number(n).toLocaleString(); }

function escapeXML(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderSparkline(points, opts = {}) {
  if (!points || points.length < 2) return '';
  const id = opts.id || ('spark-' + (__chartIdCounter++));
  const w = 150, h = 50;
  const minP = Math.min(...points), maxP = Math.max(...points);
  const range = (maxP - minP) || 1;
  const pad = range * 0.15;
  const scaleMin = minP - pad, scaleMax = maxP + pad;
  const step = w / (points.length - 1);
  const y = p => h - 4 - ((p - scaleMin) / (scaleMax - scaleMin)) * (h - 8);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${y(p).toFixed(1)}`).join(' ');
  return `<svg width="100%" height="${opts.height || 36}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="display:block">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0176d3" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0176d3" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${path}" fill="none" stroke="#0176d3" stroke-width="1.5"/>
    <path d="${path} L${w},${h} L0,${h} Z" fill="url(#${id})"/>
  </svg>`;
}

function renderLineChart(series, opts = {}) {
  const w = 700, h = 220, padBottom = 26, padTop = 14, padX = 16;
  const values = series.map(s => s.value);
  const minV = Math.min(...values), maxV = Math.max(...values);
  const range = (maxV - minV) || 1;
  const pad = range * 0.25;
  const scaleMin = Math.max(0, minV - pad);
  const scaleMax = maxV + pad;
  const plotH = h - padBottom - padTop;
  const plotW = w - padX * 2;
  const step = series.length > 1 ? plotW / (series.length - 1) : 0;
  const x = i => padX + i * step;
  const y = v => padTop + plotH - ((v - scaleMin) / (scaleMax - scaleMin)) * plotH;
  const path = series.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(s.value).toFixed(1)}`).join(' ');
  const id = opts.id || ('line-' + (__chartIdCounter++));
  const labels = series.map((s, i) => `<text x="${x(i).toFixed(1)}" y="${h - 6}" font-size="10" fill="#706e6b" text-anchor="middle">${escapeXML(s.label)}</text>`).join('');
  return `<svg width="100%" height="220" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="display:block">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0176d3" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0176d3" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${path}" fill="none" stroke="#0176d3" stroke-width="2"/>
    <path d="${path} L${x(series.length - 1).toFixed(1)},${(padTop + plotH).toFixed(1)} L${x(0).toFixed(1)},${(padTop + plotH).toFixed(1)} Z" fill="url(#${id})"/>
    ${labels}
  </svg>`;
}

function renderBarChart(items, opts = {}) {
  const orientation = opts.orientation || 'vertical';
  const maxVal = opts.maxValue || Math.max(...items.map(d => d.value));

  if (orientation === 'horizontal') {
    const labelW = 180, valueW = 60, rowH = 26, gap = 12, barMaxW = 260;
    const w = labelW + barMaxW + valueW;
    const h = items.length * (rowH + gap) + 4;
    const bars = items.map((d, i) => {
      const y = i * (rowH + gap) + 4;
      const barW = Math.max(4, (d.value / maxVal) * barMaxW);
      return `<text x="0" y="${y + rowH / 2 + 4}" font-size="12" fill="#181818">${escapeXML(d.label)}</text>
        <rect x="${labelW}" y="${y}" width="${barMaxW}" height="${rowH}" fill="#f0f0f0" rx="4"/>
        <rect x="${labelW}" y="${y}" width="${barW}" height="${rowH}" fill="#0176d3" rx="4"/>
        <text x="${labelW + barMaxW + 10}" y="${y + rowH / 2 + 4}" font-size="12" fill="#181818" font-weight="700">${fmtNumChart(d.value)}</text>`;
    }).join('');
    return `<svg width="100%" viewBox="0 0 ${w} ${h}" style="display:block">${bars}</svg>`;
  }

  const colW = 110, barMaxH = 90, h = 150;
  const w = items.length * colW;
  const bars = items.map((d, i) => {
    const barH = Math.max(6, (d.value / maxVal) * barMaxH);
    const cx = i * colW + colW / 2;
    return `<rect x="${cx - 34}" y="${110 - barH}" width="68" height="${barH}" fill="#0176d3" rx="4"/>
      <text x="${cx}" y="130" font-size="11" fill="#706e6b" text-anchor="middle">${escapeXML(d.label)}</text>
      <text x="${cx}" y="${Math.max(14, 100 - barH)}" font-size="12" fill="#181818" font-weight="700" text-anchor="middle">${fmtNumChart(d.value)}</text>`;
  }).join('');
  return `<svg width="100%" viewBox="0 0 ${w} ${h}" style="display:block">${bars}</svg>`;
}

function renderFunnelStage(stage, ratio, colorIndex) {
  const baseW = 170, baseH = 76;
  const w = Math.max(70, baseW * ratio);
  const h = Math.max(40, baseH * ratio);
  const arrowDepth = Math.min(26, w * 0.2);
  const opacity = Math.max(0.55, 1 - colorIndex * 0.15).toFixed(2);
  return `<div class="funnel-stage" style="flex:${ratio.toFixed(2)} 0 auto; min-width:80px;">
    <svg width="100%" height="${h.toFixed(0)}" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" preserveAspectRatio="none" style="display:block">
      <polygon points="0,0 ${(w - arrowDepth).toFixed(0)},0 ${w.toFixed(0)},${(h / 2).toFixed(0)} ${(w - arrowDepth).toFixed(0)},${h.toFixed(0)} 0,${h.toFixed(0)}" fill="#0176d3" opacity="${opacity}"/>
    </svg>
    <div class="funnel-stage-label">${escapeXML(stage.label)}</div>
    <div class="funnel-stage-count">${fmtNumChart(stage.count)}</div>
    <div class="funnel-stage-pct">${stage.pct}%</div>
  </div>`;
}

function renderTable(headers, rows) {
  const thead = `<tr>${headers.map((h, i) => `<th style="text-align:${i === 0 ? 'left' : 'right'}">${escapeXML(h)}</th>`).join('')}</tr>`;
  const tbody = rows.map(r => `<tr>${r.map((c, i) => `<td style="text-align:${i === 0 ? 'left' : 'right'}">${c}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table class="data-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
}
