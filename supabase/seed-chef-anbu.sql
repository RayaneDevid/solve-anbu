-- Seed: Premier compte Chef ANBU
-- Mot de passe : ChefAnbu2026!
-- ⚠️  Change le mot de passe après ta première connexion

INSERT INTO users (id, rp_name, codename, password_hash, role, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Hiruzen Sarutobi',
  'Sandaime',
  '$2b$10$B7fZ7P13FCZW80ddfZGXwesHc8m4W7ILX5wV9zJYKUzYFLzuSETT.',
  'chef_anbu',
  'active',
  now(),
  now()
);
