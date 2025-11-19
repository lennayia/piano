# 🔧 NOUZOVÉ ŘEŠENÍ - Nastavení admin práv

Pokud nevidíte admin panel, následujte tyto kroky:

## Krok 1: Otevřete konzoli prohlížeče

1. Stiskněte **F12** (nebo Ctrl+Shift+I)
2. Klikněte na záložku **Console**

## Krok 2: Spusťte tento příkaz

Zkopírujte a vložte tento kód do konzole a stiskněte Enter:

```javascript
// Získat user store
const store = JSON.parse(localStorage.getItem('piano-users-storage'));

// Zobrazit všechny uživatele
console.log('=== VŠICHNI UŽIVATELÉ ===');
store.state.users.forEach((user, index) => {
  console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Admin: ${user.isAdmin || false}`);
});

// Nastavit Lenku Roubalovou jako admin
store.state.users = store.state.users.map(user => {
  if (user.email.toLowerCase() === 'lenkaroubalka@seznam.cz') {
    user.isAdmin = true;
    console.log(`✅ ${user.firstName} ${user.lastName} je nyní ADMIN!`);
  }
  return user;
});

// Aktualizovat i currentUser pokud je to Lenka
if (store.state.currentUser && store.state.currentUser.email.toLowerCase() === 'lenkaroubalka@seznam.cz') {
  store.state.currentUser.isAdmin = true;
  console.log('✅ Current user aktualizován!');
}

// Uložit zpět do localStorage
localStorage.setItem('piano-users-storage', JSON.stringify(store));

console.log('✅ HOTOVO! Obnovte stránku (F5)');
```

## Krok 3: Obnovte stránku

Stiskněte **F5** nebo **Ctrl+R**

## Krok 4: Zkontrolujte

Po obnovení by se v navigaci měl objevit červený odkaz **"Admin"**

---

## Pokud to stále nefunguje

Zkuste kompletně vymazat data a znovu se přihlásit:

```javascript
// POZOR: Toto vymaže všechny uživatele!
localStorage.removeItem('piano-users-storage');
console.log('✅ Data vymazána. Obnovte stránku a přihlaste se znovu.');
```

Pak:
1. Obnovte stránku (F5)
2. Přihlaste se s emailem **lenkaroubalka@seznam.cz**
3. Budete automaticky admin!
