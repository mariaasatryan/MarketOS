import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';
import { encrypt, decrypt } from '../utils/crypto';
import { env } from '../utils/env';
import { httpJSON } from '../adapters/http';

export async function googleRoutes(app: FastifyInstance) {
  app.get('/api/google/oauth/start', { preValidation: [app.auth] }, async (req:any, rep) => {
    const state = req.user.sub;
    const scope = encodeURIComponent(['https://www.googleapis.com/auth/calendar'].join(' '));
    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${env.GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.GOOGLE_OAUTH_REDIRECT_URI)}&scope=${scope}&access_type=offline&state=${state}&prompt=consent`;
    return rep.redirect(url);
  });

  app.get('/api/google/oauth/callback', async (req:any, rep) => {
    const q = z.object({ code: z.string(), state: z.string() }).parse(req.query);
    const tokenRes = await httpJSON('https://oauth2.googleapis.com/token', {
      method:'POST',
      headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: q.code,
        client_id: env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });
    const enc = await encrypt(JSON.stringify(tokenRes));
    await prisma.token.create({
      data: { userId: q.state, type: 'GOOGLE', encValue: enc }
    });
    return rep.redirect('/?google=connected');
  });

  // Пример выгрузки событий (из Google в нас)
  app.get('/api/google/calendar/pull', { preValidation: [app.auth] }, async (req:any) => {
    const tk = await prisma.token.findFirst({ where: { userId: req.user.sub, type: 'GOOGLE' }});
    if (!tk) return { ok:false, reason:'no-google-token' };
    const creds = JSON.parse(await decrypt(Buffer.from(tk.encValue)));
    const cal = await httpJSON('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      headers: { Authorization: `Bearer ${creds.access_token}` }
    });
    return cal;
  });
}