import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import getRawBody from 'raw-body';
import crypto from 'crypto';
import { Readable } from 'stream';

const CHANNEL_SECRET = 'd28b8f3773d5aa3c85055a7e1011119a';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  if (!req.body) {
    return new Response('Missing body', { status: 400 });
  }

  try {
    // ✅ 最穩定的方式：跳過型別檢查
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const readable = Readable.fromWeb(req.body as any);

    const bodyText = await getRawBody(readable, {
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
    const events = body.events || [];

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Webhook Error]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
