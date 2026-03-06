import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle,
  Download,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  city_state: string | null;
  business_type: string | null;
  created_at: string;
};

const leadsApiUrl = '/api/leads';
const businessTypeOptions = ['revenda', 'empresa terceirizada', 'consumidor final'];

function Landing() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cityState, setCityState] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(leadsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, cityState, businessType }),
      });
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const statusLabel = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`;
        let details = '';
        try {
          const raw = await response.text();
          if (raw) {
            try {
              const errorPayload = JSON.parse(raw) as { error?: string; details?: string };
              details = errorPayload.details ?? errorPayload.error ?? raw;
            } catch {
              details = raw;
            }
          }
        } catch {
          // noop
        }
        const compactDetails = details.replace(/\s+/g, ' ').trim().slice(0, 240);
        alert(
          compactDetails
            ? `Erro ao enviar (${statusLabel}): ${compactDetails}`
            : `Erro ao enviar (${statusLabel}).`,
        );
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Falha inesperada de rede';
      alert(`Erro de conexao: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    window.open('/ebook-moppita-higiene-corporativa.pdf', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-yellow-400 selection:text-blue-900">
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-blue-950">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=80"
            alt="Profissional realizando limpeza em ambiente corporativo"
            className="w-full h-full object-cover opacity-35 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/90 to-cyan-900/60"></div>

          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20"></div>
        </div>

        <nav className="absolute top-0 left-0 right-0 z-20 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <img
            src="/logomoppita.png"
            alt="Logo Moppita"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 mt-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-yellow-400 text-sm font-bold uppercase tracking-wider">
              <Star className="w-4 h-4 fill-current" /> Ebook Corporativo Gratuito
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
              A Importancia da <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                Higiene Corporativa
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100/80 leading-relaxed max-w-2xl font-light">
              Profissionalizando a higiene e limpeza na sua empresa. Um guia completo para transformar o seu ambiente
              de trabalho, garantir conformidade e aumentar a produtividade.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                'Normas e Legislacao (NR 24 e NR 32)',
                'Processos de limpeza eficientes',
                'Selecao de produtos sustentaveis',
                'Treinamento e engajamento de equipes',
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-800/50 flex items-center justify-center border border-blue-700/50 flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-blue-50 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 z-20 bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 hidden sm:flex border border-slate-100"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="text-blue-700 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Foco B2B</p>
                <p className="text-xs text-slate-500">Para Gestores e RH</p>
              </div>
            </motion.div>

            <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-2xl relative z-10 border border-slate-100">
              {!isSubmitted ? (
                <>
                  <div className="mb-8">
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Baixe o Ebook</h3>
                    <p className="text-slate-500 font-medium">
                      Preencha os dados para receber o material completo em PDF.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all text-slate-800 font-medium placeholder:font-normal"
                        placeholder="Seu Nome Completo"
                      />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all text-slate-800 font-medium placeholder:font-normal"
                        placeholder="Seu E-mail Corporativo"
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        inputMode="numeric"
                        maxLength={15}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all text-slate-800 font-medium placeholder:font-normal"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        value={cityState}
                        onChange={(e) => setCityState(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all text-slate-800 font-medium placeholder:font-normal"
                        placeholder="Cidade - Estado"
                      />
                    </div>

                    <div className="relative">
                      <BriefcaseBusiness className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                      <select
                        required
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all text-slate-800 font-medium appearance-none"
                      >
                        <option value="" disabled>
                          Selecione o ramo de atividade
                        </option>
                        {businessTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-extrabold text-lg py-4 px-6 rounded-xl transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-yellow-400/30 flex justify-center items-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? 'Enviando...' : 'Acessar o Material'}
                      {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <p className="text-xs text-center text-slate-400 mt-4 font-medium flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Seus dados estao 100% seguros conosco.
                    </p>
                  </form>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-50"></div>
                    <CheckCircle className="w-12 h-12 text-green-500 relative z-10" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Tudo certo!</h3>
                  <p className="text-slate-600 mb-8 text-lg font-medium">
                    O guia completo para profissionalizar a higiene da sua empresa ja esta disponivel.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-blue-600/30 flex justify-center items-center gap-2"
                  >
                    Baixar PDF Agora <Download className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-24 overflow-hidden bg-gradient-to-b from-slate-100 via-cyan-50 to-blue-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 left-8 w-80 h-80 rounded-full bg-cyan-200/45 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] rounded-full bg-blue-200/40 blur-3xl"></div>
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:18px_18px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">O que voce vai aprender neste Ebook?</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
              Insights valiosos e estrategias praticas baseadas na experiencia da Moppita no mercado corporativo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: ShieldCheck,
                title: 'Conformidade Legal',
                desc: 'Entenda a fundo as normas regulamentadoras (como NR 24 e NR 32) e proteja sua empresa de penalidades e riscos trabalhistas.',
                color: 'blue',
              },
              {
                icon: TrendingUp,
                title: 'Impacto no Cliente',
                desc: 'Descubra como um ambiente impecavel aumenta a satisfacao, fidelizacao e constroi uma reputacao solida para a sua marca.',
                color: 'yellow',
              },
              {
                icon: Leaf,
                title: 'Sustentabilidade',
                desc: 'Aprenda a selecionar produtos eco-friendly e a implementar praticas eficientes que preservam o meio ambiente e reduzem custos.',
                color: 'blue',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white/85 backdrop-blur-sm p-8 rounded-3xl border border-white/70 transition-all hover:shadow-xl hover:bg-white group"
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${feature.color === 'blue' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-400 group-hover:text-blue-950'}`}
                >
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <img
            src="/logomoppita.png"
            alt="Logo Moppita"
            className="h-8 sm:h-10 w-auto object-contain"
          />
          <p className="font-medium text-sm">
            &copy; {new Date().getFullYear()} Moppita. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Admin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const fetchLeads = async (token: string) => {
    setLoading(true);
    setAuthError('');
    try {
      const response = await fetch(leadsApiUrl, {
        headers: {
          Authorization: `Basic ${token}`,
        },
      });

      if (response.status === 401) {
        setAuthToken(null);
        sessionStorage.removeItem('adminAuth');
        setAuthError('Usuario ou senha invalidos.');
        setLeads([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao buscar leads');
      }

      const data = (await response.json()) as Lead[];
      setLeads(data);
    } catch (error) {
      console.error(error);
      setAuthError('Falha ao carregar leads. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem('adminAuth');
    if (!storedToken) {
      return;
    }
    setAuthToken(storedToken);
    fetchLeads(storedToken);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = btoa(`${username}:${password}`);
    sessionStorage.setItem('adminAuth', token);
    setAuthToken(token);
    await fetchLeads(token);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setAuthToken(null);
    setLeads([]);
    setUsername('');
    setPassword('');
  };

  if (!authToken) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 font-sans">
        <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-2">
            <Lock className="text-blue-600 w-6 h-6" />
            Acesso ao Admin
          </h1>
          <p className="text-slate-500 mb-6">Informe usuario e senha para ver os leads capturados.</p>
          {authError && <p className="text-red-600 text-sm mb-4">{authError}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
              placeholder="Usuario"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
              placeholder="Senha"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              Entrar
            </button>
          </form>

          <Link to="/" className="inline-block mt-6 text-blue-600 hover:text-blue-800 font-medium">
            Voltar para a Landing Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="text-blue-600 w-8 h-8" />
              Leads Capturados
            </h1>
            <p className="text-slate-500 mt-1">Acompanhe as pessoas que baixaram o ebook.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-slate-700 hover:text-slate-900 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
            >
              Sair
            </button>
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg transition-colors">
              Voltar para a Landing Page
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Carregando leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Nenhum lead capturado ainda.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-semibold text-slate-700">Nome</th>
                    <th className="p-4 font-semibold text-slate-700">E-mail</th>
                    <th className="p-4 font-semibold text-slate-700">WhatsApp</th>
                    <th className="p-4 font-semibold text-slate-700">Cidade - Estado</th>
                    <th className="p-4 font-semibold text-slate-700">Ramo de Atividade</th>
                    <th className="p-4 font-semibold text-slate-700">Data de Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-800 font-medium">{lead.name}</td>
                      <td className="p-4 text-slate-600">{lead.email}</td>
                      <td className="p-4 text-slate-600">{lead.phone}</td>
                      <td className="p-4 text-slate-600">{lead.city_state ?? '-'}</td>
                      <td className="p-4 text-slate-600">{lead.business_type ?? '-'}</td>
                      <td className="p-4 text-slate-500 text-sm">{new Date(lead.created_at).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}


