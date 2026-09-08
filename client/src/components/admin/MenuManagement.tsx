import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ModalPortal } from '../ModalPortal';
import {
  Plus,
  Trash2,
  Edit2,
  Flame,
  X,
  Search,
} from 'lucide-react';

interface MenuAddon {
  id?: string;
  name: string;
  price: number;
}

interface AdminMenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  prepTimeMinutes: number;
  category?: { id: string; name: string; slug: string };
  addons?: MenuAddon[];
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export const MenuManagement: React.FC = () => {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Add / Edit
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formCategoryId, setFormCategoryId] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(350);
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formIsVeg, setFormIsVeg] = useState<boolean>(true);
  const [formIsPopular, setFormIsPopular] = useState<boolean>(false);
  const [formPrepTime, setFormPrepTime] = useState<number>(15);
  const [formAddons, setFormAddons] = useState<Array<{ name: string; price: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchMenuData = async () => {
    if (!token) return;
    try {
      const [itemsRes, catRes] = await Promise.all([
        fetch('/api/admin/menu/items', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (itemsRes.ok && catRes.ok) {
        const itemsData = await itemsRes.json();
        const catData = await catRes.json();
        setItems(itemsData.items || []);
        setCategories(catData.categories || []);
        if (catData.categories.length > 0 && !formCategoryId) {
          setFormCategoryId(catData.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Fetch menu error:', err);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, [token]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || '');
    setFormDescription('');
    setFormPrice(350);
    setFormImageUrl('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80');
    setFormIsVeg(true);
    setFormIsPopular(false);
    setFormPrepTime(15);
    setFormAddons([
      { name: 'Extra Cheese', price: 40 },
      { name: 'Truffle Dip', price: 50 },
    ]);
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item: AdminMenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategoryId(item.categoryId);
    setFormDescription(item.description);
    setFormPrice(item.price);
    setFormImageUrl(item.imageUrl);
    setFormIsVeg(item.isVeg);
    setFormIsPopular(item.isPopular);
    setFormPrepTime(item.prepTimeMinutes);
    setFormAddons(item.addons?.map((a) => ({ name: a.name, price: a.price })) || []);
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        categoryId: formCategoryId,
        name: formName,
        description: formDescription,
        price: formPrice,
        imageUrl: formImageUrl,
        isVeg: formIsVeg,
        isPopular: formIsPopular,
        prepTimeMinutes: formPrepTime,
        addons: formAddons,
      };

      let res;
      if (editingItem) {
        res = await fetch(`/api/admin/menu/items/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/menu/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowItemModal(false);
        fetchMenuData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save menu item');
      }
    } catch (err) {
      console.error('Save item error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = async (item: AdminMenuItem) => {
    const nextVal = !item.isAvailable;
    try {
      const res = await fetch(`/api/admin/menu/items/${item.id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: nextVal }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: nextVal } : i))
        );
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this dish from the menu?')) return;
    try {
      const res = await fetch(`/api/admin/menu/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      }
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  const handleAddAddonRow = () => {
    setFormAddons([...formAddons, { name: '', price: 30 }]);
  };

  const handleRemoveAddonRow = (index: number) => {
    setFormAddons(formAddons.filter((_, i) => i !== index));
  };

  const handleUpdateAddonRow = (index: number, field: 'name' | 'price', val: any) => {
    setFormAddons(
      formAddons.map((a, i) => (i === index ? { ...a, [field]: val } : a))
    );
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Menu Management
          </h2>
          <p className="text-xs text-slate-400">
            Add new dishes, update live prices, and instantly toggle in-stock availability.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-charcoal-950 text-xs font-black flex items-center space-x-1.5 shadow-glow hover:shadow-glow-gold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-orange-500 text-white shadow-glow'
                : 'bg-charcoal-900 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Dishes ({items.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-orange-500 text-white shadow-glow'
                  : 'bg-charcoal-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`glass-panel p-4 rounded-3xl border transition-all flex flex-col justify-between ${
              item.isAvailable ? 'border-white/5' : 'border-rose-500/20 bg-rose-950/10 opacity-75'
            }`}
          >
            <div>
              <div className="flex gap-3 mb-3">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                  alt={item.name}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.dataset.errored) {
                      img.dataset.errored = 'true';
                      img.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80';
                    }
                  }}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-charcoal-800"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-1">
                    {item.description}
                  </p>
                  <span className="text-xs font-bold text-orange-400">₹{item.price}</span>
                </div>
              </div>

              {/* Addons preview if any */}
              {item.addons && item.addons.length > 0 && (
                <div className="text-[10px] text-slate-400 mb-3 bg-charcoal-900/60 p-2 rounded-xl border border-white/5">
                  <strong className="text-orange-400/90 font-medium">Add-ons: </strong>
                  {item.addons.map((a) => `${a.name} (+₹${a.price})`).join(', ')}
                </div>
              )}
            </div>

            {/* Bottom Actions & Availability Toggle */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              {/* Toggle in-stock */}
              <button
                onClick={() => toggleAvailability(item)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  item.isAvailable
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.isAvailable ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 hover:text-white transition-colors"
                  title="Edit Dish"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 rounded-xl bg-charcoal-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete Dish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add / Edit Dish */}
      <ModalPortal isOpen={showItemModal} onClose={() => setShowItemModal(false)}>
        <div
          className="w-full max-w-lg bg-charcoal-900 border border-white/10 rounded-3xl p-6 shadow-glow relative my-8 animate-slideUp pointer-events-auto"
        >
            <button
              onClick={() => setShowItemModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-white mb-1">
              {editingItem ? 'Edit Dish' : 'Add New Dish'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Updates to dishes reflect immediately on all customer table menus.
            </p>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Dish Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Artisanal Burrata Pizza"
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500/50"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ingredients, preparation method, culinary notes..."
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Prep Time (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              {/* Image URL & Live Preview */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Dish Photography Image URL
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 p-2.5 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                  />
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (!img.dataset.errored) {
                          img.dataset.errored = 'true';
                          img.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=80&q=80';
                        }
                      }}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10 bg-charcoal-800"
                    />
                  )}
                </div>
              </div>

              {/* Flags */}
              <div className="flex items-center space-x-6 pt-1 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="diet"
                    checked={formIsVeg}
                    onChange={() => setFormIsVeg(true)}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-emerald-400 font-semibold">Vegetarian</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="diet"
                    checked={!formIsVeg}
                    onChange={() => setFormIsVeg(false)}
                    className="text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-rose-400 font-semibold">Non-Vegetarian</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPopular}
                    onChange={(e) => setFormIsPopular(e.target.checked)}
                    className="text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-orange-400 font-semibold flex items-center">
                    <Flame className="w-3 h-3 mr-1" /> Bestseller
                  </span>
                </label>
              </div>

              {/* Addons Builder */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Custom Add-ons
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAddonRow}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Option</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {formAddons.map((addon, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Addon name (e.g. Extra Truffle)"
                        value={addon.name}
                        onChange={(e) => handleUpdateAddonRow(idx, 'name', e.target.value)}
                        className="flex-1 p-2 rounded-lg bg-charcoal-950 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500/50"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={addon.price}
                        onChange={(e) => handleUpdateAddonRow(idx, 'price', Number(e.target.value))}
                        className="w-20 p-2 rounded-lg bg-charcoal-950 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAddonRow(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-charcoal-950 font-black text-xs sm:text-sm shadow-glow hover:shadow-glow-gold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Dish...' : editingItem ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
      </ModalPortal>
    </div>
  );
};
