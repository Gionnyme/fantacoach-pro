# COME OTTENERE L'APK SENZA ANDROID STUDIO

Questo progetto contiene una GitHub Action che compila automaticamente FantaCoach.

## 1. Crea un account GitHub
Apri github.com e crea un account, se non lo possiedi già.

## 2. Crea un repository
- Premi `New repository`
- Nome consigliato: `fantacoach-pro`
- Può essere Private oppure Public
- Premi `Create repository`

## 3. Carica i file
Estrai questo ZIP sul PC.

Nel repository GitHub usa:
`Add file` → `Upload files`

Carica TUTTO il contenuto della cartella estratta, compresa la cartella nascosta:
`.github`

La struttura principale su GitHub deve risultare così:

.github/
  workflows/
    build-apk.yml
android/
backend-vercel/
web-source/
README.md

Poi premi `Commit changes`.

## 4. Genera l'APK
Nel repository:
- apri la scheda `Actions`
- scegli `Build Android APK`
- premi `Run workflow`
- premi di nuovo `Run workflow`

GitHub installerà automaticamente Java, Android SDK 36 e Gradle 8.13 e compilerà l'app.

## 5. Scarica l'APK
Quando il processo ha il simbolo verde:
- apri l'esecuzione terminata
- scendi alla sezione `Artifacts`
- premi `FantaCoach-Pro-v7.2-APK`

GitHub scaricherà un piccolo ZIP.
Aprilo: dentro troverai:

`FantaCoach-Pro-v7.2.apk`

## 6. Installa sul telefono
Invia l'APK al telefono oppure scaricalo direttamente dal telefono.

Apri:
`FantaCoach-Pro-v7.2.apk`

Se Android lo richiede, abilita temporaneamente:
`Consenti installazione da questa origine`

Poi premi `Installa`.

## Compatibilità
- Android minimo: Android 5.0 / API 21
- Target: Android 16 / API 36
- applicationId: `it.fantacoachpro.android`
- versionCode: 9
- versionName: 7.2.0

## Aggiornamenti futuri
Per installare una nuova versione sopra quella esistente:
- mantenere lo stesso `applicationId`;
- usare la stessa firma;
- aumentare sempre `versionCode`.

### Nota sulla build GitHub attuale
Il workflow genera un APK DEBUG installabile per test e uso personale.

Per Google Play sarà invece necessario generare un AAB RELEASE firmato.
Non pubblicare chiavi di firma o password direttamente nel repository.
