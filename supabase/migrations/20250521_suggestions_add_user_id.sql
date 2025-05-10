-- Vérifier si la table suggestions existe déjà
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'suggestions') THEN
        -- Vérifier si la colonne user_id existe déjà
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'suggestions' 
                      AND column_name = 'user_id') THEN
            -- Ajouter la colonne user_id
            ALTER TABLE suggestions 
            ADD COLUMN user_id UUID REFERENCES auth.users(id);
        END IF;
    ELSE
        -- Créer la table suggestions avec la colonne user_id
        CREATE TABLE suggestions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            votes INTEGER DEFAULT 0,
            status TEXT DEFAULT 'créé',
            author TEXT,
            author_id TEXT,
            user_id UUID REFERENCES auth.users(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            type TEXT,
            tool_name TEXT
        );
    END IF;
END $$;

-- S'assurer que la RLS est activée
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS pour la table suggestions
-- Permettre aux utilisateurs authentifiés de créer des suggestions
CREATE POLICY IF NOT EXISTS "Allow users to create suggestions" ON suggestions
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Permettre aux utilisateurs de voir toutes les suggestions
CREATE POLICY IF NOT EXISTS "Allow users to view all suggestions" ON suggestions
  FOR SELECT TO authenticated
  USING (true);

-- Permettre aux utilisateurs de mettre à jour uniquement leurs propres suggestions
CREATE POLICY IF NOT EXISTS "Allow users to update their own suggestions" ON suggestions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Permettre aux utilisateurs de supprimer uniquement leurs propres suggestions
CREATE POLICY IF NOT EXISTS "Allow users to delete their own suggestions" ON suggestions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid()); 