const { parse } = require('path');
const { createWriteStream } = require('fs');
const { v4: uuidv4 } = require('uuid');
const { finished } = require('stream/promises');

const readFile = async (file) => {
  const { createReadStream, filename } = await file;
  const stream = createReadStream();
  const { ext } = parse(filename);
  let fileName = uuidv4();
  let path = `./upload/${fileName}${ext}`;

  const out = createWriteStream(path);
  stream.pipe(out);
  await finished(out);
  let imgName = path.split('upload/')[1];

  return imgName;
};

module.exports.readFile = readFile;
