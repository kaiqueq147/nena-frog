// Este é um script que você pode executar para verificar a estrutura do projeto
// Execute com: node scripts/setup-images.js

const fs = require("fs");
const path = require("path");
const https = require("https");

// Caminho para a pasta de imagens
const imagesDir = path.join(__dirname, "../public/images/frog_images");

// Função para criar pasta se não existir
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    console.log(`Criando diretório: ${directory}`);
    fs.mkdirSync(directory, { recursive: true });
  } else {
    console.log(`Diretório já existe: ${directory}`);
  }
};

// Função para verificar quais imagens existem
const checkExistingImages = (directory) => {
  if (fs.existsSync(directory)) {
    const files = fs.readdirSync(directory);
    console.log(`${files.length} imagens encontradas em ${directory}:`);
    files.forEach((file) => console.log(` - ${file}`));
    return files;
  }
  return [];
};

// Função principal
const main = () => {
  console.log("Verificando estrutura de diretórios...");
  ensureDirectoryExists(imagesDir);

  console.log("\nVerificando imagens existentes...");
  const existingImages = checkExistingImages(imagesDir);

  console.log("\nPara sua aplicação funcionar corretamente:");
  console.log(
    "1. Certifique-se de que a pasta public/images/frog_images existe"
  );
  console.log(
    "2. Adicione algumas imagens de sapos nesta pasta com nomes como frog_1.jpg, frog_2.png, etc."
  );
  console.log(
    "3. Verifique se as permissões das pastas e arquivos estão corretas"
  );

  if (existingImages.length === 0) {
    console.log(
      "\nNenhuma imagem encontrada! Você precisa adicionar imagens manualmente ou usar um script para baixá-las."
    );
  }
};

// Executar o script
main();
