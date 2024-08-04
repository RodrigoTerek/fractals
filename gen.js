function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

function interpolateColor(color1, color2, factor) {
  const result = {
    r: Math.round(color1.r + factor * (color2.r - color1.r)),
    g: Math.round(color1.g + factor * (color2.g - color1.g)),
    b: Math.round(color1.b + factor * (color2.b - color1.b)),
  };
  return result;
}

function generateGradient(startColor, endColor, steps) {
  const startRGB = hexToRgb(startColor);
  const endRGB = hexToRgb(endColor);
  const gradient = [];

  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    const interpolatedColor = interpolateColor(startRGB, endRGB, factor);
    gradient.push(
      rgbToHex(interpolatedColor.r, interpolatedColor.g, interpolatedColor.b)
    );
  }

  return gradient;
}

const startColor = "#FFFFFF"; // Black
const endColor = "#000000"; // White
const gradientArray = generateGradient(startColor, endColor, 1000);

console.log(gradientArray);
