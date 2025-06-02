const express = require('express');
const app = express();
const port = 3001;
require('./cron');


// Importa o pool de conexão com o banco MySQL
const pool = require('./database');
app.use(express.json());

const cors = require('cors');
app.use(cors());

// Importar rotas, passando o pool para elas, se quiser
const alunosRouter = require('./routes/alunos');
app.use('/alunos', alunosRouter);

const pagamentosRouter = require('./routes/pagamentos');
app.use('/pagamentos', pagamentosRouter);

const planosRouter = require('./routes/planos');
app.use('/planos', planosRouter);

const acessosRouter = require('./routes/acessos');
app.use('/acessos', acessosRouter);

const mensalidadesRouter = require('./routes/mensalidades');
app.use('/mensalidades', mensalidadesRouter);

const produtosRouter = require("./routes/produtos");
app.use("/produtos", produtosRouter);

const vendasProdutosRouter = require("./routes/vendasProdutos");
app.use("/vendas-produtos", vendasProdutosRouter);

const financeiroRouter = require('./routes/financeiro');
app.use('/financeiro', financeiroRouter);

const relatoriosRouter = require('./routes/relatorios');
app.use('/relatorios', relatoriosRouter);



// Rota de teste de conexão com banco
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS agora');
    res.json({ db_time: rows[0].agora });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`API backend rodando na porta ${port}`);
});
