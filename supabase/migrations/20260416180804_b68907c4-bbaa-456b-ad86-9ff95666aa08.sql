
-- Assign existing products to the new subcategories so parent filtering can be verified
UPDATE products SET category = 'Muna Satin', category_id = '92b34d3e-f063-4126-9aa9-f4eef5bd2d55' WHERE name = 'Muna Satin Hijab';
UPDATE products SET category = 'Plain Cotton', category_id = '0e9a9851-f0f9-410c-ba2c-0b0599d4db49' WHERE name IN ('Cotton 2.0 Hijab', 'Turkish Cotton Hijab');
UPDATE products SET category = 'Printed Cotton', category_id = 'a1d140d4-9dd3-4be1-981a-1a5544e33044' WHERE name = 'premium hijab';
UPDATE products SET category_id = 'ada2537e-084c-4e49-84d3-2312a8b4101b' WHERE category = 'Cotton' AND category_id IS NULL;
