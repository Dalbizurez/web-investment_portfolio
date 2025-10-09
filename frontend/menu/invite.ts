
const shareButton = document.getElementById('shareButton');


shareButton?.addEventListener('click', async () => {
const link = 'https://hapi.app/ref/invite';


if (navigator.share) {
try {
await navigator.share({
title: 'Invita a Hapi',
text: 'Únete a Hapi y gana criptomonedas gratis.',
url: link,
});
alert('¡Link compartido exitosamente!');
} catch (err) {
console.error('Error al compartir:', err);
}
} else {
navigator.clipboard.writeText(link);
alert('Link copiado al portapapeles: ' + link);
}
});