const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    console.log('🔍 Verificando usuário admin...');
    
    // Buscar usuário existente
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@atendechat.com' },
      include: { company: true }
    });
    
    if (existingUser) {
      console.log('✅ Usuário encontrado:', existingUser.email);
      console.log('   ID:', existingUser.id);
      console.log('   Company ID:', existingUser.companyId);
      console.log('   Role:', existingUser.role);
      console.log('   Ativo:', existingUser.isActive);
      
      // Gerar nova senha hash
      const newPasswordHash = await bcrypt.hash('admin123', 10);
      
      // Atualizar senha
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { passwordHash: newPasswordHash }
      });
      
      console.log('✅ Senha atualizada com sucesso!');
      
    } else {
      console.log('❌ Usuário não encontrado, criando novo...');
      
      // Criar empresa se não existir
      let company = await prisma.company.findUnique({
        where: { id: 'company_001' }
      });
      
      if (!company) {
        company = await prisma.company.create({
          data: {
            id: 'company_001',
            name: 'AtendeChat Demo',
          },
        });
        console.log('✅ Empresa criada:', company.id);
      }
      
      // Criar usuário admin
      const passwordHash = await bcrypt.hash('admin123', 10);
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
    }
    
    console.log('\n🎯 CREDENCIAIS DE LOGIN:');
    console.log('   Email: admin@atendechat.com');
    console.log('   Senha: admin123');
    console.log('\n🚀 Teste o login agora!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser();
