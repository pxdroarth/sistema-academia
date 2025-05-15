const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',       // Host do seu banco (localhost)
  port: 3306,              // Porta padrão do MySQL
  user: 'root',            // Usuário
  password: '',            // Sem senha, campo vazio
  database: 'academia',    // Nome do banco que você vai usar
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
