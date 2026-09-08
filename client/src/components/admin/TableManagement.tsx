import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ModalPortal } from '../ModalPortal';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus,
  Trash2,
  Printer,
  Users,
  ExternalLink,
  X,
  Flame,
} from 'lucide-react';

interface TableRecord {
  id: string;
  tableNumber: string;
  qrToken: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED';
  createdAt: string;
  _count?: { orders: number };
}

export const TableManagement: React.FC = () => {
  const { token } = useAdminAuth();
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableRecord | null>(null);

  // Form State
  const [newTableNumber, setNewTableNumber] = useState<string>('');
  const [newCapacity, setNewCapacity] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchTables = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/tables', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
      }
    } catch (err) {
      console.error('Fetch tables error:', err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [token]);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableNumber: newTableNumber,
          capacity: newCapacity,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTableNumber('');
        setNewCapacity(4);
        fetchTables();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create table');
      }
    } catch (err) {
      console.error('Add table error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTableStatus = async (table: TableRecord) => {
    const nextStatus = table.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
    try {
      const res = await fetch(`/api/admin/tables/${table.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setTables((prev) =>
          prev.map((t) => (t.id === table.id ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to remove this table?')) return;
    try {
      const res = await fetch(`/api/admin/tables/${tableId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setTables((prev) => prev.filter((t) => t.id !== tableId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to remove table');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getTableUrl = (token: string) => {
    const origin = window.location.origin;
    return `${origin}/order?table=${token}`;
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Table & QR Code Management
          </h2>
          <p className="text-xs text-slate-400">
            Generate QR codes, manage table capacities, and print standee inserts for dining tables.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 border border-white/10 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-orange-400" />
            <span>Print All Standees</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-charcoal-950 text-xs font-black flex items-center space-x-1.5 shadow-glow hover:shadow-glow-gold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => {
          const tableUrl = getTableUrl(table.qrToken);
          const isOccupied = table.status === 'OCCUPIED';

          return (
            <div
              key={table.id}
              className="glass-panel p-5 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Top Table Pill */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOccupied ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                      }`}
                    />
                    <h3 className="font-serif font-bold text-base text-white">
                      {table.tableNumber}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleTableStatus(table)}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase transition-colors ${
                      isOccupied
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {table.status}
                  </button>
                </div>

                {/* QR Code Center */}
                <div
                  onClick={() => setSelectedTableForQr(table)}
                  className="bg-white p-3 rounded-2xl w-fit mx-auto shadow-md cursor-pointer hover:scale-105 transition-transform group relative"
                  title="Click to zoom QR Code"
                >
                  <QRCodeSVG
                    value={tableUrl}
                    size={110}
                    level="M"
                    fgColor="#090a0f"
                    bgColor="#ffffff"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                    Zoom QR
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 mt-3 text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Seats {table.capacity} guests</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <a
                  href={tableUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 hover:text-orange-300 font-semibold flex items-center space-x-1"
                >
                  <span>Open Menu</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Remove Table"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Single QR Zoom */}
      <ModalPortal isOpen={!!selectedTableForQr} onClose={() => setSelectedTableForQr(null)}>
        {selectedTableForQr && (
          <div
            className="w-full max-w-sm bg-charcoal-900 border border-white/10 rounded-3xl p-6 text-center shadow-glow relative animate-slideUp pointer-events-auto"
          >
            <button
              onClick={() => setSelectedTableForQr(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-xl font-serif font-bold text-white">
                {selectedTableForQr.tableNumber}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                Token
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-card mb-4">
              <QRCodeSVG
                value={`${window.location.origin}/order?table=${selectedTableForQr.qrToken}`}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="text-[11px] text-slate-400 font-mono break-all bg-charcoal-950 p-2 rounded-xl border border-white/5 mb-4">
              /order?table={selectedTableForQr.qrToken}
            </p>

            <a
              href={`/order?table=${selectedTableForQr.qrToken}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ember-primary w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Simulate Customer Scan</span>
            </a>
          </div>
        )}
      </ModalPortal>

      {/* Modal: Add Table */}
      <ModalPortal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div
          className="w-full max-w-md bg-charcoal-900 border border-white/10 rounded-3xl p-6 shadow-glow relative animate-slideUp pointer-events-auto"
        >
          <button
            onClick={() => setShowAddModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-serif font-bold text-white mb-1">Add New Table</h3>
          <p className="text-xs text-slate-400 mb-6">
            A cryptographic QR code will automatically be generated for this table.
          </p>

          <form onSubmit={handleAddTable} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Table Number / Name
              </label>
              <input
                type="text"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder={`Table ${String(tables.length + 1).padStart(2, '0')}`}
                className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Seating Capacity
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-charcoal-950 font-black text-xs sm:text-sm shadow-glow hover:shadow-glow-gold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Table...' : 'Generate Table & QR Token'}
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      {/* Modal: Print All Standees Layout */}
      <ModalPortal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} containerClassName="relative z-[1000] w-full max-w-4xl pointer-events-auto">
        <div className="w-full max-w-4xl bg-charcoal-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">
                  Print Table Standees Layout
                </h3>
                <p className="text-xs text-slate-400">
                  Ready-to-cut dining table inserts with Ember & Plate woodfire branding.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-charcoal-950 text-xs font-black flex items-center space-x-1.5 shadow-glow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Sheet</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 rounded-xl bg-charcoal-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Standee Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="bg-charcoal-950 border-2 border-orange-500/40 p-6 rounded-3xl text-center shadow-lg relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500" />

                  <div>
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white">
                      <Flame className="w-5 h-5 fill-white" />
                    </div>
                    <h4 className="font-serif font-black text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-400">
                      EMBER & PLATE
                    </h4>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-3">
                      Woodfire & Artisanal Dining
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl w-fit mx-auto my-2 shadow-inner">
                    <QRCodeSVG
                      value={getTableUrl(table.qrToken)}
                      size={120}
                      level="H"
                      fgColor="#090a0f"
                      bgColor="#ffffff"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-mono font-black text-orange-400 block tracking-widest uppercase mt-2">
                      {table.tableNumber}
                    </span>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Scan to browse & order from your phone
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </ModalPortal>
    </div>
  );
};
