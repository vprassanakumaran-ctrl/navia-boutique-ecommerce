import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3000/api";

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        data?.message ||
        "Something went wrong"
    );
  }

  return data;
}

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [customerDashboard, setCustomerDashboard] = useState(null);
  const [adminDashboard, setAdminDashboard] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });

  const [adminProduct, setAdminProduct] = useState({
    name: "",
    category: "Women",
    price: "",
    stock: "",
    description: "",
    imageUrl: "",
    sizes: "",
  });

  const [editingProductId, setEditingProductId] = useState(null);

  const [resetEmail, setResetEmail] = useState("");

  const [resetForm, setResetForm] = useState({
    token: "",
    password: "",
  });

  const [checkoutForm, setCheckoutForm] = useState({ name: "", mobile: "", address: "" });

  useEffect(() => {
    checkSession();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  async function checkSession() {
    try {
      const data = await api("/auth/me");
      setUser(data.user || data);
    } catch {
      setUser(null);
    }
  }

  async function loadProducts() {
    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (category) {
        params.set("category", category);
      }

      const query = params.toString();
      const data = await api(`/products${query ? `?${query}` : ""}`);

      setProducts(data.products || data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadCart() {
    try {
      const data = await api("/cart");
      setCart(data.cart || data.items || data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function cancelOrder(orderId) {
  try {
    await api(`/orders/${orderId}/cancel`, { method: "PATCH" });
    await loadOrders();
  } catch (err) {
    setError(err.message);
  }
}

async function loadOrders() {
    try {
      const data = await api("/orders");
      setOrders(data.orders || data || []);
    } catch (err) {
      setError(err.message);
    }
  }

async function updateOrderStatus(orderId, status) {
  try {
    await api(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await loadOrders();
  } catch (err) {
    setError(err.message);
  }
}
async function updateOrderStatus(orderId, status) {
  try {
    await api(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await loadOrders();
  } catch (err) {
    setError(err.message);
  }
}
  async function loadCustomerDashboard() {
    try {
      const data = await api("/dashboard/customer");
      setCustomerDashboard(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadAdminDashboard() {
    try {
      const data = await api("/dashboard/admin");
      setAdminDashboard(data);
await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function login(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });

      setUser(data.user || data);
      setLoginForm({ email: "", password: "" });

      await loadCart();

      setMessage("Login successful.");
      setPage("home");
    } catch (err) {
      setError(err.message);
    }
  }

  async function register(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerForm),
      });

      setMessage("Registration successful. Please login.");

      setRegisterForm({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      setPage("login");
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    try {
      await api("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Continue clearing local session state.
    }

    setUser(null);
    setCart([]);
    setOrders([]);
    setPage("home");
    setMessage("Logged out successfully.");
  }

  async function openProduct(id) {
    setError("");

    try {
      const data = await api(`/products/${id}`);
      setProduct(data.product || data);
      setPage("product");
    } catch (err) {
      setError(err.message);
    }
  }

  async function addToCart(productToAdd, size = null) {
    if (!user) {
      setError("Please login before adding products to your cart.");
      setPage("login");
      return;
    }

    try {
      const body = {
        productId: productToAdd.id,
        quantity: 1,
      };

      if (size) {
        body.sizeLabel = size;
      }

      const data = await api("/cart", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setCart(data.cart || data.items || data || []);
      setMessage("Product added to cart.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateCart(item, quantity) {
    if (quantity < 1) {
      setError("Quantity cannot be less than 1.");
      return;
    }

    try {
      const data = await api(`/cart/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });

      setCart(data.cart || data.items || data || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeCartItem(itemId) {
    try {
      const data = await api(`/cart/${itemId}`, {
        method: "DELETE",
      });

      setCart(data.cart || data.items || data || []);
      setMessage("Product removed from cart.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function checkout() {
    if (!user) {
      setPage("login");
      setError("Please login before checkout.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      const data = await api("/orders/checkout", {
        method: "POST",
      });

      setCart([]);
      setMessage(
        `Order placed successfully. Order #${
          data.order?.id || data.id || ""
        }`
      );

      await loadOrders();
      setPage("orders");
    } catch (err) {
      setError(err.message);
      await loadCart();
    }
  }

  async function loadProfile() {
    try {
      const data = await api("/auth/me");
      const profile = data.user || data;

      setProfileForm({
        name: profile.name || "",
        phone: profile.phone || "",
      });

      setPage("profile");
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateProfile(e) {
    e.preventDefault();

    try {
      const data = await api("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(profileForm),
      });

      setUser(data.user || data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function requestPasswordReset(e) {
    e.preventDefault();

    try {
      await api("/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email: resetEmail }),
      });

      setMessage(
        "If the email exists, password reset instructions have been generated."
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmPasswordReset(e) {
    e.preventDefault();

    try {
      await api("/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify(resetForm),
      });

      setMessage("Password reset successful. Please login.");
      setPage("login");
    } catch (err) {
      setError(err.message);
    }
  }

  async function openCustomerDashboard() {
    await loadCustomerDashboard();
    setPage("customer-dashboard");
  }

  async function openAdminDashboard() {
    await loadAdminDashboard();
    setPage("admin-dashboard");
  }

  async function saveAdminProduct(e) {
    e.preventDefault();

    try {
      const payload = {
        name: adminProduct.name,
        category: adminProduct.category,
        price: Number(adminProduct.price),
        stock: Number(adminProduct.stock),
        description: adminProduct.description,
        imageUrl: adminProduct.imageUrl,
        sizes: adminProduct.sizes
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean),
      };

      const path = editingProductId
        ? `/products/${editingProductId}`
        : "/products";

      const method = editingProductId ? "PUT" : "POST";

      await api(path, {
        method,
        body: JSON.stringify(payload),
      });

      setMessage(
        editingProductId
          ? "Product updated successfully."
          : "Product created successfully."
      );

      setEditingProductId(null);

      setAdminProduct({
        name: "",
        category: "Women",
        price: "",
        stock: "",
        description: "",
        imageUrl: "",
        sizes: "",
      });

      await loadProducts();
      await loadAdminDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  function editProduct(item) {
    setEditingProductId(item.id);

    setAdminProduct({
      name: item.name || "",
      category: item.category || "Women",
      price: item.price ?? "",
      stock: item.stock ?? "",
      description: item.description || "",
      imageUrl: item.imageUrl || item.image_url || "",
      sizes: Array.isArray(item.sizes)
        ? item.sizes
            .map((s) => s.label || s.size_label || s)
            .join(", ")
        : "",
    });

    setPage("admin-product");
  }

  function goToCart() {
    if (!user) {
      setPage("login");
      setError("Please login to view your cart.");
      return;
    }

    loadCart();
    setPage("cart");
  }

  function goToOrders() {
    if (!user) {
      setPage("login");
      setError("Please login to view orders.");
      return;
    }

    loadOrders();
    setPage("orders");
  }

  function navigate(target) {
    setError("");
    setMessage("");

    if (target === "cart") {
      goToCart();
      return;
    }

    if (target === "orders") {
      goToOrders();
      return;
    }

    if (target === "profile") {
      if (!user) {
        setPage("login");
        return;
      }

      loadProfile();
      return;
    }

    if (target === "customer-dashboard") {
      if (!user) {
        setPage("login");
        return;
      }

      openCustomerDashboard();
      return;
    }

    if (target === "admin-dashboard") {
      if (!user?.isAdmin && user?.role !== "admin") {
        setError("Administrator access required.");
        return;
      }

      openAdminDashboard();
      return;
    }

    setPage(target);
  }

  return (
    <div className="app">
      <header className="header">
        <div
          className="logo"
          onClick={() => navigate("home")}
          style={{ cursor: "pointer" }}
        >
          <h1>Navia Boutique</h1>
        </div>

        <nav>
          <button onClick={() => navigate("home")}>Home</button>

          <button onClick={() => {
            setCategory("Women");
            setPage("home");
          }}>
            Women
          </button>

          <button onClick={() => {
            setCategory("Men");
            setPage("home");
          }}>
            Men
          </button>

          <button onClick={() => {
            setCategory("Kids");
            setPage("home");
          }}>
            Kids
          </button>

          {user && (
            <>
              <button onClick={() => navigate("cart")}>
                🛒 Cart ({cart.length})
              </button>

              <button onClick={() => navigate("orders")}>
                Orders
              </button>

              <button onClick={() => navigate("customer-dashboard")}>
                Dashboard
              </button>

              <button onClick={() => navigate("profile")}>
                Profile
              </button>

              {(user.isAdmin || user.role === "admin") && (
                <button onClick={() => navigate("admin-dashboard")}>
                  Admin
                </button>
              )}

              <button onClick={logout}>Logout</button>
            </>
          )}

          {!user && (
            <>
              <button onClick={() => navigate("login")}>
                Login
              </button>

              <button onClick={() => navigate("register")}>
                Register
              </button>
            </>
          )}
        </nav>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {message && (
        <div className="success-message">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <main>
        {page === "home" && (
          <>
            <section className="hero">
              <h2>Discover Your Style</h2>
              <p>Beautiful boutique fashion for everyone.</p>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="category-buttons">
                <button
                  onClick={() => setCategory("")}
                >
                  All
                </button>

                <button
                  onClick={() => setCategory("Women")}
                >
                  Women
                </button>

                <button
                  onClick={() => setCategory("Men")}
                >
                  Men
                </button>

                <button
                  onClick={() => setCategory("Kids")}
                >
                  Kids
                </button>
              </div>
            </section>

            <section className="products">
              <h2>
                {category ? `${category} Collection` : "Product Catalog"}
              </h2>

              {products.length === 0 ? (
                <p>No products found.</p>
              ) : (
                <div className="product-list">
                  {products.map((item) => (
                    <div className="product-card" key={item.id}>
                      <div
                        className="product-image"
                        onClick={() => openProduct(item.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {item.imageUrl || item.image_url ? (
                          <img
                            src={item.imageUrl || item.image_url}
                            alt={item.name}
                          />
                        ) : (
                          <span>🛍️</span>
                        )}
                      </div>

                      <h3>{item.name}</h3>

                      <p>{item.description}</p>

                      <p>
                        <strong>Category:</strong> {item.category}
                      </p>

                      <p>
                        <strong>Stock:</strong> {item.stock}
                      </p>

                      <h3>₹{item.price}</h3>

                      <button
                        onClick={() => openProduct(item.id)}
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => addToCart(item)}
                        disabled={Number(item.stock) <= 0}
                      >
                        {Number(item.stock) <= 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {page === "product" && product && (
          <section className="product-detail">
            <button onClick={() => navigate("home")}>
              ← Back to Products
            </button>

            <div className="detail-card">
              <div className="product-image large">
                {product.imageUrl || product.image_url ? (
                  <img
                    src={product.imageUrl || product.image_url}
                    alt={product.name}
                  />
                ) : (
                  <span>🛍️</span>
                )}
              </div>

              <div>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <h2>₹{product.price}</h2>

                <p>
                  <strong>Category:</strong> {product.category}
                </p>

                <p>
                  <strong>Stock:</strong> {product.stock}
                </p>

                <h3>Available Sizes</h3>

                {Array.isArray(product.sizes) &&
                product.sizes.length > 0 ? (
                  <div className="sizes">
                    {product.sizes.map((size, index) => {
                      const label =
                        size.label ||
                        size.size_label ||
                        size;

                      return (
                        <button
                          key={index}
                          onClick={() =>
                            addToCart(product, label)
                          }
                          disabled={Number(product.stock) <= 0}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    disabled={Number(product.stock) <= 0}
                  >
                    {Number(product.stock) <= 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {page === "login" && (
          <section className="form-page">
            <h2>Login</h2>

            <form onSubmit={login}>
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    password: e.target.value,
                  })
                }
                required
              />

              <button type="submit">Login</button>
            </form>

            <button onClick={() => navigate("register")}>
              Create account
            </button>

            <button onClick={() => navigate("forgot-password")}>
              Forgot password?
            </button>
          </section>
        )}

        {page === "register" && (
          <section className="form-page">
            <h2>Create Account</h2>

            <form onSubmit={register}>
              <input
                type="text"
                placeholder="Full name"
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="tel"
                placeholder="Mobile number"
                value={registerForm.phone}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    phone: e.target.value,
                  })
                }
              />

              <input
                type="password"
                placeholder="Password (minimum 8 characters)"
                minLength="8"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    password: e.target.value,
                  })
                }
                required
              />

              <button type="submit">
                Register
              </button>
            </form>
          </section>
        )}

        {page === "forgot-password" && (
          <section className="form-page">
            <h2>Reset Password</h2>

            <form onSubmit={requestPasswordReset}>
              <input
                type="email"
                placeholder="Registered email"
                value={resetEmail}
                onChange={(e) =>
                  setResetEmail(e.target.value)
                }
                required
              />

              <button type="submit">
                Request Reset
              </button>
            </form>

            <hr />

            <h3>Enter Reset Token</h3>

            <form onSubmit={confirmPasswordReset}>
              <input
                type="text"
                placeholder="Reset token"
                value={resetForm.token}
                onChange={(e) =>
                  setResetForm({
                    ...resetForm,
                    token: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="New password"
                minLength="8"
                value={resetForm.password}
                onChange={(e) =>
                  setResetForm({
                    ...resetForm,
                    password: e.target.value,
                  })
                }
                required
              />

              <button type="submit">
                Reset Password
              </button>
            </form>
          </section>
        )}

        {page === "profile" && (
          <section className="form-page">
            <h2>My Profile</h2>

            <form onSubmit={updateProfile}>
              <input
                type="text"
                placeholder="Name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="tel"
                placeholder="Phone"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    phone: e.target.value,
                  })
                }
              />

              <button type="submit">
                Save Profile
              </button>
            </form>
          </section>
        )}

        {page === "cart" && (
          <section className="cart">
            <h2>Shopping Cart</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item) => {
                  const quantity =
                    Number(item.quantity) || 1;

                  const price =
                    Number(
                      item.price ||
                        item.product_price ||
                        item.price_at_purchase ||
                        0
                    );

                  return (
                    <div
                      className="cart-item"
                      key={item.id}
                    >
                      <div>
                        <strong>
                          {item.name ||
                            item.product_name ||
                            "Product"}
                        </strong>

                        {item.size_label && (
                          <span>
                            {" "}
                            — Size: {item.size_label}
                          </span>
                        )}

                        <p>₹{price} × {quantity} = ₹{price * quantity}</p>
                      </div>

                      <div>
                        <button
                          onClick={() =>
                            updateCart(
                              item,
                              quantity - 1
                            )
                          }
                          disabled={quantity <= 1}
                        >
                          −
                        </button>

                        <span>
                          {" "}
                          {quantity}{" "}
                        </span>

                        <button
                          onClick={() =>
                            updateCart(
                              item,
                              quantity + 1
                            )
                          }
                        >
                          +
                        </button>

                        <button
                          onClick={() =>
                            removeCartItem(item.id)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}

                <h2>
                  Total: ₹
                  {cart.reduce((total, item) => {
                    const price = Number(
                      item.price ||
                        item.product_price ||
                        0
                    );

                    return (
                      total +
                      price *
                        (Number(item.quantity) || 1)
                    );
                  }, 0)}
                </h2>

                <button
                  className="checkout"
                  onClick={checkout}
                >
                  Checkout
                </button>
              </>
            )}
          </section>
        )}

        {page === "orders" && (
          <section className="orders">
            <h2>Order History</h2>

            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map((order) => (
                <div
                  className="order-card"
                  key={order.id}
                >
                  <h3>
                    Order #{order.id}
                  </h3>

                  <p>
                    Date:{" "}
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleString()
                      : "N/A"}
                  </p>

                  <p>
                    Total: ₹
                    {order.total_amount ??
                      order.total ??
                      0}
                  </p>

                  <p>
                    Status:{" "}
                    <strong>
                      {order.status || "Pending"}
                    </strong>
                  </p>
          {(order.status === "Pending" || order.status === "Confirmed") && (
            <button onClick={() => cancelOrder(order.id)}>Cancel Order</button>
          )}
                </div>
              ))
            )}
          </section>
        )}

        {page === "customer-dashboard" && (
          <section className="dashboard">
            <h2>Customer Dashboard</h2>

            {customerDashboard && (
              <>
                <div className="dashboard-grid">
                  <div>
                    <h3>Total Orders</h3>
                    <strong>
                      {customerDashboard.totalOrders ??
                        0}
                    </strong>
                  </div>

                  <div>
                    <h3>Total Amount Spent</h3>
                    <strong>
                      ₹
                      {customerDashboard.totalSpent ??
                        customerDashboard.totalAmountSpent ??
                        0}
                    </strong>
                  </div>
                </div>

                <h3>
                  Recently Purchased Products
                </h3>

                <div className="product-list">
                  {(
                    customerDashboard.recentProducts ||
                    customerDashboard.recentlyPurchased ||
                    []
                  ).map((item, index) => (
                    <div
                      className="product-card"
                      key={item.id || index}
                    >
                      <h3>
                        {item.name ||
                          item.product_name}
                      </h3>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {page === "admin-dashboard" && (
          <section className="dashboard">
            <h2>Admin Dashboard</h2>
<div>
  <h3>Order Management</h3>
  {orders.map((order) => (
    <div key={order.id}>
      <strong>Order #{order.id}</strong>
      {" — "}
      <select
        value={order.status || "Pending"}
        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
      >
        <option value="Pending">Pending</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Shipped">Shipped</option>
        <option value="Delivered">Delivered</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>
  ))}
</div>
            {adminDashboard && (
              <>
                <div className="dashboard-grid">
                  <div>
                    <h3>Total Users</h3>
                    <strong>
                      {adminDashboard.totalUsers ??
                        0}
                    </strong>
                  </div>

                  <div>
                    <h3>Total Products</h3>
                    <strong>
                      {adminDashboard.totalProducts ??
                        0}
                    </strong>
                  </div>

                  <div>
                    <h3>Total Orders</h3>
                    <strong>
                      {adminDashboard.totalOrders ??
                        0}
                    </strong>
                  </div>

                  <div>
                    <h3>Revenue</h3>
                    <strong>
                      ₹
                      {adminDashboard.revenue ??
                        adminDashboard.totalRevenue ??
                        0}
                    </strong>
                  </div>
                </div>

                <h3>Low Stock Products</h3>

                <div className="product-list">
                  {(
                    adminDashboard.lowStockProducts ||
                    []
                  ).map((item) => (
                    <div
                      className="product-card"
                      key={item.id}
                    >
                      <h3>{item.name}</h3>
                      <p>
                        Stock: {item.stock}
                      </p>

                      <button
                        onClick={() =>
                          editProduct(item)
                        }
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setEditingProductId(null);

                    setAdminProduct({
                      name: "",
                      category: "Women",
                      price: "",
                      stock: "",
                      description: "",
                      imageUrl: "",
                      sizes: "",
                    });

                    setPage("admin-product");
                  }}
                >
                  Add Product
                </button>
              </>
            )}
          </section>
        )}

        {page === "admin-product" && (
          <section className="form-page">
            <h2>
              {editingProductId
                ? "Edit Product"
                : "Add Product"}
            </h2>
<div>
  <h3>Order Management</h3>

  {orders.length === 0 ? (
    <p>No orders found.</p>
  ) : (
    orders.map((order) => (
      <div key={order.id}>
        <strong>Order #{order.id}</strong>
        <span> — {order.status || "Pending"} </span>

        {order.status !== "Cancelled" && order.status !== "Delivered" && (
          <select
            value={order.status || "Pending"}
            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        )}
      </div>
    ))
  )}
</div>
            <form onSubmit={saveAdminProduct}>
              <input
                type="text"
                placeholder="Product name"
                value={adminProduct.name}
                onChange={(e) =>
                  setAdminProduct({
                    ...adminProduct,
                    name: e.target.value,
                  })
                }
                required
              />

              <select
                value={adminProduct.category}
                onChange={(e) =>
                  setAdminProduct({
                    ...adminProduct,
                    category: e.target.value,
                  })
                }
              >
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Kids">Kids</option>
              </select>

              <input
                type="number"
                min="0"
                placeholder="Price"
                value={adminProduct.price}
                onChange={(e) =>
                  setAdminProduct({
                    ...adminProduct,
                    price: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                min="0"
                placeholder="Stock"
                value={adminProduct.stock}
                onChange={(e) =>
                  setAdminProduct({
                    ...adminProduct,
                    stock: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Image URL"
                value={adminProduct.imageUrl}
                onChange={(e) =>
                  setAdminProduct({
                    ...adminProduct,
                    imageUrl: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Sizes: S, M, L, XL"
                value={adminProduct.sizes}
                onChange={(e) =>
                  setAdminProduct({
                    ...adminProduct,
                    sizes: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Product description"
                value={adminProduct.description}
                onChange={(e) =>
                  setAdminProduct({
                    ...adminProduct,
                    description: e.target.value,
                  })
                }
              />

              <button type="submit">
                {editingProductId
                  ? "Update Product"
                  : "Create Product"}
              </button>
            </form>
          </section>
        )}
      </main>

      <footer>
        <p>
          © 2026 Navia Boutique — E-Commerce Assessment
        </p>
      </footer>
    </div>
  );
}

export default App;
