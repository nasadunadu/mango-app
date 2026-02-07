const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const resultDiv = document.getElementById('result');

// 1. 调用手机摄像头
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } // 优先使用后置摄像头
        });
        video.srcObject = stream;
    } catch (err) {
        alert("无法访问摄像头: " + err);
    }
}

// 2. 拍照并转换成 Base64
captureButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    identifyTrash(imageData);
});

// 3. 调用豆包 API (使用火山引擎 API 格式)
async function identifyTrash(base64Image) {
    resultDiv.style.display = "block";
    resultDiv.innerText = "正在分析中，请稍后...";

    // --- 请在此处填写你的信息 ---
    const API_KEY = "你的豆包API_KEY"; 
    const ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
    const MODEL_ID = "你的推理终端ID"; // 豆包的推理终端 ID
    // -------------------------

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "请识别这张图片中的垃圾是什么，并告诉我它属于哪种垃圾分类（干垃圾、湿垃圾、可回收物、有害垃圾），并给出简短建议。" },
                            { type: "image_url", image_url: { url: base64Image } }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();
        resultDiv.innerText = data.choices[0].message.content;
    } catch (error) {
        resultDiv.innerText = "识别失败: " + error.message;
    }
}

initCamera();
