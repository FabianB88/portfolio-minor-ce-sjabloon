'use strict';
/* Portfolio minor Circulaire Economie
   Alle inhoud staat in data/portfolio.json. Deze app leest dat bestand en toont
   de pagina's; wijzigingen uit het invulformulier staan als concept in de browser
   totdat ze gepubliceerd zijn (zie invullen.js). */

const OPSLAG = 'portfolio-concept';
const FOCUSGEBIEDEN = ['Discover', 'Define', 'Develop', 'Deliver'];
const STATUSSEN = { gepland: 'Gepland', bezig: 'Bezig', behaald: 'Behaald' };
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const MAANDEN_KORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

const S = {
  gepubliceerd: '',     // genormaliseerde JSON-tekst zoals die online staat
  data: null,           // de data die getoond wordt (gepubliceerd of concept)
  conceptVerouderd: false,
  laadfout: ''
};

/* ---------- hulpfuncties ---------- */

function h(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Lopende tekst uit een tekstveld: lege regel = nieuwe alinea, "- " = opsomming, "## " = tussenkop.
function tekst(s) {
  if (!s) return '';
  return String(s).replace(/\r/g, '').split(/\n\s*\n/).map(blok => {
    const regels = blok.split('\n').filter(r => r.trim() !== '');
    if (!regels.length) return '';
    if (regels.every(r => /^\s*-\s+/.test(r))) {
      return '<ul>' + regels.map(r => '<li>' + h(r.replace(/^\s*-\s+/, '')) + '</li>').join('') + '</ul>';
    }
    if (regels.length === 1 && /^#{1,3}\s+/.test(regels[0])) {
      return '<h2>' + h(regels[0].replace(/^#{1,3}\s+/, '')) + '</h2>';
    }
    return '<p>' + regels.map(h).join('<br>') + '</p>';
  }).join('');
}

function delenDatum(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
function datumNL(iso) {
  const d = delenDatum(iso);
  return d ? d[2] + ' ' + MAANDEN[d[1] - 1] + ' ' + d[0] : (iso || '');
}
function datumKort(iso) {
  const d = delenDatum(iso);
  return d ? d[2] + ' ' + MAANDEN_KORT[d[1] - 1] : (iso || '');
}
function naarTijd(iso) {
  const d = delenDatum(iso);
  return d ? new Date(d[0], d[1] - 1, d[2]).getTime() : NaN;
}
function isoVandaag() {
  const n = new Date();
  return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
}
function meervoud(n, een, meer) { return n + ' ' + (n === 1 ? een : meer); }

function leerdoel(id) { return (S.data.leerdoelen || []).find(l => l.id === id); }
function project(id) { return (S.data.projecten || []).find(p => p.id === id); }
function update(id) { return (S.data.updates || []).find(u => u.id === id); }
function nummerVan(id) { return (S.data.leerdoelen || []).findIndex(l => l.id === id) + 1; }
function updatesGesorteerd() { return (S.data.updates || []).slice().sort((a, b) => (b.datum || '').localeCompare(a.datum || '')); }
function updatesBijLeerdoel(id) { return updatesGesorteerd().filter(u => (u.leerdoelen || []).includes(id)); }
function updatesBijProject(id) { return updatesGesorteerd().filter(u => u.project === id); }
function projectenBijLeerdoel(id) { return (S.data.projecten || []).filter(p => (p.leerdoelen || []).includes(id)); }

function voortgangVan(l) {
  if (typeof l.voortgang === 'number' && !isNaN(l.voortgang)) return Math.max(0, Math.min(100, Math.round(l.voortgang)));
  return l.status === 'behaald' ? 100 : l.status === 'bezig' ? 50 : 0;
}

function statusHtml(status) {
  const s = STATUSSEN[status] ? status : 'gepland';
  const ic = s === 'behaald' ? 'circle-check' : s === 'bezig' ? 'circle-dot' : 'circle-dashed';
  return '<span class="status status-' + s + '">' + icoon(ic) + STATUSSEN[s] + '</span>';
}
function focusKlasse(f) { return FOCUSGEBIEDEN.includes(f) ? 'focus-' + f.toLowerCase() : 'focus-geen'; }
function focusHtml(f) {
  if (!f) return '';
  return '<span class="focus ' + focusKlasse(f) + '"><span class="focus-stip"></span>' + h(f) + '</span>';
}
function leerdoelLink(id) {
  const l = leerdoel(id);
  if (!l) return '';
  return '<a href="#/leerdoel/' + h(l.id) + '">' + nummerVan(l.id) + '. ' + h(l.titel) + '</a>';
}
function updateRegel(u) {
  return '<li><a href="#/update/' + h(u.id) + '">' + h(u.titel || 'Zonder titel') + '</a><span class="meta">' + datumNL(u.datum) + (u.focus ? ' · ' + h(u.focus) : '') + '</span></li>';
}
function bewijsUrl(u) {
  return u; // relatieve paden (bewijs/foto.jpg), #/-links en https-links werken zoals ze zijn
}

/* ---------- tijdlijn ---------- */

function tijdlijnItems(p) {
  const vandaag = isoVandaag();
  const items = [];
  (p.momenten || []).forEach((m, i) => {
    if (!m.datum) return;
    items.push({ soort: 'moment', index: i, datum: m.datum, titel: m.titel, focus: m.focus, tekst: m.tekst, gepland: m.datum > vandaag });
  });
  updatesBijProject(p.id).forEach(u => {
    if (!u.datum) return;
    items.push({ soort: 'update', id: u.id, datum: u.datum, titel: u.titel, focus: u.focus, tekst: u.geleerd, gepland: false });
  });
  items.sort((a, b) => a.datum.localeCompare(b.datum));
  return items;
}

function tijdlijnBereik(p, items) {
  let start = p.start || (items[0] && items[0].datum);
  let einde = p.einde || (items.length && items[items.length - 1].datum);
  if (!start && !einde) return null;
  if (!start) start = einde;
  if (!einde) einde = start;
  let t0 = naarTijd(start), t1 = naarTijd(einde);
  if (isNaN(t0) || isNaN(t1)) return null;
  if (t1 <= t0) t1 = t0 + 7 * 86400000;
  return { start, einde, t0, t1 };
}

function tijdlijnBalk(p, items, klein) {
  const b = tijdlijnBereik(p, items);
  if (!b) return klein ? '' : '<p class="stil">Geef het project een start- en einddatum om de tijdlijn te tonen.</p>';
  const pct = iso => Math.max(0, Math.min(100, (naarTijd(iso) - b.t0) / (b.t1 - b.t0) * 100));
  const vandaag = isoVandaag();
  const pv = pct(vandaag);
  let html = '<div class="tl-balk' + (klein ? ' tl-klein' : '') + '">';
  html += '<div class="tl-lijn"></div>';
  if (vandaag >= b.start && vandaag <= b.einde) html += '<div class="tl-verstreken" style="width:' + pv.toFixed(1) + '%"></div>';
  else if (vandaag > b.einde) html += '<div class="tl-verstreken" style="width:100%"></div>';
  items.forEach((it, i) => {
    html += '<span class="tl-punt ' + focusKlasse(it.focus) + (it.gepland ? ' tl-gepland' : '') + (it.soort === 'update' ? ' tl-update' : '') + '" style="left:' + pct(it.datum).toFixed(1) + '%" title="' + h(datumKort(it.datum) + ' · ' + (it.titel || '')) + '"' + (klein ? '' : ' data-scroll="tl-' + i + '" role="button" tabindex="0"') + '></span>';
  });
  if (vandaag >= b.start && vandaag <= b.einde) html += '<span class="tl-vandaag" style="left:' + pv.toFixed(1) + '%"><span>vandaag</span></span>';
  html += '</div>';
  if (!klein) html += '<div class="tl-labels"><span>' + datumNL(b.start) + '</span><span>' + datumNL(b.einde) + '</span></div>';
  return html;
}

function tijdlijnLegenda() {
  return '<p class="tl-legenda">' + FOCUSGEBIEDEN.map(f => focusHtml(f)).join('') +
    '<span class="focus"><span class="focus-stip tl-open"></span>gepland</span>' +
    '<span class="focus"><span class="focus-stip tl-vierkant"></span>logboekbericht</span></p>';
}

function tijdlijnLijst(items) {
  if (!items.length) return '<p class="stil">Nog geen momenten op de tijdlijn. Voeg ze toe via Invullen, of schrijf een logboekbericht bij dit project.</p>';
  return '<ol class="tl-lijst">' + items.map((it, i) => {
    const kop = it.soort === 'update'
      ? '<a href="#/update/' + h(it.id) + '">' + h(it.titel || 'Zonder titel') + '</a>'
      : h(it.titel || 'Zonder titel');
    return '<li class="tl-item ' + focusKlasse(it.focus) + (it.gepland ? ' tl-gepland' : '') + (it.soort === 'update' ? ' tl-update' : '') + '" id="tl-' + i + '">' +
      '<span class="tl-stip"></span>' +
      '<div class="tl-inhoud">' +
      '<p class="tl-meta">' + datumNL(it.datum) + (it.focus ? ' · ' + h(it.focus) : '') + (it.soort === 'update' ? ' · logboek' : '') + (it.gepland ? ' · gepland' : '') + '</p>' +
      '<h3>' + kop + '</h3>' +
      (it.tekst ? tekst(it.tekst) : '') +
      '</div></li>';
  }).join('') + '</ol>';
}

function projectFase(p) {
  const vandaag = isoVandaag();
  if (p.start && vandaag < p.start) return 'start op ' + datumNL(p.start);
  if (p.einde && vandaag > p.einde) return 'afgerond';
  if (p.start && p.einde) {
    const totaal = Math.max(1, Math.round((naarTijd(p.einde) - naarTijd(p.start)) / (7 * 86400000)));
    const nu = Math.max(1, Math.ceil((naarTijd(vandaag) - naarTijd(p.start) + 1) / (7 * 86400000)));
    return 'week ' + Math.min(nu, totaal) + ' van ' + totaal;
  }
  return 'loopt';
}

/* ---------- pagina's ---------- */

function isLeeg() {
  const st = S.data.student || {};
  return !st.naam && !st.intro && !(S.data.leerdoelen || []).length && !(S.data.projecten || []).length && !(S.data.updates || []).length;
}

function paginaWelkom() {
  return '<section class="intro"><h1>Je portfolio is nog leeg</h1>' +
    '<p>Dit is jouw portfolio voor de minor Circulaire Economie. Hier houd je je leerdoelen bij, de tijdlijn van je project en je wekelijkse voortgang. Alles vul je zelf in.</p>' +
    '<p class="knoppen"><a class="knop" href="#/invullen">' + icoon('pencil') + 'Begin met invullen</a>' +
    '<button type="button" class="knop knop-2" data-actie="voorbeeld-laden">' + icoon('eye') + 'Bekijk een ingevuld voorbeeld</button></p>' +
    '<p id="publiceer-melding" class="melding" aria-live="polite"></p>' +
    '<h2>Zo werkt het</h2>' +
    '<ol class="stappen"><li>Zet bij <a href="#/invullen/profiel">Profiel</a> je naam en een korte tekst over jou en je opdracht.</li>' +
    '<li>Formuleer bij <a href="#/invullen/leerdoelen">Leerdoelen</a> wat je aan het einde van de minor wilt kunnen, en waarom.</li>' +
    '<li>Maak bij <a href="#/invullen/projecten">Projecten</a> je project aan met start- en einddatum, en zet de momenten op de tijdlijn: gesprekken, mijlpalen, presentaties.</li>' +
    '<li>Schrijf elke week bij <a href="#/invullen/logboek">Logboek</a> wat je hebt gedaan, wat je hebt geleerd en wat je volgende stap is.</li>' +
    '<li>Zet het online via <a href="#/invullen/publiceren">Publiceren</a>. Tot die tijd ziet alleen jij je wijzigingen.</li></ol>' +
    '<p class="hulp">Het voorbeeld laadt als concept: je kunt het bekijken, ermee spelen en daarna weggooien via Publiceren, Concept weggooien.</p></section>';
}

function paginaStart() {
  if (isLeeg()) return paginaWelkom();
  const st = S.data.student || {};
  const doelen = S.data.leerdoelen || [];
  const behaald = doelen.filter(l => l.status === 'behaald').length;
  const bezig = doelen.filter(l => l.status === 'bezig').length;
  const gem = doelen.length ? Math.round(doelen.reduce((s, l) => s + voortgangVan(l), 0) / doelen.length) : 0;
  let html = '<section class="intro"><h1>' + h(st.naam || 'Mijn portfolio') + '</h1>' + tekst(st.intro) + '</section>';

  html += '<section><h2>Voortgang op mijn leerdoelen</h2>';
  if (!doelen.length) {
    html += '<p class="stil">Nog geen leerdoelen. <a href="#/invullen/leerdoelen">Voeg je eerste leerdoel toe</a>.</p>';
  } else {
    html += '<p class="samenvatting">' + behaald + ' van ' + meervoud(doelen.length, 'leerdoel', 'leerdoelen') + ' behaald, ' + bezig + ' in uitvoering, gemiddeld ' + gem + '% voortgang.</p>';
    html += '<div class="balk" role="img" aria-label="Gemiddelde voortgang ' + gem + ' procent"><span style="width:' + gem + '%"></span></div>';
    html += '<ul class="overzicht">' + doelen.map(l => rijLeerdoel(l)).join('') + '</ul>';
  }
  html += '</section>';

  html += '<section><h2>Projecten</h2>';
  const projecten = S.data.projecten || [];
  if (!projecten.length) html += '<p class="stil">Nog geen projecten. <a href="#/invullen/projecten">Voeg een project toe</a>.</p>';
  else html += '<ul class="overzicht">' + projecten.map(p => rijProject(p)).join('') + '</ul>';
  html += '</section>';

  html += '<section><h2>Laatste logboekberichten</h2>';
  const ups = updatesGesorteerd();
  if (!ups.length) html += '<p class="stil">Nog geen berichten. <a href="#/invullen/logboek">Schrijf je eerste bericht</a>.</p>';
  else html += '<ul class="lijst">' + ups.slice(0, 5).map(updateRegel).join('') + '</ul><p><a href="#/logboek">Alle berichten</a></p>';
  html += '</section>';
  return html;
}

function rijLeerdoel(l) {
  const n = updatesBijLeerdoel(l.id).length;
  const b = (l.bewijs || []).length;
  const v = voortgangVan(l);
  return '<li class="rij">' + statusHtml(l.status) +
    '<a class="rij-titel" href="#/leerdoel/' + h(l.id) + '">' + nummerVan(l.id) + '. ' + h(l.titel || 'Zonder titel') + '</a>' +
    '<span class="meta"><span class="mini-balk" aria-hidden="true"><span style="width:' + v + '%"></span></span>' + v + '% · ' +
    (l.streefdatum ? 'streefdatum ' + datumNL(l.streefdatum) + ' · ' : '') +
    meervoud(n, 'bericht', 'berichten') + ' · ' + meervoud(b, 'bewijsstuk', 'bewijsstukken') + '</span></li>';
}

function rijProject(p) {
  const items = tijdlijnItems(p);
  return '<li class="rij rij-project">' +
    '<span class="rij-icoon">' + icoon('folder') + '</span>' +
    '<a class="rij-titel" href="#/project/' + h(p.id) + '">' + h(p.titel || 'Zonder titel') + '</a>' +
    '<span class="meta">' + h(p.opdrachtgever || '') + (p.opdrachtgever ? ' · ' : '') + projectFase(p) + ' · ' + meervoud(items.length, 'moment', 'momenten') + '</span>' +
    tijdlijnBalk(p, items, true) + '</li>';
}

function paginaLeerdoelen() {
  const doelen = S.data.leerdoelen || [];
  return '<article class="detail"><h1>Leerdoelen</h1>' +
    '<p>Mijn leerdoelen voor deze minor. Elk leerdoel heeft een status, een voortgang, een streefdatum en de bewijsstukken waarmee ik laat zien dat ik het heb behaald.</p>' +
    (doelen.length ? '<ul class="overzicht">' + doelen.map(rijLeerdoel).join('') + '</ul>' : '<p class="stil">Nog geen leerdoelen.</p>') +
    '<p class="bewerk-link"><a href="#/invullen/leerdoelen">' + icoon('pencil') + 'Leerdoelen bewerken</a></p></article>';
}

function paginaLeerdoel(id) {
  const l = leerdoel(id);
  if (!l) return nietGevonden('Dit leerdoel bestaat niet (meer).');
  const v = voortgangVan(l);
  let html = '<article class="detail">' +
    '<p class="terug"><a href="#/leerdoelen">' + icoon('arrow-left') + 'Alle leerdoelen</a></p>' +
    '<p class="label">Leerdoel ' + nummerVan(l.id) + '</p><h1>' + h(l.titel || 'Zonder titel') + '</h1>' +
    '<p class="kenmerken">' + statusHtml(l.status) +
    '<span class="kenmerk"><span class="mini-balk" aria-hidden="true"><span style="width:' + v + '%"></span></span>' + v + '% voortgang</span>' +
    (l.streefdatum ? '<span class="kenmerk">' + icoon('calendar') + 'Streefdatum ' + datumNL(l.streefdatum) + '</span>' : '') +
    '</p>' + tekst(l.beschrijving);
  if (l.reflectie) html += '<h2>Waar ik sta en wat ik ervan leer</h2>' + tekst(l.reflectie);
  html += '<h2>Bewijsstukken</h2>';
  const bewijs = (l.bewijs || []).filter(b => b.tekst || b.url);
  html += bewijs.length
    ? '<ul class="lijst">' + bewijs.map(b => '<li>' + icoon('paperclip') + (b.url ? '<a href="' + h(bewijsUrl(b.url)) + '">' + h(b.tekst || b.url) + '</a>' : h(b.tekst)) + '</li>').join('') + '</ul>'
    : '<p class="stil">Nog geen bewijsstukken toegevoegd.</p>';
  const prs = projectenBijLeerdoel(l.id);
  if (prs.length) html += '<h2>Projecten die hieraan bijdragen</h2><ul class="lijst">' + prs.map(p => '<li>' + icoon('folder') + '<a href="#/project/' + h(p.id) + '">' + h(p.titel) + '</a><span class="meta">' + projectFase(p) + '</span></li>').join('') + '</ul>';
  const ups = updatesBijLeerdoel(l.id);
  html += '<h2>Logboek bij dit leerdoel</h2>' + (ups.length ? '<ul class="lijst">' + ups.map(updateRegel).join('') + '</ul>' : '<p class="stil">Nog geen logboekberichten bij dit leerdoel.</p>');
  html += '<p class="bewerk-link"><a href="#/invullen/leerdoelen">' + icoon('pencil') + 'Dit leerdoel bewerken</a></p></article>';
  return html;
}

function paginaProjecten() {
  const projecten = S.data.projecten || [];
  return '<article class="detail"><h1>Projecten</h1>' +
    '<p>De projecten waar ik in deze minor aan werk, met per project de tijdlijn van het proces. De kleur van een punt is het focusgebied waarin ik toen zat.</p>' +
    (projecten.length ? tijdlijnLegenda() + '<ul class="overzicht">' + projecten.map(rijProject).join('') + '</ul>' : '<p class="stil">Nog geen projecten.</p>') +
    '<p class="bewerk-link"><a href="#/invullen/projecten">' + icoon('pencil') + 'Projecten bewerken</a></p></article>';
}

function paginaProject(id) {
  const p = project(id);
  if (!p) return nietGevonden('Dit project bestaat niet (meer).');
  const items = tijdlijnItems(p);
  let html = '<article class="detail">' +
    '<p class="terug"><a href="#/projecten">' + icoon('arrow-left') + 'Alle projecten</a></p>' +
    '<p class="label">Project</p><h1>' + h(p.titel || 'Zonder titel') + '</h1>' +
    '<p class="kenmerken">' +
    (p.opdrachtgever ? '<span class="kenmerk">' + icoon('building') + h(p.opdrachtgever) + '</span>' : '') +
    (p.start || p.einde ? '<span class="kenmerk">' + icoon('calendar') + (p.start ? datumNL(p.start) : '?') + ' tot ' + (p.einde ? datumNL(p.einde) : '?') + '</span>' : '') +
    '<span class="kenmerk">' + icoon('milestone') + projectFase(p) + '</span></p>';
  html += '<h2>Tijdlijn van het proces</h2>' + tijdlijnBalk(p, items, false) + tijdlijnLegenda();
  html += tekst(p.beschrijving);
  html += '<h2>Momenten en berichten</h2>' + tijdlijnLijst(items);
  const doelen = (p.leerdoelen || []).map(leerdoel).filter(Boolean);
  if (doelen.length) html += '<h2>Leerdoelen waar dit project aan bijdraagt</h2><ul class="lijst">' + doelen.map(l => '<li>' + statusHtml(l.status) + leerdoelLink(l.id) + '</li>').join('') + '</ul>';
  html += '<p class="bewerk-link"><a href="#/invullen/projecten">' + icoon('pencil') + 'Dit project bewerken</a></p></article>';
  return html;
}

function paginaLogboek() {
  const ups = updatesGesorteerd();
  return '<article class="detail"><h1>Logboek</h1>' +
    '<p>Mijn wekelijkse voortgangsrapportage. Bij elk bericht staat in welk focusgebied ik vooral zat en welke leerdoelen het raakt.</p>' +
    (ups.length ? '<ul class="overzicht">' + ups.map(u => {
      const nrs = (u.leerdoelen || []).map(nummerVan).filter(n => n > 0);
      return '<li class="rij"><span class="rij-icoon">' + icoon('book-open') + '</span>' +
        '<a class="rij-titel" href="#/update/' + h(u.id) + '">' + h(u.titel || 'Zonder titel') + '</a>' +
        '<span class="meta">' + datumNL(u.datum) + (u.focus ? ' · ' + h(u.focus) : '') + (nrs.length ? ' · leerdoel ' + nrs.join(', ') : '') + '</span></li>';
    }).join('') + '</ul>' : '<p class="stil">Nog geen berichten.</p>') +
    '<p class="bewerk-link"><a href="#/invullen/logboek">' + icoon('pencil') + 'Bericht schrijven of bewerken</a></p></article>';
}

function paginaUpdate(id) {
  const u = update(id);
  if (!u) return nietGevonden('Dit bericht bestaat niet (meer).');
  const alle = updatesGesorteerd();
  const i = alle.findIndex(x => x.id === id);
  const nieuwer = i > 0 ? alle[i - 1] : null;
  const ouder = i < alle.length - 1 ? alle[i + 1] : null;
  const p = u.project ? project(u.project) : null;
  let html = '<article class="detail">' +
    '<p class="terug"><a href="#/logboek">' + icoon('arrow-left') + 'Alle berichten</a></p>' +
    '<p class="label">' + datumNL(u.datum) + '</p><h1>' + h(u.titel || 'Zonder titel') + '</h1>' +
    '<p class="kenmerken">' + (u.focus ? '<span class="kenmerk">' + icoon('compass') + 'Focusgebied: ' + h(u.focus) + '</span>' : '') +
    (p ? '<span class="kenmerk">' + icoon('folder') + '<a href="#/project/' + h(p.id) + '">' + h(p.titel) + '</a></span>' : '') + '</p>';
  if (u.gedaan) html += '<h2>Wat ik heb gedaan</h2>' + tekst(u.gedaan);
  if (u.geleerd) html += '<h2>Wat ik heb geleerd</h2>' + tekst(u.geleerd);
  if (u.volgende) html += '<h2>Volgende stap</h2>' + tekst(u.volgende);
  const doelen = (u.leerdoelen || []).map(leerdoel).filter(Boolean);
  if (doelen.length) html += '<h2>Raakt deze leerdoelen</h2><ul class="lijst">' + doelen.map(l => '<li>' + statusHtml(l.status) + leerdoelLink(l.id) + '</li>').join('') + '</ul>';
  html += '<p class="blader">' + (ouder ? '<a href="#/update/' + h(ouder.id) + '">Ouder: ' + h(ouder.titel) + '</a>' : '<span></span>') +
    (nieuwer ? '<a href="#/update/' + h(nieuwer.id) + '">Nieuwer: ' + h(nieuwer.titel) + '</a>' : '') + '</p>';
  html += '<p class="bewerk-link"><a href="#/invullen/logboek">' + icoon('pencil') + 'Dit bericht bewerken</a></p></article>';
  return html;
}

function nietGevonden(bericht) {
  return '<article class="detail"><h1>Niet gevonden</h1><p>' + h(bericht || 'Deze pagina bestaat niet.') + '</p><p><a href="#/">Naar de startpagina</a></p></article>';
}

/* ---------- router en opbouw ---------- */

function route() {
  const delen = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  return { pagina: delen[0] || 'start', id: delen[1] || '', sub: delen[2] || '' };
}

function renderMenu(pagina) {
  const items = [
    ['start', '#/', 'house', 'Start', ['start']],
    ['leerdoelen', '#/leerdoelen', 'target', 'Leerdoelen', ['leerdoelen', 'leerdoel']],
    ['projecten', '#/projecten', 'folder', 'Projecten', ['projecten', 'project']],
    ['logboek', '#/logboek', 'book-open', 'Logboek', ['logboek', 'update']],
    ['invullen', '#/invullen', 'pencil', 'Invullen', ['invullen']]
  ];
  document.getElementById('menu').innerHTML = items.map(it =>
    '<a href="' + it[1] + '"' + (it[4].includes(pagina) ? ' aria-current="page"' : '') + (it[0] === 'invullen' ? ' class="menu-invullen"' : '') + '>' + icoon(it[2]) + it[3] + '</a>'
  ).join('');
}

function renderBanner() {
  const el = document.getElementById('banner');
  if (!S.data || !heeftConcept()) { el.innerHTML = ''; return; }
  const tekstje = S.conceptVerouderd
    ? 'Let op: sinds je aan dit concept begon is er een nieuwere versie gepubliceerd. Publiceer je concept alleen als je die wijzigingen niet kwijt wilt raken, of gooi het concept weg.'
    : 'Je bekijkt een concept met wijzigingen die nog niet gepubliceerd zijn. Alleen jij ziet dit, in deze browser.';
  el.innerHTML = '<div class="banner' + (S.conceptVerouderd ? ' banner-let-op' : '') + '">' + icoon(S.conceptVerouderd ? 'triangle-alert' : 'info') +
    '<span>' + tekstje + '</span><a class="knop knop-klein" href="#/invullen/publiceren">' + icoon('send') + 'Publiceren</a></div>';
}

function render() {
  const r = route();
  renderMenu(r.pagina);
  const inhoud = document.getElementById('inhoud');
  if (!S.data) {
    inhoud.innerHTML = '<article class="detail"><h1>Portfolio kon niet laden</h1><p>' + h(S.laadfout) + '</p></article>';
    return;
  }
  const st = S.data.student || {};
  document.getElementById('kop-naam').textContent = st.naam || 'Mijn portfolio';
  document.title = (st.naam ? st.naam + ' · ' : '') + 'Portfolio minor Circulaire Economie';
  document.getElementById('voet').innerHTML = '<p>' + h([st.naam, st.opleiding].filter(Boolean).join(' · ')) + ' · minor Circulaire Economie' + (st.cohort ? ', ' + h(st.cohort) : '') + '</p>';
  renderBanner();

  let html;
  switch (r.pagina) {
    case 'start': html = paginaStart(); break;
    case 'leerdoelen': html = paginaLeerdoelen(); break;
    case 'leerdoel': html = paginaLeerdoel(r.id); break;
    case 'projecten': html = paginaProjecten(); break;
    case 'project': html = paginaProject(r.id); break;
    case 'logboek': html = paginaLogboek(); break;
    case 'update': html = paginaUpdate(r.id); break;
    case 'invullen': html = paginaInvullen(r.id, r.sub); break;
    default: html = nietGevonden();
  }
  inhoud.innerHTML = html;
  if (location.hash !== S.laatsteHash) window.scrollTo(0, 0);
  S.laatsteHash = location.hash;
}

/* ---------- concept in de browser ---------- */

function normaliseer(obj) { return JSON.stringify(obj); }
function heeftConcept() { return S.data && normaliseer(S.data) !== S.gepubliceerd; }

function leesConcept() {
  try { return JSON.parse(localStorage.getItem(OPSLAG) || 'null'); } catch (e) { return null; }
}
function bewaarConcept() {
  try { localStorage.setItem(OPSLAG, JSON.stringify({ basis: S.gepubliceerd, data: S.data })); } catch (e) { /* privévenster of vol: dan blijft het concept alleen in het geheugen */ }
  renderBanner();
}
function verwijderConcept() {
  try { localStorage.removeItem(OPSLAG); } catch (e) { /* niets */ }
  S.data = JSON.parse(S.gepubliceerd);
  S.conceptVerouderd = false;
  render();
}

async function laden() {
  try {
    const antwoord = await fetch('data/portfolio.json', { cache: 'no-store' });
    if (!antwoord.ok) throw new Error('data/portfolio.json geeft status ' + antwoord.status);
    const gepubliceerd = await antwoord.json();
    S.gepubliceerd = normaliseer(gepubliceerd);
    S.data = gepubliceerd;
    const concept = leesConcept();
    if (concept && concept.data) {
      if (normaliseer(concept.data) === S.gepubliceerd) {
        try { localStorage.removeItem(OPSLAG); } catch (e) { /* niets */ }
      } else {
        S.data = concept.data;
        S.conceptVerouderd = concept.basis !== S.gepubliceerd;
      }
    }
  } catch (e) {
    S.data = null;
    S.laadfout = location.protocol === 'file:'
      ? 'Je hebt index.html rechtstreeks geopend. Open het portfolio via het adres van je GitHub Pages-site (of via een lokaal servertje); anders mag de browser het databestand niet lezen.'
      : 'Het databestand kon niet worden gelezen: ' + e.message + '. Controleer of data/portfolio.json geldige JSON is.';
  }
  render();
}

document.addEventListener('click', ev => {
  const doel = ev.target.closest('[data-scroll]');
  if (doel) {
    const el = document.getElementById(doel.getAttribute('data-scroll'));
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('tl-licht'); setTimeout(() => el.classList.remove('tl-licht'), 1600); }
  }
});
document.addEventListener('keydown', ev => {
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[data-scroll]')) { ev.preventDefault(); ev.target.click(); }
});
window.addEventListener('hashchange', render);
laden();
