const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const categories = ['gato', 'cachorro', 'pássaro', 'peixe'];
const imagesGoogle = [
  {
    category: 'gato',
    images: [
      'https://www.petz.com.br/blog/wp-content/uploads/2021/11/enxoval-para-gato-Copia.jpg',
      'https://www.petz.com.br/blog/wp-content/uploads/2021/11/enxoval-para-gato-Copia.jpg',
      'https://www.petz.com.br/blog/wp-content/uploads/2021/11/enxoval-para-gato-Copia.jpg',
      'https://www.petz.com.br/blog/wp-content/uploads/2021/11/enxoval-para-gato-Copia.jpg'
    ]
  },
  {
    category: 'cachorro',
    images: [
      'https://img.freepik.com/fotos-gratis/lindo-retrato-de-cachorro_23-2149218450.jpg',
      'https://img.freepik.com/fotos-gratis/lindo-retrato-de-cachorro_23-2149218450.jpg',
      'https://img.freepik.com/fotos-gratis/lindo-retrato-de-cachorro_23-2149218450.jpg',
      'https://img.freepik.com/fotos-gratis/lindo-retrato-de-cachorro_23-2149218450.jpg'
    ]
  },
  {
    category: 'pássaro',
    images: [
      'https://saude.abril.com.br/wp-content/uploads/2016/09/calopsita-cuidados-saude-96731.jpg?quality=85&strip=info&w=1000&h=720&crop=1',
      'https://saude.abril.com.br/wp-content/uploads/2016/09/calopsita-cuidados-saude-96731.jpg?quality=85&strip=info&w=1000&h=720&crop=1',
      'https://saude.abril.com.br/wp-content/uploads/2016/09/calopsita-cuidados-saude-96731.jpg?quality=85&strip=info&w=1000&h=720&crop=1',
      'https://saude.abril.com.br/wp-content/uploads/2016/09/calopsita-cuidados-saude-96731.jpg?quality=85&strip=info&w=1000&h=720&crop=1'
    ]
  },
  {
    category: 'peixe',
    images: [
      'https://reefsantista.com.br/wp-content/uploads/2021/07/Peixe-Palhaco.jpg',
      'https://reefsantista.com.br/wp-content/uploads/2021/07/Peixe-Palhaco.jpg',
      'https://reefsantista.com.br/wp-content/uploads/2021/07/Peixe-Palhaco.jpg',
      'https://reefsantista.com.br/wp-content/uploads/2021/07/Peixe-Palhaco.jpg'
    ]
  }
];


app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Retorna um token de captcha aleatório
function generateCaptchaToken() {
  const secret = crypto.randomBytes(16).toString('hex');
  return crypto.createHmac('sha256', secret).digest('hex');
}
  
  // Seleciona aleatoriamente um conjunto de imagens de uma determinada categoria
  function getRandomImagesByCategory(category, n) {
    const categoryObj = imagesGoogle.find(cat => cat.category === category);
    if (!categoryObj) {
      throw new Error(`Categoria '${category}' não encontrada na base de dados`);
    }
    const categoryImages = categoryObj.images;
    if (categoryImages.length < n) {
      throw new Error(`Não há imagens suficientes na categoria '${category}' para gerar o captcha`);
    }
    const shuffled = categoryImages.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }
  
// Renderiza o formulário HTML com as informações do captcha
function generateCaptchaFormHtml(captchaToken, images) {
  const formHtml = `
    <form method="POST" action="/validate" id="captcha-form">
      <input type="hidden" name="captchaToken" value="${captchaToken}">
      <div>
        <h2>Selecione as imagens correspondentes à categoria "${images[0].category}":</h2>
        <div id="captcha-images">
          ${images.map(image => `
            <label>
              <input type="checkbox" name="selectedImage" value="${image.image}">
              <img src="${image.image}">
            </label>
          `).join('')}
        </div>
      </div>
      <button type="submit">Enviar</button>
    </form>
    <style>
      #captcha-form {
        background-color: #f2f2f2;
        border-radius: 5px;
        padding: 20px;
      }
      #captcha-form h2 {
        margin: 0 0 20px;
      }
      #captcha-images {
        display: flex;
        flex-wrap: wrap;
      }
      #captcha-images label {
        margin: 0 20px 20px 0;
      }
      #captcha-images input[type="checkbox"] {
        display: none;
      }
      #captcha-images img {
        width: 150px;
        height: 150px;
        border-radius: 5px;
        border: 2px solid #ddd;
        cursor: pointer;
      }
      #captcha-images input[type="checkbox"]:checked + img {
        border: 2px solid #4CAF50;
      }
      button[type="submit"] {
        background-color: #4CAF50;
        border: none;
        color: white;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 20px;
      }
      button[type="submit"]:hover {
        background-color: #3e8e41;
      }
    </style>
  `;
  return formHtml;
}
  
  // Endpoint para gerar um novo captcha
app.get('/captchaForm', async (req, res) => {
    try {
      // Gerando um novo token de captcha
      const captchaToken = await generateCaptchaToken();
      // Selecionando aleatoriamente 4 imagens da categoria escolhida
      let randomCategory = categories[Math.floor(Math.random() * categories.length)];
      let randomImages = [];
      for (var i = 0; i < 4; i++) {
        // Selecionando aleatoriamente uma categoria
        randomCategory = categories[Math.floor(Math.random() * categories.length)];
        randomImages.push(getRandomImagesByCategory(randomCategory, 1));
      }

      // Substituindo os nomes das imagens pelos seus respectivos links do Google Imagens
      const imagesWithLinks = randomImages.map(imageName => ({
        image: imageName,
        category: randomCategory
      }));
      // Renderizando o formulário HTML com as informações do captcha
      const captchaFormHtml = generateCaptchaFormHtml(captchaToken, imagesWithLinks);
      res.send(captchaFormHtml);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});