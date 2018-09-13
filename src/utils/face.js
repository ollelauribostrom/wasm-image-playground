export function calcFacePosition(faces = []) {
  let sortedFaces = faces.sort((a, b) => a.height - b.height);
  return sortedFaces[0];
}
