-- ============================================================
-- Stella Vaulting Academy – Seed Data
-- Run after migrations. Replace placeholder URLs with real images.
-- ============================================================

-- ============================================================
-- SITE SETTINGS
-- ============================================================
insert into site_settings (key, value) values
  ('site_name', '"Stella Vaulting Academy"'),
  ('site_tagline', '"Elite equestrian vaulting — Western Australia"'),
  ('contact_email', '"info@stellavaulting.com.au"'),
  ('instagram_url', '"https://instagram.com/stellavaultingacademy"'),
  ('facebook_url', '"https://facebook.com/stellavaultingacademy"'),
  ('next_event_id', 'null')
on conflict (key) do update set value = excluded.value;

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
insert into team_members (name, role, bio, display_order, published) values
  ('Siri', 'Head Coach & Director', 'Siri leads Stella Vaulting Academy with years of competitive vaulting experience at the international level. Her passion for the sport and dedication to developing elite athletes drives everything we do.', 1, true),
  ('Rhiannon', 'Senior Vaulter', 'Rhiannon is one of our senior competitive vaulters, bringing grace, strength and artistry to every performance. She is a role model for younger members of the academy.', 2, true),
  ('Imelda', 'IVC Rising Star Athlete', 'Imelda is Stella Vaulting Academy''s IVC Rising Star athlete. Her rapid progression and natural talent make her a standout competitor on the international stage.', 3, true),
  ('Zara', 'Vaulter', 'Zara brings incredible athleticism and creativity to her vaulting. She trains rigorously and continues to raise the bar in every session.', 4, true),
  ('Claire', 'Vaulter & Team Captain', 'Claire leads by example on and off the horse. As team captain, she fosters the supportive and ambitious culture that defines Stella Vaulting Academy.', 5, true)
on conflict do nothing;

-- ============================================================
-- FUNDRAISING PRODUCTS
-- ============================================================
insert into fundraising_products (name, description, price, emoji, display_order, published) values
  ('Buy our lunger a coffee', 'Keep our dedicated lunger fuelled and focused. A small gesture that means the world!', 5.00, '☕', 1, true),
  ('Add a cake', 'Treat the team to something sweet — they absolutely deserve it after training!', 10.00, '🎂', 2, true),
  ('Buy breakfast for Moose', 'Includes a hay bale for our star horse Moose. He works hard too!', 50.00, '🐴', 3, true),
  ('Add some snacks for Moose', 'Keep Moose happy between sessions with extra snacks and treats.', 75.00, '🌾', 4, true),
  ('Add some sparkle to the arena', 'Help us make the arena a magical place for training and performance.', 100.00, '✨', 5, true),
  ('Give Moose a body work session', 'Invest in Moose''s wellbeing with a professional body work session.', 150.00, '💆', 6, true),
  ('New vaulting shoes or costume', 'Help our vaulters look and feel their absolute best in competition.', 200.00, '👠', 7, true)
on conflict do nothing;

-- ============================================================
-- EVENTS
-- ============================================================
insert into events (name, event_date, location, description, fundraising_target, show_countdown, published) values
  (
    'FEI World Vaulting Championships 2025',
    '2025-10-15 09:00:00+00',
    'Ermelo, Netherlands',
    'The pinnacle of international vaulting — Stella Vaulting Academy''s athletes will represent Australia at the FEI World Vaulting Championships. Follow our journey and help us get there!',
    15000.00,
    true,
    true
  ),
  (
    'State Vaulting Championships 2025',
    '2025-08-20 08:00:00+00',
    'Western Australia Equestrian Centre, Perth',
    'The annual State Vaulting Championships — our athletes will compete across multiple disciplines. Come along and cheer us on!',
    3000.00,
    true,
    true
  )
on conflict do nothing;

-- ============================================================
-- SPONSORSHIP ITEMS
-- ============================================================
insert into sponsorship_items (title, description, body, tier, amount, cta_text, cta_url, display_order, published) values
  (
    'Indoor Arena Sponsor',
    'Help us build an indoor arena to train year-round regardless of weather.',
    'We are seeking a major sponsor to help fund the construction of an indoor vaulting arena. This facility would allow our athletes to train year-round in a safe, professional environment — a critical step toward consistent international results. Your sponsorship would be prominently acknowledged on the arena, our website, and all official communications.',
    'platinum',
    50000.00,
    'Get in Touch',
    'mailto:sponsors@stellavaulting.com.au',
    1,
    true
  ),
  (
    'Imelda Alembick — IVC Rising Star',
    'Sponsor our IVC Rising Star athlete Imelda Alembick on her international journey.',
    'Imelda Alembick is our IVC Rising Star athlete, rapidly progressing toward international competition. Your sponsorship would directly support her training, travel costs and competition fees as she represents Stella Vaulting Academy on the world stage. Sponsors receive social media recognition, website feature, and VIP event invitations.',
    'gold',
    5000.00,
    'Sponsor Imelda',
    'mailto:sponsors@stellavaulting.com.au',
    2,
    true
  ),
  (
    'Team Equipment & Costumes',
    'Help equip our vaulters with professional-grade equipment and competition costumes.',
    'Competition-level vaulting requires high-quality equipment and costumes. Your sponsorship helps ensure our athletes are properly equipped to compete at their best, removing financial barriers that could otherwise limit their potential.',
    'silver',
    2000.00,
    'Support the Team',
    'mailto:sponsors@stellavaulting.com.au',
    3,
    true
  )
on conflict do nothing;

-- ============================================================
-- PAGES
-- ============================================================
insert into pages (slug, title, meta_description, published) values
  ('home', 'Home', 'Stella Vaulting Academy — Elite equestrian vaulting club in Western Australia', true),
  ('about', 'About Us', 'Learn about Stella Vaulting Academy and our mission', true),
  ('team', 'Meet Our Team', 'Meet the athletes and coaches of Stella Vaulting Academy', true),
  ('events', 'Upcoming Events', 'See what Stella Vaulting Academy is training for next', true),
  ('sponsorship', 'Sponsorship', 'Sponsorship opportunities with Stella Vaulting Academy', true),
  ('fundraising', 'Fundraising', 'Support Stella Vaulting Academy through our fundraising shop', true),
  ('gallery', 'Stella Gallery', 'Photos from Stella Vaulting Academy training and events', true),
  ('community-gallery', 'Community Gallery', 'Event photography available to purchase', true)
on conflict (slug) do nothing;

-- ============================================================
-- GALLERIES
-- ============================================================
insert into galleries (name, slug, description, gallery_type, published) values
  ('Training', 'training', 'Behind-the-scenes training sessions and daily practice.', 'stella', true),
  ('Events', 'events', 'Competition and event photography.', 'stella', true),
  ('Behind the Scenes', 'behind-the-scenes', 'Candid moments and life at Stella Vaulting Academy.', 'stella', true),
  ('State Championships 2024', 'state-champs-2024', 'Photography from the 2024 State Vaulting Championships.', 'community', true)
on conflict (slug) do nothing;

-- ============================================================
-- POSTS (pinned homepage posts)
-- ============================================================
insert into posts (slug, title, short_description, body, published, pinned, pin_order) values
  (
    'world-championships-journey',
    'Our Journey to the World Championships',
    'Follow Stella Vaulting Academy as we prepare for the FEI World Vaulting Championships in the Netherlands.',
    'We are incredibly excited to announce that Stella Vaulting Academy athletes are preparing for the FEI World Vaulting Championships. This is a monumental achievement for our club and represents years of dedication, sacrifice, and passion for the sport. Follow our journey and support us as we represent Australia on the world stage.',
    true,
    true,
    1
  ),
  (
    'imelda-ivc-rising-star',
    'Imelda Named IVC Rising Star',
    'We are thrilled to share that our very own Imelda has been named an IVC Rising Star athlete.',
    'Imelda''s incredible talent and relentless dedication have earned her the prestigious IVC Rising Star designation. This recognition opens doors to international competition opportunities and helps put Stella Vaulting Academy on the global map. We could not be more proud!',
    true,
    true,
    2
  ),
  (
    'indoor-arena-fundraiser',
    'Help Us Build an Indoor Arena',
    'We are fundraising to build an indoor arena — your support can make year-round training a reality.',
    'Training outdoors in Western Australia''s unpredictable weather has its challenges. An indoor arena would transform our athletes'' ability to train consistently and safely throughout the year. We are seeking sponsorship and community support to make this dream a reality. Every donation gets us closer.',
    true,
    true,
    3
  )
on conflict (slug) do nothing;
