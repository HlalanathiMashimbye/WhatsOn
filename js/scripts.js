/**
 * Toggles the mobile nav menu open/closed
 */
function toggleMenu() {
  const nav = document.querySelector('.nav');
  nav.classList.toggle('show');
}

// =========================
// Cart Functionality
// =========================

/**
 * Add an event item to the shopping cart
 * @param {string} itemName - Name of the event/item
 */
function addToCart(itemName) {
  const eventCard = document.querySelector('.event-card');
  if (!eventCard) return;

  // Extract details
  let price = 0, venue = "Venue", image = "../images/event-placeholder.jpg";
  eventCard.querySelectorAll('p').forEach(p => {
    const text = p.textContent;
    if (text.includes('Price:')) {
      const m = text.match(/R(\d+)/);
      if (m) price = parseInt(m[1], 10);
    }
    if (text.includes('Location:')) {
      const parts = text.split(':')[1].split(',');
      if (parts.length) venue = parts[0].trim();
    }
  });
  const imgEl = eventCard.querySelector('img');
  if (imgEl && imgEl.src) image = imgEl.src;

  // Update cart
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const idx = cart.findIndex(i => i.name === itemName && i.type === 'event');
  if (idx > -1) {
    cart[idx].quantity += 1;
  } else {
    cart.push({ type:'event', name:itemName, price, quantity:1, image, venue });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  showNotification(`${itemName} added to cart!`);
  updateCartCount();
}

/**
 * Add a venue booking to the shopping cart
 * @param {string} venueName
 * @param {string} bookingDate - YYYY-MM-DD
 * @param {number} hours
 */
function addVenueBooking(venueName, bookingDate, hours) {
  const venueCard = document.querySelector('.venue-card');
  if (!venueCard) return;

  // Extract pricePerHour
  let pricePerHour = 0;
  venueCard.querySelectorAll('p').forEach(p => {
    const text = p.textContent;
    if (text.includes('Price:')) {
      const m = text.match(/R(\d+)/);
      if (m) pricePerHour = parseInt(m[1], 10);
    }
  });
  if (!pricePerHour) pricePerHour = 200;
  const totalPrice = pricePerHour * hours;

  // Image
  const imgEl = venueCard.querySelector('img');
  const image = imgEl ? imgEl.src : "../images/venue-placeholder.jpg";

  // Extract location
  let location = "Venue Location";
  venueCard.querySelectorAll('p').forEach(p => {
    const text = p.textContent;
    if (text.includes('Location:')) {
      const m = text.match(/Location:\s*(.*?)(?:,|$)/);
      if (m) location = m[1].trim();
    }
  });

  // Format date
  const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });

  // Cart logic
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const bookingId = `${venueName}-${bookingDate}-${hours}`;
  if (cart.some(i => i.type==='venue' && i.bookingId===bookingId)) {
    showNotification(`This booking already exists in your cart!`);
    return;
  }
  cart.push({
    type:'venue',
    bookingId,
    name: `${venueName} - ${hours}hr Booking`,
    venueName,
    bookingDate,
    formattedDate,
    hours,
    price: totalPrice,
    pricePerHour,
    quantity: 1,
    image,
    location
  });
  localStorage.setItem('cart', JSON.stringify(cart));
  showNotification(`${venueName} booked for ${formattedDate}!`);
  updateCartCount();
}

/**
 * Validate venue booking form then add to cart
 */
function validateBooking() {
  const date = document.getElementById('booking-date').value;
  const hours = parseInt(document.getElementById('hours').value, 10);
  const nameEl = document.querySelector('.venue-card h3');
  const name = nameEl ? nameEl.textContent : "Venue";

  if (!date || !hours) {
    alert('Please select a valid date and hours.');
    return;
  }
  const d = new Date(date);
  const today = new Date(); today.setHours(0,0,0,0);
  if (d < today) {
    alert('The selected date cannot be in the past.');
    return;
  }
  addVenueBooking(name, date, hours);
}

/**
 * Remove an event from the cart
 * @param {string} itemName
 */
function removeFromCart(itemName) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(i => !(i.type==='event' && i.name===itemName));
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

/**
 * Remove a venue booking
 * @param {string} bookingId
 */
function removeVenueBooking(bookingId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(i => !(i.type==='venue' && i.bookingId===bookingId));
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

/**
 * Change quantity of an event item
 * @param {string} itemName
 * @param {number} newQty
 */
function updateQuantity(itemName, newQty) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const idx = cart.findIndex(i => i.type==='event' && i.name===itemName);
  if (idx > -1) {
    if (newQty < 1) removeFromCart(itemName);
    else {
      cart[idx].quantity = newQty;
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    }
  }
  updateCartCount();
}

/**
 * Calculate the total price
 * @returns {number}
 */
function calculateTotal() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  return cart.reduce((sum, i) => sum + (i.type==='venue' ? i.price : i.price * i.quantity), 0);
}

/**
 * Display notification
 */
function showNotification(message) {
  let n = document.getElementById('cart-notification');
  if (!n) {
    n = document.createElement('div');
    n.id = 'cart-notification';
    n.style.cssText = `
      position:fixed;bottom:20px;right:20px;padding:15px 20px;
      background:#2ecc71;color:#fff;border-radius:5px;
      box-shadow:0 2px 10px rgba(0,0,0,0.2);opacity:0;
      transform:translateY(20px);transition:0.3s;
    `;
    document.body.appendChild(n);
  }
  n.textContent = message;
  setTimeout(() => { n.style.opacity='1'; n.style.transform='translateY(0)'; }, 10);
  setTimeout(() => { n.style.opacity='0'; n.style.transform='translateY(20px)'; }, 3000);
}

/**
 * Update cart count badge
 */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((c,i) => c + (i.quantity), 0);
  let badge = document.querySelector('.cart-count');
  if (!badge) {
    document.querySelectorAll('a[href*="cart.html"]').forEach(link => {
      badge = document.createElement('span');
      badge.className = 'cart-count';
      badge.style.cssText = `
        display:inline-flex;align-items:center;justify-content:center;
        background:#e74c3c;color:#fff;border-radius:50%;
        width:18px;height:18px;font-size:12px;
        position:relative;top:-10px;left:2px;font-weight:bold;
      `;
      link.appendChild(badge);
    });
  }
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

/**
 * Render entire cart (events + venues)
 */
function renderCart() {
  const grid = document.querySelector('.category-grid');
  const checkout = document.querySelector('.checkout');
  if (!grid || !checkout) return;

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  grid.innerHTML = '';

  if (!cart.length) {
    grid.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Explore events or venues to add them!</p>
        <div class="empty-cart-buttons">
          <a href="../eventfind/events.html" class="btn-primary">Browse Events</a>
          <a href="../venueconnect/venues.html" class="btn-secondary">Browse Venues</a>
        </div>
      </div>`;
    checkout.innerHTML = '';
    return;
  }

  cart.forEach(item => {
    if (item.type === 'venue') renderVenueBookingItem(item, grid);
    else renderEventItem(item, grid);
  });

  addCartItemStyles();
  addCheckoutStyles();

  const total = calculateTotal();
  checkout.innerHTML = `
    <div class="cart-summary">
      <h3>Order Summary</h3>
      <div class="summary-row"><span>Subtotal:</span><span>R${total}</span></div>
      <div class="summary-row"><span>VAT (15%):</span><span>R${(total*0.15).toFixed(2)}</span></div>
      <div class="summary-row total"><span>Total:</span><span>R${(total*1.15).toFixed(2)}</span></div>
      <button class="checkout-btn" onclick="processCheckout()">Proceed to Checkout</button>
      <button class="clear-cart-btn" onclick="clearCart()">Clear Cart</button>
    </div>`;
}

/**
 * Render a venue booking item
 */
function renderVenueBookingItem(item, grid) {
  const el = document.createElement('div');
  el.className = 'cart-item venue-booking';
  el.innerHTML = `
    <div class="cart-item-image"><img src="${item.image}" alt="${item.venueName}"></div>
    <div class="cart-item-details">
      <h3>${item.venueName}</h3>
      <p><strong>Booking:</strong> ${item.formattedDate}</p>
      <p><strong>Duration:</strong> ${item.hours} hour${item.hours > 1 ? 's' : ''}</p>
      <p><strong>Location:</strong> ${item.location}</p>
      <p><strong>Rate:</strong> R${item.pricePerHour}/hour</p>
    </div>
    <div class="cart-item-subtotal">
      <p>R${item.price}</p>
      <button class="remove-btn" onclick="removeVenueBooking('${item.bookingId}')">Cancel Booking</button>
    </div>`;
  grid.appendChild(el);
}

/**
 * Render an event item
 */
function renderEventItem(item, grid) {
  const el = document.createElement('div');
  el.className = 'cart-item event';
  el.innerHTML = `
    <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
    <div class="cart-item-details">
      <h3>${item.name}</h3>
      <p>Venue: ${item.venue}</p>
      <p>Price: R${item.price}</p>
      <div class="quantity-controls">
        <button class="quantity-btn minus" onclick="updateQuantity('${item.name}', ${item.quantity-1})">-</button>
        <span class="quantity">${item.quantity}</span>
        <button class="quantity-btn plus" onclick="updateQuantity('${item.name}', ${item.quantity+1})">+</button>
      </div>
    </div>
    <div class="cart-item-subtotal">
      <p>R${item.price * item.quantity}</p>
      <button class="remove-btn" onclick="removeFromCart('${item.name}')">Remove</button>
    </div>`;
  grid.appendChild(el);
}

/**
 * Clear all items from cart
 */
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    localStorage.removeItem('cart');
    renderCart();
    updateCartCount();
    showNotification('Cart cleared!');
  }
}

/**
 * Simulate checkout
 */
function processCheckout() {
  alert('Proceeding to payment gateway...');
  localStorage.removeItem('cart');
  renderCart();
  updateCartCount();
  showNotification('Thank you for your purchase!');
}

/**
 * Polyfill for CSS :contains() (not used in venue logic anymore)
 */
Element.prototype.contains = function(text) {
  return this.textContent.includes(text);
};

// =========================
// Styles Injection
// =========================

function addCartItemStyles() {
  if (document.getElementById('cart-item-styles')) return;
  const s = document.createElement('style');
  s.id = 'cart-item-styles';
  s.textContent = `
    .cart-item{display:flex;border:1px solid #ddd;border-radius:8px;
     padding:15px;margin-bottom:15px;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,0.1);width:100%}
    .cart-item.event{border-left:4px solid #2ecc71}
    .cart-item.venue-booking{border-left:4px solid #3498db}
    .cart-item-image{width:100px;height:100px;overflow:hidden;border-radius:5px;margin-right:15px}
    .cart-item-image img{width:100%;height:100%;object-fit:cover}
    .cart-item-details{flex-grow:1;color:#333}
    .cart-item-details h3{margin-top:0;color:#333}
    .quantity-controls{display:flex;align-items:center;gap:10px;margin-top:10px}
    .quantity-btn{width:30px;height:30px;border-radius:50%;border:1px solid #ddd;
      background:#f5f5f5;font-size:16px;cursor:pointer;display:flex;
      align-items:center;justify-content:center}
    .quantity{font-weight:bold}
    .cart-item-subtotal{display:flex;flex-direction:column;justify-content:space-between;
      align-items:flex-end;text-align:right}
    .cart-item-subtotal p{font-weight:bold;font-size:18px;margin:0;color:#333}
    .remove-btn{background:#ff6b6b;color:#fff;border:none;padding:8px 12px;
      border-radius:4px;cursor:pointer;margin-top:10px}
    .empty-cart{text-align:center;padding:40px;width:100%}
    .empty-cart-buttons{display:flex;justify-content:center;gap:10px;margin-top:20px}
    @media(max-width:768px){.cart-item{flex-direction:column}
      .cart-item-image{width:100%;height:150px;margin:0 0 15px}
      .cart-item-subtotal{align-items:flex-start;margin-top:10px}}`;
  document.head.appendChild(s);
}

function addCheckoutStyles() {
  if (document.getElementById('checkout-styles')) return;
  const s = document.createElement('style');
  s.id = 'checkout-styles';
  s.textContent = `
    .cart-summary{background:#f9f9f9;border-radius:8px;padding:20px;
      box-shadow:0 2px 5px rgba(0,0,0,0.1);margin-top:20px;color:#333}
    .summary-row{display:flex;justify-content:space-between;padding:10px 0;
      border-bottom:1px solid #eee}
    .summary-row.total{font-weight:bold;font-size:18px;
      border-top:2px solid #ddd;border-bottom:none;padding-top:15px}
    .checkout-btn{background:#2ecc71;color:#fff;border:none;padding:12px;
      width:100%;border-radius:6px;margin-top:15px;font-size:16px;
      cursor:pointer;font-weight:bold}
    .clear-cart-btn{background:#7f8c8d;color:#fff;border:none;padding:10px;
      width:100%;border-radius:6px;margin-top:10px;font-size:14px;
      cursor:pointer}`;
  document.head.appendChild(s);
}

// =========================
// Location Handling
// =========================

function getLocation() {
  const heading = document.getElementById('location-heading');
  const text = document.getElementById('location-text');
  const spinner = document.getElementById('loading-spinner');
  if (!heading) return;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
    if (text) text.textContent = "Finding events near you... 🎷";
    if (spinner) spinner.style.display = 'inline-block';
  } else {
    if (text) text.textContent = "Geolocation not supported.";
    if (spinner) spinner.style.display = 'none';
  }
}

function showPosition(pos) {
  const { latitude:lat, longitude:lon } = pos.coords;
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    .then(r => r.json()).then(data => {
      const suburb = data.address.suburb||data.address.neighbourhood||"";
      const city = data.address.city||data.address.town||data.address.village||"your area";
      const loc = suburb? `${suburb}, ${city}`: city;
      const text = document.getElementById('location-text');
      const spinner = document.getElementById('loading-spinner');
      if (text) text.textContent = `These are the events around ${loc}! 🎷`;
      if (spinner) spinner.style.display = 'none';
      sessionStorage.setItem('userLocation', JSON.stringify({ lat, lon, simpleLocation:loc }));
    }).catch(() => {
      const text = document.getElementById('location-text');
      const spinner = document.getElementById('loading-spinner');
      if (text) text.textContent = "Unable to fetch location.";
      if (spinner) spinner.style.display = 'none';
    });
}

function showError(err) {
  const text = document.getElementById('location-text');
  const spinner = document.getElementById('loading-spinner');
  if (text) text.textContent = "Unable to fetch location.";
  if (spinner) spinner.style.display = 'none';
  switch(err.code) {
    case err.PERMISSION_DENIED: alert("User denied request for Geolocation."); break;
    case err.POSITION_UNAVAILABLE: alert("Location info is unavailable."); break;
    case err.TIMEOUT: alert("Request to get location timed out."); break;
    default: alert("An unknown error occurred."); break;
  }
}

function refreshLocation() {
  const btn = document.getElementById('refresh-location');
  if (btn) { btn.textContent="Refreshing..."; btn.disabled=true; }
  getLocation();
  setTimeout(() => {
    if (btn) { btn.textContent="Refresh Location"; btn.disabled=false; }
  }, 2000);
}

// =========================
// Initialization
// =========================

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.category-grid') && document.querySelector('.checkout')) renderCart();
  if (document.getElementById('location-heading')) getLocation();
  const btn = document.getElementById('refresh-location');
  if (btn) { btn.style.display='inline-block'; btn.addEventListener('click', refreshLocation); }
  updateCartCount();

// Rankings tab functionality 
function loadRankings() {
  // In a real app, this data would come from an API
  const rankingData = {
    position: 1,
    points: 23,
    streak: 4,
    leaderboard: [
      { rank: 1, name: "Hlalanathi Mashimbye", points: 23, isCurrentUser: true },
      { rank: 2, name: "Thabo Johnson", points: 19, isCurrentUser: false },
      { rank: 3, name: "Lerato Dlamini", points: 17, isCurrentUser: false },
      { rank: 4, name: "Nomsa Khumalo", points: 12, isCurrentUser: false },
      { rank: 5, name: "Sipho Tshabalala", points: 8, isCurrentUser: false }
    ],
    rewards: [
      { name: "Free Ticket (R200 value)", icon: "🎫", progress: 80, text: "4/5 week streak" },
      { name: "Event Master Badge", icon: "🏅", progress: 40, text: "8/20 events" },
      { name: "VIP Access Pass", icon: "🎭", progress: 60, text: "30/50 points" }
    ]
  };
  
  // Update the stats
  document.querySelector('.ranking-stats .stat-number:nth-child(1)').textContent = 
    rankingData.position + (rankingData.position === 1 ? 'st' : 
                           rankingData.position === 2 ? 'nd' : 
                           rankingData.position === 3 ? 'rd' : 'th');
  document.querySelector('.ranking-stats .stat-number:nth-child(3)').textContent = rankingData.points;
  document.querySelector('.ranking-stats .stat-number:nth-child(5)').textContent = rankingData.streak;
  
  // Update the status message based on position
  const statusEl = document.querySelector('.ranking-status');
  if (rankingData.position === 1) {
    statusEl.classList.add('success');
    statusEl.querySelector('p').textContent = 'YOU ARE CURRENTLY IN THE LEAD AMONG YOUR FRIENDS. KEEP THE STREAK UP TO UNLOCK A BADGE AND A FREE TICKET WORTH R200!';
  } else {
    statusEl.classList.remove('success');
    statusEl.querySelector('p').textContent = `You're currently ${rankingData.position}${
      rankingData.position === 2 ? 'nd' : 
      rankingData.position === 3 ? 'rd' : 'th'} among your friends. Keep attending events to climb the ranks!`;
  }
  
  // The rest of the ranking data would be updated here in a real app
}

// Call loadRankings when the rankings tab is shown
document.querySelector('.tab-btn[data-tab="rankings"]').addEventListener('click', loadRankings);

// Add loadRankings() to the initial loads if you want it to load immediately
// Initial loads
loadBookings();
loadCreatedEvents();
loadRankings(); // Add this line




});


