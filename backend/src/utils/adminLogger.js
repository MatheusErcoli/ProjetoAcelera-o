const { AdminLog } = require("../models");

async function logAdminAction(adminId, action, targetTable, targetId, details = null) {
  try {
    await AdminLog.create({
      admin_id: adminId,
      action,
      target_table: targetTable,
      target_id: targetId,
      details,
    });
  } catch (err) {
    console.error("Erro ao criar log de admin:", err);
  }
}

module.exports = { logAdminAction };
