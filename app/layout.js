import './globals.css';

export const metadata = {
  title: {
    default: 'Pet sem Mito | Mito e Verdade na Medicina Veterinária',
    template: '%s | Pet sem Mito',
  },
  description:
    'Informação que cuida. Ciência que conecta. Quiz, mitos e verdades sobre a saúde de cães e gatos e um espaço para tirar dúvidas com a equipe de Medicina Veterinária.',
};

export const viewport = {
  themeColor: '#ede7db',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Outfit:wght@300..700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
