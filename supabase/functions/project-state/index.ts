import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js";
import StateV2 from "../../../src/models/StateV2.ts";

const responseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const get = async (
  id: string,
  supabaseClient: SupabaseClient,
): Promise<Response> => {
  console.log(`Fetching project with id '${id}'`);

  const { data, error } = await supabaseClient.from("Projects").select().eq(
    "id",
    id,
  );

  if (error || !data || data.length === 0) {
    return new Response(
      JSON.stringify({ message: "Not found" }),
      { headers: responseHeaders, status: 404 },
    );
  }

  return new Response(
    JSON.stringify(data[0]),
    { headers: responseHeaders, status: 200 },
  );
};

const post = async (
  id: string,
  state: StateV2,
  supabaseClient: SupabaseClient,
): Promise<Response> => {
  console.log(`Creating/updating project with id '${id}'`);

  // TODO: add validation

  const { error } = await supabaseClient.from("Projects").upsert({ id, state });

  if (error) {
    return new Response(
      JSON.stringify({
        message: `Could not create or update project with id '${id}'`,
      }),
      { headers: responseHeaders, status: 400 },
    );
  }

  return new Response(
    JSON.stringify({ message: "OK" }),
    { headers: responseHeaders, status: 200 },
  );
};

serve(async (req) => {
  const { url, method } = req;

  if (method === "OPTIONS") {
    return new Response("ok", { headers: responseHeaders });
  }

  const taskPattern = new URLPattern({ pathname: "/project-state/:id" });
  const matchingPath = taskPattern.exec(url);
  const id = matchingPath ? matchingPath.pathname.groups.id : null;

  if (!id) {
    return new Response(
      JSON.stringify({ message: "Parameter 'id' is required" }),
      { headers: responseHeaders, status: 400 },
    );
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: req.headers.get("Authorization")!,
        },
      },
    },
  );

  try {
    switch (method) {
      case "GET":
        return await get(id, supabaseClient);

      case "POST": {
        const body = await req.json() as StateV2;
        return await post(id, body, supabaseClient);
      }

      default:
        return new Response(
          JSON.stringify({ message: `Method not allowed: '${method}'` }),
          { headers: responseHeaders, status: 405 },
        );
    }
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { headers: responseHeaders, status: 500 },
    );
  }
});
