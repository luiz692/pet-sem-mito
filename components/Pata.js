export function Pata({ tamanho = 22, ...props }) {
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} aria-hidden="true" focusable="false" {...props}>
      <ellipse cx="32" cy="43" rx="14" ry="12" fill="currentColor" />
      <ellipse cx="13.5" cy="28" rx="6" ry="8" transform="rotate(-22 13.5 28)" fill="currentColor" />
      <ellipse cx="25" cy="15.5" rx="6.2" ry="8.6" transform="rotate(-7 25 15.5)" fill="currentColor" />
      <ellipse cx="39" cy="15.5" rx="6.2" ry="8.6" transform="rotate(7 39 15.5)" fill="currentColor" />
      <ellipse cx="50.5" cy="28" rx="6" ry="8" transform="rotate(22 50.5 28)" fill="currentColor" />
    </svg>
  );
}

export function Marca({ href = '/' }) {
  return (
    <a className="marca" href={href} aria-label="Pet sem Mito, página inicial">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="marca__selo" src="/logo-480.jpg" alt="" width="46" height="46" />
      <span className="marca__nome">Pet sem Mito</span>
    </a>
  );
}
