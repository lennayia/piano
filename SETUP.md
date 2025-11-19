# Piano Learning App - Průvodce nastavením

## 🎹 Přehled
Tato aplikace slouží k výuce hry na klavír s interaktivními lekcemi a gamifikací.

## 📋 Požadavky
- Node.js 18 nebo vyšší
- npm nebo yarn

## 🚀 Instalace

1. **Nainstalujte závislosti:**
```bash
npm install
```

2. **Spusťte vývojový server:**
```bash
npm run dev
```

3. **Build pro produkci:**
```bash
npm run build
```

## 🔑 Konfigurace Email Marketingu

### 1. Vytvoření .env souboru

Zkopírujte `.env.example` na `.env`:
```bash
cp .env.example .env
```

### 2. Konfigurace služeb

#### EcoMail
1. Přihlaste se do [EcoMail](https://ecomail.cz/)
2. Získejte API klíč z nastavení
3. Vytvořte nebo najděte ID segmentu/listu
4. Nastavte v `.env`:
```env
VITE_ECOMAIL_ENABLED=true
VITE_ECOMAIL_API_KEY=your_api_key
VITE_ECOMAIL_LIST_ID=your_list_id
```

#### MailerLite
1. Přihlaste se do [MailerLite](https://www.mailerlite.com/)
2. Získejte API klíč z Integrations > API
3. Vytvořte skupinu a získejte její ID
4. Nastavte v `.env`:
```env
VITE_MAILERLITE_ENABLED=true
VITE_MAILERLITE_API_KEY=your_api_key
VITE_MAILERLITE_GROUP_ID=your_group_id
```

#### SmartEmailing
1. Přihlaste se do [SmartEmailing](https://www.smartemailing.cz/)
2. Získejte API credentials
3. Vytvořte segment/list a získejte jeho ID
4. Nastavte v `.env`:
```env
VITE_SMARTEMAILING_ENABLED=true
VITE_SMARTEMAILING_USERNAME=your_username
VITE_SMARTEMAILING_API_KEY=your_api_key
VITE_SMARTEMAILING_LIST_ID=your_list_id
```

### 3. Testování integrace

Po konfiguraci restartujte vývojový server a zkuste se přihlásit. Nový uživatel by měl být automaticky přidán do nakonfigurovaných email marketingových systémů.

## 🎵 Přidání vlastní fotky klavíristky

1. Umístěte svou fotku do složky `public/images/`
2. Pojmenujte ji např. `pianist.jpg`
3. Otevřete `src/pages/Registration.jsx`
4. Na řádku 9 změňte URL:
```javascript
const pianistPhoto = "/images/pianist.jpg";
```

## 🎼 Přidání vlastní hudby (Vltava)

### Možnost 1: Použití audio souboru

1. Získejte audio soubor Vltavy (MP3, OGG, nebo WAV)
2. Umístěte ho do `public/audio/vltava.mp3`
3. Audio engine automaticky preferuje skutečné audio soubory před syntetizovanou melodií

### Možnost 2: Syntetizovaná melodie

Aktuálně se používá syntetizovaná melodie. Můžete ji upravit v `src/utils/audio.js` v metodě `playVltava()`.

### Ovládání hudby

- Tlačítko pro zapnutí/vypnutí hudby je v pravém horním rohu přihlašovací stránky
- Hudba se automaticky ztlumí po 2 sekundách po přihlášení

## 👤 Admin přístup

Pro přístup k admin panelu musí email uživatele obsahovat slovo "admin" (např. `admin@example.com`).

Admin panel obsahuje:
- **Přehled** - Statistiky aplikace
- **Uživatelé** - Správa registrovaných uživatelů
- **Správa písní** - Editace melodií lidových písní

## 🛠️ Technologie

- **React 19** - UI framework
- **Vite** - Build tool
- **Zustand** - State management
- **Framer Motion** - Animace
- **Web Audio API** - Zvukový engine
- **React Router** - Navigace

## 📝 Poznámky

- `.env` soubor je v `.gitignore` a nebude commitován
- API klíče nikdy nesdílejte veřejně
- Pro produkční nasazení nastavte environment variables na vašem hostingu
- Všechny email marketingové služby jsou volitelné - můžete použít jen některé

## 🆘 Podpora

V případě problémů zkontrolujte:
1. Konzoli prohlížeče (F12) pro chybové zprávy
2. Správnost API klíčů v `.env`
3. Zda jste restartovali server po změně `.env`
