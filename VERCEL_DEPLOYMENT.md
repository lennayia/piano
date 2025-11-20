# Vercel Deployment Guide

Návod k nasazení PianoPro App na Vercel.

## Předpoklady

1. ✅ Máte GitHub účet
2. ✅ Máte Vercel účet (https://vercel.com)
3. ✅ Máte nastavený Supabase projekt (viz SUPABASE_SETUP.md)
4. ✅ Projekt je commitnutý v Git repozitáři

## Krok 1: Import projektu do Vercel

1. Přihlaste se na https://vercel.com
2. Klikněte na **"Add New..."** > **"Project"**
3. Importujte váš GitHub repozitář `piano`
4. Vercel automaticky detekuje Vite projekt

## Krok 2: Nastavení Build

Vercel by měl automaticky rozpoznat nastavení:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Pokud ne, nastavte ručně.

## Krok 3: Environment Variables

**VELMI DŮLEŽITÉ:** Před deployem nastavte environment variables!

1. V Vercel dashboard vašeho projektu přejděte na **Settings** > **Environment Variables**

2. Přidejte tyto proměnné:

```
VITE_SUPABASE_URL = https://qrnsrhrgjzijqphgehra.supabase.co
VITE_SUPABASE_ANON_KEY = [váš Supabase anon key]
```

**Kde najít Supabase keys:**
- Supabase Dashboard > Project Settings > API
- Použijte **anon/public** key (NIKDY ne service_role key!)

3. Nastavte pro všechny prostředí:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

## Krok 4: Deploy

1. Klikněte na **"Deploy"**
2. Počkejte na dokončení buildu (obvykle 1-2 minuty)
3. Po úspěšném deployi dostanete URL: `https://piano-xxx.vercel.app`

## Krok 5: Konfigurace Supabase pro Vercel

Pro správnou funkci autentizace musíte přidat Vercel URL do Supabase:

1. Přejděte do Supabase Dashboard > Authentication > URL Configuration
2. Přidejte do **Site URL:** `https://piano-xxx.vercel.app`
3. Přidejte do **Redirect URLs:**
   - `https://piano-xxx.vercel.app/**`
   - `http://localhost:5173/**` (pro lokální vývoj)

## Krok 6: Testování

Po deployi otestujte:

1. ✅ Načte se hlavní stránka
2. ✅ Registrace nového uživatele funguje
3. ✅ Přihlášení funguje
4. ✅ Data se ukládají do Supabase
5. ✅ Admin funkce (pokud jste admin)
6. ✅ Lekce se načítají
7. ✅ Audio funguje

## Automatické Deploymenty

Vercel automaticky deployuje při:
- **Push na main branch** → Production deploy
- **Push na jiné branches** → Preview deploy
- **Pull Request** → Preview deploy s unikátní URL

## Custom Domain (volitelné)

Pro vlastní doménu:

1. V Vercel přejděte na **Settings** > **Domains**
2. Přidejte vaši doménu
3. Nastavte DNS záznamy podle instrukcí Vercelu
4. Aktualizujte Supabase Redirect URLs

## Řešení problémů

### Build failuje s "vite: not found"

Zkontrolujte `package.json` - `vite` by měl být v dependencies nebo devDependencies.

### Chyba: "Supabase credentials are missing"

Environment variables nejsou správně nastavené:
1. Zkontrolujte Settings > Environment Variables
2. Ujistěte se, že začínají `VITE_` (důležité pro Vite!)
3. Redeploy projekt

### 404 Not Found na routes

Vite + SPA routing problém. Vytvořte `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Audio nefunguje v production

Zkontrolujte HTTPS - audio API vyžaduje secure context.

### Supabase RLS policy error

Ujistěte se, že:
1. Spustili jste migration script
2. RLS policies jsou aktivní
3. Používáte správný anon key

## Monitoring

Vercel poskytuje:
- **Analytics:** Sledování návštěvnosti
- **Logs:** Real-time logy
- **Speed Insights:** Výkonnostní metriky

Najdete v Dashboard vašeho projektu.

## Production Checklist

Před spuštěním do produkce:

- [ ] Všechny environment variables nastaveny
- [ ] Supabase databáze plně nastavena
- [ ] Redirect URLs v Supabase nakonfigurovány
- [ ] Build projde bez chyb
- [ ] Všechny funkce otestovány
- [ ] Admin účet vytvořen a otestován
- [ ] Email konfirmace nakonfigurována (nebo vypnuta)
- [ ] Custom domain nastavena (pokud se používá)
- [ ] HTTPS funkční
- [ ] Audio funguje

## Poznámky

- **Build time:** Obvykle 1-2 minuty
- **Redeploy:** Automaticky při každém push
- **Rollback:** Možný v Vercel dashboard > Deployments
- **Preview:** Každá branch dostane vlastní URL pro testování

## Podpora

- Vercel docs: https://vercel.com/docs
- Vite docs: https://vitejs.dev
- Supabase docs: https://supabase.com/docs

---

Po úspěšném deployi je aplikace dostupná 24/7 na vaší Vercel URL! 🎉
