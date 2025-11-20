#!/bin/bash

# =====================================================
# Skript pro spuštění SQL migrací v Supabase
# =====================================================

SUPABASE_URL="https://qrnsrhrgjzijqphgehra.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybnNyaHJnanppanFwaGdlaHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzg1MzEsImV4cCI6MjA3NTc1NDUzMX0.PvKCvlhQxWiacimicy8LINLKeWbMwQIKkwb5TOAwhAs"

echo "=================================================="
echo "Spouštím migrace v Supabase..."
echo "=================================================="

# Funkce pro spuštění SQL souboru
run_sql_file() {
    local file=$1
    local name=$2

    echo ""
    echo "Spouštím: $name"
    echo "--------------------------------------------------"

    # Přečíst SQL soubor
    SQL=$(cat "$file")

    # Spustit přes Supabase REST API
    curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "apikey: ${SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(echo "$SQL" | jq -Rs .)}" \
        2>&1

    if [ $? -eq 0 ]; then
        echo "✅ $name - HOTOVO"
    else
        echo "❌ $name - CHYBA"
    fi
}

# Spustit migrace v pořadí
run_sql_file "supabase_migration_quiz_and_songs_tracking.sql" "1. Quiz & Songs Tracking Tables"
run_sql_file "supabase_fix_song_completions_rls.sql" "2. Fix RLS Policies"

echo ""
echo "=================================================="
echo "Migrace dokončeny!"
echo "=================================================="
