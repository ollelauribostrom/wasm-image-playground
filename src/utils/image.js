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
