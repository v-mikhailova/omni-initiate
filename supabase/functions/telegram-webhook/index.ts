import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!TELEGRAM_BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const update = await req.json();
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));

    // Handle message
    if (update.message) {
      const message = update.message;
      const chat = message.chat;
      const from = message.from;
      const text = message.text || '';

      const phoneNumberRaw: string | null = message.contact?.phone_number ?? null;
      const phoneNumber = phoneNumberRaw
        ? (phoneNumberRaw.startsWith('+') ? phoneNumberRaw : `+${phoneNumberRaw}`)
        : null;

      console.log(
        `Message from chat_id: ${chat.id}, user: ${from.first_name} ${from.last_name || ''}, text: ${text}, phone: ${phoneNumber || 'n/a'}`
      );

      // Save user info to database
      const { data: existingUser, error: selectError } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('chat_id', String(chat.id))
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking user:', selectError);
      }

      if (!existingUser) {
        // Insert new user
        const { error: insertError } = await supabase
          .from('telegram_users')
          .insert({
            chat_id: String(chat.id),
            username: from.username || null,
            first_name: from.first_name || null,
            last_name: from.last_name || null,
            phone_number: phoneNumber,
          });

        if (insertError) {
          console.error('Error inserting user:', insertError);
        } else {
          console.log(`New user saved: chat_id=${chat.id}, name=${from.first_name}`);
        }
      } else {
        // Update existing user
        const { error: updateError } = await supabase
          .from('telegram_users')
          .update({
            username: from.username || existingUser.username,
            first_name: from.first_name || existingUser.first_name,
            last_name: from.last_name || existingUser.last_name,
            phone_number: phoneNumber || existingUser.phone_number,
            updated_at: new Date().toISOString(),
          })
          .eq('chat_id', String(chat.id));

        if (updateError) {
          console.error('Error updating user:', updateError);
        }
      }

      // If user shared phone number, confirm and remove keyboard
      if (phoneNumber) {
        const confirmMessage =
          `Номер телефона сохранен: <b>${phoneNumber}</b>\n` +
          `Теперь можно отправлять вам сообщения из приложения.`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chat.id,
            text: confirmMessage,
            parse_mode: 'HTML',
            reply_markup: { remove_keyboard: true },
          }),
        });
      }

      // If /start command, send welcome + request phone number
      if (text === '/start') {
        const welcomeMessage =
          `Привет, ${from.first_name}!\n\n` +
          `Ваш Telegram ID: <b>${chat.id}</b>\n\n` +
          `Чтобы связать Telegram с контактом в приложении, нажмите кнопку ниже и поделитесь номером телефона.`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chat.id,
            text: welcomeMessage,
            parse_mode: 'HTML',
            reply_markup: {
              keyboard: [[{ text: 'Поделиться номером телефона', request_contact: true }]],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          }),
        });

        console.log(`Sent welcome message to chat_id: ${chat.id}`);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in telegram-webhook:', errorMessage);
    
    // Always return 200 to Telegram to prevent retries
    return new Response(JSON.stringify({ ok: true, error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
