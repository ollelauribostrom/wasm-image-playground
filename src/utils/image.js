import { isFunction } from './general';

export function resizeImage(img, maxWidth, maxHeight) {
  if (img.width > maxWidth) {
    const scale = (maxWidth / img.width);
    img.width = img.width * scale;
    img.height = img.height * scale;
  }

  if (img.height > maxHeight) {
    const scale = (maxHeight / img.height);
    img.width = img.width * scale;
    img.height = img.height * scale;
  }

  return img;
}

export function isImage(file) {
  return file.type === 'image/png' || 
    file.type === 'image/jpg' ||
    file.type === 'image/svg' ||
    file.type === 'image/gif';
}

export async function asyncImageListLoader(fileList, skip) {
  const filePromises = Array.prototype.map.call(fileList, async file => asyncImageLoader(file, skip));
  const images = await Promise.all(filePromises);
  return images.filter(image => image);
}

export async function asyncImageLoader(file, skip) {
  return new Promise((resolve, reject) => {
    if (!isImage(file)) {
      if (skip) {
        if (isFunction(skip)) {
          skip(file);
        }
        resolve();
      } else {
        reject('Not an image');
      }
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ data: reader.result, name: file.name });
    reader.readAsDataURL(file);
  });
}