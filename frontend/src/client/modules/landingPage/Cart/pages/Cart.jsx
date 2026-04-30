import React, { useState } from "react";
import "./Cart.css";
import Header from "../../components/Header/Header";


const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "HOODIE 'CONCRETE ARCHIVE'",
      size: "L",
      sku: "EF-H0012",
      price: 85000,
      quantity: 1,
      image: "https://via.placeholder.com/150", // Reemplazar con URL real
    },
    {
      id: 2,
      name: "PANTALÓN 'URBAN TECTONIC'",
      size: "32",
      sku: "EF-P0045",
      price: 120000,
      quantity: 1,
      image: "https://via.placeholder.com/150", // Reemplazar con URL real
    },
  ]);

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <div className="cart-container">
      <Header />
      <div className="cart-header">
        <h1>TU CARRITO</h1>
        <p className="status">
          INVENTORY STATUS: <span>CONFIRMED</span>
        </p>
      </div>

      <div className="cart-content">
        <section className="items-list">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="item-image" />
              <div className="item-details">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>
                    TALLA: {item.size} | SKU: {item.sku}
                  </p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}>
                      −
                    </button>
                    <span>{item.quantity.toString().padStart(2, "0")}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      +
                    </button>
                  </div>
                </div>
                <div className="item-price-section">
                  <span className="unit-price">
                    PRECIO UNITARIO: ${item.price.toLocaleString()}
                  </span>
                  <span className="total-price">
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="remove-item">✕</button>
            </div>
          ))}
        </section>

        <aside className="order-summary">
          <h2>RESUMEN DE PEDIDO</h2>
          <div className="summary-row">
            <span>SUBTOTAL</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>ENVÍO</span>
            <span>CALCULADO EN CHECKOUT</span>
          </div>

          <div className="total-section">
            <span className="total-label">TOTAL ESTIMADO</span>
            <span className="total-amount">${subtotal.toLocaleString()}</span>
          </div>

          <div className="payment-note">
            <i className="info-icon">i</i>
            <p>
              NOTA: EL PAGO SE REALIZA ÚNICAMENTE MEDIANTE TRANSFERENCIA
              BANCARIA. RECIBIRÁS LOS DATOS TRAS CONFIRMAR TU PEDIDO.
            </p>
          </div>

          <div className="action-buttons">
            <button className="btn-primary">FINALIZAR COMPRA</button>
            <button className="btn-secondary">SEGUIR COMPRANDO</button>
            {/* Nuevo Botón de Compra Rápida */}
            <button className="btn-quick-buy">
              ⚡ COMPRA RÁPIDA (APPLE/GOOGLE PAY)
            </button>
          </div>

          <div className="trust-icons">
            <span>🏛️</span>
            <span>🛡️</span>
            <span>🚚</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
