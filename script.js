// Filter produk berdasarkan kategori, search, dan pagination
document.addEventListener('DOMContentLoaded', function() {
    initializeAll();
});

// Global variables
let currentSearchTerm = '';
let currentCategory = 'all';
let currentPage = 1;
const itemsPerPage = 8;

function initializeAll() {
    initializeSearch();
    initializeCategoryFilter();
    initializePagination();
    loadCartData();
    applyAllFilters(); // Apply filter pertama kali
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearchTerm = this.value.trim();
            currentPage = 1;
            applyAllFilters();
        });
        
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                currentSearchTerm = searchInput.value.trim();
                currentPage = 1;
                applyAllFilters();
            });
        }
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                currentSearchTerm = this.value.trim();
                currentPage = 1;
                applyAllFilters();
            }
        });
    }
}

// Category Filter functionality
function initializeCategoryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentCategory = this.getAttribute('data-category');
            currentSearchTerm = '';
            currentPage = 1;
            
            const searchInput = document.querySelector('.search-bar input');
            if (searchInput) searchInput.value = '';
            
            applyAllFilters();
        });
    });
}

// MAIN FUNCTION - SANGAT SIMPLE
function applyAllFilters() {
    const allProducts = document.querySelectorAll('.product-card');
    const noResults = document.getElementById('no-results');
    
    // Step 1: SEMBUNYIKAN SEMUA produk
    allProducts.forEach(product => {
        product.style.display = 'none';
    });
    
    // Step 2: Dapatkan produk yang match filter
    const visibleProducts = [];
    allProducts.forEach(product => {
        const title = product.querySelector('.product-title').textContent.toLowerCase();
        const category = product.getAttribute('data-category');
        const categoryLabel = product.querySelector('.category-label').textContent.toLowerCase();
        
        const searchMatch = currentSearchTerm === '' || 
                           title.includes(currentSearchTerm.toLowerCase()) ||
                           categoryLabel.includes(currentSearchTerm.toLowerCase());
        
        const categoryMatch = currentCategory === 'all' || category === currentCategory;
        
        if (searchMatch && categoryMatch) {
            visibleProducts.push(product);
        }
        console.log('=== DEBUG PAGINATION ===');
        console.log('Total produk:', document.querySelectorAll('.product-card').length);
        console.log('Produk visible:', visibleProducts.length);
        console.log('Current page:', currentPage);
        console.log('Start index:', (currentPage - 1) * itemsPerPage);
        console.log('End index:', currentPage * itemsPerPage);
        console.log('=====================');
    });
    
    // Step 3: Handle no results
    if (visibleProducts.length === 0) {
        showNoResults();
        hidePagination();
        return;
    } else {
        hideNoResults();
    }
    
    // Step 4: Hitung pagination
    const totalPages = Math.ceil(visibleProducts.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    
    // Step 5: Tampilkan HANYA produk di halaman aktif
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    console.log(`Halaman ${currentPage}: Menampilkan produk ${startIndex + 1}-${endIndex} dari ${visibleProducts.length}`);
    
    for (let i = startIndex; i < endIndex && i < visibleProducts.length; i++) {
        visibleProducts[i].style.display = 'block';
    }
    
    // Step 6: Update pagination UI
    updatePaginationUI(visibleProducts.length);
}

function showNoResults() {
    let noResults = document.getElementById('no-results');
    if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'no-results';
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>Produk tidak ditemukan</h3>
            <p>Coba gunakan kata kunci lain atau filter kategori yang berbeda</p>
            <button onclick="showAllProducts()" class="cta-button">Tampilkan Semua Produk</button>
        `;
        document.querySelector('.products-grid').parentNode.insertBefore(noResults, document.querySelector('.products-grid').nextSibling);
    }
    noResults.style.display = 'block';
}

function hideNoResults() {
    const noResults = document.getElementById('no-results');
    if (noResults) noResults.style.display = 'none';
}

function hidePagination() {
    const pagination = document.querySelector('.pagination');
    if (pagination) pagination.style.display = 'none';
}

function showAllProducts() {
    currentSearchTerm = '';
    currentCategory = 'all';
    currentPage = 1;
    
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) searchInput.value = '';
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        if (btn.getAttribute('data-category') === 'all') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    applyAllFilters();
}

// Pagination functionality
function initializePagination() {
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.addEventListener('click', function(e) {
            const target = e.target.closest('.page-btn');
            if (!target) return;
            
            e.preventDefault();
            
            if (target.classList.contains('prev')) {
                if (currentPage > 1) {
                    currentPage--;
                    applyAllFilters();
                }
            } else if (target.classList.contains('next')) {
                const totalPages = Math.ceil(getVisibleProductsCount() / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    applyAllFilters();
                }
            } else {
                const pageNum = parseInt(target.textContent);
                if (!isNaN(pageNum)) {
                    currentPage = pageNum;
                    applyAllFilters();
                }
            }
        });
    }
}

function updatePaginationUI(totalVisibleProducts) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(totalVisibleProducts / itemsPerPage);
    
    // Generate pagination HTML
    let paginationHTML = '';
    
    // Prev button
    paginationHTML += `<a href="#" class="page-btn prev" style="display: ${currentPage > 1 ? 'flex' : 'none'}">
        <i class="fas fa-chevron-left"></i> Back
    </a>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const active = i === currentPage ? 'active' : '';
        paginationHTML += `<a href="#" class="page-btn ${active}">${i}</a>`;
    }
    
    // Next button
    paginationHTML += `<a href="#" class="page-btn next" style="display: ${currentPage < totalPages ? 'flex' : 'none'}">
        Next <i class="fas fa-chevron-right"></i>
    </a>`;
    
    pagination.innerHTML = paginationHTML;
    pagination.style.display = totalPages > 1 ? 'flex' : 'none';
}

function getVisibleProductsCount() {
    const allProducts = document.querySelectorAll('.product-card');
    let count = 0;
    
    allProducts.forEach(product => {
        const title = product.querySelector('.product-title').textContent.toLowerCase();
        const category = product.getAttribute('data-category');
        const categoryLabel = product.querySelector('.category-label').textContent.toLowerCase();
        
        const searchMatch = currentSearchTerm === '' || 
                           title.includes(currentSearchTerm.toLowerCase()) ||
                           categoryLabel.includes(currentSearchTerm.toLowerCase());
        
        const categoryMatch = currentCategory === 'all' || category === currentCategory;
        
        if (searchMatch && categoryMatch) count++;
    });
    
    return count;
}

// Load cart data
function loadCartData() {
    if (typeof updateCartDisplay === 'function') {
        updateCartDisplay();
    }
}

// Animasi untuk kartu produk
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

// Mencegah event bubbling dari tombol beli
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('buy-button') || e.target.closest('.buy-button')) {
        e.preventDefault();
        e.stopPropagation();
    }
});