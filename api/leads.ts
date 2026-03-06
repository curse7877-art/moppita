type LeadInput = {
  name?: string;
  email?: string;
  phone?: string;
  cityState?: string;
  businessType?: string;
  city_state?: string;
  business_type?: string;
};

const allowedBusinessTypes = new Set(['revenda', 'empresa terceirizada', 'consumidor final']);

const getSupabaseConfig = () => {
  const rawBaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    process.env.SUPABASE_SECRET;

  if (!rawBaseUrl || !serviceRoleKey) {
    return null;
  }

  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  return {
    leadsUrl: `${baseUrl}/rest/v1/leads`,
    serviceRoleKey,
  };
};

const getSupabaseKeyRole = (key: string): string | null => {
  if (key.startsWith('sb_secret_')) {
    return 'service_role';
  }

  const parts = key.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
      role?: string;
    };
    return payload.role ?? null;
  } catch {
    return null;
  }
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
        'Backend nao configurado. Defina SUPABASE_URL e uma chave privada do Supabase na Vercel.',
    });
  }

  const keyRole = getSupabaseKeyRole(supabase.serviceRoleKey);
  if (keyRole === 'anon') {
    return res.status(500).json({
      error:
        'Configuracao invalida do Supabase. Use SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY na Vercel, nao a anon/public key.',
    });
  }

  if (req.method === 'POST') {
    try {
      const payload = readPayload(req.body);
      const name = payload.name?.trim();
      const email = payload.email?.trim();
      const phone = payload.phone?.trim();
      const cityState = payload.cityState?.trim() ?? payload.city_state?.trim();
      const businessType = payload.businessType?.trim() ?? payload.business_type?.trim();

      if (!name || !email || !phone || !cityState || !businessType) {
        return res.status(400).json({ error: 'Todos os campos sao obrigatorios' });
      }

      if (!allowedBusinessTypes.has(businessType)) {
        return res.status(400).json({ error: 'Ramo de atividade invalido' });
      }

      const response = await fetch(supabase.leadsUrl, {
        method: 'POST',
        headers: {
          apikey: supabase.serviceRoleKey,
          Authorization: `Bearer ${supabase.serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify([{ name, email, phone, city_state: cityState, business_type: businessType }]),
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
      `${supabase.leadsUrl}?select=id,name,email,phone,city_state,business_type,created_at&order=created_at.desc`,
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
