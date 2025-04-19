/*
  # Mise à jour du schéma des ressources

  1. Modifications
    - Ajout de nouveaux types de ressources (book, use_case)
    - Mise à jour des politiques de sécurité

  2. Sécurité
    - Mise à jour des politiques RLS pour les nouvelles options
*/

-- Mise à jour du type enum pour les types de ressources
ALTER TYPE resource_type ADD VALUE IF NOT EXISTS 'book';
ALTER TYPE resource_type ADD VALUE IF NOT EXISTS 'use_case';

-- Mise à jour des politiques
DROP POLICY IF EXISTS "resources_read_policy" ON resources;
CREATE POLICY "resources_read_policy"
  ON resources FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "resources_insert_policy" ON resources;
CREATE POLICY "resources_insert_policy"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM admin_users
  ));

DROP POLICY IF EXISTS "resources_delete_policy" ON resources;
CREATE POLICY "resources_delete_policy"
  ON resources FOR DELETE
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM admin_users
  ));