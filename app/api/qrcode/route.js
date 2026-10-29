import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

// QR code do site. ?formato=svg para o telão; padrão PNG em alta (?baixar=1 força o download).
export async function GET(req) {
  const params = new URL(req.url).searchParams;
  const origem = new URL(req.url).origin;
  const alvo = process.env.NEXT_PUBLIC_SITE_URL || origem;
  const opcoes = { margin: 2, errorCorrectionLevel: 'M', color: { dark: '#12304A', light: '#FFFFFF' } };

  if (params.get('formato') === 'svg') {
    const svg = await QRCode.toString(alvo, { ...opcoes, type: 'svg' });
    return new Response(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' },
    });
  }

  const png = await QRCode.toBuffer(alvo, { ...opcoes, width: 1200 });
  const modo = params.has('baixar') ? 'attachment' : 'inline';
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `${modo}; filename="qrcode-pet-sem-mito.png"`,
      'Cache-Control': 'no-store',
    },
  });
}
