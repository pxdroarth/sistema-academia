@@
 // ───────────── 1. RESUMO SIMPLES ─────────────
 router.get('/resumo', async (req, res) => {
-  const { periodo = 'mensal', usuarioId, turno } = req.query;
+  const { periodo = 'mensal', usuarioId, turno, status } = req.query;
@@
-      WHERE m.vencimento BETWEEN ? AND ? ${filtroUsuarioTurno}
+      WHERE m.vencimento BETWEEN ? AND ? ${filtroUsuarioTurno}
+        ${status && status !== 'todos' ? 'AND m.status = ?' : ''}
     `,
-    params);
+    status && status !== 'todos' ? [...params, status] : params);
 });

 // ───────────── 2. LISTA FILTRÁVEL DE MENSALIDADES ─────────────
 router.get('/mensalidades', async (req, res) => {
-  const { data_inicial, data_final, status = 'todos' } = req.query;
+  const { data_inicial, data_final, status = 'todos' } = req.query;

   const filtros = [];
   const params  = [];

   if (data_inicial && data_final) {
     filtros.push('m.vencimento BETWEEN ? AND ?');
     params.push(data_inicial, data_final);
   }
   if (status !== 'todos') {
     filtros.push('m.status = ?');
     params.push(status);
   }

   const where = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';
   const [rows] = await pool.query(`SELECT * FROM mensalidade m ${where}`, params);
   res.json(rows);
 });

 // ───────────── 3. VENDAS FILTRÁVEIS ─────────────
 router.get('/vendas-produtos', async (req, res) => {
   const { data_inicial, data_final } = req.query;
   const filtros = [];
   const params  = [];

   if (data_inicial && data_final) {
     filtros.push('vp.data_venda BETWEEN ? AND ?');
     params.push(data_inicial, data_final);
   }

   const where = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';
   const [rows] = await pool.query(
     `SELECT vp.*, p.nome AS produto_nome
        FROM venda_produto vp
        LEFT JOIN produto p ON p.id = vp.produto_id
      ${where}
      ORDER BY vp.data_venda DESC`,
     params
   );
   res.json(rows);
 });

 // ───────────── 4. FLUXO DE CAIXA ─────────────
 router.get('/fluxo', async (req, res) => {
   try {
     const { periodo = 'mensal' } = req.query;

     const hoje   = new Date();
     let   inicio = new Date();

     if (periodo === 'diario') {
       /* hoje */
     } else if (periodo === 'semanal') {
       inicio.setDate(hoje.getDate() - hoje.getDay());
     } else {
       inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
     }

     const ymd  = d => d.toISOString().slice(0, 10);
     const params = [ymd(inicio), ymd(hoje)];

     /* ENTRADAS = pagamentos + vendas ----------------------------*/
     const [entradas] = await pool.query(
       `SELECT data, SUM(valor) total FROM (
            SELECT DATE(p.data_pagamento) AS data, p.valor_pago          AS valor
              FROM pagamento p
            UNION ALL
            SELECT DATE(vp.data_venda)     AS data, vp.quantidade*vp.preco_unitario
              FROM venda_produto vp
        ) x
        WHERE data BETWEEN ? AND ?
        GROUP BY data
        ORDER BY data`, params);

     /* SAÍDAS (se não houver tabela despesa, devolve série vazia) */
     let saidas = [];
     try {
       [saidas] = await pool.query(
         `SELECT DATE(data_despesa) data, SUM(valor) total
            FROM despesa
           WHERE data_despesa BETWEEN ? AND ?
        GROUP BY data
        ORDER BY data`, params);
     } catch {/* ignore */}
     
     const s = rows => rows.map(r => ({
       x: r.data.split('-').reverse().slice(0,2).join('/'), // DD/MM
       y: Number(r.total)
     }));

     res.json([
       { id: 'Entradas', data: s(entradas) },
       { id: 'Saídas',   data: s(saidas)   }
     ]);
   } catch (e) {
     console.error(e);
     res.status(500).json({ erro: 'Erro ao gerar fluxo de caixa' });
   }
 });

 module.exports = router;
