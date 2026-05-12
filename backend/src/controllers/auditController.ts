import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

/**
 * Helper to log an action
 */
export const createAuditLog = async (userId: string | undefined, action: string, entityType: string, entityId: string | undefined, details: any = {}) => {
  try {
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details
    }]);
  } catch (error) {
    console.error('Audit Log failed:', error);
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        users (
            email,
            full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
