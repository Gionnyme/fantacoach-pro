# Pubblicare FantaCoach Pro su Google Play

## APK vs AAB
- APK: installazione diretta e test sul telefono.
- AAB: formato consigliato/richiesto per Google Play.

## Firma dell'app
Per aggiornare la stessa app in futuro devi mantenere:
- applicationId: it.fantacoachpro.android
- la stessa chiave di firma
- versionCode sempre crescente

## GitHub Actions — AAB firmato
Il workflow `.github/workflows/build-aab.yml` usa questi GitHub Secrets:

- ANDROID_KEYSTORE_BASE64
- ANDROID_KEYSTORE_PASSWORD
- ANDROID_KEY_ALIAS
- ANDROID_KEY_PASSWORD

### Creare una keystore
Puoi crearla con Android Studio:
Build > Generate Signed App Bundle or APK > Create new

Conserva il file `.jks` e le password in un luogo sicuro.

### Convertire la keystore in Base64
Su Windows PowerShell:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("fantacoach-release.jks")) | Set-Content keystore-base64.txt

Su macOS/Linux:
base64 -w 0 fantacoach-release.jks > keystore-base64.txt

Copia il contenuto in GitHub:
Repository > Settings > Secrets and variables > Actions > New repository secret

## Compilare
GitHub:
Actions > Build Android AAB > Run workflow

Scarica l'artifact:
FantaCoach-Pro-v7.4-AAB

Dentro trovi:
FantaCoach-Pro-v7.4.aab

## Prima pubblicazione
In Play Console crea la scheda dell'app, abilita Play App Signing e carica l'AAB.

## Aggiornamenti futuri
Aumenta versionCode:
11 -> 12 -> 13...

e genera un nuovo AAB con la stessa firma.
