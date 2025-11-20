# Migrace: Kompletní systém správy odměn

## Přehled
Tato migrace přidává kompletní systém pro správu odměn v admin rozhraní, včetně možnosti nastavení ikon, barev, zvuků a přiřazování odměn k lekcím, materiálům a kvízům.

## Co bylo implementováno

### 1. Databázové změny
- ✅ Nové sloupce v tabulce `piano_achievements`:
  - `icon_type` - název Lucide ikony (Star, Trophy, Cake, Medal, atd.)
  - `icon_color` - barva ikony (primary/secondary)
  - `celebration_sound` - název zvuku pro oslavu (achievement, fanfare, success, atd.)

- ✅ Nová tabulka `piano_achievement_triggers`:
  - Definuje, kdy se odměna přidělí (po dokončení lekce, materiálu, kvízu nebo globálně)
  - Obsahuje vazby mezi odměnami a lekcemi/materiály/kvízy

### 2. Frontend komponenty
- ✅ **AchievementManager.jsx** - kompletní admin rozhraní pro správu odměn
  - Vytváření/editace/mazání odměn
  - Výběr ikony z 18 dostupných Lucide ikon
  - Výběr barvy (růžová primary / modrá secondary)
  - Výběr zvuku oslavy (5 různých zvuků)
  - Nastavení podmínek (počet lekcí, XP, streak)
  - Přiřazování k lekcím, kvízům nebo materiálům

- ✅ **Dynamické renderování ikon** - UserDashboard.jsx a UserList.jsx
  - Ikony se nyní načítají z databáze místo pevného mapování
  - Zpětná kompatibilita s původními emoji ikonami

- ✅ **Admin panel** - nová záložka "Odměny"
  - Přidána do navigace admin panelu

## Jak spustit migraci

### Krok 1: Připojení k databázi
Připojte se k vaší Supabase databázi pomocí jednoho z těchto způsobů:

#### Možnost A: Supabase SQL Editor (doporučeno)
1. Otevřete Supabase Dashboard: https://supabase.com/dashboard
2. Vyberte váš projekt `piano`
3. Přejděte na **SQL Editor**
4. Otevřete soubor `supabase_migration_achievements_system.sql`
5. Zkopírujte celý obsah souboru
6. Vložte do SQL editoru a klikněte na **Run**

#### Možnost B: psql (command line)
```bash
# Z adresáře projektu spusťte:
psql "postgresql://postgres.afkznfjtfjyfrxuwpqgp:Pianolektori2024@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -f supabase_migration_achievements_system.sql
```

### Krok 2: Ověření migrace
Po spuštění migrace ověřte, že všechno proběhlo v pořádku:

1. Zkontrolujte, zda se přidaly nové sloupce:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'piano'
  AND table_name = 'piano_achievements';
```

2. Zkontrolujte, zda se vytvořila nová tabulka:
```sql
SELECT * FROM piano.piano_achievement_triggers;
```

3. Ověřte, že existující odměny mají přiřazené ikony:
```sql
SELECT id, title, icon_type, icon_color, celebration_sound
FROM piano.piano_achievements;
```

### Krok 3: Testování v aplikaci
1. Otevřete aplikaci: http://localhost:5175/
2. Přihlaste se jako admin
3. Přejděte do **Admin panelu** → záložka **Odměny**
4. Měli byste vidět všech 7 existujících odměn s ikonami
5. Vyzkoušejte:
   - Vytvoření nové odměny
   - Editaci existující odměny
   - Změnu ikony a barvy
   - Přiřazení odměny k lekci

## Dostupné funkce v admin rozhraní

### Vytvoření nové odměny
1. Klikněte na tlačítko **"Přidat odměnu"**
2. Vyplňte formulář:
   - **Název odměny** - např. "Mistrovský pianista"
   - **Popis** - např. "Dokončil jsi 20 lekcí!"
   - **Ikona** - výběr z 18 ikon (Star, Trophy, Award, Medal, Crown, Target, Zap, Flame, Sparkles, Heart, Gift, Cake, Piano, Music, BookOpen, GraduationCap, CheckCircle, Shield)
   - **Barva** - Růžová (Primary) nebo Modrá (Secondary)
   - **Zvuk oslavy** - achievement, fanfare, success, applause, cheer
   - **Typ podmínky** - Počet lekcí, XP, Série dnů, Globální
   - **Požadovaná hodnota** - např. 20 (pro 20 lekcí)
   - **XP odměna** - např. 100
   - **Přidělit po** - Globálně / Konkrétní lekce / Kvíz / Materiál
3. Klikněte na **"Uložit"**

### Editace odměny
1. Najděte odměnu v seznamu
2. Klikněte na tlačítko **"Upravit"**
3. Změňte požadované údaje
4. Klikněte na **"Uložit"**

### Smazání odměny
1. Najděte odměnu v seznamu
2. Klikněte na tlačítko s ikonou koše
3. Potvrďte smazání

## Příklady použití

### Příklad 1: Odměna za dokončení konkrétní lekce
```
Název: Mistr C dur stupnice
Popis: Perfektně zvládl C dur stupnici!
Ikona: Piano
Barva: Růžová
Zvuk: fanfare
Typ podmínky: Globální (vždy)
XP odměna: 50
Přidělit po: Dokončení konkrétní lekce → "Lekce 3: C dur stupnice"
```

### Příklad 2: Odměna za sérii
```
Název: Věrný student
Popis: Udržel jsi 14denní sérii!
Ikona: Flame
Barva: Modrá
Zvuk: success
Typ podmínky: Série dnů v řadě
Požadovaná hodnota: 14
XP odměna: 50
Přidělit po: Globálně
```

### Příklad 3: Odměna za kvíz
```
Název: Akordový mistr
Popis: Poznáváš všechny akordy!
Ikona: Trophy
Barva: Růžová
Zvuk: fanfare
Typ podmínky: Globální
XP odměna: 30
Přidělit po: Úspěšném splnění kvízu → "Poznáš akord?"
```

## Dostupné ikony
Star, Trophy, Award, Medal, Crown, Target, Zap, Flame, Sparkles, Heart, Gift, Cake, Piano, Music, BookOpen, GraduationCap, CheckCircle, Shield

## Dostupné zvuky
- achievement - základní zvuk úspěchu
- fanfare - slavnostní fanfára
- success - úspěch
- applause - potlesk
- cheer - povzbuzení

## Zpětná kompatibilita
Aplikace podporuje zpětnou kompatibilitu s původními emoji ikonami. Pokud odměna nemá nastavený `icon_type`, použije se původní mapování:
- 🎹 → Piano (růžová)
- 📚 → BookOpen (modrá)
- 🎓 → GraduationCap (růžová)
- 🔥 → Flame (modrá)
- ⭐ → Star (růžová)
- 💯 → Target (modrá)
- 🏆 → Trophy (růžová)

## Řešení problémů

### Migrace selhala
- Zkontrolujte připojení k databázi
- Ověřte, že máte správná oprávnění
- Zkontrolujte logy v Supabase Dashboard → Database → Logs

### Ikony se nezobrazují
- Zkontrolujte, že migrace proběhla úspěšně
- Ověřte v databázi, že sloupce `icon_type` a `icon_color` existují
- Obnovte stránku v prohlížeči (Ctrl+R)

### Admin panel nefunguje
- Zkontrolujte, že jste přihlášeni jako admin
- Ověřte v tabulce `piano_users`, že váš účet má `is_admin = true`
- Zkontrolujte console v prohlížeči na chyby (F12)

## Kontakt
V případě problémů kontaktujte vývojáře nebo vytvořte issue v GitHub repozitáři.
