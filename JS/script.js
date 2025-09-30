const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const result = document.getElementById('result');
const preview = document.getElementById('preview');

let userMedia = navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
userMedia.then(stream => video.srcObject = stream);

function scan() 
{
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
        result.innerText = "QR Detectado: " + code.data;
        if (code.data.startsWith("http")) {
            fetchPreview(code.data);
        }
    }
    requestAnimationFrame(scan);
}

video.addEventListener("playing", () => scan());

async function fetchPreview(url) 
{
    preview.innerHTML = "Lendo Código QR...";

    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
    try 
    {
        const res = await fetch(apiUrl);
        const data = await res.json();
        const content = data.data;

        preview.innerHTML = `
            <h3>${content.title || "Sem título"}</h3>
            <p>${content.description || "Sem descrição"}</p>
            ${content.image ? `<img src="${content.image.url}" width="200">` : ""}
            <p><a href="${url}" target="_blank">Abrir link</a></p>`;
    } 
    catch (err) 
    {
        preview.innerHTML = "Erro ao buscar preview.";
    }
}