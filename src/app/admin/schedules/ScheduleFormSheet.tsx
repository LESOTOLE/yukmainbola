"use client";

import { useState } from "react";
import { addSchedule } from "@/app/actions/admin-schedules";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScheduleFormSheet({ venues }: { venues: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await addSchedule(formData);
      if (result.success) {
        alert(result.message);
        setIsOpen(false);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus size={16} /> Tambah Jadwal
      </Button>

      {/* Slide-out Sheet Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          {/* Sheet Content */}
          <div className="w-full max-w-md h-full bg-surface border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-text">Tambah Jadwal Mabar</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-text-muted hover:text-text rounded-md hover:bg-background"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="schedule-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="venue_id" className="text-sm font-medium text-text">Lokasi Lapangan <span className="text-danger">*</span></label>
                  <select 
                    id="venue_id" 
                    name="venue_id" 
                    required 
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Pilih Lapangan...</option>
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-medium text-text">Tanggal Main <span className="text-danger">*</span></label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date" 
                    required 
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 style-calendar-dark"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="start_time" className="text-sm font-medium text-text">Jam Mulai <span className="text-danger">*</span></label>
                    <input 
                      type="time" 
                      id="start_time" 
                      name="start_time" 
                      required 
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 style-calendar-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="end_time" className="text-sm font-medium text-text">Jam Selesai <span className="text-danger">*</span></label>
                    <input 
                      type="time" 
                      id="end_time" 
                      name="end_time" 
                      required 
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 style-calendar-dark"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="max_players" className="text-sm font-medium text-text">Maksimal Pemain <span className="text-danger">*</span></label>
                  <input 
                    type="number" 
                    id="max_players" 
                    name="max_players"
                    min="2"
                    defaultValue="14"
                    required 
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="price_per_person" className="text-sm font-medium text-text">Harga Tiket per Orang (Rp) <span className="text-danger">*</span></label>
                  <input 
                    type="number" 
                    id="price_per_person" 
                    name="price_per_person"
                    min="0"
                    step="1000"
                    defaultValue="50000"
                    required 
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-border bg-surface/50">
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" form="schedule-form" disabled={isLoading}>
                  {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                  Simpan Jadwal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
