"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert("services", [
      {
        name: "Encanador",
        description: "Hidráulica, vazamentos, reparo e instalação de canos",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Eletricista",
        description: "Instalações, reparos elétricos e manutenção preventiva",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Marido de Aluguel",
        description: "Serviços gerais e pequenos reparos residenciais",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Pintor",
        description: "Pintura residencial, comercial e retoques",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Pedreiro",
        description: "Construção, reformas e acabamentos",
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
