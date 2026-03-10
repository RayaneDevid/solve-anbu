import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BCRYPT_ROUNDS = 10;
const CODE_REGEX = /^ANBU-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { rp_name, codename, password, registration_code } = await req.json();

    // Validate input
    if (!rp_name?.trim() || !codename?.trim() || !password || !registration_code?.trim()) {
      return jsonResponse({ error: "Tous les champs sont requis" }, 400);
    }

    const cleanCode = registration_code.trim().toUpperCase();
    if (!CODE_REGEX.test(cleanCode)) {
      return jsonResponse({ error: "Format de code invalide" }, 400);
    }

    if (password.length < 6) {
      return jsonResponse({ error: "Le mot de passe doit faire au moins 6 caractères" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check codename availability (among non-deactivated)
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("codename", codename.trim())
      .in("status", ["active", "pending"])
      .single();

    if (existingUser) {
      return jsonResponse({ error: "Ce pseudo ANBU est déjà utilisé" }, 409);
    }

    // Validate registration code
    const { data: regCode, error: codeError } = await supabaseAdmin
      .from("registration_codes")
      .select("id, status")
      .eq("code", cleanCode)
      .single();

    if (codeError || !regCode) {
      return jsonResponse({ error: "Code d'inscription invalide" }, 400);
    }

    if (regCode.status !== "available") {
      return jsonResponse({ error: "Ce code a déjà été utilisé ou révoqué" }, 400);
    }

    // Hash password
    const password_hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);

    // Create user
    const { data: newUser, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        rp_name: rp_name.trim(),
        codename: codename.trim(),
        password_hash,
        role: "anbu",
        status: "pending",
        registration_code_id: regCode.id,
      })
      .select("id, codename, status")
      .single();

    if (userError) {
      return jsonResponse({ error: "Erreur lors de la création du compte" }, 500);
    }

    // Mark code as used
    await supabaseAdmin
      .from("registration_codes")
      .update({ status: "used", used_by: newUser.id, used_at: new Date().toISOString() })
      .eq("id", regCode.id);

    return jsonResponse({
      message: "Inscription réussie — en attente de validation",
      user: {
        id: newUser.id,
        codename: newUser.codename,
        status: newUser.status,
      },
    }, 201);
  } catch (_err) {
    return jsonResponse({ error: "Erreur serveur" }, 500);
  }
});
