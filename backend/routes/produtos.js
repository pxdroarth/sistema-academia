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
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const [rows] = await pool.query("SELECT * FROM produto WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar produto (com upload de imagem)
router.post("/", upload.single("imagem"), async (req, res) => {
  
  // IMPORTANTE: multer já processa o multipart/form-data, req.body estará definido após ele
  // Se req.body ainda undefined, verifique se na requisição o campo está sendo enviado corretamente como multipart/form-data

  // Imprime para debug
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

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
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const { nome, descricao } = req.body;
  const preco = Number(req.body.preco);
  const estoque = Number(req.body.estoque);
  let imagem = null;

  if (!nome || isNaN(preco) || isNaN(estoque)) {
    return res.status(400).json({ error: "Campos obrigatórios faltando ou inválidos" });
  }

  try {
    if (req.file) {
      imagem = `/uploads/produtos/${req.file.filename}`;
    } else {
      const [rows] = await pool.query("SELECT imagem FROM produto WHERE id = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ error: "Produto não encontrado" });
      imagem = rows[0].imagem;
    }

    const [result] = await pool.query(
      "UPDATE produto SET nome = ?, descricao = ?, preco = ?, estoque = ?, imagem = ? WHERE id = ?",
      [nome, descricao || null, preco, estoque, imagem, id]
    );

    if (result.affectedRows === 0) {
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
    const [result] = await pool.query("DELETE FROM produto WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Produto não encontrado para deletar" });
    }
    res.json({ message: "Produto deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
