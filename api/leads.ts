type LeadInput = {
  name?: string;
  email?: string;
  phone?: string;
};

const getSupabaseConfig = () => {
  const rawBaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    process.env.SUPABASE_KEY;

  if (!rawBaseUrl || !serviceRoleKey) {
    return null;
  }

  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  return {
    leadsUrl: `${baseUrl}/rest/v1/leads`,
    serviceRoleKey,
  };
};

const isAdminAuthorized = (authorizationHeader: string | undefined): boolean => {
  const adminUser = process.env.ADMIN_USER ?? 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'moppita123';

  if (!authorizationHeader?.startsWith('Basic ')) {
    return false;
  }

  try {
    const encodedCredentials = authorizationHeader.slice('Basic '.length);
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf8');
    const separatorIndex = decodedCredentials.indexOf(':');
    if (separatorIndex < 0) {
      return false;
    }

    const username = decodedCredentials.slice(0, separatorIndex);
    const password = decodedCredentials.slice(separatorIndex + 1);
    return username === adminUser && password === adminPassword;
  } catch {
    return false;
  }
};

const readPayload = (body: unknown): LeadInput => {
  if (!body) {
    return {};
  }

  if (typeof body === 'string') {
    return JSON.parse(body) as LeadInput;
  }

  return body as LeadInput;
};

export default async function handler(req: any, res: any) {
  const supabase = getSupabaseConfig();

  if (!supabase) {
    return res.status(500).json({
      error:
        'Backend nao configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SERVICE_KEY/SUPABASE_KEY) na Vercel.',
    });
  }

  if (req.method === 'POST') {
    try {
      const payload = readPayload(req.body);
      const name = payload.name?.trim();
      const email = payload.email?.trim();
      const phone = payload.phone?.trim();

      if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Todos os campos sao obrigatorios' });
      }

      const response = await fetch(supabase.leadsUrl, {
        method: 'POST',
        headers: {
          apikey: supabase.serviceRoleKey,
          Authorization: `Bearer ${supabase.serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify([{ name, email, phone }]),
      });

      if (!response.ok) {
        const details = await response.text();
        return res.status(500).json({ error: 'Erro ao salvar o lead', details });
      }

      const insertedRows = (await response.json()) as Array<{ id: number }>;
      return res.status(200).json({ success: true, id: insertedRows[0]?.id ?? null });
    } catch {
      return res.status(400).json({ error: 'Payload invalido' });
    }
  }

  if (req.method === 'GET') {
    if (!isAdminAuthorized(req.headers.authorization)) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Moppita Admin"');
      return res.status(401).json({ error: 'Nao autorizado' });
    }

    const response = await fetch(
      `${supabase.leadsUrl}?select=id,name,email,phone,created_at&order=created_at.desc`,
      {
        headers: {
          apikey: supabase.serviceRoleKey,
          Authorization: `Bearer ${supabase.serviceRoleKey}`,
        },
      },
    );

    if (!response.ok) {
      const details = await response.text();
      return res.status(500).json({ error: 'Erro ao buscar leads', details });
    }

    const leads = await response.json();
    return res.status(200).json(leads);
  }

  return res.status(405).json({ error: 'Metodo nao permitido' });
}
