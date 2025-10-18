import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import pino from 'pino';
import { registerRoutes } from './routes';
import { env } from './utils/env';

const app = Fastify({ logger: pino({ transport: { target: 'pino-pretty' }}) });

await app.register(cors, { origin: true, credentials: true });
await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });
await app.register(jwt, { secret: env.JWT_SECRET });

app.decorate('auth', async (req:any, _rep:any) => {
  await req.jwtVerify();
});

registerRoutes(app);

const port = 4000;
app.listen({ port }).then(()=> app.log.info(`API on http://localhost:${port}`));

import { initCrypto } from './utils/crypto';
await initCrypto(env.ENCRYPTION_KEY_BASE64);