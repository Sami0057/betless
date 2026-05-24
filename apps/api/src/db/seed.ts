import pool, { query } from './client';

const SAUDI_TEAMS = [
  { external_id: '2932', name: 'Al Hilal', name_ar: 'الهلال', short_name: 'HIL', primary_color: '#0035A7', logo: '/logos/al-hilal.png', stadium: 'King Fahd International Stadium' },
  { external_id: '2933', name: 'Al Nassr', name_ar: 'النصر', short_name: 'NAS', primary_color: '#FFCD00', logo: '/logos/al-nassr.png', stadium: 'Mrsool Park' },
  { external_id: '2934', name: 'Al Ittihad', name_ar: 'الاتحاد', short_name: 'ITT', primary_color: '#000000', logo: '/logos/al-ittihad.png', stadium: 'King Abdullah Sports City' },
  { external_id: '2935', name: 'Al Ahli', name_ar: 'الأهلي', short_name: 'AHL', primary_color: '#00743F', logo: '/logos/al-ahli.png', stadium: 'King Abdullah Sports City' },
  { external_id: '2941', name: 'Al Shabab', name_ar: 'الشباب', short_name: 'SHA', primary_color: '#000000', logo: '/logos/al-shabab.png', stadium: 'Prince Faisal bin Fahd Stadium' },
  { external_id: '2942', name: 'Al Qadsiah', name_ar: 'القادسية', short_name: 'QAD', primary_color: '#005BBB', logo: '/logos/al-qadsiah.png', stadium: 'Prince Mohamed bin Fahd Stadium' },
  { external_id: '2943', name: 'Al Faisaly', name_ar: 'الفيصلي', short_name: 'FAI', primary_color: '#008000', logo: '/logos/al-faisaly.png', stadium: 'King Abdulaziz Stadium' },
  { external_id: '2944', name: 'Al Ettifaq', name_ar: 'الاتفاق', short_name: 'ETT', primary_color: '#FFD700', logo: '/logos/al-ettifaq.png', stadium: 'Prince Mohamed bin Fahd Stadium' },
  { external_id: '2945', name: 'Al Taawoun', name_ar: 'التعاون', short_name: 'TAA', primary_color: '#FDB913', logo: '/logos/al-taawoun.png', stadium: 'Prince Sultan bin Fahd Stadium' },
  { external_id: '2946', name: 'Abha', name_ar: 'أبها', short_name: 'ABH', primary_color: '#1E3799', logo: '/logos/abha.png', stadium: 'Abha Club Stadium' },
  { external_id: '2947', name: 'Al Khaleej', name_ar: 'الخليج', short_name: 'KHA', primary_color: '#006400', logo: '/logos/al-khaleej.png', stadium: 'Prince Saud bin Jalawi Stadium' },
  { external_id: '2948', name: 'Al Riyadh', name_ar: 'الرياض', short_name: 'RIY', primary_color: '#FF0000', logo: '/logos/al-riyadh.png', stadium: 'Prince Faisal bin Fahd Stadium' },
  { external_id: '2949', name: 'Damac', name_ar: 'ضمك', short_name: 'DAM', primary_color: '#C0392B', logo: '/logos/damac.png', stadium: 'Damac Stadium' },
  { external_id: '2950', name: 'Al Hazem', name_ar: 'الحزم', short_name: 'HAZ', primary_color: '#1ABC9C', logo: '/logos/al-hazem.png', stadium: 'Prince Abdullah bin Jalawi Stadium' },
  { external_id: '2951', name: 'Al Fateh', name_ar: 'الفتح', short_name: 'FAT', primary_color: '#E74C3C', logo: '/logos/al-fateh.png', stadium: 'Prince Abdullah bin Jalawi Stadium' },
  { external_id: '2952', name: 'Al Wehda', name_ar: 'الوحدة', short_name: 'WEH', primary_color: '#004E9A', logo: '/logos/al-wehda.png', stadium: 'King Abdulaziz Stadium' },
];

const BADGES = [
  { name: 'First Prediction', name_ar: 'أول تنبؤ', description: 'Made your first prediction', description_ar: 'قدمت أول تنبؤ لك', icon: '🎯', rarity: 'common', requirement_type: 'total_predictions', requirement_value: 1 },
  { name: 'Hot Streak', name_ar: 'سلسلة نارية', description: '5 correct predictions in a row', description_ar: '5 تنبؤات صحيحة متتالية', icon: '🔥', rarity: 'rare', requirement_type: 'streak', requirement_value: 5 },
  { name: 'On Fire', name_ar: 'في قمة اللهب', description: '10 correct predictions in a row', description_ar: '10 تنبؤات صحيحة متتالية', icon: '💥', rarity: 'epic', requirement_type: 'streak', requirement_value: 10 },
  { name: 'Legend Streak', name_ar: 'سلسلة أسطورية', description: '20 correct predictions in a row', description_ar: '20 تنبؤات صحيحة متتالية', icon: '👑', rarity: 'legendary', requirement_type: 'streak', requirement_value: 20 },
  { name: 'Century Club', name_ar: 'نادي المئة', description: '100 correct predictions total', description_ar: '100 تنبؤ صحيح إجمالاً', icon: '💯', rarity: 'epic', requirement_type: 'correct_predictions', requirement_value: 100 },
  { name: 'Sharp Eye', name_ar: 'عين حادة', description: '50% success rate with 20+ predictions', description_ar: 'معدل نجاح 50% مع أكثر من 20 تنبؤاً', icon: '👁️', rarity: 'common', requirement_type: 'success_rate', requirement_value: 50 },
  { name: 'Derby Master', name_ar: 'سيد الديربي', description: 'Correctly predict 5 derby matches', description_ar: 'توقع 5 مباريات ديربي بشكل صحيح', icon: '⚔️', rarity: 'rare', requirement_type: 'derby_correct', requirement_value: 5 },
  { name: 'Points Collector', name_ar: 'جامع النقاط', description: 'Earn 1000 total points', description_ar: 'اكسب 1000 نقطة إجمالية', icon: '⭐', rarity: 'rare', requirement_type: 'total_points', requirement_value: 1000 },
  { name: 'Elite Points', name_ar: 'نقاط النخبة', description: 'Earn 5000 total points', description_ar: 'اكسب 5000 نقطة إجمالية', icon: '💎', rarity: 'legendary', requirement_type: 'total_points', requirement_value: 5000 },
  { name: 'Early Bird', name_ar: 'الطائر الباكر', description: 'Submit predictions 2h before kickoff, 10 times', description_ar: 'قدم التنبؤات قبل ساعتين من الانطلاق 10 مرات', icon: '🌅', rarity: 'common', requirement_type: 'early_predictions', requirement_value: 10 },
];

async function seedTeams() {
  console.log('🌱 Seeding teams...');
  for (const team of SAUDI_TEAMS) {
    await query(
      `INSERT INTO teams (external_id, name, name_ar, short_name, primary_color, logo, stadium)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (external_id) DO UPDATE SET
         name = EXCLUDED.name,
         name_ar = EXCLUDED.name_ar,
         short_name = EXCLUDED.short_name,
         primary_color = EXCLUDED.primary_color`,
      [team.external_id, team.name, team.name_ar, team.short_name, team.primary_color, team.logo, team.stadium]
    );
  }
  console.log(`✅ ${SAUDI_TEAMS.length} teams seeded`);
}

async function seedBadges() {
  console.log('🌱 Seeding badges...');
  for (const badge of BADGES) {
    await query(
      `INSERT INTO badges (name, name_ar, description, description_ar, icon, rarity, requirement_type, requirement_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING`,
      [badge.name, badge.name_ar, badge.description, badge.description_ar, badge.icon, badge.rarity, badge.requirement_type, badge.requirement_value]
    );
  }
  console.log(`✅ ${BADGES.length} badges seeded`);
}

async function seedSeason() {
  console.log('🌱 Seeding season...');
  await query(
    `INSERT INTO seasons (name, year, is_active, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT DO NOTHING`,
    ['Saudi Pro League 2024-25', 2024, true, '2024-08-01', '2025-05-31']
  );
  console.log('✅ Season seeded');
}

async function seedAdminUser() {
  const bcrypt = await import('bcryptjs');
  const { v4: uuidv4 } = await import('uuid');
  const hash = await bcrypt.hash('Admin@Betless2024!', 12);

  await query(
    `INSERT INTO users (id, username, email, password_hash, role, is_verified, rank_title, total_points)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (email) DO NOTHING`,
    [uuidv4(), 'betless_admin', 'admin@betless.app', hash, 'admin', true, 'Legend', 99999]
  );
  console.log('✅ Admin user seeded (email: admin@betless.app, password: Admin@Betless2024!)');
}

async function main() {
  console.log('🚀 Starting database seed...');
  try {
    await seedSeason();
    await seedTeams();
    await seedBadges();
    await seedAdminUser();
    console.log('\n🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
