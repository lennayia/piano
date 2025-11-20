# PianoPro App - Průvodce nastavením

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

## 🎬 Přidání videa nebo fotky na pozadí

Přihlašovací stránka podporuje **BUĎTO video NEBO fotku** jako pozadí. Vše se nastavuje v `src/pages/Registration.jsx`.

### Možnost 1: Video s vlastním zvukem (DOPORUČENO)

1. Umístěte video do `public/videos/pianist-playing.mp4`
2. Otevřete `src/pages/Registration.jsx`
3. Nastavte konfiguraci (řádky 8-25):

```javascript
const backgroundConfig = {
  type: 'video', // Změňte na 'video'

  video: {
    url: "/videos/pianist-playing.mp4",
    muted: false, // false = použije se zvuk z videa
    loop: true,
    playbackRate: 1.0 // Rychlost přehrávání
  }
};
```

**Výhody video varianty:**
- Video může obsahovat nahrávku Vltavy přímo
- Vizuální efekt hraní je autentický
- Nemusíte řešit separátní audio soubor

### Možnost 2: Fotka + audio soubor

1. Umístěte fotku do `public/images/pianist.jpg`
2. Umístěte audio soubor do `public/audio/vltava.mp3`
3. Otevřete `src/pages/Registration.jsx`
4. Nastavte konfiguraci:

```javascript
const backgroundConfig = {
  type: 'image', // Ponechte 'image'

  image: {
    url: "/images/pianist.jpg"
  }
};
```

### Možnost 3: Pouze fotka se syntetizovanou melodií

Pokud nemáte audio soubor, použije se automaticky syntetizovaná melodie Vltavy.

```javascript
const backgroundConfig = {
  type: 'image',
  image: {
    url: "/images/pianist.jpg"
  }
};
```

### Ovládání hudby

- **S videem:** Zvuk je ovládán přímo z videa (muted: false/true)
- **S fotkou:** Tlačítko pro zapnutí/vypnutí hudby je v pravém horním rohu formuláře
- Hudba se automaticky ztlumí po 2 sekundách po přihlášení

## 👤 Admin přístup

### Jak funguje admin systém

- **První uživatel** se automaticky stává adminem
- **Ostatní uživatelé** mohou získat admin práva od stávajícího admina

### Nastavení admin práv

Admin může přidávat/odebírat admin práva jiným uživatelům:

1. Přihlaste se jako admin
2. Přejděte do **Admin Panelu** (odkaz v hlavní navigaci)
3. Klikněte na tab **Uživatelé**
4. U každého uživatele najdete tlačítko **"Nastavit admin"** nebo **"Odebrat admin"**

### Admin panel obsahuje:

- **Přehled** - Statistiky aplikace (počet uživatelů, lekcí, průměrný pokrok)
- **Uživatelé** - Správa registrovaných uživatelů a admin práv
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
