  const feedLiveAvailable=false,feedPagesMode=false,feedPrivateAccess=false,feedLiveExpired=false,feedLiveError='';
  const feedLiveStates=Object.fromEntries(Object.entries(data.sourceStates).map(([key,s])=>[key,{verified:s.status==='ready',error:s.status==='unavailable'?'SOURCE_UNAVAILABLE':null,stale:s.status==='stale',data:{...data.home.feeds[key],capturedAt:s.capturedAt}}]));
  const sourceLabel=n=>({projects:'Projetos',tasks:'Tarefas',agents:'Agentes',agenda:'Agenda',meetings:'Reuniões',pipeline:'Pipeline',activity:'Atividade',alerts:'Alerts',connections:'Conexões',projectAnalysis:'Análise de projetos'}[n]||n);
  const sourceReady=n=>data.sourceStates[n]?.status==='ready';
  const unavailableNative=n=>sourceReady(n)?`<div class="feed-empty"><h3>Nenhum registro neste recorte</h3><p>A consulta de ${e(sourceLabel(n))} não incluiu registros na seleção desta instalação.</p>${homeButton('home-sources','Ver fontes')}</div>`:`<div class="widget-unavailable"><span class="connection-label">${data.sourceStates[n]?.status==='not_configured'?'Fonte não configurada':'Consulta indisponível'}</span><h3>${e(sourceLabel(n))}</h3><p>Nenhum dado foi incluído para esta fonte. Isso não confirma ausência de registros no seu Ravi.</p>${homeButton('home-sources','Ver fontes '+icon('arrow'))}</div>`;
  const nativeCapture=n=>feedDate(data.sourceStates[n]?.capturedAt);
  function nativeLiveStamp(n,text,action='home-sources'){return widgetStamp(text+(feedLiveStates[n]?.error?' · Atualização indisponível':''),action);}
  function nativeLiveNotice(n){const s=data.sourceStates[n];return !s||s.status==='not_configured'?notice('Fonte não configurada nesta instalação.'):s.status==='unavailable'||s.status==='stale'?notice('Atualização indisponível ou atrasada. Os registros disponíveis mantêm a data da última consulta.'):'';}
  function feedLiveStamp(n,text){return widgetStamp(text+(feedLiveStates[n]?.error?' · Atualização indisponível':''),'feed-'+n);}
  function feedLiveControls(){return `<section class="feed-live-controls" aria-label="Atualização dos dados"><span class="feed-live-symbol">${icon('info')}</span><div><strong>Dados desta instalação</strong><p>Consulte as datas e o alcance de cada fonte. A atualização automática ainda não foi configurada para esta instalação.</p></div>${homeButton('home-sources','Ver fontes','secondary')}</section>`;}
  function feedLiveAction(){return false;}
  function feedLivePatch(node,html){
    if(!node||node.innerHTML===html)return;
    const active=document.activeElement,inside=node.contains(active),key=inside?active.dataset.focusKey:null,action=inside?active.dataset.action:null;
    node.innerHTML=html;
    if(inside){const target=[...node.querySelectorAll('button,a,input,[tabindex]')].find(el=>key&&el.dataset.focusKey===key||action&&el.dataset.action===action);target?.focus({preventScroll:true});}
  }
  const managerAvailable=false,managerWorking=false,managerPoll=null;
  let managerError='',managerState={project:config.projectName||'Projeto não configurado',capturedAt:data.connectionSources?.capturedAt||null,connections:data.connectionSources?.connections||[],actionsEnabled:false};
  function managerSection(){return `<section class="panel connector-platform"><h2>Conexões cadastradas</h2><p>${e(managerState.project)}</p>${managerState.connections.length?managerState.connections.map(c=>`<p>${e(c.name||c.provider)} · ${e(c.account||'Conta não informada')} · ${e(c.status)}</p>`).join(''):'<p>Nenhuma conexão foi incluída neste snapshot.</p>'}<p class="small muted">Esta prévia não altera contas. A configuração das integrações será feita com os contratos do seu Ravi.</p></section>`;}
  function managerAction(name){if(!name.startsWith('manager-'))return false;showDialog('Configurar no seu Ravi','Conexões','<p>O gerenciamento local ainda não está ligado a esta instalação. A revisão não cria uma conexão nem troca a fonte da Home.</p>');return true;}
