
const API_BASE = "https://v3.football.api-sports.io";

async function apiGet(path, key) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { "x-apisports-key": key } });
  if (!res.ok) throw new Error(`API-Football HTTP ${res.status}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length) throw new Error(`API-Football: ${JSON.stringify(data.errors)}`);
  return data;
}
function mapRole(position) {
  const p = String(position || "").toLowerCase();
  if (p.includes("goal")) return "P";
  if (p.includes("def")) return "D";
  if (p.includes("mid")) return "C";
  if (p.includes("att")) return "A";
  return "C";
}
function isSuspension(rec) {
  const t = `${rec?.player?.type||""} ${rec?.player?.reason||""}`.toLowerCase();
  return /suspend|card|red|yellow|ban/.test(t);
}
function parseDate(v){
  if(!v || String(v).toLowerCase()==="unknown") return null;
  const d=new Date(v); return Number.isNaN(d.getTime())?null:d.toISOString().slice(0,10);
}
function daysBetween(a,b){
  if(!a||!b)return null;
  const x=new Date(a+"T00:00:00Z"),y=new Date(b+"T00:00:00Z");
  return Math.round((y-x)/86400000);
}
async function mapPool(items, limit, worker){
  const results=new Array(items.length); let next=0;
  async function run(){
    while(next<items.length){
      const i=next++; try{results[i]=await worker(items[i],i)}catch(e){results[i]=null}
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},run));
  return results;
}
async function resolveLeague(season,country,leagueName,key){
  const leagues=await apiGet(`/leagues?country=${encodeURIComponent(country)}&season=${season}&type=league`,key);
  const entry=(leagues.response||[]).find(x=>String(x?.league?.name||"").toLowerCase()===leagueName.toLowerCase())
    ||(leagues.response||[]).find(x=>String(x?.league?.name||"").toLowerCase().includes("serie a"));
  return entry||null;
}
export default async function handler(req,res){
  res.setHeader("Cache-Control","s-maxage=1800, stale-while-revalidate=7200");
  res.setHeader("Access-Control-Allow-Origin","*");
  if(req.method==="OPTIONS")return res.status(204).end();
  if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
  const key=process.env.API_FOOTBALL_KEY;
  if(!key)return res.status(500).json({error:"API_FOOTBALL_KEY non configurata sul server."});
  const season=Math.max(2020,Math.min(2035,Number(req.query.season||2026)));
  const country=String(req.query.country||"Italy"),leagueName=String(req.query.leagueName||"Serie A");
  const medical=String(req.query.medical||"0")==="1";
  try{
    const leagueEntry=await resolveLeague(season,country,leagueName,key);
    if(!leagueEntry)return res.status(404).json({error:`Serie A non trovata per la stagione ${season}.`});
    const leagueId=leagueEntry.league.id;
    const teamsData=await apiGet(`/teams?league=${leagueId}&season=${season}`,key);
    const teams=(teamsData.response||[]).map(x=>({id:x.team.id,name:x.team.name,logo:x.team.logo}));
    const squads=[];
    for(const team of teams){
      const sq=await apiGet(`/players/squads?team=${team.id}`,key);
      const block=(sq.response||[])[0];
      for(const p of (block?.players||[])){
        squads.push({apiId:p.id,name:p.name,team:team.name,teamId:team.id,teamLogo:team.logo,role:mapRole(p.position),apiPosition:p.position||"",number:p.number??null,photo:p.photo||null});
      }
    }

    let currentAbsences=[];
    try{
      const d=await apiGet(`/injuries?league=${leagueId}&season=${season}`,key);
      currentAbsences=d.response||[];
    }catch(_){}

    const currentMap=new Map();
    for(const x of currentAbsences){
      const aid=x.player?.id;if(!aid)continue;
      currentMap.set(aid,{
        apiId:aid,name:x.player?.name||"",teamId:x.team?.id,
        type:x.player?.type||"",reason:x.player?.reason||"",
        fixtureId:x.fixture?.id||null,fixtureDate:x.fixture?.date||null,
        status:isSuspension(x)?"suspended":(String(x.player?.type||"").toLowerCase().includes("question")?"questionable":"injured")
      });
    }

    // Deep medical check: /sidelined gives start/end dates when available.
    let sidelinedCalls=0;
    if(medical && currentMap.size){
      const active=[...currentMap.values()];
      const histories=await mapPool(active,5,async cur=>{
        sidelinedCalls++;
        const h=await apiGet(`/sidelined?player=${cur.apiId}`,key);
        return {cur,rows:h.response||[]};
      });
      const today=new Date().toISOString().slice(0,10);
      for(const item of histories.filter(Boolean)){
        const {cur,rows}=item;
        const candidates=rows.map(r=>({
          type:r.type||"",start:parseDate(r.start),end:parseDate(r.end)
        })).filter(r=>r.start).sort((a,b)=>String(b.start).localeCompare(String(a.start)));
        const best=candidates.find(r=>{
          if(!r.end)return true;
          return r.end>=today || daysBetween(r.start,r.end)>=1;
        })||candidates[0];
        if(best){
          cur.startDate=best.start;
          cur.expectedReturn=best.end;
          cur.outDays=best.start&&best.end?daysBetween(best.start,best.end):null;
          cur.replacementEligible=cur.status==="injured" && cur.outDays!==null && cur.outDays>=90;
          cur.historyType=best.type;
        }
      }
    }

    const players=squads.map(p=>({...p,availability:currentMap.get(p.apiId)||null}));
    return res.status(200).json({
      source:"API-Football / API-Sports",syncedAt:new Date().toISOString(),season,
      league:{id:leagueId,name:leagueEntry.league.name,logo:leagueEntry.league.logo,country},
      teams,players,
      meta:{callsApprox:2+teams.length+1+sidelinedCalls,medicalDeep:medical,sidelinedCalls,
        note:"Le date di rientro dipendono dalla disponibilità dell'endpoint sidelined; Unknown/null viene mostrato come rientro non definito."}
    });
  }catch(err){return res.status(500).json({error:err.message||"Errore di sincronizzazione"})}
}
