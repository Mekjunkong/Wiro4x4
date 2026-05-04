import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Mail, Send, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function PostTourEmailsTab() {
  const [previewBookingId, setPreviewBookingId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const utils = trpc.useUtils();

  const { data: eligible, isLoading } =
    trpc.postTourEmail.findEligible.useQuery();

  const { data: previewData, isLoading: previewLoading } =
    trpc.postTourEmail.preview.useQuery(
      { bookingId: previewBookingId! },
      { enabled: !!previewBookingId && showPreview }
    );

  const sendOne = trpc.postTourEmail.send.useMutation({
    onSuccess: () => {
      void utils.postTourEmail.findEligible.invalidate();
      void utils.postTourEmail.eligibleCount.invalidate();
    },
  });

  const sendBatch = trpc.postTourEmail.sendBatch.useMutation({
    onSuccess: () => {
      void utils.postTourEmail.findEligible.invalidate();
      void utils.postTourEmail.eligibleCount.invalidate();
    },
  });

  const handlePreview = (bookingId: number) => {
    setPreviewBookingId(bookingId);
    setShowPreview(true);
  };

  const handleSendOne = (bookingId: number) => {
    if (window.confirm("Send post-tour follow-up email to this customer?")) {
      sendOne.mutate({ bookingId });
    }
  };

  const handleSendAll = () => {
    const count = eligible?.total ?? 0;
    if (
      window.confirm(
        `Send post-tour follow-up emails to ${Math.min(count, 10)} eligible bookings? (max 10 per batch)`
      )
    ) {
      sendBatch.mutate();
    }
  };

  return (
    <div className="bg-card rounded-sm border">
      <div className="p-4 md:p-6 border-b">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">
                Post-Tour Follow-up Emails
              </h2>
              <p className="text-sm text-muted-foreground">
                Automatically send "How was your trip?" emails 2 days after tour
                completion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(eligible?.total ?? 0) > 0 && (
              <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                {eligible?.total} eligible
              </span>
            )}
            <button
              onClick={handleSendAll}
              disabled={sendBatch.isPending || !eligible?.items?.length}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {sendBatch.isPending ? "Sending..." : "Send All Eligible"}
            </button>
          </div>
        </div>

        {/* Batch send results */}
        {sendBatch.isSuccess && sendBatch.data && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
            <CheckCircle className="w-4 h-4 text-green-600 inline mr-1" />
            Batch complete: {sendBatch.data.sent} sent, {sendBatch.data.failed}{" "}
            failed out of {sendBatch.data.eligible} eligible.
          </div>
        )}

        {sendBatch.isError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Error: {sendBatch.error.message}
          </div>
        )}
      </div>

      {/* Eligible bookings list */}
      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading eligible bookings...
          </div>
        ) : !eligible?.items?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm mt-1">
              No bookings are currently eligible for post-tour follow-up emails.
            </p>
            <p className="text-xs mt-2">
              Bookings become eligible 2 days after tour completion (status:
              completed).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-muted-foreground">
                    Booking
                  </th>
                  <th className="pb-2 font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="pb-2 font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="pb-2 font-medium text-muted-foreground">
                    Departure
                  </th>
                  <th className="pb-2 font-medium text-muted-foreground">
                    Album
                  </th>
                  <th className="pb-2 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {eligible.items.map(booking => (
                  <tr
                    key={booking.id}
                    className="border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="py-3 font-mono text-xs">#{booking.id}</td>
                    <td className="py-3">{booking.contactName}</td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {booking.contactEmail}
                    </td>
                    <td className="py-3 text-xs">
                      {booking.departureDate
                        ? new Date(booking.departureDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3">
                      {booking.hasAlbum ? (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Has Album
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No album
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {booking.postTourEmailSentAt ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Sent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-orange-600">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handlePreview(booking.id)}
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                          title="Preview email"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleSendOne(booking.id)}
                          disabled={
                            sendOne.isPending || !!booking.postTourEmailSentAt
                          }
                          className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-50"
                          title="Send email"
                        >
                          <Send className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewBookingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">
                Email Preview — Booking #{previewBookingId}
              </h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewBookingId(null);
                }}
                className="text-muted-foreground hover:text-foreground text-xl leading-none px-2"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {previewLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading preview...
                </div>
              ) : previewData ? (
                <div>
                  <div className="text-sm text-muted-foreground mb-3">
                    <strong>To:</strong> {previewData.to} |{" "}
                    <strong>Album:</strong>{" "}
                    {previewData.hasAlbum ? "Yes" : "No"}
                  </div>
                  <iframe
                    srcDoc={previewData.html}
                    sandbox=""
                    className="border rounded-lg overflow-hidden w-full min-h-[500px]"
                    title="Email preview"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-red-500">
                  Failed to load preview
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewBookingId(null);
                }}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSendOne(previewBookingId);
                  setShowPreview(false);
                  setPreviewBookingId(null);
                }}
                disabled={sendOne.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-3 h-3 inline mr-1" />
                Send This Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
