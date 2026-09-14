'use strict';
/* Invulformulier. Elk veld heeft een data-pad naar een plek in S.data
   (bijvoorbeeld "leerdoelen.0.titel"). Wijzigingen worden direct in het
   concept bewaard; publiceren zet ze in data/portfolio.json op GitHub. */

const TABS = [
  ['profiel', 'user', 'Profiel'],
  ['leerdoelen', 'target', 'Leerdoelen'],
  ['projecten', 'folder', 'Projecten'],
  ['logboek', 'book-open', 'Logboek'],
  ['publiceren', 'send', 'Publiceren']
];

function nieuwId(voorvoegsel) { return voorvoegsel + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

function leesPad(pad) {
  return pad.split('.').reduce((o, k) => (o == null ? undefined : o[k]), S.data);
}
function zetPad(pad, waarde) {
  const delen = pad.split('.');
  let o = S.data;
  for (let i = 0; i < delen.length - 1; i++) {
    if (o[delen[i]] == null) o[delen[i]] = /^\d+$/.test(delen[i + 1]) ? [] : {};
    o = o[delen[i]];
  }
  o[delen[delen.length - 1]] = waarde;
}

/* ---------- formulierbouwstenen ---------- */

function veld(label, pad, opties) {
  opties = opties || {};
  const waarde = leesPad(pad);
  const id = 'v-' + pad.replace(/\./g, '-');
  return '<div class="veld"><label for="' + id + '">' + h(label) + '</label>' +
    '<input id="' + id + '" type="' + (opties.type || 'text') + '" data-pad="' + h(pad) + '" value="' + h(waarde == null ? '' : waarde) + '"' +
    (opties.placeholder ? ' placeholder="' + h(opties.placeholder) + '"' : '') + '>' +
    (opties.hulp ? '<p class="hulp">' + opties.hulp + '</p>' : '') + '</div>';
}
function tekstveld(label, pad, opties) {
  opties = opties || {};
  const waarde = leesPad(pad);
  const id = 'v-' + pad.replace(/\./g, '-');
  return '<div class="veld"><label for="' + id + '">' + h(label) + '</label>' +
    '<textarea id="' + id + '" data-pad="' + h(pad) + '" rows="' + (opties.rijen || 5) + '"' + (opties.placeholder ? ' placeholder="' + h(opties.placeholder) + '"' : '') + '>' + h(waarde == null ? '' : waarde) + '</textarea>' +
    (opties.hulp ? '<p class="hulp">' + opties.hulp + '</p>' : '') + '</div>';
}
function keuze(label, pad, keuzes, opties) {
  opties = opties || {};
  const waarde = leesPad(pad) || '';
  const id = 'v-' + pad.replace(/\./g, '-');
  return '<div class="veld"><label for="' + id + '">' + h(label) + '</label><select id="' + id + '" data-pad="' + h(pad) + '">' +
    keuzes.map(k => '<option value="' + h(k[0]) + '"' + (k[0] === waarde ? ' selected' : '') + '>' + h(k[1]) + '</option>').join('') +
    '</select>' + (opties.hulp ? '<p class="hulp">' + opties.hulp + '</p>' : '') + '</div>';
}
function schuif(label, pad) {
  const waarde = Number(leesPad(pad)) || 0;
  const id = 'v-' + pad.replace(/\./g, '-');
  return '<div class="veld veld-schuif"><label for="' + id + '">' + h(label) + '</label>' +
    '<div class="schuif"><input id="' + id + '" type="range" min="0" max="100" step="5" data-pad="' + h(pad) + '" value="' + waarde + '"><output for="' + id + '">' + waarde + '%</output></div></div>';
}
function leerdoelVinkjes(pad) {
  const gekozen = leesPad(pad) || [];
  const doelen = S.data.leerdoelen || [];
  if (!doelen.length) return '<p class="hulp">Nog geen leerdoelen om aan te koppelen.</p>';
  return '<div class="vinkjes">' + doelen.map(l =>
    '<label class="vink"><input type="checkbox" data-pad="' + h(pad) + '" data-id="' + h(l.id) + '"' + (gekozen.includes(l.id) ? ' checked' : '') + '> ' + nummerVan(l.id) + '. ' + h(l.titel || 'Zonder titel') + '</label>'
  ).join('') + '</div>';
}
function knop(actie, ic, label, extra) {
  return '<button type="button" class="knop ' + (extra && extra.klasse ? extra.klasse : 'knop-2') + '" data-actie="' + actie + '"' +
    (extra && extra.i != null ? ' data-i="' + extra.i + '"' : '') + (extra && extra.j != null ? ' data-j="' + extra.j + '"' : '') + '>' + icoon(ic) + h(label) + '</button>';
}
const FOCUSKEUZES = [['', 'Geen focusgebied']].concat(FOCUSGEBIEDEN.map(f => [f, f]));

/* ---------- tabbladen ---------- */

function paginaInvullen(tab, sub) {
  if (!TABS.some(t => t[0] === tab)) tab = 'profiel';
  let html = '<article class="detail invullen"><h1>Invullen</h1>' +
    '<p>Alles wat je hier invult zie je meteen terug op de site, als concept in deze browser. Klaar? Ga naar <a href="#/invullen/publiceren">Publiceren</a> om het online te zetten.</p>' +
    '<nav class="tabs" aria-label="Onderdelen">' + TABS.map(t => '<a href="#/invullen/' + t[0] + '"' + (t[0] === tab ? ' aria-current="page"' : '') + '>' + icoon(t[1]) + t[2] + '</a>').join('') + '</nav>';
  switch (tab) {
    case 'profiel': html += tabProfiel(); break;
    case 'leerdoelen': html += tabLeerdoelen(); break;
    case 'projecten': html += tabProjecten(); break;
    case 'logboek': html += tabLogboek(); break;
    case 'publiceren': html += tabPubliceren(); break;
  }
  return html + '</article>';
}

function tabProfiel() {
  return '<form class="formulier" autocomplete="off">' +
    veld('Naam', 'student.naam') +
    veld('Opleiding', 'student.opleiding', { placeholder: 'Bijvoorbeeld: Bedrijfskunde, HAN' }) +
    veld('Cohort', 'student.cohort', { placeholder: 'Bijvoorbeeld: september 2026' }) +
    tekstveld('Over mij en mijn opdracht', 'student.intro', { rijen: 8, hulp: 'Wie je bent, voor wie je werkt en waar de site over gaat. Een lege regel begint een nieuwe alinea.' }) +
    veld('Adres van je GitHub-repository', 'student.repo', { placeholder: 'https://github.com/jouwnaam/portfolio-minor-ce', hulp: 'Alleen nodig als de site niet op github.io staat; anders wordt dit zelf gevonden.' }) +
    '<p class="hulp">' + icoon('eye') + ' <a href="#/">Bekijk de startpagina</a> om te zien hoe het eruitziet.</p></form>';
}

function tabLeerdoelen() {
  const doelen = S.data.leerdoelen || [];
  let html = '<form class="formulier" autocomplete="off">';
  if (!doelen.length) html += '<p class="stil">Nog geen leerdoelen.</p>';
  doelen.forEach((l, i) => {
    const p = 'leerdoelen.' + i;
    html += '<section class="item"><div class="item-kop"><h2>Leerdoel ' + (i + 1) + (l.titel ? ': ' + h(l.titel) : '') + '</h2><div class="item-knoppen">' +
      (i > 0 ? knop('ld-omhoog', 'chevron-up', 'Omhoog', { i }) : '') + (i < doelen.length - 1 ? knop('ld-omlaag', 'chevron-down', 'Omlaag', { i }) : '') +
      knop('ld-verwijderen', 'trash-2', 'Verwijderen', { i, klasse: 'knop-gevaar' }) + '</div></div>' +
      veld('Titel', p + '.titel', { placeholder: 'Wat wil je kunnen aan het einde van de minor?' }) +
      '<div class="rij-velden">' +
      keuze('Status', p + '.status', [['gepland', 'Gepland'], ['bezig', 'Bezig'], ['behaald', 'Behaald']]) +
      veld('Streefdatum', p + '.streefdatum', { type: 'date' }) + '</div>' +
      schuif('Voortgang', p + '.voortgang') +
      tekstveld('Beschrijving', p + '.beschrijving', { rijen: 8, hulp: 'Wat je wilt kunnen en waarom juist dit. Begin een regel met <code>## </code> voor een tussenkop, met <code>- </code> voor een opsomming.' }) +
      tekstveld('Waar ik sta en wat ik ervan leer', p + '.reflectie', { rijen: 6, hulp: 'Werk dit bij als je voortgang verandert. Zet een leerdoel pas op behaald als hier een reflectie staat (hulpmiddel 7).' }) +
      '<h3>Bewijsstukken</h3>';
    const bewijs = l.bewijs || [];
    bewijs.forEach((b, j) => {
      const q = p + '.bewijs.' + j;
      html += '<div class="rij-velden rij-bewijs">' + veld('Omschrijving', q + '.tekst') + veld('Link', q + '.url', { placeholder: 'bewijs/foto.jpg of https://…' }) +
        knop('bewijs-verwijderen', 'trash-2', 'Weg', { i, j, klasse: 'knop-gevaar knop-klein' }) + '</div>';
    });
    html += '<p>' + knop('bewijs-toevoegen', 'plus', 'Bewijsstuk toevoegen', { i }) + '</p>' +
      '<p class="hulp">Foto\'s en documenten upload je in de map <code>bewijs</code> van je repository (Add file, Upload files) en link je hier als <code>bewijs/bestandsnaam.jpg</code>. Iets wat niet openbaar mag, beschrijf je zonder link.</p>' +
      '</section>';
  });
  html += '<p>' + knop('ld-toevoegen', 'plus', 'Leerdoel toevoegen', { klasse: 'knop' }) + '</p></form>';
  return html;
}

function tabProjecten() {
  const projecten = S.data.projecten || [];
  let html = '<form class="formulier" autocomplete="off">';
  if (!projecten.length) html += '<p class="stil">Nog geen projecten.</p>';
  projecten.forEach((pr, i) => {
    const p = 'projecten.' + i;
    html += '<section class="item"><div class="item-kop"><h2>' + (pr.titel ? h(pr.titel) : 'Project ' + (i + 1)) + '</h2><div class="item-knoppen">' +
      (i > 0 ? knop('pr-omhoog', 'chevron-up', 'Omhoog', { i }) : '') + (i < projecten.length - 1 ? knop('pr-omlaag', 'chevron-down', 'Omlaag', { i }) : '') +
      knop('pr-verwijderen', 'trash-2', 'Verwijderen', { i, klasse: 'knop-gevaar' }) + '</div></div>' +
      veld('Titel', p + '.titel') +
      veld('Opdrachtgever', p + '.opdrachtgever') +
      '<div class="rij-velden">' + veld('Startdatum', p + '.start', { type: 'date' }) + veld('Einddatum', p + '.einde', { type: 'date' }) + '</div>' +
      '<p class="hulp">Start en einde bepalen de lengte van de tijdlijn.</p>' +
      tekstveld('Beschrijving', p + '.beschrijving', { rijen: 8, hulp: 'Aanleiding, de vraag, waar je nu staat. Werk "waar ik nu sta" regelmatig bij.' }) +
      '<h3>Draagt bij aan leerdoelen</h3>' + leerdoelVinkjes(p + '.leerdoelen') +
      '<h3>Momenten op de tijdlijn</h3>' +
      '<p class="hulp">Gesprekken, mijlpalen, opleveringen, presentaties: alles wat het proces zichtbaar maakt. Momenten in de toekomst verschijnen als gepland. Je logboekberichten bij dit project komen er vanzelf bij.</p>';
    const momenten = pr.momenten || [];
    momenten.forEach((m, j) => {
      const q = p + '.momenten.' + j;
      html += '<div class="moment"><div class="rij-velden">' +
        veld('Datum', q + '.datum', { type: 'date' }) + veld('Titel', q + '.titel') + keuze('Focusgebied', q + '.focus', FOCUSKEUZES) +
        '</div>' + tekstveld('Toelichting', q + '.tekst', { rijen: 2 }) +
        '<p class="moment-knoppen">' + knop('moment-verwijderen', 'trash-2', 'Moment verwijderen', { i, j, klasse: 'knop-gevaar knop-klein' }) + '</p></div>';
    });
    html += '<p>' + knop('moment-toevoegen', 'plus', 'Moment toevoegen', { i }) + ' ' + (momenten.length > 1 ? knop('moment-sorteren', 'calendar', 'Sorteer op datum', { i }) : '') + '</p>' +
      '<p class="hulp">' + icoon('eye') + ' <a href="#/project/' + h(pr.id) + '">Bekijk de tijdlijn van dit project</a></p></section>';
  });
  html += '<p>' + knop('pr-toevoegen', 'plus', 'Project toevoegen', { klasse: 'knop' }) + '</p></form>';
  return html;
}

function tabLogboek() {
  const ups = S.data.updates || [];
  const projecten = S.data.projecten || [];
  let html = '<form class="formulier" autocomplete="off"><p>' + knop('up-toevoegen', 'plus', 'Nieuw bericht', { klasse: 'knop' }) + '</p>';
  if (!ups.length) html += '<p class="stil">Nog geen berichten.</p>';
  ups.forEach((u, i) => {
    const p = 'updates.' + i;
    html += '<details class="item item-details"' + (i === 0 ? ' open' : '') + '><summary><span>' + (u.titel ? h(u.titel) : 'Nieuw bericht') + '</span><span class="meta">' + datumNL(u.datum) + '</span></summary>' +
      '<div class="rij-velden">' + veld('Datum', p + '.datum', { type: 'date' }) + veld('Titel', p + '.titel', { placeholder: 'Bijvoorbeeld: Week 4: gesprek met de aannemer' }) + '</div>' +
      '<div class="rij-velden">' + keuze('Focusgebied', p + '.focus', FOCUSKEUZES, { hulp: 'Waar zat je aandacht vooral? Dit is een label, geen fase die je afvinkt.' }) +
      keuze('Project', p + '.project', [['', 'Geen project']].concat(projecten.map(pr => [pr.id, pr.titel || 'Zonder titel']))) + '</div>' +
      tekstveld('Wat ik heb gedaan', p + '.gedaan', { rijen: 4 }) +
      tekstveld('Wat ik heb geleerd', p + '.geleerd', { rijen: 5, hulp: 'Dit stukje komt ook op de tijdlijn van je project.' }) +
      tekstveld('Volgende stap', p + '.volgende', { rijen: 3 }) +
      '<h3>Raakt deze leerdoelen</h3>' + leerdoelVinkjes(p + '.leerdoelen') +
      '<p class="item-knoppen">' + knop('up-verwijderen', 'trash-2', 'Bericht verwijderen', { i, klasse: 'knop-gevaar knop-klein' }) + '</p></details>';
  });
  return html + '</form>';
}

function repoAdres() {
  const eigen = ((S.data.student || {}).repo || '').trim().replace(/\/+$/, '');
  if (/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(eigen)) return eigen;
  const m = /^([^.]+)\.github\.io$/i.exec(location.hostname);
  if (!m) return '';
  const map = location.pathname.split('/').filter(Boolean)[0];
  return 'https://github.com/' + m[1] + '/' + (map || m[1] + '.github.io');
}

function tabPubliceren() {
  const repo = repoAdres();
  const wijzigingen = heeftConcept();
  let html = '<div class="formulier">';
  html += wijzigingen
    ? '<p class="samenvatting">' + icoon('info') + ' Je hebt wijzigingen die nog niet online staan.</p>'
    : '<p class="samenvatting">' + icoon('check') + ' Alles wat je ziet staat al online. Er is niets te publiceren.</p>';
  if (S.conceptVerouderd) html += '<p class="let-op">' + icoon('triangle-alert') + ' Sinds je aan dit concept begon is er online een nieuwere versie gepubliceerd (bijvoorbeeld vanaf een ander apparaat). Als je nu publiceert, overschrijf je die. Twijfel je? Gooi het concept weg en begin opnieuw vanaf de online versie.</p>';
  html += '<h2>Zo zet je het online</h2>' +
    '<p>Publiceren gaat via GitHub, waar je al ingelogd bent. Deze knop kopieert je hele portfolio naar het klembord en opent het databestand op GitHub.</p>' +
    '<p class="knoppen">' + (repo
      ? knop('publiceer-github', 'external-link', 'Kopieer en open GitHub', { klasse: 'knop' })
      : '<span class="let-op">' + icoon('triangle-alert') + ' Ik weet niet waar je repository staat. Vul het adres in bij <a href="#/invullen/profiel">Profiel</a>.</span>') +
    ' ' + knop('kopieer-json', 'copy', 'Alleen kopiëren') + ' ' + knop('download-json', 'download', 'Download portfolio.json') + '</p>' +
    '<p id="publiceer-melding" class="melding" aria-live="polite"></p>' +
    '<ol class="stappen"><li>Klik op de knop hierboven. GitHub opent in een nieuw tabblad met het bestand <code>data/portfolio.json</code> in de editor.</li>' +
    '<li>Klik in de editor, selecteer alles (Ctrl+A of Cmd+A) en plak (Ctrl+V of Cmd+V). De oude inhoud wordt vervangen door je nieuwe versie.</li>' +
    '<li>Klik rechtsboven op <strong>Commit changes</strong> en daarna nog eens op <strong>Commit changes</strong>.</li>' +
    '<li>Na een minuut staat je portfolio online. Ververs deze site; het concept verdwijnt vanzelf zodra de online versie gelijk is.</li></ol>' +
    (repo ? '<p class="hulp">Repository: <a href="' + h(repo) + '" target="_blank" rel="noopener">' + h(repo) + '</a></p>' : '') +
    '<details class="json-details"><summary>Bekijk de inhoud van portfolio.json</summary><textarea id="json-uit" readonly rows="14" spellcheck="false">' + h(JSON.stringify(S.data, null, 2)) + '</textarea></details>' +
    '<h2>Concept</h2>' +
    '<p>Je wijzigingen staan alleen in deze browser, totdat je publiceert. Wil je terug naar wat online staat, gooi het concept dan weg. Heb je eerder een portfolio.json gedownload, dan kun je die hier terugzetten.</p>' +
    '<p class="knoppen">' + knop('concept-weggooien', 'rotate-ccw', 'Concept weggooien', { klasse: 'knop-gevaar' }) +
    ' <label class="knop knop-2">' + icoon('upload') + 'Bestand terugzetten<input type="file" accept=".json,application/json" id="json-in" hidden></label></p>';
  return html + '</div>';
}

/* ---------- gebeurtenissen ---------- */

function kopieerJson() {
  const t = JSON.stringify(S.data, null, 2);
  const ta = document.getElementById('json-uit');
  let gelukt = false;
  if (ta) {
    try { ta.focus(); ta.select(); gelukt = document.execCommand('copy'); } catch (e) { gelukt = false; }
    window.getSelection().removeAllRanges();
  }
  if (gelukt) return Promise.resolve(true);
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(() => true, () => false);
  return Promise.resolve(false);
}
function melding(html) {
  const el = document.getElementById('publiceer-melding');
  if (el) el.innerHTML = html;
}
function downloadJson() {
  const blob = new Blob([JSON.stringify(S.data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'portfolio.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function waardeUit(el) {
  if (el.type === 'range' || el.type === 'number') return Number(el.value);
  return el.value;
}

document.addEventListener('input', ev => {
  const el = ev.target;
  if (!el.matches || !el.matches('[data-pad]') || el.type === 'checkbox' || el.tagName === 'SELECT') return;
  const pad = el.getAttribute('data-pad');
  zetPad(pad, waardeUit(el));
  if (el.type === 'range') { const out = el.parentElement.querySelector('output'); if (out) out.textContent = el.value + '%'; }
  if (pad === 'student.naam') document.getElementById('kop-naam').textContent = el.value || 'Mijn portfolio';
  bewaarConcept();
});

document.addEventListener('change', ev => {
  const el = ev.target;
  if (el.id === 'json-in') { terugzetten(el.files[0]); return; }
  if (!el.matches || !el.matches('[data-pad]')) return;
  const pad = el.getAttribute('data-pad');
  if (el.type === 'checkbox') {
    const lijst = (leesPad(pad) || []).slice();
    const id = el.getAttribute('data-id');
    const idx = lijst.indexOf(id);
    if (el.checked && idx < 0) lijst.push(id);
    if (!el.checked && idx >= 0) lijst.splice(idx, 1);
    zetPad(pad, lijst);
  } else if (el.tagName === 'SELECT') {
    zetPad(pad, el.value);
    if (/\.status$/.test(pad) && el.value === 'behaald') {
      const vp = pad.replace(/\.status$/, '.voortgang');
      if ((Number(leesPad(vp)) || 0) < 100) {
        zetPad(vp, 100);
        const s = document.getElementById('v-' + vp.replace(/\./g, '-'));
        if (s) { s.value = 100; const out = s.parentElement.querySelector('output'); if (out) out.textContent = '100%'; }
      }
    }
  } else {
    zetPad(pad, waardeUit(el));
  }
  bewaarConcept();
});

function terugzetten(bestand) {
  if (!bestand) return;
  bestand.text().then(t => {
    const d = JSON.parse(t);
    if (!d || typeof d !== 'object' || !('student' in d)) throw new Error('geen portfolio');
    d.leerdoelen = d.leerdoelen || []; d.projecten = d.projecten || []; d.updates = d.updates || [];
    S.data = d;
    bewaarConcept();
    render();
    melding(icoon('check') + ' Bestand teruggezet als concept. Controleer de site en publiceer daarna.');
  }).catch(() => melding(icoon('triangle-alert') + ' Dit bestand is geen geldig portfolio.json.'));
}

function verplaats(lijst, i, richting) {
  const j = i + richting;
  if (j < 0 || j >= lijst.length) return;
  const t = lijst[i]; lijst[i] = lijst[j]; lijst[j] = t;
}

document.addEventListener('click', ev => {
  const kn = ev.target.closest('[data-actie]');
  if (!kn) return;
  ev.preventDefault();
  const actie = kn.getAttribute('data-actie');
  const i = Number(kn.getAttribute('data-i'));
  const j = Number(kn.getAttribute('data-j'));
  const D = S.data;
  D.leerdoelen = D.leerdoelen || []; D.projecten = D.projecten || []; D.updates = D.updates || [];
  let herbouw = true;
  switch (actie) {
    case 'ld-toevoegen': D.leerdoelen.push({ id: nieuwId('ld'), titel: '', status: 'gepland', voortgang: 0, streefdatum: '', beschrijving: '', reflectie: '', bewijs: [] }); break;
    case 'ld-verwijderen':
      if (!confirm('Dit leerdoel verwijderen? Koppelingen vanuit berichten en projecten vervallen ook.')) return;
      { const id = D.leerdoelen[i].id; D.leerdoelen.splice(i, 1);
        D.updates.forEach(u => { u.leerdoelen = (u.leerdoelen || []).filter(x => x !== id); });
        D.projecten.forEach(p => { p.leerdoelen = (p.leerdoelen || []).filter(x => x !== id); }); }
      break;
    case 'ld-omhoog': verplaats(D.leerdoelen, i, -1); break;
    case 'ld-omlaag': verplaats(D.leerdoelen, i, 1); break;
    case 'bewijs-toevoegen': D.leerdoelen[i].bewijs = D.leerdoelen[i].bewijs || []; D.leerdoelen[i].bewijs.push({ tekst: '', url: '' }); break;
    case 'bewijs-verwijderen': D.leerdoelen[i].bewijs.splice(j, 1); break;
    case 'pr-toevoegen': D.projecten.push({ id: nieuwId('pr'), titel: '', opdrachtgever: '', start: '', einde: '', beschrijving: '', leerdoelen: [], momenten: [] }); break;
    case 'pr-verwijderen':
      if (!confirm('Dit project verwijderen, inclusief de momenten op de tijdlijn?')) return;
      { const id = D.projecten[i].id; D.projecten.splice(i, 1); D.updates.forEach(u => { if (u.project === id) u.project = ''; }); }
      break;
    case 'pr-omhoog': verplaats(D.projecten, i, -1); break;
    case 'pr-omlaag': verplaats(D.projecten, i, 1); break;
    case 'moment-toevoegen': D.projecten[i].momenten = D.projecten[i].momenten || []; D.projecten[i].momenten.push({ datum: isoVandaag(), titel: '', focus: '', tekst: '' }); break;
    case 'moment-verwijderen': D.projecten[i].momenten.splice(j, 1); break;
    case 'moment-sorteren': D.projecten[i].momenten.sort((a, b) => (a.datum || '').localeCompare(b.datum || '')); break;
    case 'up-toevoegen':
      D.updates.unshift({ id: nieuwId('up'), datum: isoVandaag(), titel: '', focus: '', project: D.projecten.length === 1 ? D.projecten[0].id : '', leerdoelen: [], gedaan: '', geleerd: '', volgende: '' });
      break;
    case 'up-verwijderen': if (!confirm('Dit bericht verwijderen?')) return; D.updates.splice(i, 1); break;
    case 'publiceer-github':
      herbouw = false;
      kopieerJson().then(ok => {
        melding(ok ? icoon('check') + ' Gekopieerd. In het GitHub-tabblad: klik in de editor, Ctrl+A, Ctrl+V, dan Commit changes.'
                   : icoon('triangle-alert') + ' Kopiëren lukte niet automatisch. Open hieronder de inhoud, selecteer alles en kopieer zelf.');
      });
      window.open(repoAdres() + '/edit/main/data/portfolio.json', '_blank', 'noopener');
      break;
    case 'kopieer-json':
      herbouw = false;
      kopieerJson().then(ok => melding(ok ? icoon('check') + ' Gekopieerd naar het klembord.' : icoon('triangle-alert') + ' Kopiëren lukte niet; open de inhoud hieronder en kopieer zelf.'));
      break;
    case 'download-json': herbouw = false; downloadJson(); break;
    case 'concept-weggooien':
      if (!heeftConcept()) { melding('Er is geen concept; je ziet al de online versie.'); return; }
      if (!confirm('Alle niet-gepubliceerde wijzigingen weggooien?')) return;
      verwijderConcept(); return;
    default: return;
  }
  if (herbouw) { bewaarConcept(); render(); }
});
