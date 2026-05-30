// // js/admin.js

// // 1. Hiện danh sách (Sử dụng Axios)
// async function renderAdminTable() {
//     try {
//         const res = await axios.get(API_URL);
//         const list = res.data;
//         // Render ra table...
//     } catch (err) { console.log(err); }
// }

// // 2. Thêm sản phẩm (Validation)
// async function addProduct() {
//     // Lấy giá trị từ form
//     // Validate (kiểm tra rỗng...)
//     // Gọi API POST
//     /*
//     await axios.post(API_URL, {
//         name: "...",
//         price: 123,
//         ...
//     });
//     */
// }

// // 3. Tìm kiếm và Sắp xếp
// function searchProduct(keyword) {
//     // Lọc mảng theo name chứa keyword
// }
// function sortPrice(type) { // type: 'tang' or 'giam'
//     // Sắp xếp mảng theo price
// }


// js/admin.js

// API Configuration
// const API_URL = "https://62b5e745850d46572102402d.mockapi.io/api/products";
let productList = []; // Lưu trữ dữ liệu gốc để filter/sort

// ============ 1. LOAD & RENDER ============

// Load sản phẩm khi trang load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    
    // Event listener cho form
    document.getElementById('productForm').addEventListener('submit', handleSubmit);
    
    // Event listener cho search (real-time)
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterAndRender(e.target.value.trim());
    });
    
    // Cập nhật cart count từ localStorage
    updateCartCount();
});

// Gọi API lấy danh sách sản phẩm
async function loadProducts() {
    try {
        const response = await axios.get(API_URL);
        productList = response.data;
        renderAdminTable(productList);
        updateProductCount();
    } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        showAlert('error', 'Không thể tải danh sách sản phẩm!');
    }
}

// Render table sản phẩm
function renderAdminTable(data) {
    const tbody = document.getElementById('adminProductList');
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                    Không tìm thấy sản phẩm
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = data.map(product => `
        <tr>
            <td><small class="text-muted">#${product.id}</small></td>
            <td>
                <img src="${product.img}" alt="${product.name}" class="table-img">
            </td>
            <td>
                <strong>${product.name}</strong>
                <br><small class="text-muted">${product.desc?.substring(0, 30) || ''}...</small>
            </td>
            <td class="fw-bold text-primary">
                ${parseInt(product.price).toLocaleString('vi-VN')} ₫
            </td>
            <td>
                <span class="badge ${product.type === 'iphone' ? 'bg-info' : 'bg-warning'} text-dark">
                    ${product.type?.toUpperCase()}
                </span>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-primary action-btn me-1" 
                        onclick="editProduct('${product.id}')" title="Sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger action-btn" 
                        onclick="deleteProduct('${product.id}')" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Cập nhật số lượng sản phẩm hiển thị
function updateProductCount() {
    document.getElementById('productCount').textContent = productList.length;
}

// ============ 2. THÊM / CẬP NHẬT ============

// Xử lý submit form
async function handleSubmit(e) {
    e.preventDefault();
    
    // Lấy dữ liệu từ form
    const productData = {
        name: document.getElementById('name').value.trim(),
        price: parseInt(document.getElementById('price').value),
        type: document.getElementById('type').value,
        img: document.getElementById('img').value.trim(),
        screen: document.getElementById('screen').value.trim(),
        backcam: document.getElementById('backcam').value.trim(),
        frontcam: document.getElementById('frontcam').value.trim(),
        desc: document.getElementById('desc').value.trim()
    };
    
    // Validate cơ bản
    if (!validateForm(productData)) return;
    
    const editId = document.getElementById('editId').value;
    
    try {
        if (editId) {
            // UPDATE
            await axios.put(`${API_URL}/${editId}`, productData);
            showAlert('success', '✅ Cập nhật sản phẩm thành công!');
        } else {
            // CREATE
            await axios.post(API_URL, productData);
            showAlert('success', '✅ Thêm sản phẩm thành công!');
        }
        
        // Reset và reload
        resetForm();
        loadProducts();
        
    } catch (error) {
        console.error('Lỗi:', error);
        showAlert('error', '❌ Có lỗi xảy ra, vui lòng thử lại!');
    }
}

// Validate form
function validateForm(data) {
    if (!data.name || data.name.length < 3) {
        showAlert('warning', '⚠️ Tên sản phẩm phải có ít nhất 3 ký tự!');
        return false;
    }
    if (!data.price || data.price <= 0) {
        showAlert('warning', '⚠️ Giá phải lớn hơn 0!');
        return false;
    }
    if (!data.type) {
        showAlert('warning', '⚠️ Vui lòng chọn loại sản phẩm!');
        return false;
    }
    if (!data.img || !data.img.startsWith('http')) {
        showAlert('warning', '⚠️ URL hình ảnh không hợp lệ!');
        return false;
    }
    return true;
}

// Reset form về trạng thái thêm mới
function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('editId').value = '';
    
    // Kiểm tra tồn tại trước khi gán
    const formTitle = document.getElementById('formTitle');
    if (formTitle) {
        formTitle.textContent = 'Thêm sản phẩm mới';
    }
    
    const btnSubmit = document.getElementById('btnSubmit');
    if (btnSubmit) {
        btnSubmit.innerHTML = '<i class="fas fa-save me-1"></i> Thêm sản phẩm';
    }
    
    const btnCancel = document.getElementById('btnCancelEdit');
    if (btnCancel) {
        btnCancel.classList.add('d-none');
    }
}
// ============ 3. EDIT ============

// Chuẩn bị form để sửa sản phẩm
function editProduct(id) {
    const product = productList.find(p => p.id === id);
    if (!product) return;
    
    // Điền dữ liệu vào form
    document.getElementById('editId').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('price').value = product.price;
    document.getElementById('type').value = product.type;
    document.getElementById('img').value = product.img;
    document.getElementById('screen').value = product.screen || '';
    document.getElementById('backcam').value = product.backCamera || product.backcam || '';
    document.getElementById('frontcam').value = product.frontCamera || product.frontcam || '';
    document.getElementById('desc').value = product.desc || '';
    
    // Đổi trạng thái form
    document.getElementById('formTitle').textContent = 'Cập nhật sản phẩm';
    document.getElementById('btnSubmit').innerHTML = '<i class="fas fa-sync me-1"></i> Cập nhật';
    document.getElementById('btnCancelEdit').classList.remove('d-none');
    
    // Scroll lên form
    document.querySelector('.card-header').scrollIntoView({ behavior: 'smooth' });
}

// Hủy sửa
function cancelEdit() {
    resetForm();
}

// ============ 4. DELETE ============

// Xóa sản phẩm
async function deleteProduct(id) {
    // Confirm trước khi xóa
    const product = productList.find(p => p.id === id);
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${product?.name}"?`)) return;
    
    try {
        await axios.delete(`${API_URL}/${id}`);
        showAlert('success', '🗑️ Đã xóa sản phẩm!');
        loadProducts(); // Reload table
    } catch (error) {
        console.error('Lỗi xóa:', error);
        showAlert('error', '❌ Không thể xóa sản phẩm!');
    }
}

// ============ 5. SEARCH & SORT ============

// Filter theo tên + render
function filterAndRender(keyword) {
    if (!keyword) {
        renderAdminTable(productList);
        return;
    }
    
    const filtered = productList.filter(p => 
        p.name.toLowerCase().includes(keyword.toLowerCase())
    );
    renderAdminTable(filtered);
}

// Sort sản phẩm
function sortProducts(field, order) {
    let sorted = [...productList];
    
    sorted.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        if (field === 'price') {
            valA = parseInt(valA) || 0;
            valB = parseInt(valB) || 0;
        } else if (field === 'name') {
            valA = valA?.toLowerCase() || '';
            valB = valB?.toLowerCase() || '';
        }
        
        if (order === 'asc') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });
    
    renderAdminTable(sorted);
}

// ============ UTILITIES ============

// Hiển thị alert thông báo
function showAlert(type, message) {
    // Tạo toast/alert đơn giản
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => alertDiv.remove(), 3000);
}

// Cập nhật số lượng giỏ hàng trên navbar
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const badges = document.querySelectorAll('#cartCount');
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        });
    } catch (e) {
        console.log('Lỗi đọc cart:', e);
    }
}