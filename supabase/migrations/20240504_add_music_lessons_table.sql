-- Ajouter la table pour les paroles de chansons pédagogiques
CREATE TABLE IF NOT EXISTS public.saved_music_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  lyrics text NOT NULL,
  subject text,
  class_level text,
  music_genre text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Ajouter un trigger pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour la table saved_music_lessons
DROP TRIGGER IF EXISTS update_saved_music_lessons_updated_at ON public.saved_music_lessons;

CREATE TRIGGER update_saved_music_lessons_updated_at
BEFORE UPDATE ON public.saved_music_lessons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Ajouter les politiques RLS (Row Level Security) pour la table
ALTER TABLE public.saved_music_lessons ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à un utilisateur de voir uniquement ses propres leçons en musique
CREATE POLICY select_own_music_lessons ON public.saved_music_lessons
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour permettre à un utilisateur de modifier uniquement ses propres leçons en musique
CREATE POLICY update_own_music_lessons ON public.saved_music_lessons
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique pour permettre à un utilisateur de supprimer uniquement ses propres leçons en musique
CREATE POLICY delete_own_music_lessons ON public.saved_music_lessons
  FOR DELETE
  USING (auth.uid() = user_id);

-- Politique pour permettre à un utilisateur d'insérer des leçons en musique liées à son compte uniquement
CREATE POLICY insert_own_music_lessons ON public.saved_music_lessons
  FOR INSERT
  WITH CHECK (auth.uid() = user_id); 