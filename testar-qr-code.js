// Script para testar QR Code
const http = require('http');

console.log('🧪 Testando QR Code...\n');

const postData = JSON.stringify({
  phoneNumber: '+5511999999999',
  businessName: 'Teste Empresa'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/whatsapp/qrcode',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('📱 Gerando QR Code...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ QR Code gerado com sucesso!');
      console.log('📱 QR Code disponível:', response.qrCode ? 'Sim' : 'Não');
      console.log('🔍 Tipo do QR Code:', response.qrCode?.substring(0, 50) + '...');
      
      if (response.qrCode) {
        console.log('\n🎉 QR Code está sendo gerado corretamente!');
        console.log('📋 Próximos passos:');
        console.log('1. Acesse: http://localhost:3000/ai-config');
        console.log('2. Clique em "Gerar QR Code"');
        console.log('3. O QR Code deve aparecer na tela!');
      } else {
        console.log('❌ QR Code não foi gerado');
      }
    } catch (e) {
      console.error('❌ Erro ao parsear resposta:', e.message);
      console.log('Resposta bruta:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
  console.log('\n🔧 Solução:');
  console.log('1. Execute: cd apps\\api && node simple-channels-server.js');
  console.log('2. Aguarde o servidor iniciar');
  console.log('3. Execute este script novamente');
});

req.write(postData);
req.end();
