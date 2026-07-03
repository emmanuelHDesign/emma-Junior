import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, Company, Warehouse, Product, Stock, StockMovement, 
  Supplier, Customer, Alert, Category
} from '../types';
import { generateId } from '../lib/utils';

// Initial demo data
const initialCategories: Category[] = [
  { id: '1', name: 'Papeterie', description: 'Papiers, cahiers, carnets', color: '#1E3A8A' },
  { id: '2', name: 'Bureautique', description: 'Fournitures de bureau', color: '#16A34A' },
  { id: '3', name: 'Impression', description: 'Encres, toners, cartouches', color: '#DC2626' },
  { id: '4', name: 'Emballage', description: 'Cartons, enveloppes, scotch', color: '#F59E0B' },
  { id: '5', name: 'Informatique', description: 'Accessoires IT', color: '#8B5CF6' },
];

const initialCompany: Company = {
  id: 'comp-1',
  name: 'ZION PAPER',
  logo: '',
  address: 'Douala, Cameroun',
  phone: '+237 6XX XXX XXX',
  email: 'contact@zionpaper.cm',
  createdAt: new Date().toISOString(),
};

const initialWarehouses: Warehouse[] = [
  { id: 'wh-1', companyId: 'comp-1', name: 'Entrepôt Central', location: 'Douala - Akwa', manager: 'Jean Kamga', phone: '+237 6XX XXX XXX', isActive: true, createdAt: new Date().toISOString() },
  { id: 'wh-2', companyId: 'comp-1', name: 'Magasin Yaoundé', location: 'Yaoundé - Centre', manager: 'Marie Ngono', phone: '+237 6XX XXX XXX', isActive: true, createdAt: new Date().toISOString() },
  { id: 'wh-3', companyId: 'comp-1', name: 'Dépôt Bafoussam', location: 'Bafoussam - Marché B', manager: 'Paul Fotso', phone: '+237 6XX XXX XXX', isActive: true, createdAt: new Date().toISOString() },
];

const initialProducts: Product[] = [
  { id: 'prod-1', companyId: 'comp-1', sku: 'PAP-00001', name: 'Ramette Papier A4 80g', description: 'Ramette 500 feuilles papier blanc', category: 'Papeterie', unitPrice: 3500, costPrice: 2800, unit: 'Ramette', minStock: 50, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prod-2', companyId: 'comp-1', sku: 'PAP-00002', name: 'Cahier 200 pages Grand Format', description: 'Cahier spirale grand format', category: 'Papeterie', unitPrice: 1200, costPrice: 850, unit: 'Pièce', minStock: 100, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prod-3', companyId: 'comp-1', sku: 'BUR-00001', name: 'Stylo BIC Bleu (Lot 50)', description: 'Lot de 50 stylos BIC cristal bleu', category: 'Bureautique', unitPrice: 7500, costPrice: 5500, unit: 'Lot', minStock: 30, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prod-4', companyId: 'comp-1', sku: 'IMP-00001', name: 'Cartouche HP 305 Noir', description: 'Cartouche encre noire HP 305', category: 'Impression', unitPrice: 12000, costPrice: 9500, unit: 'Pièce', minStock: 20, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prod-5', companyId: 'comp-1', sku: 'EMB-00001', name: 'Carton Emballage 40x30x20', description: 'Carton double cannelure', category: 'Emballage', unitPrice: 800, costPrice: 550, unit: 'Pièce', minStock: 200, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prod-6', companyId: 'comp-1', sku: 'PAP-00003', name: 'Bloc-notes A5 Ligné', description: 'Bloc-notes 100 feuilles lignées', category: 'Papeterie', unitPrice: 650, costPrice: 400, unit: 'Pièce', minStock: 80, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prod-7', companyId: 'comp-1', sku: 'BUR-00002', name: 'Agrafeuse Standard', description: 'Agrafeuse de bureau 24/6', category: 'Bureautique', unitPrice: 2500, costPrice: 1800, unit: 'Pièce', minStock: 25, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prod-8', companyId: 'comp-1', sku: 'INF-00001', name: 'Clé USB 32GB', description: 'Clé USB 3.0 32GB', category: 'Informatique', unitPrice: 5000, costPrice: 3500, unit: 'Pièce', minStock: 40, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const initialStock: Stock[] = [
  // Entrepôt Central
  { id: 'stk-1', warehouseId: 'wh-1', productId: 'prod-1', quantity: 250, lastUpdated: new Date().toISOString() },
  { id: 'stk-2', warehouseId: 'wh-1', productId: 'prod-2', quantity: 180, lastUpdated: new Date().toISOString() },
  { id: 'stk-3', warehouseId: 'wh-1', productId: 'prod-3', quantity: 45, lastUpdated: new Date().toISOString() },
  { id: 'stk-4', warehouseId: 'wh-1', productId: 'prod-4', quantity: 15, lastUpdated: new Date().toISOString() },
  { id: 'stk-5', warehouseId: 'wh-1', productId: 'prod-5', quantity: 350, lastUpdated: new Date().toISOString() },
  { id: 'stk-6', warehouseId: 'wh-1', productId: 'prod-6', quantity: 120, lastUpdated: new Date().toISOString() },
  { id: 'stk-7', warehouseId: 'wh-1', productId: 'prod-7', quantity: 30, lastUpdated: new Date().toISOString() },
  { id: 'stk-8', warehouseId: 'wh-1', productId: 'prod-8', quantity: 55, lastUpdated: new Date().toISOString() },
  // Magasin Yaoundé
  { id: 'stk-9', warehouseId: 'wh-2', productId: 'prod-1', quantity: 80, lastUpdated: new Date().toISOString() },
  { id: 'stk-10', warehouseId: 'wh-2', productId: 'prod-2', quantity: 60, lastUpdated: new Date().toISOString() },
  { id: 'stk-11', warehouseId: 'wh-2', productId: 'prod-3', quantity: 8, lastUpdated: new Date().toISOString() },
  { id: 'stk-12', warehouseId: 'wh-2', productId: 'prod-4', quantity: 0, lastUpdated: new Date().toISOString() },
  // Dépôt Bafoussam
  { id: 'stk-13', warehouseId: 'wh-3', productId: 'prod-1', quantity: 40, lastUpdated: new Date().toISOString() },
  { id: 'stk-14', warehouseId: 'wh-3', productId: 'prod-5', quantity: 100, lastUpdated: new Date().toISOString() },
  { id: 'stk-15', warehouseId: 'wh-3', productId: 'prod-6', quantity: 25, lastUpdated: new Date().toISOString() },
];

const initialMovements: StockMovement[] = [
  { id: 'mv-1', productId: 'prod-1', warehouseId: 'wh-1', type: 'IN', quantity: 100, reason: 'Réception commande fournisseur', reference: 'CMD-2024-001', userId: 'user-1', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'mv-2', productId: 'prod-2', warehouseId: 'wh-1', type: 'OUT', quantity: 20, reason: 'Vente client', reference: 'VTE-2024-015', userId: 'user-1', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'mv-3', productId: 'prod-3', warehouseId: 'wh-2', type: 'IN', quantity: 15, reason: 'Transfert depuis Entrepôt Central', reference: 'TRF-2024-008', userId: 'user-2', createdAt: new Date(Date.now() - 43200000).toISOString() },
  { id: 'mv-4', productId: 'prod-4', warehouseId: 'wh-1', type: 'OUT', quantity: 5, reason: 'Vente client', reference: 'VTE-2024-018', userId: 'user-1', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'mv-5', productId: 'prod-1', warehouseId: 'wh-3', type: 'ADJUST', quantity: -10, reason: 'Inventaire - Écart constaté', reference: 'INV-2024-002', userId: 'user-3', createdAt: new Date().toISOString() },
];

const initialSuppliers: Supplier[] = [
  { id: 'sup-1', companyId: 'comp-1', name: 'Papeterie Générale SA', contact: 'M. Dupont', phone: '+237 6XX XXX XXX', email: 'contact@papgen.cm', address: 'Douala', isActive: true, createdAt: new Date().toISOString() },
  { id: 'sup-2', companyId: 'comp-1', name: 'ImportBureau SARL', contact: 'Mme Eba', phone: '+237 6XX XXX XXX', email: 'commande@importbureau.cm', address: 'Yaoundé', isActive: true, createdAt: new Date().toISOString() },
];

const initialCustomers: Customer[] = [
  { id: 'cust-1', companyId: 'comp-1', name: 'École Saint-Joseph', contact: 'Directeur', phone: '+237 6XX XXX XXX', email: 'contact@ecole-stj.cm', address: 'Douala', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cust-2', companyId: 'comp-1', name: 'Cabinet Juridique Fouda', contact: 'Me Fouda', phone: '+237 6XX XXX XXX', email: 'cabinet@fouda-law.cm', address: 'Yaoundé', isActive: true, createdAt: new Date().toISOString() },
];

const initialUser: User = {
  id: 'user-1',
  email: 'admin@zionpaper.cm',
  name: 'Admin ZION',
  role: 'admin',
  companyId: 'comp-1',
  createdAt: new Date().toISOString(),
};

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Data
  company: Company;
  categories: Category[];
  warehouses: Warehouse[];
  products: Product[];
  stock: Stock[];
  movements: StockMovement[];
  suppliers: Supplier[];
  customers: Customer[];
  alerts: Alert[];
  
  // UI State
  selectedWarehouseId: string | null;
  sidebarOpen: boolean;
  
  // Auth Actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  // Warehouse Actions
  addWarehouse: (warehouse: Omit<Warehouse, 'id' | 'createdAt'>) => void;
  updateWarehouse: (id: string, data: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;
  setSelectedWarehouse: (id: string | null) => void;
  
  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Stock Actions
  getStockForProduct: (productId: string, warehouseId?: string) => number;
  getTotalStockForProduct: (productId: string) => number;
  updateStock: (warehouseId: string, productId: string, quantity: number) => void;
  
  // Movement Actions
  addMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  
  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Category Actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  
  // Alert Actions
  generateAlerts: () => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
  
  // UI Actions
  toggleSidebar: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: initialUser,
      isAuthenticated: true,
      company: initialCompany,
      categories: initialCategories,
      warehouses: initialWarehouses,
      products: initialProducts,
      stock: initialStock,
      movements: initialMovements,
      suppliers: initialSuppliers,
      customers: initialCustomers,
      alerts: [],
      selectedWarehouseId: null,
      sidebarOpen: true,
      
      // Auth Actions
      login: (email: string, password: string) => {
        if (email && password) {
          set({ user: initialUser, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      // Warehouse Actions
      addWarehouse: (warehouse) => {
        const newWarehouse: Warehouse = {
          ...warehouse,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ warehouses: [...state.warehouses, newWarehouse] }));
      },
      
      updateWarehouse: (id, data) => {
        set((state) => ({
          warehouses: state.warehouses.map((w) =>
            w.id === id ? { ...w, ...data } : w
          ),
        }));
      },
      
      deleteWarehouse: (id) => {
        set((state) => ({
          warehouses: state.warehouses.filter((w) => w.id !== id),
          stock: state.stock.filter((s) => s.warehouseId !== id),
        }));
      },
      
      setSelectedWarehouse: (id) => {
        set({ selectedWarehouseId: id });
      },
      
      // Product Actions
      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ products: [...state.products, newProduct] }));
      },
      
      updateProduct: (id, data) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          stock: state.stock.filter((s) => s.productId !== id),
        }));
      },
      
      // Stock Actions
      getStockForProduct: (productId, warehouseId) => {
        const state = get();
        if (warehouseId) {
          const stockItem = state.stock.find(
            (s) => s.productId === productId && s.warehouseId === warehouseId
          );
          return stockItem?.quantity || 0;
        }
        return state.stock
          .filter((s) => s.productId === productId)
          .reduce((sum, s) => sum + s.quantity, 0);
      },
      
      getTotalStockForProduct: (productId) => {
        const state = get();
        return state.stock
          .filter((s) => s.productId === productId)
          .reduce((sum, s) => sum + s.quantity, 0);
      },
      
      updateStock: (warehouseId, productId, quantity) => {
        set((state) => {
          const existingIndex = state.stock.findIndex(
            (s) => s.warehouseId === warehouseId && s.productId === productId
          );
          
          if (existingIndex >= 0) {
            const newStock = [...state.stock];
            newStock[existingIndex] = {
              ...newStock[existingIndex],
              quantity,
              lastUpdated: new Date().toISOString(),
            };
            return { stock: newStock };
          } else {
            return {
              stock: [
                ...state.stock,
                {
                  id: generateId(),
                  warehouseId,
                  productId,
                  quantity,
                  lastUpdated: new Date().toISOString(),
                },
              ],
            };
          }
        });
      },
      
      // Movement Actions
      addMovement: (movement) => {
        const state = get();
        const newMovement: StockMovement = {
          ...movement,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        // Update stock based on movement type
        const currentStock = state.getStockForProduct(movement.productId, movement.warehouseId);
        let newQuantity = currentStock;
        
        if (movement.type === 'IN') {
          newQuantity = currentStock + movement.quantity;
        } else if (movement.type === 'OUT') {
          newQuantity = Math.max(0, currentStock - movement.quantity);
        } else if (movement.type === 'ADJUST') {
          newQuantity = currentStock + movement.quantity; // quantity can be negative
        }
        
        state.updateStock(movement.warehouseId, movement.productId, newQuantity);
        set((state) => ({ movements: [newMovement, ...state.movements] }));
        
        // Generate alerts after stock change
        setTimeout(() => get().generateAlerts(), 100);
      },
      
      // Supplier Actions
      addSupplier: (supplier) => {
        const newSupplier: Supplier = {
          ...supplier,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));
      },
      
      updateSupplier: (id, data) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        }));
      },
      
      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        }));
      },
      
      // Customer Actions
      addCustomer: (customer) => {
        const newCustomer: Customer = {
          ...customer,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ customers: [...state.customers, newCustomer] }));
      },
      
      updateCustomer: (id, data) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },
      
      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },
      
      // Category Actions
      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: generateId(),
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
      },
      
      // Alert Actions
      generateAlerts: () => {
        const state = get();
        const newAlerts: Alert[] = [];
        
        state.products.forEach((product) => {
          state.warehouses.forEach((warehouse) => {
            const stockItem = state.stock.find(
              (s) => s.productId === product.id && s.warehouseId === warehouse.id
            );
            const quantity = stockItem?.quantity || 0;
            
            if (quantity === 0) {
              newAlerts.push({
                id: generateId(),
                type: 'OUT_OF_STOCK',
                productId: product.id,
                warehouseId: warehouse.id,
                message: `${product.name} - Rupture de stock à ${warehouse.name}`,
                isRead: false,
                createdAt: new Date().toISOString(),
              });
            } else if (quantity < product.minStock) {
              newAlerts.push({
                id: generateId(),
                type: 'LOW_STOCK',
                productId: product.id,
                warehouseId: warehouse.id,
                message: `${product.name} - Stock faible (${quantity}/${product.minStock}) à ${warehouse.name}`,
                isRead: false,
                createdAt: new Date().toISOString(),
              });
            }
          });
        });
        
        set({ alerts: newAlerts });
      },
      
      markAlertRead: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, isRead: true } : a
          ),
        }));
      },
      
      clearAlerts: () => {
        set({ alerts: [] });
      },
      
      // UI Actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },
    }),
    {
      name: 'zion-stock-storage',
    }
  )
);
