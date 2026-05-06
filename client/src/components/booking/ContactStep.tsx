import { User, MessageCircle } from "lucide-react";
import type { FormStepProps } from "./types";

export function ContactStep({
  formData,
  setFormData,
  formErrors,
  t,
}: FormStepProps) {
  return (
    <>
      {/* Contact Information Section */}
      <fieldset className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30">
        <legend className="text-xl md:text-2xl font-heading font-normal text-primary flex items-center gap-2 px-2">
          <User className="w-6 h-6" />
          {t("Customer Details", "פרטים אישיים")}
        </legend>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-4">
          <div>
            <label
              htmlFor="contactName"
              className="block text-sm font-medium mb-2"
            >
              {t("Customer Name", "שם מלא")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="contactName"
              type="text"
              placeholder={t("Full Name", "שם מלא")}
              value={formData.contactName}
              onChange={e =>
                setFormData(prev => ({ ...prev, contactName: e.target.value }))
              }
              className={`w-full px-4 py-3 md:py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation ${formErrors.contactName ? "border-red-500" : "border-border"}`}
              required
              aria-required="true"
              aria-invalid={!!formErrors.contactName}
              aria-describedby={
                formErrors.contactName ? "error-contactName" : undefined
              }
            />
            {formErrors.contactName && (
              <span
                id="error-contactName"
                className="text-red-500 text-sm mt-1 block"
                role="alert"
              >
                {formErrors.contactName}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="contactPhone"
              className="block text-sm font-medium mb-2"
            >
              {t("Phone Number", "מספר טלפון")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="contactPhone"
              type="tel"
              placeholder="+972-XX-XXX-XXXX"
              value={formData.contactPhone}
              onChange={e =>
                setFormData(prev => ({ ...prev, contactPhone: e.target.value }))
              }
              className={`w-full px-4 py-3 md:py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation ${formErrors.contactPhone ? "border-red-500" : "border-border"}`}
              required
              aria-required="true"
              aria-invalid={!!formErrors.contactPhone}
              aria-describedby={
                formErrors.contactPhone ? "error-contactPhone" : undefined
              }
            />
            {formErrors.contactPhone && (
              <span
                id="error-contactPhone"
                className="text-red-500 text-sm mt-1 block"
                role="alert"
              >
                {formErrors.contactPhone}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="contactEmail"
              className="block text-sm font-medium mb-2"
            >
              {t("Email", "מייל")}
            </label>
            <input
              id="contactEmail"
              type="email"
              placeholder="email@example.com"
              value={formData.contactEmail}
              onChange={e =>
                setFormData(prev => ({ ...prev, contactEmail: e.target.value }))
              }
              className={`w-full px-4 py-3 md:py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation ${formErrors.contactEmail ? "border-red-500" : "border-border"}`}
              aria-invalid={!!formErrors.contactEmail}
              aria-describedby={
                formErrors.contactEmail ? "error-contactEmail" : undefined
              }
            />
            {formErrors.contactEmail && (
              <span
                id="error-contactEmail"
                className="text-red-500 text-sm mt-1 block"
                role="alert"
              >
                {formErrors.contactEmail}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="contactWhatsApp"
              className="block text-sm font-medium mb-2"
            >
              {t("WhatsApp", "וואטסאפ")}
            </label>
            <input
              id="contactWhatsApp"
              type="tel"
              placeholder="+972-XX-XXX-XXXX"
              value={formData.contactWhatsApp}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  contactWhatsApp: e.target.value,
                }))
              }
              className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
            />
          </div>
        </div>
      </fieldset>

      {/* Agent Section */}
      <fieldset className="bg-card rounded-2xl p-6 shadow-lg border-2 border-dashed border-secondary/50 bg-secondary/5">
        <legend className="text-2xl font-heading font-normal text-secondary flex items-center gap-2 px-2">
          <User className="w-6 h-6" />
          {t("Agent Name", "שם סוכן")}
        </legend>

        <div className="mt-4">
          <label htmlFor="agentName" className="block text-sm font-medium mb-2">
            {t("Agent Name (if applicable)", "שם סוכן (אם יש)")}
          </label>
          <input
            id="agentName"
            type="text"
            placeholder={t("Your Name", "השם שלך")}
            value={formData.agentName}
            onChange={e =>
              setFormData(prev => ({ ...prev, agentName: e.target.value }))
            }
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
        </div>
      </fieldset>

      {/* Special Requests */}
      <fieldset className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30">
        <legend className="text-xl md:text-2xl font-heading font-normal text-primary flex items-center gap-2 px-2">
          <MessageCircle className="w-6 h-6" />
          {t("Special Requests", "בקשות מיוחדות")}
        </legend>

        <div className="mt-4">
          <label htmlFor="specialRequests" className="sr-only">
            {t("Special Requests", "בקשות מיוחדות")}
          </label>
          <textarea
            id="specialRequests"
            placeholder={t(
              "Add special requests, dietary restrictions, or additional notes...",
              "בקשות מיוחדות, מגבלות תזונתיות, הערות נוספות..."
            )}
            value={formData.specialRequests}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                specialRequests: e.target.value,
              }))
            }
            rows={4}
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>
      </fieldset>
    </>
  );
}
