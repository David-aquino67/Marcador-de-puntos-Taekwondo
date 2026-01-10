
// Pequeña vista previa: abre la interfaz celular en una ventana simulando ancho móvil
document.getElementById('previewMobile')?.addEventListener('click', () => {
    const w = 420;  // ancho aproximado móvil
    const h = 740;
    const left = (screen.width - w) / 2;
    const top  = (screen.height - h) / 2;
    window.open(
        'interfaz_celular/index.html',
        'previewMobile',
        `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
});
