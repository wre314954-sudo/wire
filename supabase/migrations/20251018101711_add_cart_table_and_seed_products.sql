/*
  # Add Cart Table and Seed Products

  ## 1. New Tables

  ### `carts`
  - `id` (uuid, primary key) - Unique cart identifier
  - `user_id` (uuid, unique) - References users table
  - `items` (jsonb) - Cart items array
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security

  ### `carts` table policies
  - Users can view their own cart
  - Users can insert their own cart
  - Users can update their own cart
  - Users can delete their own cart

  ## 3. Seed Data
  - Insert initial product catalog from the application
*/

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- Enable Row Level Security
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Cart table policies
CREATE POLICY "Users can view own cart"
  ON carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
  ON carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed initial products
INSERT INTO products (name, brand, category, colors, description, specifications, base_price, unit_type, stock_quantity, image_url, brochure_url, is_active) VALUES
  ('FR PVC Insulated Wire 1.5 sq mm', 'Polycab', 'House Wires', ARRAY['Red', 'Blue', 'Yellow', 'Green', 'Black'], 'Flame retardant PVC insulated copper conductor wire suitable for domestic and commercial applications.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "FR PVC", "size": "1.5 sq mm", "standard": "IS 694:2010"}', 28.50, 'metres', 5000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', '/brochures/polycab-house-wire.pdf', true),
  ('FR PVC Insulated Wire 2.5 sq mm', 'Polycab', 'House Wires', ARRAY['Red', 'Blue', 'Yellow', 'Black'], 'Heavy duty flame retardant wire for higher load applications.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "FR PVC", "size": "2.5 sq mm", "standard": "IS 694:2010"}', 45.00, 'metres', 4000, 'https://images.pexels.com/photos/6419122/pexels-photo-6419122.jpeg', null, true),
  ('HRFR Cable 4 sq mm', 'Havells', 'Building Wires', ARRAY['Red', 'Blue', 'Yellow', 'Green'], 'Heat resistant and flame retardant cable for industrial and residential use.', '{"voltage": "1100V", "conductor": "Electrolytic Copper", "insulation": "HRFR PVC", "size": "4 sq mm", "standard": "IS 694:2010"}', 68.00, 'metres', 3500, 'https://images.pexels.com/photos/163676/cannabis-hemp-plant-weed-163676.jpeg', null, true),
  ('Armoured LT Cable 3 Core 50 sq mm', 'KEI', 'Power Cables', ARRAY['Black'], 'Armoured low tension cable for underground and outdoor power distribution.', '{"voltage": "1.1 kV", "conductor": "Aluminium", "insulation": "XLPE", "size": "3 Core x 50 sq mm", "armour": "Galvanized Steel Wire"}', 425.00, 'metres', 2000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', null, true),
  ('Flexible Cable 0.75 sq mm', 'Finolex', 'Flexible Cables', ARRAY['Red', 'Blue', 'Yellow', 'White', 'Black'], 'Multi-strand flexible copper cable for appliances and electronics.', '{"voltage": "750V", "conductor": "Tinned Copper", "insulation": "PVC", "size": "0.75 sq mm", "strands": "24/0.20"}', 18.00, 'metres', 6000, 'https://images.pexels.com/photos/6419122/pexels-photo-6419122.jpeg', null, true),
  ('FR Wire 6 sq mm', 'V-Guard', 'House Wires', ARRAY['Red', 'Blue', 'Yellow', 'Green', 'Black'], 'High quality flame retardant wire for heavy duty applications.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "FR PVC", "size": "6 sq mm", "standard": "IS 694:2010"}', 95.00, 'metres', 3000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', null, true),
  ('Submersible Cable 3 Core 4 sq mm', 'RR Kabel', 'Submersible Cables', ARRAY['Black'], 'Water resistant cable designed for submersible pump applications.', '{"voltage": "1100V", "conductor": "Tinned Copper", "insulation": "PVC", "size": "3 Core x 4 sq mm", "sheath": "PVC"}', 85.00, 'metres', 2500, 'https://images.pexels.com/photos/163676/cannabis-hemp-plant-weed-163676.jpeg', null, true),
  ('Coaxial Cable RG6', 'Anchor', 'Communication Cables', ARRAY['White', 'Black'], 'High quality coaxial cable for TV, CCTV and broadband applications.', '{"type": "RG6", "impedance": "75 Ohm", "conductor": "Copper Clad Steel", "shielding": "Braided + Foil", "jacket": "PVC"}', 22.00, 'metres', 8000, 'https://images.pexels.com/photos/6419122/pexels-photo-6419122.jpeg', null, true),
  ('Control Cable 7 Core 1.5 sq mm', 'L&T', 'Control Cables', ARRAY['Grey'], 'Multi-core control cable for industrial automation and control panels.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "PVC", "size": "7 Core x 1.5 sq mm", "sheath": "PVC"}', 72.00, 'metres', 1500, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', null, true),
  ('Solar DC Cable 4 sq mm', 'Polycab', 'Solar Cables', ARRAY['Red', 'Black'], 'UV resistant cable specially designed for solar panel installations.', '{"voltage": "1500V DC", "conductor": "Tinned Copper", "insulation": "XLPO", "size": "4 sq mm", "temperature": "-40°C to +120°C"}', 58.00, 'metres', 4500, 'https://images.pexels.com/photos/163676/cannabis-hemp-plant-weed-163676.jpeg', null, true)
ON CONFLICT DO NOTHING;