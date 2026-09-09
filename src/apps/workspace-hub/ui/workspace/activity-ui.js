  let activityData=data.activity||null;
  const activityLabels={open:'Aberto',dispatched:'Atribuído',in_progress:'Em andamento',blocked:'Bloqueado',done:'Concluído',failed:'Falhou',conflicting:'Estado a conferir'};
  const activityEventLabels={'task.created':'Trabalho criado','task.dispatched':'Trabalho atribuído','task.progress':'Andamento informado','task.blocked':'Bloqueio registrado','task.done':'Conclusão registrada','task.failed':'Falha registrada'};
  const activityAgentName=id=>data.agents.find(a=>a.id===id)?.name||'Agente do workspace';
  const activitySessions=id=>(activityData?.sessions||[]).filter(s=>!id||s.agent===id);
  const activityTasks=id=>(activityData?.tasks||[]).filter(t=>!id||t.roles.some(r=>r.agent===id));
  const activityUnavailable=()=>!!(feedLiveStates.activity?.error||feedLiveExpired||feedLiveError||!navigator.onLine);
  const activityCurrent=s=>!activityUnavailable()&&s.validUntil&&Date.now()<Math.min(Date.parse(s.validUntil),Date.parse(s.observedAt)+60000);
  const activityTaskOld=()=>activityUnavailable()||!activityData||Date.now()-Date.parse(activityData.capturedAt)>1200000;
  function activityStatus(id){
    const sessions=activitySessions(id),running=sessions.filter(s=>s.state==='running'&&activityCurrent(s));
    if(running.length)return {label:'Executando na consulta',color:'green',rank:0};
    if(sessions.some(s=>s.state==='conflicting'))return {label:'Estado a conferir',color:'amber',rank:3};
    if(sessions.length&&sessions.every(s=>s.state==='idle'&&activityCurrent(s)))return {label:'Sem execução na consulta',color:'',rank:2};
    return {label:sessions.some(s=>s.validUntil)?'Observação desatualizada':'Sem observação atual',color:'',rank:4};
  }
  function activityBadge(id){const state=activityStatus(id);return `<span class="execution-badge" data-execution-state="${state.rank===0?'running':state.rank===2?'idle':'unknown'}">${label(state.label,state.color)}</span>`;}
  function activityNotice(){
    if(!activityData)return notice('A observação dos agentes ainda não foi consultada.');
    const observed=activityData.sessions.filter(s=>s.reason==='host_confirmed').length;
    return `<div class="activity-caption"><p>Consulta de ${e(feedDate(activityData.capturedAt))} · ${observed} de ${activityData.sessions.length} conversas com resposta do runtime.</p><p>Esta página mostra a captura fornecida à instalação. A observação de execução perde validade após 1 minuto. Os estados dos trabalhos vêm de Tasks.</p>${activityTaskOld()?'<p role="status">Atualização indisponível ou atrasada. Abaixo estão os últimos registros válidos.</p>':''}${link('/activity','Entender as fontes e os limites','text-link')}</div>`;
  }
  function activityTaskRow(t,agentId){
    const role=agentId?t.roles.find(r=>r.agent===agentId):null;
    const color=t.state==='blocked'||t.state==='failed'||t.state==='conflicting'?'amber':t.state==='done'?'green':'';
    const description=role?(role.kind==='assigned'?'Responsabilidade atribuída':'Atualizado por este agente'):t.roles.map(r=>activityAgentName(r.agent)).join(' · ');
    return link(`/tasks/${t.id}`,`<span class="activity-work-copy"><strong>${e(t.title)}</strong><small>${e(description)} · ${e(feedDate(t.updatedAt))}</small>${t.blocker?`<span class="activity-blocker">${e(t.blocker)}</span>`:''}</span><span class="activity-work-state">${label((activityTaskOld()?'Último estado: ':'')+activityLabels[t.state],color)}${t.progress>0&&t.progress<100&&t.state==='in_progress'?`<small>${t.progress}% informado</small>`:''}</span>${icon('arrow')}`,'activity-work-row');
  }
  function activityWorkList(agentId,limit=100){
    const items=activityTasks(agentId).sort((a,b)=>({blocked:0,failed:1,conflicting:1,in_progress:2,dispatched:3,open:4,done:5}[a.state]-{blocked:0,failed:1,conflicting:1,in_progress:2,dispatched:3,open:4,done:5}[b.state])||Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
    return items.length?`<div class="panel activity-work-list">${items.slice(0,limit).map(t=>activityTaskRow(t,agentId)).join('')}</div>`:`<section class="panel"><p>Nenhuma Task foi associada a este agente no recorte consultado.</p><p class="small muted">Isso não significa que ele não tenha outros trabalhos.</p></section>`;
  }
  function activityRuntimeRows(id){
    return `<div class="activity-runtime-list">${activitySessions(id).map(s=>{
      const current=activityCurrent(s),caption=s.state==='running'?'Turno em execução':s.state==='idle'?'Sem turno em execução':s.state==='conflicting'?'Identidade ou resposta divergente':'Runtime não observado';
      return `<article class="panel activity-runtime-row"><div><h3>${e(s.name)}</h3><p>${!current&&s.validUntil?'Última observação: ':''}${e(caption)}</p><p class="small muted">${e(feedDate(s.observedAt))}${!current&&s.validUntil?' · desatualizada':''}</p></div>${link('/activity/evidence/'+s.evidenceId,'Ver observação','text-link')}</article>`;
    }).join('')}</div>`;
  }
  function activityOverview(){
    const tasks=activityTasks(),running=activitySessions().filter(s=>s.state==='running'&&activityCurrent(s));
    return `<section class="activity-overview" aria-label="Acompanhamento dos agentes"><div class="activity-summary"><div><strong>${running.length}</strong><span>execuções observadas válidas</span></div><div><strong>${tasks.filter(t=>t.state==='in_progress').length}</strong><span>trabalhos em andamento</span></div><div><strong>${tasks.filter(t=>t.state==='blocked').length}</strong><span>trabalhos bloqueados</span></div><div><strong>${tasks.filter(t=>t.state==='done').length}</strong><span>conclusões registradas</span></div></div>${activityNotice()}</section>`;
  }
  function activityWidget(wide){
    const agents=[...new Set(activitySessions().map(s=>s.agent))].sort((a,b)=>activityStatus(a).rank-activityStatus(b).rank||activityTasks(b).length-activityTasks(a).length).slice(0,wide?4:2);
    return `<p class="widget-description">Execução observada, andamento e bloqueios.</p><div class="activity-widget-list">${agents.map(id=>link('/agents/'+id,`<span><strong>${e(activityAgentName(id))}</strong>${activityBadge(id)}<small>${activityTasks(id).filter(t=>t.state==='in_progress').length} em andamento · ${activityTasks(id).filter(t=>t.state==='blocked').length} bloqueados</small></span>${icon('arrow')}`,'activity-widget-row')).join('')}</div>${!agents.length?'<p class="small muted">Aguardando a primeira consulta.</p>':''}${link('/agents',`Acompanhar agentes ${icon('arrow')}`,'widget-link')}${widgetStamp(activityData?'Consulta · '+feedDate(activityData.capturedAt):'Observação ainda não disponível','activity-source')}`;
  }
  function activityAgentPage(id){
    const a=data.agents.find(a=>a.id===id);if(!a)return missing();
    return `${back('/agents')}${heading(a.name,'Execução observada e trabalhos relacionados.','Seu agente')}<div class="activity-agent-status">${activityBadge(id)}</div>${activityNotice()}<div class="detail-layout"><div class="stack"><section>${sectionTitle('Ravi Tasks','Trabalhos e bloqueios')}${activityWorkList(id)}</section><section>${sectionTitle('Consulta ao runtime','Observações de execução')}${activityRuntimeRows(id)}</section>${sessionSection(id)}</div><aside class="stack"><section class="panel"><h2>Como ler os vínculos</h2><p>Uma responsabilidade atribuída e uma atualização feita pelo agente são vínculos diferentes.</p><p class="small muted">O runtime atual não informa qual dessas Tasks pertence ao turno observado. A mesma identidade não comprova essa associação.</p>${link('/activity','Ver fontes e validade','text-link')}</section></aside></div>`;
  }
  function activityTaskPage(id){
    const t=activityTasks().find(t=>t.id===id);if(!t)return null;
    return `${back('/agents')}${heading(t.title,'Estado registrado em Ravi Tasks.','Trabalho acompanhado')}<div class="project-meta">${label((activityTaskOld()?'Último estado: ':'')+activityLabels[t.state],t.state==='done'?'green':t.state==='blocked'?'amber':'')}<span>Atualizado · ${e(feedDate(t.updatedAt))}</span></div>${activityTaskOld()?notice('Mantivemos a última consulta válida. O estado atual precisa de nova verificação.'):''}<div class="detail-layout"><div class="stack"><section class="panel"><h2>Último avanço registrado</h2><p>${e(t.lastUpdate||'Sem descrição de avanço no histórico retornado.')}</p>${t.progress>0&&t.progress<100?`<p class="activity-progress"><strong>${t.progress}%</strong> informado no registro nativo</p>`:''}${t.blocker?`<div class="activity-blocker-detail"><h3>O que está bloqueando</h3><p>${e(t.blocker)}</p></div>`:''}${t.result?`<h3>Resultado registrado</h3><p>${e(t.result)}</p>`:''}</section><section>${sectionTitle('Origem e horário','Evidências do andamento')}<div class="panel activity-events">${[...t.events].reverse().map(ev=>link('/activity/evidence/'+ev.id,`<span><strong>${e(activityEventLabels[ev.type])}</strong><small>${e(feedDate(ev.at))} · ${e(ev.agent?activityAgentName(ev.agent):'Ravi Tasks')}</small></span>${icon('arrow')}`,'activity-event-row')).join('')||'<p>Nenhum evento incluído no recorte.</p>'}</div><p class="small muted">Eventos incluídos na captura; não é o histórico integral.</p></section></div><aside class="stack"><section class="panel"><h2>Agentes relacionados</h2>${t.roles.map(r=>`<p>${link('/agents/'+r.agent,activityAgentName(r.agent),'text-link')}<small class="activity-role">${r.kind==='assigned'?'Responsável atribuído':'Atualizou o registro'}</small></p>`).join('')}<dl class="work-metadata"><div><dt>Prazo</dt><dd>Não informado nesta fonte</dd></div><div><dt>Execução vinculada</dt><dd>Associação não comprovada</dd></div><div><dt>Consulta</dt><dd>${e(feedDate(activityData.capturedAt))}</dd></div></dl></section></aside></div>`;
  }
  function activityEvidencePage(id){
    const observation=activitySessions().find(s=>s.evidenceId===id);
    if(observation)return `${back('/agents/'+observation.agent)}${heading('Observação de execução',observation.name,'Origem verificável')}<section class="panel"><h2>${observation.state==='running'?'Turno em execução na consulta':observation.state==='idle'?'Sem turno em execução na consulta':'Estado não confirmado'}</h2><p>${e(feedDate(observation.observedAt))} · ${e(activityAgentName(observation.agent))}</p><p>${observation.reason==='host_confirmed'?'A consulta nativa recebeu resposta do processo responsável pela sessão e conferiu sua identidade antes e depois da leitura.':'A consulta não confirmou uma resposta válida do runtime para esta identidade. Isso não comprova inatividade.'}</p><p>${activityCurrent(observation)?'Observação dentro da janela de apresentação.':'Esta observação não certifica o estado atual.'} A janela de 1 minuto não é garantia de execução contínua.</p><p class="small muted">Fonte: controle nativo do runtime Ravi, somente resumo. Conteúdo de turnos, previews, chaves e identificadores internos não são apresentados. Nenhuma Task foi atribuída a este turno por inferência.</p></section>`;
    const task=activityTasks().find(t=>t.events.some(e=>e.id===id)),event=task?.events.find(e=>e.id===id);if(!event)return missing();
    return `${back('/tasks/'+task.id)}${heading(activityEventLabels[event.type],task.title,'Evidência de Ravi Tasks')}<section class="panel"><p class="small muted">Registrado em ${e(feedDate(event.at))}${event.agent?' · '+e(activityAgentName(event.agent)):''}</p><blockquote class="activity-quote">${e(event.text||'Evento sem texto descritivo.')}</blockquote><p>Este evento comprova uma atualização no registro da Task. Uma conclusão registrada não substitui a avaliação da entrega.</p><p class="small muted">Consulta de ${e(feedDate(activityData.capturedAt))}. Histórico limitado ao recorte consultado; texto sensível e referências internas são omitidos.</p>${link('/tasks/'+task.id,'Voltar ao trabalho','text-link')}</section>`;
  }
  function activitySourcesPage(){return `${back('/agents')}${heading('O que estamos acompanhando','Fontes, vínculos e validade.','Agentes e trabalho')}<section class="panel"><h2>Execução</h2><p>Consultamos o runtime das ${activityData?.sessions.length||0} conversas previamente selecionadas. Um processo sem resposta permanece desconhecido. Recência de conversa não indica execução.</p><h2>Trabalho</h2><p>Ravi Tasks fornece estados, responsáveis, progresso informado, bloqueios e conclusões. O vínculo por atualização preserva a identidade de quem registrou o evento. Não associamos uma Task a um turno apenas pelo nome ou agente.</p><h2>Atualidade</h2><p>Esta página apresenta o snapshot fornecido, sem iniciar consultas ao runtime. Uma observação de execução perde validade em 1 minuto; o último registro permanece disponível com sua data. Falha de fonte preserva os dados anteriores.</p><h2>Alcance</h2><p>Tasks e eventos incluídos para os agentes selecionados. Outros trabalhos, workflows e relações com Projects não são deduzidos. Dados de conversas e ferramentas não são apresentados.</p></section>`;}
  function activityLiveApply(raw){
    if(raw){if(raw.schemaVersion!==1||raw.status!=='ready'||!Array.isArray(raw.sessions)||!Array.isArray(raw.tasks))throw Error('Observação de agentes inválida.');if(!activityData||Date.parse(raw.capturedAt)>=Date.parse(activityData.capturedAt))activityData=raw;}
    const ids=new Set(activityTasks().map(t=>'/tasks/'+t.id));
    for(let i=searchRecords.length-1;i>=0;i--)if(searchRecords[i].activity||ids.has(searchRecords[i].route))searchRecords.splice(i,1);
    searchRecords.push(...activityTasks().map(t=>({activity:true,type:'work',name:t.title,text:`${activityLabels[t.state]} · ${t.lastUpdate} · ${t.blocker||''}`,route:'/tasks/'+t.id})));
  }
  function activityTick(){
    if(document.hidden||dialog.open)return;
    const scroll=window.scrollY;
    const {path,params}=parseRoute(routeFromLocation());
    if(path==='/home'){const node=main.querySelector('[data-widget=activity]'),widget=homeWidgets.find(w=>w.id==='activity');if(node&&widget)feedLivePatch(node,node.querySelector('.widget-heading').outerHTML+activityWidget(widget.size==='wide'));}
    else if(path==='/agents')feedLivePatch(main,agents(params));
    else if(path.startsWith('/agents/'))feedLivePatch(main,agent(path.slice(8)));
    else if(path.startsWith('/activity/evidence/'))feedLivePatch(main,activityEvidencePage(path.slice(19)));
    else if(path.startsWith('/tasks/')&&activityTaskPage(path.slice(7)))feedLivePatch(main,activityTaskPage(path.slice(7)));
    else if(path==='/work')feedLivePatch(main,work(params));
    window.scrollTo({top:scroll,behavior:'instant'});
  }
  setInterval(activityTick,15000);
  queueMicrotask(()=>activityLiveApply(null));
