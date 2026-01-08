// src/routes/auth/discord/callback/+server.js
import { db } from '$lib/server/db';
import crypto from 'crypto';
import { redirect } from '@sveltejs/kit';
import {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI
} from '$env/static/private';

export const GET = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');

    // 1️⃣ Token Discord
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: DISCORD_REDIRECT_URI
        })
    });


    const token = await tokenRes.json();

    // 2️⃣ Infos utilisateur
    const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: {
            Authorization: `Bearer ${token.access_token}`
        }
    });

    const discordUser = await userRes.json();
    console.log(discordUser);

    // 3️⃣ Upsert user
    const displayName = discordUser.global_name ?? discordUser.username;

    const [res] = await db.query(
        `INSERT INTO users (discord_id, username, avatar, displayname)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       username = VALUES(username),
       avatar = VALUES(avatar),
       displayname = VALUES(displayname)`,
        [discordUser.id, discordUser.username, discordUser.avatar, displayName]
    );

    let userId;

    if (res.insertId) {
        userId = res.insertId;
    } else {
        // récupère l'id existant
        const [rows] = await db.query('SELECT id FROM users WHERE discord_id = ?', [discordUser.id]);
        userId = rows[0].id;
    }

    // 4️⃣ Session
    const sessionId = crypto.randomBytes(32).toString('hex');
    await db.query(
        'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
        [sessionId, userId]
    );

    cookies.set('session', sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false // true en prod
    });

    throw redirect(302, '/dashboard');
};
