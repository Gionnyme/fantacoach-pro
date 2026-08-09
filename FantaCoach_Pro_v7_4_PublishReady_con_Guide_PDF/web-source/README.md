# FantaCoach Pro v6 — Infortuni, squalifiche e formazione

## Disponibilità giocatori
La scheda di ogni giocatore può mostrare:
- INFORTUNATO
- IN DUBBIO
- SQUALIFICATO
- motivo dell'assenza
- data di inizio, se disponibile
- data prevista di rientro, se disponibile
- giorni totali previsti
- badge **SOSTITUIBILE ≥3 MESI** quando un infortunio ha durata prevista >= 90 giorni

### Regola dei 3 mesi
La regola è implementata come soglia di **90 giorni**.
Viene applicata solo agli infortuni, non alle squalifiche. FantaCoach applica inoltre la regola della lega che blocca questa sostituzione nelle ultime 8 giornate.

API-Football `/injuries` indica l'indisponibilità per le partite.
Il pulsante "Aggiorna infortuni + tempi di rientro" usa inoltre `/sidelined`
per recuperare start/end dell'assenza quando disponibili.

ATTENZIONE: se l'API restituisce end=Unknown/null, FantaCoach mostra
"Rientro non definito" e NON dichiara automaticamente l'idoneità alla sostituzione.

## Squalifiche
Gli indisponibili per squalifica vengono marcati in rosso.
L'algoritmo di formazione assegna loro una penalità che li esclude dalla proposta automatica.

## Formazione giornata per giornata
La nuova scheda Formazione usa:
- i tuoi acquisti reali registrati nell'Asta Live
- titolarità stimata
- forma
- FVM / score FantaCoach
- bonus potenziale
- disponibilità/infortuni/squalifiche
- avversario della giornata
- posizione dell'avversario in classifica
- bonus/modificatore difesa

Moduli supportati:
3-4-3, 3-5-2, 4-3-3, 4-4-2, 4-5-1, 5-3-2, 5-4-1.

In modalità Automatico viene scelto il modulo con punteggio complessivo più alto.
Se 4 difensori forti da modificatore producono un vantaggio, il sistema può preferire la difesa a 4.

La formazione proposta è sempre modificabile manualmente.

## Backend
- `/api/sync`: squadre, rose, infortuni e opzionalmente storico sidelined
- `/api/matchday`: giornata corrente, partite e classifica avversari

## Chiave API
Configurare su Vercel:
`API_FOOTBALL_KEY=...`

Non inserire la chiave nel frontend.

## Nota quota API
Il controllo medico profondo `/sidelined` richiede chiamate aggiuntive per i giocatori
attualmente indisponibili. Per questo è un pulsante separato e conviene usarlo
una volta al giorno o quando ci sono novità mediche importanti.
