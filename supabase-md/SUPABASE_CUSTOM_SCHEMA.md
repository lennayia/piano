# Jak povolit custom schéma 'piano' v Supabase

Abyste mohli používat custom schéma `piano` místo `public`, musíte ho **povolit v Supabase API nastavení**.

## Krok 1: Povolit schéma v Supabase Dashboard

1. Přihlaste se do **Supabase Dashboard**: https://supabase.com/dashboard
2. Vyberte váš projekt (qrnsrhrgjzijqphgehra)
3. Jděte do **Project Settings** (ikona ozubeného kola vlevo dole)
4. Klikněte na **API** v levém menu
5. Srolujte dolů na sekci **"Exposed schemas"**
6. Přidejte `piano` do seznamu exposed schemas

   **Výchozí hodnota:**
   ```
   public, storage, graphql_public
   ```

   **Změňte na:**
   ```
   public, storage, graphql_public, piano
   ```

7. **Uložte změny**

## Krok 2: Spusťte migration

V **SQL Editor** spusťte soubor: `supabase_migration_clean.sql`

Tento soubor:
- Vytvoří schéma `piano`
- Nastaví `GRANT USAGE ON SCHEMA piano TO anon, authenticated`
- Vytvoří všechny tabulky v `piano` schématu
- Nastaví RLS policies a oprávnění

## Krok 3: Restartujte aplikaci

```bash
# Zastavte dev server (Ctrl+C)
# Znovu spusťte:
npm run dev
```

## Krok 4: Přihlaste se

Zadejte:
- **Jméno:** Lenka
- **Příjmení:** Roubalová
- **Email:** lenkaroubalka@seznam.cz

Budete automaticky nastavena jako **admin**! 👑

---

## Řešení problémů

### Stále dostávám 406 Not Acceptable

- Zkontrolujte, že jste přidali `piano` do **Exposed schemas**
- Zkontrolujte, že jste **uložili změny** v API settings
- Restartujte dev server

### Chyba: permission denied for schema piano

- Zkontrolujte, že jste spustili migration SQL
- Migration obsahuje: `GRANT USAGE ON SCHEMA piano TO anon, authenticated`

### Tabulky neexistují

- Spusťte `supabase_migration_clean.sql` v SQL Editor
- Tento script DROP a znovu vytvoří všechny tabulky

---

## Proč custom schéma?

✅ Oddělení od jiných projektů v `public` schématu
✅ Lepší organizace při víc projektech
✅ Stejný prefix `piano_` jako u jiných vašich projektů

---

Po dokončení těchto kroků bude aplikace používat:
- Schéma: `piano`
- Tabulky: `piano.piano_users`, `piano.piano_user_stats`, atd.
- REST API: `https://qrnsrhrgjzijqphgehra.supabase.co/rest/v1/piano_users`
