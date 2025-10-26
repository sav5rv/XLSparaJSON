const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const app = express();
const upload = multer({ dest: 'uploads/' }); // pasta temporária para upload

app.use(cors()); // para permitir requisições do front-end

app.post('/converter', upload.single('arquivo'), (req, res) => {
  console.log('Requisição recebida em /converter');
  if (!req.file) {
    console.log('Nenhum arquivo recebido');
    return res.status(400).json({ erro: 'Arquivo não enviado' });
  }
  console.log('Arquivo recebido:', req.file.originalname);
  
  try {
    const caminhoArquivo = req.file.path;
    let jsonData;

    if (req.file.originalname.endsWith('.csv')) {
      // ler CSV como texto e converter para JSON
      const csvStr = require('fs').readFileSync(caminhoArquivo, 'utf8');
      const planilha = xlsx.read(csvStr, { type: 'string' });
      jsonData = xlsx.utils.sheet_to_json(planilha.Sheets[planilha.SheetNames[0]]);
    } else if (req.file.originalname.endsWith('.xls') || req.file.originalname.endsWith('.xlsx')) {
      // ler XLS/XLSX e converter para JSON
      const planilha = xlsx.readFile(caminhoArquivo);
      jsonData = xlsx.utils.sheet_to_json(planilha.Sheets[planilha.SheetNames[0]]);
    } else {
      return res.status(400).json({ erro: 'Formato de arquivo não suportado' });
    }

    // Retorna o JSON convertido para o front-end
    res.json({ dados: jsonData });
  } catch (error) {
    console.error('Erro na conversão:', error);
    res.status(500).json({ erro: 'Erro interno na conversão' });
  } finally {
    // Opcional: apagar arquivo temporário após processamento
    require('fs').unlink(req.file.path, () => {});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API executando na porta ${PORT}`);
});
