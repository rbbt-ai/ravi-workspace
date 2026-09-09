import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {assertBoundConfig} from './operation-storage.mjs';
export const SOURCES=['agenda','meetings','pipeline','projects','tasks','agents','alerts','activity','connections','projectAnalysis'];
export const WIDGETS=['agenda','urgent','agents','activity','projects','pipeline','meetings','decisions','changes'];
export const DEFAULT_CONFIG={schema:'workspace.config/v1',installationId:null,workspaceName:'Meu Workspace',brand:{wordmark:'Ravi',logoFile:null,displayFontRegular:null,displayFontBold:null},owner:{name:'',context:''},locale:'pt-BR',timezone:'UTC',historyDays:15,defaultTheme:'system',theme:{day:{},dark:{}},widgets:null,sources:[],selection:{agents:[],alertAgents:[],sessions:[],projects:[],tasks:[],work:[],sources:[]},allowedOrigins:['https://calendar.google.com','https://www.google.com','https://tldv.io','https://app.tldv.io'],projectName:'',integrations:{agenda:{mode:'off',account:''},meetings:{mode:'off'}}};
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
export function exact(v,keys,label){if(!object(v)||Object.keys(v).some(k=>!keys.includes(k)))throw Error('INVALID_'+label);}
const text=(s,n=200)=>typeof s==='string'&&s.length<=n&&!/[\u0000-\u001f]/.test(s);
const ids=v=>Array.isArray(v)&&v.length<=2000&&v.every(s=>text(s,160)&&/^[a-zA-Z0-9][a-zA-Z0-9_.:-]*$/.test(s))&&new Set(v).size===v.length;
const colors=['brand-blue','brand-violet','bg','surface','sidebar','topbar','surface-subtle','surface-raised','ink','muted','line','accent','accent-soft','accent-line','primary','on-accent','accent-hover','nav-active','hover','focus','success','success-soft','success-line','amber','amber-soft','attention-bg','amber-line'];
export function validateConfig(raw){
 exact(raw,Object.keys(DEFAULT_CONFIG),'CONFIG');
 const c={...structuredClone(DEFAULT_CONFIG),...raw,brand:{...DEFAULT_CONFIG.brand,...raw.brand},owner:{...DEFAULT_CONFIG.owner,...raw.owner},selection:{...structuredClone(DEFAULT_CONFIG.selection),...raw.selection},theme:{day:{},dark:{},...raw.theme}};
 if(c.schema!=='workspace.config/v1'||!text(c.installationId,80)||!c.installationId||!/^[a-z0-9][a-z0-9-]{2,79}$/.test(c.installationId))throw Error('INVALID_INSTALLATION_ID');
 exact(c.brand,Object.keys(DEFAULT_CONFIG.brand),'BRAND');exact(c.owner,['name','context'],'OWNER');exact(c.selection,Object.keys(DEFAULT_CONFIG.selection),'SELECTION');exact(c.theme,['day','dark'],'THEME');
 exact(c.integrations,['agenda','meetings'],'INTEGRATIONS');exact(c.integrations.agenda,['mode','account'],'AGENDA_BINDING');exact(c.integrations.meetings,['mode'],'MEETINGS_BINDING');
 if(!['off','google-workspace'].includes(c.integrations.agenda.mode)||!text(c.integrations.agenda.account,200)||!['off','tldv'].includes(c.integrations.meetings.mode))throw Error('INVALID_INTEGRATIONS');
 if(c.integrations.agenda.mode==='google-workspace'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.integrations.agenda.account))throw Error('EXPECTED_ACCOUNT_REQUIRED');
 if(!text(c.workspaceName,100)||!c.workspaceName||!text(c.brand.wordmark,16)||!c.brand.wordmark||!text(c.owner.name,80)||!text(c.owner.context,100)||!text(c.projectName,100))throw Error('INVALID_IDENTITY');
 for(const field of ['logoFile','displayFontRegular','displayFontBold'])if(c.brand[field]!==null&&(!text(c.brand[field],1000)||!c.brand[field]))throw Error('INVALID_ASSET_PATH');
 try{new Intl.DateTimeFormat(c.locale,{timeZone:c.timezone}).format(new Date());}catch{throw Error('INVALID_LOCALE_TIMEZONE');}
 if(!['system','day','dark'].includes(c.defaultTheme)||!Number.isInteger(c.historyDays)||c.historyDays<1||c.historyDays>90)throw Error('INVALID_PREFERENCES');
 if(!Array.isArray(c.sources)||c.sources.some(s=>!SOURCES.includes(s))||new Set(c.sources).size!==c.sources.length)throw Error('INVALID_SOURCES');
 for(const value of Object.values(c.selection))if(!ids(value))throw Error('INVALID_SELECTION');
 for(const theme of ['day','dark']){exact(c.theme[theme],colors,'PALETTE');if(Object.values(c.theme[theme]).some(v=>typeof v!=='string'||!/^#[a-f0-9]{6}$/i.test(v)))throw Error('INVALID_PALETTE_COLOR');}
 if(c.widgets!==null){if(!Array.isArray(c.widgets)||c.widgets.length>WIDGETS.length||new Set(c.widgets.map(w=>w.id)).size!==c.widgets.length)throw Error('INVALID_WIDGETS');for(const w of c.widgets){exact(w,['id','size'],'WIDGET');if(!WIDGETS.includes(w.id)||!['compact','wide'].includes(w.size))throw Error('INVALID_WIDGET');}}
 if(!Array.isArray(c.allowedOrigins)||c.allowedOrigins.length>30)throw Error('INVALID_ORIGINS');
 c.allowedOrigins=c.allowedOrigins.map(s=>{try{const u=new URL(s);if(u.protocol!=='https:'||u.username||u.password||u.origin!==s)throw Error();return u.origin;}catch{throw Error('INVALID_ORIGIN');}});
 return c;
}
export async function readConfig(file,{identityRunner}={}){await assertBoundConfig(file,identityRunner);const stat=await readFile(file,'utf8');if(stat.length>100000)throw Error('CONFIG_TOO_LARGE');return validateConfig(JSON.parse(stat));}
export async function initializeConfig(file){const config=validateConfig({...structuredClone(DEFAULT_CONFIG),installationId:randomUUID()});await mkdir(dirname(resolve(file)),{recursive:true});await writeFile(file,JSON.stringify(config,null,2)+'\n',{flag:'wx',mode:0o600});return {schema:config.schema,installationId:config.installationId};}
export function browserConfig(c){return {installationId:c.installationId,workspaceName:c.workspaceName,title:c.brand.wordmark+' Workspace',wordmark:c.brand.wordmark,ownerName:c.owner.name,ownerContext:c.owner.context,locale:c.locale,timezone:c.timezone,historyDays:c.historyDays,defaultTheme:c.defaultTheme,widgets:c.widgets,allowedOrigins:c.allowedOrigins,projectName:c.projectName};}
