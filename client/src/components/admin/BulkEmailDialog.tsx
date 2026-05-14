import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BulkEmailDialogProps {
  open: boolean;
  onClose: () => void;
  bookingIds: number[];
  recipientCount: number;
}

export function BulkEmailDialog({
  open,
  onClose,
  bookingIds,
  recipientCount,
}: BulkEmailDialogProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const bulkEmail = trpc.booking.bulkEmail.useMutation({
    onSuccess: data => {
      toast.success(
        `Sent ${data.sent} emails${data.failed ? `, ${data.failed} failed` : ""}`
      );
      onClose();
      setSubject("");
      setMessage("");
    },
    onError: () => toast.error("Failed to send emails"),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-primary/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">
            Send Email to {recipientCount} Customer
            {recipientCount !== 1 ? "s" : ""}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g., Important Update About Your Tour"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={6}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Your message to customers..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => bulkEmail.mutate({ bookingIds, subject, message })}
            disabled={!subject || !message || bulkEmail.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {bulkEmail.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
