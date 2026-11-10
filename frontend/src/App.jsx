
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api";

const fallbackBooks = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", price: 299, category: "Fiction", imageUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg" },
  { id: 2, title: "Atomic Habits", author: "James Clear", price: 399, category: "Self Help", imageUrl: "https://covers.openlibrary.org/b/id/12547191-L.jpg" },
  { id: 3, title: "Ikigai", author: "Hector Garcia", price: 249, category: "Self Help", imageUrl: "https://covers.openlibrary.org/b/id/8411016-L.jpg" },
  { id: 4, title: "The Psychology of Money", author: "Morgan Housel", price: 349, category: "Finance", imageUrl: "https://covers.openlibrary.org/b/id/11105772-L.jpg" },
  { id: 5, title: "Harry Potter", author: "J.K. Rowling", price: 499, category: "Fantasy", imageUrl: "https://covers.openlibrary.org/b/id/7984916-L.jpg" },
  { id: 6, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", price: 299, category: "Finance", imageUrl: "https://covers.openlibrary.org/b/id/12547195-L.jpg" },
];

function App() {
  const [books, setBooks] = useState(fallbackBooks);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [toast, setToast] = useState("");

  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderAmount, setOrderAmount] = useState(0);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    fetch(`${API}/books`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load books");
        return res.json();
      })
      .then((data) => setBooks(data))
      .catch(() => console.log("Using sample books"));
  }, []);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title?.toLowerCase().includes(search.toLowerCase()) ||
        book.author?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || book.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  const addToCart = (book) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === book.id);

      if (existing) {
        return current.map((item) =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...book, quantity: 1 }];
    });

    notify("Added to your bag!");
  };

  const updateQuantity = (id, change) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleAuth = async (event) => {
    event.preventDefault();

    const endpoint =
      authMode === "register" ? "/auth/register" : "/auth/login";

    try {
      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Authentication failed");
        return;
      }

      setUser(data);
      setShowAuth(false);
      setForm({ name: "", email: "", password: "" });
      notify(`Welcome, ${data.name}!`);
    } catch {
      notify("Cannot connect to server. Start the backend first.");
    }
  };

  const checkout = () => {
    if (!user) {
      setShowCart(false);
      setAuthMode("login");
      setShowAuth(true);
      notify("Please log in to continue.");
      return;
    }

    if (cart.length === 0) return;

    setOrderAmount(total);
    setPaymentSuccess(false);
    setShowCart(false);
    setShowPayment(true);
  };

  const completeDemoPayment = (success) => {
    if (paymentProcessing) return;

    if (!success) {
      notify("Demo payment failed. Please try again.");
      return;
    }

    setPaymentProcessing(true);

    setTimeout(() => {
      const newOrderId =
        "MIMI" + Date.now().toString().slice(-8);

      setOrderId(newOrderId);
      setPaymentSuccess(true);
      setCart([]);
      setPaymentProcessing(false);
    }, 1200);
  };

  const closePayment = () => {
    setShowPayment(false);
    setPaymentSuccess(false);
    setPaymentProcessing(false);
    setOrderId("");
  };

  return (
    <div className="app">
      <div className="announcement">
        ✨ A little happiness delivered in every book · Discover your next favourite!
      </div>

      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">M</span>
          Mimi<span>Books.</span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#books">Explore Books</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          {user ? (
            <button
              className="login-btn"
              onClick={() => {
                setUser(null);
                notify("Logged out successfully");
              }}
            >
              Hi, {user.name?.split(" ")[0]} · Logout
            </button>
          ) : (
            <button
              className="login-btn"
              onClick={() => {
                setAuthMode("login");
                setShowAuth(true);
              }}
            >
              Login / Register
            </button>
          )}

          <button className="cart-btn" onClick={() => setShowCart(true)}>
            Bag <span>{cartCount}</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>

            <h1>
              Find your next
              <br />
              <span>happy place.</span>
            </h1>

            <p>
              Stories that inspire. Ideas that stay. Books that make
              ordinary days a little more extraordinary.
            </p>

            <a className="primary-btn" href="#books">
              Explore Collection ↗
            </a>

            <div className="hero-note">
              ♡ Curated with love for book lovers
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-circle"></div>
            <div className="floating-star star-one">✳</div>
            <div className="floating-star star-two">✦</div>

            <div className="book-stack">
              <div className="book book-purple">
                <span>THE ART OF<br />DREAMING</span>
              </div>
              <div className="book book-yellow">
                <span>MAKE<br />IT HAPPEN</span>
              </div>
              <div className="book book-coral">
                <span>YOUR NEXT<br />CHAPTER</span>
              </div>
            </div>

            <div className="art-caption">Read. Grow. Repeat.</div>
          </div>
        </section>

        <section className="benefits">
          <div>📚 <span>Handpicked reads</span></div>
          <div>💜 <span>Made for curious minds</span></div>
          <div>✨ <span>New stories await</span></div>
        </section>

        <section className="catalogue" id="books">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE BOOK CORNER</div>
              <h2>Stories worth <span>keeping.</span></h2>
              <p>Find a book that feels like it was written just for you.</p>
            </div>

            <div className="book-count">
              {filteredBooks.length} BOOKS
            </div>
          </div>

          <div className="filters">
            <div className="search-box">
              <span>⌕</span>
              <input
                placeholder="Search books or authors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="category-list">
              {["All", "Fiction", "Self Help", "Finance", "Fantasy"].map((item) => (
                <button
                  key={item}
                  className={category === item ? "category active" : "category"}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="book-grid">
            {filteredBooks.map((book, index) => (
              <article className="book-card" key={book.id}>
                <div className={`book-cover cover-${index % 4}`}>
                  <span className="category-tag">{book.category}</span>

                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="book-info">
                  <div className="book-author">{book.author}</div>
                  <h3>{book.title}</h3>

                  <div className="book-bottom">
                    <strong>₹{Number(book.price).toFixed(0)}</strong>
                    <button onClick={() => addToCart(book)}>
                      + Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="empty-state">
              No books found. Try another search! 📖
            </div>
          )}
        </section>

        <section className="quote-section" id="about">
          <div className="quote-mark">“</div>
          <h2>
            A room without books
            <br />
            is like a body without a soul.
          </h2>
          <p>— Marcus Tullius Cicero</p>
        </section>

        <section className="newsletter">
          <div>
            <div className="eyebrow">A NOTE FROM MIMIBOOKS</div>
            <h2>Stay in the <span>story.</span></h2>
            <p>Keep exploring. Keep learning. Keep turning pages.</p>
          </div>

          <a href="#books" className="primary-btn">
            Find Your Book ↗
          </a>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon">M</span>
          Mimi<span>Books.</span>
        </a>

        <p>For the love of stories, one page at a time. 💜</p>

        <div className="developer-credit">
          <p>DESIGNED & DEVELOPED BY</p>
          <h3>Misbah Shaikh</h3>
          <p>PRN: 12414009 <span>·</span> Roll No: 10</p>
        </div>

        <div className="copyright">
          © 2026 MimiBooks. All rights reserved.
        </div>
      </footer>

      {showCart && (
        <div className="overlay" onClick={() => setShowCart(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-heading">
              <h2>Your Book Bag 🛍️</h2>
              <button onClick={() => setShowCart(false)}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state">
                Your bag is waiting for a story! 📚
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <h4>{item.title}</h4>
                        <p>₹{item.price}</p>
                      </div>

                      <div className="quantity">
                        <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Total</span>
                  <strong>₹{total.toFixed(2)}</strong>
                </div>

                <button
                  className="primary-btn checkout-btn"
                  onClick={checkout}
                >
                  Continue to Checkout →
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      {showAuth && (
        <div className="overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowAuth(false)}
            >
              ✕
            </button>

            <div className="eyebrow">WELCOME TO MIMIBOOKS</div>

            <h2>
              {authMode === "login" ? "Welcome back!" : "Join our book club."}
            </h2>

            <p>
              {authMode === "login"
                ? "Log in and pick up where you left off."
                : "Create an account and start exploring."}
            </p>

            <form onSubmit={handleAuth}>
              {authMode === "register" && (
                <input
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              )}

              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />

              <input
                type="password"
                placeholder="Password (minimum 6 characters)"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                minLength="6"
                required
              />

              <button className="primary-btn auth-submit" type="submit">
                {authMode === "login" ? "Login →" : "Create Account →"}
              </button>
            </form>

            <p className="switch-auth">
              {authMode === "login"
                ? "New to MimiBooks?"
                : "Already have an account?"}

              <button
                onClick={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
              >
                {authMode === "login" ? " Register" : " Login"}
              </button>
            </p>
          </div>
        </div>
      )}

      {showPayment && (
        <div className="overlay">
          <div className="auth-modal payment-modal">
            {!paymentSuccess ? (
              <>
                <button className="modal-close" onClick={() => setShowPayment(false)}>
                  ✕
                </button>

                <div className="eyebrow">MIMIBOOKS CHECKOUT</div>
                <h2>Complete your order 💜</h2>
                <p>Choose a demo payment method.</p>

                <div className="payment-total">
                  <span>Total amount</span>
                  <strong>₹{orderAmount.toFixed(2)}</strong>
                </div>

                <div className="payment-options">
                  <button
                    className={paymentMethod === "UPI" ? "payment-option selected" : "payment-option"}
                    onClick={() => setPaymentMethod("UPI")}
                  >
                    📱 UPI Payment
                  </button>

                  <button
                    className={paymentMethod === "Card" ? "payment-option selected" : "payment-option"}
                    onClick={() => setPaymentMethod("Card")}
                  >
                    💳 Credit / Debit Card
                  </button>
                </div>

                <div className="demo-warning">
                  DEMO MODE — No real money will be charged.
                </div>

                <button
                  className="primary-btn auth-submit"
                  disabled={paymentProcessing}
                  onClick={() => completeDemoPayment(true)}
                >
                  {paymentProcessing
                    ? "Processing demo payment..."
                    : `Pay ₹${orderAmount.toFixed(2)} · Demo Success`}
                </button>

                <button
                  className="payment-fail"
                  disabled={paymentProcessing}
                  onClick={() => completeDemoPayment(false)}
                >
                  Simulate Payment Failure
                </button>
              </>
            ) : (
              <div className="success-screen">
                <div className="success-icon">✓</div>
                <div className="eyebrow">DEMO PAYMENT SUCCESSFUL</div>
                <h2>Order confirmed!</h2>
                <p>
                  Thank you for shopping with MimiBooks.
                  Your demo order has been completed.
                </p>

                <div className="order-number">
                  <p>Order ID</p>
                  <strong>{orderId}</strong>
                  <p>Payment method: {paymentMethod}</p>
                  <p>Amount: ₹{orderAmount.toFixed(2)}</p>
                </div>

                <button className="primary-btn auth-submit" onClick={closePayment}>
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
