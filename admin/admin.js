import { supabase } from '../js/supabase.js';

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const productModal = document.getElementById('productModal');
const closeModal = document.querySelector('.close-modal');
const addProductBtn = document.getElementById('addProductBtn');
const productForm = document.getElementById('productForm');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const navLinks = document.querySelectorAll('.admin-nav a');
const contentSections = document.querySelectorAll('.content-section');
const productsGrid = document.querySelector('.products-grid');
const inventoryGrid = document.querySelector('.inventory-grid');
const categoriesList = document.querySelector('.categories-grid');
const sizesList = document.getElementById('sizeInventory');
const categorySelect = document.getElementById('category');

// State
let currentImages = [];

// Check admin authentication
async function checkAdminAuth() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.user_metadata?.is_admin) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/login.html';
        return false;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return;

    try {
        await Promise.all([
            loadDashboardStats(),
            loadProducts(),
            loadCategories(),
            loadInventory(),
            loadSizesForInventory(),
            loadCategoriesForSelect()
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading dashboard data. Please refresh the page.');
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
});

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        showPage(targetId);
    });
});

function showPage(pageId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${pageId}`) {
            link.classList.add('active');
        }
    });

    contentSections.forEach(section => {
        section.style.display = 'none';
        if (section.id === pageId) {
            section.style.display = 'block';
        }
    });
}

// Dashboard Stats
async function loadDashboardStats() {
    try {
        const [
            { count: totalProducts, error: error1 },
            { count: activeProducts, error: error2 },
            { count: totalCategories, error: error3 },
            { count: lowStockItems, error: error4 }
        ] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('categories').select('*', { count: 'exact', head: true }),
            supabase.from('inventory').select('*', { count: 'exact', head: true }).lt('quantity', 10)
        ]);

        if (error1 || error2 || error3 || error4) throw new Error('Error fetching stats');

        document.getElementById('totalProducts').textContent = totalProducts || 0;
        document.getElementById('activeProducts').textContent = activeProducts || 0;
        document.getElementById('totalCategories').textContent = totalCategories || 0;
        document.getElementById('lowStockItems').textContent = lowStockItems || 0;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        document.getElementById('totalProducts').textContent = 'Error';
        document.getElementById('activeProducts').textContent = 'Error';
        document.getElementById('totalCategories').textContent = 'Error';
        document.getElementById('lowStockItems').textContent = 'Error';
    }
}

// Products
async function loadProducts() {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                *,
                category:categories(name),
                inventory:inventory(size_id, quantity)
            `);

        if (error) throw error;

        productsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image_url || '/images/placeholder.svg'}" alt="${product.name}" class="product-image">
                <div class="product-details">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <span class="product-status status-${product.status}">${product.status}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p>Error loading products. Please try again.</p>';
    }
}

// Categories
async function loadCategories() {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*');

        if (error) throw error;

        categoriesList.innerHTML = categories.map(category => `
            <div class="category-card">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
        categoriesList.innerHTML = '<p>Error loading categories. Please try again.</p>';
    }
}

// Inventory
async function loadInventory() {
    try {
        const { data: inventory, error } = await supabase
            .from('inventory')
            .select(`
                *,
                product:products(name),
                size:sizes(name)
            `);

        if (error) throw error;

        inventoryGrid.innerHTML = inventory.map(item => `
            <div class="inventory-item">
                <div>${item.product.name}</div>
                <div>${item.size.name}</div>
                <div class="inventory-controls">
                    <button onclick="updateInventory(${item.id}, -1)">-</button>
                    <input type="number" value="${item.quantity}" onchange="setInventory(${item.id}, this.value)">
                    <button onclick="updateInventory(${item.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading inventory:', error);
        inventoryGrid.innerHTML = '<p>Error loading inventory. Please try again.</p>';
    }
}

// Load sizes for inventory
async function loadSizesForInventory() {
    try {
        const { data: sizes, error } = await supabase
            .from('sizes')
            .select('*')
            .order('display_order');

        if (error) throw error;

        sizeInventory.innerHTML = sizes.map(size => `
            <div class="size-inventory-item">
                <label>${size.name}</label>
                <input type="number" name="inventory_${size.id}" min="0" value="0">
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading sizes:', error);
        sizeInventory.innerHTML = '<p>Error loading sizes</p>';
    }
}

// Load categories for select
async function loadCategoriesForSelect() {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;

        categorySelect.innerHTML = `
            <option value="">Select a category</option>
            ${categories.map(category => `
                <option value="${category.id}">${category.name}</option>
            `).join('')}
        `;
    } catch (error) {
        console.error('Error loading categories for select:', error);
        categorySelect.innerHTML = '<option value="">Error loading categories</option>';
    }
}

// Modal
addProductBtn.addEventListener('click', async () => {
    productModal.style.display = 'block';
    await loadCategoriesForSelect();
});

closeModal.addEventListener('click', () => {
    productModal.style.display = 'none';
    productForm.reset();
    imagePreview.style.display = 'none';
    currentImages = [];
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === productModal) {
        productModal.style.display = 'none';
        productForm.reset();
        imagePreview.style.display = 'none';
        currentImages = [];
    }
});

// Image Selection
imageInput.addEventListener('change', handleImageSelection);

async function handleImageSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Store file for upload
    currentImages = [file];
}

// Product Form
productForm.addEventListener('submit', handleProductSubmit);

async function handleProductSubmit(e) {
    e.preventDefault();

    try {
        let imageUrl = null;

        // Upload image if selected
        if (currentImages.length > 0) {
            const file = currentImages[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);

            imageUrl = publicUrl;
        }

        // Add product to database
        const { data, error } = await supabase.from('products').insert({
            name: productForm.name.value,
            description: productForm.description.value,
            price: parseFloat(productForm.price.value),
            category_id: productForm.category.value,
            image_url: imageUrl,
            status: 'active'
        });

        if (error) throw error;

        // Reset form and close modal
        productForm.reset();
        productModal.style.display = 'none';
        imagePreview.style.display = 'none';
        currentImages = [];

        // Reload products
        loadProducts();
        loadDashboardStats();
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product. Please try again.');
    }
}

// Inventory Management
async function updateInventory(inventoryId, change) {
    try {
        const { data: currentInventory } = await supabase
            .from('inventory')
            .select('quantity')
            .eq('id', inventoryId)
            .single();

        const newQuantity = Math.max(0, currentInventory.quantity + change);

        const { error } = await supabase
            .from('inventory')
            .update({ quantity: newQuantity })
            .eq('id', inventoryId);

        if (error) throw error;

        loadInventory();
        loadDashboardStats();
    } catch (error) {
        console.error('Error updating inventory:', error);
        alert('Error updating inventory. Please try again.');
    }
}

async function setInventory(inventoryId, quantity) {
    try {
        const newQuantity = Math.max(0, parseInt(quantity) || 0);

        const { error } = await supabase
            .from('inventory')
            .update({ quantity: newQuantity })
            .eq('id', inventoryId);

        if (error) throw error;

        loadInventory();
        loadDashboardStats();
    } catch (error) {
        console.error('Error setting inventory:', error);
        alert('Error setting inventory. Please try again.');
    }
}

// Export functions for global access
window.updateInventory = updateInventory;
window.setInventory = setInventory; 