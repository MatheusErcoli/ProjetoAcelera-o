const { AdminLog } = require("../models");

/**
 * Script to seed some example admin logs for testing
 */
async function seedAdminLogs() {
  try {
    // Criar alguns logs de exemplo
    const exampleLogs = [
      {
        admin_id: 1, // Assumindo que admin tem ID 1
        action: "ACTIVATE",
        target_table: "reviews",
        target_id: 1,
        details: "Avaliação de João para Maria - Nota: 5/5",
      },
      {
        admin_id: 1,
        action: "CREATE",
        target_table: "services",
        target_id: 5,
        details: "Novo serviço criado: Limpeza de Piscinas",
      },
      {
        admin_id: 1,
        action: "UPDATE",
        target_table: "users",
        target_id: 3,
        details: "Perfil de prestador atualizado",
      },
      {
        admin_id: 1,
        action: "DEACTIVATE",
        target_table: "reviews",
        target_id: 2,
        details: "Avaliação contém conteúdo inadequado",
      },
      {
        admin_id: 1,
        action: "APPROVE",
        target_table: "providers",
        target_id: 4,
        details: "Prestador aprovado após verificação",
      },
    ];

    await AdminLog.bulkCreate(exampleLogs);
    console.log("✅ Logs de exemplo criados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar logs de exemplo:", error);
  }
}

module.exports = seedAdminLogs;

// Executar se for chamado diretamente
if (require.main === module) {
  const { sequelize } = require("../models");
  seedAdminLogs()
    .then(() => {
      console.log("Finalizando...");
      return sequelize.close();
    })
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
