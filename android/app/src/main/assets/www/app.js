
const LIMITS={P:3,D:8,C:8,A:6}, RN={P:"Portieri",D:"Difensori",C:"Centrocampisti",A:"Attaccanti"};
const DEFAULT_LISTS=["Top","Semi-top","Titolari","Scommesse","Low cost","Da evitare"];
const $=x=>document.getElementById(x), num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
function P(name,team,role,price,fvm,form,starter,risk,avg,goals,assists,setpieces,attacking,newarrival,upside){return{name,team,role,price,fvm,form,starter,risk,avg,goals,assists,setpieces,attacking,newarrival,upside}}
function demo(){
 const teams=["Atalanta","Bologna","Como","Fiorentina","Genoa","Inter","Juventus","Lazio","Milan","Napoli","Parma","Roma","Torino","Udinese","Verona"];
 const a=[];teams.forEach((t,i)=>{
  a.push(P(`Portiere ${t}`,t,"P",18+i%5*4,6.04+i%4*.05,7.1,90+i%7,2,6.15,0,0,0,0,0,6));
  a.push(P(`Esterno Bonus ${t}`,t,"D",13+i%6*4,6.15+i%4*.05,7.6,86+i%9,3,6.24,2+i%3,4+i%4,2+i%3,8+i%3,0,8+i%3));
  a.push(P(`Centrale Voto ${t}`,t,"D",8+i%5*2,6.05,7.1,92,2,6.29,2,1,0,3,0,6));
  a.push(P(`Terzino Scommessa ${t}`,t,"D",6+i%4*2,5.98,7.3,74+i%14,6,6.06,1,3,1,8,1,9));
  a.push(P(`Trequartista ${t}`,t,"C",34+i%6*9,6.55+i%3*.08,8.4,89+i%7,2,6.48,7+i%4,6+i%3,5,9,0,9));
  a.push(P(`Mezzala Bonus ${t}`,t,"C",20+i%5*5,6.30,7.8,88+i%7,3,6.34,5,5,2,8,i%5===0?1:0,8));
  a.push(P(`Nuovo Talento ${t}`,t,"C",10+i%5*3,6.05,7.5,73+i%15,7,6.11,4,4,3,9,1,10));
  a.push(P(`Mediano ${t}`,t,"C",5+i%4,5.95,6.6,94,1,6.08,1,2,0,3,0,5));
  a.push(P(`Bomber ${t}`,t,"A",68+i%7*11,7.08,8.8,92+i%6,2,6.80,14+i%5,5,6,10,0,9));
  a.push(P(`Punta Scommessa ${t}`,t,"A",17+i%5*5,6.24,7.6,72+i%16,7,6.18,8,3,2,9,1,10));
 });return a;
}
function norm(p){return{name:String(p.name||"").trim(),team:String(p.team||"").trim(),role:String(p.role||"").trim().toUpperCase(),price:num(p.price,1),fvm:num(p.fvm,6),form:num(p.form,6),starter:num(p.starter,70),risk:num(p.risk,3),avg:num(p.avg,p.fvm||6),goals:num(p.goals),assists:num(p.assists),setpieces:num(p.setpieces),attacking:num(p.attacking,5),newarrival:num(p.newarrival)>0?1:0,upside:num(p.upside,5),apiId:p.apiId??null,apiPosition:p.apiPosition||"",photo:p.photo||null,teamLogo:p.teamLogo||null,availability:p.availability||p.injury||null,injury:p.availability||p.injury||null,needsFantasyData:!!p.needsFantasyData,liveSynced:!!p.liveSynced}}
function pid(p){return`${p.role}|${p.team}|${p.name}`} function byId(x){return players.find(p=>pid(p)===x)}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}

let players=(JSON.parse(localStorage.getItem("fc4_players")||"null")||demo()).map(norm);
let budget=num(localStorage.getItem("fc4_budget"),1000);
let strategy=localStorage.getItem("fc4_strategy")||"mid_def_risk";
let plan=JSON.parse(localStorage.getItem("fc4_plan")||"[]");
let customLists=JSON.parse(localStorage.getItem("fc4_lists")||"null")||Object.fromEntries(DEFAULT_LISTS.map(x=>[x,[]]));
let saved=JSON.parse(localStorage.getItem("fc4_saved")||"[]");
let auction=JSON.parse(localStorage.getItem("fc4_auction")||"{}"); // pid -> {owner,cost}
let league=JSON.parse(localStorage.getItem("fc4_league")||"null")||{name:"La mia lega",myTeam:"La mia squadra",opponents:["Avversario 1","Avversario 2","Avversario 3"]};
let replacements=JSON.parse(localStorage.getItem("fc4_replacements")||"[]");
let remoteUrl=localStorage.getItem("fc4_remote_url")||"";
let apiSeason=num(localStorage.getItem("fc5_api_season"),2026);
let apiInterval=num(localStorage.getItem("fc5_api_interval"),21600000);
let apiLastSync=localStorage.getItem("fc5_api_last_sync")||"";
let apiLeagueInfo=JSON.parse(localStorage.getItem("fc5_api_league")||"null");
let backendUrl=localStorage.getItem("fc7_backend_url")||"";
let matchdayData=JSON.parse(localStorage.getItem("fc6_matchday")||"null");
let selectedRound=localStorage.getItem("fc6_round")||"";
let lineup=JSON.parse(localStorage.getItem("fc6_lineup")||"[]");
let formationPref=localStorage.getItem("fc6_formation")||"auto";
let availabilityFilter="available";

function saveState(){
 localStorage.setItem("fc4_players",JSON.stringify(players));localStorage.setItem("fc4_budget",String(budget));localStorage.setItem("fc4_strategy",strategy);
 localStorage.setItem("fc4_plan",JSON.stringify(plan));localStorage.setItem("fc4_lists",JSON.stringify(customLists));localStorage.setItem("fc4_saved",JSON.stringify(saved));
 localStorage.setItem("fc4_auction",JSON.stringify(auction));localStorage.setItem("fc4_league",JSON.stringify(league));localStorage.setItem("fc4_replacements",JSON.stringify(replacements));
 localStorage.setItem("fc4_remote_url",remoteUrl);
 localStorage.setItem("fc5_api_season",String(apiSeason));
 localStorage.setItem("fc5_api_interval",String(apiInterval));
 localStorage.setItem("fc5_api_last_sync",apiLastSync);
 localStorage.setItem("fc5_api_league",JSON.stringify(apiLeagueInfo));
 localStorage.setItem("fc7_backend_url",backendUrl);
 localStorage.setItem("fc6_matchday",JSON.stringify(matchdayData));
 localStorage.setItem("fc6_round",selectedRound);
 localStorage.setItem("fc6_lineup",JSON.stringify(lineup));
 localStorage.setItem("fc6_formation",formationPref);
}
function status(x){return auction[x]||null}
function isAvailable(x){return !auction[x]}
function ownedIds(owner){return Object.entries(auction).filter(([_,v])=>v.owner===owner).map(([k])=>k)}
function ownerSpend(owner){return Object.values(auction).filter(v=>v.owner===owner).reduce((s,v)=>s+num(v.cost),0)}
function mySpend(){return ownerSpend(league.myTeam)}
function myRemaining(){return Math.max(0,budget-mySpend())}
function roleCount(ids,r){return ids.filter(x=>x.startsWith(r+"|")).length}

function dScore(p){return p.role==="D"?+(p.avg*14+p.starter*.22+p.form*1.5+p.goals*3.8+p.assists*2.4+p.setpieces*1.5+p.attacking*2.1-p.risk*.7).toFixed(1):0}
function cScore(p){return p.role==="C"?+(p.fvm*10+p.avg*10+p.form*2.2+p.starter*.16+p.goals*4.2+p.assists*3.2+p.setpieces*2+p.attacking*1.8+p.upside*1.2-p.risk*.6).toFixed(1):0}
function betScore(p){const gate=Math.max(0,Math.min(1,(p.starter-55)/35));return +(((p.newarrival?20:4)+p.upside*6+p.risk*2.4+p.form*2+(p.fvm/Math.max(1,p.price))*18+p.attacking*1.5)*gate).toFixed(1)}
function score(p){
 const value=p.fvm/Math.max(1,p.price)*10;let s=p.fvm*9+p.form*2+p.starter*.12+value*2.5-p.risk;
 if(strategy==="mid_def_risk"){if(p.role==="C")s+=cScore(p)*.28;if(p.role==="D")s+=dScore(p)*.18;if(p.starter>=72&&(p.newarrival||p.upside>=8))s+=betScore(p)*.07}
 else if(strategy==="midfield"&&p.role==="C")s+=cScore(p)*.32;else if(strategy==="defense_risk"&&p.role==="D")s+=dScore(p)*.25;
 else if(strategy==="attack"&&p.role==="A")s+=13;else if(strategy==="value")s+=value*5;
 return +s.toFixed(1);
}
function roleRank(p){if(p.role==="C")return cScore(p)+(p.starter>=80?12:0);if(p.role==="D")return dScore(p);return score(p)}

function similarity(a,b){
 if(a.role!==b.role)return -1e9;
 let dist=0;
 dist+=Math.abs(a.fvm-b.fvm)*8;dist+=Math.abs(a.avg-b.avg)*9;dist+=Math.abs(a.starter-b.starter)*.10;
 dist+=Math.abs(a.risk-b.risk)*1.4;dist+=Math.abs(a.attacking-b.attacking)*1.5;dist+=Math.abs(a.upside-b.upside)*1.4;
 dist+=Math.abs(a.setpieces-b.setpieces)*1.1;dist+=Math.abs(a.goals-b.goals)*1.2;dist+=Math.abs(a.assists-b.assists)*1.1;
 dist+=Math.abs(a.price-b.price)*.08;
 return 120-dist+score(b)*.08;
}
function findReplacement(old,exclude=[]){
 const ex=new Set(exclude);
 const pool=players.filter(p=>p.role===old.role&&isAvailable(pid(p))&&pid(p)!==pid(old)&&!ex.has(pid(p)));
 return pool.sort((a,b)=>similarity(old,b)-similarity(old,a))[0]||null;
}
function replaceEverywhere(oldId){
 const old=byId(oldId);if(!old)return;
 Object.keys(customLists).forEach(name=>{
   const idx=customLists[name].indexOf(oldId);
   if(idx>=0){
     customLists[name].splice(idx,1);
     const rep=findReplacement(old,customLists[name]);
     if(rep){customLists[name].push(pid(rep));replacements.unshift({when:Date.now(),where:`Lista ${name}`,old:old.name,new:rep.name})}
     else replacements.unshift({when:Date.now(),where:`Lista ${name}`,old:old.name,new:"Nessun sostituto disponibile"});
   }
 });
 const idx=plan.indexOf(oldId);
 if(idx>=0){
   plan.splice(idx,1);
   const sameRoleInPlan=plan.filter(x=>x.startsWith(old.role+"|"));
   if(sameRoleInPlan.length<LIMITS[old.role]){
     const rep=findReplacement(old,plan);
     if(rep){plan.push(pid(rep));replacements.unshift({when:Date.now(),where:"Rosa ideale",old:old.name,new:rep.name})}
   }
 }
 replacements=replacements.slice(0,20);
}

function buyMine(p){
 const current=ownedIds(league.myTeam), rcount=roleCount(current,p.role);
 if(rcount>=LIMITS[p.role])return alert(`Hai già completato il reparto ${RN[p.role]}.`);
 const max=Math.max(1,myRemaining()-(25-current.length-1));
 const v=prompt(`Costo di acquisto per ${p.name}\nCrediti rimasti: ${myRemaining()}\nMassimo teorico lasciando 1 credito per ogni slot: ${max}`,String(Math.min(p.price,max)));
 if(v===null)return;const cost=num(v,-1);if(cost<1)return alert("Costo non valido.");if(cost>myRemaining())return alert("Crediti insufficienti.");
 auction[pid(p)]={owner:league.myTeam,cost};if(!plan.includes(pid(p)))plan.push(pid(p));saveState();renderAll();
}
function sellOpponent(p){
 if(!league.opponents.length)return alert("Aggiungi prima almeno una squadra avversaria nella sezione La Lega.");
 const names=league.opponents.map((x,i)=>`${i+1}. ${x}`).join("\n");
 const sel=prompt(`Chi ha acquistato ${p.name}?\n${names}`,"1");if(sel===null)return;
 const ix=parseInt(sel,10)-1;if(ix<0||ix>=league.opponents.length)return alert("Scelta non valida.");
 const owner=league.opponents[ix];
 const costRaw=prompt(`Costo pagato da ${owner} per ${p.name}:`,String(p.price));if(costRaw===null)return;
 const cost=Math.max(1,num(costRaw,p.price));
 auction[pid(p)]={owner,cost};replaceEverywhere(pid(p));saveState();renderAll();
}
function undoSale(p){delete auction[pid(p)];saveState();renderAll()}


function apiEndpoint(path){
 const base=String(backendUrl||"").trim().replace(/\/+$/,"");
 if(base)return `${base}${path}`;
 // Sul web può usare lo stesso dominio; nell'app Android serve configurare il backend.
 if(location.protocol==="http:"||location.protocol==="https:")return path;
 throw new Error("Backend API non configurato. Apri Guida API e inserisci l'URL Vercel.");
}
function keyName(s){
 return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
   .replace(/[^a-z0-9]+/g," ").trim();
}
function mergeLiveRoster(payload){
 const oldPlayers=[...players];
 const byApi=new Map(oldPlayers.filter(p=>p.apiId).map(p=>[String(p.apiId),p]));
 const byName=new Map(oldPlayers.map(p=>[keyName(p.name),p]));
 const liveIds=new Set();
 const merged=[];

 for(const lp of payload.players||[]){
   let old=byApi.get(String(lp.apiId))||byName.get(keyName(lp.name));
   if(old){
     const next=norm({...old,...lp,team:lp.team,apiId:lp.apiId,apiPosition:lp.apiPosition,photo:lp.photo,teamLogo:lp.teamLogo,availability:lp.availability||lp.injury||null,injury:lp.availability||lp.injury||null,liveSynced:true});
     merged.push(next);liveIds.add(pid(next));
   }else{
     // Nuovo arrivo: dati calcistici reali, valori fantasy provvisori finché non entra nel listone fantasy.
     const fresh=norm({
       name:lp.name,team:lp.team,role:lp.role,price:1,fvm:6,form:6.5,starter:65,risk:6,avg:6,
       goals:0,assists:0,setpieces:0,attacking:lp.role==="A"?9:lp.role==="C"?7:lp.role==="D"?5:0,
       newarrival:1,upside:8,apiId:lp.apiId,apiPosition:lp.apiPosition,photo:lp.photo,teamLogo:lp.teamLogo,
       availability:lp.availability||lp.injury||null,injury:lp.availability||lp.injury||null,needsFantasyData:true,liveSynced:true
     });
     merged.push(fresh);liveIds.add(pid(fresh));
   }
 }

 // Mantieni soltanto eventuali record fantasy non ancora riconciliati se sono coinvolti nell'asta/piano/liste.
 const referenced=new Set([...plan,...Object.keys(auction),...Object.values(customLists).flat()]);
 for(const p of oldPlayers){
   if(referenced.has(pid(p))&&!merged.some(x=>x.apiId&&p.apiId&&x.apiId===p.apiId)&&!merged.some(x=>keyName(x.name)===keyName(p.name))){
     merged.push(p);
   }
 }

 players=merged;

 // Ricostruisci i riferimenti name-based dopo eventuali cambi squadra.
 const apiMap=new Map(players.filter(p=>p.apiId).map(p=>[String(p.apiId),pid(p)]));
 function reconcileIds(arr){
   return arr.filter(x=>byId(x)||true).map(oldId=>{
     if(byId(oldId))return oldId;
     const parts=oldId.split("|"), oldName=parts.slice(2).join("|");
     const candidate=players.find(p=>keyName(p.name)===keyName(oldName));
     return candidate?pid(candidate):oldId;
   }).filter((x,i,a)=>a.indexOf(x)===i && !!byId(x));
 }
 plan=reconcileIds(plan);
 Object.keys(customLists).forEach(k=>customLists[k]=reconcileIds(customLists[k]));

 // Per l'asta, migra record se il giocatore ha cambiato squadra ma il nome combacia.
 const newAuction={};
 for(const [oldId,data] of Object.entries(auction)){
   if(byId(oldId)){newAuction[oldId]=data;continue}
   const oldName=oldId.split("|").slice(2).join("|");
   const candidate=players.find(p=>keyName(p.name)===keyName(oldName));
   if(candidate)newAuction[pid(candidate)]=data;
 }
 auction=newAuction;
}
function renderApiStatus(){
 if(!$("apiStatus"))return;
 $("apiSeason").value=apiSeason;$("apiInterval").value=String(apiInterval);
 if(!apiLastSync){
   $("apiStatus").className="sync-status warn";
   $("apiStatus").textContent="API non ancora sincronizzata. Configura API_FOOTBALL_KEY sul server e premi Sincronizza Serie A.";
   return;
 }
 const d=new Date(apiLastSync);
 const needs=players.filter(p=>p.needsFantasyData).length;
 $("apiStatus").className="sync-status ok";
 $("apiStatus").textContent=`Ultimo sync: ${d.toLocaleString("it-IT")} · ${apiLeagueInfo?.name||"Serie A"} ${apiLeagueInfo?apiSeason:""} · ${players.length} giocatori · ${needs} nuovi arrivi da completare con dati fantasy.`;
}
async function syncApi(manual=true,testOnly=false,medical=false){
 const msg=$("apiMessage");
 if(manual){msg.className="message";msg.textContent=testOnly?"Test collegamento...":"Sincronizzazione Serie A in corso...";}
 try{
   const res=await fetch(apiEndpoint(`/api/sync?season=${encodeURIComponent(apiSeason)}&country=Italy&leagueName=${encodeURIComponent("Serie A")}${medical?"&medical=1":""}`),{cache:"no-store"});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||`HTTP ${res.status}`);
   apiLeagueInfo=data.league||null;
   apiLastSync=data.syncedAt||new Date().toISOString();
   if(!testOnly)mergeLiveRoster(data);
   saveState();renderAll();renderApiStatus();
   if(manual){
     msg.className="message ok";
     msg.textContent=testOnly
       ? `Collegamento OK: ${data.league?.name||"Serie A"}, ${data.teams?.length||0} squadre, ${data.players?.length||0} giocatori.`
       : `Sync completato: ${data.teams?.length||0} squadre e ${data.players?.length||0} giocatori aggiornati${medical?` · controllo medico profondo su ${data.meta?.sidelinedCalls||0} indisponibili`:""}.`;
   }
   return true;
 }catch(e){
   if(manual){msg.className="message error";msg.textContent=`Sync API non riuscito: ${e.message}`}
   renderApiStatus();return false;
 }
}

function updateStats(){
 $("budgetInitial").textContent=budget;$("budgetLeft").textContent=myRemaining();$("myBought").textContent=ownedIds(league.myTeam).length;$("soldCount").textContent=Object.keys(auction).length;renderApiStatus();
 $("budgetInput").value=budget;$("strategy").value=strategy;$("leagueName").value=league.name;$("myTeamName").value=league.myTeam;$("remoteUrl").value=remoteUrl;if($("backendUrl"))$("backendUrl").value=backendUrl;
}
function getFilteredPlayers(){
 const q=$("globalSearch").value.trim().toLowerCase(),r=$("globalRole").value;
 return players.filter(p=>{
  const s=status(pid(p));let ok=true;
  if(availabilityFilter==="available")ok=!s;if(availabilityFilter==="mine")ok=s&&s.owner===league.myTeam;if(availabilityFilter==="sold")ok=s&&s.owner!==league.myTeam;
  return ok&&(!r||p.role===r)&&(!q||p.name.toLowerCase().includes(q)||p.team.toLowerCase().includes(q));
 }).sort((a,b)=>roleRank(b)-roleRank(a));
}

function availabilityStatus(p){
 const a=p.availability||p.injury||null;if(!a)return null;
 const blob=`${a.status||""} ${a.type||""} ${a.reason||""}`.toLowerCase();
 if(a.status==="suspended"||/suspend|card|ban/.test(blob))return "suspended";
 if(a.status==="questionable"||/question/.test(blob))return "questionable";
 return "injured";
}

function currentRoundNumber(){
 const r=selectedRound||matchdayData?.selectedRound||matchdayData?.currentRound||"";
 const m=String(r).match(/(\d+)\s*$/);return m?Number(m[1]):null;
}
function totalLeagueRounds(){
 const nums=(matchdayData?.rounds||[]).map(r=>{const m=String(r).match(/(\d+)\s*$/);return m?Number(m[1]):null}).filter(Number.isFinite);
 return nums.length?Math.max(...nums):38;
}
function replacementRuleState(p){
 const a=p.availability||p.injury||null;
 const st=availabilityStatus(p);
 const days=Number.isFinite(Number(a?.outDays))?Number(a.outDays):null;
 const medicalEligible=st==="injured"&&(a?.replacementEligible||days>=90);
 const rn=currentRoundNumber(),total=totalLeagueRounds();
 const finalEight=rn!==null && rn>total-8;
 return {medicalEligible,finalEight,allowed:medicalEligible&&!finalEight,round:rn,total};
}

function availabilityHtml(p){
 const a=p.availability||p.injury||null;if(!a)return "";
 const st=availabilityStatus(p);
 const label=st==="suspended"?"🟥 SQUALIFICATO":st==="questionable"?"⚠️ IN DUBBIO":"🩺 INFORTUNATO";
 const start=a.startDate?new Date(a.startDate+"T00:00:00").toLocaleDateString("it-IT"):null;
 const end=a.expectedReturn?new Date(a.expectedReturn+"T00:00:00").toLocaleDateString("it-IT"):null;
 const days=Number.isFinite(Number(a.outDays))?Number(a.outDays):null;
 const rule=replacementRuleState(p), eligible=rule.allowed;
 const ruleLabel=rule.medicalEligible?(rule.finalEight?"⛔ ≥3 MESI · NON SOSTITUIBILE NELLE ULTIME 8":"🔁 SOSTITUIBILE ≥3 MESI"):label;
 return `<div class="availability-box ${rule.medicalEligible?"eligible":st}">
   <strong>${ruleLabel}</strong>${a.reason?` · ${esc(a.reason)}`:""}
   <div class="medical-meta">
     ${start?`<span>Dal ${start}</span>`:""}${end?`<span>Rientro ${end}</span>`:""}${days!==null?`<span>${days} giorni</span>`:""}
     ${!end&&st==="injured"?`<span>Rientro non definito</span>`:""}
   </div>
 </div>`;
}
function playerFixture(p){
 if(!matchdayData?.fixtures)return null;
 return matchdayData.fixtures.find(f=>f.home.name===p.team||f.away.name===p.team)||null;
}
function opponentFactor(p){
 const f=playerFixture(p);if(!f)return 0;
 const isHome=f.home.name===p.team,opp=isHome?f.away:f.home;
 const total=matchdayData.totalTeams||20;
 const rank=opp.rank||Math.ceil(total/2);
 // avversario più debole (rank alto) = bonus; casa = piccolo bonus.
 return ((rank-(total+1)/2)/total)*8+(isHome?1.5:-.3);
}
function availabilityPenalty(p){
 const st=availabilityStatus(p);
 if(st==="suspended"||st==="injured")return -1000;
 if(st==="questionable")return -14;
 return 0;
}
function lineupScore(p){
 let s=score(p)+opponentFactor(p)+availabilityPenalty(p);
 if(p.role==="C")s+=cScore(p)*.10;
 if(p.role==="D")s+=dScore(p)*.07;
 if(p.starter>=90)s+=3; else if(p.starter<70)s-=5;
 return +s.toFixed(1);
}
function validFormation(code){
 const map={343:{P:1,D:3,C:4,A:3},352:{P:1,D:3,C:5,A:2},433:{P:1,D:4,C:3,A:3},442:{P:1,D:4,C:4,A:2},451:{P:1,D:4,C:5,A:1},532:{P:1,D:5,C:3,A:2},541:{P:1,D:5,C:4,A:1}};
 return map[code]||null;
}
function formationCodes(){return["343","352","433","442","451","532","541"]}
function chooseFormation(){
 if(formationPref!=="auto")return formationPref;
 const owned=ownedIds(league.myTeam).map(byId).filter(Boolean);
 let best={code:"433",total:-1e9};
 for(const code of formationCodes()){
   const need=validFormation(code);let total=0,ok=true;
   for(const r of ["P","D","C","A"]){
     const arr=owned.filter(p=>p.role===r).sort((a,b)=>lineupScore(b)-lineupScore(a));
     if(arr.length<need[r]){ok=false;break}
     total+=arr.slice(0,need[r]).reduce((s,p)=>s+lineupScore(p),0);
   }
   // bonus difesa: piccolo premio strutturale a 4/5 difensori se i migliori D sono affidabili.
   if(ok&&need.D>=4){
     const ds=owned.filter(p=>p.role==="D").sort((a,b)=>dScore(b)-dScore(a)).slice(0,need.D);
     const avg=ds.length?ds.reduce((s,p)=>s+p.avg,0)/ds.length:0;
     if(avg>=6.15)total+=need.D===4?5:3;
   }
   if(ok&&total>best.total)best={code,total};
 }
 return best.code;
}
function suggestLineup(){
 const owned=ownedIds(league.myTeam).map(byId).filter(Boolean);
 if(owned.length<11)return alert("Servono almeno 11 giocatori acquistati per proporre una formazione.");
 const code=chooseFormation(),need=validFormation(code),chosen=[];
 for(const r of ["P","D","C","A"]){
   const arr=owned.filter(p=>p.role===r).sort((a,b)=>lineupScore(b)-lineupScore(a));
   chosen.push(...arr.slice(0,need[r]).map(pid));
 }
 lineup=chosen;saveState();renderLineup();
}
function renderRoundSelect(){
 if(!$("roundSelect"))return;
 const sel=$("roundSelect"),rounds=matchdayData?.rounds||[];
 const cur=selectedRound||matchdayData?.selectedRound||matchdayData?.currentRound||"";
 sel.innerHTML=rounds.length?rounds.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join(""):'<option value="">Calendario non disponibile</option>';
 if(rounds.includes(cur))sel.value=cur; selectedRound=sel.value||cur;
}
async function syncMatchday(manual=true){
 const m=$("matchdayStatus");if(manual){m.className="sync-status warn";m.textContent="Aggiornamento calendario e avversari...";}
 try{
   const q=selectedRound?`&round=${encodeURIComponent(selectedRound)}`:"";
   const res=await fetch(apiEndpoint(`/api/matchday?season=${encodeURIComponent(apiSeason)}${q}`),{cache:"no-store"});
   const d=await res.json();if(!res.ok)throw new Error(d.error||`HTTP ${res.status}`);
   matchdayData=d;selectedRound=d.selectedRound||d.currentRound||selectedRound;saveState();renderLineup();
   return true;
 }catch(e){if(manual){m.className="sync-status warn";m.textContent=`Calendario non disponibile: ${e.message}`};return false}
}
function manualToggleLineup(x){
 const p=byId(x);if(!p)return;
 if(lineup.includes(x)){lineup=lineup.filter(y=>y!==x);saveState();renderLineup();return}
 if(lineup.length>=11)return alert("Hai già 11 titolari. Togli prima un giocatore.");
 const current=lineup.map(byId).filter(Boolean),counts={P:0,D:0,C:0,A:0};current.forEach(q=>counts[q.role]++);
 if(p.role==="P"&&counts.P>=1)return alert("Puoi schierare un solo portiere.");
 if(p.role==="D"&&counts.D>=5)return alert("Massimo 5 difensori.");
 if(p.role==="C"&&counts.C>=5)return alert("Massimo 5 centrocampisti.");
 if(p.role==="A"&&counts.A>=3)return alert("Massimo 3 attaccanti.");
 lineup.push(x);saveState();renderLineup();
}
function renderLineup(){
 if(!$("startingXI"))return;
 renderRoundSelect();$("formationPref").value=formationPref;
 const owned=ownedIds(league.myTeam).map(byId).filter(Boolean);
 lineup=lineup.filter(x=>owned.some(p=>pid(p)===x));
 const fixtureLabel=matchdayData?.selectedRound||matchdayData?.currentRound||"giornata non sincronizzata";
 $("matchdayStatus").className=matchdayData?"sync-status ok":"sync-status warn";
 $("matchdayStatus").textContent=matchdayData?`${fixtureLabel} · ${matchdayData.fixtures?.length||0} partite · aggiornato ${new Date(matchdayData.syncedAt).toLocaleString("it-IT")}`:"Calendario non ancora sincronizzato.";
 $("lineupCount").textContent=`${lineup.length}/11`;
 const cardL=p=>{
   const x=pid(p),isStart=lineup.includes(x),st=availabilityStatus(p),f=playerFixture(p);
   const opp=f?(f.home.name===p.team?f.away.name:f.home.name):"avversario n/d";
   return `<div class="lineup-player ${isStart?"start":""} ${st==="injured"||st==="suspended"?"unavailable":""}">
     <span class="badge ${p.role}">${p.role}</span>
     <div class="lp-main"><strong>${esc(p.name)}</strong><small>${esc(p.team)} · vs ${esc(opp)} · tit. ${p.starter}%</small>${st?`<span class="match-chip">${st==="suspended"?"SQUALIFICATO":st==="injured"?"INFORTUNATO":"IN DUBBIO"}</span>`:""}</div>
     <div class="lineup-score">${lineupScore(p)}</div>
     <button class="btn ${isStart?"danger":"primary"} tiny lineup-toggle" data-lineup="${encodeURIComponent(x)}">${isStart?"Panchina":"Titolare"}</button>
   </div>`;
 };
 const start=owned.filter(p=>lineup.includes(pid(p))).sort((a,b)=>"PDCA".indexOf(a.role)-"PDCA".indexOf(b.role));
 const bench=owned.filter(p=>!lineup.includes(pid(p))).sort((a,b)=>lineupScore(b)-lineupScore(a));
 $("startingXI").innerHTML=start.map(cardL).join("")||"<p>Nessun titolare selezionato.</p>";
 $("benchList").innerHTML=bench.map(cardL).join("")||"<p>Panchina vuota.</p>";
 document.querySelectorAll("[data-lineup]").forEach(b=>b.onclick=()=>manualToggleLineup(decodeURIComponent(b.dataset.lineup)));
 const unavailableStart=start.filter(p=>["injured","suspended"].includes(availabilityStatus(p)));
 const questionable=start.filter(p=>availabilityStatus(p)==="questionable");
 let warn="";
 if(unavailableStart.length)warn+=`<div class="warning-card">⚠️ ${unavailableStart.map(p=>esc(p.name)).join(", ")} ${unavailableStart.length===1?"è":"sono"} indisponibile/i ma presente/i nell'XI. L'IA li esclude automaticamente; questa selezione è manuale.</div>`;
 if(questionable.length)warn+=`<div class="warning-card">⚠️ In dubbio: ${questionable.map(p=>esc(p.name)).join(", ")}. Controlla prima della consegna formazione.</div>`;
 if(lineup.length===11&&!unavailableStart.length)warn+=`<div class="success-card">✓ Formazione completa. Modulo attuale: 1-${start.filter(p=>p.role==="D").length}-${start.filter(p=>p.role==="C").length}-${start.filter(p=>p.role==="A").length}.</div>`;
 $("lineupWarnings").innerHTML=warn;
}

function card(p,context="auction"){
 const x=pid(p),s=status(x),planned=plan.includes(x);
 const listOpts=Object.keys(customLists).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");
 let buttons="";
 if(context==="auction"){
  if(!s)buttons=`<button class="btn primary tiny" data-buy="${encodeURIComponent(x)}">Compra io</button><button class="btn secondary tiny" data-sell="${encodeURIComponent(x)}">Preso da altri</button>`;
  else buttons=`<button class="btn secondary tiny" data-undo="${encodeURIComponent(x)}">Annulla assegnazione</button>`;
 }else{
  if(!s||s.owner===league.myTeam)buttons=`<button class="btn ${planned?"danger":"primary"} tiny" data-plan="${encodeURIComponent(x)}">${planned?"Togli piano":"Nel piano"}</button>`;
  else buttons=`<button class="btn secondary tiny" disabled>Non disponibile</button>`;
  buttons+=`<select class="mini-select" data-list="${encodeURIComponent(x)}"><option value="">+ Lista...</option>${listOpts}</select>`;
 }
 const avst=availabilityStatus(p), cls=(s?(s.owner===league.myTeam?"mine":"sold"):"")+(avst==="suspended"?" suspended":(replacementRuleState(p).medicalEligible?" long-injury":""));
 const stat=s?`<div class="statusline">${s.owner===league.myTeam?"✅ Tuo acquisto":"❌ Acquistato da "+esc(s.owner)} · <strong>${s.cost} cr</strong></div>`:(planned?`<div class="statusline">🎯 Presente nella tua rosa ideale</div>`:"");
 return `<article class="player-card ${cls} ${planned?"planned":""} ${p.needsFantasyData?"needs-data":""}">
 <div class="player-top"><div><div class="player-name">${esc(p.name)}</div><div class="team">${esc(p.team)}</div></div><div class="badges"><span class="badge ${p.role}">${p.role}</span>${p.newarrival?'<span class="badge new">NUOVO</span>':""}${p.liveSynced?'<span class="badge api">LIVE</span>':""}${p.needsFantasyData?'<span class="badge warn">DATI FANTASY</span>':""}${s&&s.owner===league.myTeam?'<span class="badge mine">MIO</span>':s?'<span class="badge sold">VENDUTO</span>':""}</div></div>
 <div class="metrics"><div class="metric"><span>Stima</span><strong>${p.price}</strong></div><div class="metric"><span>${p.role==="C"?"Centro":p.role==="D"?"Difesa":"Score"}</span><strong class="score">${p.role==="C"?cScore(p):p.role==="D"?dScore(p):score(p)}</strong></div><div class="metric"><span>Titolarità</span><strong>${p.starter}%</strong></div></div>
 ${availabilityHtml(p)}${stat}<div class="player-actions">${buttons}</div></article>`;
}
function bindCards(){
 document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>{const p=byId(decodeURIComponent(b.dataset.buy));if(p)buyMine(p)});
 document.querySelectorAll("[data-sell]").forEach(b=>b.onclick=()=>{const p=byId(decodeURIComponent(b.dataset.sell));if(p)sellOpponent(p)});
 document.querySelectorAll("[data-undo]").forEach(b=>b.onclick=()=>{const p=byId(decodeURIComponent(b.dataset.undo));if(p)undoSale(p)});
 document.querySelectorAll("[data-plan]").forEach(b=>b.onclick=()=>{const x=decodeURIComponent(b.dataset.plan);if(plan.includes(x))plan=plan.filter(y=>y!==x);else{const p=byId(x);if(roleCount(plan,p.role)>=LIMITS[p.role])return alert("Reparto già completo nel piano.");plan.push(x)}saveState();renderAll()});
 document.querySelectorAll("[data-list]").forEach(s=>s.onchange=()=>{if(!s.value)return;const x=decodeURIComponent(s.dataset.list);if(!customLists[s.value].includes(x))customLists[s.value].push(x);saveState();renderLists()});
}
function renderAuction(){
 $("auctionGrid").innerHTML=getFilteredPlayers().map(p=>card(p,"auction")).join("")||"<p>Nessun giocatore.</p>";bindCards();
 const last=replacements[0];
 $("auctionAlerts").innerHTML=last?`<div class="coach-box">Ultima sostituzione: <strong>${esc(last.old)}</strong> <span class="arrow">→</span> <strong>${esc(last.new)}</strong> (${esc(last.where)})</div>`:"";
}
function renderReplacementLog(){
 $("replacementLog").innerHTML=replacements.length?`<div class="replace-box"><strong>Sostituzioni automatiche recenti</strong>${replacements.slice(0,8).map(r=>`<div class="replace-row">${esc(r.where)}: ${esc(r.old)} <span class="arrow">→</span> ${esc(r.new)}</div>`).join("")}</div>`:"";
}

function planCost(){
 const mine=new Set(ownedIds(league.myTeam));
 return plan.reduce((s,x)=>s+(mine.has(x)?num(auction[x].cost):num(byId(x)?.price)),0);
}
function renderPlan(){
 const mine=ownedIds(league.myTeam);mine.forEach(x=>{if(!plan.includes(x))plan.push(x)});
 $("planByRole").innerHTML=Object.keys(LIMITS).map(r=>{
  const arr=plan.map(byId).filter(Boolean).filter(p=>p.role===r);
  return `<div class="role-block"><div class="role-title"><h3>${RN[r]}</h3><strong>${arr.length}/${LIMITS[r]}</strong></div><div class="squad-list">${arr.map(p=>{const s=status(pid(p)),c=s&&s.owner===league.myTeam?s.cost:p.price;return`<div class="squad-row"><div><strong>${esc(p.name)}</strong>${s&&s.owner===league.myTeam?" ✅":""}<br><small>${esc(p.team)} · ${c} cr${s&&s.owner===league.myTeam?" reali":" stimati"}</small></div>${s&&s.owner===league.myTeam?"":`<button class="btn danger tiny" data-planremove="${encodeURIComponent(pid(p))}">×</button>`}</div>`}).join("")||"<p>Nessun giocatore.</p>"}</div></div>`;
 }).join("");
 document.querySelectorAll("[data-planremove]").forEach(b=>b.onclick=()=>{plan=plan.filter(x=>x!==decodeURIComponent(b.dataset.planremove));saveState();renderAll()});
 const mids=plan.map(byId).filter(Boolean).filter(p=>p.role==="C"), bonus=mids.filter(p=>p.goals+p.assists>=8||p.attacking>=8).length;
 $("planSummary").innerHTML=`<strong>Rosa pianificata:</strong> ${plan.length}/25 · costo previsto ${planCost()}/${budget} cr · ${mids.length}/8 centrocampisti · ${bonus} centrocampisti da bonus · acquisti reali già bloccati: ${mine.length}.`;
}
function weights(){return{mid_def_risk:{P:.06,D:.20,C:.36,A:.38},midfield:{P:.06,D:.16,C:.40,A:.38},defense_risk:{P:.07,D:.24,C:.31,A:.38},balanced:{P:.07,D:.18,C:.33,A:.42},attack:{P:.05,D:.14,C:.29,A:.52},value:{P:.06,D:.18,C:.34,A:.42}}[strategy]}
function autoBuild(keep){
 const mine=ownedIds(league.myTeam);
 if(!keep)plan=[...mine];else{plan=plan.filter(x=>isAvailable(x)||(auction[x]&&auction[x].owner===league.myTeam));mine.forEach(x=>{if(!plan.includes(x))plan.push(x)})}
 const w=weights();
 for(const r of ["P","D","C","A"]){
  while(roleCount(plan,r)<LIMITS[r]){
   const totalMissing=25-plan.length,reserve=Math.max(0,totalMissing-1),available=budget-planCost()-reserve;if(available<1)break;
   const target=budget*w[r],desired=Math.max(1,target-plan.filter(x=>x.startsWith(r+"|")).reduce((s,x)=>s+(auction[x]?.owner===league.myTeam?auction[x].cost:byId(x)?.price||0),0));
   let cap=Math.min(available,desired);if((r==="C"||r==="A")&&roleCount(plan,r)<2)cap=Math.min(available,cap*1.35);
   let pool=players.filter(p=>p.role===r&&isAvailable(pid(p))&&!plan.includes(pid(p))&&p.price<=cap).sort((a,b)=>roleRank(b)-roleRank(a));
   if(!pool.length)pool=players.filter(p=>p.role===r&&isAvailable(pid(p))&&!plan.includes(pid(p))&&p.price<=available).sort((a,b)=>a.price-b.price);
   if(!pool.length)break;let pick;
   if(r==="C"){const current=plan.map(byId).filter(Boolean).filter(p=>p.role==="C"),bc=current.filter(p=>p.goals+p.assists>=8||p.attacking>=8).length;pick=bc<5?pool.sort((a,b)=>cScore(b)-cScore(a))[0]:pool.sort((a,b)=>(roleRank(b)/(b.price+10))-(roleRank(a)/(a.price+10)))[0]}
   else if(r==="D")pick=pool.sort((a,b)=>dScore(b)-dScore(a))[0];else pick=pool[0];
   if(!pick)break;plan.push(pid(pick));
  }
 }
 saveState();renderAll();switchTab("builder");
}

function createList(name){name=name.trim();if(!name)return;if(customLists[name])return alert("Lista già esistente.");customLists[name]=[];saveState();$("newListName").value="";renderLists()}
function renderListFilters(){
 const teams=[...new Set(players.map(p=>p.team))].sort((a,b)=>a.localeCompare(b,"it")),ts=$("teamFilter"),tv=ts.value;ts.innerHTML='<option value="">Tutte</option>'+teams.map(t=>`<option>${esc(t)}</option>`).join("");if(teams.includes(tv))ts.value=tv;
 const ls=$("customListFilter"),lv=ls.value;ls.innerHTML='<option value="">Tutti</option>'+Object.keys(customLists).map(n=>`<option>${esc(n)}</option>`).join("");if(customLists[lv])ls.value=lv;
 $("listChips").innerHTML=Object.keys(customLists).map(n=>`<span class="chip">${esc(n)} (${customLists[n].length})${DEFAULT_LISTS.includes(n)?"":`<button data-dellist="${encodeURIComponent(n)}">×</button>`}</span>`).join("");
 document.querySelectorAll("[data-dellist]").forEach(b=>b.onclick=()=>{const n=decodeURIComponent(b.dataset.dellist);if(confirm(`Eliminare ${n}?`)){delete customLists[n];saveState();renderLists()}});
}
function renderLists(){
 renderListFilters();renderReplacementLog();const t=$("teamFilter").value,r=$("listRoleFilter").value,l=$("customListFilter").value;
 let arr=players.filter(p=>(!t||p.team===t)&&(!r||p.role===r));if(l){const set=new Set(customLists[l]||[]);arr=arr.filter(p=>set.has(pid(p)))}
 arr.sort((a,b)=>a.team.localeCompare(b.team,"it")||roleRank(b)-roleRank(a));$("listoneGrid").innerHTML=arr.map(p=>card(p,"list")).join("")||"<p>Nessun giocatore.</p>";bindCards();
}

function allTeams(){return[league.myTeam,...league.opponents]}
function playerPercentile(p){
 const pool=players.filter(x=>x.role===p.role).sort((a,b)=>roleRank(b)-roleRank(a)),i=pool.findIndex(x=>pid(x)===pid(p));if(i<0)return 50;return 45+55*(1-i/Math.max(1,pool.length-1));
}
function teamProjection(owner){
 const ids=ownedIds(owner),roster=ids.map(byId).filter(Boolean),spent=ownerSpend(owner),remaining=Math.max(0,budget-spent);
 let totalQ=roster.reduce((s,p)=>s+playerPercentile(p),0),missing=0;
 for(const r of Object.keys(LIMITS)){
  const have=roster.filter(p=>p.role===r).length,miss=Math.max(0,LIMITS[r]-have);missing+=miss;
  const avail=players.filter(p=>p.role===r&&isAvailable(pid(p))).sort((a,b)=>roleRank(b)-roleRank(a));
  const avgAvail=avail.length?avail.slice(0,Math.max(5,miss*3)).reduce((s,p)=>s+playerPercentile(p),0)/Math.min(avail.length,Math.max(5,miss*3)):45;
  totalQ+=avgAvail*miss;
 }
 const perSlot=missing?remaining/missing:remaining;
 const economy=Math.max(.78,Math.min(1.08,perSlot/(budget/25)));
 let power=(totalQ/25)*economy;
 const imbalance=Object.keys(LIMITS).reduce((pen,r)=>pen+Math.max(0,roster.filter(p=>p.role===r).length-LIMITS[r])*5,0);
 power-=imbalance;return Math.max(0,Math.min(100,+power.toFixed(1)));
}
function renderLeague(){
 $("teamChips").innerHTML=league.opponents.map((n,i)=>`<span class="chip">${esc(n)}<button data-delteam="${i}">×</button></span>`).join("");
 document.querySelectorAll("[data-delteam]").forEach(b=>b.onclick=()=>{const ix=Number(b.dataset.delteam),name=league.opponents[ix];if(ownedIds(name).length)return alert("Questa squadra ha già acquisti registrati. Annullali prima di eliminarla.");league.opponents.splice(ix,1);saveState();renderAll()});
 const rows=allTeams().map(name=>({name,power:teamProjection(name),spent:ownerSpend(name),remaining:Math.max(0,budget-ownerSpend(name)),count:ownedIds(name).length})).sort((a,b)=>b.power-a.power);
 $("leagueRanking").innerHTML=rows.map((x,i)=>`<div class="ranking-row"><div class="rank">#${i+1}</div><div><strong>${esc(x.name)}</strong><br><span class="small">${x.count}/25 acquistati</span></div><div class="bar"><span style="width:${x.power}%"></span></div><div class="power">${x.power}</div><div class="credits">${x.remaining} cr</div></div>`).join("");
}

function savePlan(){if(!plan.length)return alert("Rosa vuota.");const name=prompt("Nome della rosa:",`Rosa ${new Date().toLocaleDateString("it-IT")}`);if(!name)return;saved.unshift({id:Date.now(),name,budget,strategy,players:[...plan],created:new Date().toISOString()});saveState();renderSaved();switchTab("saved")}
function renderSaved(){
 $("savedSquads").innerHTML=saved.map(s=>`<article class="saved-card"><div class="saved-head"><h3>${esc(s.name)}</h3><strong>${s.players.length}/25</strong></div><div class="saved-meta"><span>Budget ${s.budget}</span><span>${new Date(s.created).toLocaleString("it-IT")}</span></div><div class="actions"><button class="btn primary tiny" data-loadsaved="${s.id}">Carica</button><button class="btn danger tiny" data-delsaved="${s.id}">Elimina</button></div></article>`).join("")||"<p>Nessuna rosa salvata.</p>";
 document.querySelectorAll("[data-loadsaved]").forEach(b=>b.onclick=()=>{const s=saved.find(x=>x.id===Number(b.dataset.loadsaved));if(s){budget=s.budget;strategy=s.strategy;plan=s.players.filter(x=>byId(x)&&(!auction[x]||auction[x].owner===league.myTeam));ownedIds(league.myTeam).forEach(x=>{if(!plan.includes(x))plan.push(x)});saveState();renderAll();switchTab("builder")}});
 document.querySelectorAll("[data-delsaved]").forEach(b=>b.onclick=()=>{saved=saved.filter(x=>x.id!==Number(b.dataset.delsaved));saveState();renderSaved()});
}

function splitLine(line,sep){const a=[];let c="",q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){c+='"';i++}else q=!q}else if(ch===sep&&!q){a.push(c.trim());c=""}else c+=ch}a.push(c.trim());return a}
function csvRows(text){const lines=text.replace(/\r/g,"").split("\n").filter(x=>x.trim());if(lines.length<2)throw Error("CSV non valido.");const sep=(lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?";":",";const h=splitLine(lines[0],sep).map(x=>x.toLowerCase().trim());return{h,rows:lines.slice(1).map(l=>splitLine(l,sep))}}
function parsePlayers(text){const {h,rows}=csvRows(text),req=["name","team","role","price","fvm","form","starter","risk"];req.forEach(x=>{if(!h.includes(x))throw Error(`Manca ${x}`)});return rows.map(v=>norm(Object.fromEntries(h.map((x,i)=>[x,v[i]??""])))).filter(p=>p.name&&p.team&&LIMITS[p.role])}
async function syncRemote(manual=true){const u=$("remoteUrl").value.trim(),m=$("syncMessage");if(!u){if(manual){m.className="message error";m.textContent="Inserisci un URL."}return}try{const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw Error(`HTTP ${r.status}`);const d=parsePlayers(await r.text());if(d.length<25)throw Error("Troppi pochi giocatori.");players=d;remoteUrl=u;const valid=new Set(players.map(pid));plan=plan.filter(x=>valid.has(x));Object.keys(customLists).forEach(k=>customLists[k]=customLists[k].filter(x=>valid.has(x)));Object.keys(auction).forEach(k=>{if(!valid.has(k))delete auction[k]});saveState();renderAll();if(manual){m.className="message ok";m.textContent=`Aggiornati ${d.length} giocatori.`}}catch(e){if(manual){m.className="message error";m.textContent=e.message}}}
function importLeague(text){
 const {h,rows}=csvRows(text);["player","owner","cost"].forEach(x=>{if(!h.includes(x))throw Error(`Manca ${x}`)});
 const nameMap=new Map(players.map(p=>[p.name.toLowerCase(),p]));let imported=0;
 rows.forEach(v=>{const o=Object.fromEntries(h.map((x,i)=>[x,v[i]??""])),p=nameMap.get(String(o.player).trim().toLowerCase());if(!p)return;const owner=String(o.owner).trim();if(!owner)return;if(owner!==league.myTeam&&!league.opponents.includes(owner))league.opponents.push(owner);auction[pid(p)]={owner,cost:Math.max(1,num(o.cost,p.price))};if(owner===league.myTeam&&!plan.includes(pid(p)))plan.push(pid(p));else if(owner!==league.myTeam)replaceEverywhere(pid(p));imported++});
 saveState();renderAll();return imported;
}
function renderAll(){updateStats();renderAuction();renderPlan();renderLists();renderLeague();renderLineup();renderSaved()}
function switchTab(t){document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===t));document.querySelectorAll(".tab-panel").forEach(x=>x.classList.toggle("active",x.id===t));if(t==="league")renderLeague();if(t==="lists")renderLists();if(t==="builder")renderPlan();if(t==="lineup")renderLineup();if(t==="saved")renderSaved()}

document.querySelectorAll(".tab").forEach(x=>x.onclick=()=>switchTab(x.dataset.tab));
document.querySelectorAll("[data-availability]").forEach(x=>x.onclick=()=>{availabilityFilter=x.dataset.availability;document.querySelectorAll("[data-availability]").forEach(y=>y.classList.toggle("active",y===x));renderAuction()});
$("globalSearch").oninput=renderAuction;$("globalRole").onchange=renderAuction;
$("budgetInput").onchange=e=>{const b=Math.max(100,num(e.target.value,1000));if(b<mySpend())return alert("Il budget non può essere inferiore ai crediti già spesi.");budget=b;saveState();renderAll()};
$("strategy").onchange=e=>{strategy=e.target.value;saveState();renderAll()};
$("proposeBtn").onclick=()=>autoBuild(false);$("completeBtn").onclick=()=>autoBuild(true);$("saveSquadBtn").onclick=savePlan;$("clearPlanBtn").onclick=()=>{plan=[...ownedIds(league.myTeam)];saveState();renderAll()};
$("teamFilter").onchange=renderLists;$("listRoleFilter").onchange=renderLists;$("customListFilter").onchange=renderLists;$("createListBtn").onclick=()=>createList($("newListName").value);$("newListName").onkeydown=e=>{if(e.key==="Enter")createList(e.target.value)};
$("leagueName").onchange=e=>{league.name=e.target.value.trim()||"La mia lega";saveState()};
$("myTeamName").onchange=e=>{const old=league.myTeam,newName=e.target.value.trim()||"La mia squadra";if(newName===old)return;Object.values(auction).forEach(v=>{if(v.owner===old)v.owner=newName});league.myTeam=newName;saveState();renderAll()};
$("addOpponentBtn").onclick=()=>{const n=$("newOpponent").value.trim();if(!n)return;if(n===league.myTeam||league.opponents.includes(n))return alert("Squadra già presente.");league.opponents.push(n);$("newOpponent").value="";saveState();renderAll()};
$("leagueCsv").onchange=async e=>{const f=e.target.files[0],m=$("leagueImportMsg");if(!f)return;try{const c=importLeague(await f.text());m.className="message ok";m.textContent=`Importati ${c} acquisti.`}catch(err){m.className="message error";m.textContent=err.message}};
$("syncRemoteBtn").onclick=()=>syncRemote(true);$("clearRemoteBtn").onclick=()=>{remoteUrl="";$("remoteUrl").value="";saveState();$("syncMessage").className="message ok";$("syncMessage").textContent="Sorgente rimossa."};
$("playersCsv").onchange=async e=>{const f=e.target.files[0],m=$("importMessage");if(!f)return;try{const d=parsePlayers(await f.text());if(d.length<25)throw Error("Servono almeno 25 giocatori.");players=d;auction={};plan=[];replacements=[];Object.keys(customLists).forEach(k=>customLists[k]=[]);saveState();renderAll();m.className="message ok";m.textContent=`Importati ${d.length} giocatori.`}catch(err){m.className="message error";m.textContent=err.message}};
$("downloadTemplateBtn").onclick=()=>{const txt="name,team,role,price,fvm,form,starter,risk,avg,goals,assists,setpieces,attacking,newarrival,upside\nMario Rossi,Club,D,20,6.30,7.8,90,3,6.35,3,5,2,9,1,9";const b=new Blob([txt],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="fantacoach_players.csv";a.click();URL.revokeObjectURL(a.href)};
$("restoreDemoBtn").onclick=()=>{players=demo().map(norm);auction={};plan=[];replacements=[];Object.keys(customLists).forEach(k=>customLists[k]=[]);saveState();renderAll();$("importMessage").className="message ok";$("importMessage").textContent="Demo ripristinata."};




$("saveBackendBtn").onclick=()=>{
 const v=$("backendUrl").value.trim().replace(/\/+$/,"");
 if(v && !/^https:\/\//i.test(v)){ $("backendMessage").className="message error";$("backendMessage").textContent="Usa un indirizzo HTTPS, ad esempio https://mio-progetto.vercel.app";return; }
 backendUrl=v;saveState();$("backendMessage").className="message ok";$("backendMessage").textContent=backendUrl?"Backend salvato. Ora puoi eseguire il test.":"Backend rimosso.";
};
$("guideTestBtn").onclick=async()=>{
 backendUrl=$("backendUrl").value.trim().replace(/\/+$/,"");saveState();
 const m=$("backendMessage");m.className="message";m.textContent="Test collegamento...";
 try{
   const res=await fetch(apiEndpoint(`/api/sync?season=${encodeURIComponent(apiSeason)}&country=Italy&leagueName=${encodeURIComponent("Serie A")}`),{cache:"no-store"});
   const d=await res.json();if(!res.ok)throw new Error(d.error||`HTTP ${res.status}`);
   m.className="message ok";m.textContent=`Collegamento OK: ${d.league?.name||"Serie A"} · ${d.teams?.length||0} squadre · ${d.players?.length||0} giocatori.`;
 }catch(e){m.className="message error";m.textContent=`Test non riuscito: ${e.message}`}
};

$("medicalSyncBtn").onclick=()=>syncApi(true,false,true);
$("matchdaySyncBtn").onclick=()=>syncMatchday(true);
$("suggestLineupBtn").onclick=async()=>{if(!matchdayData)await syncMatchday(true);suggestLineup()};
$("formationPref").onchange=e=>{formationPref=e.target.value;saveState();renderLineup()};
$("roundSelect").onchange=async e=>{selectedRound=e.target.value;saveState();await syncMatchday(true)};

$("apiSeason").onchange=e=>{apiSeason=Math.max(2020,Math.min(2035,num(e.target.value,2026)));saveState();renderApiStatus()};
$("apiInterval").onchange=e=>{apiInterval=num(e.target.value,21600000);saveState();renderApiStatus()};
$("apiSyncBtn").onclick=()=>syncApi(true,false);
$("apiTestBtn").onclick=()=>syncApi(true,true);

let dp=null;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();dp=e;$("installBtn").classList.remove("hidden")});$("installBtn").onclick=async()=>{if(!dp)return;dp.prompt();await dp.userChoice;dp=null;$("installBtn").classList.add("hidden")};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js"));
renderAll();
(async()=>{
  const last=apiLastSync?new Date(apiLastSync).getTime():0;
  if(apiLastSync && Date.now()-last>=apiInterval) await syncApi(false,false,false);
  else if(!apiLastSync && remoteUrl) await syncRemote(false);
  if(apiLastSync && !matchdayData) await syncMatchday(false);
})();
