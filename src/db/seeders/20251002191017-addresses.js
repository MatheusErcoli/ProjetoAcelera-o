"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("addresses", [
      {
        user_id: 1, // Admin
        logradouro: "Rua Central",
        numero: "100",
        complemento: "Sala 10",
        bairro: "Centro",
        cep: "87300000",
        cidade: "Campo Mourão",
        uf: "PR",
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 2, // Prestador João
        logradouro: "Rua das Palmeiras",
        numero: "200",
        complemento: "Casa",
        bairro: "Jardim Tropical",
        cep: "87305000",
        cidade: "Campo Mourão",
        uf: "PR",
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 3, // Contratante Maria
        logradouro: "Av. Paraná",
        numero: "300",
        complemento: "Ap 12",
        bairro: "Centro",
        cep: "87302000",
        cidade: "Campo Mourão",
        uf: "PR",
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("addresses", {
      user_id: [1, 2, 3],
    });
  },
};
