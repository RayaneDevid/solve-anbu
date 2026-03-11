import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";
import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

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
    // Verify JWT from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Non autorisé" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    let payload: { sub?: string };
    try {
      payload = await verify(token, JWT_KEY) as { sub?: string };
    } catch {
      return jsonResponse({ error: "Token invalide" }, 401);
    }

    const userId = payload.sub;
    if (!userId) {
      return jsonResponse({ error: "Token invalide" }, 401);
    }

    const { current_password, new_password } = await req.json();

    if (!current_password || !new_password) {
      return jsonResponse({ error: "Mot de passe actuel et nouveau mot de passe requis" }, 400);
    }

    if (new_password.length < 6) {
      return jsonResponse({ error: "Le nouveau mot de passe doit faire au moins 6 caractères" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch user
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, password_hash")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return jsonResponse({ error: "Utilisateur introuvable" }, 404);
    }

    // Verify current password
    const valid = bcrypt.compareSync(current_password, user.password_hash);
    if (!valid) {
      return jsonResponse({ error: "Mot de passe actuel incorrect" }, 401);
    }

    // Hash new password and update
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(new_password, salt);

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password_hash: newHash })
      .eq("id", userId);

    if (updateError) {
      return jsonResponse({ error: "Erreur lors de la mise à jour" }, 500);
    }

    return jsonResponse({ message: "Mot de passe modifié avec succès" }, 200);
  } catch (_err) {
    return jsonResponse({ error: "Erreur serveur" }, 500);
  }
});
