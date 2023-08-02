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
    ['应用', '数据', '娱乐'].forEach(function(category) {
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

    // const imageInputLabel = document.createElement('label');
    // imageInputLabel.textContent = '选择图片';
    // uploadForm.appendChild(imageInputLabel);
    //
    // const imageInput = document.createElement('input');
    // imageInput.type = 'file';
    // imageInput.accept = 'image/*';
    // imageInputLabel.appendChild(imageInput);

    // imageInput.onchange = function() {
    //     const fileName = this.value.split('\\').pop();
    //     imageInputLabel.textContent = fileName ? '选择图片: ' + fileName : '选择图片';
    // };

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
        if (!fileInput.value) {
            errorMessage.textContent = '文件不能为空！';
            return;
        }
        errorMessage.textContent = '';
        const formData = new FormData();
        formData.append('software_name', nameInput.value);
        formData.append('category', categorySelect.value);
        formData.append('software_file', fileInput.files[0]);
        //formData.append('image', imageInput.files[0]);
        formData.append('username', encodeURIComponent(username));

        progressBarContainer.style.display = 'block';

        let xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', function(e) {
        if (e.lengthComputable) {
            let progress = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = `${progress}%`;
            progressBarText.textContent = `${progress}%`;
        }});

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                let response = JSON.parse(xhr.responseText);
                errorMessage.textContent = response.message;
                if (response.success) {
                    setTimeout(function() {
                        uploadWindow.close();
                        window.location.reload();
                    }, 1000);
                }
            }
        }

        xhr.onerror = function (error) {
            console.error('Error:', error);
            errorMessage.textContent = '上传失败！';
        };

        xhr.open('POST', 'http://127.0.0.1:8088/api/upload', true);
        xhr.send(formData);
    };

    uploadForm.appendChild(uploadButton);

    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'progress-bar-container';
    progressBarContainer.style.position = 'relative';
    progressBarContainer.style.width = '100%';
    progressBarContainer.style.height = '20px';
    progressBarContainer.style.backgroundColor = 'grey';
    progressBarContainer.style.display = 'none';

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = '0';
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = 'orange';

    const progressBarText = document.createElement('span');
    progressBarText.className = 'progress-bar-text';
    progressBarText.style.position = 'relative';
    progressBarText.style.width = '100%';
    progressBarText.style.textAlign = 'center';
    progressBarText.style.color = 'black';
    progressBarText.style.lineHeight = '20px';

    progressBar.appendChild(progressBarText);
    progressBarContainer.appendChild(progressBar);
    uploadForm.appendChild(progressBarContainer);
    uploadForm.appendChild(progressBarText);

    uploadWindow.document.body.appendChild(uploadForm);

}