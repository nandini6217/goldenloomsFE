'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { chatbotApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { CHATBOT_PRODUCT_TYPES } from '@/config/constants';

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    productTypeRequired: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim() || !form.productTypeRequired.trim()) {
      setError('Please fill name, phone, and product type.');
      return;
    }
    setLoading(true);
    try {
      await chatbotApi.submit({
        name: form.name.trim(),
        phone: form.phone.trim(),
        productTypeRequired: form.productTypeRequired.trim(),
        message: form.message.trim() || undefined,
      });
      setSubmitted(true);
      setForm({ name: '', phone: '', productTypeRequired: '', message: '' });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Something went wrong. Please try again.';
      setError(msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (submitted) {
      setSubmitted(false);
    }
    setError('');
  };

  return (
    <>
      {/* Toggle button - bottom right, always visible on land */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200',
          'bg-[var(--primary)] text-white hover:scale-105 hover:shadow-xl',
          'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2'
        )}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[9997] w-[min(calc(100vw-3rem),380px)] rounded-2xl border border-[var(--primary)]/20 bg-white shadow-xl"
          role="dialog"
          aria-label="Quick inquiry form"
        >
          <div className="rounded-t-2xl bg-[var(--primary)] px-4 py-3 text-white">
            <h3 className="font-display font-semibold">Quick inquiry</h3>
            <p className="text-sm text-white/90">Tell us what you need — we&apos;ll get back soon.</p>
          </div>

          <div className="p-4">
            {submitted ? (
              <div className="py-6 text-center">
                <p className="text-[var(--primary)] font-medium">Thanks for reaching out!</p>
                <p className="mt-1 text-sm text-[var(--primary)]/80">
                  We&apos;ll contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-4 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white hover:opacity-90"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="chatbot-name" className="mb-1 block text-sm font-medium text-[var(--primary)]">
                    Name *
                  </label>
                  <input
                    id="chatbot-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--primary)]/30 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="chatbot-phone" className="mb-1 block text-sm font-medium text-[var(--primary)]">
                    Phone *
                  </label>
                  <input
                    id="chatbot-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--primary)]/30 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="Your phone"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="chatbot-product" className="mb-1 block text-sm font-medium text-[var(--primary)]">
                    Type of product required *
                  </label>
                  <select
                    id="chatbot-product"
                    value={form.productTypeRequired}
                    onChange={(e) => setForm((f) => ({ ...f, productTypeRequired: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--primary)]/30 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    required
                  >
                    <option value="">Select...</option>
                    {CHATBOT_PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="chatbot-message" className="mb-1 block text-sm font-medium text-[var(--primary)]">
                    Message (optional)
                  </label>
                  <textarea
                    id="chatbot-message"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-[var(--primary)]/30 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="Any specific requirements?"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
