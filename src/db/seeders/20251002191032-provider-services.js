"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("provider_services", [
      {
        provider_id: 2, // Prestador João
        service_id: 1, // Encanador
        created_at: now,
        updated_at: now,
      },
      {
        provider_id: 2, // Prestador João
        service_id: 2, // Eletricista
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("provider_services", {
      provider_id: 2,
    });
  },
};
