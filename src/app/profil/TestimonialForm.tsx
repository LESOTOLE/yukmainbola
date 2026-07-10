"use client";

import { useState } from "react";
import { addTestimonial } from "@/app/actions/user-testimonials";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestimonialForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("rating", rating.toString());
    
    try {
      const result = await addTestimonial(formData);
      alert(result.message);
      if (result.success) {
        (e.target as HTMLFormElement).reset();
        setRating(5);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 mt-8">
      <h3 className="text-xl font-bold text-text mb-2">Beri Ulasan Permainan</h3>
      <p className="text-text-muted text-sm mb-6">Bagaimana pengalaman mabar Anda bersama kami?</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-2">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none"
              >
                <Star 
                  size={24} 
                  className={`transition-colors ${
                    (hoverRating || rating) >= star 
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-border"
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-text mb-2">Ulasan</label>
          <textarea 
            id="content" 
            name="content" 
            required 
            rows={3}
            placeholder="Kesan dan pesan Anda..."
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
          ></textarea>
        </div>

        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary-hover text-background">
          {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Kirim Ulasan
        </Button>
      </form>
    </div>
  );
}
