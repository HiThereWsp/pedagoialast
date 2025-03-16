
-- Cette migration modifie la fonction handle_new_user_subscription
-- pour désactiver l'attribution automatique du statut beta
-- et mettre en place un essai de 3 jours pour tous les nouveaux utilisateurs

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  exp_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Tous les nouveaux utilisateurs obtiennent un essai de 3 jours
  exp_date := (now() + interval '3 days');
  
  INSERT INTO public.user_subscriptions (
    user_id, 
    type, 
    expires_at, 
    status
  )
  VALUES (
    NEW.id, 
    'trial'::subscription_type, 
    exp_date, 
    'active'::subscription_status
  );
  
  RETURN NEW;
END;
$function$;

-- Vous pouvez ensuite exécuter cette migration sur votre base de données Supabase
