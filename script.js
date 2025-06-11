// Wait for the DOM to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', () => {
    let cart = []; // Initialize an empty cart array

    // Load cart from localStorage (if it exists) when the page loads
    function loadCart() {
        const storedCart = localStorage.getItem('cafeUthmanCart');
        if (storedCart) {
            try {
                // Parse the cart JSON string into an array
                cart = JSON.parse(storedCart);
                updateCartDisplay(); // Update cart count in header
                renderCartItems();    // Render cart items on my-order.html (if present)
            } catch (e) {
                console.error("Error parsing cart from localStorage:", e);
                cart = []; // Reset cart if there's an error
            }
        }
    }

    // Save the cart array to localStorage as a JSON string
    function saveCart() {
        localStorage.setItem('cafeUthmanCart', JSON.stringify(cart));
    }

    // Update the cart count in the header (shows number of items in cart)
    function updateCartDisplay() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
            cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none'; // Show only if items exist
        }
    }

    // --- Functions for Adding Items to Cart (Used on index.html and menu.html) ---

    // Add an item to the cart (or increase quantity if it already exists)
    function addItemToCart(item) {
        const existingItem = cart.find(cartItem => cartItem.name === item.name);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        saveCart();
        updateCartDisplay();

        // Show a simple, user-friendly popup
        alert(`✅ ${item.name} was successfully added to your cart!`);
    }

    // Add event listeners to all "Add to Cart" buttons on the page
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const itemElement = event.target.closest('.item');

            if (itemElement) {
                const itemName = itemElement.querySelector('h3').textContent;
                const itemPriceText = itemElement.querySelector('.price').textContent;
                const itemPrice = parseFloat(itemPriceText.replace('RM ', ''));
                // Get the image source from the <img> tag within the item
                const itemImageElement = itemElement.querySelector('img');
                const itemImage = itemImageElement ? itemImageElement.src : '';

                const itemToAdd = {
                    name: itemName,
                    price: itemPrice,
                    image: itemImage // Include image source
                };

                addItemToCart(itemToAdd);
            }
        });
    });

    // --- Functions for My Order page (my-order.html) ---

    // Render (display) cart items on the my-order.html page
    function renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartTotalElement = document.getElementById('cart-total');

        // Only proceed if these elements exist (i.e., we are on my-order.html)
        if (!cartItemsContainer || !cartTotalElement) {
            return;
        }

        cartItemsContainer.innerHTML = ''; // Clear existing items

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotalElement.textContent = 'RM 0.00';
            return;
        }

        let total = 0;

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.image || 'images/default_food.jpg'}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>RM ${item.price.toFixed(2)} each</p>
                    </div>
                </div>
                <div class="cart-item-quantity">
                    <input type="number" value="${item.quantity}" min="1" data-item-name="${item.name}">
                </div>
                <div class="cart-item-price">
                    RM ${(item.price * item.quantity).toFixed(2)}
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price * item.quantity;
        });

        cartTotalElement.textContent = `RM ${total.toFixed(2)}`;

        // Add event listeners for quantity changes on the My Order page
        cartItemsContainer.querySelectorAll('.cart-item-quantity input').forEach(input => {
            input.addEventListener('change', (event) => {
                const itemName = event.target.dataset.itemName;
                const newQuantity = parseInt(event.target.value);
                updateCartItemQuantity(itemName, newQuantity);
            });
        });
    }

    // Update item quantity in cart (used on my-order.html)
    function updateCartItemQuantity(itemName, newQuantity) {
        const itemIndex = cart.findIndex(item => item.name === itemName);
        if (itemIndex > -1) {
            if (newQuantity <= 0) {
                // Remove item if quantity is 0 or less
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].quantity = newQuantity;
            }
            saveCart();
            updateCartDisplay();
            renderCartItems(); // Re-render the cart on the page to reflect changes
        }
    }

    // --- Other Event Listeners ---

    // 1. "Order Now" Button (found on index.html hero section)
    const orderNowButton = document.querySelector('.order-now-button');
    if (orderNowButton) {
        orderNowButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            window.location.href = 'menu.html'; // Redirect to menu page
        });
    }

    // 2. Checkout Button (on my-order.html)
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.length > 0) {
                // Clear the cart and update display after a successful (simulated) checkout
                cart = []; 
                saveCart();
                updateCartDisplay();
                // Redirect to the order completed page instead of just an alert
                window.location.href = 'order-completed.html'; 
            } else {
                alert('Your cart is empty. Please add items before checking out.');
            }
        });
    }

    // --- Initial Load ---
    loadCart(); // Load cart data and update displays when the page loads
});