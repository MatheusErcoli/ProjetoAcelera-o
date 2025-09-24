"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert("services", [
      {
        name: "Encanador",
        description: "Hidráulica, vazamentos, canos",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Eletricista",
        description: "Instalações e reparos elétricos",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Marido de Aluguel",
        description: "Serviços gerais e pequenos reparos",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("services", null, {});
  },
};
