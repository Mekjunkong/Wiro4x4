import { useMemo, useState, type FormEvent } from "react";
import { MessageCircle, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  getWhatsAppSource,
  parseAttributionCapsule,
  WHATSAPP_SOURCES,
} from "@shared/whatsappAttribution";

type Props = { onCreated: () => void };

const controlClass =
  "min-h-[44px] w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium text-foreground">
      <span>
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}

export function WhatsAppLeadForm({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [capsule, setCapsule] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [interestedTours, setInterestedTours] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [estimatedValueThb, setEstimatedValueThb] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const parsed = useMemo(
    () => (capsule.trim() ? parseAttributionCapsule(capsule.trim()) : null),
    [capsule]
  );
  const fallback = useMemo(
    () => (sourceCode ? getWhatsAppSource(sourceCode) : undefined),
    [sourceCode]
  );
  const preview = parsed
    ? {
        sourceCode: parsed.sourceCode,
        channel: parsed.channel,
        language: getWhatsAppSource(parsed.sourceCode)?.language ?? null,
        landingPage: parsed.landingPath,
        utmSource: parsed.utmSource,
        utmMedium: parsed.utmMedium,
        utmCampaign: parsed.utmCampaign,
      }
    : fallback
      ? {
          sourceCode: fallback.code,
          channel: fallback.channelFallback,
          language: fallback.language,
          landingPage: null,
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
        }
      : null;

  const createLead = trpc.lead.createFromWhatsApp.useMutation({
    onSuccess: () => {
      setName("");
      setPhone("");
      setEmail("");
      setCapsule("");
      setSourceCode("");
      setInterestedTours("");
      setTravelDate("");
      setGroupSize("");
      setEstimatedValueThb("");
      setMessage("");
      setError("");
      setOpen(false);
      onCreated();
      toast.success("WhatsApp inquiry saved");
    },
    onError: mutationError => {
      setError(mutationError.message || "Could not save inquiry. Try again.");
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (createLead.isPending) return;
    if (capsule.trim() && !parsed) {
      setError("The attribution capsule is invalid. Check the pasted text.");
      return;
    }
    setError("");
    createLead.mutate({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      attributionCapsule: capsule.trim() || undefined,
      sourceCode: capsule.trim() ? undefined : sourceCode || undefined,
      interestedTours: interestedTours.trim() || undefined,
      travelDate: travelDate || undefined,
      groupSize: groupSize ? Number(groupSize) : undefined,
      estimatedValueThb: estimatedValueThb
        ? Number(estimatedValueThb)
        : undefined,
      message: message.trim() || undefined,
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#157347] px-4 text-sm font-semibold text-white transition hover:bg-[#11613b] focus:outline-none focus:ring-2 focus:ring-[#157347]/30"
      >
        <Plus className="h-4 w-4" />
        Add WhatsApp inquiry
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm"
      aria-label="Add WhatsApp inquiry"
      aria-busy={createLead.isPending}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-700 text-white">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-semibold">Add WhatsApp inquiry</h3>
            <p className="text-xs text-muted-foreground">
              Fast capture for inquiries received outside the website.
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close WhatsApp inquiry form"
          onClick={() => {
            if (!createLead.isPending) setOpen(false);
          }}
          disabled={createLead.isPending}
          className="grid min-h-[44px] min-w-[44px] place-items-center rounded-lg hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <fieldset disabled={createLead.isPending} className="contents">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Name or WhatsApp label" required>
            <input
              className={controlClass}
              value={name}
              onChange={event => setName(event.target.value)}
              required
            />
          </Field>
          <Field label="WhatsApp phone" required>
            <input
              className={controlClass}
              value={phone}
              onChange={event => setPhone(event.target.value)}
              inputMode="tel"
              required
            />
          </Field>
          <Field label="Email (optional)">
            <input
              className={controlClass}
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Manual source fallback">
            <select
              className={controlClass}
              value={sourceCode}
              onChange={event => {
                setSourceCode(event.target.value);
                if (event.target.value) setCapsule("");
              }}
            >
              <option value="">Unknown</option>
              {WHATSAPP_SOURCES.map(source => (
                <option key={source.code} value={source.code}>
                  {source.code}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2 lg:col-span-4">
            <Field label="Attribution capsule">
              <input
                className={controlClass}
                value={capsule}
                onChange={event => {
                  setCapsule(event.target.value);
                  if (event.target.value) setSourceCode("");
                }}
                placeholder="Paste [WIRO:v1|…] from the WhatsApp message"
              />
            </Field>
            {capsule.trim() && !parsed && (
              <p className="mt-1 text-xs text-red-700" role="alert">
                Capsule not recognized
              </p>
            )}
          </div>
        </div>

        <div
          className="my-3 rounded-lg border border-border/70 bg-background/80 p-3 text-xs"
          aria-label="Source preview"
        >
          <span className="font-semibold">Source preview:</span>{" "}
          <span>{preview?.sourceCode ?? "Unknown"}</span>
          <span className="mx-2 text-muted-foreground">·</span>
          <span>{preview?.channel ?? "Unknown"}</span>
          <span className="mx-2 text-muted-foreground">·</span>
          <span>{preview?.language?.toUpperCase() ?? "Unknown"}</span>
          <div className="mt-1 text-muted-foreground">
            Landing {preview?.landingPage ?? "Unknown"} · UTM source{" "}
            {preview?.utmSource ?? "Unknown"} · medium{" "}
            {preview?.utmMedium ?? "Unknown"} · campaign{" "}
            {preview?.utmCampaign ?? "Unknown"}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Tour interest">
            <input
              className={controlClass}
              value={interestedTours}
              onChange={event => setInterestedTours(event.target.value)}
            />
          </Field>
          <Field label="Travel date">
            <input
              className={controlClass}
              type="date"
              min="2020-01-01"
              max="2100-12-31"
              value={travelDate}
              onChange={event => setTravelDate(event.target.value)}
            />
          </Field>
          <Field label="Group size">
            <input
              className={controlClass}
              type="number"
              inputMode="numeric"
              min={1}
              max={200}
              value={groupSize}
              onChange={event => setGroupSize(event.target.value)}
            />
          </Field>
          <Field label="Estimated value (THB)">
            <input
              className={controlClass}
              type="number"
              inputMode="numeric"
              min={0}
              max={2_147_483_647}
              step={1}
              value={estimatedValueThb}
              onChange={event => setEstimatedValueThb(event.target.value)}
            />
          </Field>
          <div className="sm:col-span-2 lg:col-span-4">
            <Field label="Notes">
              <textarea
                className={`${controlClass} min-h-[72px] py-2`}
                value={message}
                maxLength={1000}
                onChange={event => setMessage(event.target.value)}
              />
            </Field>
          </div>
        </div>
      </fieldset>

      {error && (
        <p className="mt-3 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={createLead.isPending}
          className="min-h-[44px] rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createLead.isPending ? "Saving…" : "Save WhatsApp inquiry"}
        </button>
      </div>
    </form>
  );
}
