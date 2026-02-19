import { useState, useEffect } from "react";
import { Save, Loader2, Settings, Mail, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function SettingsTab() {
  const utils = trpc.useUtils();
  const { data: allSettings, isLoading } = trpc.settings.getAll.useQuery();
  const updateSetting = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.getAll.invalidate();
      toast.success("Setting saved");
    },
    onError: () => toast.error("Failed to save setting"),
  });

  const [businessInfo, setBusinessInfo] = useState({
    whatsappNumber: "",
    businessEmail: "",
    businessHours: "",
  });

  const [emailTemplates, setEmailTemplates] = useState({
    confirmationTemplate: "",
    reminderTemplate: "",
    statusChangeTemplate: "",
  });

  // Initialize from server data
  useEffect(() => {
    if (allSettings) {
      setBusinessInfo({
        whatsappNumber: (allSettings.whatsappNumber as string) || "66929894495",
        businessEmail:
          (allSettings.businessEmail as string) || "wiro.adventures@gmail.com",
        businessHours:
          (allSettings.businessHours as string) || "Mon-Fri 9:00-18:00 ICT",
      });
      setEmailTemplates({
        confirmationTemplate:
          (allSettings.confirmationTemplate as string) || "",
        reminderTemplate: (allSettings.reminderTemplate as string) || "",
        statusChangeTemplate:
          (allSettings.statusChangeTemplate as string) || "",
      });
    }
  }, [allSettings]);

  function saveSection(entries: Record<string, unknown>) {
    Promise.all(
      Object.entries(entries).map(([key, value]) =>
        updateSetting.mutateAsync({ key, value })
      )
    );
  }

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-400">Loading settings...</div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Business Info */}
      <section className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Business Info</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">WhatsApp Number</label>
            <input
              type="text"
              value={businessInfo.whatsappNumber}
              onChange={e =>
                setBusinessInfo({
                  ...businessInfo,
                  whatsappNumber: e.target.value,
                })
              }
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Business Email</label>
            <input
              type="email"
              value={businessInfo.businessEmail}
              onChange={e =>
                setBusinessInfo({
                  ...businessInfo,
                  businessEmail: e.target.value,
                })
              }
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Business Hours</label>
            <input
              type="text"
              value={businessInfo.businessHours}
              onChange={e =>
                setBusinessInfo({
                  ...businessInfo,
                  businessHours: e.target.value,
                })
              }
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          onClick={() => saveSection(businessInfo)}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
          disabled={updateSetting.isPending}
        >
          {updateSetting.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Business Info
        </button>
      </section>

      {/* Email Templates */}
      <section className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Email Templates</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Use placeholders: {"{{customerName}}"}, {"{{tourDate}}"},{" "}
          {"{{status}}"}, {"{{bookingId}}"}
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Booking Confirmation</label>
            <textarea
              value={emailTemplates.confirmationTemplate}
              onChange={e =>
                setEmailTemplates({
                  ...emailTemplates,
                  confirmationTemplate: e.target.value,
                })
              }
              rows={4}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="Dear {{customerName}}, your booking #{{bookingId}} is confirmed for {{tourDate}}..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Booking Reminder</label>
            <textarea
              value={emailTemplates.reminderTemplate}
              onChange={e =>
                setEmailTemplates({
                  ...emailTemplates,
                  reminderTemplate: e.target.value,
                })
              }
              rows={4}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="Hi {{customerName}}, your tour is coming up on {{tourDate}}..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              Status Change Notification
            </label>
            <textarea
              value={emailTemplates.statusChangeTemplate}
              onChange={e =>
                setEmailTemplates({
                  ...emailTemplates,
                  statusChangeTemplate: e.target.value,
                })
              }
              rows={4}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="Hi {{customerName}}, your booking status has been updated to: {{status}}..."
            />
          </div>
        </div>
        <button
          onClick={() => saveSection(emailTemplates)}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          disabled={updateSetting.isPending}
        >
          {updateSetting.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Email Templates
        </button>
      </section>

      {/* Site Configuration */}
      <section className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">Site Configuration</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Toggle features on/off for the public website.
        </p>
        <div className="space-y-3">
          {[
            { key: "feature_blog", label: "Blog" },
            { key: "feature_reviews", label: "Customer Reviews" },
            { key: "feature_gallery", label: "Photo Gallery" },
            { key: "feature_chat", label: "Live Chat" },
            { key: "maintenance_mode", label: "Maintenance Mode" },
          ].map(item => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm font-medium">{item.label}</span>
              <button
                onClick={() =>
                  updateSetting.mutate({
                    key: item.key,
                    value: !(allSettings?.[item.key] ?? true),
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  (allSettings?.[item.key] ?? true)
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    (allSettings?.[item.key] ?? true)
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
