type LeadInput = {
  name?: string;
  email?: string;
  phone?: string;
};

const jsonResponse = (statusCode: number, payload: unknown) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(payload),
});

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

export const handler = async (event: {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
  isBase64Encoded?: boolean;
}) => {
  const supabase = getSupabaseConfig();

  if (!supabase) {
    return jsonResponse(500, {
      error:
        'Backend nao configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SERVICE_KEY/SUPABASE_KEY) na Netlify.',
    });
  }

  if (event.httpMethod === 'POST') {
    try {
      const rawBody = event.body
        ? event.isBase64Encoded
          ? Buffer.from(event.body, 'base64').toString('utf8')
          : event.body
        : '{}';
      const payload = JSON.parse(rawBody) as LeadInput;
      const name = payload.name?.trim();
      const email = payload.email?.trim();
      const phone = payload.phone?.trim();

      if (!name || !email || !phone) {
        return jsonResponse(400, { error: 'Todos os campos sao obrigatorios' });
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
        return jsonResponse(500, { error: 'Erro ao salvar o lead', details });
      }

      const insertedRows = (await response.json()) as Array<{ id: number }>;
      return jsonResponse(200, { success: true, id: insertedRows[0]?.id ?? null });
    } catch {
      return jsonResponse(400, { error: 'Payload invalido' });
    }
  }

  if (event.httpMethod === 'GET') {
    const authorizationHeader = event.headers.authorization ?? event.headers.Authorization;
    if (!isAdminAuthorized(authorizationHeader)) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'WWW-Authenticate': 'Basic realm="Moppita Admin"',
        },
        body: JSON.stringify({ error: 'Nao autorizado' }),
      };
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
      return jsonResponse(500, { error: 'Erro ao buscar leads', details });
    }

    const leads = await response.json();
    return jsonResponse(200, leads);
  }

  return jsonResponse(405, { error: 'Metodo nao permitido' });
};

