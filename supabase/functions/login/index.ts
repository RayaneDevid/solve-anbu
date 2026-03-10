import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";
import { create } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
const JWT_KEY = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(JWT_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"],
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { codename, password } = await req.json();

    if (!codename || !password) {
      return jsonResponse({ error: "Pseudo ANBU et mot de passe requis" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find active or pending user by codename (exclude deactivated)
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, codename, rp_name, password_hash, role, status")
      .eq("codename", codename)
      .in("status", ["active", "pending"])
      .single();

    if (error || !user) {
      return jsonResponse({ error: "Identifiants invalides" }, 401);
    }

    // Verify password
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return jsonResponse({ error: "Identifiants invalides" }, 401);
    }

    // Generate JWT
    const now = Math.floor(Date.now() / 1000);
    const token = await create(
      { alg: "HS256", typ: "JWT" },
      {
        aud: "authenticated",
        role: "authenticated",
        sub: user.id,
        user_role: user.role,
        codename: user.codename,
        iss: "supabase",
        iat: now,
        exp: now + 60 * 60 * 24 * 7, // 7 days
      },
      JWT_KEY,
    );

    return jsonResponse({
      token,
      user: {
        id: user.id,
        codename: user.codename,
        rp_name: user.rp_name,
        role: user.role,
        status: user.status,
      },
    }, 200);
  } catch (_err) {
    return jsonResponse({ error: "Erreur serveur" }, 500);
  }
});
