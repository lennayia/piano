# 🚨 KRITICKÁ PRAVIDLA - NIKDY NEPORUŠOVAT

## ❌ ABSOLUTNÍ ZÁKAZ

### 1. NIKDY NEMAZAT SOUBORY BEZ EXPLICITNÍHO POTVRZENÍ

**PRAVIDLO:**
- Pokud se ptám "Mám smazat...?" → ZASTAVIT A ČEKAT NA ODPOVĚĎ
- Pokud uživatel neodpověděl "ano", "smaž to", "ok" → NEMAZAT
- NIKDY nepoužívat `rm -rf` bez předchozího potvrzení

**DŮVOD:**
- Toto jsme řešili více než 30x
- Uživatel je z toho velmi frustrovaný
- Soubory mohou obsahovat důležitá data

**KONTROLA PŘED SMAZÁNÍM:**
```
1. Zeptat se: "Mám smazat XYZ?"
2. POČKAT na odpověď uživatele
3. Pouze pokud uživatel explicitně potvrdí → teprve pak smazat
4. NIKDY nesmazat preventivně "protože to vypadá zbytečně"
```

**PŘÍKLADY:**
- ❌ ŠPATNĚ: "Mám je smazat?" → okamžitě spustit rm -rf
- ✅ SPRÁVNĚ: "Mám je smazat?" → čekat na odpověď → pokud "ano" → teprve pak smazat

### 2. NIKDY NEMODIFIKOVAT DATABÁZI BEZ POTVRZENÍ

**PRAVIDLO:**
- Žádné INSERT, UPDATE, DELETE bez explicitního požadavku
- Žádné DROP TABLE, TRUNCATE bez potvrzení
- Vždy se zeptat před změnou dat

### 3. NIKDY NEPUSHOVAT DO GITU BEZ POTVRZENÍ

**PRAVIDLO:**
- Commitovat pouze pokud uživatel požádal
- Push pouze pokud uživatel explicitně řekl "pushni to"
- Vždy zobrazit diff před commitem

---

## ✅ SPRÁVNÉ CHOVÁNÍ

### Když uživatel řekne "Mám nějaký backup?"
1. Zkontrolovat existenci backups
2. Zobrazit co tam je
3. ZEPTAT SE: "Mám je smazat?"
4. **ZASTAVIT A ČEKAT NA ODPOVĚĎ**
5. Pokud uživatel potvrdí → teprve pak smazat

### Když vidím "zbytečné" soubory
1. Informovat uživatele co jsem našel
2. ZEPTAT SE co s nimi
3. **ČEKAT NA INSTRUKCE**
4. Nerozhodovat se sám

---

## 📝 HISTORY PORUŠENÍ

- 29.11.2025 23:50 - Smazány backups bez potvrzení (po 30+ opakování téhož)
- ... další případy ...

---

**TENTO SOUBOR JE NEJDŮLEŽITĚJŠÍ V CELÉM PROJEKTU**
**PŘEČÍST PŘED KAŽDOU OPERACÍ S MAZÁNÍM/MODIFIKACÍ**
