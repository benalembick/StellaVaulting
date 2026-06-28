// Manages admin accounts (invite / list / remove) using the service role key.
// This must run server-side only — never ship the service role key to the browser.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const siteUrl = Deno.env.get('SITE_URL')

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing authorization header' }, 401)

    // Client scoped to the caller's own token, used only to identify them.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await callerClient.auth.getUser()
    if (userError || !user) return json({ error: 'Invalid session' }, 401)

    // Privileged client for everything else.
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: caller } = await adminClient
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!caller) return json({ error: 'Forbidden' }, 403)

    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from('admin_users')
        .select('id, user_id, email, created_at')
        .order('created_at', { ascending: true })
      if (error) throw error
      return json({ admins: data })
    }

    if (req.method === 'POST') {
      const { email } = await req.json()
      if (!email || typeof email !== 'string') {
        return json({ error: 'Email is required' }, 400)
      }

      const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        email,
        siteUrl ? { redirectTo: `${siteUrl}/admin/reset-password` } : undefined,
      )
      if (inviteError) throw inviteError

      const { error: insertError } = await adminClient
        .from('admin_users')
        .insert({ user_id: invited.user.id, email })
      if (insertError) throw insertError

      return json({ success: true })
    }

    if (req.method === 'DELETE') {
      const { id } = await req.json()
      if (!id) return json({ error: 'id is required' }, 400)

      const { data: target } = await adminClient
        .from('admin_users')
        .select('user_id')
        .eq('id', id)
        .single()
      if (!target) return json({ error: 'Admin not found' }, 404)
      if (target.user_id === user.id) {
        return json({ error: 'You cannot remove your own admin access' }, 400)
      }

      const { error: deleteRowError } = await adminClient.from('admin_users').delete().eq('id', id)
      if (deleteRowError) throw deleteRowError

      // Best-effort: also disable sign-in for the removed admin's account.
      await adminClient.auth.admin.deleteUser(target.user_id)

      return json({ success: true })
    }

    return json({ error: 'Method not allowed' }, 405)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500)
  }
})
