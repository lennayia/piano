# Supabase Setup Guide

Tento projekt používá Supabase jako backend databázi pro autentizaci a ukládání dat.

## 1. Předpoklady

- Máte vytvořený Supabase projekt na https://supabase.com
- Máte přístup k SQL Editor ve vašem Supabase projektu

## 2. Nastavení databáze

### Krok 1: Vytvoření schématu a tabulek

1. Přihlaste se do Supabase Dashboard
2. Otevřete SQL Editor (v levém menu)
3. Zkopírujte celý obsah souboru `supabase/migrations/001_initial_schema.sql`
4. Vložte ho do SQL Editoru a spusťte (klikněte na "Run")

Tímto se vytvoří:
- Schéma `piano`
- Všechny potřebné tabulky s prefixem `piano_`
- Row Level Security (RLS) policies
- Triggery pro automatické aktualizace
- Výchozí data (achievements, rewards config)

### Krok 2: Nastavení API klíčů

1. V Supabase Dashboard přejděte na Project Settings > API
2. Zkopírujte:
   - **Project URL** (např. `https://qrnsrhrgjzijqphgehra.supabase.co`)
   - **anon/public key** (označený jako "anon public")

3. Otevřete soubor `.env` v kořenovém adresáři projektu
4. Nahraďte placeholder hodnoty:

```env
VITE_SUPABASE_URL=https://qrnsrhrgjzijqphgehra.supabase.co
VITE_SUPABASE_ANON_KEY=váš_anon_key_zde
```

**DŮLEŽITÉ:** Soubor `.env` je v `.gitignore` a nebude se commitovat do repozitáře!

## 3. Nastavení autentizace

### Povolit Email Auth

1. V Supabase Dashboard přejděte na Authentication > Providers
2. Ujistěte se, že **Email** provider je povolen
3. (Volitelné) Vypněte "Confirm email" pokud chcete umožnit okamžité přihlášení bez potvrzení emailu

### Nastavení admin uživatele

Výchozí admin email je: `lenkaroubalka@seznam.cz`

Pokud se chcete přihlásit jako admin:
1. Zaregistrujte se s emailem `lenkaroubalka@seznam.cz`
2. Aplikace automaticky nastaví tento účet jako admin

Pro přidání dalších adminů:
1. Přihlaste se jako admin
2. Přejděte do Admin panelu > Uživatelé
3. Klikněte na tlačítko pro změnu admin práv u vybraného uživatele

## 4. Databázová struktura

### Hlavní tabulky

- **piano_users** - Uživatelské účty a profily
- **piano_lessons** - Výukové lekce
- **piano_songs** - Knihovna písní pro procvičování
- **piano_glossary** - Slovník hudebních pojmů
- **piano_harmonization_templates** - Šablony pro harmonizaci
- **piano_user_progress** - Sledování pokroku uživatelů
- **piano_user_stats** - Statistiky a gamifikace (XP, level, streak)
- **piano_achievements** - Dostupné odměny/achievementy
- **piano_user_achievements** - Získané odměny uživatelů
- **piano_rewards_config** - Konfigurace bodového systému (editovatelná adminem)
- **piano_quiz_scores** - Výsledky kvízů

### Row Level Security (RLS)

Všechny tabulky mají nastavené RLS policies:
- **Uživatelé** vidí pouze svá vlastní data
- **Admini** mají přístup ke všem datům
- **Všichni** mohou číst aktivní lekce, písně, slovník a šablony
- **Pouze admini** mohou upravovat obsah

## 5. Testování

Po dokončení nastavení:

1. Spusťte aplikaci: `npm run dev`
2. Zaregistrujte se s novým účtem
3. Zkontrolujte, že:
   - Registrace funguje
   - Přihlášení funguje
   - Data se ukládají do Supabase
   - Admin funkce fungují (pokud jste admin)

## 6. Řešení problémů

### Chyba: "Supabase credentials are missing"
- Zkontrolujte, že máte správně vyplněné `.env` soubor
- Restartujte dev server (`npm run dev`)

### Chyba při registraci: "Invalid API key"
- Zkontrolujte, že používáte **anon/public** klíč, ne service_role klíč
- Ujistěte se, že klíč je správně zkopírován bez extra mezer

### RLS policy error
- Zkontrolujte, že jste spustili celý migration script
- Ověřte v Supabase Dashboard > Authentication, že Email auth je povolen

### Nelze upravovat písně/obsah jako admin
- Ověřte, že váš účet má `is_admin = true` v tabulce `piano_users`
- Zkontrolujte v SQL Editoru: `SELECT * FROM piano.piano_users WHERE email = 'váš@email.cz';`

## 7. Další kroky

Po úspěšném nastavení Supabase můžete:

1. **Přidat iniciální data:**
   - Vytvořit lekce
   - Přidat písně do knihovny
   - Vyplnit slovník pojmů
   - Vytvořit harmonizační šablony

2. **Nakonfigurovat odměny:**
   - Admin panel > Správa odměn
   - Upravit XP hodnoty pro různé akce

3. **Deploy na Vercel:**
   - Připojit GitHub repository
   - Nastavit environment variables ve Vercel
   - Deploy!

## 8. Zabezpečení

**NIKDY** necommitujte:
- `.env` soubor
- API klíče
- Service role klíč

Používejte pouze **anon/public** klíč v klientské aplikaci.
