function openUploadForm() {
    const uploadWindow = window.open("", "Upload Software", "width=500,height=600");

    uploadWindow.document.body.style.backgroundColor = '#add8e6';

    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
        .upload-form {
            display: flex;
            flex-direction: column;
            max-width: 300px;
            margin: 0 auto;
            padding: 20px;
            background: #FFF;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .upload-form input,
        .upload-form textarea,
        .upload-form select,
        .upload-form button,
        .upload-form label {
            margin-bottom: 20px;
            padding: 15px;
            font-size: 18px;
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        .upload-form button,
        .upload-form label {
            background-color: #4CAF50;
            color: white;
            cursor: pointer;
            border: none;
        }
        .upload-form input[type="file"] {
            display: none;  /* Hide the original file input */
        }
        .error-message {
            color: red;
            font-size: 18px;
            text-align: center;
            margin-bottom: 20px;
        }
    `;
    uploadWindow.document.head.appendChild(styleElement);

    const uploadForm = document.createElement('form');
    uploadForm.className = 'upload-form';

    const nameInput = document.createElement('input');
    nameInput.placeholder = '软件名称';
    uploadForm.appendChild(nameInput);

    const categorySelect = document.createElement('select');
    ['桌面', '网络', '安全', '数据中心'].forEach(function(category) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    uploadForm.appendChild(categorySelect);

    const fileInputLabel = document.createElement('label');
    fileInputLabel.textContent = '选择文件';
    uploadForm.appendChild(fileInputLabel);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInputLabel.appendChild(fileInput);

    fileInput.onchange = function() {
        const fileName = this.value.split('\\').pop();
        fileInputLabel.textContent = fileName ? '选择文件: ' + fileName : '选择文件';
    };

    const imageInputLabel = document.createElement('label');
    imageInputLabel.textContent = '选择图片';
    uploadForm.appendChild(imageInputLabel);

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInputLabel.appendChild(imageInput);

    imageInput.onchange = function() {
        const fileName = this.value.split('\\').pop();
        imageInputLabel.textContent = fileName ? '选择图片: ' + fileName : '选择图片';
    };

    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    uploadForm.appendChild(errorMessage);

    const uploadButton = document.createElement('button');
    uploadButton.textContent = '上传';
    uploadButton.onclick = function(e) {
        e.preventDefault();
        if (!nameInput.value) {
            errorMessage.textContent = '软件名称不能为空！';
            return;
        }
        if (!fileInput.value || !imageInput.value) {
            errorMessage.textContent = '请确保您已选择了软件文件和图片！';
            return;
        }
        errorMessage.textContent = '';
        const formData = new FormData();
        formData.append('software_name', nameInput.value);
        formData.append('category', categorySelect.value);
        formData.append('software_file', fileInput.files[0]);
        formData.append('image', imageInput.files[0]);
        formData.append('username', encodeURIComponent(username));

        fetch('http://127.0.0.1:8088/api/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            errorMessage.textContent = data.message;
            if (data.success) {
                alert('上传成功！');
                uploadWindow.close();
                window.location.reload();

            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = '上传失败！';
        });
    };
    uploadForm.appendChild(uploadButton);

    uploadWindow.document.body.appendChild(uploadForm);
}