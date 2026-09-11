// Explicit read-only contracts. Never turn arbitrary CLI text into gateway calls.
const page={limit:'number',offset:'number'};
export const operations={
 'projects.list':{flags:page},
 'agents.list':{flags:page},
 'tasks.list':{flags:{since:'string',until:'string',limit:'number',last:'string',sort:'string',order:'string',cursor:'string'}},
 'artifacts.list':{flags:{...page,rich:'boolean',agent:'string',session:'string',task:'string',tag:'string',kind:'string',lifecycle:'string','order-by':'orderBy'}},
 'artifacts.show':{argument:'id',flags:{}},
 'cloud.projects.list':{flags:page},
 'pages.published':{argument:'project',flags:page},
 'connectors.list':{flags:{...page,project:'string',provider:'string'}},
 'connectors.show':{argument:'id',flags:{}},
 'sessions.list':{flags:{...page,agent:'string',tag:'string'}},
 'sessions.read':{argument:'nameOrKey',flags:{workspace:'boolean',count:'number'},aliases:{'-n':'count'}},
 'gmail.list':{flags:{connector:'string',max:'number',q:'string',label:'string',cursor:'string'}},
 'gmail.read':{argument:'id',flags:{connector:'string',format:'string'}}
};
export function parseRead(args){
 const count=args[0]==='cloud'?3:2,name=args.slice(0,count).join('.'),spec=Object.hasOwn(operations,name)?operations[name]:null;
 if(!spec)return null;
 const positional=[],options={};let start=count;
 if(spec.argument){const id=args[start++];if(typeof id!=='string'||!id||id.startsWith('-'))throw Error('INVALID_NATIVE_ARGUMENT');positional.push(id);}
 for(let i=start;i<args.length;i++){
  const flag=args[i];if(flag==='--json')continue;
  const key=spec.aliases?.[flag]??(flag.startsWith('--')?flag.slice(2):''),type=Object.hasOwn(spec.flags,key)?spec.flags[key]:null;
  if(!type)throw Error('INVALID_NATIVE_ARGUMENT');
  const target=['number','boolean','string'].includes(type)?key:type;
  if(Object.hasOwn(options,target))throw Error('INVALID_NATIVE_ARGUMENT');
  if(type==='boolean'){options[target]=true;continue;}
  const value=args[++i];if(typeof value!=='string')throw Error('INVALID_NATIVE_ARGUMENT');
  // The native registry models numeric CLI options as strings.
  if(type==='number'&&(!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value))))throw Error('INVALID_NATIVE_ARGUMENT');
  options[target]=value;
 }
 return {name,positional,options};
}
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function validateRead(name,raw,positional=[]){
 if(!object(raw)||raw.error||raw.success===false)throw Error('SOURCE_CONTRACT_CHANGED');
 const fail=()=>{throw Error('SOURCE_CONTRACT_CHANGED');};
 if(name==='artifacts.show'){if(!object(raw.artifact)||raw.artifact.id!==positional[0])fail();}
 else if(name==='connectors.show'){if(!object(raw.connection)||raw.connection.id!==positional[0])fail();}
 else if(name==='sessions.read'){
  if(!object(raw.session)||![raw.session.name,raw.session.sessionKey].includes(positional[0])||!Array.isArray(raw.messages??raw.history?.messages))fail();
 }
 else if(name.startsWith('gmail.')){
  if(!object(raw.result)||raw.result.error||raw.result.success===false)fail();
  if(name==='gmail.read'&&raw.result.id!==positional[0])fail();
  if(name==='gmail.list'&&raw.result.messages!==undefined&&!Array.isArray(raw.result.messages))fail();
 }
 else if(!Array.isArray(name==='connectors.list'?raw.connections??raw.items:raw.items))fail();
 return raw;
}
