// Presentation-only rules: native schedule/next run remain authoritative.
const AlertsModel = (() => {
  const finite = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const state = item => item.enabled===true?'active':item.enabled===false?'paused':'unknown';
  const isFailed = item => item.lastStatus==='error';
  const date = (value,timezone=config.timezone) => {
    if(!finite(value))return 'Não informado';
    try{return new Intl.DateTimeFormat(config.locale,{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:timezone}).format(new Date(value));}catch{return 'Data não disponível';}
  };
  const interval = ms => {
    if(!finite(ms)||ms<=0)return 'Intervalo não informado';
    const parts=[];let remaining=ms;
    for(const [unit,size] of [['d',86400000],['h',3600000],['min',60000]]){const n=Math.floor(remaining/size);if(n){parts.push(`${n} ${unit}`);remaining%=size;}}
    if(remaining)parts.push(`${new Intl.NumberFormat(config.locale,{maximumFractionDigits:3}).format(remaining/1000)} s`);
    return `A cada ${parts.join(' ')}`;
  };
  const schedule = item => {
    const s=item.schedule||{};
    if(s.type==='every')return interval(s.every);
    if(s.type==='at')return `Uma vez · ${date(s.at)}`;
    if(s.type==='cron')return s.cron?`Calendário · ${s.cron}`:'Expressão não informada';
    return 'Frequência não informada';
  };
  const matches = (item,{query='',status='all',agent='all'}={}) => {
    if(status!=='all'&&(status==='failed'?!isFailed(item):state(item)!==status))return false;
    if(agent!=='all'&&item.agentKey!==agent)return false;
    const content=normalize(`${item.name} ${item.agentName} ${schedule(item)}`);
    return normalize(query).trim().split(/\s+/).filter(Boolean).every(word=>content.includes(word));
  };
  const sort = items => [...items].sort((a,b)=>{
    const activeA=state(a)==='active',activeB=state(b)==='active';
    if(activeA!==activeB)return activeA?-1:1;
    const nextA=finite(a.nextRunAt)?a.nextRunAt:Infinity,nextB=finite(b.nextRunAt)?b.nextRunAt:Infinity;
    return (nextA===nextB?0:nextA-nextB)||String(a.name).localeCompare(String(b.name),'pt-BR');
  });
  return {finite,state,isFailed,date,interval,schedule,matches,sort};
})();
