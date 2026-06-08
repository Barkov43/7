import enterpriseData from './enterprises-2025.json';

export const mockPlatform = {
  title: 'Цифровой паспорт промышленного туриста',
  platform: 'Цифровой паспорт промышленного туриста',
  status: 'Расширенная демонстрационная версия по техническому заданию команды 7.',
  metrics: [
    { label: 'Предприятия в базе', value: '51' },
    { label: 'Целевая аудитория', value: '9-11 классы и студенты' },
    { label: 'Цель MVP', value: '30 записей в месяц' }
  ]
};

function profileForIndustry(industry = '') {
  const value = industry.toLowerCase();
  if (/сувенир|художе|одеж|обув|мех|мебел|лес|дерев/.test(value)) return 'creative';
  if (/хим|фарма|молоч|пищ|кондитер|напит|биотех|медиц/.test(value)) return 'science';
  return 'technical';
}

export const mockEnterprises = enterpriseData.map((item) => ({
  ...item,
  image_url: '/assets/hero-industrial-new.png',
  profile: profileForIndustry(item.industry),
  safety_note: item.restrictions.length
    ? item.restrictions.slice(0, 3).join('; ')
    : 'Перед посещением проводится обязательный инструктаж.'
}));

const scheduleDates = [
  '2026-06-12T10:00:00',
  '2026-06-16T12:00:00',
  '2026-06-19T11:00:00',
  '2026-06-24T14:00:00',
  '2026-06-27T10:30:00',
  '2026-07-02T12:30:00',
  '2026-07-07T10:00:00',
  '2026-07-11T13:00:00',
  '2026-07-16T11:30:00',
  '2026-07-22T10:00:00',
  '2026-08-04T12:00:00',
  '2026-08-13T11:00:00'
];

export const mockExcursions = mockEnterprises.slice(0, 12).map((enterprise, index) => ({
  id: index + 1,
  enterprise_id: enterprise.id,
  enterprise_title: enterprise.title,
  address: enterprise.excursion_address || enterprise.address,
  city: enterprise.city,
  industry: enterprise.industry,
  profile: enterprise.profile,
  title: enterprise.excursion_title,
  starts_at: scheduleDates[index],
  duration_minutes: enterprise.duration_minutes,
  age_restriction: enterprise.audiences.join(', ') || 'Школьники 9-11 классов и студенты',
  seats_total: Math.max(enterprise.capacity, 10),
  seats_taken: index === 8 ? Math.max(enterprise.capacity, 10) : Math.min(4 + index, Math.max(enterprise.capacity, 10) - 1),
  guide_comment: `Сбор группы по адресу: ${enterprise.excursion_address || enterprise.address}.`,
  safety_note: enterprise.safety_note,
  route_summary: enterprise.excursion_description,
  price: enterprise.price
}));

export const mockNews = mockEnterprises.slice(0, 6).map((enterprise, index) => ({
  id: index + 1,
  enterprise_id: enterprise.id,
  enterprise_title: enterprise.title,
  title: index % 2 === 0 ? 'Предприятие обновило профориентационный маршрут' : 'Открыта запись для школьных и студенческих групп',
  body: enterprise.excursion_description,
  published_at: `2026-06-0${Math.max(1, 6 - index)}`
}));

export const testQuestions = [
  ['leisure', 'Что вам интереснее делать в свободное время?', ['Конструировать, чинить что-то', 'Рисовать, вышивать, заниматься творчеством', 'Смотреть и читать познавательные материалы']],
  ['subjects', 'Какие школьные предметы нравятся?', ['Физика, математика', 'Биология, химия', 'ИЗО, музыка, технология']],
  ['environment', 'Какая рабочая среда вам больше подходит?', ['Строгий регламент, чистота, работа с вычислениями', 'Общение с людьми, лёгкая атмосфера', 'Творческая свобода']],
  ['emergency', 'На работе случилась аварийная ситуация. Что сделаете в первую очередь?', ['Начну следовать плану эвакуации', 'Помогу эвакуировать людей', 'Попытаюсь сохранить важные документы']],
  ['quality', 'Что для вас значит хорошо выполнить работу?', ['Добиться результата без брака', 'Получить уникальный результат', 'Найти способ сэкономить ресурсы']],
  ['problem', 'Какая неожиданная проблема скорее выведет вас из себя?', ['Непредсказуемое изменение свойств материала', 'Нестабильность химического процесса', 'Несоответствие чертежа реальной детали']],
  ['startup', 'Вас приглашают в стартап. Какая роль вам ближе?', ['Главный технолог', 'Инженер-конструктор', 'Дизайнер-предметник']],
  ['product', 'Что в готовом изделии интересует вас в первую очередь?', ['Как оно устроено внутри', 'Из каких материалов оно сделано и безопасно ли', 'Насколько оно эстетично и приятно на ощупь']],
  ['statement', 'Выберите утверждение, которое вам ближе.', ['Люблю порядок, точность и алгоритмы', 'Люблю экспериментировать с рецептурами и составами', 'Люблю эстетику, красоту и уникальность изделий']],
  ['outcome', 'Какой результат труда вдохновляет больше?', ['Функциональный механизм или здание', 'Вкусный продукт или полезное лекарство', 'Красивая вещь или предмет интерьера']],
  ['regulation', 'Готовы ли вы работать в условиях стерильности или строгого регламента?', ['Да, это не проблема', 'Скорее нет, мне нужна свобода творчества', 'Да, если это важно для безопасности']],
  ['social', 'Что вы скажете на предложение работать в социально значимой сфере?', ['Это не моё', 'С удовольствием', 'Пойду, если смогу творчески реализоваться']]
].map(([id, title, labels]) => ({
  id,
  title,
  options: labels.map((label, index) => ({ id: ['technical', 'creative', 'science'][index], label }))
}));

const careerProfiles = {
  technical: {
    specialty: 'Инженер-конструктор / оператор промышленного оборудования',
    backup_specialty: 'Специалист по техническому контролю',
    explanation: 'Вам подходят машиностроение, металлургия, домостроение и технические производства.',
    excursion_profile: 'technical'
  },
  creative: {
    specialty: 'Дизайнер-предметник / мастер художественного производства',
    backup_specialty: 'Технолог лёгкой промышленности',
    explanation: 'Вам близки художественные промыслы, производство одежды, мебели и изделий из дерева.',
    excursion_profile: 'creative'
  },
  science: {
    specialty: 'Технолог химического или пищевого производства',
    backup_specialty: 'Лаборант химического анализа',
    explanation: 'Вам подходят химическая, фармацевтическая и пищевая промышленность, а также социально значимые производства.',
    excursion_profile: 'science'
  }
};

export function fallbackCareerResult(answers) {
  const counts = answers.reduce((acc, answer) => ({ ...acc, [answer]: (acc[answer] || 0) + 1 }), {});
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const profile = ranked[0]?.[0] || 'technical';
  return {
    score_profile: profile,
    scores: counts,
    ...careerProfiles[profile]
  };
}
