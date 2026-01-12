const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const https = require('https');

// 이모지 PNG 다운로드
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function generateIcon(size, outputPath, emojiImage) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 그라데이션 배경 (파란색 → 청록색)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#0066FF');
  gradient.addColorStop(1, '#00C2A8');

  // 둥근 모서리 사각형
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // 이모지 이미지 그리기
  const emojiSize = size * 0.6;
  const emojiX = (size - emojiSize) / 2;
  const emojiY = (size - emojiSize) / 2;
  ctx.drawImage(emojiImage, emojiX, emojiY, emojiSize, emojiSize);

  // PNG로 저장
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath}`);
}

async function main() {
  // 👶🏻 이모지 PNG (Apple 스타일) 다운로드
  const emojiUrl = 'https://em-content.zobj.net/source/apple/391/baby_light-skin-tone_1f476-1f3fb_1f3fb.png';

  console.log('Downloading emoji image...');
  const emojiBuffer = await downloadImage(emojiUrl);
  const emojiImage = await loadImage(emojiBuffer);
  console.log('Emoji downloaded!');

  // 192x192, 512x512 아이콘 생성
  await generateIcon(192, path.join(__dirname, 'public', 'icon-192.png'), emojiImage);
  await generateIcon(512, path.join(__dirname, 'public', 'icon-512.png'), emojiImage);

  console.log('Icons generated successfully!');
}

main().catch(console.error);
