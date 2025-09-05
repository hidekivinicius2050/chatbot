const http = require('http');

// Teste do endpoint de QR Code
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

console.log('🧪 Testando endpoint de QR Code...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📱 Resposta do QR Code:');
    console.log(JSON.parse(data));
  });
});

req.on('error', (e) => {
  console.error(`❌ Erro na requisição: ${e.message}`);
});

req.write(postData);
req.end();
