import { apiUrl } from "@/config/api";

export interface LogParams {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'ACTIVATE' | 'DEACTIVATE';
  targetTable: string;
  targetId: number;
  details?: string;
}

/**
 * Helper function to log admin actions to the backend
 */
export async function logAdminAction(params: LogParams): Promise<void> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Token não encontrado. Log não será registrado.");
      return;
    }

    const base = apiUrl || "";
    const response = await fetch(`${base}/admin/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: params.action,
        target_table: params.targetTable,
        target_id: params.targetId,
        details: params.details,
      }),
    });

    if (!response.ok) {
      console.error("Erro ao registrar log:", response.status);
    }
  } catch (error) {
    console.error("Erro ao registrar log de admin:", error);
  }
}

/**
 * Convenience functions for common log actions
 */
export const adminLogger = {
  created: (targetTable: string, targetId: number, details?: string) =>
    logAdminAction({ action: 'CREATE', targetTable, targetId, details }),
  
  updated: (targetTable: string, targetId: number, details?: string) =>
    logAdminAction({ action: 'UPDATE', targetTable, targetId, details }),
  
  deleted: (targetTable: string, targetId: number, details?: string) =>
    logAdminAction({ action: 'DELETE', targetTable, targetId, details }),
  
  approved: (targetTable: string, targetId: number, details?: string) =>
    logAdminAction({ action: 'APPROVE', targetTable, targetId, details }),
  
  rejected: (targetTable: string, targetId: number, details?: string) =>
    logAdminAction({ action: 'REJECT', targetTable, targetId, details }),
  
  activated: (targetTable: string, targetId: number, details?: string) =>
    logAdminAction({ action: 'ACTIVATE', targetTable, targetId, details }),
  
  deactivated: (targetTable: string, targetId: number, details?: string) =>
    logAdminAction({ action: 'DEACTIVATE', targetTable, targetId, details }),
};
