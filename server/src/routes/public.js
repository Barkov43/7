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
  const scores = { technical: 0, creative: 0, science: 0 };
  for (const answer of answers || []) {
    scores[answer] = (scores[answer] || 0) + 1;
  }
  const profile = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const variants = {
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
      explanation: 'Вам подходят химическая, фармацевтическая и пищевая промышленность.',
      excursion_profile: 'science'
    }
  };
  return { score_profile: profile, scores, ...variants[profile] };
}

router.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'industrial-tourist-passport' });
});

router.get('/platform', (_request, response) => {
  response.json({
    title: 'Цифровой паспорт промышленного туриста',
    platform: 'Цифровой паспорт промышленного туриста',
    status: 'Демонстрационная версия цифрового паспорта промышленного туриста.',
    metrics: [
      { label: 'Предприятия в базе', value: '51' },
      { label: 'Целевая аудитория', value: '9-11 классы и студенты' },
      { label: 'Цель MVP', value: '30 записей в месяц' }
    ]
  });
});

router.get('/enterprises', asyncHandler(async (_request, response) => {
  const rows = await dbAll('SELECT * FROM enterprises ORDER BY id');
  response.json(rows.map((row) => ({ ...row, audiences: JSON.parse(row.audiences || '[]') })));
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
  response.status(201).json({
    id: result.id,
    full_name: request.body.full_name,
    email: request.body.email,
    phone: request.body.phone,
    class_name: request.body.class_name || '9Б',
    school: request.body.school || 'МБОУ Лицей № 21, г. Киров'
  });
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
  if (new Date(excursion.starts_at).getTime() - Date.now() < 2 * 60 * 60 * 1000) {
    const error = new Error('Запись закрывается за 2 часа до начала экскурсии');
    error.status = 409;
    throw error;
  }
  if (request.body.user_id) {
    const active = await dbAll(`
      SELECT excursions.starts_at, excursions.duration_minutes
      FROM bookings
      JOIN excursions ON excursions.id = bookings.excursion_id
      WHERE bookings.user_id = ? AND bookings.status IN ('pending', 'confirmed')
    `, [request.body.user_id]);
    const targetStart = new Date(excursion.starts_at).getTime();
    const targetEnd = targetStart + excursion.duration_minutes * 60 * 1000;
    const overlaps = active.some((item) => {
      const start = new Date(item.starts_at).getTime();
      const end = start + item.duration_minutes * 60 * 1000;
      return targetStart < end && targetEnd > start;
    });
    if (overlaps) {
      const error = new Error('Вы уже записаны на другую экскурсию в это время');
      error.status = 409;
      throw error;
    }
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

router.delete('/bookings/:id', asyncHandler(async (request, response) => {
  const booking = await dbGet(`
    SELECT bookings.*, excursions.starts_at
    FROM bookings
    JOIN excursions ON excursions.id = bookings.excursion_id
    WHERE bookings.id = ?
  `, [request.params.id]);
  if (!booking) {
    const error = new Error('Запись не найдена');
    error.status = 404;
    throw error;
  }
  if (new Date(booking.starts_at).getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    const error = new Error('Отмена доступна не позднее чем за 24 часа до экскурсии');
    error.status = 409;
    throw error;
  }
  await dbRun("UPDATE bookings SET status = 'cancelled_by_user' WHERE id = ?", [booking.id]);
  await dbRun('UPDATE excursions SET seats_taken = MAX(seats_taken - 1, 0) WHERE id = ?', [booking.excursion_id]);
  response.json({ id: booking.id, status: 'cancelled_by_user' });
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
