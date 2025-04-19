/*
  # Add content table and update resources relationships

  1. New Tables
    - `contents` table to store step content
      - `id` (uuid, primary key)
      - `step_id` (uuid, foreign key to steps)
      - `title` (text)
      - `description` (text)
      - `order` (integer)
      - `created_at` (timestamptz)

  2. Changes
    - Update resources table to reference contents instead of steps
    - Add RLS policies for new table

  3. Security
    - Enable RLS on contents table
    - Add read policy for authenticated users
*/

-- Create contents table
CREATE TABLE contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid REFERENCES steps(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Update resources table to reference contents
ALTER TABLE resources 
DROP CONSTRAINT resources_step_id_fkey,
DROP COLUMN step_id,
ADD COLUMN content_id uuid REFERENCES contents(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "contents_read_policy"
  ON contents FOR SELECT
  TO authenticated
  USING (true);