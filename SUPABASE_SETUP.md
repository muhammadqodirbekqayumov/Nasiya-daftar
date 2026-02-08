# Supabase (Backend) Sozlash Bo'yicha Qo'llanma

Ilovangiz ma'lumotlarini (mijozlar, qarzlar) internetda saqlash uchun [Supabase.com](https://supabase.com) dan foydalanamiz.

## 1. Ro'yxatdan o'tish
1.  [supabase.com/dashboard](https://supabase.com/dashboard) ga kiring.
2.  "New Project" tugmasini bosing.
3.  Name: `NasiyaDaftar`
4.  Password: (Eslab qoling)
5.  Region: "Frankfurt" (Yevropa eng yaqin va tez).
6.  "Create new project" bosib kuting (2 daqiqa).

## 2. API Kalitlarni Olish
Proyekt ochilgach:
1.  Project Settings (chap pastda) -> API bo'limiga kiring.
2.  `Project URL` va `anon public` keylarini ko'chirib oling.
3.  Ushbu ma'lumotlarni menga yuboring yoki `.env` faylga saqlaymiz.

## 3. Database (Jadvallar)
"SQL Editor" bo'limiga kiring va quyidagi kodni "New Query" ga tashlab, "Running" tugmasini bosing:

```sql
-- Mijozlar jadvali
create table customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  phone text,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tranzaksiyalar (Qarz/To'lov) jadvali
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  customer_id uuid references customers(id) on delete cascade not null,
  type text check (type in ('debt', 'payment')) not null,
  amount numeric not null,
  note text,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Xavfsizlik qoidalari (RLS)
alter table customers enable row level security;
alter table transactions enable row level security;

create policy "Users can view their own customers" on customers
  for select using (auth.uid() = user_id);

create policy "Users can insert their own customers" on customers
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own customers" on customers
  for update using (auth.uid() = user_id);

create policy "Users can delete their own customers" on customers
  for delete using (auth.uid() = user_id);

create policy "Users can view their own transactions" on transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions" on transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own transactions" on transactions
  for delete using (auth.uid() = user_id);
```

Bu kod ma'lumotlar bazasini yaratadi va faqat o'z egasiga ko'rsatishni ta'minlaydi.
