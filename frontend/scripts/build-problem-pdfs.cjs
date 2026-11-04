const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const katex = require('katex');
const {spawnSync} = require('child_process');
const mod = {exports:{}};
new Function('exports', ts.transpileModule(fs.readFileSync('lib/classiques-problems.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(mod.exports);
const out = path.resolve('public/problemes');
const tmp = path.resolve('tmp/pdfs');
fs.mkdirSync(out,{recursive:true}); fs.mkdirSync(tmp,{recursive:true});
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const math = (s,displayMode=false) => katex.renderToString(s,{displayMode,throwOnError:false});
const text = s => (s||'').split(/(\$[^$]+\$)/g).map(p=>p.startsWith('$')?math(p.slice(1,-1)):esc(p)).join('');
for(const p of mod.exports.CLASSIQUES_PROBLEMS) for(const mode of ['enonce','corrige']) {
 const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><link rel="stylesheet" href="file:///${path.resolve('node_modules/katex/dist/katex.min.css').replace(/\\/g,'/')}"><style>@page{size:A4;margin:20mm}body{font:12pt Georgia;line-height:1.65;color:#172033}header{font:10pt Arial;color:#42628d;border-bottom:1px solid #bbc9dc;padding-bottom:12px}h1{font: bold 23pt Arial;line-height:1.2}h2{font:bold 14pt Arial;color:#2354a1;margin-top:26px}article{break-inside:avoid;margin:18px 0}.katex-display{font-size:.95em}footer{margin-top:30px;font:9pt Arial;color:#64748b}</style><header>NEXORA · ${p.moduleTitle} · ${p.filiere} · ${mode==='enonce'?'ÉNONCÉ':'CORRIGÉ'}</header><h1>${esc(p.title)}</h1><p>${p.recommendedDuration} · ${p.totalPoints} points</p>${mode==='enonce'?`<p>${text(p.intro)}</p>`:''}${p.questions.map(part=>`<h2>${esc(part.partTitle)}</h2>${part.items.map(q=>`<article><b>Question ${q.qNum} · ${q.points} pts</b><p>${text(mode==='enonce'?q.statement:q.solution)}</p>${(mode==='enonce'?q.math:q.solutionMath)?math(mode==='enonce'?q.math:q.solutionMath,true):''}</article>`).join('')}`).join('')}<footer>Document pédagogique Nexora · Contenu du prototype</footer></html>`;
 const src=path.join(tmp,`${p.id}-${mode}.html`);fs.writeFileSync(src,html);
 const result=spawnSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless','--disable-gpu','--no-pdf-header-footer',`--user-data-dir=${path.join(tmp,'edge-profile')}`,`--print-to-pdf=${path.join(out,`${p.id}-${mode}.pdf`)}`,`file:///${src.replace(/\\/g,'/')}`],{timeout:30000,windowsHide:true,stdio:'ignore'});
 if(result.status!==0 || !fs.existsSync(path.join(out,`${p.id}-${mode}.pdf`))) throw Error(`Failed ${p.id} ${mode}`);
 console.log(`${p.id}-${mode}.pdf`);
}
