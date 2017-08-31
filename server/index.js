const Express = require('express');
const { promisify } = require('util');
const fs = require('fs');
const sharp = require('sharp');
const sizeOf = promisify(require('image-size'));

const readFile = promisify(fs.readFile);
const app = new Express();

const thumbSize = 32;

app.get('/', async(req, res) => {
  let filepath = req.url;
  if (filepath.endsWith('/')) {
    filepath += 'index.html';
  }

  const buffer = await readFile(`./client/${filepath}`);
  const content = buffer.toString();

  const newImgContent = await Promise.all(
    content
    .split(/(<lz-img[^>]+><\/lz-img>)/)
    .map(async(item) => {
      if (!item.startsWith('<lz-img')) {
        return item;
      }

      const src = /src="([^"]+)"/.exec(item)[1];
      const srcPath = `./client/${src}`;
      const { width, height } = await sizeOf(srcPath);

      const thumb = await sharp(srcPath)
        .resize(thumbSize, thumbSize)
        .toBuffer();
      const thumbUrl = `data:image/png;base64,${thumb.toString('base64')}`;

      return item.replace('></lz-img>', ` style='padding-top: ${height/width*100}%; background-image: url(${thumbUrl})'></lz-img>`);
    })
  );

  res.send(newImgContent.join(''));
});

app.use(Express.static('client'));

app.listen(8888);
console.log('Server started at localhost:8888');