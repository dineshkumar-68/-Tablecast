import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TableInfo, RestaurantInfo, MenuCategory, MenuItem } from './types';
import { CartProvider, useCart, PlacedOrderSummary } from './context/CartContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { Header } from './components/Header';
import { InvalidTableNotice } from './components/InvalidTableNotice';
import { CategoryTabs } from './components/CategoryTabs';
import { SearchBarAndFilters } from './components/SearchBarAndFilters';
import { MenuCard } from './components/MenuCard';
import { FoodDetailModal } from './components/FoodDetailModal';
import { FloatingCartButton } from './components/FloatingCartButton';
import { CartDrawer } from './components/CartDrawer';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackerView } from './components/OrderTrackerView';
import { RecommendedPairings } from './components/RecommendedPairings';
import { ReorderPanel } from './components/ReorderPanel';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { Sparkles, UtensilsCrossed, RefreshCw, ShieldCheck, RotateCcw } from 'lucide-react';

function CustomerOrderingView({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const [tableToken, setTableToken] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [tableError, setTableError] = useState<string | null>(null);

  // View state: 'MENU' | 'TRACKING'
  const [activeView, setActiveView] = useState<'MENU' | 'TRACKING'>('MENU');
  const [confirmedOrder, setConfirmedOrder] = useState<PlacedOrderSummary | null>(null);

  const { activeOrder } = useCart();

  // Filters State
  const [activeCategoryId, setActiveCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG' | 'JAIN' | 'VEGAN'>('ALL');
  const [popularOnly, setPopularOnly] = useState<boolean>(false);
  const [showReorder, setShowReorder] = useState<boolean>(false);

  // Read URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    const trackParam = params.get('track');
    setTableToken(tableParam);

    if (trackParam && activeOrder && activeOrder.id === trackParam) {
      setActiveView('TRACKING');
    }
  }, [activeOrder]);

  // Fetch Table validation and Menu data
  useEffect(() => {
    async function initData() {
      setLoading(true);
      setTableError(null);

      try {
        // 1. Fetch Menu
        const menuRes = await fetch('/api/menu');
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setCategories(menuData.categories || []);
        }

        // 2. Validate Table Token
        if (!tableToken) {
          setTableInfo(null);
          setLoading(false);
          return;
        }

        const tableRes = await fetch(`/api/tables/${encodeURIComponent(tableToken)}`);
        if (tableRes.ok) {
          const tableData = await tableRes.json();
          setTableInfo(tableData.table);
          setRestaurantInfo(tableData.restaurant);
          setTableError(null);
        } else {
          const errData = await tableRes.json();
          setTableInfo(null);
          setTableError(errData.message || 'Invalid or expired table QR code.');
        }
      } catch (err) {
        console.error('Error loading restaurant data:', err);
        setTableError('Network error connecting to restaurant server.');
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, [tableToken]);

  // Flattened all available items
  const allItems = useMemo(() => {
    return categories.flatMap((cat) => cat.items);
  }, [categories]);

  // Filtered Items based on category, search, veg/non-veg, jain, vegan and popular flags
  const filteredItems = useMemo(() => {
    return allItems.filter((item: any) => {
      // Category match
      if (activeCategoryId !== 'ALL' && item.categoryId !== activeCategoryId) {
        return false;
      }
      // Diet match
      if (dietFilter === 'VEG' && !item.isVeg) return false;
      if (dietFilter === 'NON_VEG' && item.isVeg) return false;
      if (dietFilter === 'JAIN' && !item.isJain) return false;
      if (dietFilter === 'VEGAN' && !item.isVegan) return false;
      // Popular match
      if (popularOnly && !item.isPopular) return false;
      // Search match
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [allItems, activeCategoryId, dietFilter, popularOnly, searchQuery]);


  const handleOrderSuccess = (order: PlacedOrderSummary) => {
    setConfirmedOrder(order);
  };

  const handleGoToTracker = () => {
    setConfirmedOrder(null);
    setActiveView('TRACKING');
  };

  // Loading Skeleton View
  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center animate-bounce shadow-glow">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-medium text-slate-300 animate-pulse">
          Loading Tablecast Artisanal Menu...
        </p>
      </div>
    );
  }

  // If table token is missing or invalid, show the QR Code prompt
  if (!tableInfo) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={onOpenAdmin}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-charcoal-800 hover:bg-charcoal-700 text-xs font-semibold text-orange-400 border border-white/10 shadow-lg"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin / Kitchen Portal</span>
          </button>
        </div>
        <InvalidTableNotice errorMessage={tableError || undefined} />
      </div>
    );
  }

  // If user is currently viewing the Live Tracker
  if (activeView === 'TRACKING' && activeOrder) {
    return (
      <OrderTrackerView
        orderSummary={activeOrder}
        onBackToMenu={() => setActiveView('MENU')}
      />
    );
  }

  return (
    <motion.div
      initial={{ rotateY: -60, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ perspective: 1200 }}
      className="min-h-screen bg-bg-primary text-text-primary flex flex-col pb-24 selection:bg-ember-500 selection:text-bg-primary"
    >
      {/* Sticky App Header */}
      <Header table={tableInfo} restaurant={restaurantInfo} />

      {/* Category Navigation Bar */}
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
        totalItemsCount={allItems.length}
      />

      {/* Search and Filters */}
      <SearchBarAndFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dietFilter={dietFilter}
        onDietFilterChange={setDietFilter}
        popularOnly={popularOnly}
        onTogglePopular={() => setPopularOnly(!popularOnly)}
      />

      {/* Switcher Bar for Reviewer Demo & Quick Admin Jump */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-2">
        <div className="p-2.5 rounded-2xl bg-bg-surface border border-border-subtle flex flex-wrap items-center justify-between gap-2 text-xs shadow-card">
          <div className="flex items-center space-x-2 text-white font-medium">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
            <span>
              Current Table: <strong className="text-gold-highlight font-bold font-serif text-sm ml-1">{tableInfo.tableNumber}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-secondary font-semibold hidden sm:inline">Switch Table:</span>
            <div className="bg-bg-primary/90 border border-border-subtle p-1 rounded-xl flex items-center space-x-1 shadow-inner">
              <a
                href="/order?table=tbl_01_tok_84f9a1"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  tableInfo.tableNumber === 'Table 01'
                    ? 'bg-ember-gradient text-bg-primary shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-bg-surface-2'
                }`}
              >
                Table 01
              </a>
              <a
                href="/order?table=tbl_02_tok_93e7b2"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  tableInfo.tableNumber === 'Table 02'
                    ? 'bg-ember-gradient text-bg-primary shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-bg-surface-2'
                }`}
              >
                Table 02
              </a>
              <a
                href="/order?table=tbl_03_tok_12c4d5"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  tableInfo.tableNumber === 'Table 03'
                    ? 'bg-ember-gradient text-bg-primary shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-bg-surface-2'
                }`}
              >
                Table 03
              </a>
            </div>

            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-ember-gradient text-bg-primary text-xs font-bold transition-all shadow-sm hover:brightness-110"
            >
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Cards Grid */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 mt-2 flex-1">
        {/* Reorder Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowReorder(!showReorder)}
            className={`w-full py-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              showReorder
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                : 'bg-charcoal-800/50 border-white/10 text-slate-300 hover:border-orange-500/30 hover:text-orange-400'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{showReorder ? 'Hide Reorder Panel' : 'Reorder a Previous Meal'}</span>
          </button>

          {showReorder && (
            <div className="mt-3 animate-fadeIn">
              <ReorderPanel
                tableToken={tableToken}
                onItemAdded={() => {}}
              />
            </div>
          )}
        </div>

        {/* AI Pairing Suggestions */}
        <RecommendedPairings
          items={allItems}
          onSelectItem={(selected) => setSelectedItem(selected)}
        />
        {filteredItems.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center max-w-md mx-auto my-8 border border-white/5">
            <UtensilsCrossed className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-200 mb-1">No Dishes Found</h4>
            <p className="text-xs text-slate-400 mb-4">
              We couldn't find any dishes matching your current search or diet filters.
            </p>
            <button
              onClick={() => {
                setActiveCategoryId('ALL');
                setSearchQuery('');
                setDietFilter('ALL');
                setPopularOnly(false);
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-xs font-semibold text-orange-400 border border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onSelect={(selected) => setSelectedItem(selected)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Cart Button */}
      <FloatingCartButton onOpenTracker={() => setActiveView('TRACKING')} />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        table={tableInfo}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Food Detail Customisation Modal */}
      <FoodDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Order Confirmation Screen */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onTrack={handleGoToTracker}
        onClose={() => setConfirmedOrder(null)}
      />
    </motion.div>
  );
}

function MainAppShell() {
  const [viewMode, setViewMode] = useState<'CUSTOMER' | 'ADMIN'>(() => {
    return window.location.pathname.startsWith('/admin') ? 'ADMIN' : 'CUSTOMER';
  });

  const { isAuthenticated, isLoading } = useAdminAuth();

  // Listen for browser back/forward or path changes
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) {
      setViewMode('ADMIN');
    }
  }, []);

  if (viewMode === 'ADMIN') {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <AdminLoginPage onBackToCustomer={() => setViewMode('CUSTOMER')} />;
    }

    return <AdminLayout onGoToCustomerSite={() => setViewMode('CUSTOMER')} />;
  }

  return <CustomerOrderingView onOpenAdmin={() => setViewMode('ADMIN')} />;
}

export default function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <MainAppShell />
      </CartProvider>
    </AdminAuthProvider>
  );
}
