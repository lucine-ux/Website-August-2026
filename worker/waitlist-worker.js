// Back to Breath form worker: waitlists + The Nervous System Audit.
// Secrets and IDs live in Cloudflare (Settings > Variables), never in this file:
//   FLODESK_API_KEY, SEGMENT_RETREAT, SEGMENT_RETREAT_DAY, SEGMENT_RETREAT_WEEKEND, SEGMENT_BASELINE,
//   SEGMENT_PROGRAM (ADHD Capacity Program waitlist),
//   SEGMENT_AUDIT_ALL, SEGMENT_AUDIT_AVOIDER, SEGMENT_AUDIT_INTERNALISER, SEGMENT_AUDIT_OVERFUNCTIONER,
//   SEGMENT_AUDIT_ABSORBER, SEGMENT_AUDIT_CARE (optional), SHEET_WEBHOOK (Google Sheet script URL), SHEET_TOKEN
const MAP={day:["SEGMENT_RETREAT_DAY"],weekend:["SEGMENT_RETREAT_WEEKEND"],either:["SEGMENT_RETREAT_DAY","SEGMENT_RETREAT_WEEKEND"]};
const TYPES=["avoider","internaliser","overfunctioner","absorber"];
const UA="Back to Breath website (backtobreath.net.au)";
const clip=(v,n)=>String(v==null?"":v).trim().slice(0,n);

export default{async fetch(request,env,ctx){
const origin=request.headers.get("Origin")||"";
const allowed=(env.ALLOWED_ORIGIN||"https://backtobreath.net.au,https://www.backtobreath.net.au").split(",").map(s=>s.trim());
const okOrigin=allowed.includes(origin)?origin:allowed[0];
const cors={"Access-Control-Allow-Origin":okOrigin,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin"};
const reply=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{"Content-Type":"application/json",...cors}});
if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
if(request.method!=="POST")return reply({error:"POST only"},405);
if(origin&&!allowed.includes(origin))return reply({error:"Origin not allowed"},403);
let body;try{body=await request.json()}catch{return reply({error:"Bad JSON"},400)}
const list=String(body.list||"");const email=String(body.email||"").trim().toLowerCase();const name=clip(body.name,80);const format=String(body.format||"");
if(!/^\S+@\S+\.\S+$/.test(email))return reply({error:"Invalid email"},400);

const ids=[];let custom=null;let sheetRow=null;
if(list==="retreat"){if(env.SEGMENT_RETREAT)ids.push(env.SEGMENT_RETREAT);(MAP[format]||[]).forEach(k=>{if(env[k])ids.push(env[k])});if(format)custom={retreat_format:format}}
else if(list==="baseline"){if(env.SEGMENT_BASELINE)ids.push(env.SEGMENT_BASELINE)}
else if(list==="program"){if(env.SEGMENT_PROGRAM)ids.push(env.SEGMENT_PROGRAM);const st=clip(body.struggle,250);if(st)custom={program_struggle:st}}
else if(list==="audit"){
  const a=body.audit||{};
  const type=TYPES.includes(a.type)?a.type:"";const second=TYPES.includes(a.second)?a.second:"";
  if(!type)return reply({error:"Missing type"},400);
  const answers=(Array.isArray(a.answers)?a.answers:[]).slice(0,10).map(n=>Math.max(0,Math.min(4,Number(n)||0)));
  const score=answers.reduce((x,y)=>x+y,0);
  const level=score>=29?"Past empty":score>=16?"Running on empty":"Running low";
  const adhd=["yes","think","no","unsure"].includes(a.adhd)?a.adhd:"";
  const heaviest=clip(a.heaviest,600);const different=clip(a.different,600);const care=!!a.care;
  const pick=(v,ok)=>(Array.isArray(v)?v:[]).map(String).filter(x=>ok.includes(x)).slice(0,8);
  const gender=["woman","man","nonbinary","other","skip"].includes(a.gender)?a.gender:"";
  const peri=["yes","maybe","no","after"].includes(a.peri)?a.peri:"";
  const age=["under25","25-34","35-44","45-54","55+"].includes(a.age)?a.age:"";
  const tried=pick(a.tried,["meds","therapy","apps","exercise","breathwork","coaching","learning","nothing"]);
  const stopped=pick(a.stopped,["cost","time","notwork","stick","unsure","myself","notyet"]);
  const support=pick(a.support,["audio","live","community","course","oneone","inperson"]);
  const found=["instagram","facebook","friend","google","other"].includes(a.found)?a.found:"";
  if(env.SEGMENT_AUDIT_ALL)ids.push(env.SEGMENT_AUDIT_ALL);
  if(env["SEGMENT_AUDIT_"+type.toUpperCase()])ids.push(env["SEGMENT_AUDIT_"+type.toUpperCase()]);
  if(care&&env.SEGMENT_AUDIT_CARE)ids.push(env.SEGMENT_AUDIT_CARE);
  custom={audit_type:type,audit_second_type:second,audit_level:level,audit_score:String(score),audit_adhd:adhd,audit_gender:gender,audit_age:age,audit_peri:peri,audit_support:support.join(", "),audit_found:found,audit_date:new Date().toISOString().slice(0,10)};
  sheetRow={token:env.SHEET_TOKEN||"",date:new Date().toISOString(),name,email,type,second,score,level,adhd,gender,age,peri,tried:tried.join(", "),stopped:stopped.join(", "),support:support.join(", "),found,heaviest,different,care,answers};
}
else return reply({error:"Unknown list"},400);
if(!ids.length)return reply({error:"Segment not configured"},500);

// Log the full audit answers to the Google Sheet without slowing the reply down.
if(sheetRow&&env.SHEET_WEBHOOK){ctx.waitUntil(fetch(env.SHEET_WEBHOOK,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(sheetRow),redirect:"follow"}).catch(()=>{}))}

const payload={email,first_name:name,segment_ids:[...new Set(ids)]};
if(custom)payload.custom_fields=custom;
const send=()=>fetch("https://api.flodesk.com/v1/subscribers",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Basic "+btoa(env.FLODESK_API_KEY+":"),"User-Agent":UA},body:JSON.stringify(payload)});
let res=await send();
if(!res.ok&&payload.custom_fields){delete payload.custom_fields;res=await send()}
if(!res.ok)return reply({error:"Flodesk error",status:res.status},502);
return reply({ok:true})}};
