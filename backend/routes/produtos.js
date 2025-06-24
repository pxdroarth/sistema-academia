const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { runQuery } = require("../dbHelper");

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

// Listar todos os produtos
router.get("/", async (req, res) => {
  try {
    const rows = await runQuery("SELECT * FROM produto");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar produto por ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const rows = await runQuery("SELECT * FROM produto WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar produto (com upload de imagem)
router.post("/", upload.single("imagem"), async (req, res) => {
  const { nome, descricao } = req.body;
  const preco = Number(req.body.preco);
  const estoque = Number(req.body.estoque);
  let imagem = null;

  if (req.file) {
    imagem = `/uploads/produtos/${req.file.filename}`;
  }

  if (!nome || isNaN(preco) || isNaN(estoque)) {
    return res.status(400).json({ error: "Campos obrigatórios faltando ou inválidos" });
  }

  try {
    const result = await runQuery(
      "INSERT INTO produto (nome, descricao, preco, estoque, imagem) VALUES (?, ?, ?, ?, ?)",
      [nome, descricao || null, preco, estoque, imagem]
    );
    res.status(201).json({
      id: result.lastID,
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
  const { nome, descricao } = req.body;
  const preco = Number(req.body.preco);
  const estoque = Number(req.body.estoque);
  let imagem = null;

  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  if (!nome || isNaN(preco) || isNaN(estoque)) {
    return res.status(400).json({ error: "Campos obrigatórios faltando ou inválidos" });
  }

  try {
    if (req.file) {
      imagem = `/uploads/produtos/${req.file.filename}`;
    } else {
      const rows = await runQuery("SELECT imagem FROM produto WHERE id = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ error: "Produto não encontrado" });
      imagem = rows[0].imagem;
    }

    const result = await runQuery(
      "UPDATE produto SET nome = ?, descricao = ?, preco = ?, estoque = ?, imagem = ? WHERE id = ?",
      [nome, descricao || null, preco, estoque, imagem, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Produto não encontrado para atualizar" });
    }

    res.json({ id, nome, descricao, preco, estoque, imagem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar produto
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await runQuery("DELETE FROM produto WHERE id = ?", [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Produto não encontrado para deletar" });
    }
    res.json({ message: "Produto deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
