import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  BrainCircuit,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  LogIn,
  Menu,
  MessageSquareText,
  Newspaper,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserRound,
  X
} from 'lucide-react';
import {
  fallbackCareerResult,
  mockEnterprises,
  mockExcursions,
  mockNews,
  mockPlatform,
  testQuestions
} from './api_mock.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const YANDEX_FEEDBACK_URL = 'https://forms.yandex.ru/cloud/industrial-tourist-feedback-demo/';
const demoStudentProfile = {
  className: '9Б',
  school: 'МБОУ Лицей № 21, г. Киров',
  gisUpdated: 'Сегодня, 08:40',
  skills: [
    { label: 'Математика', shortLabel: 'Математика', value: 86 },
    { label: 'Физика', shortLabel: 'Физика', value: 82 },
    { label: 'Информатика', shortLabel: 'Информатика', value: 91 },
    { label: 'Русский язык', shortLabel: 'Русский', value: 74 },
    { label: 'Командная работа', shortLabel: 'Команда', value: 78 },
    { label: 'Инициативность', shortLabel: 'Инициатива', value: 72 }
  ],
  grades: [
    { subject: 'Математика', value: '5', trend: '+0,3' },
    { subject: 'Физика', value: '5', trend: '+0,2' },
    { subject: 'Информатика', value: '5', trend: '+0,4' },
    { subject: 'Русский язык', value: '4', trend: '+0,1' }
  ],
  olympiads: [
    { title: 'Инженерная олимпиада', level: 'Городской этап', result: 'Призёр' },
    { title: 'Шаг в будущее', level: 'Школьный этап', result: 'Участник' }
  ],
  activities: [
    { title: 'Робототехника', detail: '2 года, проектный трек' },
    { title: 'Школьный медиацентр', detail: 'Командная работа' },
    { title: 'Хакатон «Умный город»', detail: 'Финалист команды' }
  ],
  visitedExcursions: [
    {
      enterprise: 'АО «ЛЕПСЕ»',
      date: '18 апреля 2026',
      rating: 5,
      knowledge: 'Автоматизация, контроль качества, промышленная безопасность'
    },
    {
      enterprise: 'АО «Кировский машзавод 1 Мая»',
      date: '12 марта 2026',
      rating: 4,
      knowledge: 'Проектирование, металлообработка, работа инженера'
    }
  ],
  testHistory: [
    { title: 'Инженерный профиль', date: '20 мая 2026', result: 'Автоматизация производств', source: 'Встроенный' },
    { title: 'Профессиональные интересы', date: '4 марта 2026', result: 'Техника и технологии', source: 'Внешний' }
  ]
};

const tabs = [
  { id: 'platform', label: 'Платформа', icon: LayoutDashboard },
  { id: 'enterprises', label: 'Предприятия', icon: Building2, keyModule: true },
  { id: 'news', label: 'Новости', icon: Newspaper },
  { id: 'schedule', label: 'Расписание', icon: CalendarDays, keyModule: true },
  { id: 'test', label: 'Тест', icon: GraduationCap, keyModule: true },
  { id: 'passport', label: 'Мой цифровой паспорт', icon: FileText, requiresAuth: true },
  { id: 'feedback', label: 'Обратная связь', icon: MessageSquareText, requiresAuth: true },
  { id: 'admin', label: 'Админка', icon: ShieldCheck, adminOnly: true }
];

function formatDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function summarize(value = '', limit = 360) {
  return value.length > limit ? `${value.slice(0, limit).trim()}...` : value;
}

function websiteUrl(value = '') {
  const website = value.trim();
  if (!website || website === '-' || !website.includes('.')) return '';
  return website.startsWith('http') ? website : `https://${website}`;
}

async function getJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(`API ${path}: ${response.status}`);
  return response.json();
}

async function postJson(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`API ${path}: ${response.status}`);
  return response.json();
}

async function deleteJson(path) {
  const response = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`API ${path}: ${response.status}`);
  return response.json();
}

function IconButton({ children, className = '', ...props }) {
  return (
    <button
      className={`focus-ring inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal px-4 text-sm font-bold text-white transition hover:bg-[#0b6862] disabled:cursor-not-allowed disabled:bg-[#9bb8b4] ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

function TextInput(props) {
  return (
    <input
      className="focus-ring h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-[#77837b]"
      {...props}
    />
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4">
      <section className="max-h-[92vh] w-full max-w-xl overflow-auto rounded-lg bg-paper p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          <IconButton aria-label="Закрыть" title="Закрыть" onClick={onClose} className="px-0">
            <X size={18} />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <p className="text-sm text-[#66736c]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('platform');
  const [navOpen, setNavOpen] = useState(false);
  const [platform, setPlatform] = useState(mockPlatform);
  const [enterprises, setEnterprises] = useState(mockEnterprises);
  const [excursions, setExcursions] = useState(mockExcursions);
  const [news, setNews] = useState(mockNews);
  const [apiMode, setApiMode] = useState('demo');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('industrial-passport-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [bookingTarget, setBookingTarget] = useState(null);
  const [bookingForm, setBookingForm] = useState({ visitor_name: '', email: '', phone: '' });
  const [confirmation, setConfirmation] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [answers, setAnswers] = useState({});
  const [testStep, setTestStep] = useState(0);
  const [careerResult, setCareerResult] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, impressions: '', yandexCompleted: false });
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [enterpriseQuery, setEnterpriseQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('Все отрасли');
  const [cityFilter, setCityFilter] = useState('Все города');
  const [scheduleProfile, setScheduleProfile] = useState('all');

  useEffect(() => {
    let mounted = true;
    Promise.all([getJson('/platform'), getJson('/enterprises'), getJson('/excursions'), getJson('/news')])
      .then(([platformData, enterpriseData, excursionData, newsData]) => {
        if (!mounted) return;
        setPlatform(platformData);
        setEnterprises(enterpriseData);
        setExcursions(excursionData);
        setNews(newsData);
        setApiMode('api');
      })
      .catch(() => setApiMode('demo'));
    return () => {
      mounted = false;
    };
  }, []);

  const freeSeats = useMemo(
    () => excursions.reduce((sum, item) => sum + Math.max(item.seats_total - item.seats_taken, 0), 0),
    [excursions]
  );
  const industries = useMemo(() => ['Все отрасли', ...new Set(enterprises.map((item) => item.industry).filter(Boolean))], [enterprises]);
  const cities = useMemo(() => ['Все города', ...new Set(enterprises.map((item) => item.city).filter(Boolean))], [enterprises]);
  const filteredEnterprises = useMemo(() => {
    const query = enterpriseQuery.trim().toLowerCase();
    return enterprises.filter((item) => {
      const matchesQuery = !query || `${item.title} ${item.description} ${item.city}`.toLowerCase().includes(query);
      const matchesIndustry = industryFilter === 'Все отрасли' || item.industry === industryFilter;
      const matchesCity = cityFilter === 'Все города' || item.city === cityFilter;
      return matchesQuery && matchesIndustry && matchesCity;
    });
  }, [cities, enterprises, enterpriseQuery, industryFilter, cityFilter]);
  const filteredExcursions = useMemo(
    () => excursions.filter((item) => scheduleProfile === 'all' || item.profile === scheduleProfile),
    [excursions, scheduleProfile]
  );

  function saveUser(nextUser) {
    setUser(nextUser);
    localStorage.setItem('industrial-passport-user', JSON.stringify(nextUser));
  }

  async function submitRegister(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const created = await postJson('/auth/register', payload);
      saveUser({ ...payload, ...created });
    } catch {
      saveUser({
        id: Date.now(),
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        class_name: payload.class_name,
        school: payload.school
      });
    }
    setRegisterOpen(false);
  }

  function submitLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const identifier = String(form.get('identifier') || '').trim();
    const isAdmin = identifier.toLowerCase() === 'admin' || identifier.toLowerCase() === 'admin@demo.ru';
    saveUser({
      id: isAdmin ? 1 : Date.now(),
      full_name: isAdmin ? 'Администратор' : 'Алексей Смирнов',
      email: identifier.includes('@') ? identifier : `${identifier || 'user'}@demo.ru`,
      phone: '',
      isAdmin,
      class_name: demoStudentProfile.className,
      school: demoStudentProfile.school
    });
    setLoginOpen(false);
  }

  async function submitCareerTest() {
    const values = testQuestions.map((question) => answers[question.id]).filter(Boolean);
    if (values.length !== testQuestions.length) return;
    try {
      const result = await postJson('/career-test', { user_id: user?.id, answers: values });
      setCareerResult(result);
    } catch {
      setCareerResult(fallbackCareerResult(values));
    }
    if (user) setActiveTab('passport');
    else setLoginOpen(true);
  }

  function openBooking(excursion) {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setBookingTarget(excursion);
    setBookingForm({
      visitor_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
  }

  async function submitBooking(event) {
    event.preventDefault();
    const payload = { ...bookingForm, user_id: user?.id, excursion_id: bookingTarget.id };
    let savedBooking;
    try {
      savedBooking = await postJson('/bookings', payload);
    } catch {
      savedBooking = {
        id: Date.now(),
        status: 'confirmed',
        enterprise: bookingTarget.enterprise_title,
        address: bookingTarget.address,
        starts_at: bookingTarget.starts_at,
        guide_comment: bookingTarget.guide_comment,
        safety_note: bookingTarget.safety_note
      };
    }
    setConfirmation(savedBooking);
    setBookingTarget(null);
    setBookings((current) => [...current, { ...savedBooking, ...payload }]);
    setActiveTab('passport');
  }

  async function cancelBooking(id) {
    try {
      await deleteJson(`/bookings/${id}`);
    } catch {
      // Автономный демо-режим сохраняет отмену только в текущей сессии.
    }
    setBookings((current) => current.map((item) => (item.id === id ? { ...item, status: 'cancelled_by_user' } : item)));
    if (confirmation?.id === id) setConfirmation((current) => ({ ...current, status: 'cancelled_by_user' }));
  }

  async function submitFeedback(event) {
    event.preventDefault();
    if (!feedbackForm.rating || !feedbackForm.impressions.trim()) return;
    const payload = {
      booking_id: confirmation?.id || null,
      rating: feedbackForm.rating,
      impressions: feedbackForm.impressions.trim(),
      yandex_completed: feedbackForm.yandexCompleted
    };
    try {
      const saved = await postJson('/feedback', payload);
      setFeedbackResult(saved);
    } catch {
      setFeedbackResult({ id: Date.now(), ...payload, created_at: new Date().toISOString() });
    }
    setActiveTab('passport');
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-[#dce3f2] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton className="lg:hidden" aria-label="Меню" title="Меню" onClick={() => setNavOpen(true)}>
              <Menu size={18} />
            </IconButton>
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#2858d6] text-sm font-black text-white">
              ЦП
            </div>
            <div className="min-w-0">
              <h1 className="max-w-[230px] text-sm font-bold leading-tight text-[#192235] sm:max-w-[330px] sm:text-base">
                Цифровой паспорт промышленного туриста
              </h1>
              <p className="hidden text-xs font-medium text-[#7a8496] sm:block">Профориентационная платформа</p>
            </div>
          </div>
          <div className="hidden items-center gap-1 xl:flex">
            <button type="button" onClick={() => setActiveTab('platform')} className="focus-ring rounded-lg bg-[#eef3ff] px-4 py-3 text-sm font-bold text-[#2858d6]">Главная</button>
            <button type="button" onClick={() => setActiveTab('enterprises')} className="focus-ring rounded-lg px-3 py-3 text-sm font-semibold text-[#596274]">Предприятия</button>
            <button type="button" onClick={() => setActiveTab('schedule')} className="focus-ring rounded-lg px-3 py-3 text-sm font-semibold text-[#596274]">Расписание</button>
            <button type="button" onClick={() => setActiveTab('news')} className="focus-ring rounded-lg px-3 py-3 text-sm font-semibold text-[#596274]">Новости</button>
          </div>
          <div className="flex items-center gap-2">
            <IconButton aria-label="Уведомления" title="Уведомления">
              <Bell size={18} />
            </IconButton>
            {user ? (
              <>
                <IconButton title="Открыть личный кабинет" onClick={() => setActiveTab('passport')}>
                  <UserRound size={18} />
                  <span className="hidden sm:inline">{user.full_name.split(' ')[0]}</span>
                </IconButton>
                {user.isAdmin && (
                  <button type="button" onClick={() => setActiveTab('admin')} className="focus-ring hidden h-11 items-center rounded-lg bg-[#2858d6] px-5 text-sm font-bold text-white sm:inline-flex">
                    Админка
                  </button>
                )}
              </>
            ) : (
              <>
                <IconButton onClick={() => setLoginOpen(true)}>
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Войти</span>
                </IconButton>
                <button type="button" onClick={() => setRegisterOpen(true)} className="focus-ring h-11 rounded-lg bg-[#2858d6] px-4 text-sm font-bold text-white transition hover:bg-[#1e47b6]">
                  Регистрация
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside
          className={`${navOpen ? 'fixed inset-0 z-50 block bg-ink/45 p-4' : 'hidden'} lg:sticky lg:top-[65px] lg:z-auto lg:block lg:h-[calc(100vh-65px)] lg:bg-transparent lg:p-0`}
        >
          <nav className="app-scrollbar h-full w-full max-w-[320px] overflow-auto rounded-lg border border-line bg-white p-3 lg:max-w-none lg:rounded-none lg:border-x-0 lg:border-t-0">
            <div className="mb-3 flex items-center justify-between lg:hidden">
              <p className="font-bold">Разделы</p>
              <IconButton aria-label="Закрыть меню" title="Закрыть меню" onClick={() => setNavOpen(false)} className="px-0">
                <X size={18} />
              </IconButton>
            </div>
            <div className="grid gap-2">
              {tabs.filter((tab) => !tab.adminOnly || user?.isAdmin).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isLocked = tab.requiresAuth && !user;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (isLocked) return;
                      setActiveTab(tab.id);
                      setNavOpen(false);
                    }}
                    className={`focus-ring flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                      isActive
                        ? 'border-[#2858d6] bg-[#2858d6] text-white'
                        : tab.keyModule
                          ? 'border-[#b9caff] bg-[#f3f6ff] text-[#2858d6] hover:bg-[#e7edff]'
                          : isLocked
                            ? 'cursor-not-allowed border-transparent bg-[#f4f5f7] text-[#9aa1ad]'
                            : 'border-transparent text-ink hover:bg-[#eef3ee]'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {isLocked ? <LockKeyhole size={18} /> : <Icon size={18} />}
                      <span>{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        <main className="min-w-0 px-4 py-5 lg:px-6">
          {activeTab === 'platform' && (
            <section className="grid gap-5">
              <div className="hero-image flex min-h-[500px] items-center overflow-hidden rounded-lg border border-[#244ba9] p-6 shadow-soft sm:p-10">
                <div className="max-w-2xl text-white">
                  <h2 className="max-w-xl text-4xl font-bold leading-tight sm:text-6xl">Цифровой паспорт промышленного туриста</h2>
                  <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
                    Выбирайте предприятия, проходите профориентационный тест, записывайтесь на экскурсии
                    и сохраняйте результаты в личном цифровом паспорте.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button type="button" onClick={() => setActiveTab('test')} className="focus-ring inline-flex h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#244ba9] transition hover:bg-[#eef3ff]">
                      <Sparkles size={18} />
                      Пройти тест
                    </button>
                    <button type="button" onClick={() => setActiveTab('schedule')} className="focus-ring inline-flex h-12 items-center gap-2 rounded-lg border border-white/60 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20">
                      <CalendarDays size={18} />
                      Смотреть экскурсии
                    </button>
                  </div>
                </div>
              </div>
              <ModuleFlow />
              <NewsList news={news} compact />
              <section className="border-t border-line pt-5">
                <p className="mb-3 text-xs font-bold uppercase text-[#7a8496]">Факты проекта</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {platform.metrics.map((metric) => (
                    <Metric key={metric.label} label={metric.label} value={metric.value} />
                  ))}
                </div>
              </section>
            </section>
          )}

          {activeTab === 'enterprises' && (
            <section className="grid gap-4">
              <SectionTitle title="Предприятия" />
              <div className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-[1fr_260px_220px]">
                <TextInput value={enterpriseQuery} onChange={(event) => setEnterpriseQuery(event.target.value)} placeholder="Название, город или описание" />
                <select className="focus-ring h-11 rounded-lg border border-line bg-white px-3 text-sm" value={industryFilter} onChange={(event) => setIndustryFilter(event.target.value)}>
                  {industries.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select className="focus-ring h-11 rounded-lg border border-line bg-white px-3 text-sm" value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
                  {cities.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <p className="text-sm font-semibold text-[#66736c]">Найдено: {filteredEnterprises.length}</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredEnterprises.map((enterprise) => (
                  <article key={enterprise.id} className="overflow-hidden rounded-lg border border-line bg-white shadow-sm transition hover:shadow-soft">
                    <img className="h-44 w-full object-cover" src={enterprise.image_url} alt={enterprise.title} />
                    <div className="p-4">
                      <p className="text-xs font-bold uppercase text-amber">{enterprise.industry}</p>
                      <h3 className="mt-2 text-lg font-bold">{enterprise.title}</h3>
                      <p className="mt-2 text-sm text-[#53615a]">{enterprise.city}, {enterprise.address}</p>
                      <p className="mt-3 text-sm leading-6">{summarize(enterprise.description)}</p>
                      <p className="mt-3 text-sm font-semibold">{enterprise.excursion_title}</p>
                      <p className="mt-1 text-sm text-[#53615a]">{summarize(enterprise.excursion_description, 240)}</p>
                      <div className="mt-4 rounded-lg bg-paper p-3 text-sm text-[#53615a]">
                        <strong className="text-ink">ТБ:</strong> {enterprise.safety_note}
                      </div>
                      {websiteUrl(enterprise.website) && (
                        <a className="mt-4 inline-flex text-sm font-bold text-[#2858d6]" href={websiteUrl(enterprise.website)} target="_blank" rel="noreferrer">
                          Сайт предприятия
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'news' && (
            <section className="grid gap-4">
              <SectionTitle title="Новости предприятий" />
              <NewsList news={news} variant="full" />
            </section>
          )}

          {activeTab === 'schedule' && (
            <section className="grid gap-4">
              <SectionTitle title="Расписание экскурсий" />
              <div className="flex flex-wrap gap-2">
                {[
                  ['all', 'Все экскурсии'],
                  ['technical', 'Технические'],
                  ['creative', 'Творческие'],
                  ['science', 'Научно-производственные']
                ].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setScheduleProfile(value)} className={`focus-ring h-10 rounded-lg border px-3 text-sm font-bold ${scheduleProfile === value ? 'border-[#2858d6] bg-[#2858d6] text-white' : 'border-line bg-white text-ink'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid gap-3">
                {filteredExcursions.map((excursion) => (
                  <article key={excursion.id} className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-[#e7f2ef] px-2 py-1 text-xs font-bold text-teal">{formatDate(excursion.starts_at)}</span>
                        <span className="rounded-lg bg-[#fff3d8] px-2 py-1 text-xs font-bold text-[#8b5b00]">{excursion.duration_minutes} минут</span>
                        <span className="rounded-lg bg-[#eef3ff] px-2 py-1 text-xs font-bold text-[#2858d6]">{excursion.age_restriction}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold">{excursion.title}</h3>
                      <p className="mt-1 text-sm text-[#53615a]">{excursion.enterprise_title}, {excursion.address}</p>
                      <p className="mt-3 text-sm">{excursion.route_summary}</p>
                      <p className="mt-2 text-sm text-[#53615a]"><strong>Стоимость:</strong> {excursion.price}</p>
                    </div>
                    <div className="grid gap-2 md:min-w-[190px]">
                      <p className="text-sm font-semibold text-[#53615a]">
                        Свободно {Math.max(excursion.seats_total - excursion.seats_taken, 0)} из {excursion.seats_total}
                      </p>
                      <PrimaryButton disabled={excursion.seats_taken >= excursion.seats_total} onClick={() => openBooking(excursion)}>
                        <BadgeCheck size={18} />
                        {excursion.seats_taken >= excursion.seats_total ? 'Мест нет' : 'Записаться'}
                      </PrimaryButton>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'test' && (
            <section className="grid gap-4">
              <SectionTitle title="Профориентационный тест" />
              <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                <div className="grid gap-4">
                  <div className="h-2 overflow-hidden rounded bg-[#e2e7f0]">
                    <div className="h-full bg-[#2858d6] transition-all" style={{ width: `${((testStep + 1) / testQuestions.length) * 100}%` }} />
                  </div>
                  {[testQuestions[testStep]].map((question) => (
                    <fieldset key={question.id} className="rounded-lg border border-line bg-white p-5">
                      <legend className="px-1 text-base font-bold">{testStep + 1} из {testQuestions.length}. {question.title}</legend>
                      <div className="mt-4 grid gap-2 md:grid-cols-3">
                        {question.options.map((option) => {
                          const selected = answers[question.id] === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                              className={`focus-ring min-h-16 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                                selected ? 'border-teal bg-[#e7f2ef] text-teal' : 'border-line bg-paper hover:border-teal'
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                  <div className="flex flex-wrap justify-between gap-3">
                    <IconButton disabled={testStep === 0} onClick={() => setTestStep((step) => Math.max(0, step - 1))}>Назад</IconButton>
                    {testStep < testQuestions.length - 1 ? (
                      <PrimaryButton disabled={!answers[testQuestions[testStep].id]} onClick={() => setTestStep((step) => step + 1)}>Следующий вопрос</PrimaryButton>
                    ) : (
                      <PrimaryButton disabled={Object.keys(answers).length !== testQuestions.length} onClick={submitCareerTest}>
                        <ClipboardCheck size={18} />
                        Получить рекомендацию
                      </PrimaryButton>
                    )}
                  </div>
                </div>
                <aside className="rounded-lg border border-line bg-white p-4">
                  <p className="text-xs font-bold uppercase text-teal">Как это работает</p>
                  <p className="mt-3 text-sm leading-6 text-[#53615a]">
                    Система считает ответы трёх типов, показывает основное и запасное направление, а затем фильтрует подходящие экскурсии.
                  </p>
                </aside>
              </div>
            </section>
          )}

          {activeTab === 'passport' && user && (
            <StudentDashboard
              user={user}
              careerResult={careerResult}
              bookings={bookings}
              confirmation={confirmation}
              feedbackResult={feedbackResult}
              onStartTest={() => {
                setTestStep(0);
                setActiveTab('test');
              }}
              onOpenSchedule={(profile = 'technical') => {
                setScheduleProfile(profile);
                setActiveTab('schedule');
              }}
              onOpenFeedback={() => setActiveTab('feedback')}
              onCancelBooking={cancelBooking}
            />
          )}

          {activeTab === 'feedback' && (
            <section className="grid gap-4">
              <SectionTitle title="Обратная связь после экскурсии" />
              <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
                <form className="rounded-lg border border-line bg-white p-4" onSubmit={submitFeedback}>
                  <div className="rounded-lg bg-paper p-4">
                    <p className="text-xs font-bold uppercase text-teal">Напоминание</p>
                    <h3 className="mt-2 text-lg font-bold">
                      {confirmation ? confirmation.enterprise : 'Сначала запишитесь на экскурсию'}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#53615a]">
                      {confirmation
                        ? `После посещения ${formatDate(confirmation.starts_at)} вернитесь сюда, чтобы оценить маршрут и сохранить впечатления.`
                        : 'После записи здесь появятся данные экскурсии и ссылка на анкету.'}
                    </p>
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-bold">Оценка экскурсии</p>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFeedbackForm((form) => ({ ...form, rating }))}
                          className={`focus-ring inline-flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-bold transition ${
                            feedbackForm.rating === rating ? 'border-amber bg-[#fff3d8] text-[#8b5b00]' : 'border-line bg-white hover:border-amber'
                          }`}
                        >
                          <Star size={16} />
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="mt-4 grid gap-2 text-sm font-bold">
                    Впечатления туриста
                    <textarea
                      required
                      rows={5}
                      value={feedbackForm.impressions}
                      onChange={(event) => setFeedbackForm((form) => ({ ...form, impressions: event.target.value }))}
                      className="focus-ring w-full rounded-lg border border-line bg-white p-3 text-sm font-normal text-ink"
                      placeholder="Что понравилось, что было непонятно, какие подсказки помогли на маршруте"
                    />
                  </label>
                  <label className="mt-4 flex items-start gap-3 rounded-lg border border-line bg-paper p-3 text-sm text-[#53615a]">
                    <input
                      type="checkbox"
                      checked={feedbackForm.yandexCompleted}
                      onChange={(event) => setFeedbackForm((form) => ({ ...form, yandexCompleted: event.target.checked }))}
                      className="mt-1"
                    />
                    Я прошёл Яндекс-анкету и хочу сохранить это в паспорте
                  </label>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a className="focus-ring inline-flex h-11 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink transition hover:border-teal hover:text-teal" href={YANDEX_FEEDBACK_URL} target="_blank" rel="noreferrer">
                      Открыть Яндекс-анкету
                    </a>
                    <PrimaryButton type="submit" disabled={!feedbackForm.rating || !feedbackForm.impressions.trim()}>
                      <BadgeCheck size={18} />
                      Сохранить впечатления
                    </PrimaryButton>
                  </div>
                </form>
                <aside className="rounded-lg border border-line bg-white p-4">
                  <p className="text-xs font-bold uppercase text-amber">Зачем это нужно</p>
                  <p className="mt-3 text-sm leading-6 text-[#53615a]">
                    Обратная связь закрывает сценарий MVP: пользователь не просто записывается, а возвращается после
                    экскурсии, оценивает опыт и оставляет материал для улучшения маршрутов.
                  </p>
                </aside>
              </div>
            </section>
          )}

          {activeTab === 'admin' && user?.isAdmin && (
            <section className="grid gap-4">
              <SectionTitle title="Админка MVP" text="В первой версии данные про предприятия заводит команда проекта, без личного кабинета предприятия." />
              <div className="grid gap-3 md:grid-cols-4">
                <Metric label="Предприятия" value={String(enterprises.length)} />
                <Metric label="Экскурсии" value={String(excursions.length)} />
                <Metric label="Новости" value={String(news.length)} />
                <Metric label="Свободные места" value={String(freeSeats)} />
              </div>
              <div className="overflow-hidden rounded-lg border border-line bg-white">
                <div className="grid table-grid gap-3 border-b border-line bg-paper px-4 py-3 text-xs font-bold uppercase text-[#66736c]">
                  <span>Маршрут</span>
                  <span>Предприятие</span>
                  <span>Дата</span>
                  <span>Заполнено</span>
                </div>
                {excursions.map((excursion) => (
                  <div key={excursion.id} className="grid table-grid gap-3 border-b border-line px-4 py-3 text-sm last:border-b-0">
                    <span className="font-semibold">{excursion.title}</span>
                    <span>{excursion.enterprise_title}</span>
                    <span>{formatDate(excursion.starts_at)}</span>
                    <span>{excursion.seats_taken}/{excursion.seats_total}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {registerOpen && (
        <Modal title="Регистрация туриста" onClose={() => setRegisterOpen(false)}>
          <form className="grid gap-3" onSubmit={submitRegister}>
            <TextInput name="full_name" required placeholder="ФИО" />
            <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
              <TextInput name="class_name" required placeholder="Класс" defaultValue="9Б" />
              <TextInput name="school" required placeholder="Школа" defaultValue={demoStudentProfile.school} />
            </div>
            <TextInput name="email" required type="email" placeholder="E-mail" />
            <TextInput name="phone" required pattern="^[0-9+()\\-\\s]{7,}$" placeholder="Номер телефона" />
            <TextInput name="password" required type="password" minLength="6" placeholder="Пароль" />
            <label className="grid gap-2 text-sm font-semibold text-[#53615a]">
              Фотография
              <input className="text-sm" type="file" accept="image/*" />
            </label>
            <PrimaryButton className="mt-2 w-full" type="submit">
              <BadgeCheck size={18} />
              Создать паспорт
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {loginOpen && (
        <Modal title="Вход в платформу" onClose={() => setLoginOpen(false)}>
          <form className="grid gap-3" onSubmit={submitLogin}>
            <TextInput name="identifier" required placeholder="E-mail или логин" />
            <TextInput name="password" required type="password" minLength="4" placeholder="Пароль" />
            <PrimaryButton className="mt-2 w-full" type="submit">
              <LogIn size={18} />
              Войти
            </PrimaryButton>
          </form>
        </Modal>
      )}

      {bookingTarget && (
        <Modal title="Запись на экскурсию" onClose={() => setBookingTarget(null)}>
          <form className="grid gap-3" onSubmit={submitBooking}>
            <div className="rounded-lg bg-white p-3 text-sm">
              <p className="font-bold">{bookingTarget.title}</p>
              <p className="mt-1 text-[#53615a]">{bookingTarget.enterprise_title}, {formatDate(bookingTarget.starts_at)}</p>
            </div>
            <TextInput required value={bookingForm.visitor_name} onChange={(event) => setBookingForm((form) => ({ ...form, visitor_name: event.target.value }))} placeholder="ФИО" />
            <TextInput required type="email" value={bookingForm.email} onChange={(event) => setBookingForm((form) => ({ ...form, email: event.target.value }))} placeholder="E-mail" />
            <TextInput required pattern="^[0-9+()\\-\\s]{7,}$" value={bookingForm.phone} onChange={(event) => setBookingForm((form) => ({ ...form, phone: event.target.value }))} placeholder="Номер телефона" />
            <PrimaryButton className="mt-2 w-full" type="submit">
              <BadgeCheck size={18} />
              Подтвердить запись
            </PrimaryButton>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StudentDashboard({
  user,
  careerResult,
  bookings,
  confirmation,
  feedbackResult,
  onStartTest,
  onOpenSchedule,
  onOpenFeedback,
  onCancelBooking
}) {
  const profile = demoStudentProfile;
  const recommendation = careerResult || {
    specialty: 'Инженер-технолог / Автоматизация производств',
    backup_specialty: 'Инженер по промышленной робототехнике',
    explanation: 'Сильные результаты по математике, физике и информатике сочетаются с опытом проектной работы.',
    excursion_profile: 'technical'
  };
  const initials = (user.full_name || 'Ученик')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled_by_user');
  const testHistory = careerResult
    ? [
        {
          title: 'Профориентационный тест',
          date: 'Сегодня',
          result: careerResult.specialty,
          source: 'Встроенный'
        },
        ...profile.testHistory
      ]
    : profile.testHistory;

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#2858d6]">Личный кабинет</p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Мой цифровой паспорт</h2>
        </div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#66736c]">
          <CheckCircle2 size={17} className="text-teal" />
          Данные ГИС обновлены: {profile.gisUpdated}
        </p>
      </div>

      <section className="grid gap-5 rounded-lg border border-[#cad6f3] bg-white p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#2858d6] text-2xl font-black text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#66736c]">Добро пожаловать,</p>
            <h3 className="mt-1 text-2xl font-bold">{user.full_name}</h3>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#53615a]">
              <span className="inline-flex items-center gap-2"><GraduationCap size={17} />{user.class_name || profile.className} класс</span>
              <span className="inline-flex items-center gap-2"><School size={17} />{user.school || profile.school}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
          <ProfileMetric value="4,8" label="Средний балл" />
          <ProfileMetric value={String(profile.visitedExcursions.length)} label="Экскурсии" />
          <ProfileMetric value={String(testHistory.length)} label="Тесты" />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-lg border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-teal">Карта навыков</p>
              <h3 className="mt-1 text-xl font-bold">Компетенции и soft skills</h3>
            </div>
            <span className="rounded-lg bg-[#e7f2ef] px-3 py-2 text-xs font-bold text-teal">На основе данных ГИС</span>
          </div>
          <SkillRadar skills={profile.skills} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            {profile.skills.map((skill) => (
              <div key={skill.label}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold">
                  <span className="truncate">{skill.label}</span>
                  <span>{skill.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-[#e4e8ef]">
                  <div className="h-full rounded bg-teal" style={{ width: `${skill.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col rounded-lg border border-[#b9caff] bg-[#f5f7ff] p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#2858d6] text-white">
              <Target size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[#2858d6]">Рекомендуемый профиль сегодня</p>
              <p className="mt-1 text-sm text-[#66736c]">Совпадение с профилем: 87%</p>
            </div>
          </div>
          <h3 className="mt-5 text-2xl font-bold leading-tight">{recommendation.specialty}</h3>
          <p className="mt-3 text-sm leading-6 text-[#53615a]">{recommendation.explanation}</p>
          <div className="mt-4 border-l-4 border-amber pl-3">
            <p className="text-xs font-bold uppercase text-[#8b5b00]">Смежное направление</p>
            <p className="mt-1 text-sm font-semibold">{recommendation.backup_specialty}</p>
          </div>
          <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-2">
            <PrimaryButton onClick={onStartTest}>
              <BrainCircuit size={18} />
              Пройти экспресс-тест
            </PrimaryButton>
            <IconButton className="h-11" onClick={() => onOpenSchedule(recommendation.excursion_profile)}>
              Подобрать экскурсии
              <ChevronRight size={18} />
            </IconButton>
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase text-[#2858d6]">Синхронизировано из ГИС</p>
            <h3 className="mt-1 text-xl font-bold">Мои данные</h3>
          </div>
          <span className="text-sm text-[#66736c]">Учебный профиль 2025/2026</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <DataCard icon={BookOpen} title="Успеваемость">
            <div className="grid gap-2">
              {profile.grades.map((grade) => (
                <div key={grade.subject} className="flex items-center justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
                  <span className="text-sm font-semibold">{grade.subject}</span>
                  <span className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e7f2ef] font-bold text-teal">{grade.value}</span>
                    <span className="text-xs font-bold text-teal">{grade.trend}</span>
                  </span>
                </div>
              ))}
            </div>
          </DataCard>
          <DataCard icon={Trophy} title="Олимпиады">
            <div className="grid gap-3">
              {profile.olympiads.map((item) => (
                <div key={item.title}>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-xs text-[#66736c]">{item.level}</p>
                  <span className="mt-2 inline-flex rounded-lg bg-[#fff3d8] px-2 py-1 text-xs font-bold text-[#8b5b00]">{item.result}</span>
                </div>
              ))}
            </div>
          </DataCard>
          <DataCard icon={Activity} title="Внеклассная деятельность">
            <div className="grid gap-3">
              {profile.activities.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-teal" />
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="mt-1 text-xs text-[#66736c]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      </section>

      {activeBookings.length > 0 && (
        <section>
          <h3 className="mb-3 text-xl font-bold">Предстоящие экскурсии</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {activeBookings.map((booking) => (
              <article key={booking.id} className="rounded-lg border border-[#b9caff] bg-white p-4">
                <p className="text-xs font-bold uppercase text-[#2858d6]">Запись подтверждена</p>
                <h4 className="mt-2 font-bold">{booking.enterprise}</h4>
                <p className="mt-1 text-sm text-[#53615a]">{formatDate(booking.starts_at)}</p>
                <button type="button" onClick={() => onCancelBooking(booking.id)} className="mt-3 text-sm font-bold text-[#b95642]">Отменить запись</button>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Award size={21} className="text-amber" />
            <h3 className="text-xl font-bold">Посещённые экскурсии</h3>
          </div>
          <div className="grid gap-3">
            {profile.visitedExcursions.map((excursion) => (
              <article key={excursion.enterprise} className="rounded-lg border border-line bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold">{excursion.enterprise}</h4>
                    <p className="mt-1 text-sm text-[#66736c]">{excursion.date}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#fff3d8] px-2 py-1 text-sm font-bold text-[#8b5b00]">
                    <Star size={15} fill="currentColor" />{excursion.rating}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#53615a]"><strong className="text-ink">Полученные знания:</strong> {excursion.knowledge}</p>
              </article>
            ))}
            {feedbackResult && (
              <article className="rounded-lg border border-teal bg-[#f3fbf9] p-4">
                <p className="text-xs font-bold uppercase text-teal">Последний отзыв</p>
                <p className="mt-2 text-sm leading-6">{feedbackResult.impressions}</p>
                <p className="mt-2 text-sm font-bold">Оценка: {feedbackResult.rating}/5</p>
              </article>
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck size={21} className="text-[#2858d6]" />
            <h3 className="text-xl font-bold">Результаты тестов</h3>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-white">
            {testHistory.map((test) => (
              <div key={`${test.title}-${test.date}`} className="grid gap-2 border-b border-line p-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold">{test.title}</h4>
                    <span className="rounded-lg bg-[#eef3ff] px-2 py-1 text-xs font-bold text-[#2858d6]">{test.source}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#53615a]">{test.result}</p>
                </div>
                <p className="text-xs font-semibold text-[#66736c]">{test.date}</p>
              </div>
            ))}
          </div>
          <PrimaryButton className="mt-3" onClick={onStartTest}>
            <BrainCircuit size={18} />
            Пройти новый тест
          </PrimaryButton>
        </section>
      </div>

      {confirmation && (
        <section className="rounded-lg border border-teal bg-[#f3fbf9] p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-teal">Напоминание после экскурсии</p>
              <h3 className="mt-1 font-bold">{confirmation.enterprise}</h3>
              <p className="mt-1 text-sm text-[#53615a]">Оцените экскурсию и сохраните новые впечатления в паспорте.</p>
            </div>
            <PrimaryButton onClick={onOpenFeedback}>
              <MessageSquareText size={18} />
              Оставить отзыв
            </PrimaryButton>
          </div>
        </section>
      )}
    </section>
  );
}

function ProfileMetric({ value, label }) {
  return (
    <div className="min-w-0 border-l border-line px-3 first:border-l-0">
      <p className="text-xl font-bold text-[#2858d6]">{value}</p>
      <p className="mt-1 text-xs leading-4 text-[#66736c]">{label}</p>
    </div>
  );
}

function DataCard({ icon: Icon, title, children }) {
  return (
    <article className="rounded-lg border border-line bg-white p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef3ff] text-[#2858d6]">
          <Icon size={19} />
        </div>
        <h4 className="font-bold">{title}</h4>
      </div>
      {children}
    </article>
  );
}

function SkillRadar({ skills }) {
  const center = { x: 180, y: 145 };
  const radius = 92;
  const levels = [0.25, 0.5, 0.75, 1];
  const pointAt = (index, scale = 1) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / skills.length;
    return {
      x: center.x + Math.cos(angle) * radius * scale,
      y: center.y + Math.sin(angle) * radius * scale
    };
  };
  const polygon = (scale) => skills.map((_, index) => {
    const point = pointAt(index, scale);
    return `${point.x},${point.y}`;
  }).join(' ');
  const values = skills.map((skill, index) => {
    const point = pointAt(index, skill.value / 100);
    return `${point.x},${point.y}`;
  }).join(' ');

  return (
    <div className="mx-auto my-2 w-full max-w-[420px]">
      <svg viewBox="0 0 360 290" role="img" aria-label="Радарная карта навыков" className="h-auto w-full">
        {levels.map((level) => (
          <polygon key={level} points={polygon(level)} fill={level === 1 ? '#f7f9fc' : 'none'} stroke="#d9e0ea" strokeWidth="1" />
        ))}
        {skills.map((skill, index) => {
          const point = pointAt(index);
          return <line key={skill.label} x1={center.x} y1={center.y} x2={point.x} y2={point.y} stroke="#d9e0ea" strokeWidth="1" />;
        })}
        <polygon points={values} fill="rgba(40, 88, 214, 0.18)" stroke="#2858d6" strokeWidth="3" />
        {skills.map((skill, index) => {
          const point = pointAt(index, skill.value / 100);
          const labelPoint = pointAt(index, 1.28);
          const anchor = labelPoint.x < center.x - 12 ? 'end' : labelPoint.x > center.x + 12 ? 'start' : 'middle';
          return (
            <g key={skill.label}>
              <circle cx={point.x} cy={point.y} r="4" fill="#2858d6" />
              <text x={labelPoint.x} y={labelPoint.y} textAnchor={anchor} dominantBaseline="middle" className="fill-[#3f4b46] text-[10px] font-semibold">
                {skill.shortLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SectionTitle({ title, text }) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      {text && <p className="mt-2 text-sm leading-6 text-[#53615a]">{text}</p>}
    </div>
  );
}

function ModuleFlow() {
  const steps = [
    ['1', 'Регистрация', 'ФИО, e-mail, телефон и фотография сохраняются в паспорте.'],
    ['2', 'Профориентация', 'Тест подбирает направление: технология, безопасность или автоматизация.'],
    ['3', 'Запись', 'Пользователь выбирает экскурсию и получает подтверждение.'],
    ['4', 'Обратная связь', 'После посещения модуль напоминает вернуться и оценить экскурсию.']
  ];
  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <h2 className="text-xl font-bold">Главный сценарий</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {steps.map(([num, title, text]) => (
          <div key={title} className="rounded-lg bg-paper p-4">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber text-sm font-bold text-white">{num}</div>
            <h3 className="mt-3 font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#53615a]">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function NewsList({ news, compact = false, variant = 'compact' }) {
  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Новости предприятий</h2>
        </div>
      </div>
      <div className={`mt-4 grid gap-3 ${variant === 'full' ? 'md:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3'}`}>
        {news.map((item) => (
          <article key={item.id} className="rounded-lg bg-paper p-4 transition hover:bg-[#eef3ee]">
            <p className="text-xs font-bold uppercase text-teal">{item.enterprise_title}</p>
            <h3 className="mt-2 font-bold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#53615a]">{item.body}</p>
            <p className="mt-3 text-xs font-semibold text-[#66736c]">{new Intl.DateTimeFormat('ru-RU').format(new Date(item.published_at))}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusPanel({ title, emptyText, children }) {
  const hasContent = Boolean(children?.props?.children);
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold">{title}</h2>
      {hasContent ? children : <div className="rounded-lg border border-dashed border-line bg-white p-4 text-sm text-[#53615a]">{emptyText}</div>}
    </section>
  );
}
