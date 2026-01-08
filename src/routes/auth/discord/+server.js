// src/routes/auth/discord/+server.js
import { redirect } from '@sveltejs/kit';
import { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } from '$env/static/private';

export const GET = async () => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify'
  });

  throw redirect(
    302,
    `https://discord.com/oauth2/authorize?${params.toString()}`
  );
};
