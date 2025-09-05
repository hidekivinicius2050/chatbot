const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Hash da senha
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // Criar empresa primeiro
    const company = await prisma.company.create({
      data: {
        id: 'company_001',
        name: 'ChatBot Demo',
      },
    });
    
    console.log('✅ Empresa criada:', company.id);
    
    // Criar usuário admin
    const adminUser = await prisma.user.create({
      data: {
        companyId: company.id,
        email: 'admin@atendechat.com',
        name: 'Administrador',
        passwordHash: passwordHash,
        role: 'OWNER',
        isActive: true,
      },
    });
    
    console.log('✅ Usuário admin criado:', adminUser.email);
    console.log('🎯 Credenciais de login:');
    console.log('   Email: admin@atendechat.com');
    console.log('   Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
