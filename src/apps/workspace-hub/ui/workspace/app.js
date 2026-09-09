(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('workspace-data').textContent);
  const config=JSON.parse(document.getElementById('workspace-config').textContent);
  const main = document.getElementById('main');
  const dialog = document.getElementById('detail-dialog');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const e = escape;
  const paths = {
    connectors:'M8 3v5M16 3v5M5 8h14v3a7 7 0 0 1-7 7v4M5 8v3a7 7 0 0 0 7 7',
    external:'M14 3h7v7M21 3 10 14M10 3H3v18h18v-7',
    alerts:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
    clock:'M12 8v5l3 2M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0',
    calendar:'M4 5h16v16H4zM8 2v6M16 2v6M4 10h16M8 14h2M14 14h2M8 18h2',
    alert:'M12 3 2 21h20L12 3M12 9v5M12 17v1',
    pipeline:'M3 4h18l-7 8v7l-4 2v-9L3 4',
    meeting:'M4 5h12v14H4zM16 10l5-3v10l-5-3',
    sliders:'M3 6h7M14 6h7M3 18h3M10 18h11M10 3v6M6 15v6M3 12h13M20 12h1M16 9v6',
    plus:'M12 5v14M5 12h14',
    sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5l1.5 1.5M5 19l1.5-1.5M17.5 6.5l1.5-1.5',
    moon:'M20.5 13.2A8.5 8.5 0 0 1 10.8 3.5 8.5 8.5 0 1 0 20.5 13.2Z',
    home:'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
    work:'M3 7h18v13H3zM8 7V4h8v3M3 12h18M10 12v3h4v-3',
    agents:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M18 8a3 3 0 0 1 0 6M22 21v-2a4 4 0 0 0-3-3.87',
    arrow:'M5 12h14m-5-5 5 5-5 5', back:'M19 12H5m5-5-5 5 5 5',
    search:'M21 21l-5-5M18 10a8 8 0 1 0-16 0 8 8 0 0 0 16 0',
    file:'M14 2H5v20h14V7l-5-5M14 2v6h5M8 12h8M8 16h8',
    info:'M12 11v6M12 7h.01M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0',
    check:'m5 12 4 4L19 6', review:'M4 3h16v14H9l-5 4V3M8 8h8M8 12h5',
    folder:'M3 6h7l2 3h9v11H3V6', layers:'m12 3 10 6-10 6L2 9l10-6M2 13l10 6 10-6M2 17l10 6 10-6'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.file}"></path></svg>`;
  const syncThemeControls = () => document.querySelectorAll('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===window.workspaceTheme.get())));
  window.addEventListener('workspace-theme-change',syncThemeControls);
  const link = (route, text, cls='text-link', key='') => `<a class="${cls}" href="#${e(route)}" data-route="${e(route)}" data-focus-key="${e(key || route)}">${text}</a>`;
  const sourceButton = (id, label='Ver origem') => `<button class="source-link" data-source="${e(id)}" aria-label="${e(label)}: ${e(data.sources.find(s => s.id === id)?.title || id)}" data-focus-key="source-${e(id)}">${icon('file')}${e(label)}</button>`;
  const label = (text, color='') => `<span class="label ${color}">${e(text)}</span>`;
  const back = fallback => `<button class="back" data-back="${e(fallback)}" aria-label="Voltar">${icon('back')}Voltar</button>`;
  const heading = (title, subtitle, eyebrow='') => `<header class="page-heading">${eyebrow ? `<p class="eyebrow">${e(eyebrow)}</p>` : ''}<h1 tabindex="-1" data-page-title>${e(title)}</h1>${subtitle ? `<p>${e(subtitle)}</p>` : ''}</header>`;
  const notice = text => `<div class="inline-notice">${icon('info')}<span>${text}</span></div>`;
  const sourceLinks = ids => `<div class="source-list">${ids.map(id=>data.sources.find(s=>s.id===id)).filter(Boolean).map(s=>`<button data-source="${e(s.id)}">${icon('file')}<span><strong>${e(s.title)}</strong><span class="small">${e(s.kind)} · ${e(s.date)}</span></span></button>`).join('')}</div>`;
  /*__VIEWS__*/
  function sourcePage(id) {
    const source = data.sources.find(s=>s.id===id);
    if (!source) return missing();
    return `${back('/search')}${heading(source.title,source.kind,'Origem da informação')}<section class="panel source-card"><p class="date">${e(source.date)}${source.updated ? `<br>${e(source.updated)}` : ''}</p><p class="body-copy">${e(source.excerpt)}</p><ul class="requirements">${source.facts.map(f=>`<li>${e(f)}</li>`).join('')}</ul><div class="dialog-note">${e(source.limit)}</div>${source.id==='project'?'<button class="text-link" data-action="compare">Comparar com os documentos atuais</button>':''}</section>`;
  }
  function missing() {
    return `${heading('Esse caminho não está neste recorte.','Você pode voltar ou buscar uma informação disponível.')}<div class="empty">${icon('search')}<h2>Conteúdo não encontrado</h2><p>O endereço não corresponde a um registro desta prévia local.</p>${link('/home','Voltar ao Home','primary')}</div>`;
  }

  const searchTypes = [['all','Tudo'],['project','Projetos'],['work','Trabalhos'],['agent','Agentes'],['session','Conversas'],['alert','Alerts'],['event','Agenda'],['meeting','Reuniões'],['connector','Connectors'],['client','Clientes'],['choice','Escolhas'],['source','Fontes']];
  const searchRecords = [
    ...alertsData.items.map(item=>({type:'alert',name:item.name,text:`${item.agentName} · ${AlertsModel.schedule(item)}`,route:`/alerts/${item.id}`})),
    ...projectSearchRecords(),
    ...connectorItems.map(c=>({type:'connector',name:c.name,text:`${c.purpose} · ${c.account} · Gerenciar acesso`,route:`/connectors/${c.id}`})),
    ...agendaItems.map(v=>({type:'event',name:v.title,text:`${eventTime(v)} · Google Calendar`,route:`/agenda/${v.id}`})),
    ...meetingItems.map(m=>({type:'meeting',name:m.title,text:`${feedDate(m.happenedAt)} · Transcrição disponível · tl;dv`,route:`/meetings/${m.id}`})),
    ...pipelineItems.map(p=>({type:'client',name:p.title,text:`${p.status} · ${p.short}`,route:`/pipeline/${p.id}`})),
    ...homeData.tasks.map(t=>({type:'work',name:t.title,text:taskLabel(t),route:`/tasks/${t.id}`})),
    ...data.work.map(item=>({type:'work',name:item.name,text:item.description,route:`/work/item/${item.id}`})),
    ...data.agents.map(a=>({type:'agent',name:a.name,text:`${a.role} · ${data.sessions.filter(s=>s.agent===a.id).map(s=>s.name).join(' · ')}`,route:`/agents/${a.id}`})),
    ...data.sessions.map(s=>({type:'session',name:s.name,text:`${s.channel||'Conversa'} · ${data.agents.find(a=>a.id===s.agent)?.name||'Agente não incluído'} · Atividade registrada: ${s.activityLabel}, na captura.`,route:`/sessions/${s.id}`})),
    {type:'choice',name:'Organize seu workspace',text:'Escolha widgets e percorra suas fontes.',route:'/review/navigation'},
    ...data.sources.map(source=>({type:'source',name:source.title,text:source.excerpt,route:`/source/${source.id}`}))
  ];
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function searchResults(query, type) {
    const words = normalize(query).trim().split(/\s+/).filter(Boolean);
    const records = searchRecords.filter(record => (type==='all'||record.type===type) && words.every(word=>normalize(`${record.name} ${record.text}`).includes(word)));
    const caption = `${records.length} ${records.length===1?'resultado':'resultados'} no recorte consultado`;
    document.getElementById('announcer').textContent = caption;
    return `<p class="list-caption" data-result-count>${e(caption)}</p>${records.length ? `<div class="results">${records.map(record=>link(record.route,`<div class="result-head">${label(searchTypes.find(([id])=>id===record.type)[1])}<h2>${e(record.name)}</h2></div><p>${e(record.text)}</p><small>Ravi Workspace · abrir no mesmo contexto →</small>`,'result',`result-${record.route}`)).join('')}</div>` : `<div class="empty">${icon('search')}<h2>Nenhum resultado neste recorte.</h2><p>${query ? `Não encontramos “${e(query)}” com este filtro. ` : ''}Isso não informa o que existe fora dos dados consultados.</p><button class="secondary" data-action="reset-search">Limpar busca e filtros</button></div>`}`;
  }
  function search(params) {
    const query = (params.get('q') || '').slice(0,300);
    const type = searchTypes.some(([id])=>id===params.get('type')) ? params.get('type') : 'all';
    return `${back('/home')}${heading('Buscar no workspace','Projetos, trabalhos, agentes, conversas e suas fontes.')}
      <div class="search-box">${icon('search')}<input id="search-input" type="search" autocomplete="off" maxlength="300" aria-label="Buscar no workspace" placeholder="O que você quer encontrar?" value="${e(query)}" data-focus-key="search-input"><button class="clear-search" data-action="clear-query" aria-label="Limpar texto da busca">×</button></div>
      <div class="controls"><div class="segments" aria-label="Filtrar resultados">${searchTypes.map(([id,text])=>`<button data-search-filter="${id}" aria-pressed="${type===id}" data-focus-key="search-filter-${id}">${text}</button>`).join('')}</div></div>
      <div id="search-results">${searchResults(query,type)}</div>`;
  }
  let sequence = 0;
  let renderedKey = null;
  let renderedRoute = null;
  let returnFocus = null;
  const positions = new Map();
  const routeFromLocation = () => {
    if (location.hash.startsWith('#/')) return location.hash.slice(1);
    if (document.querySelector('meta[name="workspace-feeds"]')?.content === 'pages') {
      const path = location.pathname.replace(/\/+$/, '') || '/home';
      return (path === '/index.html' ? '/home' : path) + location.search;
    }
    return '/home';
  };
  function parseRoute(route) {
    const index = route.indexOf('?');
    return {path:index<0?route:route.slice(0,index),params:new URLSearchParams(index<0?'':route.slice(index+1))};
  }
  function remember() {
    if (!renderedKey) return;
    const focus = document.activeElement?.dataset.focusKey;
    positions.set(renderedKey,{scroll:window.scrollY,focus});
  }
  function navigate(route, options={}) {
    if (typeof route!=='string'||!route.startsWith('/')||route.startsWith('//')) return;
    if (dialog.open) dialog.close();
    remember();
    const state = {atlas:true,key:`atlas-${Date.now()}-${++sequence}`,canGoBack:options.replace ? !!history.state?.canGoBack : true};
    if (options.replace) history.replaceState(state,'',`#${route}`);
    else if (route!==routeFromLocation()) history.pushState(state,'',`#${route}`);
    render(false,options.focusKey);
  }
  function render(restore=false,focusKey) {
    const route=routeFromLocation();
    const {path,params}=parseRoute(route);
    let body;
    window.workspaceMotion.stop();
    if(path==='/home') body=home();
    else if(path==='/activity') body=activitySourcesPage();
    else if(path.startsWith('/activity/evidence/')) body=activityEvidencePage(path.slice('/activity/evidence/'.length));
    else if(path==='/connectors') body=connectors();
    else if(path.startsWith('/connectors/')) body=connectorDetail(path.slice('/connectors/'.length));
    else if(path==='/alerts') body=alerts(params);
    else if(path.startsWith('/alerts/')) body=alertDetail(path.slice('/alerts/'.length));
    else if(path==='/agenda') body=agendaPage();
    else if(path.startsWith('/agenda/')) body=agendaDetail(path.slice('/agenda/'.length));
    else if(path==='/meetings') body=meetingsPage();
    else if(path.startsWith('/meetings/')) body=meetingDetail(path.slice('/meetings/'.length));
    else if(path==='/pipeline') body=pipelinePage(params);
    else if(path.startsWith('/pipeline/')) body=pipelineDetail(path.slice('/pipeline/'.length));
    else if(path==='/portfolio') body=portfolio();
    else if(path.startsWith('/portfolio/')) body=nativeProject(path.slice('/portfolio/'.length));
    else if(path==='/priorities') body=priorities();
    else if(path.startsWith('/tasks/')) body=nativeTask(path.slice('/tasks/'.length));
    else if(path==='/work') body=work(params);
    else if(path==='/work/project') body=project();
    else if(path.startsWith('/work/item/')) body=workDetail(path.slice('/work/item/'.length));
    else if(path==='/agents') body=agents(params);
    else if(path.startsWith('/agents/')) body=agent(path.slice('/agents/'.length));
    else if(path.startsWith('/sessions/')) body=session(path.slice('/sessions/'.length));
    else if(path==='/review/navigation') body=review();
    else if(path==='/search') body=search(params);
    else if(path.startsWith('/source/')) body=sourcePage(path.slice('/source/'.length));
    else body=missing();
    if(dialog.open) dialog.close();
    main.innerHTML=body;
    main.querySelector('.inventory-tab.selected')?.setAttribute('aria-current','page');
    const active=path.startsWith('/connectors')?'connectors':path.startsWith('/alerts')?'alerts':(path.startsWith('/agents')||path.startsWith('/sessions')||path.startsWith('/activity'))?'agents':(path.startsWith('/work')||path.startsWith('/review')||path.startsWith('/portfolio')||path.startsWith('/priorities')||path.startsWith('/tasks'))?'work':(path==='/home'||path.startsWith('/pipeline')||path.startsWith('/agenda')||path.startsWith('/meetings'))?'home':null;
    const nav=[['home','Home'],['work','Trabalho'],['agents','Agentes'],['alerts','Alerts'],['connectors','Connectors']].map(([id,name])=>`<a class="nav-link" href="#/${id}" data-route="/${id}" data-focus-key="nav-${id}" ${active===id?'aria-current="page"':''}>${icon(id)}<span>${name}</span></a>`).join('');
    document.getElementById('desktop-nav').innerHTML=nav;
    document.getElementById('mobile-nav').innerHTML=nav;
    document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});
    syncThemeControls();
    if(path==='/home'&&!restore)window.workspaceMotion.enter(main.querySelectorAll('[data-widget]'));
    document.title=`${main.querySelector('[data-page-title]')?.textContent || 'Workspace'} · ${config.title}`;
    renderedKey=history.state?.key;
    renderedRoute=route;
    document.dispatchEvent(new Event('workspace-route-change'));
    const saved=restore?positions.get(renderedKey):null;
    requestAnimationFrame(()=>{
      if(renderedRoute!==route) return;
      const wanted=focusKey||saved?.focus;
      const found=wanted?[...document.querySelectorAll('[data-focus-key]')].find(el=>el.dataset.focusKey===wanted&&el.getClientRects().length):null;
      (found || (path==='/search'&&!restore?document.getElementById('search-input'):main.querySelector('[data-page-title]')) || main).focus({preventScroll:true});
      window.scrollTo({top:saved?.scroll||0,behavior:'instant'});
    });
  }
  function syncHistory() {
    if(renderedRoute===routeFromLocation()&&renderedKey===history.state?.key) return;
    remember();
    if(!history.state?.atlas)history.replaceState({atlas:true,key:`atlas-${Date.now()}-${++sequence}`,canGoBack:false},'',location.href);
    render(true);
  }
  function updateSearch(type,query) {
    const {params}=parseRoute(routeFromLocation());
    const nextType=type||params.get('type')||'all';
    const nextQuery=query??document.getElementById('search-input')?.value??'';
    const route='/search?'+new URLSearchParams({q:nextQuery,type:nextType}).toString();
    history.replaceState(history.state,'',`#${route}`);
    renderedRoute=route;
    document.querySelectorAll('[data-search-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.searchFilter===nextType)));
    document.getElementById('search-results').innerHTML=searchResults(nextQuery,nextType);
  }
  function showDialog(title,kind,content) {
    if(!dialog.open) returnFocus=document.activeElement;
    document.getElementById('dialog-label').textContent=kind;
    document.getElementById('dialog-content').innerHTML=`<h2 id="dialog-title">${e(title)}</h2>${content}`;
    if(!dialog.open) dialog.showModal();
    dialog.querySelector('[data-action="close-dialog"]').focus({preventScroll:true});
  }
  function showSource(id) {
    const s=data.sources.find(item=>item.id===id);
    if(!s) return;
    showDialog(s.title,s.kind,`<p class="small">${e(s.date)}${s.updated?`<br>${e(s.updated)}`:''}</p><p style="margin-top:18px">${e(s.excerpt)}</p><ul>${s.facts.map(f=>`<li>${e(f)}</li>`).join('')}</ul><div class="dialog-note">${e(s.limit)}</div>${s.id==='project'?'<button class="secondary" data-action="compare">Comparar com documentos atuais</button>':''}`);
  }
  function action(name) {
    if(feedLiveAction(name)||connectorsAction(name)||alertsAction(name)||homeAction(name))return;
    if(name==='theme-day'||name==='theme-dark')window.workspaceTheme.set(name==='theme-day'?'day':'dark');
    if(name==='setup')showDialog('Configurar fontes','Configuração local',`<p>Abra a configuração local do Workspace no seu Ravi para escolher agentes, conversas e integrações. Este snapshot não altera a instalação.</p>`);
    if(name==='appearance'){
      showDialog('Aparência do workspace','Identidade e cores',`<p>${e(config.title)}. A marca e a paleta são definidas pela configuração desta instalação.</p><div class="appearance-themes" role="group" aria-label="Escolher aparência"><button class="theme-option" data-action="theme-day" data-theme-choice="day">${icon('sun')}<span><strong>Day</strong><small>Claro, com fundos suaves.</small></span></button><button class="theme-option" data-action="theme-dark" data-theme-choice="dark">${icon('moon')}<span><strong>Dark</strong><small>Escuro, com contraste.</small></span></button></div><div class="dialog-note">A preferência fica neste navegador, separada das outras instalações. O padrão pode acompanhar o sistema.</div>`);syncThemeControls();
    }
    if(name==='close-dialog')dialog.close();
    if(name==='context'||name==='compare')showDialog('Alcance dos dados','Esta instalação',`<p>${e(config.workspaceName)} · ${e(config.timezone)}</p><p>${data.sessions.length} conversas e ${data.agents.length} agentes incluídos no snapshot desta instalação.</p><p>${e(data.inventory.capturedLabel)}</p><p>${e(projectContext.coverage.description)}</p><div class="dialog-note">Seleção da interface não concede acesso. As fontes precisam ser consultadas com a identidade e as permissões do seu Ravi. Recência e relatos não comprovam execução atual.</div>`);
    if(name==='about'||name==='review-prompts')showDialog('Seu trabalho, no seu Ravi.','Ravi Workspace',`<p>Personalize a Home e aprofunde o contexto de projetos, agentes e fontes.</p><ul><li>Esta versão renderiza o snapshot fornecido à instalação.</li><li>Sem fontes configuradas, as lacunas aparecem explicitamente.</li><li>Preferências de Home e tema pertencem a esta instalação.</li></ul><div class="dialog-note">Não há coleta automática ou alteração de contas nesta prévia. Atualização e gerenciamento serão ligados aos contratos do seu Ravi.</div>`);
    if(name==='clear-query'||name==='reset-search'){
      const input=document.getElementById('search-input');
      if(input){input.value='';updateSearch(name==='reset-search'?'all':undefined,'');input.focus();}
    }
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('.skip-link')){event.preventDefault();main.focus();return;}
    const target=event.target.closest('[data-route],[data-action],[data-source],[data-back],[data-work-filter],[data-search-filter]');
    if(!target)return;
    if(target.dataset.route){
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
      event.preventDefault();navigate(target.dataset.route);return;
    }
    if(target.dataset.back){if(history.state?.canGoBack)history.back();else navigate(target.dataset.back,{replace:true});return;}
    if(target.dataset.source){showSource(target.dataset.source);return;}
    if(target.dataset.workFilter){navigate(`/work?type=${target.dataset.workFilter}`,{focusKey:`filter-${target.dataset.workFilter}`});return;}
    if(target.dataset.searchFilter){updateSearch(target.dataset.searchFilter);return;}
    if(target.dataset.action)action(target.dataset.action);
  });
  document.addEventListener('input',event=>{if(event.target.id==='search-input')updateSearch();});
  document.addEventListener('keydown',event=>{
    if(dialog.open&&event.key==='Tab'){
      const controls=[...dialog.querySelectorAll('button:not([tabindex="-1"]),a[href],input,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(!dialog.contains(document.activeElement)||(event.shiftKey&&document.activeElement===first)||(!event.shiftKey&&document.activeElement===last)){
        event.preventDefault();(event.shiftKey?last:first)?.focus();
      }
    }
    if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
      event.preventDefault();if(dialog.open)dialog.close();navigate('/search');
    }
  });
  dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  window.addEventListener('popstate',syncHistory);
  window.addEventListener('hashchange',syncHistory);
  if(!history.state?.atlas)history.replaceState({atlas:true,key:`atlas-${Date.now()}-${++sequence}`,canGoBack:false},'',`#${routeFromLocation()}`);
  render();
})();
