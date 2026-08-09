
const API_BASE="https://v3.football.api-sports.io";
async function apiGet(path,key){
  const res=await fetch(`${API_BASE}${path}`,{headers:{"x-apisports-key":key}});
  if(!res.ok)throw new Error(`API-Football HTTP ${res.status}`);
  const data=await res.json();
  if(data.errors&&Object.keys(data.errors).length)throw new Error(`API-Football: ${JSON.stringify(data.errors)}`);
  return data;
}
async function resolveLeague(season,key){
  const d=await apiGet(`/leagues?country=Italy&season=${season}&type=league`,key);
  return (d.response||[]).find(x=>String(x?.league?.name||"").toLowerCase()==="serie a")
    ||(d.response||[]).find(x=>String(x?.league?.name||"").toLowerCase().includes("serie a"));
}
function pct(v){const n=Number(String(v||"0").replace("%",""));return Number.isFinite(n)?n:0}
export default async function handler(req,res){
  res.setHeader("Cache-Control","s-maxage=1800, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin","*");
  if(req.method==="OPTIONS")return res.status(204).end();
  if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
  const key=process.env.API_FOOTBALL_KEY;if(!key)return res.status(500).json({error:"API_FOOTBALL_KEY non configurata."});
  const season=Math.max(2020,Math.min(2035,Number(req.query.season||2026)));
  const requestedRound=String(req.query.round||"").trim();
  try{
    const le=await resolveLeague(season,key);if(!le)return res.status(404).json({error:"Serie A non trovata."});
    const leagueId=le.league.id;
    const roundsData=await apiGet(`/fixtures/rounds?league=${leagueId}&season=${season}&current=true`,key);
    const currentRound=(roundsData.response||[])[0]||"";
    const round=requestedRound||currentRound;
    const roundsAll=await apiGet(`/fixtures/rounds?league=${leagueId}&season=${season}`,key);
    const fixturesData=await apiGet(`/fixtures?league=${leagueId}&season=${season}${round?`&round=${encodeURIComponent(round)}`:"&next=10"}&timezone=Europe/Rome`,key);
    let standings=[];
    try{
      const s=await apiGet(`/standings?league=${leagueId}&season=${season}`,key);
      standings=s.response?.[0]?.league?.standings?.[0]||[];
    }catch(_){}
    const rankMap=new Map(standings.map(x=>[x.team.id,x.rank]));
    const totalTeams=Math.max(20,standings.length||20);
    const fixtures=(fixturesData.response||[]).map(x=>({
      id:x.fixture.id,date:x.fixture.date,status:x.fixture.status?.short||"",
      home:{id:x.teams.home.id,name:x.teams.home.name,rank:rankMap.get(x.teams.home.id)||null},
      away:{id:x.teams.away.id,name:x.teams.away.name,rank:rankMap.get(x.teams.away.id)||null}
    }));
    return res.status(200).json({
      syncedAt:new Date().toISOString(),season,league:{id:leagueId,name:le.league.name},
      currentRound,selectedRound:round,rounds:roundsAll.response||[],fixtures,totalTeams
    });
  }catch(e){return res.status(500).json({error:e.message||"Errore calendario"})}
}
