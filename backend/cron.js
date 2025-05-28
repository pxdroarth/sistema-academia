const cron = require('node-cron');
const gerarMensalidades = require('./gerarMensalidades');

cron.schedule('0 0 1 * *', () => {
  console.log('Executando job de geração automática de mensalidades');
  gerarMensalidades();
});
