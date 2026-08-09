# FantaCoach Pro v7.4 — Publish Readyndroid + GitHub APK

Questo pacchetto contiene:

- `android/` → progetto Android Studio nativo
- `backend-vercel/` → backend sicuro per API-Football
- `web-source/` → sorgente interfaccia FantaCoach

## Come funziona l'aggiornamento
L'app è configurata con un applicationId Android stabile.
Ogni nuova versione deve avere un versionCode più alto e la stessa firma.
Pubblicata su Google Play, riceve gli aggiornamenti come una normale app Android.

## Dati che restano sul telefono
Gli aggiornamenti normali preservano:
- lega
- avversari
- acquisti e prezzi
- crediti residui
- liste
- rose salvate
- formazione
- impostazioni
- URL backend

## Collegamento API
La guida completa è anche dentro l'app nella scheda `Guida API`.

Flusso:
API-Football → backend Vercel → FantaCoach Android

La API key resta su Vercel.

## Nota importante
Il progetto è sorgente Android Studio pronto alla compilazione.
Questo ambiente non contiene l'Android SDK, quindi nel pacchetto non è incluso un APK/AAB compilato.
Per produrre il file installabile basta aprire `android/` in Android Studio e generare APK/AAB firmato.


## Compatibilità estesa
Questa build Android supporta dispositivi da **Android 5.0 (API 21)** in su.
Il `targetSdk` rimane 36 per rispettare i requisiti moderni del Play Store.

La compatibilità estesa non modifica l'`applicationId`, quindi questa versione
può essere distribuita come aggiornamento della stessa app.


## Compilazione online senza Android Studio
È inclusa la GitHub Action:

`.github/workflows/build-apk.yml`

Leggi `COME_CREARE_APK_CON_GITHUB.md`.

La Action genera automaticamente un APK installabile per test/uso personale.


## Nuovo branding v7.3
- nuovo logo ufficiale FantaCoach Pro
- palette aggiornata: blu notte `#0B1320`, blu profondo `#111E3A`, verde lime `#32D74B`, azzurro `#00B4FF`, oro `#FFC107`, rosso `#FF3B30`, grigio chiaro `#A0A8B8`
- icona Android aggiornata


## v7.4 Publish Ready
- splash screen brandizzata
- home aggiornata con nuova identità FantaCoach Pro
- logo/icona ufficiale
- feature strip Dati Live / IA / Lega / Statistiche
- GitHub Action APK installabile
- GitHub Action AAB per Google Play
- supporto firma release tramite GitHub Secrets
- versionCode 11 / versionName 7.4.0
