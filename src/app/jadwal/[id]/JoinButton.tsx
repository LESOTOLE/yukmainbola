"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { joinMabar } from "@/app/actions/booking";
import { CheckCircle2, Loader2, XCircle, Coins, Minus, Plus, UserPlus } from "lucide-react";
import { useRealtimeSlots } from "@/hooks/useRealtimeSlots";
import { useEffect } from "react";
import { formatCurrency } from "@/lib/utils/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

declare global {
  interface Window {
    snap: any;
  }
}

interface JoinButtonProps {
  scheduleId: string;
  isBooked: boolean;
  initialPlayers: number;
  maxPlayers: number;
  isLoggedIn: boolean;
  pointsBalance?: number;
  price?: number;
}

export default function JoinButton({ scheduleId, isBooked, initialPlayers, maxPlayers, isLoggedIn, pointsBalance = 0, price = 0 }: JoinButtonProps) {
  const currentPlayers = useRealtimeSlots('schedules', scheduleId, initialPlayers);
  const isFull = currentPlayers >= maxPlayers;
  const availableSlots = Math.max(0, maxPlayers - currentPlayers);
  
  const [hasNotifiedFull, setHasNotifiedFull] = useState(false);
  
  useEffect(() => {
    if (isFull && !hasNotifiedFull && initialPlayers < maxPlayers) {
      alert("Slot baru saja penuh!");
      setHasNotifiedFull(true);
    }
  }, [isFull, hasNotifiedFull, initialPlayers, maxPlayers]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  const handleInitialClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    // Reset state when opening modal
    setQuantity(1);
    setGuestNames([]);
    setUsePoints(false);
    setShowModal(true);
  };

  const handleQuantityChange = (newQty: number) => {
    const clamped = Math.max(1, Math.min(newQty, availableSlots, 20));
    setQuantity(clamped);

    // Adjust guest names array to match (qty - 1)
    if (clamped <= 1) {
      setGuestNames([]);
    } else {
      setGuestNames(prev => {
        const needed = clamped - 1;
        if (prev.length < needed) {
          return [...prev, ...Array(needed - prev.length).fill("")];
        }
        return prev.slice(0, needed);
      });
    }
  };

  const handleGuestNameChange = (index: number, value: string) => {
    setGuestNames(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleConfirmJoin = async () => {
    setIsLoading(true);
    setStatus(null);

    try {
      const result = await joinMabar(scheduleId, quantity, guestNames, usePoints);
      setStatus(result);
      
      if (result.success && result.token) {
        // Call Midtrans Snap
        window.snap.pay(result.token, {
          onSuccess: function (result: any) {
            setStatus({ success: true, message: "Pembayaran berhasil! Anda sudah terdaftar di mabar ini." });
            // Optionally refresh the page to update slot count
            router.refresh();
          },
          onPending: function (result: any) {
            setStatus({ success: true, message: "Menunggu pembayaran Anda. Silakan cek menu Profil." });
            router.refresh();
          },
          onError: function (result: any) {
            setStatus({ success: false, message: "Pembayaran gagal. Silakan coba lagi nanti." });
          },
          onClose: function () {
            setStatus({ success: true, message: "Anda menutup popup sebelum membayar. Lanjutkan bayar di menu Profil." });
            router.refresh();
          }
        });
      }
      setShowModal(false);
    } catch (error) {
      setStatus({ success: false, message: "Terjadi kesalahan yang tidak terduga." });
      setShowModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = price * quantity;
  const maxPointsToUse = Math.floor(totalPrice * 0.5);
  const actualPointsToUse = Math.min(pointsBalance, maxPointsToUse);
  const finalPrice = usePoints && actualPointsToUse > 0 ? totalPrice - actualPointsToUse : totalPrice;

  if (isBooked) {
    return (
      <div className="w-full">
        <Button 
          disabled 
          className="w-full bg-surface-hover text-primary border border-primary/20 cursor-not-allowed opacity-100 font-semibold py-6"
        >
          <CheckCircle2 className="mr-2" size={20} />
          Anda Sudah Terdaftar
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <Button
        onClick={handleInitialClick}
        disabled={isLoading || isFull}
        className={`w-full font-semibold py-6 text-base ${
          isFull 
            ? "bg-surface-hover text-text-muted opacity-100 cursor-not-allowed" 
            : "bg-primary hover:bg-primary-hover text-background shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Memproses...
          </>
        ) : isFull ? (
          "Kuota Penuh"
        ) : (
          "Join Mabar Sekarang"
        )}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md bg-background border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Konfirmasi Pendaftaran</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-5">
            {/* Quantity Selector */}
            <div>
              <label className="text-sm font-medium text-text mb-2 block">Jumlah Orang</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-lg border border-border bg-surface hover:bg-surface-hover flex items-center justify-center text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-text">{quantity}</span>
                  <p className="text-xs text-text-muted mt-0.5">
                    {quantity === 1 ? "Individu" : `${quantity} orang`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= availableSlots || quantity >= 20}
                  className="h-10 w-10 rounded-lg border border-border bg-surface hover:bg-surface-hover flex items-center justify-center text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-xs text-text-muted mt-2 text-center">
                Sisa slot tersedia: <span className="font-semibold text-primary">{availableSlots}</span>
              </p>
            </div>

            {/* Guest Name Inputs */}
            {quantity > 1 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-text flex items-center gap-2">
                  <UserPlus size={16} className="text-primary" />
                  Nama Teman (Opsional)
                </label>
                <div className="space-y-2">
                  {guestNames.map((name, index) => (
                    <div key={index} className="relative">
                      <input
                        type="text"
                        placeholder={`Nama teman ke-${index + 1}`}
                        value={name}
                        onChange={(e) => handleGuestNameChange(index, e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-text placeholder:text-text-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        maxLength={50}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted bg-background px-1.5 py-0.5 rounded">
                        #{index + 2}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-text-muted">
                  Anda adalah pemain #1. Nama teman bersifat opsional, tapi membantu admin di lapangan.
                </p>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-surface rounded-lg p-3 border border-border space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Harga per Orang</span>
                <span className="text-text">{formatCurrency(price)}</span>
              </div>
              {quantity > 1 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Jumlah Orang</span>
                  <span className="text-text">×{quantity}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-medium border-t border-border pt-2">
                <span className="text-text">Subtotal</span>
                <span className="text-text">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            
            {/* Points Section */}
            {pointsBalance > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center text-primary">
                    <Coins size={16} className="mr-2" />
                    Poin Anda: {pointsBalance.toLocaleString('id-ID')}
                  </span>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-primary text-primary focus:ring-primary"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                  />
                  <span className="text-sm text-text">
                    Gunakan poin (Maks {actualPointsToUse.toLocaleString('id-ID')})
                  </span>
                </label>
              </div>
            )}
            
            {/* Total */}
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="font-bold text-text">Total Bayar</span>
              <span className="font-bold text-xl text-primary">{formatCurrency(finalPrice)}</span>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowModal(false)} className="text-text">Batal</Button>
            <Button onClick={handleConfirmJoin} className="bg-primary hover:bg-primary-hover text-background" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {quantity > 1 ? `Bayar untuk ${quantity} Orang` : "Lanjut Pembayaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {status && (
        <div className={`p-3 text-sm rounded-md flex items-start gap-2 ${
          status.success ? "bg-primary/10 text-primary border border-primary/20" : "bg-danger/10 text-danger border border-danger/20"
        }`}>
          {status.success ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}
