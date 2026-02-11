-- ============================================================
-- BU FAYLNI SUPABASE SQL EDITOR GA NUSXALAB, RUN TUGMASINI BOSING
-- ============================================================

-- 1. user_profiles jadvalining RLS (Xavfsizlik) siyosatlarini to'g'irlash
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Eski siyosatlarni o'chirish
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin full access" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin ko'ra oladi" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin o'zgartira oladi" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.user_profiles;

-- YANGI SIYOSATLAR (Eng muhim qism!)
-- Hamma ko'ra oladi (Admin barcha do'konlarni ko'rishi uchun)
CREATE POLICY "Hamma ko'ra oladi"
ON public.user_profiles FOR SELECT
USING (true);

-- Har bir foydalanuvchi o'z profilini yarata oladi
CREATE POLICY "O'z profilini yaratish"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Har bir foydalanuvchi o'z profilini yangilashi mumkin YOKI admin hamma profilni yangilashi mumkin
CREATE POLICY "Profilni yangilash"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id OR auth.jwt() ->> 'email' = 'admin@0707.com');

-- Admin o'chirishi mumkin
CREATE POLICY "Admin o'chirishi mumkin"
ON public.user_profiles FOR DELETE
USING (auth.jwt() ->> 'email' = 'admin@0707.com');

-- 2. customers jadvalining RLS siyosatlari
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own customers" ON public.customers;
CREATE POLICY "Users manage own customers"
ON public.customers FOR ALL
USING (auth.uid() = user_id);

-- 3. transactions jadvalining RLS siyosatlari
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own transactions" ON public.transactions;
CREATE POLICY "Users manage own transactions"
ON public.transactions FOR ALL
USING (auth.uid() = user_id);

-- 4. Ustunlar mavjudligini ta'minlash
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'created_at') THEN
        ALTER TABLE public.user_profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'subscription_end_date') THEN
        ALTER TABLE public.user_profiles ADD COLUMN subscription_end_date TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_blocked') THEN
        ALTER TABLE public.user_profiles ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'plain_password') THEN
        ALTER TABLE public.user_profiles ADD COLUMN plain_password TEXT;
    END IF;
END $$;
