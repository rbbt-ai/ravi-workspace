  let projectContext = data.projectContext, projectAnalysisInfo = null, projectAnalysisUnavailable = false;
  function projectAnalysisApply(raw,error=null){
    projectAnalysisUnavailable=!!error;
    if(!raw?.context||!raw?.analysis)return;
    if(Date.parse(raw.context.analyzedAt)<Date.parse(projectContext.analyzedAt))return;
    projectContext=raw.context;projectAnalysisInfo=raw.analysis;
  }
  function projectAnalysisLabel(){
    const s=projectAnalysisInfo;
    if(projectAnalysisUnavailable)return 'Análise indisponível · síntese preservada';
    if(!s)return projectContext.analyzedAt?'Síntese do snapshot':'Análise ainda não realizada';
    if(s.phase==='pending')return `${s.pendingCount} novas evidências em análise`;
    if(s.phase==='source_error')return 'Fonte indisponível · síntese preservada';
    if(s.phase==='analysis_error')return 'Análise pendente · síntese preservada';
    return 'Análise incremental ativa';
  }
  function projectAnalysisNotice(){
    const s=projectAnalysisInfo;
    return `<p class="small muted" role="status">${e(projectAnalysisLabel())}${s?.collectedAt?' · coleta '+e(feedDate(s.collectedAt)):''} · síntese ${e(feedDate(projectContext.analyzedAt))}.</p>`;
  }
  const contextForProject = id => projectContext.projects.find(p=>p.id===id);
  function projectItems(){
    const native=homeData.projects.map(p=>({...p,context:contextForProject(p.id),candidate:false}));
    const candidates=projectContext.projects.filter(c=>!c.nativeId).map(c=>({id:c.id,title:c.title,summary:c.summary,next:c.next,owner:null,status:'unknown',updatedAt:0,workspace:false,context:c,candidate:true}));
    return [...native,...candidates].sort((a,b)=>Math.max(b.updatedAt,Date.parse(b.context?.lastActivityAt)||0)-Math.max(a.updatedAt,Date.parse(a.context?.lastActivityAt)||0)||a.id.localeCompare(b.id));
  }
  const contextBasis = c => ({conversation:'Conversas e artefatos',documents:'Documentos e vínculos',registry:'Fontes a confirmar'})[c.basis];
  const projectConversationStamp = p => p.context ? (p.context.lastActivityAt ? shortDate(p.context.lastActivityAt) : 'Sem conversa') : shortDate(p.updatedAt);
  const projectCopy = p => p.context?.summary||p.summary;
  const projectSearchRecords = () => projectItems().map(p=>({type:'project',name:p.title,text:[projectCopy(p),p.context?.stage,...(p.context?.agents||[]),...(p.context?.evidence||[]).map(s=>s.label+' '+s.text)].filter(Boolean).join(' · '),route:`/portfolio/${p.id}`}));
  function projectOrigin(){
    showDialog('Como entendemos seus projetos','Origem e atualização',`<p>Cruzamos conversas, documentos e vínculos existentes para entender o trabalho, suas entregas e o que falta.</p>${projectAnalysisNotice()}<ul><li>${projectContext.coverage.sessions} sessões no recorte informado pela fonte. Limite informado por histórico: ${projectContext.coverage.maxReadPerStore}.</li><li>${projectContext.projects.filter(p=>p.nativeId).length} Projects revisados e ${projectContext.projects.filter(p=>!p.nativeId).length} frentes propostas.</li><li>Análise: ${e(feedDate(projectContext.analyzedAt))}. Consulta ao cadastro: ${e(nativeCapture('projects'))}.</li></ul><p>${e(projectContext.coverage.description)}</p>${projectAnalysisInfo?`<p>${e(projectAnalysisInfo.description)}</p>`:''}<div class="dialog-note">Novas evidências precisam ser revisadas antes de atualizar a síntese. Repetições não criam novas evidências; correções substituem afirmações anteriores. Falhas mantêm a versão válida com sua data. Relato de entrega não certifica execução atual. O acesso segue o escopo desta instalação.</div>`);
  }
  function projectWidget(wide){
    const items=projectItems();
    if(!items.length)return unavailableNative('projects');
    return `<div class="widget-subline"><span>Conversas e artefatos</span>${link('/portfolio',`${items.length} frentes ${icon('arrow')}`,'widget-link')}</div><div class="widget-list project-peek">${items.slice(0,wide?5:3).map(p=>link(nativeProjectLink(p),`<span class="mini-folder">${icon('folder')}</span><span><strong>${e(p.title)}</strong><small>${e(p.context?(p.candidate?'Frente a confirmar · ':'')+p.context.stage:p.owner||'Contexto a analisar')}</small></span><time>${projectConversationStamp(p)}</time>${icon('arrow')}`,'widget-row',p.workspace?'home-project':'')).join('')}</div>${widgetStamp(projectAnalysisLabel()+' · '+feedDate(projectContext.analyzedAt),'project-origin')}`;
  }
  function contextProjectRow(p){
    return link(nativeProjectLink(p),`<span class="mini-folder">${icon('folder')}</span><span><h2>${e(p.title)}</h2><p>${e(projectCopy(p))}</p><small>${p.context?`${e(p.candidate?'Frente a confirmar':p.context.stage)} · ${p.context.evidence.length} evidências · ${e(contextBasis(p.context))} · ${e(p.context.agents.join(' · ')||'Agente não confirmado')}`:`Contexto ainda não associado · ${e(p.owner||'Responsável não informado')}`}</small></span>${icon('arrow')}`,'native-row');
  }
  function contextPortfolio(){
    const items=projectItems();if(!items.length)return `${back('/home')}${heading('Seus projetos','Projetos e contexto desta instalação.')}<section class="panel">${unavailableNative('projects')}</section>`;const analyzed=items.filter(p=>p.context&&p.context.basis!=='registry'),pending=items.filter(p=>!p.context||p.context.basis==='registry');
    return `${back('/home')}${heading('Seus projetos','Entenda o trabalho pelas conversas, artefatos e pessoas envolvidas.','Panorama')}<div class="project-context-summary"><p>${analyzed.length} frentes com contexto · ${pending.length} projetos com lacunas de fontes.</p>${homeButton('project-origin','Como chegamos a esta visão '+icon('info'))}</div>${projectAnalysisNotice()}<div class="native-list">${analyzed.map(contextProjectRow).join('')}</div>${pending.length?`<h2 class="native-section-title">Fontes a confirmar</h2><p class="small muted">Consulta de ${e(nativeCapture('projects'))}. A revisão destes cadastros não encontrou evidência suficiente de trabalho recente. Abra o detalhe para ver as lacunas.</p><div class="native-list">${pending.map(contextProjectRow).join('')}</div>`:''}`;
  }
  function contextProjectDetail(id){
    const p=projectItems().find(p=>p.id===id),c=p?.context;if(!p||!c)return null;
    const kinds={request:'Pedido na conversa',conversation:'Relato na conversa',document:'Documento consultado',catalog:'Registro de Page',registry:'Cadastro nativo consultado'};
    return `${back('/portfolio')}${heading(p.title,c.stage,p.candidate?'Frente a confirmar':'Projeto')}${projectAnalysisNotice()}<p class="small muted">Revisão de ${e(feedDate(c.reviewedAt))} · ${e(contextBasis(c))}${c.lastActivityAt?' · conversa em '+e(feedDate(c.lastActivityAt)):' · sem conversa recente associada'}</p><div class="project-context-grid"><section class="panel"><h2>O que sabemos</h2><p>${e(c.summary)}</p><p class="project-participants">Agentes relacionados: ${e(c.agents.join(' · ')||'Não confirmado no cadastro ou nas fontes')}</p></section><section class="panel"><p class="tiny-label">Próximo passo recomendado</p><h2>${e(c.next)}</h2><p class="small muted">Recomendação da análise; não cria tarefa nem atribui prazo.</p></section></div><section class="panel project-context-gaps"><h2>O que falta confirmar</h2><ul>${c.gaps.map(g=>`<li>${e(g)}</li>`).join('')}</ul></section><h2 class="native-section-title">Evidências desta leitura</h2><div class="project-evidence-list">${c.evidence.map(s=>`<article class="panel project-evidence" data-evidence="${e(s.id)}"><span class="connection-label">${e(kinds[s.kind])}</span><h3>${e(s.label)}</h3><p>${e(s.text)}</p><small>${e(['document','registry'].includes(s.kind)?'Consultado em ':'Registrado em ')}${e(feedDate(s.at))}</small>${s.url?`<a class="widget-link" href="${e(s.url)}" target="_blank" rel="noopener noreferrer">Abrir artefato ${icon('arrow')}</a>`:''}</article>`).join('')}</div>${p.candidate?`<div class="dialog-note">Esta frente foi identificada na análise. A associação ainda precisa ser confirmada; nenhum Project foi criado automaticamente.</div>`:`<section class="panel project-native-reference"><h2>Referência do cadastro</h2><p>${e(p.summary)}</p><p class="small muted">Responsável registrado: ${e(p.owner||'Não informado')} · atualizado em ${shortDate(p.updatedAt)} · consulta ${e(nativeCapture('projects'))}.</p><p class="small muted">A consulta do cadastro e a análise acima têm datas próprias. Divergências exigem revisão; o cadastro não foi sobrescrito.</p></section>`}`;
  }
