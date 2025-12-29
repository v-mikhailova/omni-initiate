-- Create table to store Telegram users who started the bot
CREATE TABLE public.telegram_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id TEXT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for matching contacts)
CREATE POLICY "Anyone can view telegram users" 
ON public.telegram_users 
FOR SELECT 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_telegram_users_chat_id ON public.telegram_users(chat_id);
CREATE INDEX idx_telegram_users_phone ON public.telegram_users(phone_number);