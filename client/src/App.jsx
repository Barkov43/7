import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogIn,
  Menu,
  MessageSquareText,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X
} from 'lucide-react';
import {
  fallbackCareerResult,
  mockEnterprises,
  mockExcursions,
  mockNews,
  mockPlatform
} from './api_mock.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const YANDEX_FEEDBACK_URL = 'https://forms.yandex.ru/cloud/industrial-tourist-feedback-demo/';

const tabs = [
  { id: 'platform', label: 'Платформа', icon: LayoutDashboard },
  { id: 'enterprises', label: 'Предприятия', icon: Building2 },
  { id: 'news', label: 'Новости', icon: Newspaper },
  { id: 'schedule', label: 'Расписание', icon: CalendarDays },
  { id: 'test', label: 'Тест', icon: GraduationCap },
  { id: 'passport', label: 'Паспорт', icon: FileText },
  { id: 'feedback', label: 'Обратная связь', icon: MessageSquareText },
  { id: 'admin', label: 'Админка', icon: ShieldCheck }
];

const testQuestions = [
  {
    id: 'workstyle',
    title: 'Что вам интереснее на экскурсии?',
    options: [
      { id: 'engineer', label: 'Как создаётся изделие' },
      { id: 'automation', label: 'Как работают цифровые линии' },
      { id: 'safety', label: 'Как устроена безопасность' }
    ]
  },
  {
    id: 'task',
    title: 'Какую задачу вы бы выбрали в проектной команде?',
    options: [
      { id: 'automation', label: 'Настроить датчики и мониторинг' },
      { id: 'safety', label: 'Найти опасные зоны маршрута' },
      { id: 'engineer', label: 'Разобрать технологическую карту' }
    ]
  },
  {
    id: 'result',
    title: 'Какой результат кажется самым полезным?',
    options: [
      { id: 'safety', label: 'Понятный чек-лист ТБ' },
      { id: 'engineer', label: 'Маршрут от сырья до продукта' },
      { id: 'automation', label: 'Паспорт цифрового процесса' }
    ]
  },
  {
    id: 'environment',
    title: 'В какой среде вам комфортнее работать?',
    options: [
      { id: 'engineer', label: 'В цехе рядом с оборудованием' },
      { id: 'automation', label: 'За пультом, схемой или экраном мониторинга' },
      { id: 'safety', label: 'На маршруте, где нужно видеть риски' }
    ]
  },
  {
    id: 'tools',
    title: 'Какие инструменты кажутся вам ближе?',
    options: [
      { id: 'automation', label: 'Датчики, контроллеры и панели управления' },
      { id: 'engineer', label: 'Чертежи, карты процессов и измерения' },
      { id: 'safety', label: 'Инструктажи, чек-листы и знаки безопасности' }
    ]
  },
  {
    id: 'decision',
    title: 'Что вы сначала проверите перед запуском экскурсии?',
    options: [
      { id: 'safety', label: 'Безопасность маршрута и опасные зоны' },
      { id: 'engineer', label: 'Логику технологической цепочки' },
      { id: 'automation', label: 'Работу цифровой навигации и уведомлений' }
    ]
  },
  {
    id: 'interest',
    title: 'Какая новость предприятия заинтересует вас сильнее?',
    options: [
      { id: 'engineer', label: 'Запущена новая производственная линия' },
      { id: 'automation', label: 'Внедрён цифровой двойник участка' },
      { id: 'safety', label: 'Обновлены правила безопасного посещения' }
    ]
  },
  {
    id: 'document',
    title: 'Какой документ вы бы хотели собрать после экскурсии?',
    options: [
      { id: 'safety', label: 'Карту опасных зон и требований ТБ' },
      { id: 'engineer', label: 'Описание производственного маршрута' },
      { id: 'automation', label: 'Схему данных и автоматизированных операций' }
    ]
  },
  {
    id: 'teamrole',
    title: 'Какая роль в команде вам ближе?',
    options: [
      { id: 'automation', label: 'Настроить цифровой модуль и интеграцию' },
      { id: 'safety', label: 'Проверить маршрут со специалистом по охране труда' },
      { id: 'engineer', label: 'Объяснить, как работает производство' }
    ]
  },
  {
    id: 'feedback',
    title: 'Что важно спросить у туриста после посещения?',
    options: [
      { id: 'engineer', label: 'Какая технология стала понятнее' },
      { id: 'safety', label: 'Где было сложно ориентироваться безопасно' },
      { id: 'automation', label: 'Какие цифровые подсказки помогли' }
    ]
  }
];

function formatDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
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
  const [bookingTarget, setBookingTarget] = useState(null);
  const [bookingForm, setBookingForm] = useState({ visitor_name: '', email: '', phone: '' });
  const [confirmation, setConfirmation] = useState(null);
  const [answers, setAnswers] = useState({});
  const [careerResult, setCareerResult] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, impressions: '', yandexCompleted: false });
  const [feedbackResult, setFeedbackResult] = useState(null);

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

  const selectedEnterprise = useMemo(() => enterprises[0], [enterprises]);
  const freeSeats = useMemo(
    () => excursions.reduce((sum, item) => sum + Math.max(item.seats_total - item.seats_taken, 0), 0),
    [excursions]
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
      saveUser(created);
    } catch {
      saveUser({ id: Date.now(), full_name: payload.full_name, email: payload.email, phone: payload.phone });
    }
    setRegisterOpen(false);
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
    setActiveTab('passport');
  }

  function openBooking(excursion) {
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
    try {
      const result = await postJson('/bookings', payload);
      setConfirmation(result);
    } catch {
      setConfirmation({
        id: Date.now(),
        status: 'confirmed',
        enterprise: bookingTarget.enterprise_title,
        address: bookingTarget.address,
        starts_at: bookingTarget.starts_at,
        guide_comment: bookingTarget.guide_comment,
        safety_note: bookingTarget.safety_note
      });
    }
    setBookingTarget(null);
    setActiveTab('passport');
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
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton className="lg:hidden" aria-label="Меню" title="Меню" onClick={() => setNavOpen(true)}>
              <Menu size={18} />
            </IconButton>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal text-white">
              <Home size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold uppercase tracking-normal text-teal">Демо-платформа</p>
              <h1 className="truncate text-lg font-bold sm:text-xl">Цифровой паспорт промышленного туриста</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-[#66736c] sm:inline-flex">
              {apiMode === 'api' ? 'API подключен' : 'Демо-данные'}
            </span>
            <IconButton aria-label="Уведомления" title="Уведомления">
              <Bell size={18} />
            </IconButton>
            {user ? (
              <IconButton title={user.full_name}>
                <UserRound size={18} />
                <span className="hidden sm:inline">{user.full_name.split(' ')[0]}</span>
              </IconButton>
            ) : (
              <PrimaryButton onClick={() => setRegisterOpen(true)}>
                <LogIn size={18} />
                Регистрация
              </PrimaryButton>
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
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setNavOpen(false);
                    }}
                    className={`focus-ring flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${
                      isActive ? 'bg-teal text-white' : 'text-ink hover:bg-[#eef3ee]'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 rounded-lg border border-line bg-paper p-4">
              <p className="text-xs font-bold uppercase text-[#66736c]">MVP-цель</p>
              <p className="mt-2 text-sm">10 экскурсий подготовлены через систему за 1 месяц вместо ручной подготовки.</p>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 px-4 py-5 lg:px-6">
          {activeTab === 'platform' && (
            <section className="grid gap-5">
              <div className="hero-image min-h-[430px] overflow-hidden rounded-lg border border-line bg-white p-5 shadow-soft">
                <div className="max-w-2xl">
                  <span className="inline-flex rounded-lg bg-white px-3 py-2 text-xs font-bold uppercase text-teal">
                    Страница внедрения модуля
                  </span>
                  <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight sm:text-5xl">{platform.title}</h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-[#53615a]">{platform.status}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <PrimaryButton onClick={() => (user ? setActiveTab('test') : setRegisterOpen(true))}>
                      <Sparkles size={18} />
                      Начать сценарий
                    </PrimaryButton>
                    <IconButton onClick={() => setActiveTab('schedule')}>
                      <CalendarDays size={18} />
                      Расписание
                    </IconButton>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {platform.metrics.map((metric) => (
                  <Metric key={metric.label} label={metric.label} value={metric.value} />
                ))}
              </div>
              <ModuleFlow />
              <NewsList news={news} compact />
            </section>
          )}

          {activeTab === 'enterprises' && (
            <section className="grid gap-4">
              <SectionTitle title="Предприятия" text="База заполняется командой проекта вручную, а в будущем может перейти в личные кабинеты предприятий." />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {enterprises.map((enterprise) => (
                  <article key={enterprise.id} className="overflow-hidden rounded-lg border border-line bg-white shadow-sm transition hover:shadow-soft">
                    <img className="h-44 w-full object-cover" src={enterprise.image_url} alt={enterprise.title} />
                    <div className="p-4">
                      <p className="text-xs font-bold uppercase text-amber">{enterprise.industry}</p>
                      <h3 className="mt-2 text-lg font-bold">{enterprise.title}</h3>
                      <p className="mt-2 text-sm text-[#53615a]">{enterprise.city}, {enterprise.address}</p>
                      <p className="mt-3 text-sm leading-6">{enterprise.description}</p>
                      <div className="mt-4 rounded-lg bg-paper p-3 text-sm text-[#53615a]">
                        <strong className="text-ink">ТБ:</strong> {enterprise.safety_note}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'news' && (
            <section className="grid gap-4">
              <SectionTitle title="Новости предприятий" text="Сгенерированная демо-лента показывает, как предприятия могут публиковать обновления, а туристы — выбирать актуальные экскурсии." />
              <NewsList news={news} variant="full" />
            </section>
          )}

          {activeTab === 'schedule' && (
            <section className="grid gap-4">
              <SectionTitle title="Расписание экскурсий" text="Пользователь выбирает слот, записывается и получает подтверждение с деталями входа и безопасности." />
              <div className="grid gap-3">
                {excursions.map((excursion) => (
                  <article key={excursion.id} className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-[#e7f2ef] px-2 py-1 text-xs font-bold text-teal">{formatDate(excursion.starts_at)}</span>
                        <span className="rounded-lg bg-[#fff3d8] px-2 py-1 text-xs font-bold text-[#8b5b00]">{excursion.duration_minutes} минут</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold">{excursion.title}</h3>
                      <p className="mt-1 text-sm text-[#53615a]">{excursion.enterprise_title}, {excursion.address}</p>
                      <p className="mt-3 text-sm">{excursion.route_summary}</p>
                    </div>
                    <div className="grid gap-2 md:min-w-[190px]">
                      <p className="text-sm font-semibold text-[#53615a]">
                        Свободно {Math.max(excursion.seats_total - excursion.seats_taken, 0)} из {excursion.seats_total}
                      </p>
                      <PrimaryButton disabled={excursion.seats_taken >= excursion.seats_total} onClick={() => openBooking(excursion)}>
                        <BadgeCheck size={18} />
                        Записаться
                      </PrimaryButton>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'test' && (
            <section className="grid gap-4">
              <SectionTitle title="Профориентационный тест" text="Короткий сценарий после регистрации. Результат сохраняется в цифровом паспорте." />
              <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                <div className="grid gap-4">
                  {testQuestions.map((question, index) => (
                    <fieldset key={question.id} className="rounded-lg border border-line bg-white p-4">
                      <legend className="px-1 text-base font-bold">{index + 1}. {question.title}</legend>
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
                  <PrimaryButton className="w-fit" disabled={Object.keys(answers).length !== testQuestions.length} onClick={submitCareerTest}>
                    <ClipboardCheck size={18} />
                    Получить рекомендацию
                  </PrimaryButton>
                </div>
                <aside className="rounded-lg border border-line bg-white p-4">
                  <p className="text-xs font-bold uppercase text-teal">Как это работает</p>
                  <p className="mt-3 text-sm leading-6 text-[#53615a]">
                    MVP не делает сложную психометрику. Он показывает понятный сценарий: ответы превращаются в направление,
                    которое можно связать с предприятиями и экскурсиями.
                  </p>
                </aside>
              </div>
            </section>
          )}

          {activeTab === 'passport' && (
            <section className="grid gap-4">
              <SectionTitle title="Цифровой паспорт" text="Здесь собираются профиль, результат теста, записи на экскурсии и будущие версии документов." />
              <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
                <div className="rounded-lg border border-line bg-white p-4">
                  <div className="grid h-20 w-20 place-items-center rounded-lg bg-[#e7f2ef] text-teal">
                    <UserRound size={34} />
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{user?.full_name || 'Гость платформы'}</h3>
                  <p className="mt-1 text-sm text-[#53615a]">{user?.email || 'Зарегистрируйтесь, чтобы сохранить паспорт'}</p>
                  <div className="mt-4 grid gap-2 text-sm">
                    <p><strong>Телефон:</strong> {user?.phone || 'не указан'}</p>
                    <p><strong>Свободных мест:</strong> {freeSeats}</p>
                    <p><strong>Ближайшее предприятие:</strong> {selectedEnterprise?.title}</p>
                  </div>
                  {!user && (
                    <PrimaryButton className="mt-4 w-full" onClick={() => setRegisterOpen(true)}>
                      <LogIn size={18} />
                      Создать аккаунт
                    </PrimaryButton>
                  )}
                </div>
                <div className="grid gap-4">
                  <StatusPanel title="Рекомендация по специальности" emptyText="Пройдите тест, чтобы увидеть подходящее направление.">
                    {careerResult && (
                      <div className="rounded-lg border border-line bg-white p-4">
                        <p className="text-xs font-bold uppercase text-amber">{careerResult.score_profile}</p>
                        <h3 className="mt-2 text-xl font-bold">{careerResult.specialty}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#53615a]">{careerResult.explanation}</p>
                      </div>
                    )}
                  </StatusPanel>
                  <StatusPanel title="Подтверждение записи" emptyText="После записи здесь появятся адрес, дата, время и комментарий предприятия.">
                    {confirmation && (
                      <div className="rounded-lg border border-teal bg-[#f3fbf9] p-4">
                        <div className="flex items-start gap-3">
                          <BadgeCheck className="mt-1 text-teal" size={22} />
                          <div>
                            <p className="text-xs font-bold uppercase text-teal">Запись подтверждена</p>
                            <h3 className="mt-2 text-xl font-bold">{confirmation.enterprise}</h3>
                            <div className="mt-3 grid gap-2 text-sm">
                              <p><strong>Адрес:</strong> {confirmation.address}</p>
                              <p><strong>Дата и время:</strong> {formatDate(confirmation.starts_at)}</p>
                              <p><strong>Комментарий:</strong> {confirmation.guide_comment}</p>
                              <p><strong>Техника безопасности:</strong> {confirmation.safety_note}</p>
                            </div>
                            <div className="mt-4 rounded-lg border border-line bg-white p-3">
                              <p className="text-sm font-semibold text-ink">Напоминание после экскурсии</p>
                              <p className="mt-1 text-sm leading-6 text-[#53615a]">
                                Вернитесь в веб-приложение после посещения, оцените экскурсию, откройте Яндекс-анкету
                                и сохраните впечатления в цифровом паспорте.
                              </p>
                              <PrimaryButton className="mt-3" onClick={() => setActiveTab('feedback')}>
                                <MessageSquareText size={18} />
                                Оставить отзыв
                              </PrimaryButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </StatusPanel>
                  <StatusPanel title="Обратная связь" emptyText="После экскурсии здесь появится оценка и сохранённые впечатления туриста.">
                    {feedbackResult && (
                      <div className="rounded-lg border border-line bg-white p-4">
                        <p className="text-xs font-bold uppercase text-teal">Отзыв сохранён</p>
                        <h3 className="mt-2 text-xl font-bold">Оценка: {feedbackResult.rating}/5</h3>
                        <p className="mt-2 text-sm leading-6 text-[#53615a]">{feedbackResult.impressions}</p>
                        <p className="mt-3 text-sm text-[#53615a]">
                          Яндекс-анкета: {feedbackResult.yandex_completed ? 'пройдена' : 'ожидает прохождения'}
                        </p>
                      </div>
                    )}
                  </StatusPanel>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'feedback' && (
            <section className="grid gap-4">
              <SectionTitle
                title="Обратная связь после экскурсии"
                text="После записи туристу нужно напомнить вернуться в веб-приложение, оценить прошедшую экскурсию, перейти к анкете в Яндексе и зафиксировать впечатления."
              />
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

          {activeTab === 'admin' && (
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

function SectionTitle({ title, text }) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#53615a]">{text}</p>
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
          {compact && <p className="mt-1 text-sm text-[#53615a]">Лента новостей встроена в модуль, как требовалось для MVP.</p>}
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
