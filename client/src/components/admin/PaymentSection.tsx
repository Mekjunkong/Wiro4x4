import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CreditCard, Copy, RefreshCw, AlertTriangle } from "lucide-react";
import { DEPOSIT_RATE } from "@shared/pricing";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

const TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  balance: "Balance",
  full: "Full Payment",
  refund: "Refund",
};

interface PaymentSectionProps {
  bookingId: number;
  totalPrice: number | null;
  depositPaid: number | null;
  balancePaid: number | null;
}

export function PaymentSection({
  bookingId,
  totalPrice,
  depositPaid,
  balancePaid,
}: PaymentSectionProps) {
  const [refundPaymentId, setRefundPaymentId] = useState<number | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const { data: isConfiguredData } = trpc.payment.isConfigured.useQuery();
  const stripeConfigured = isConfiguredData?.configured ?? false;

  const {
    data: payments,
    isLoading,
    refetch: refetchPayments,
  } = trpc.payment.listByBooking.useQuery({ bookingId });

  const createCheckoutMut = trpc.payment.createCheckout.useMutation({
    onSuccess: data => {
      navigator.clipboard
        .writeText(data.url)
        .then(() => {
          toast.success("Payment link copied to clipboard!");
        })
        .catch(() => {
          toast.success("Payment link created! URL: " + data.url);
        });
      void refetchPayments();
    },
    onError: error => {
      toast.error(error.message || "Failed to create payment link");
    },
  });

  const refundMut = trpc.payment.refund.useMutation({
    onSuccess: () => {
      toast.success("Refund processed successfully!");
      setRefundPaymentId(null);
      setRefundAmount("");
      setRefundReason("");
      void refetchPayments();
    },
    onError: error => {
      toast.error(error.message || "Failed to process refund");
    },
  });

  const price = totalPrice ?? 0;
  const hasDeposit = depositPaid === 1;
  const hasBalance = balancePaid === 1;
  const completedPayments =
    payments?.filter(p => p.status === "completed" && p.type !== "refund") ??
    [];
  const totalPaidAmount = completedPayments.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const depositAmount = Math.round(price * DEPOSIT_RATE);
  const balanceAmount = price - depositAmount;

  const handleSendLink = (type: "deposit" | "balance" | "full") => {
    const amount =
      type === "deposit"
        ? depositAmount
        : type === "balance"
          ? balanceAmount
          : price;
    if (amount <= 0) {
      toast.error("Cannot create payment link: amount must be positive");
      return;
    }
    createCheckoutMut.mutate({ bookingId, amount, type });
  };

  const handleRefund = () => {
    if (!refundPaymentId) return;
    const amount = refundAmount ? Number(refundAmount) : undefined;
    if (
      refundAmount &&
      (isNaN(Number(refundAmount)) || Number(refundAmount) <= 0)
    ) {
      toast.error("Please enter a valid refund amount");
      return;
    }
    refundMut.mutate({
      paymentId: refundPaymentId,
      amount,
      reason: refundReason || undefined,
    });
  };

  return (
    <div className="mt-4 border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Payments
        </h4>
        <button
          onClick={() => refetchPayments()}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Payment progress */}
      {price > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Paid: {totalPaidAmount.toLocaleString()} THB</span>
            <span>Total: {price.toLocaleString()} THB</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (totalPaidAmount / price) * 100)}%`,
              }}
            />
          </div>
          <div className="flex gap-2 mt-1">
            {hasDeposit && (
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                Deposit Paid
              </span>
            )}
            {hasBalance && (
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                Balance Paid
              </span>
            )}
          </div>
        </div>
      )}

      {/* Payment actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {!stripeConfigured ? (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
            <AlertTriangle className="w-3.5 h-3.5" />
            Set STRIPE_SECRET_KEY to enable payments
          </div>
        ) : (
          <>
            {!hasDeposit && price > 0 && (
              <button
                onClick={() => handleSendLink("deposit")}
                disabled={createCheckoutMut.isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors min-h-[36px]"
              >
                <Copy className="w-3 h-3" />
                Deposit Link ({depositAmount.toLocaleString()} THB)
              </button>
            )}
            {hasDeposit && !hasBalance && price > 0 && (
              <button
                onClick={() => handleSendLink("balance")}
                disabled={createCheckoutMut.isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors min-h-[36px]"
              >
                <Copy className="w-3 h-3" />
                Balance Link ({balanceAmount.toLocaleString()} THB)
              </button>
            )}
            {!hasDeposit && !hasBalance && price > 0 && (
              <button
                onClick={() => handleSendLink("full")}
                disabled={createCheckoutMut.isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors min-h-[36px]"
              >
                <Copy className="w-3 h-3" />
                Full Payment Link ({price.toLocaleString()} THB)
              </button>
            )}
          </>
        )}
      </div>

      {/* Payment history */}
      {isLoading ? (
        <div className="space-y-2 py-2">
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
        </div>
      ) : payments && payments.length > 0 ? (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Payment History
          </h5>
          {payments.map(payment => (
            <div
              key={payment.id}
              className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PAYMENT_STATUS_COLORS[payment.status] || "bg-gray-100 text-gray-700"}`}
                >
                  {PAYMENT_STATUS_LABELS[payment.status] || payment.status}
                </span>
                <span className="font-medium">
                  {TYPE_LABELS[payment.type] || payment.type}
                </span>
                <span className="text-muted-foreground">
                  {payment.amount.toLocaleString()} THB
                </span>
              </div>
              <div className="flex items-center gap-2">
                {payment.paidAt && (
                  <span className="text-muted-foreground">
                    {new Date(payment.paidAt).toLocaleDateString()}
                  </span>
                )}
                {payment.status === "completed" &&
                  payment.type !== "refund" &&
                  stripeConfigured && (
                    <button
                      onClick={() => setRefundPaymentId(payment.id)}
                      className="text-red-500 hover:text-red-700 transition-colors text-[10px] underline"
                    >
                      Refund
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No payments yet</p>
      )}

      {/* Refund dialog */}
      {refundPaymentId !== null && (
        <div className="mt-3 p-3 border border-red-200 bg-red-50 rounded-lg">
          <h5 className="text-xs font-semibold text-red-700 mb-2">
            Issue Refund for Payment #{refundPaymentId}
          </h5>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Amount (leave blank for full refund)"
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
              className="w-full px-2 py-1.5 border border-red-200 rounded text-xs"
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={refundReason}
              onChange={e => setRefundReason(e.target.value)}
              className="w-full px-2 py-1.5 border border-red-200 rounded text-xs"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRefund}
                disabled={refundMut.isPending}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
              >
                {refundMut.isPending ? "Processing..." : "Confirm Refund"}
              </button>
              <button
                onClick={() => {
                  setRefundPaymentId(null);
                  setRefundAmount("");
                  setRefundReason("");
                }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
