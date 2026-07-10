"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { registerEvent } from "@/app/actions/event";
import { CheckCircle2, Loader2, XCircle, Coins } from "lucide-react";
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

interface EventJoinButtonProps {
  eventId: string;
  isBooked: boolean;
  isFull: boolean;
  isLoggedIn: boolean;
  pointsBalance?: number;
  price?: number;
}

export default function EventJoinButton({ eventId, isBooked, isFull, isLoggedIn, pointsBalance = 0, price = 0 }: EventJoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  const handleInitialClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setShowModal(true);
  };

  const handleConfirmJoin = async () => {
    setIsLoading(true);
    setStatus(null);

    try {
      const result = await registerEvent(eventId, usePoints);
      setStatus(result);
      
      if (result.success && result.token) {
        window.snap.pay(result.token, {
          onSuccess: function () {
            setStatus({ success: true, message: "Pembayaran berhasil! Anda sudah terdaftar di event ini." });
            router.refresh();
          },
          onPending: function () {
            setStatus({ success: true, message: "Menunggu pembayaran Anda. Silakan cek menu Profil." });
            router.refresh();
          },
          onError: function () {
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

  const maxPointsToUse = Math.floor(price * 0.5);
  const actualPointsToUse = Math.min(pointsBalance, maxPointsToUse);
  const finalPrice = usePoints && actualPointsToUse > 0 ? price - actualPointsToUse : price;

  if (isBooked) {
    return (
      <Button 
        disabled 
        className="w-full bg-surface-hover text-primary border border-primary/20 cursor-not-allowed opacity-100 font-semibold py-6"
      >
        <CheckCircle2 className="mr-2" size={20} />
        Anda Sudah Terdaftar
      </Button>
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
          "Daftar Event"
        )}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">Konfirmasi Pendaftaran</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Biaya Event</span>
              <span className="font-semibold text-text">{formatCurrency(price)}</span>
            </div>
            
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
            
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="font-bold text-text">Total Bayar</span>
              <span className="font-bold text-xl text-primary">{formatCurrency(finalPrice)}</span>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowModal(false)} className="text-text">Batal</Button>
            <Button onClick={handleConfirmJoin} className="bg-primary hover:bg-primary-hover text-background" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Lanjut Pembayaran
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
