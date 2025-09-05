const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCompanyName() {
  try {
    console.log('🔍 Atualizando nome da empresa...');
    
    // Atualizar empresa existente
    const updatedCompany = await prisma.company.update({
      where: { id: 'company_001' },
      data: {
        name: 'ChatBot Demo',
      },
    });
    
    console.log('✅ Empresa atualizada:', updatedCompany.name);
    
    // Verificar se foi atualizada
    const company = await prisma.company.findUnique({
      where: { id: 'company_001' },
    });
    
    console.log('✅ Nome atualizado para:', company.name);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar empresa:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCompanyName();
