import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import getRawBody from 'raw-body';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CHANNEL_SECRET = 'd28b8f3773d5aa3c85055a7e1011119a';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const bodyText = await getRawBody(req.body as any, {
    encoding: true,
  });

  const signature = req.headers.get('x-line-signature') || '';

  const hash = crypto
    .createHmac('SHA256', CHANNEL_SECRET)
    .update(bodyText)
    .digest('base64');

  if (signature !== hash) {
    return new Response('Invalid signature', { status: 401 });
  }

  const body = JSON.parse(bodyText.toString());
  const event = body.events?.[0];

  if (!event || event.type !== 'message') {
    return new Response('No message event', { status: 200 });
  }

  const userId = event.source.userId;
  const phone = event.message.text.trim();

  const { error } = await supabase
    .from('users')
    .update({ line_user_id: userId })
    .eq('phone', phone);

  if (error) {
    console.error('Supabase update error:', error);
    return new Response('Failed to update user', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}
