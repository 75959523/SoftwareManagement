
    let currentPage = 1;
    const pageSize = 8;
    let totalRecords;
    let totalPages;
    let allData;
    let originData;
    let userType = 2;

    window.onload = async function() {
        await doType();
        if (userType !== 1) {
            document.getElementById("downloadCountHeader").style.display = "none";
            document.getElementById("uploadFlag").style.display = "none";
        }
        doPost(1);
    }

    async function doType() {
        const formData = new FormData();
        formData.append('username', encodeURIComponent(username));

        const response = await fetch('http://127.0.0.1:8088/api/get_user_type', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        userType = data[0];
    }

    function doPost(page) {
        const apiUrl = 'http://127.0.0.1:8088/api/software_list';
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        }).then(response => {
            return response.json();
        }).then(data => {
            originData = data; // 保存所有数据
        if(originData.length === 0) {
            return;
        }
        allData = data; // 初始时，所有的数据都是显示的数据
        totalRecords = allData.length; // 计算总记录数
        totalPages = Math.ceil(totalRecords / pageSize); // 计算总页数
        renderList(page); // 渲染当前页的数据
        }).catch(err => {
            console.error('Error:', err);
        });
    }

    function renderList(page) {
        let start = (page - 1) * pageSize; // 计算当前页的第一条记录的索引
        let end = Math.min(start + pageSize, totalRecords); // 计算当前页的最后一条记录的索引
        let pageData = allData.slice(start, end); // 从所有数据中取出当前页的数据
        const tableBody = document.querySelector('.software-table tbody');
        while (tableBody.firstChild) {
            tableBody.firstChild.remove();
        }

        for (let item of pageData) {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            // nameCell.style.display = 'flex'; // 使用flex布局
            // nameCell.style.alignItems = 'center'; // 垂直居中
            // nameCell.style.justifyContent = 'center'; // 水平居中

            // const img = document.createElement('img');
            // img.src = 'http://127.0.0.1:8088/api/downloadImg?url=' + encodeURIComponent(item.image_path);
            // img.style.width = '50px'; // 设置图片宽度
            // img.style.height = '50px'; // 设置图片高度
            // img.style.objectFit = 'contain'; // 使图片始终保持在单元格内部

            nameCell.textContent = item.s_name;
            //nameCell.appendChild(img);
            row.appendChild(nameCell);

            const categoryCell = document.createElement('td');
            categoryCell.textContent = item.category;
            row.appendChild(categoryCell);

            const userCell = document.createElement('td');
            userCell.textContent = item.upload_user;
            row.appendChild(userCell);

            const timeCell = document.createElement('td');
            timeCell.textContent = item.upload_time;
            row.appendChild(timeCell);

            const fileCell = document.createElement('td');
            fileCell.textContent = item.file_path.split('data/')[1];
            row.appendChild(fileCell);

            if(userType === 1) {
                const downloadCell = document.createElement('td');
                downloadCell.textContent = item.dwn_cnt;
                row.appendChild(downloadCell)
            }

            const actionCell = document.createElement('td');
            const downloadBtn = document.createElement('a');
            downloadBtn.href = "#";
            downloadBtn.className = "btn";
            downloadBtn.textContent = "下载";
            downloadBtn.id = `downloadBtn-${item.id}`;
            downloadBtn.style.marginRight = "10px";
            actionCell.appendChild(downloadBtn);

            let deleteBtn = "";
            if(userType === 1) {
                deleteBtn = document.createElement('a');
                deleteBtn.href = "#";
                deleteBtn.className = "btn btn-danger";
                deleteBtn.textContent = "删除";
                deleteBtn.id = `deleteBtn-${item.id}`;
                actionCell.appendChild(deleteBtn);
            }

            row.appendChild(actionCell);

            tableBody.appendChild(row);

            // Add click event listener to download button
            downloadBtn.addEventListener('click', function() {
                const id = item.id;
                downloadFile(id);
            });

            // Add click event listener to delete button
            if(userType === 1){
                deleteBtn.addEventListener('click', function() {
                const id = item.id;
                const confirmDelete = confirm("确认删除吗？");
                if (confirmDelete) {
                    deleteRow(id);
                }});}
        }
        const pageInfo = document.querySelector('.pagination span');
        pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    }

    function downloadFile(id) {
        const url = 'http://127.0.0.1:8088/api/download?id=' + id;
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filename';
        a.click();
    }

    function deleteRow(id) {
        const formData = new FormData();
        formData.append('id', id);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:8088/api/delete_record', true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                alert('Deleted successfully');
                window.location.reload();
            } else {
                alert('Failed to delete');
            }
        };
        xhr.send(formData);
    }

    document.querySelector('.pagination .btn-prev').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            doPost(currentPage);
        }
    });

    document.querySelector('.pagination .btn-next').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            doPost(currentPage);
        }
    });

    document.getElementById('search-btn').addEventListener('click', function() {
        let searchKeyword = document.getElementById('search-input').value; // 获取搜索关键词
        let searchData = originData.filter(function(item) {
            return item.s_name.includes(searchKeyword); // 过滤出包含搜索关键词的数据
        });
        totalRecords = searchData.length; // 更新总记录数
        totalPages = Math.ceil(totalRecords / pageSize); // 更新总页数
        allData = searchData; // 更新数据
        currentPage = 1; // 回到第一页
        renderList(currentPage); // 渲染搜索结果
    });







