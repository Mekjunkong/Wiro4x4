import { ArrowRight, BadgeCheck, CheckCircle2, Users } from "lucide-react";

type Translation = (english: string, hebrew: string) => string;

type AttributionSource = {
  sourceCode: string;
  sourceChannel: string;
  leads: number;
  confirmed: number;
  completed: number;
  leadToConfirmedRate: number;
  confirmedToCompletedRate: number;
  estimatedConfirmedValueThb: number;
};

type AttributionReport = {
  summary: {
    leads: number;
    confirmed: number;
    completed: number;
    leadToConfirmedRate: number;
    confirmedToCompletedRate: number;
    estimatedConfirmedValueThb: number;
  };
  sources: AttributionSource[];
  lossReasons: { reason: string; count: number }[];
};

function formatThb(value: number) {
  return `${value.toLocaleString("en-US")} THB`;
}

function formatRate(rate: number, denominator: number) {
  return denominator === 0 ? "—" : `${rate.toLocaleString("en-US")}%`;
}

function displayDimension(value: string, t: Translation) {
  return value === "Unknown" ? t("Unknown", "לא ידוע") : value;
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
          {detail && (
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          )}
        </div>
        <span className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function SourceChart({
  sources,
  t,
}: {
  sources: AttributionSource[];
  t: Translation;
}) {
  const maxLeads = Math.max(...sources.map(source => source.leads), 1);

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">
        {t("Source comparison", "השוואת מקורות")}
      </h4>
      <ul
        className="mt-4 space-y-4"
        aria-label={t(
          "Lead, confirmed, and completed totals by source",
          "סך הלידים, המאושרים וההשלמות לפי מקור"
        )}
      >
        {sources.map(source => (
          <li key={`${source.sourceCode}:${source.sourceChannel}`}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-medium text-foreground">
                {displayDimension(source.sourceCode, t)}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {source.leads} {t("leads", "לידים")}
              </span>
            </div>
            <div
              className="relative h-3 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`${displayDimension(source.sourceCode, t)}: ${source.leads} ${t("leads", "לידים")}, ${source.confirmed} ${t("Confirmed", "מאושרים")}, ${source.completed} ${t("Completed", "הושלמו")}`}
            >
              <div
                className="absolute inset-y-0 start-0 rounded-full bg-primary/25"
                style={{ width: `${(source.leads / maxLeads) * 100}%` }}
              />
              <div
                className="absolute inset-y-0 start-0 rounded-full bg-primary/60"
                style={{ width: `${(source.confirmed / maxLeads) * 100}%` }}
              />
              <div
                className="absolute inset-y-0 start-0 rounded-full bg-primary"
                style={{ width: `${(source.completed / maxLeads) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
          {t("Leads", "לידים")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
          {t("Confirmed", "מאושרים")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          {t("Completed", "הושלמו")}
        </span>
      </div>
    </div>
  );
}

export function AttributionAnalytics({
  report,
  t,
}: {
  report: AttributionReport;
  t: Translation;
}) {
  const { summary, sources, lossReasons } = report;
  const maxLossCount = Math.max(...lossReasons.map(reason => reason.count), 1);

  return (
    <section
      className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-6"
      aria-labelledby="attribution-heading"
    >
      <div className="flex flex-col gap-1">
        <h3
          id="attribution-heading"
          className="text-base font-semibold text-foreground"
        >
          {t("Lead attribution", "שיוך לידים")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(
            "Track which sources produce confirmed leads and completed tours.",
            "מעקב אחר המקורות שמייצרים לידים מאושרים וטיולים שהושלמו."
          )}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label={t("Leads", "לידים")}
          value={summary.leads}
          icon={Users}
        />
        <SummaryCard
          label={t("Confirmed", "מאושרים")}
          value={summary.confirmed}
          detail={formatRate(summary.leadToConfirmedRate, summary.leads)}
          icon={BadgeCheck}
        />
        <SummaryCard
          label={t("Completed", "הושלמו")}
          value={summary.completed}
          detail={formatRate(
            summary.confirmedToCompletedRate,
            summary.confirmed
          )}
          icon={CheckCircle2}
        />
        <SummaryCard
          label={t("Estimated confirmed value (THB)", "שווי מאושר משוער (באט)")}
          value={formatThb(summary.estimatedConfirmedValueThb)}
          icon={BadgeCheck}
        />
      </div>

      {sources.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            {t("No attributed leads yet", "אין עדיין לידים משויכים")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              "Add or update leads to see source performance here.",
              "הוסיפו או עדכנו לידים כדי לראות כאן את ביצועי המקורות."
            )}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)]">
          <SourceChart sources={sources} t={t} />

          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground">
              {t("Source details", "פרטי מקור")}
            </h4>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[880px] text-start text-sm">
                <caption className="sr-only">
                  {t(
                    "Lead attribution outcomes and estimated confirmed value by source",
                    "תוצאות שיוך לידים ושווי מאושר משוער לפי מקור"
                  )}
                </caption>
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 text-start">
                      {t("Source / channel", "מקור / ערוץ")}
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-end">
                      {t("Leads", "לידים")}
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-end">
                      {t("Confirmed", "מאושרים")}
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-end">
                      {t("Completed", "הושלמו")}
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-end">
                      {t("Lead to confirmed", "מליד למאושר")}
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-end">
                      {t("Confirmed to completed", "ממאושר להושלם")}
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-end">
                      {t(
                        "Estimated confirmed value (THB)",
                        "שווי מאושר משוער (באט)"
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sources.map(source => (
                    <tr
                      key={`${source.sourceCode}:${source.sourceChannel}`}
                      className="bg-card"
                    >
                      <th
                        scope="row"
                        className="px-3 py-3 text-start font-medium text-foreground"
                      >
                        <span className="block font-mono text-xs">
                          {displayDimension(source.sourceCode, t)}
                        </span>
                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                          {displayDimension(source.sourceChannel, t)}
                        </span>
                      </th>
                      <td className="px-3 py-3 text-end tabular-nums">
                        {source.leads}
                      </td>
                      <td className="px-3 py-3 text-end tabular-nums">
                        {source.confirmed}
                      </td>
                      <td className="px-3 py-3 text-end tabular-nums">
                        {source.completed}
                      </td>
                      <td className="px-3 py-3 text-end tabular-nums">
                        {formatRate(source.leadToConfirmedRate, source.leads)}
                      </td>
                      <td className="px-3 py-3 text-end tabular-nums">
                        {formatRate(
                          source.confirmedToCompletedRate,
                          source.confirmed
                        )}
                      </td>
                      <td className="px-3 py-3 text-end font-medium tabular-nums">
                        {formatThb(source.estimatedConfirmedValueThb)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-border pt-5">
        <h4 className="text-sm font-semibold text-foreground">
          {t("Loss reasons", "סיבות לאובדן")}
        </h4>
        {lossReasons.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {t("No lost leads yet", "אין עדיין לידים שאבדו")}
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {lossReasons.map(reason => (
              <li
                key={reason.reason}
                className="rounded-lg border border-border bg-background/70 p-3"
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span
                    className="truncate text-foreground"
                    title={reason.reason}
                  >
                    {displayDimension(reason.reason, t)}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 font-semibold tabular-nums">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    {reason.count}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-destructive/65"
                    style={{ width: `${(reason.count / maxLossCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
