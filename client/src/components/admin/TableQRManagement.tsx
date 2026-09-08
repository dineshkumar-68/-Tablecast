import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ClocheLogo } from '../ClocheLogo';
import { Printer, ExternalLink, QrCode, RefreshCw } from 'lucide-react';

interface TableRecord {
  id: string;
  tableNumber: string;
  qrToken: string;
  capacity: number;
  status: string;
}

export const TableQRManagement: React.FC = () => {
  const { token } = useAdminAuth();
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTables = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/tables', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
        if (data.tables && data.tables.length > 0) {
          const tbl05 = data.tables.find((t: TableRecord) => t.tableNumber === 'Table 05') || data.tables[0];
          setSelectedTable(tbl05);
        }
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [token]);

  const handlePrintAll = () => {
    window.print();
  };

  const handleToggleStatus = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          const nextStatus = t.status === 'OCCUPIED' ? 'AVAILABLE' : 'OCCUPIED';
          // Regenerate single-use token on reset to AVAILABLE as specified in Section 5.6
          const nextToken = nextStatus === 'AVAILABLE' ? `tbl_${t.tableNumber.replace(/\D/g, '')}_tok_${Math.random().toString(36).substring(2, 8)}` : t.qrToken;
          return { ...t, status: nextStatus, qrToken: nextToken };
        }
        return t;
      })
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-text-muted">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-ember-500" />
        <p className="text-xs">Loading restaurant dining tables...</p>
      </div>
    );
  }

  const originUrl = window.location.origin;
  const qrTargetUrl = selectedTable
    ? `${originUrl}/order?table=${selectedTable.qrToken}`
    : `${originUrl}/order`;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-text-primary flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-ember-500" />
            <span>Table & QR Standees Management</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Generate and print official acrylic table cards for all dining tables with dynamic token reset.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrintAll}
            className="btn-ember-primary px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-glow"
          >
            <Printer className="w-4 h-4" />
            <span>Print All Standees (PDF)</span>
          </button>
        </div>
      </div>

      {/* Grid: Table Selector + Stand Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Table List */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-3xl border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
              Dining Room Tables ({tables.length})
            </h3>
            <span className="text-[11px] text-ember-500 font-semibold">Click table badge to toggle status</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tables.map((table) => {
              const isSelected = selectedTable?.id === table.id;
              const isOccupied = table.status === 'OCCUPIED';
              const isDemo = table.tableNumber === 'Table 05';

              return (
                <motion.div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-ember-500/15 border-ember-500 text-text-primary shadow-glow ring-1 ring-ember-500/30'
                      : 'bg-bg-surface border-border-subtle hover:border-ember-500/30 text-text-secondary'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-serif font-bold text-sm text-text-primary">
                      {table.tableNumber}
                    </span>
                    {isDemo && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-ember-gradient text-bg-primary uppercase">
                        Demo
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-text-muted font-medium">Seats {table.capacity}</span>
                    
                    {/* Color-Morphing Status Badge */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(table.id);
                      }}
                      className="focus:outline-none"
                    >
                      <motion.span
                        animate={{
                          backgroundColor: isOccupied ? 'rgba(251, 191, 84, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                          color: isOccupied ? '#FBBF54' : '#4ADE80',
                          borderColor: isOccupied ? 'rgba(251, 191, 84, 0.4)' : 'rgba(74, 222, 128, 0.4)',
                        }}
                        transition={{ duration: 0.4 }}
                        className="px-2 py-0.5 rounded-full border font-bold text-[10px] flex items-center space-x-1"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-[#FBBF54]' : 'bg-[#4ADE80]'}`} />
                        <span>{isOccupied ? 'Occupied' : 'Available'}</span>
                      </motion.span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Realistic Table Stand Card Preview with Glossy Sheen Sweep */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-3 self-start">
            Stand Visual Preview (Print Ready)
          </h3>

          {selectedTable && (
            <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-bg-surface via-bg-surface-2 to-bg-primary p-6 border-2 border-ember-500/40 shadow-3d text-center space-y-4 relative overflow-hidden group print:border-black print:bg-white print:text-black">
              {/* Glossy Sheen Sweep Animation on Hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* Gold border accent frame */}
              <div className="p-4 border border-ember-500/30 rounded-2xl bg-bg-primary/40 space-y-4">
                {/* Brand Header */}
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-ember-gradient flex items-center justify-center text-bg-primary shadow-sm">
                    <ClocheLogo className="w-5 h-5 text-bg-primary" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-serif font-bold text-xs tracking-wider text-text-primary">
                      EMBER & PLATE
                    </h4>
                    <p className="text-[9px] uppercase tracking-widest text-gold-highlight font-extrabold">
                      TABLE-WISE DINING
                    </p>
                  </div>
                </div>

                {/* Table Number */}
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-text-muted block">
                    TABLE
                  </span>
                  <h1 className="font-serif font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-gold-highlight to-ember-500">
                    {selectedTable.tableNumber.replace('Table ', '')}
                  </h1>
                  <p className="text-[10px] uppercase tracking-widest font-extrabold text-ember-500 mt-1">
                    SCAN TO ORDER & RELAX
                  </p>
                </div>

                {/* High Resolution QR Code */}
                <div className="bg-white p-4 rounded-2xl inline-block mx-auto shadow-inner border border-white/20">
                  <QRCodeSVG
                    value={qrTargetUrl}
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* Footer Copy */}
                <div className="pt-2">
                  <p className="text-[11px] font-serif font-bold tracking-widest text-gold-highlight">
                    THANK YOU!
                  </p>
                  <p className="text-[9px] text-text-secondary mt-0.5">
                    Scan. Order. Relax. • Instant Table Service
                  </p>
                </div>
              </div>

              {/* Action Link */}
              <a
                href={qrTargetUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-bg-surface-2 hover:bg-bg-surface text-xs font-semibold text-gold-highlight border border-border-subtle flex items-center justify-center space-x-1.5 transition-all print:hidden"
              >
                <span>Launch Customer Ordering Flow</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
