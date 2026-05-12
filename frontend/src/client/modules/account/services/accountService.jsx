// accountService.js — MOCK (sin API real)

const mockProfile = {
  userName: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '3001234567',
  avatarUrl: null,
};

const mockOrders = [
  {
    id: '1001',
    date: '2025-04-10',
    status: 'Entregado',
    total: '185.000',
    items: [
      { name: 'Camiseta Oversize', qty: 2, price: '60.000', image: 'https://via.placeholder.com/50' },
      { name: 'Jogger Urbano',     qty: 1, price: '65.000', image: 'https://via.placeholder.com/50' },
    ],
  },
  {
    id: '1002',
    date: '2025-05-01',
    status: 'En Espera',
    total: '120.000',
    items: [
      { name: 'Hoodie Negro', qty: 1, price: '120.000', image: 'https://via.placeholder.com/50' },
    ],
  },
];

const mockAddresses = [
  {
    id: '1',
    alias: 'Casa',
    street: 'Calle 45 # 23-10',
    city: 'Bogotá',
    state: 'Cundinamarca',
    zip: '110111',
    country: 'Colombia',
  },
];

const mockSessions = [
  { id: '1', device: 'Chrome en Windows - Bogotá, CO (Actual)', location: 'Bogotá', lastActive: 'Ahora' },
  { id: '2', device: 'Mobile Safari - iPhone',                  location: 'Bogotá', lastActive: 'Hace 2 horas' },
];

const mockTickets = [
  { id: '3001', subject: 'Problema con envío',   status: 'Resuelto',   updatedAt: '2025-04-12' },
  { id: '3002', subject: 'Cambio de talla',       status: 'En Espera',  updatedAt: '2025-05-02' },
];

const mockPreferences = {
  newCollections: true,
  offers:         true,
  events:         false,
  blog:           false,
};

/* ─── Simula delay de red ─── */
const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

const accountService = {
  /* ─── Perfil ─── */
  getProfile: async () => {
    await delay();
    return { data: mockProfile };
  },
  updateProfile: async (data) => {
    await delay();
    Object.assign(mockProfile, data);
    return { data: mockProfile };
  },
  uploadAvatar: async (formData) => {
    await delay(500);
    return { data: { avatarUrl: URL.createObjectURL(formData.get('file')) } };
  },

  /* ─── Seguridad ─── */
  changePassword: async () => {
    await delay();
    return { data: { message: 'Contraseña actualizada' } };
  },
  getSessions: async () => {
    await delay();
    return { data: mockSessions };
  },
  closeSession: async (id) => {
    await delay();
    const idx = mockSessions.findIndex(s => s.id === id);
    if (idx !== -1) mockSessions.splice(idx, 1);
    return { data: { message: 'Sesión cerrada' } };
  },
  toggle2FA: async (enabled) => {
    await delay();
    return { data: { enabled } };
  },

  /* ─── Pedidos ─── */
  getOrders: async () => {
    await delay();
    return { data: mockOrders };
  },
  getOrderDetail: async (id) => {
    await delay();
    return { data: mockOrders.find(o => o.id === id) };
  },

  /* ─── Direcciones ─── */
  getAddresses: async () => {
    await delay();
    return { data: mockAddresses };
  },
  addAddress: async (data) => {
    await delay();
    const newAddr = { ...data, id: Date.now().toString() };
    mockAddresses.push(newAddr);
    return { data: newAddr };
  },
  updateAddress: async (id, data) => {
    await delay();
    const idx = mockAddresses.findIndex(a => a.id === id);
    if (idx !== -1) mockAddresses[idx] = { ...data, id };
    return { data: mockAddresses[idx] };
  },
  deleteAddress: async (id) => {
    await delay();
    const idx = mockAddresses.findIndex(a => a.id === id);
    if (idx !== -1) mockAddresses.splice(idx, 1);
    return { data: { message: 'Dirección eliminada' } };
  },

  /* ─── Preferencias ─── */
  getPreferences: async () => {
    await delay();
    return { data: mockPreferences };
  },
  updatePreferences: async (data) => {
    await delay();
    Object.assign(mockPreferences, data);
    return { data: mockPreferences };
  },

  /* ─── Soporte ─── */
  getTickets: async () => {
    await delay();
    return { data: mockTickets };
  },
  createTicket: async (data) => {
    await delay();
    const newTicket = { ...data, id: Date.now().toString(), status: 'Abierto', updatedAt: new Date().toISOString().split('T')[0] };
    mockTickets.unshift(newTicket);
    return { data: newTicket };
  },
};

export default accountService;