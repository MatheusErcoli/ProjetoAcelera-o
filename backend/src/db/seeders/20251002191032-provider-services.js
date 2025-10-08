"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Buscar o prestador João e os serviços
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'joao@climber.com'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const services = await queryInterface.sequelize.query(
      `SELECT id, name FROM services WHERE name IN ('Encanador', 'Eletricista')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0 || services.length === 0) {
      console.log('Usuário João ou serviços não encontrados, pulando criação de provider_services');
      return;
    }

    const joaoId = users[0].id;
    const encanadorService = services.find(s => s.name === 'Encanador');
    const eletricistaService = services.find(s => s.name === 'Eletricista');

    if (!encanadorService || !eletricistaService) {
      console.log('Serviços Encanador ou Eletricista não encontrados');
      return;
    }

    // Verificar se os provider_services já existem
    const existingProviderServices = await queryInterface.sequelize.query(
      `SELECT provider_id, service_id FROM provider_services WHERE provider_id = ${joaoId} AND service_id IN (${encanadorService.id}, ${eletricistaService.id})`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const existingCombinations = existingProviderServices.map(ps => `${ps.provider_id}-${ps.service_id}`);

    const providerServicesToInsert = [
      {
        provider_id: joaoId,
        service_id: encanadorService.id,
        created_at: now,
        updated_at: now,
      },
      {
        provider_id: joaoId,
        service_id: eletricistaService.id,
        created_at: now,
        updated_at: now,
      },
    ].filter(ps => !existingCombinations.includes(`${ps.provider_id}-${ps.service_id}`));

    if (providerServicesToInsert.length > 0) {
      await queryInterface.bulkInsert("provider_services", providerServicesToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("provider_services", {
      provider_id: 2,
    });
  },
};