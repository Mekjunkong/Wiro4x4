import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { MessageCircle, Clock, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function timeAgo(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AbandonedBookingsTab() {
  const { t } = useLanguage();
  const { data: drafts, refetch } = trpc.bookingDraft.listActive.useQuery();
  const updateStatus = trpc.bookingDraft.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(
        t(
          "Draft updated",
          "\u05D8\u05D9\u05D5\u05D8\u05D4 \u05E2\u05D5\u05D3\u05DB\u05E0\u05D4"
        )
      );
      refetch();
    },
  });
  const sendEmail = trpc.bookingDraft.sendRecoveryEmail.useMutation({
    onSuccess: ({ sent }) => {
      if (sent) {
        toast.success(
          t(
            "Recovery email sent",
            "\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05E9\u05D9\u05D7\u05D6\u05D5\u05E8 \u05E0\u05E9\u05DC\u05D7"
          )
        );
      } else {
        toast.error(
          t(
            "Failed to send email (API key may not be configured)",
            "\u05E9\u05DC\u05D9\u05D7\u05EA \u05D4\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05E0\u05DB\u05E9\u05DC\u05D4"
          )
        );
      }
    },
    onError: () => {
      toast.error(
        t(
          "Failed to send recovery email",
          "\u05E9\u05DC\u05D9\u05D7\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05E9\u05D9\u05D7\u05D6\u05D5\u05E8 \u05E0\u05DB\u05E9\u05DC\u05D4"
        )
      );
    },
  });

  if (!drafts || drafts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">
          {t(
            "No abandoned bookings",
            "\u05D0\u05D9\u05DF \u05D4\u05D6\u05DE\u05E0\u05D5\u05EA \u05E0\u05D8\u05D5\u05E9\u05D5\u05EA"
          )}
        </p>
        <p className="text-sm mt-1">
          {t(
            "Abandoned booking drafts will appear here",
            "\u05D8\u05D9\u05D5\u05D8\u05D5\u05EA \u05D4\u05D6\u05DE\u05E0\u05D4 \u05E0\u05D8\u05D5\u05E9\u05D5\u05EA \u05D9\u05D5\u05E4\u05D9\u05E2\u05D5 \u05DB\u05D0\u05DF"
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {t(
          "Abandoned Bookings",
          "\u05D4\u05D6\u05DE\u05E0\u05D5\u05EA \u05E0\u05D8\u05D5\u05E9\u05D5\u05EA"
        )}{" "}
        ({drafts.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-4">{t("Name", "\u05E9\u05DD")}</th>
              <th className="pb-2 pr-4">
                {t("Contact", "\u05E4\u05E8\u05D8\u05D9 \u05E7\u05E9\u05E8")}
              </th>
              <th className="pb-2 pr-4">
                {t("Tour", "\u05D8\u05D9\u05D5\u05DC")}
              </th>
              <th className="pb-2 pr-4">
                {t("Abandoned", "\u05E0\u05E0\u05D8\u05E9")}
              </th>
              <th className="pb-2">
                {t("Actions", "\u05E4\u05E2\u05D5\u05DC\u05D5\u05EA")}
              </th>
            </tr>
          </thead>
          <tbody>
            {drafts.map(draft => {
              const phone = draft.contactPhone?.replace(/[^+\d]/g, "");
              const followUpMessage = encodeURIComponent(
                `Hi ${draft.contactName || "there"}, you were looking at booking a tour with WIRO 4x4. Would you like help completing your reservation?`
              );
              const whatsappUrl = phone
                ? `https://wa.me/${phone}?text=${followUpMessage}`
                : null;

              return (
                <tr key={draft.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">
                    {draft.contactName ||
                      t(
                        "Anonymous",
                        "\u05D0\u05E0\u05D5\u05E0\u05D9\u05DE\u05D9"
                      )}
                  </td>
                  <td className="py-3 pr-4">
                    <div>{draft.contactEmail}</div>
                    <div className="text-muted-foreground">
                      {draft.contactPhone}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {draft.tourSlug ||
                      t(
                        "Not specified",
                        "\u05DC\u05D0 \u05E6\u05D5\u05D9\u05DF"
                      )}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {timeAgo(draft.createdAt)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline" className="gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {t(
                              "WhatsApp",
                              "\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4"
                            )}
                          </Button>
                        </a>
                      )}
                      {draft.contactEmail && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() =>
                            sendEmail.mutate({ draftId: draft.id })
                          }
                          disabled={sendEmail.isPending}
                        >
                          <Mail className="h-3 w-3" />
                          {t("Email", "\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-red-500 hover:text-red-700"
                        onClick={() =>
                          updateStatus.mutate({
                            id: draft.id,
                            status: "expired",
                          })
                        }
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="h-3 w-3" />
                        {t("Expire", "\u05EA\u05E4\u05D5\u05D2\u05D4")}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
