'use client';

import { jsPDF } from 'jspdf';
import type { Order } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileDown } from 'lucide-react';

type OrderInvoiceProps = {
  order: Order;
  className?: string;
};

function downloadInvoicePDF(order: Order) {
  const doc = new jsPDF();
  // jsPDF default is A4 (210mm). Access internal page size when available.
  const internal = (doc as unknown as { internal?: { pageSize: { width?: number; getWidth?: () => number } } }).internal;
  const pageW = internal?.pageSize?.getWidth?.() ?? internal?.pageSize?.width ?? 210;
  let y = 20;

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Golden Looms', pageW / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Invoice', pageW / 2, y, { align: 'center' });
  y += 16;

  // Order info
  doc.setFontSize(10);
  doc.text(`Order #${order._id.slice(-8)}`, 14, y);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, y + 6);
  doc.text(`Status: ${order.status}`, pageW - 14, y, { align: 'right' });
  doc.text(`Invoice date: ${new Date().toLocaleDateString()}`, pageW - 14, y + 6, { align: 'right' });
  y += 20;

  // Bill to
  doc.setFont('helvetica', 'bold');
  doc.text('Bill to', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.text(order.customerName, 14, y);
  y += 5;
  doc.text(order.email, 14, y);
  y += 5;
  doc.text(order.phone, 14, y);
  y += 5;
  doc.text(order.address, 14, y);
  y += 14;

  // Table header
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y, pageW - 28, 8, 'F');
  doc.text('Item', 18, y + 5.5);
  doc.text('Qty', 90, y + 5.5);
  doc.text('Unit price', 115, y + 5.5);
  doc.text('Amount', pageW - 24, y + 5.5, { align: 'right' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  for (const item of order.items) {
    const lineTotal = item.priceAtPurchase * item.qty;
    doc.text(item.name.substring(0, 45), 18, y + 5);
    doc.text(String(item.qty), 90, y + 5);
    doc.text(`₹${item.priceAtPurchase}`, 115, y + 5);
    doc.text(`₹${lineTotal}`, pageW - 24, y + 5, { align: 'right' });
    y += 8;
  }

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Total', 115, y + 5);
  doc.text(`₹${order.totalAmount}`, pageW - 24, y + 5, { align: 'right' });

  doc.save(`GoldenLooms-Invoice-${order._id.slice(-8)}.pdf`);
}

export function OrderInvoice({ order, className }: OrderInvoiceProps) {
  return (
    <Card className={className}>
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-primary/10 pb-6 mb-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-primary">Golden Looms</h2>
            <p className="text-sm text-primary/70 mt-0.5">Invoice</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono font-medium text-accent">Order #{order._id.slice(-8)}</p>
            <p className="text-primary/70">{new Date(order.createdAt).toLocaleString()}</p>
            <span className="inline-block mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/70 mb-2">Bill to</p>
            <p className="font-medium text-primary">{order.customerName}</p>
            <p className="text-sm text-primary/80">{order.email}</p>
            <p className="text-sm text-primary/80">{order.phone}</p>
            <p className="text-sm text-primary/80 mt-1">{order.address}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/20">
              <th className="text-left py-3 font-semibold text-primary">Item</th>
              <th className="text-right py-3 font-semibold text-primary w-16">Qty</th>
              <th className="text-right py-3 font-semibold text-primary w-24">Unit price</th>
              <th className="text-right py-3 font-semibold text-primary w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-primary/10">
                <td className="py-3 text-primary/90">{item.name}</td>
                <td className="py-3 text-right text-primary/80">{item.qty}</td>
                <td className="py-3 text-right text-primary/80">₹{item.priceAtPurchase}</td>
                <td className="py-3 text-right font-medium text-primary">₹{item.priceAtPurchase * item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4 flex-col items-end gap-1">
          {order.discountAmount != null && order.discountAmount > 0 && (
            <p className="text-sm text-primary/80">
              Discount{order.appliedCouponCode ? ` (${order.appliedCouponCode})` : ''}: −₹{order.discountAmount}
            </p>
          )}
          <p className="text-base font-semibold text-primary">
            Total: <span className="text-accent">₹{order.totalAmount}</span>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-primary/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadInvoicePDF(order)}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </Card>
  );
}
