  const homeData = data.home;
  const widgetDefinitions = [
    {id:'agenda',name:'Agenda do dia',icon:'calendar',size:'compact',description:'Compromissos e espaço para organizar o dia.'},
    {id:'urgent',name:'Pendências urgentes',icon:'alert',size:'compact',description:'Prioridades abertas e bloqueios que pedem atenção.'},
    {id:'agents',name:'Últimos 5 agentes',icon:'agents',size:'compact',description:'Volte aos agentes das conversas mais recentes.'},
    {id:'activity',name:'Agentes trabalhando',icon:'agents',size:'wide',description:'Execução observada, trabalhos em andamento e bloqueios.'},
    {id:'projects',name:'Últimos projetos',icon:'folder',size:'wide',description:'Frentes de trabalho e seus próximos passos.'},
    {id:'pipeline',name:'Pipeline de clientes',icon:'pipeline',size:'compact',description:'Oportunidades, etapas e próximos contatos.'},
    {id:'meetings',name:'Reuniões transcritas',icon:'meeting',size:'wide',description:'Retome decisões e contexto das últimas reuniões.'},
    {id:'decisions',name:'Próximas decisões',icon:'review',size:'compact',description:'Escolhas documentadas que precisam do seu olhar.',optional:true},
    {id:'changes',name:'Avanços recentes',icon:'layers',size:'wide',description:'Entregas e mudanças documentadas no Ravi Workspace.',optional:true}
  ];
  const preferenceKey = `ravi-workspace:${config.installationId}:widgets:v1`;
  const defaultWidgets = () => config.widgets ? config.widgets.map(w=>({...w})) : widgetDefinitions.filter(w=>!w.optional).map(({id,size})=>({id,size}));
  const validateWidgets = value => {
    if(!value||value.version!==1||!Array.isArray(value.widgets)||value.widgets.length>widgetDefinitions.length)return null;
    const seen=new Set();
    if(!value.widgets.every(w=>w&&widgetDefinitions.some(d=>d.id===w.id)&&['compact','wide'].includes(w.size)&&!seen.has(w.id)&&seen.add(w.id)))return null;
    return value.widgets.map(({id,size})=>({id,size}));
  };
  let homeWidgets=defaultWidgets(), homeDraft=null, draggedWidget=null, homeSaveNotice='';
  try{homeWidgets=validateWidgets(JSON.parse(localStorage.getItem(preferenceKey)))||defaultWidgets();}catch{}
  const shortDate = value => !value?'Não informado':new Intl.DateTimeFormat(config.locale,{day:'2-digit',month:'2-digit',timeZone:config.timezone}).format(new Date(value));
  const taskLabel = task => ({in_progress:'Em andamento no cadastro',blocked:'Bloqueada',open:'Aberta',dispatched:'Despachada no cadastro'}[task.status]||task.status);
  let pendingTasks = homeData.tasks.filter(t=>['high','urgent'].includes(t.priority));
  let recentAgents = [...new Set(data.sessions.map(s=>s.agent))].slice(0,5).map(id=>({agent:data.agents.find(a=>a.id===id),session:data.sessions.find(s=>s.agent===id)}));
  const homeButton = (action,text,cls='widget-link') => `<button class="${cls}" ${cls==='widget-info'?'aria-label="Ver origem e atualização"':''} data-action="${e(action)}">${text}</button>`;
  const widgetStamp = (text,action='home-sources') => `<footer class="widget-footer"><span>${e(text)}</span>${homeButton(action,icon('info'),'widget-info')}</footer>`;
  const widgetEmpty = (id) => {
    const f=homeData.feeds[id];
    return `<div class="widget-unavailable"><span class="connection-label">Fonte pendente</span><h3>${e(f.title)}</h3><p>${e(f.text)}</p>${homeButton(`feed-${id}`,`Ver o que falta ${icon('arrow')}`)}</div>`;
  };
  const nativeProjectLink = p => `/portfolio/${p.id}`;
  function widgetContent(id,size){
    const wide=size==='wide';
    if(id==='agenda')return agendaWidget(wide);
    if(id==='activity')return activityWidget(wide);
    if(id==='urgent'&&!sourceReady('tasks')&&!pendingTasks.length)return unavailableNative('tasks');
    if(id==='urgent')return `<div class="widget-metric"><strong>${pendingTasks.length}</strong><span>de prioridade alta<br><small>${pendingTasks.filter(t=>t.status==='blocked').length} com estado “bloqueada”</small></span></div><div class="widget-list">${pendingTasks.slice(0,wide?5:2).map(t=>link(`/tasks/${t.id}`,`<span class="priority-dot" aria-hidden="true"></span><span><strong>${e(t.title)}</strong><small>${e(taskLabel(t))}</small></span>${icon('arrow')}`,'widget-row')).join('')}</div>${homeButton('home-tasks',`Ver ${pendingTasks.length} prioridades ${icon('arrow')}`)}${nativeLiveStamp('tasks','Prazos não informados · '+nativeCapture('tasks'))}`;
    if(id==='agents'&&!recentAgents.length)return unavailableNative('agents');
    if(id==='agents')return `<p class="widget-description">Retome de onde parou.</p><div class="recent-agents">${recentAgents.map(({agent:a,session:s},index)=>link(`/agents/${a.id}`,`<span class="agent-glyph glyph-${index}">${e(a.name[0].toUpperCase())}</span><span><strong>${e(a.name)}</strong><small>${e(s.name)}</small></span>${icon('arrow')}`,'recent-agent')).join('')}</div>${nativeLiveStamp('agents','Recência das conversas · '+nativeCapture('agents'),'home-agents-origin')}`;
    if(id==='projects')return projectWidget(wide);
    if(id==='pipeline')return pipelineWidget(wide);
    if(id==='meetings')return meetingsWidget(wide);
    if(id==='decisions')return `<p class="small muted">Nenhuma decisão incluída neste snapshot.</p>${widgetStamp('Fonte não consultada')}`;
    if(id==='changes')return `<p class="widget-description">Ravi Workspace · registros documentados</p><div class="widget-list">${data.events.slice(0,wide?3:2).map(ev=>`<button class="widget-row" data-source="${e(ev.source)}"><time>${e(ev.time)}</time><span><strong>${e(ev.title)}</strong><small>${e(ev.description)}</small></span>${icon('arrow')}</button>`).join('')}</div>${widgetStamp('Recorte local · sem atualização automática')}`;
    return '';
  }
  function home(){
    return `<header class="home-dashboard-heading"><div><p class="eyebrow">${e(config.ownerName?"Seu workspace, "+config.ownerName:"Seu workspace")}</p><h1 tabindex="-1" data-page-title>Home<span class="home-dot">.</span></h1><p>Seu dia, suas frentes, seu próximo passo.</p></div><button class="customize-button" data-action="home-customize" data-focus-key="home-customize">${icon('sliders')}Personalizar</button></header><div class="home-dayline"><span>${agendaData.status==='ready'?e(dayPart(agendaData.date,{weekday:'long',day:'numeric',month:'long'})):'Seu panorama'}</span><button data-action="home-sources">Prévia privada · consulte as datas das fontes ${icon('info')}</button></div>${feedLiveControls()}${homeSaveNotice?`<p class="home-save-notice" role="status">${e(homeSaveNotice)}</p>`:''}<div class="widget-grid" aria-label="Seus widgets">${homeWidgets.map(w=>{const d=widgetDefinitions.find(d=>d.id===w.id);return `<section class="home-widget widget-${w.id} size-${w.size}" data-widget="${w.id}" aria-labelledby="widget-title-${w.id}"><header class="widget-heading"><span class="widget-icon">${icon(d.icon)}</span><h2 id="widget-title-${w.id}">${e(d.name)}</h2></header>${widgetContent(w.id,w.size)}</section>`;}).join('')}</div>${!homeWidgets.length?`<div class="home-empty"><span>${icon('layers')}</span><h2>Um espaço com a sua cara.</h2><p>Escolha os widgets que fazem sentido para o seu dia.</p>${homeButton('home-customize','Adicionar widgets','primary')}</div>`:''}<button class="add-widgets" data-action="home-customize">${icon('plus')}Adicionar ou organizar widgets</button>`;
  }
  function editorRows(){
    const ordered=[...homeDraft.map(w=>widgetDefinitions.find(d=>d.id===w.id)),...widgetDefinitions.filter(d=>!homeDraft.some(w=>w.id===d.id))];
    return ordered.map(d=>{const index=homeDraft.findIndex(w=>w.id===d.id),w=homeDraft[index];return `<li class="widget-option ${w?'selected':''}" data-widget-option="${d.id}"><div class="widget-choice-line"><button class="widget-check" data-action="widget-toggle:${d.id}" role="checkbox" aria-checked="${!!w}" aria-label="${e(d.name)}" data-editor-key="toggle:${d.id}">${w?icon('check'):icon('plus')}</button><span class="catalog-icon">${icon(d.icon)}</span><div class="widget-choice-copy"><strong>${e(d.name)}</strong><small>${e(d.description)}</small></div>${w?`<button draggable="true" class="drag-widget" aria-label="Arrastar ${e(d.name)}; use os botões para mover pelo teclado" data-drag-widget="${d.id}" tabindex="-1">⠿</button>`:''}</div>${w?`<div class="widget-settings"><div role="group" aria-label="Tamanho de ${e(d.name)}"><button data-action="widget-size:${d.id}:compact" aria-pressed="${w.size==='compact'}" data-editor-key="size:${d.id}:compact">Compacto</button><button data-action="widget-size:${d.id}:wide" aria-pressed="${w.size==='wide'}" data-editor-key="size:${d.id}:wide">Amplo</button></div><div class="widget-order"><span>${index+1} de ${homeDraft.length}</span><button data-action="widget-move:${d.id}:-1" aria-label="Mover ${e(d.name)} para antes" ${index===0?'disabled':''} data-editor-key="move:${d.id}:-1">↑</button><button data-action="widget-move:${d.id}:1" aria-label="Mover ${e(d.name)} para depois" ${index===homeDraft.length-1?'disabled':''} data-editor-key="move:${d.id}:1">↓</button></div></div>`:''}</li>`;}).join('');
  }
  function redrawEditor(focusKey){
    const list=document.getElementById('widget-options');
    const before=window.workspaceMotion.positions(list?.children);
    list.innerHTML=editorRows();
    document.getElementById('widget-count').textContent=`${homeDraft.length} de ${widgetDefinitions.length} widgets selecionados`;
    const button=[...list.querySelectorAll('[data-editor-key]')].find(el=>el.dataset.editorKey===focusKey&&!el.disabled)||list.querySelector('[role=checkbox]');
    button?.focus({preventScroll:true});
    window.workspaceMotion.reorder(list.children,before,'widgetOption');
  }
  function openHomeEditor(){
    homeDraft=homeWidgets.map(w=>({...w}));
    dialog.classList.add('widget-editor');
    showDialog('Do seu jeito.','Personalizar Home',`<p>Escolha o que aparece, ajuste os tamanhos e organize a ordem. No celular, use as setas; no computador, você também pode arrastar.</p><p id="widget-count" class="editor-count">${homeDraft.length} de ${widgetDefinitions.length} widgets selecionados</p><ul class="widget-options" id="widget-options">${editorRows()}</ul><div class="widget-editor-actions"><button data-action="widget-defaults" class="text-link">Restaurar padrão</button><div><button class="secondary" data-action="close-dialog">Cancelar</button><button class="primary" data-action="widget-save">Salvar Home ${icon('check')}</button></div></div><p class="editor-note">Preferências salvas neste navegador. A seleção não conecta novas fontes.</p>`);
  }
  function homeAction(name){
    if(name==='activity-source'){navigate('/activity');return true;}
    if(name==='project-origin'){projectOrigin();return true;}
    if(name==='home-customize'){openHomeEditor();return true;}
    if(name==='widget-save'&&homeDraft){
      homeWidgets=homeDraft.map(w=>({...w}));homeSaveNotice='Home salva neste navegador.';
      try{localStorage.setItem(preferenceKey,JSON.stringify({version:1,widgets:homeWidgets}));}catch{homeSaveNotice='Home ajustada nesta visita. Este navegador não permitiu salvar suas preferências.';}
      dialog.close();navigate('/home',{focusKey:'home-customize'});return true;
    }
    if(name==='widget-defaults'&&homeDraft){homeDraft=defaultWidgets();redrawEditor('toggle:agenda');return true;}
    if(name.startsWith('widget-')&&homeDraft){
      const [action,id,value]=name.split(':'); const i=homeDraft.findIndex(w=>w.id===id); const d=widgetDefinitions.find(w=>w.id===id);
      if(!d)return true;
      if(action==='widget-toggle'){if(i<0)homeDraft.push({id,size:d.size});else homeDraft.splice(i,1);redrawEditor(`toggle:${id}`);}
      if(action==='widget-size'&&i>=0&&['compact','wide'].includes(value)){homeDraft[i].size=value;redrawEditor(`size:${id}:${value}`);}
      if(action==='widget-move'&&i>=0){const target=i+Number(value);if(target>=0&&target<homeDraft.length){const [w]=homeDraft.splice(i,1);homeDraft.splice(target,0,w);redrawEditor(`move:${id}:${value}`);document.getElementById('announcer').textContent=`${d.name}, posição ${target+1}.`;}}
      return true;
    }
    if(name.startsWith('feed-')){feedSource(name.slice(5));return true;}
    if(name==='home-agents-origin'){showDialog('Como escolhemos os cinco agentes','Origem da informação',`<p>Cinco identidades distintas, seguindo a atividade mais recente das conversas na listagem autorizada.</p><p>${e(data.inventory.capturedLabel)}.</p><div class="dialog-note">O inventário não informa se a última interação foi sua nem se o agente está trabalhando agora. “Últimos 5 agentes” é um atalho de recência das conversas, não um histórico pessoal de uso.</div>`);return true;}
    if(name==='home-tasks'){navigate('/priorities');return true;}
    if(name==='home-sources'){showDialog('O que alimenta sua Home','Origem e atualização',`<p>${e(config.workspaceName)} · snapshot fornecido por esta instalação.</p><ul>${Object.entries(data.sourceStates).map(([name,state])=>`<li>${e(sourceLabel(name))}: ${e(state.status)} · ${e(feedDate(state.capturedAt))}</li>`).join('')}</ul><div class="dialog-note">Coleta, cadastro e síntese têm datas próprias. Uma fonte não configurada não prova ausência de registros. Esta prévia não consulta serviços nem altera o cadastro.</div>`);return true;}
    return false;
  }
  function portfolio(){return contextPortfolio();}
  function nativeProject(id){const contextual=contextProjectDetail(id);if(contextual)return contextual;const p=homeData.projects.find(p=>p.id===id);if(!p)return missing();return `${back('/portfolio')}${heading(p.title,'Estado registrado no cadastro nativo.','Projeto')}<section class="panel"><p class="small muted">Atualizado em ${shortDate(p.updatedAt)} · consulta ${e(nativeCapture('projects'))}</p><h2 class="native-section-title">Contexto registrado</h2><p>${e(p.summary)}</p><h2 class="native-section-title">Próximo passo registrado</h2><p>${e(p.next)}</p><p class="native-section-title small">Responsável: ${e(p.owner||'Não informado')} · status: ${e(p.status==='active'?'Ativo':p.status)}</p><div class="dialog-note">Snapshot do cadastro; não comprova execução atual. A análise das conversas ainda não foi associada a este item.</div>${p.workspace?link('/work/project',`Ver entregas documentadas ${icon('arrow')}`,'widget-link'):''}</section>`;}
  function priorities(){if(!pendingTasks.length)return `${back('/home')}${heading('Prioridades abertas','Tarefas incluídas na consulta.')}<section class="panel">${unavailableNative('tasks')}</section>`;return `${back('/home')}${heading('Prioridades abertas','Tarefas com prioridade alta no cadastro consultado.','Seu olhar')}<p class="small muted">Atualizadas no recorte consultado · ${e(nativeCapture('tasks'))}. Prazos não informados.</p><div class="native-list">${pendingTasks.map(t=>link(`/tasks/${t.id}`,`<span class="priority-dot"></span><span><h2>${e(t.title)}</h2><p>${e(taskLabel(t))} · prioridade alta</p><small>Atualizada em ${shortDate(t.updatedAt)}</small></span>${icon('arrow')}`,'native-row')).join('')}</div>`;}
  function nativeTask(id){const observed=activityTaskPage(id);if(observed)return observed;const t=homeData.tasks.find(t=>t.id===id);if(!t)return missing();return `${back('/priorities')}${heading(t.title,'Estado registrado na consulta nativa.','Tarefa')}<section class="panel"><dl class="work-metadata"><div><dt>Estado cadastral</dt><dd>${e(taskLabel(t))}</dd></div><div><dt>Prioridade</dt><dd>${e(t.priority==='high'?'Alta':t.priority)}</dd></div><div><dt>Prazo</dt><dd>Não informado</dd></div><div><dt>Última atualização</dt><dd>${shortDate(t.updatedAt)}</dd></div><div><dt>Consulta</dt><dd>${e(nativeCapture('tasks'))}</dd></div></dl><div class="dialog-note">Origem: Ravi Tasks. Prioridade alta não comprova urgência; um estado em andamento não confirma execução ao vivo. Não há conclusão, reatribuição ou alteração desta tarefa na prévia.</div></section>`;}
  dialog.addEventListener('close',()=>{dialog.classList.remove('widget-editor');homeDraft=null;draggedWidget=null;});
  dialog.addEventListener('dragstart',event=>{const handle=event.target.closest('[data-drag-widget]');if(!handle||!homeDraft)return;draggedWidget=handle.dataset.dragWidget;event.dataTransfer.setData('text/plain',draggedWidget);event.dataTransfer.effectAllowed='move';});
  dialog.addEventListener('dragover',event=>{const row=event.target.closest('[data-widget-option]');if(draggedWidget&&row&&homeDraft?.some(w=>w.id===row.dataset.widgetOption)){event.preventDefault();event.dataTransfer.dropEffect='move';}});
  dialog.addEventListener('drop',event=>{const target=event.target.closest('[data-widget-option]')?.dataset.widgetOption;if(!draggedWidget||!homeDraft)return;event.preventDefault();const from=homeDraft.findIndex(w=>w.id===draggedWidget),to=homeDraft.findIndex(w=>w.id===target);if(from>=0&&to>=0&&from!==to){const [w]=homeDraft.splice(from,1);homeDraft.splice(to,0,w);redrawEditor(`toggle:${w.id}`);document.getElementById('announcer').textContent=`Widget movido para a posição ${to+1}.`;}draggedWidget=null;});
  dialog.addEventListener('dragend',()=>{draggedWidget=null;});
