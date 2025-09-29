const fs = require('fs');
const path = require('path');

const uploadBase64Image = (image, folder = 'uploads') => {
  return new Promise((resolve, reject) => {
    try {
      if (!image) return reject(new Error('image required'));

      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return reject(new Error('image not base64'));
      }

      const imageBuffer = Buffer.from(matches[2], 'base64');
      const imageType = matches[1].split('/')[1];
      const fileName = `image_${Date.now()}.${imageType}`;
      const filePath = path.join(__dirname, '..', folder, fileName);

      fs.writeFileSync(filePath, imageBuffer);
      resolve(fileName);
    } catch (err) {
      reject(err);
    }
  });
};


const updateBase64Image = (image, folder = 'uploads') => {
  return new Promise((resolve, reject) => {
    try {
      if (!image) return reject(new Error('image required'));

      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return reject(new Error('image not base64'));
      }

      const imageBuffer = Buffer.from(matches[2], 'base64');
      const imageType = matches[1].split('/')[1];
      const fileName = `image_${Date.now()}.${imageType}`;
      const filePath = path.join(__dirname, '..', folder, fileName);

      fs.writeFileSync(filePath, imageBuffer);
      resolve(fileName);
    } catch (err) {
      reject(err);
    }
  });
};

const deleteImage = (filename, folder = 'uploads') => {
  return new Promise((resolve, reject) => {
    try {
      if (!filename) return reject(new Error('filename required'));

      const filePath = path.join(__dirname, '..', folder, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        resolve(`Image ${filename} deleted successfully`);
      } else {
        reject(new Error('Image not found'));
      }
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = [uploadBase64Image, deleteImage];
