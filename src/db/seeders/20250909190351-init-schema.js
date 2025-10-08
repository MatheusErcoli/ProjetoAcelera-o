"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    
    // Verificar se os serviços já existem
    const existingServices = await queryInterface.sequelize.query(
      `SELECT name FROM services WHERE name IN ('Encanador', 'Eletricista', 'Marido de Aluguel', 'Pintor', 'Pedreiro')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingServiceNames = existingServices.map(service => service.name);
    
    const servicesToInsert = [
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
    ].filter(service => !existingServiceNames.includes(service.name));
    
    if (servicesToInsert.length > 0) {
      await queryInterface.bulkInsert("services", servicesToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("services", null, {});
  },
};