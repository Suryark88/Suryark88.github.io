/* Surya's Smart Portfolio Assistant — static, no API keys or backend. */
(() => {
  'use strict';
  const root = document.getElementById('surya-assistant-root');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const fallback = {name:'Surya Ram Kumar',headline:'Service Delivery and automation professional',summary:'Surya works in service delivery, customer success and workflow automation.',skills:['Power Apps','Power Automate','Copilot Studio','Service Delivery'],projects:[],experience:'Service delivery and customer success.',contact:{portfolio:'https://suryark88.github.io/'},suggestedQuestions:['Who is Surya?','What are his skills?','What projects has he built?','How can I contact him?']};
  const normalize = s => String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  const escapeText = s => String(s == null ? '' : s);
  const stop = new Set('a an the is are was were do does did has have had about for from what who which where when why how can could would please tell me more surya his him he i you your of in on and to with some give know'.split(' '));
  function score(query, text) {
    const q = normalize(query).split(' ').filter(w => w.length>2 && !stop.has(w));
    const t = normalize(text); let total=0;
    for(const w of q) if(t.split(' ').includes(w)) total+=3; else if(w.length>=5 && t.includes(w)) total+=1;
    return total;
  }
  function answer(question,k){
    const q=normalize(question), contact=k.contact||{}, projects=Array.isArray(k.projects)?k.projects:[], skills=Array.isArray(k.skills)?k.skills:[];
    const has=(...words)=>words.some(w=>q.includes(w));
    if(has('hello','hi ','hey','good morning','good evening') || q==='hi') return `Hello! I'm Surya's portfolio assistant. Ask me about his experience, skills, projects or how to contact him.`;
    if(has('contact','email','linkedin','reach','connect','phone','hire','recruit','availability','available')){
      const links=[contact.email&&`Email: ${contact.email}`,contact.linkedin&&`LinkedIn: ${contact.linkedin}`,contact.portfolio&&`Portfolio: ${contact.portfolio}`,contact.github&&`GitHub: ${contact.github}`,contact.huggingface&&`Hugging Face: ${contact.huggingface}`].filter(Boolean);
      return `${k.availability||'You can contact Surya directly.'}\n\n${links.join('\n')}`;
    }
    if(has('github','repository','repositories','source code')) return `Surya's public GitHub profile: ${contact.github||'See the portfolio for links.'}\n\n${projects.length?'Featured work: '+projects.map(p=>p.name).join(', '):''}`;
    if(has('hugging face','huggingface')) return `Surya's Hugging Face profile: ${contact.huggingface||'Please refer to his portfolio.'}`;
    if(has('skill','technolog','tech stack','tool','platform','expertise','know how')) return `Surya works with ${skills.join(', ')}. His focus is using technology to improve service delivery and operational efficiency.`;
    if(has('project','automation','built','portfolio work','solution','application','app development','workflow')){
      const ranked=projects.map(p=>({...p,score:score(q,p.name+' '+p.description)})).sort((a,b)=>b.score-a.score);
      const relevant=ranked[0]?.score>2 ? ranked.slice(0,2) : ranked.slice(0,4);
      return relevant.length?`Here are examples of Surya's work:\n\n${relevant.map(p=>`• ${p.name}: ${p.description}`).join('\n\n')}`:'You can explore Surya’s projects on his portfolio and GitHub profile.';
    }
    if(has('customer','client','service delivery','noc','escalation','experience','career','work history','background','role','job')) return `${k.experience||k.summary}\n\nHis areas of focus include customer relationships, operational processes and automation.`;
    if(has('who is','introduce','about surya','tell me about','summary','profile')) return `${k.name} — ${k.headline}.\n\n${k.summary}`;
    const candidates=[{text:k.summary,answer:`${k.name}: ${k.summary}`},{text:k.experience,answer:k.experience},...projects.map(p=>({text:p.name+' '+p.description,answer:`${p.name}: ${p.description}`}))];
    const ranked=candidates.map(c=>({...c,score:score(q,c.text)})).sort((a,b)=>b.score-a.score);
    if(ranked[0]?.score>=3) return ranked[0].answer;
    return `I don't have verified information to answer that specific question yet. I can help with Surya's professional background, technical skills, automation projects and contact information. Try asking “What projects has Surya built?”`;
  }
  const toggle=document.createElement('button'); toggle.className='sa-toggle'; toggle.type='button'; toggle.textContent='✦ Ask Surya’s Assistant';toggle.setAttribute('aria-expanded','false');
  const panel=document.createElement('section');panel.className='sa-panel';panel.hidden=true;panel.setAttribute('aria-label','Surya portfolio assistant');
  panel.innerHTML='<header class="sa-header"><div><strong>✦ Surya’s AI Assistant</strong><small>Portfolio knowledge assistant · No external AI</small></div><button type="button" class="sa-close" aria-label="Close assistant">×</button></header><div class="sa-messages" role="log" aria-live="polite"></div><div class="sa-suggestions"></div><form class="sa-form"><input type="text" aria-label="Ask a question" placeholder="Ask about Surya..." maxlength="500" required><button type="submit">Send</button></form>';
  root.append(toggle,panel);
  const messages=panel.querySelector('.sa-messages'),suggestions=panel.querySelector('.sa-suggestions'),form=panel.querySelector('form'),input=panel.querySelector('input');
  let kb=fallback;
  function add(text,kind){const el=document.createElement('div');el.className='sa-message sa-'+kind;el.textContent=escapeText(text);messages.append(el);messages.scrollTop=messages.scrollHeight;}
  function ask(q){const query=String(q||'').trim().slice(0,500);if(!query)return;add(query,'user');add(answer(query,kb),'bot');input.value='';}
  function renderSuggestions(){suggestions.replaceChildren();(kb.suggestedQuestions||fallback.suggestedQuestions).slice(0,5).forEach(q=>{const b=document.createElement('button');b.type='button';b.textContent=q;b.addEventListener('click',()=>ask(q));suggestions.append(b);});}
  function show(open){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)input.focus();}
  toggle.addEventListener('click',()=>show(panel.hidden));panel.querySelector('.sa-close').addEventListener('click',()=>show(false));
  form.addEventListener('submit',e=>{e.preventDefault();ask(input.value);});
  add('Hi! Ask me about Surya’s experience, skills, automation projects or contact information.','bot');renderSuggestions();
  fetch(new URL('knowledge.json',document.currentScript?.src||location.href),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Knowledge file unavailable');return r.json();}).then(data=>{if(data&&typeof data==='object'&&typeof data.summary==='string'){kb={...fallback,...data,contact:{...fallback.contact,...data.contact}};renderSuggestions();}}).catch(e=>{console.warn('Surya Assistant: using offline fallback knowledge.',e.message);});
})();
