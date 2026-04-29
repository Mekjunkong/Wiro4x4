import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Settings,
  Mail,
  Globe,
  Thermometer,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ── Seasonal Pricing Types ──────────────────────────────────────────────────

interface SeasonalRule {
  id: string;
  name: string;
  nameHe: string;
  type: "fixed_dates" | "month_range";
  startDate?: string;
  endDate?: string;
  startMonth?: number;
  endMonth?: number;
  multiplier: number;
  enabled: boolean;
}

const DEFAULT_SEASONAL_RULES: SeasonalRule[] = [
  {
    id: "passover",
    name: "Passover (Peak)",
    nameHe: "פסח (עונת שיא)",
    type: "fixed_dates",
    startDate: "04-05",
    endDate: "04-13",
    multiplier: 1.25,
    enabled: true,
  },
  {
    id: "sukkot",
    name: "Sukkot (Peak)",
    nameHe: "סוכות (עונת שיא)",
    type: "fixed_dates",
    startDate: "10-02",
    endDate: "10-09",
    multiplier: 1.25,
    enabled: true,
  },
  {
    id: "high_season",
    name: "High Season (Nov–Feb)",
    nameHe: "עונה גבוהה (נוב–פבר)",
    type: "month_range",
    startMonth: 11,
    endMonth: 2,
    multiplier: 1.2,
    enabled: true,
  },
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ── Component ────────────────────────────────────────────────────────────────

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

  const [seasonalRules, setSeasonalRules] = useState<SeasonalRule[]>(
    DEFAULT_SEASONAL_RULES
  );
  const [seasonalSaving, setSeasonalSaving] = useState(false);

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
      if (allSettings.seasonal_pricing_rules) {
        try {
          const parsed = allSettings.seasonal_pricing_rules as SeasonalRule[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSeasonalRules(parsed);
          }
        } catch {
          // keep defaults
        }
      }
    }
  }, [allSettings]);

  function saveSection(entries: Record<string, unknown>) {
    Promise.all(
      Object.entries(entries).map(([key, value]) =>
        updateSetting.mutateAsync({ key, value })
      )
    );
  }

  async function saveSeasonalRules() {
    setSeasonalSaving(true);
    try {
      await updateSetting.mutateAsync({
        key: "seasonal_pricing_rules",
        value: seasonalRules,
      });
      toast.success(
        "Seasonal pricing rules saved! Changes take effect immediately."
      );
    } catch {
      toast.error("Failed to save seasonal pricing rules");
    } finally {
      setSeasonalSaving(false);
    }
  }

  function updateRule(id: string, changes: Partial<SeasonalRule>) {
    setSeasonalRules(prev =>
      prev.map(r => (r.id === id ? { ...r, ...changes } : r))
    );
  }

  function deleteRule(id: string) {
    if (["passover", "sukkot", "high_season"].includes(id)) {
      toast.error("Cannot delete built-in rules. Disable them instead.");
      return;
    }
    setSeasonalRules(prev => prev.filter(r => r.id !== id));
  }

  function addRule() {
    const newRule: SeasonalRule = {
      id: `custom_${Date.now()}`,
      name: "New Season",
      nameHe: "עונה חדשה",
      type: "fixed_dates",
      startDate: "01-01",
      endDate: "01-07",
      multiplier: 1.1,
      enabled: true,
    };
    setSeasonalRules(prev => [...prev, newRule]);
  }

  function resetToDefaults() {
    if (confirm("Reset all seasonal pricing rules to defaults?")) {
      setSeasonalRules(DEFAULT_SEASONAL_RULES);
      toast.info("Rules reset. Click Save to apply.");
    }
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

      {/* Seasonal Pricing */}
      <section className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Seasonal Pricing</h2>
          </div>
          <button
            onClick={resetToDefaults}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Reset to defaults
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Configure price multipliers for peak seasons. Saved to the database —
          no code deployment needed. Customers will see the surcharge clearly
          labelled in the price breakdown.
        </p>

        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-5 text-sm text-amber-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Multipliers apply to the tour subtotal. <strong>1.25</strong> = +25%
            surcharge. The highest-multiplier season wins when dates overlap.
            The customer sees the surcharge as a named line item in the price
            breakdown.
          </span>
        </div>

        <div className="space-y-4">
          {seasonalRules.map(rule => (
            <div
              key={rule.id}
              className={`border rounded-lg p-4 transition-colors ${
                rule.enabled
                  ? "border-gray-200 bg-gray-50"
                  : "border-gray-100 bg-gray-50/50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    onClick={() =>
                      updateRule(rule.id, { enabled: !rule.enabled })
                    }
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${rule.enabled ? "bg-green-500" : "bg-gray-300"}`}
                    title={rule.enabled ? "Disable" : "Enable"}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.enabled ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={rule.name}
                      onChange={e =>
                        updateRule(rule.id, { name: e.target.value })
                      }
                      className="text-sm font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none w-full"
                      placeholder="Season name (English)"
                    />
                    <input
                      type="text"
                      value={rule.nameHe}
                      onChange={e =>
                        updateRule(rule.id, { nameHe: e.target.value })
                      }
                      className="text-xs text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none w-full mt-0.5"
                      placeholder="שם העונה (עברית)"
                      dir="rtl"
                    />
                  </div>
                </div>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Type
                  </label>
                  <select
                    value={rule.type}
                    onChange={e =>
                      updateRule(rule.id, {
                        type: e.target.value as SeasonalRule["type"],
                      })
                    }
                    className="w-full border rounded px-2 py-1.5 text-sm"
                  >
                    <option value="fixed_dates">Fixed dates (MM-DD)</option>
                    <option value="month_range">Month range</option>
                  </select>
                </div>

                {rule.type === "fixed_dates" ? (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Start (MM-DD)
                      </label>
                      <input
                        type="text"
                        value={rule.startDate ?? ""}
                        onChange={e =>
                          updateRule(rule.id, { startDate: e.target.value })
                        }
                        placeholder="04-05"
                        className="w-full border rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        End (MM-DD)
                      </label>
                      <input
                        type="text"
                        value={rule.endDate ?? ""}
                        onChange={e =>
                          updateRule(rule.id, { endDate: e.target.value })
                        }
                        placeholder="04-13"
                        className="w-full border rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Start month
                      </label>
                      <select
                        value={rule.startMonth ?? 1}
                        onChange={e =>
                          updateRule(rule.id, {
                            startMonth: Number(e.target.value),
                          })
                        }
                        className="w-full border rounded px-2 py-1.5 text-sm"
                      >
                        {MONTH_NAMES.map((m, i) => (
                          <option key={m} value={i + 1}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        End month
                      </label>
                      <select
                        value={rule.endMonth ?? 12}
                        onChange={e =>
                          updateRule(rule.id, {
                            endMonth: Number(e.target.value),
                          })
                        }
                        className="w-full border rounded px-2 py-1.5 text-sm"
                      >
                        {MONTH_NAMES.map((m, i) => (
                          <option key={m} value={i + 1}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs font-medium text-gray-500 flex-shrink-0">
                  Price multiplier
                </label>
                <input
                  type="number"
                  value={rule.multiplier}
                  onChange={e =>
                    updateRule(rule.id, {
                      multiplier: parseFloat(e.target.value) || 1,
                    })
                  }
                  step="0.05"
                  min="1"
                  max="3"
                  className="w-24 border rounded px-2 py-1 text-sm text-center"
                />
                <span className="text-sm text-gray-500">
                  = +{Math.round((rule.multiplier - 1) * 100)}% surcharge
                </span>
                <span
                  className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                    rule.multiplier >= 1.25
                      ? "bg-purple-100 text-purple-700"
                      : rule.multiplier >= 1.15
                        ? "bg-orange-100 text-orange-700"
                        : rule.multiplier > 1
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {rule.multiplier >= 1.25
                    ? "Peak"
                    : rule.multiplier >= 1.15
                      ? "High"
                      : rule.multiplier > 1
                        ? "Moderate"
                        : "Standard"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={addRule}
            className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add custom season
          </button>
          <button
            onClick={saveSeasonalRules}
            disabled={seasonalSaving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm ml-auto"
          >
            {seasonalSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Seasonal Pricing
          </button>
        </div>
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
                className={`w-12 h-6 rounded-full transition-colors relative ${(allSettings?.[item.key] ?? true) ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(allSettings?.[item.key] ?? true) ? "translate-x-6" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
