const bcrypt = require('bcrypt');
const { User, Address } = require('../models');

/**
 * Script para criar usuários de teste para cada role
 * Execute com: node scripts/createTestUsers.js
 */

async function createTestUsers() {
  try {
    console.log('🔐 Criando usuários de teste...\n');

    // Senha padrão para todos: "teste123"
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('teste123', salt);

    // 1. Criar Admin
    console.log('📝 Criando usuário ADMIN...');
    const admin = await User.create({
      name: 'Admin Teste',
      email: 'admin@test.com',
      whatsapp: '44999999999',
      password_hash: passwordHash,
      role: 'ADMIN',
      photo_url: 'https://ui-avatars.com/api/?name=Admin+Teste&background=3b82f6&color=fff',
    });

    await Address.create({
      user_id: admin.id,
      cep: '87303020',
      logradouro: 'Rua Teste Admin',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Campo Mourão',
      uf: 'PR',
    });
    console.log('✅ Admin criado: admin@test.com / teste123\n');

    // 2. Criar Prestador
    console.log('📝 Criando usuário PRESTADOR...');
    const prestador = await User.create({
      name: 'João Silva',
      email: 'prestador@test.com',
      whatsapp: '44988888888',
      password_hash: passwordHash,
      role: 'PRESTADOR',
      photo_url: 'https://ui-avatars.com/api/?name=João+Silva&background=10b981&color=fff',
    });

    await Address.create({
      user_id: prestador.id,
      cep: '87303030',
      logradouro: 'Rua dos Prestadores',
      numero: '200',
      bairro: 'Vila Alta',
      cidade: 'Campo Mourão',
      uf: 'PR',
    });
    console.log('✅ Prestador criado: prestador@test.com / teste123\n');

    // 3. Criar Contratante
    console.log('📝 Criando usuário CONTRATANTE...');
    const contratante = await User.create({
      name: 'Maria Santos',
      email: 'cliente@test.com',
      whatsapp: '44977777777',
      password_hash: passwordHash,
      role: 'CONTRATANTE',
      photo_url: 'https://ui-avatars.com/api/?name=Maria+Santos&background=f59e0b&color=fff',
    });

    await Address.create({
      user_id: contratante.id,
      cep: '87303040',
      logradouro: 'Rua dos Clientes',
      numero: '300',
      bairro: 'Cohapar',
      cidade: 'Campo Mourão',
      uf: 'PR',
    });
    console.log('✅ Contratante criado: cliente@test.com / teste123\n');

    console.log('🎉 Todos os usuários de teste foram criados com sucesso!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('CREDENCIAIS DE TESTE:');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n👨‍💼 ADMIN:');
    console.log('   Email: admin@test.com');
    console.log('   Senha: teste123');
    console.log('   Acesso: /admin');
    console.log('\n🔧 PRESTADOR:');
    console.log('   Email: prestador@test.com');
    console.log('   Senha: teste123');
    console.log('   Acesso: /home/providers');
    console.log('\n👤 CONTRATANTE:');
    console.log('   Email: cliente@test.com');
    console.log('   Senha: teste123');
    console.log('   Acesso: /home/clients');
    console.log('\n═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
    process.exit(1);
  }
}

// Executar apenas se for o script principal
if (require.main === module) {
  createTestUsers();
}

module.exports = createTestUsers;
