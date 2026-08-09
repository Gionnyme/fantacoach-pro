# FantaCoach Pro — progetto Android Studio

## Versione
- applicationId: `it.fantacoachpro.android`
- versionCode: `8`
- versionName: `7.4.0`
- minSdk: 21 (Android 5.0+)
- targetSdk: 36
- compileSdk: 36
- Java: 17
- Android Gradle Plugin: 8.12.3
- Gradle previsto: 8.13

## Prima pubblicazione
IMPORTANTE: prima della prima pubblicazione su Google Play puoi cambiare applicationId.
Dopo la pubblicazione NON cambiarlo più, altrimenti Android considererà l'app una nuova applicazione.

## Build in Android Studio
1. Installa Android Studio aggiornato.
2. Installa Android SDK Platform 36.
3. Apri questa cartella `android`.
4. Lascia completare Gradle Sync.
5. Build > Generate Signed App Bundle or APK.
6. Scegli Android App Bundle.
7. Crea/usa una chiave di firma.
8. Conserva la chiave in modo sicuro oppure abilita Play App Signing.

## Aggiornamenti futuri
Per ogni release:
- aumenta versionCode: 8 -> 8 -> 9...
- cambia versionName: 7.0.0 -> 7.1.0...
- NON cambiare applicationId
- usa la stessa firma
- genera un nuovo .aab
- caricalo nella stessa app di Play Console

I normali aggiornamenti Android mantengono i dati locali dell'app.

## Backend
La chiave API NON è nell'APK.
Pubblica la cartella `../backend-vercel` e poi, dentro l'app:
Guida API > URL backend > inserisci l'URL HTTPS Vercel.


## Compatibilità con Android più vecchi
Questa variante usa `minSdk 21`, quindi può essere installata da Android 5.0 in poi.

Per dispositivi Android 5/6/7 è consigliato:
- aggiornare Android System WebView dal Play Store, se disponibile;
- aggiornare Google Chrome, se presente;
- usare una connessione HTTPS valida per il backend Vercel.

Il target resta API 36, quindi la stessa app può essere pubblicata e aggiornata sul Play Store
senza rinunciare alla compatibilità con dispositivi più vecchi.


## Nuovo branding v7.3
- nuovo logo ufficiale FantaCoach Pro
- palette aggiornata: blu notte `#0B1320`, blu profondo `#111E3A`, verde lime `#32D74B`, azzurro `#00B4FF`, oro `#FFC107`, rosso `#FF3B30`, grigio chiaro `#A0A8B8`
- icona Android aggiornata
