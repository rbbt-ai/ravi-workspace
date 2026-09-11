(() => {
 'use strict';
 let revision='',pending=null,running=false,closed=false;
 const status=document.createElement('div');status.className='workspace-update-status';status.setAttribute('role','status');status.style.cssText='font-size:12px;padding:6px 20px;color:var(--text-secondary);';
 document.querySelector('.topbar')?.after(status);
 const labels={refreshing:'Atualizando fontes…',reconnecting:'Recuperando atualização · última versão preservada',stale:'Uma fonte está indisponível · última versão preservada',stopped:'Atualização interrompida · reabra o Workspace pelo Ravi',observing:'Atualização automática',periodic:'Atualização periódica'};
 function apply(){if(!pending||document.querySelector('dialog[open]')||document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))return;
  if(window.workspaceReplaceData?.(pending.data)){revision=pending.revision;pending=null;}
 }
 async function poll(){
  if(closed||running||document.hidden)return;running=true;
  try{
   const response=await fetch('/updates',{method:'POST',headers:{'Content-Type':'application/json','X-Workspace-Setup':window.workspaceSetupNonce},body:JSON.stringify({revision}),signal:AbortSignal.timeout(30000)});
   const result=await response.json();
   if(!response.ok){pending=null;revision='';status.textContent='Não foi possível verificar o acesso. Confira sua conta em Configurar fontes.';window.workspaceHideData?.();return;}
   const s=result.status||{};status.textContent=!s.error&&s.unavailable?'Eventos indisponíveis · reconciliação periódica ativa':labels[s.status]||'Verificando atualização';
   if(result.data&&result.installationId===window.workspaceSetupBootstrap.installationId)pending=result;
   apply();
  }catch{status.textContent='Conexão interrompida · última versão preservada';}finally{running=false;}
 }
 const timer=setInterval(poll,5000);document.addEventListener('visibilitychange',poll);document.addEventListener('close',apply,true);
 window.addEventListener('pagehide',()=>{closed=true;clearInterval(timer);});
 window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
 void poll();
})();
