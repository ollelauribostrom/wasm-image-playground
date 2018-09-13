export function calcEyesPosition(eyes = []) {
  let sortedEyes = eyes.sort((a, b) => a.x - b.x);
  if (!eyes.length) {
    return {};
  }
  return {
    x: sortedEyes[0].x - 4,
    y: sortedEyes[0].y - 4,
    width: (sortedEyes[eyes.length - 1].x - sortedEyes[0].x) * 2 + 2 ,
    height: sortedEyes[0].height + 2
  }
}
