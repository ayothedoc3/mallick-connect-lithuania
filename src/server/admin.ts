import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only: never import this from browser code.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

let admin: SupabaseClient | undefined;

/** Supabase client with the service key: bypasses row level security. */
export function supabaseAdmin(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set on the server.");
  admin ??= createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}

/** Supabase client acting as the signed-in user who sent the request. */
export function supabaseAsUser(request: Request): SupabaseClient {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) throw new HttpError(401, "Please sign in first.");
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: auth } },
  });
}

export async function requireUser(request: Request) {
  const client = supabaseAsUser(request);
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new HttpError(401, "Please sign in again.");
  return { client, user: data.user };
}

export async function requireAdmin(request: Request) {
  const { client, user } = await requireUser(request);
  const { data, error } = await client.rpc("staff_role");
  if (error) throw error;
  if (data !== "admin") throw new HttpError(403, "Admins only.");
  return user;
}

export interface PrivateSettings {
  site_url: string;
  hooks_secret: string;
  auth_hook_secret: string;
  stripe_secret_key: string;
  stripe_webhook_secret: string;
  resend_api_key: string;
  email_from: string;
  notify_emails: string;
  telegram_bot_token: string;
  telegram_chat_id: string;
}

export async function getPrivateSettings(): Promise<PrivateSettings> {
  const { data, error } = await supabaseAdmin()
    .from("private_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data as PrivateSettings;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Runs a handler and turns thrown errors into JSON responses. */
export async function jsonHandler(fn: () => Promise<unknown>): Promise<Response> {
  try {
    return Response.json((await fn()) ?? { ok: true });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Something went wrong.";
    if (status === 500) console.error(err);
    return Response.json({ error: message }, { status });
  }
}

export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
