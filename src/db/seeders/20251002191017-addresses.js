"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Buscar os IDs dos usuários pelos emails para garantir que existem
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('admin@climber.com', 'joao@climber.com', 'maria@climber.com')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const admin = users.find(u => u.email === 'admin@climber.com');
    const joao = users.find(u => u.email === 'joao@climber.com');
    const maria = users.find(u => u.email === 'maria@climber.com');

    if (!admin || !joao || !maria) {
      console.log('Alguns usuários não foram encontrados, pulando criação de endereços');
      return;
    }

    // Verificar se os endereços já existem
    const existingAddresses = await queryInterface.sequelize.query(
      `SELECT user_id FROM addresses WHERE user_id IN (${admin.id}, ${joao.id}, ${maria.id})`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const existingUserIds = existingAddresses.map(addr => addr.user_id);

    const addressesToInsert = [
      {
        user_id: admin.id,
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
        user_id: joao.id,
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
        user_id: maria.id,
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
    ].filter(address => !existingUserIds.includes(address.user_id));

    if (addressesToInsert.length > 0) {
      await queryInterface.bulkInsert("addresses", addressesToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("addresses", {
      user_id: [1, 2, 3],
    });
  },
};