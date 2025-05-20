const express = require("express");
const router = express.Router();
const pool = require("../database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/produtos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

// Listar todos produtos
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM produto");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar produto por ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [rows] = await pool.query("SELECT * FROM produto WHERE id = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Produto não encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar produto (com upload de imagem)
router.post("/", upload.single("imagem"), async (req, res) => {
  const { nome, descricao, preco, estoque } = req.body;
  let imagem = null;
  if (req.file) {
    imagem = `/uploads/produtos/${req.file.filename}`;
  }

  if (!nome || !preco || !estoque) {
    return res.status(400).json({ error: "Campos obrigatórios faltando" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO produto (nome, descricao, preco, estoque, imagem) VALUES (?, ?, ?, ?, ?)",
      [nome, descricao || null, preco, estoque, imagem]
    );
    res.status(201).json({
      id: result.insertId,
      nome,
      descricao,
      preco,
      estoque,
      imagem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar produto (com upload de imagem opcional)
router.put("/:id", upload.single("imagem"), async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, descricao, preco, estoque } = req.body;
  let imagem = null;
  if (req.file) {
    imagem = `/uploads/produtos/${req.file.filename}`;
  }

  try {
    // Atualiza com ou sem imagem
    const query = imagem
      ? "UPDATE produto SET nome = ?, descricao = ?, preco = ?, estoque = ?, imagem = ? WHERE id = ?"
      : "UPDATE produto SET nome = ?, descricao = ?, preco = ?, estoque = ? WHERE id = ?";
    const params = imagem
      ? [nome, descricao || null, preco, estoque, imagem, id]
      : [nome, descricao || null, preco, estoque, id];

    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Produto não encontrado para atualizar" });
    res.json({ id, nome, descricao, preco, estoque, imagem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar produto
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [result] = await pool.query("DELETE FROM produto WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Produto não encontrado para deletar" });
    res.json({ message: "Produto deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
