/*
  # Complete Base Schema for WireBazaar

  ## Overview
  Creates all necessary tables using Supabase Auth for authentication.
  Products, orders, inquiries, and carts are stored and synced globally.

  ## 1. New Tables

  ### `users`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `phone` (text) - Phone number
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `owner_credentials`
  - `id` (uuid, primary key) - Credential identifier
  - `user_id` (uuid, unique) - References users table
  - `created_at` (timestamptz) - Creation timestamp

  ### `products`
  - Global product catalog visible to all users
  - Managed by owners only

  ### `orders`
  - User-specific orders
  - Owners can view all orders

  ### `inquiries`
  - Custom quote requests
  - Owners can view and manage

  ### `carts`
  - User-specific shopping carts
  - Synced across devices

  ## 2. Security
  - RLS enabled on all tables
  - Authenticated users can access their own data
  - Owner credentials checked for admin access
  - Products visible to all authenticated users
  - Orders and carts are user-specific

  ## 3. Important Notes
  - Uses Supabase Auth (auth.users) for authentication
  - All data syncs globally across devices
  - Owner dashboard requires owner_credentials entry
*/

-- Create helper function for timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============ Users Table ============
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============ Owner Credentials Table (Create BEFORE products) ============
CREATE TABLE IF NOT EXISTS owner_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_owner_credentials_user_id ON owner_credentials(user_id);

ALTER TABLE owner_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own owner status"
  ON owner_credentials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============ Products Table ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  colors text[] NOT NULL DEFAULT '{}',
  description text,
  specifications jsonb DEFAULT '{}',
  base_price decimal(10, 2) NOT NULL,
  unit_type text NOT NULL CHECK (unit_type IN ('metres', 'coils')),
  stock_quantity integer NOT NULL DEFAULT 0,
  image_url text,
  brochure_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Owners can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM owner_credentials
      WHERE owner_credentials.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM owner_credentials
      WHERE owner_credentials.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM owner_credentials
      WHERE owner_credentials.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM owner_credentials
      WHERE owner_credentials.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM owner_credentials
      WHERE owner_credentials.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============ Orders Table ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  customer_pincode text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal decimal(12, 2) NOT NULL,
  shipping_cost decimal(10, 2) DEFAULT 0,
  total_amount decimal(12, 2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_method text DEFAULT 'qr_code',
  payment_proof_url text,
  qr_code_data text,
  transaction_id text,
  estimated_delivery text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM owner_credentials
      WHERE owner_credentials.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM owner_credentials
      WHERE owner_credentials.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============ Inquiries Table ============
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type text NOT NULL CHECK (user_type IN ('retail', 'business', 'contractor')),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  pincode text NOT NULL,
  product_name text NOT NULL,
  brand text NOT NULL,
  color text NOT NULL,
  quantity integer NOT NULL,
  unit text NOT NULL,
  specifications jsonb DEFAULT '{}',
  verification_code text,
  is_verified boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON inquiries(phone);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert inquiries"
  ON inquiries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Owners can view all inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM owner_credentials
      WHERE owner_credentials.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update inquiries"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM owner_credentials
      WHERE owner_credentials.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============ Carts Table ============
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============ Seed Initial Products ============
INSERT INTO products (name, brand, category, colors, description, specifications, base_price, unit_type, stock_quantity, image_url, is_active) VALUES
  ('FR PVC Insulated Wire 1.5 sq mm', 'Polycab', 'House Wires', ARRAY['Red', 'Blue', 'Yellow', 'Green', 'Black'], 'Flame retardant PVC insulated copper conductor wire suitable for domestic and commercial applications.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "FR PVC", "size": "1.5 sq mm", "standard": "IS 694:2010"}', 28.50, 'metres', 5000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', true),
  ('FR PVC Insulated Wire 2.5 sq mm', 'Polycab', 'House Wires', ARRAY['Red', 'Blue', 'Yellow', 'Black'], 'Heavy duty flame retardant wire for higher load applications.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "FR PVC", "size": "2.5 sq mm", "standard": "IS 694:2010"}', 45.00, 'metres', 4000, 'https://images.pexels.com/photos/6419122/pexels-photo-6419122.jpeg', true),
  ('HRFR Cable 4 sq mm', 'Havells', 'Building Wires', ARRAY['Red', 'Blue', 'Yellow', 'Green'], 'Heat resistant and flame retardant cable for industrial and residential use.', '{"voltage": "1100V", "conductor": "Electrolytic Copper", "insulation": "HRFR PVC", "size": "4 sq mm", "standard": "IS 694:2010"}', 68.00, 'metres', 3500, 'https://images.pexels.com/photos/163676/cannabis-hemp-plant-weed-163676.jpeg', true),
  ('Armoured LT Cable 3 Core 50 sq mm', 'KEI', 'Power Cables', ARRAY['Black'], 'Armoured low tension cable for underground and outdoor power distribution.', '{"voltage": "1.1 kV", "conductor": "Aluminium", "insulation": "XLPE", "size": "3 Core x 50 sq mm", "armour": "Galvanized Steel Wire"}', 425.00, 'metres', 2000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', true),
  ('Flexible Cable 0.75 sq mm', 'Finolex', 'Flexible Cables', ARRAY['Red', 'Blue', 'Yellow', 'White', 'Black'], 'Multi-strand flexible copper cable for appliances and electronics.', '{"voltage": "750V", "conductor": "Tinned Copper", "insulation": "PVC", "size": "0.75 sq mm", "strands": "24/0.20"}', 18.00, 'metres', 6000, 'https://images.pexels.com/photos/6419122/pexels-photo-6419122.jpeg', true),
  ('FR Wire 6 sq mm', 'V-Guard', 'House Wires', ARRAY['Red', 'Blue', 'Yellow', 'Green', 'Black'], 'High quality flame retardant wire for heavy duty applications.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "FR PVC", "size": "6 sq mm", "standard": "IS 694:2010"}', 95.00, 'metres', 3000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', true),
  ('Submersible Cable 3 Core 4 sq mm', 'RR Kabel', 'Submersible Cables', ARRAY['Black'], 'Water resistant cable designed for submersible pump applications.', '{"voltage": "1100V", "conductor": "Tinned Copper", "insulation": "PVC", "size": "3 Core x 4 sq mm", "sheath": "PVC"}', 85.00, 'metres', 2500, 'https://images.pexels.com/photos/163676/cannabis-hemp-plant-weed-163676.jpeg', true),
  ('Coaxial Cable RG6', 'Anchor', 'Communication Cables', ARRAY['White', 'Black'], 'High quality coaxial cable for TV, CCTV and broadband applications.', '{"type": "RG6", "impedance": "75 Ohm", "conductor": "Copper Clad Steel", "shielding": "Braided + Foil", "jacket": "PVC"}', 22.00, 'metres', 8000, 'https://images.pexels.com/photos/6419122/pexels-photo-6419122.jpeg', true),
  ('Control Cable 7 Core 1.5 sq mm', 'L&T', 'Control Cables', ARRAY['Grey'], 'Multi-core control cable for industrial automation and control panels.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "PVC", "size": "7 Core x 1.5 sq mm", "sheath": "PVC"}', 72.00, 'metres', 1500, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', true),
  ('Solar DC Cable 4 sq mm', 'Polycab', 'Solar Cables', ARRAY['Red', 'Black'], 'UV resistant cable specially designed for solar panel installations.', '{"voltage": "1500V DC", "conductor": "Tinned Copper", "insulation": "XLPO", "size": "4 sq mm", "temperature": "-40°C to +120°C"}', 58.00, 'metres', 4500, 'https://images.pexels.com/photos/163676/cannabis-hemp-plant-weed-163676.jpeg', true)
ON CONFLICT DO NOTHING;