import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote,
  ArrowLeftRight, Layers, CheckCircle, X, ChevronDown, Receipt,
  Calendar, TrendingUp, Ban, Clock, Package,
} from 'lucide-react';
import { getAllProducts } from '../../services/productService';
import {
  registerSale, getSales, getSale, cancelSale, getDailySummary,
} from '../../services/POSService';
import { getSettings } from '../../services/storeSettingsService';
import '../OrdersManagement/OrdersManagement.css';
import './POSPage.css';

/* ── Constantes ─────────────────────────────────────────────────────────── */
const PAYMENT_METHODS = [
  { key: 'CASH',     label: 'Efectivo',    icon: Banknote     },
  { key: 'CARD',     label: 'Tarjeta',     icon: CreditCard   },
  { key: 'TRANSFER', label: 'Transferencia', icon: ArrowLeftRight },
  { key: 'MIXED',    label: 'Mixto',       icon: Layers       },
];

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n ?? 0);

const STATUS_CFG = {
  COMPLETED: { label: 'Completada', cls: 'pos-status--ok'  },
  CANCELLED: { label: 'Cancelada',  cls: 'pos-status--bad' },
};

/* ── Modal de confirmación ───────────────────────────────────────────────── */
function SuccessModal({ sale, onClose }) {
  return (
    <div className="pos-modal-backdrop no-print" onClick={onClose}>
      <div className="pos-modal" onClick={e => e.stopPropagation()}>
        <div className="pos-modal-icon"><CheckCircle size={40} /></div>
        <h2 className="pos-modal-title">¡Venta registrada!</h2>
        <p className="pos-modal-number">{sale.saleNumber}</p>

        <div className="pos-modal-rows">
          <div className="pos-modal-row"><span>Total</span><strong>{fmt(sale.total)}</strong></div>
          <div className="pos-modal-row"><span>Método</span><strong>{sale.paymentMethod}</strong></div>
          {sale.change > 0 && (
            <div className="pos-modal-row pos-modal-row--change">
              <span>Vuelto</span><strong>{fmt(sale.change)}</strong>
            </div>
          )}
        </div>

        <div className="pos-modal-actions">
          <button className="pos-btn-outline" onClick={() => window.print()}>
            <Receipt size={14} /> Imprimir
          </button>
          <button className="pos-btn-primary" onClick={onClose}>
            Nueva venta
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Documento de factura imprimible ──────────────────────────────────────
   Oculto en pantalla siempre (ver regla #printable-invoice-area en
   POSPage.css); solo se hace visible dentro de @media print, donde
   OrdersManagement.css ya aísla esa misma id del resto de la página
   (sidebar, fondo oscuro, etc.) con una regla !important que gana por id. */
function InvoiceDocument({ sale, storeName, storeLogo, billingInfo }) {
  if (!sale) return null;
  const legal = billingInfo ?? {};

  return (
    <div className="invoice-card" id="printable-invoice-area">
      <div className="invoice-print-body">
        <div className="invoice-brand-row">
          <div>
            {storeLogo
              ? <img src={storeLogo} alt={storeName ?? 'Tienda'} style={{ height: 40, marginBottom: 6 }} />
              : <h2 className="invoice-logo">{storeName ?? 'Tienda'}</h2>}
            {legal.legalName && <p className="invoice-meta-text">{legal.legalName}</p>}
            {legal.idNumber && (
              <p className="invoice-meta-text">{legal.documentName ?? 'NIT'}: {legal.idNumber}</p>
            )}
            {legal.address && <p className="invoice-meta-text">{legal.address}</p>}
            {legal.phone && <p className="invoice-meta-text">Tel: {legal.phone}</p>}
          </div>
          <div className="text-right">
            <h4 className="invoice-id-title">COMPROBANTE DE VENTA</h4>
            <p className="invoice-id-num">{sale.saleNumber}</p>
          </div>
        </div>

        <hr className="invoice-divider" />

        <div className="invoice-details-grid">
          <div>
            <span className="invoice-section-label">FECHA</span>
            <p className="invoice-client-detail">
              {sale.createdAt ? new Date(sale.createdAt).toLocaleString('es-CO') : '—'}
            </p>
          </div>
          <div className="text-right flex-end-dir">
            <p className="invoice-meta-item"><b>Método de pago:</b> {sale.paymentMethod}</p>
            {sale.paymentMethod === 'CASH' && Number(sale.amountReceived) > 0 && (
              <p className="invoice-meta-item"><b>Recibido:</b> {fmt(sale.amountReceived)}</p>
            )}
            {Number(sale.change) > 0 && (
              <p className="invoice-meta-item"><b>Vuelto:</b> {fmt(sale.change)}</p>
            )}
          </div>
        </div>

        <table className="invoice-items-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th className="text-center">Cant.</th>
              <th className="text-right">P. Unitario</th>
              <th className="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(sale.items ?? []).map((item, i) => (
              <tr key={item.itemId ?? i}>
                <td>{item.productName}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">{fmt(item.unitPrice)}</td>
                <td className="text-right">
                  {fmt(item.subtotal ?? (item.unitPrice - (item.discount ?? 0)) * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-summary-block">
          <div className="invoice-summary-row">
            <span>Subtotal:</span><span>{fmt(sale.subtotal)}</span>
          </div>
          {Number(sale.discount) > 0 && (
            <div className="invoice-summary-row">
              <span>Descuento:</span><span>−{fmt(sale.discount)}</span>
            </div>
          )}
          {Number(sale.tax) > 0 && (
            <div className="invoice-summary-row">
              <span>Impuestos:</span><span>{fmt(sale.tax)}</span>
            </div>
          )}
          <hr className="invoice-divider-sm" />
          <div className="invoice-summary-row total-row">
            <span>TOTAL:</span><span>{fmt(sale.total)}</span>
          </div>
        </div>

        {sale.notes && (
          <div style={{ marginTop: 16, fontSize: 12, color: '#000000' }}>
            <b>Notas:</b> {sale.notes}
          </div>
        )}

        <div className="invoice-footer-print-only">
          <p>Documento generado por el sistema POS. No constituye una factura electrónica con validez fiscal ante la DIAN.</p>
          <small>{storeName ?? 'Tienda'} • Venta {sale.saleNumber}</small>
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta resumen del día ─────────────────────────────────────────────── */
function DailySummary({ summary }) {
  if (!summary) return null;
  return (
    <div className="pos-daily">
      <div className="pos-daily-item">
        <TrendingUp size={16} className="pos-daily-icon pos-daily-icon--green" />
        <div>
          <p className="pos-daily-label">Ingresos hoy</p>
          <p className="pos-daily-val">{fmt(summary.totalRevenue)}</p>
        </div>
      </div>
      <div className="pos-daily-item">
        <ShoppingCart size={16} className="pos-daily-icon pos-daily-icon--blue" />
        <div>
          <p className="pos-daily-label">Ventas</p>
          <p className="pos-daily-val">{summary.totalSales}</p>
        </div>
      </div>
      <div className="pos-daily-item">
        <Ban size={16} className="pos-daily-icon pos-daily-icon--red" />
        <div>
          <p className="pos-daily-label">Canceladas</p>
          <p className="pos-daily-val">{summary.cancelledSales}</p>
        </div>
      </div>
      <div className="pos-daily-item">
        <ChevronDown size={16} className="pos-daily-icon pos-daily-icon--yellow" />
        <div>
          <p className="pos-daily-label">Descuentos</p>
          <p className="pos-daily-val">{fmt(summary.totalDiscount)}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function POSPage() {
  const [tab, setTab]                   = useState('pos');    // 'pos' | 'history'

  // Productos
  const [products, setProducts]         = useState([]);
  const [prodLoading, setProdLoading]   = useState(true);
  const [searchQ, setSearchQ]           = useState('');

  // Carrito
  const [cart, setCart]                 = useState([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);

  // Pago
  const [payMethod, setPayMethod]         = useState('CASH');
  const [amountReceived, setAmountReceived] = useState(0);   // número real
  const [amountDisplay, setAmountDisplay]   = useState('');  // texto formateado
  const [notes, setNotes]                   = useState('');

  // Estado de UI
  const [submitting, setSubmitting]     = useState(false);
  const [successSale, setSuccessSale]   = useState(null);
  const [printingSale, setPrintingSale] = useState(null); // reimpresión desde historial
  const [error, setError]               = useState('');

  // Historial
  const [sales, setSales]               = useState([]);
  const [daily, setDaily]               = useState(null);
  const [histLoading, setHistLoading]   = useState(false);
  const [histError, setHistError]       = useState('');
  const [cancelling, setCancelling]     = useState(null);

  // Datos de la tienda para la factura (nombre/logo ya los guarda AdminLayout)
  const storeId = localStorage.getItem('storeId');
  const [storeInfo] = useState(() => ({
    name: localStorage.getItem('storeName') ?? undefined,
    logo: storeId ? localStorage.getItem(`storeLogo_${storeId}`) : undefined,
  }));
  const [billingInfo, setBillingInfo] = useState(null);

  /* Cargar datos legales de la tienda (NIT, dirección, teléfono) para la factura */
  useEffect(() => {
    getSettings()
      .then(settings => setBillingInfo(settings?.legal ?? null))
      .catch(() => { /* sin datos legales configurados: la factura los omite */ });
  }, []);

  /* Cargar productos — espera a que AdminLayout setee storeId en localStorage */
  useEffect(() => {
    let alive = true;
    const load = async () => {
      setProdLoading(true);
      let storeId = localStorage.getItem('storeId');
      if (!storeId || storeId === 'null') {
        await new Promise(r => setTimeout(r, 800));
        storeId = localStorage.getItem('storeId');
      }
      try {
        const data = await getAllProducts(storeId ?? undefined);
        if (!alive) return;
        setProducts(Array.isArray(data) ? data : (data?.content ?? data?.data ?? []));
      } catch { /* sin productos */ }
      finally { if (alive) setProdLoading(false); }
    };
    load();
    return () => { alive = false; };
  }, []);

  /* Cargar historial cuando se abre esa pestaña */
  useEffect(() => {
    if (tab !== 'history') return;
    setHistLoading(true);
    setHistError('');
    Promise.allSettled([getSales(), getDailySummary()])
      .then(([salesRes, dailyRes]) => {
        if (salesRes.status === 'fulfilled') {
          setSales(Array.isArray(salesRes.value) ? salesRes.value : []);
        } else {
          setHistError(salesRes.reason?.message ?? 'No se pudo cargar el historial.');
        }
        if (dailyRes.status === 'fulfilled') {
          setDaily(dailyRes.value);
        }
      })
      .finally(() => setHistLoading(false));
  }, [tab]);

  /* Dispara la impresión apenas se monta la factura de una venta pasada */
  useEffect(() => {
    if (!printingSale) return;
    window.print();
  }, [printingSale]);

  /* Productos filtrados — muestra todos si no hay búsqueda */
  const displayProducts = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => {
      const name = (p.productName ?? p.name ?? '').toLowerCase();
      const id   = (p.productId ?? p.id ?? '').toLowerCase();
      const ref  = (p.reference ?? p.sku ?? p.code ?? '').toLowerCase();
      return name.includes(q) || id.includes(q) || ref.includes(q);
    });
  }, [searchQ, products]);

  /* Totales */
  const subtotal = cart.reduce((acc, i) => acc + (i.unitPrice - (i.discount ?? 0)) * i.quantity, 0);
  const total    = Math.max(0, subtotal - (Number(globalDiscount) || 0));
  const change   = payMethod === 'CASH' ? Math.max(0, amountReceived - total) : 0;
  const deficit  = payMethod === 'CASH' && amountReceived > 0 ? total - amountReceived : 0;

  /* ── Acciones del carrito ──────────────────────────────────────────────── */
  const addToCart = useCallback((product) => {
    const pid = product.productId ?? product.id;
    setCart(prev => {
      const idx = prev.findIndex(i => i.productId === pid);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      const price = product.price
        ?? product.variants?.[0]?.price
        ?? product.basePrice
        ?? 0;
      return [...prev, {
        productId:   pid,
        variantId:   product.variants?.[0]?.variantId ?? null,
        productName: product.productName ?? product.name ?? 'Producto',
        quantity:    1,
        unitPrice:   price,
        discount:    0,
      }];
    });
    setSearchQ('');
  }, []);

  const updateQty = (productId, delta) =>
    setCart(prev => prev
      .map(i => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    );

  const updateItemDiscount = (productId, val) =>
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, discount: Number(val) || 0 } : i));

  const removeItem = (productId) =>
    setCart(prev => prev.filter(i => i.productId !== productId));

  /* ── Registrar venta ──────────────────────────────────────────────────── */
  const handleRegister = async () => {
    if (cart.length === 0) { setError('Agrega al menos un producto.'); return; }
    if (payMethod === 'CASH' && amountReceived < total) {
      setError(`Monto insuficiente — faltan ${fmt(total - amountReceived)}`); return;
    }
    setError('');
    setSubmitting(true);
    try {
      const body = {
        customerId:     null,
        paymentMethod:  payMethod,
        amountReceived: payMethod === 'CASH' ? Number(amountReceived) : total,
        discount:       Number(globalDiscount) || 0,
        notes:          notes || null,
        items:          cart.map(i => ({
          productId:   i.productId,
          variantId:   i.variantId,
          productName: i.productName,
          quantity:    i.quantity,
          unitPrice:   i.unitPrice,
          discount:    i.discount,
        })),
      };
      const result = await registerSale(body);
      setSuccessSale(result);
      setCart([]);
      setGlobalDiscount(0);
      setAmountReceived(0);
      setAmountDisplay('');
      setNotes('');
    } catch (e) {
      setError(e.message ?? 'Error al registrar la venta.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Cancelar venta ──────────────────────────────────────────────────── */
  const handleCancel = async (saleId) => {
    setCancelling(saleId);
    setHistError('');
    try {
      await cancelSale(saleId);
      setSales(prev => prev.map(s => s.saleId === saleId ? { ...s, status: 'CANCELLED' } : s));
    } catch (e) {
      setHistError(e.message ?? 'No se pudo cancelar la venta.');
    } finally {
      setCancelling(null);
    }
  };

  /* ── Reimprimir una venta del historial ─────────────────────────────────── */
  const handlePrintPastSale = async (saleId) => {
    setHistError('');
    try {
      const sale = await getSale(saleId);
      setPrintingSale(sale);
    } catch (e) {
      setHistError(e.message ?? 'No se pudo cargar la venta para imprimir.');
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="pos-root">

      {/* Tabs */}
      <div className="pos-tabs">
        <button className={`pos-tab ${tab === 'pos' ? 'pos-tab--active' : ''}`} onClick={() => setTab('pos')}>
          <ShoppingCart size={15} /> Nueva venta
        </button>
        <button className={`pos-tab ${tab === 'history' ? 'pos-tab--active' : ''}`} onClick={() => setTab('history')}>
          <Calendar size={15} /> Historial
        </button>
      </div>

      {/* ── POS ─────────────────────────────────────────────────────────── */}
      {tab === 'pos' && (
        <div className="pos-split">

          {/* Panel izquierdo: catálogo + carrito */}
          <div className="pos-left">

            {/* Búsqueda */}
            <div className="pos-search-wrap">
              <Search size={15} className="pos-search-icon" />
              <input
                className="pos-search"
                placeholder="Buscar por nombre o ID del producto…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
              />
              {searchQ && (
                <button className="pos-search-clear" onClick={() => setSearchQ('')}>
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="pos-left-body">
              {/* Catálogo de productos */}
              <div className="pos-catalog-panel">
                <p className="pos-catalog-title">
                  {searchQ
                    ? `${displayProducts.length} resultado${displayProducts.length !== 1 ? 's' : ''}`
                    : `${products.length} producto${products.length !== 1 ? 's' : ''}`}
                </p>

                {prodLoading ? (
                  <div className="pos-prod-loading">
                    <div className="pos-prod-spinner" />
                    Cargando productos…
                  </div>
                ) : displayProducts.length === 0 ? (
                  <div className="pos-prod-empty">
                    <Package size={30} />
                    <p>{searchQ ? 'Sin resultados' : 'No hay productos'}</p>
                  </div>
                ) : (
                  <div className="pos-prod-grid">
                    {displayProducts.map(p => {
                      const pid   = p.productId ?? p.id;
                      const name  = p.productName ?? p.name ?? 'Producto';
                      const price = p.variants?.length
                        ? Math.min(...p.variants.map(v => v.price ?? 0).filter(Boolean))
                        : (p.price ?? p.basePrice ?? 0);
                      const stock = p.variants?.reduce((s, v) => s + (v.stock ?? 0), 0)
                        ?? p.stock ?? null;
                      const img   = p.images?.[0]?.url ?? p.imageUrl ?? p.image ?? null;
                      const inCart = cart.some(i => i.productId === pid);

                      return (
                        <button
                          key={pid}
                          className={`pos-prod-card ${inCart ? 'pos-prod-card--in-cart' : ''}`}
                          onClick={() => addToCart(p)}
                          title={`Agregar ${name}`}
                        >
                          <div className="pos-prod-img">
                            {img
                              ? <img src={img} alt={name} />
                              : <Package size={22} />}
                          </div>
                          <div className="pos-prod-info">
                            <p className="pos-prod-name">{name}</p>
                            <p className="pos-prod-price">{fmt(price)}</p>
                            {stock !== null && (
                              <p className={`pos-prod-stock ${stock === 0 ? 'pos-prod-stock--out' : stock <= 5 ? 'pos-prod-stock--low' : ''}`}>
                                {stock === 0 ? 'Agotado' : `${stock} disponibles`}
                              </p>
                            )}
                          </div>
                          {inCart && <span className="pos-prod-badge"><Plus size={10} /></span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Carrito */}
              <div className="pos-cart-panel">
                <p className="pos-catalog-title">
                  <ShoppingCart size={12} />
                  Carrito · {cart.length} ítem{cart.length !== 1 ? 's' : ''}
                </p>

                {cart.length === 0 ? (
                  <div className="pos-cart-empty">
                    <ShoppingCart size={28} />
                    <p>Selecciona productos del catálogo</p>
                  </div>
                ) : (
                  <div className="pos-cart">
                    {cart.map(item => (
                      <div className="pos-cart-item" key={item.productId}>
                        <div className="pos-cart-item-name">{item.productName}</div>
                        <div className="pos-cart-item-row">
                          <div className="pos-qty">
                            <button className="pos-qty-btn" onClick={() => updateQty(item.productId, -1)}><Minus size={11} /></button>
                            <span>{item.quantity}</span>
                            <button className="pos-qty-btn" onClick={() => updateQty(item.productId, +1)}><Plus size={11} /></button>
                          </div>
                          <span className="pos-item-price">{fmt(item.unitPrice)}</span>
                          <div className="pos-item-discount-wrap">
                            <span className="pos-item-discount-label">Dto.</span>
                            <input
                              type="number" min={0}
                              className="pos-item-discount"
                              value={item.discount || ''}
                              placeholder="0"
                              onChange={e => updateItemDiscount(item.productId, e.target.value)}
                            />
                          </div>
                          <span className="pos-item-sub">{fmt((item.unitPrice - item.discount) * item.quantity)}</span>
                          <button className="pos-remove" onClick={() => removeItem(item.productId)}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel derecho: pago */}
          <div className="pos-right">
            <h3 className="pos-right-title">Resumen de pago</h3>

            {/* Método de pago */}
            <div className="pos-methods">
              {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  className={`pos-method ${payMethod === key ? 'pos-method--active' : ''}`}
                  onClick={() => setPayMethod(key)}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Totales */}
            <div className="pos-totals">
              <div className="pos-total-row">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="pos-total-row">
                <span>Descuento global</span>
                <input
                  type="number" min={0}
                  className="pos-discount-input"
                  value={globalDiscount || ''}
                  placeholder="0"
                  onChange={e => setGlobalDiscount(e.target.value)}
                />
              </div>
              <div className="pos-total-row pos-total-row--total">
                <span>TOTAL</span><span>{fmt(total)}</span>
              </div>
            </div>

            {/* Monto recibido (solo CASH) */}
            {payMethod === 'CASH' && (
              <div className="pos-cash-section">
                <label className="pos-label">Monto recibido</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="pos-input"
                  placeholder="$ 0"
                  value={amountDisplay}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    const num = raw ? parseInt(raw, 10) : 0;
                    setAmountReceived(num);
                    setAmountDisplay(raw ? num.toLocaleString('es-CO') : '');
                  }}
                />
                {amountReceived > 0 && deficit > 0 && (
                  <div className="pos-change pos-change--err">
                    Le faltan <strong>{fmt(deficit)}</strong>
                  </div>
                )}
                {amountReceived > 0 && change > 0 && (
                  <div className="pos-change pos-change--ok">
                    Vuelto: <strong>{fmt(change)}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Notas */}
            <div className="pos-notes-wrap">
              <label className="pos-label">Notas (opcional)</label>
              <textarea
                className="pos-textarea"
                rows={2}
                placeholder="Observaciones de la venta…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {error && <p className="pos-error">{error}</p>}

            <button
              className="pos-register-btn"
              onClick={handleRegister}
              disabled={submitting || cart.length === 0}
            >
              {submitting ? 'Registrando…' : <><CheckCircle size={16} /> Registrar venta</>}
            </button>
          </div>
        </div>
      )}

      {/* ── HISTORIAL ──────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="pos-history">
          <DailySummary summary={daily} />

          {histError && <p className="pos-error">{histError}</p>}

          {histLoading ? (
            <div className="pos-hist-loading">Cargando historial…</div>
          ) : sales.length === 0 ? (
            <div className="pos-hist-empty">
              <Clock size={36} />
              <p>No hay ventas registradas</p>
            </div>
          ) : (
            <div className="pos-sales-list">
              {sales.map(s => {
                const cfg = STATUS_CFG[s.status] ?? STATUS_CFG.COMPLETED;
                return (
                  <div className="pos-sale-card" key={s.saleId}>
                    <div className="pos-sale-left">
                      <p className="pos-sale-number">{s.saleNumber}</p>
                      <p className="pos-sale-meta">
                        {s.items?.length ?? 0} ítem(s) ·&nbsp;
                        {s.paymentMethod} ·&nbsp;
                        {s.createdAt ? new Date(s.createdAt).toLocaleString('es-CO') : '—'}
                      </p>
                    </div>
                    <div className="pos-sale-right">
                      <span className="pos-sale-total">{fmt(s.total)}</span>
                      <span className={`pos-status ${cfg.cls}`}>{cfg.label}</span>
                      <button
                        className="pos-print-btn"
                        onClick={() => handlePrintPastSale(s.saleId)}
                        title="Imprimir factura"
                      >
                        <Receipt size={12} /> Imprimir
                      </button>
                      {s.status === 'COMPLETED' && (
                        <button
                          className="pos-cancel-btn"
                          onClick={() => handleCancel(s.saleId)}
                          disabled={cancelling === s.saleId}
                        >
                          {cancelling === s.saleId ? '…' : <><Ban size={12} /> Cancelar</>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de éxito */}
      {successSale && (
        <SuccessModal sale={successSale} onClose={() => setSuccessSale(null)} />
      )}

      {/* Documento de factura — oculto en pantalla, visible solo al imprimir */}
      <InvoiceDocument
        sale={successSale ?? printingSale}
        storeName={storeInfo.name}
        storeLogo={storeInfo.logo}
        billingInfo={billingInfo}
      />
    </div>
  );
}
