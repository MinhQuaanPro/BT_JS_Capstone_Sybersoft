// js/product.js

// 1. Class Product
class Product {
    constructor(id, name, price, img, type, desc, screen, backCamera, frontCamera) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.img = img;
        this.type = type;
        this.desc = desc;
        this.screen = screen;
        this.backCamera = backCamera;  // ✅ Sửa từ blackCamera → backCamera
        this.frontCamera = frontCamera;
    }
}

// 2. API Config
const API_URL = "https://6a1699a21b90031f81b138b7.mockapi.io/Product";

// 3. Gọi API lấy danh sách sản phẩm
async function getProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        return data.map(item => new Product(
            item.id,
            item.name,
            item.price,
            item.img,
            item.type,
            item.desc,
            item.screen,
            item.backCamera,  // ✅ Sửa ở đây
            item.frontCamera
        ));
    } catch (error) {
        console.error("❌ Lỗi lấy dữ liệu:", error);
        return [];
    }
}

// 4. Render sản phẩm ra giao diện
function renderProducts(data) {
    const container = document.getElementById('listProduct');
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted fs-5">😕 Không tìm thấy sản phẩm nào</p>
                <button class="btn btn-primary mt-3" onclick="location.reload()">
                    <i class="fas fa-redo me-1"></i> Thử lại
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.map(product => `
        <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <div class="card product-card">
                <img src="${product.img}" class="card-img-top" alt="${product.name}" 
                     style="height: 200px; object-fit: contain; padding: 10px;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title text-truncate" title="${product.name}">${product.name}</h5>
                    <p class="card-text text-primary fw-bold">
                        ${parseInt(product.price).toLocaleString('vi-VN')} ₫
                    </p>
                    <p class="card-text small text-muted">
                        <span class="badge ${product.type === 'iphone' ? 'bg-info' : 'bg-warning'} text-dark">
                            ${product.type?.toUpperCase()}
                        </span>
                    </p>
                    <div class="mt-auto d-flex gap-2">
                        <a href="detail.html?id=${product.id}" class="btn btn-outline-primary btn-sm flex-grow-1">
                            <i class="fas fa-eye"></i> Xem
                        </a>
                        <!-- ✅ Đảm bảo onclick gọi đúng hàm addToCart -->
                        <button class="btn btn-primary btn-sm flex-grow-1" 
                                onclick="addToCart('${product.id}')">
                            <i class="fas fa-cart-plus"></i> Thêm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 5. ✅ ĐỔI TÊN hàm placeholder để tránh xung đột với cart.js
function addToCartPlaceholder(id) {
    console.log("⚠️ addToCart placeholder called - cart.js should override this!");
    console.log("Product ID:", id);
}

// 6. Export để dùng ở file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Product, getProducts, renderProducts };
}