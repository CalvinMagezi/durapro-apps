# Database Connection Guide

## Option 1: Supabase CLI (Easiest)

### Step 1: Install Supabase CLI
```bash
brew install supabase/tap/supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```
This will open a browser to authenticate.

### Step 3: Link Your Project
```bash
supabase link --project-ref trkgvxizmmhtvdfmgxnn
```

### Step 4: Run the Cleanup SQL
```bash
supabase db execute --file durapro-docs/database-cleanup-phase1.sql
```

---

## Option 2: psql with SSL (Direct Connection)

### Get Your Password
1. Go to: https://app.supabase.com/project/trkgvxizmmhtvdfmgxnn
2. Project Settings → Database
3. Copy the password from "Connection string"

### Run psql
```bash
# Export the connection string (replace YOUR_PASSWORD)
export PGPASSWORD="YOUR_PASSWORD"

# Connect
psql -h db.trkgvxizmmhtvdfmgxnn.supabase.co \
     -p 5432 \
     -U postgres \
     -d postgres \
     --set=sslmode=require
```

### Or use the full connection string:
```bash
psql "postgresql://postgres:YOUR_PASSWORD@db.trkgvxizmmhtvdfmgxnn.supabase.co:5432/postgres?sslmode=require"
```

---

## Option 3: Use Connection Pooler (More Reliable)

Sometimes direct connection fails. Use the pooler instead:

```bash
psql "postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

For your project:
```bash
psql "postgresql://postgres.trkgvxizmmhtvdfmgxnn:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

---

## Quick Export Command (Once Connected)

Once connected, run this to export old codes:

```sql
\COPY (SELECT * FROM cashback_codes WHERE "redeemed" = true AND "_createdAt" < '2024-01-01') TO 'old_codes.csv' WITH CSV HEADER;
```

Then delete them:
```sql
DELETE FROM cashback_codes WHERE "redeemed" = true AND "_createdAt" < '2024-01-01';
```

---

## Troubleshooting

### Error: "could not translate host name"
Your DNS can't resolve the hostname. Solutions:
1. Use Supabase CLI instead (Option 1)
2. Check your internet connection
3. Try using Google's DNS: 8.8.8.8

### Error: "timeout"
The database is overloaded. Try:
1. Off-peak hours (2-6 AM UTC)
2. Supabase CLI handles this better
3. Contact support to lift restrictions

### Error: "password authentication failed"
You have the wrong password. Get it from:
Supabase Dashboard → Project Settings → Database

---

## Recommended Next Steps

1. **Install Supabase CLI**: `brew install supabase/tap/supabase`
2. **Login**: `supabase login`
3. **Link project**: `supabase link --project-ref trkgvxizmmhtvdfmgxnn`
4. **Run cleanup**: `supabase db execute --file durapro-docs/database-cleanup-phase1.sql`

This is the most reliable method for your locked database.
