-- =====================================================
-- Server-Side Security Enhancements for Hybrid Encryption
-- =====================================================
-- This migration adds additional server-side security measures
-- to complement the client-side encryption already in place.

-- 1. Enable additional RLS policies for enhanced security
-- (RLS already enabled in initial migration, this adds logging)

-- 2. Add audit columns for security tracking
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

ALTER TABLE public.budgets 
  ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

ALTER TABLE public.goals 
  ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

-- 3. Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own audit logs
CREATE POLICY "Users can view own audit logs" ON public.security_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert audit logs (via service role)
CREATE POLICY "Service role can insert audit logs" ON public.security_audit_log
  FOR INSERT WITH CHECK (true);

-- 4. Function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_data_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.security_audit_log (user_id, action, table_name, record_id)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Create triggers for audit logging on sensitive tables
DROP TRIGGER IF EXISTS audit_transactions_access ON public.transactions;
CREATE TRIGGER audit_transactions_access
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.log_data_access();

DROP TRIGGER IF EXISTS audit_profiles_access ON public.profiles;
CREATE TRIGGER audit_profiles_access
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_data_access();

-- 6. Add index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id 
  ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at 
  ON public.security_audit_log(created_at DESC);

-- 7. Function to update last_login_at on profile
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET last_login_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON TABLE public.security_audit_log IS 'Audit log for tracking data access and modifications for security compliance';
COMMENT ON COLUMN public.profiles.encryption_version IS 'Version of client-side encryption used for this record';
COMMENT ON COLUMN public.transactions.encryption_version IS 'Version of client-side encryption used for this record';
