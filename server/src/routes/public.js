import crypto from 'node:crypto';
import express from 'express';
import multer from 'multer';
import { dbAll, dbGet, dbRun } from '../db/db.js';
import { asyncHandler } from '../middleware/errors.js';

const router = express.Router();
const upload = multer({ dest: process.env.STORAGE_DIR || '../storage' });

function hashPassword(password) {
  return crypto.createHash('sha256').update(`demo:${password}`).digest('hex');
}

function validateRequired(body, fields) {
  for (const field of fields) {
    if (!body[field]) {
      const error = new Error(`Поле ${field} обязательно`);
      error.status = 400;
      throw error;
    }
  }
}

function mapCareerResult(answers) {
  const scores = { engineer: 0, safety: 0, automation: 0 };
  for (const answer of answers || []) {
    scores[answer] = (scores[answer] || 0) + 1;
  }
  const profile = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const variants = {
    engineer: {
      specialty: 'Инженер-технолог',
      explanation: 'Вам ближе работа с производственным процессом, материалами и качеством изделия.'
    },
    safety: {
      specialty: 'Специалист по промышленной безопасности',
      explanation: 'Ответы показывают интерес к правилам, рискам, маршрутам и безопасной организации посещений.'
    },
    automation: {
      specialty: 'Инженер по автоматизации процессов',
      explanation: 'Вам подходит направление с датчиками, контроллерами, цифровыми линиями и анализом данных.'
    }
  };
  return { score_profile: profile, ...variants[profile] };
}

router.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'industrial-tourist-passport' });
});

router.get('/platform', (_request, response) => {
  response.json({
    title: 'Модуль для региональной образовательной платформы',
    platform: 'Демо-оболочка: Госуслуги / Сферум / региональный портал',
    status: 'Демонстрационная версия цифрового паспорта промышленного туриста.',
    metrics: [
      { label: 'Подготовлено экскурсий', value: '10 за месяц' },
      { label: 'Целевая аудитория', value: '9-11 классы и студенты' },
      { label: 'Выбор промышленных специальностей', value: '5-7%' }
    ]
  });
});

router.get('/enterprises', asyncHandler(async (_request, response) => {
  const rows = await dbAll('SELECT * FROM enterprises ORDER BY id');
  response.json(rows);
}));

router.get('/excursions', asyncHandler(async (_request, response) => {
  const rows = await dbAll(`
    SELECT excursions.*, enterprises.title AS enterprise_title, enterprises.address, enterprises.city, enterprises.safety_note
    FROM excursions
    JOIN enterprises ON enterprises.id = excursions.enterprise_id
    ORDER BY starts_at
  `);
  response.json(rows);
}));

router.get('/news', asyncHandler(async (_request, response) => {
  const rows = await dbAll(`
    SELECT news.*, enterprises.title AS enterprise_title
    FROM news
    JOIN enterprises ON enterprises.id = news.enterprise_id
    ORDER BY published_at DESC
  `);
  response.json(rows);
}));

router.post('/auth/register', asyncHandler(async (request, response) => {
  validateRequired(request.body, ['full_name', 'email', 'phone', 'password']);
  const result = await dbRun(
    'INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
    [request.body.full_name, request.body.email, request.body.phone, hashPassword(request.body.password)]
  );
  response.status(201).json({ id: result.id, full_name: request.body.full_name, email: request.body.email, phone: request.body.phone });
}));

router.post('/profile/photo', upload.single('photo'), asyncHandler(async (request, response) => {
  validateRequired(request.body, ['user_id']);
  await dbRun('UPDATE users SET photo_path = ? WHERE id = ?', [request.file?.path || null, request.body.user_id]);
  response.json({ ok: true, file: request.file?.filename || null });
}));

router.post('/career-test', asyncHandler(async (request, response) => {
  const result = mapCareerResult(request.body.answers);
  await dbRun(
    'INSERT INTO career_results (user_id, score_profile, specialty, explanation) VALUES (?, ?, ?, ?)',
    [request.body.user_id || null, result.score_profile, result.specialty, result.explanation]
  );
  response.json(result);
}));

router.post('/bookings', asyncHandler(async (request, response) => {
  validateRequired(request.body, ['excursion_id', 'visitor_name', 'email', 'phone']);
  const excursion = await dbGet(`
    SELECT excursions.*, enterprises.title AS enterprise_title, enterprises.address, enterprises.safety_note
    FROM excursions
    JOIN enterprises ON enterprises.id = excursions.enterprise_id
    WHERE excursions.id = ?
  `, [request.body.excursion_id]);
  if (!excursion) {
    const error = new Error('Экскурсия не найдена');
    error.status = 404;
    throw error;
  }
  if (excursion.seats_taken >= excursion.seats_total) {
    const error = new Error('На экскурсию больше нет свободных мест');
    error.status = 409;
    throw error;
  }

  const booking = await dbRun(
    'INSERT INTO bookings (user_id, excursion_id, visitor_name, email, phone) VALUES (?, ?, ?, ?, ?)',
    [request.body.user_id || null, request.body.excursion_id, request.body.visitor_name, request.body.email, request.body.phone]
  );
  await dbRun('UPDATE excursions SET seats_taken = seats_taken + 1 WHERE id = ?', [request.body.excursion_id]);

  response.status(201).json({
    id: booking.id,
    status: 'confirmed',
    enterprise: excursion.enterprise_title,
    address: excursion.address,
    starts_at: excursion.starts_at,
    guide_comment: excursion.guide_comment,
    safety_note: excursion.safety_note
  });
}));

router.get('/bookings', asyncHandler(async (_request, response) => {
  const rows = await dbAll(`
    SELECT bookings.*, excursions.title AS excursion_title, excursions.starts_at, enterprises.title AS enterprise_title
    FROM bookings
    JOIN excursions ON excursions.id = bookings.excursion_id
    JOIN enterprises ON enterprises.id = excursions.enterprise_id
    ORDER BY bookings.created_at DESC
  `);
  response.json(rows);
}));

router.post('/feedback', asyncHandler(async (request, response) => {
  validateRequired(request.body, ['rating', 'impressions']);
  const rating = Number(request.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    const error = new Error('Оценка должна быть от 1 до 5');
    error.status = 400;
    throw error;
  }
  const result = await dbRun(
    'INSERT INTO feedback (booking_id, rating, impressions, yandex_completed) VALUES (?, ?, ?, ?)',
    [
      request.body.booking_id || null,
      rating,
      request.body.impressions,
      request.body.yandex_completed ? 1 : 0
    ]
  );
  response.status(201).json({
    id: result.id,
    booking_id: request.body.booking_id || null,
    rating,
    impressions: request.body.impressions,
    yandex_completed: Boolean(request.body.yandex_completed),
    created_at: new Date().toISOString()
  });
}));

router.get('/feedback', asyncHandler(async (_request, response) => {
  const rows = await dbAll(`
    SELECT feedback.*, bookings.visitor_name, excursions.title AS excursion_title, enterprises.title AS enterprise_title
    FROM feedback
    LEFT JOIN bookings ON bookings.id = feedback.booking_id
    LEFT JOIN excursions ON excursions.id = bookings.excursion_id
    LEFT JOIN enterprises ON enterprises.id = excursions.enterprise_id
    ORDER BY feedback.created_at DESC
  `);
  response.json(rows);
}));

export default router;
