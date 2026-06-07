import fs from 'node:fs';
import { dbGet, dbRun } from './db.js';

const enterpriseData = JSON.parse(
  fs.readFileSync(new URL('./enterprises-2025.json', import.meta.url), 'utf8')
);

const scheduleDates = [
  '2026-06-12T10:00:00', '2026-06-16T12:00:00', '2026-06-19T11:00:00',
  '2026-06-24T14:00:00', '2026-06-27T10:30:00', '2026-07-02T12:30:00',
  '2026-07-07T10:00:00', '2026-07-11T13:00:00', '2026-07-16T11:30:00',
  '2026-07-22T10:00:00', '2026-08-04T12:00:00', '2026-08-13T11:00:00'
];

function profileForIndustry(industry = '') {
  const value = industry.toLowerCase();
  if (/сувенир|художе|одеж|обув|мех|мебел|лес|дерев/.test(value)) return 'creative';
  if (/хим|фарма|молоч|пищ|кондитер|напит|биотех|медиц/.test(value)) return 'science';
  return 'technical';
}

export async function seedDemoData() {
  const existing = await dbGet('SELECT COUNT(*) as count FROM enterprises');
  if (existing.count > 0) return;

  for (const item of enterpriseData) {
    const safetyNote = item.restrictions.length
      ? item.restrictions.slice(0, 3).join('; ')
      : 'Перед посещением проводится обязательный инструктаж.';
    await dbRun(
      `INSERT INTO enterprises (
        title, city, address, industry, description, safety_note, image_url,
        website, excursion_title, excursion_address, excursion_description,
        audiences, price, profile
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.title, item.city, item.address, item.industry, item.description, safetyNote, item.image_url,
        item.website, item.excursion_title, item.excursion_address, item.excursion_description,
        JSON.stringify(item.audiences), item.price, profileForIndustry(item.industry)
      ]
    );
  }

  for (let index = 0; index < Math.min(12, enterpriseData.length); index += 1) {
    const item = enterpriseData[index];
    const seatsTotal = Math.max(item.capacity, 10);
    const seatsTaken = index === 8 ? seatsTotal : Math.min(4 + index, seatsTotal - 1);
    await dbRun(
      `INSERT INTO excursions (
        title, enterprise_id, starts_at, duration_minutes, seats_total, seats_taken,
        guide_comment, route_summary, age_restriction, price, profile
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.excursion_title, index + 1, scheduleDates[index], item.duration_minutes, seatsTotal, seatsTaken,
        `Сбор группы по адресу: ${item.excursion_address || item.address}.`,
        item.excursion_description,
        item.audiences.join(', ') || 'Школьники 9-11 классов и студенты',
        item.price,
        profileForIndustry(item.industry)
      ]
    );
  }

  for (let index = 0; index < 6; index += 1) {
    const item = enterpriseData[index];
    await dbRun(
      'INSERT INTO news (enterprise_id, title, body, published_at) VALUES (?, ?, ?, ?)',
      [
        index + 1,
        index % 2 === 0 ? 'Предприятие обновило профориентационный маршрут' : 'Открыта запись для школьных и студенческих групп',
        item.excursion_description,
        `2026-06-0${Math.max(1, 6 - index)}`
      ]
    );
  }
}
