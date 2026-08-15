/**
 * FoodWise Health design reminder: Editorial Functionalism, a warm kitchen decision rail,
 * fast first answers, and transparent uncertainty. Never present a diagnosis.
 */

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronRight,
  CircleAlert,
  Droplets,
  ExternalLink,
  HeartPulse,
  Info,
  Leaf,
  Search,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import { FoodStatus, evaluateFoodForGout } from "@/lib/foodAdvisor";

const QUICK_FOODS = ["เต้าหู้", "หมูย่าง", "กุ้งเผา", "เบียร์", "ผักโขม"];

const statusStyles: Record<
  FoodStatus,
  { band: string; dot: string; title: string; texture: string; icon: typeof ShieldCheck }
> = {
  ok: {
    band: "bg-[oklch(0.35_0.07_145)] text-[oklch(0.97_0.015_100)]",
    dot: "bg-[oklch(0.78_0.12_145)]",
    title: "เลือกต่อได้",
    texture: "state-texture-ok",
    icon: ShieldCheck,
  },
  limit: {
    band: "bg-[oklch(0.68_0.115_75)] text-[oklch(0.20_0.025_70)]",
    dot: "bg-[oklch(0.47_0.10_70)]",
    title: "วางแผนปริมาณ",
    texture: "state-texture-limit",
    icon: CircleAlert,
  },
  avoid: {
    band: "bg-[oklch(0.49_0.14_31)] text-[oklch(0.985_0.01_75)]",
    dot: "bg-[oklch(0.82_0.13_35)]",
    title: "หยุดไว้ก่อน",
    texture: "state-texture-avoid",
    icon: CircleAlert,
  },
  "needs-review": {
    band: "bg-[oklch(0.33_0.035_78)] text-[oklch(0.97_0.015_90)]",
    dot: "bg-[oklch(0.74_0.09_80)]",
    title: "ดูสูตรก่อนตัดสินใจ",
    texture: "state-texture-review",
    icon: Info,
  },
};

function StateStamp({ status }: { status: "ok" | "limit" | "avoid" }) {
  const style = statusStyles[status];
  const Icon = status === "ok" ? Check : CircleAlert;
  const description =
    status === "ok" ? "กินได้" : status === "limit" ? "ควรจำกัด" : "ไม่ควรกินเลย";

  return (
    <div className={`state-stamp ${style.band} ${style.texture}`}>
      <span className="state-stamp-icon"><Icon className="h-3.5 w-3.5" aria-hidden="true" /></span>
      <span>{description}</span>
    </div>
  );
}

function nextChoice(status: FoodStatus) {
  if (status === "avoid") {
    return ["เต้าหู้ย่าง", "โยเกิร์ตไขมันต่ำ", "ข้าวกล้องกับผัก"];
  }
  if (status === "limit") {
    return ["เต้าหู้", "อกไก่ไม่ติดหนัง", "ผักหลากสี"];
  }
  if (status === "needs-review") {
    return ["ดูแหล่งโปรตีน", "เช็กน้ำตาลเติม", "เช็กวิธีปรุง"];
  }
  return ["ดื่มน้ำให้พอ", "เลือกแบบไม่หวาน", "กินให้หลากหลาย"];
}

export default function Home() {
  const [foodName, setFoodName] = useState("ตับหมู");
  const [isFlare, setIsFlare] = useState(false);
  const [additionalContext, setAdditionalContext] = useState("");
  const [submittedFood, setSubmittedFood] = useState("ตับหมู");

  const verdict = useMemo(
    () => evaluateFoodForGout({ foodName: submittedFood, isFlare }),
    [submittedFood, isFlare],
  );
  const visual = statusStyles[verdict.status];
  const StatusIcon = visual.icon;

  function checkFood(nextFood = foodName) {
    const trimmedFood = nextFood.trim();
    if (trimmedFood) {
      setSubmittedFood(trimmedFood);
      setFoodName(trimmedFood);
    }
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[oklch(0.97_0.012_88)] text-[oklch(0.25_0.028_78)]">
      <header className="border-b-2 border-[oklch(0.41_0.075_138)] bg-[oklch(0.975_0.012_88/0.92)] backdrop-blur-md">
        <div className="mx-auto flex min-h-24 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a className="group flex items-center gap-3" href="#top" aria-label="FoodWise Health หน้าแรก">
            <span className="relative grid h-14 w-14 place-items-center overflow-visible rounded-full bg-[oklch(0.41_0.075_138)] shadow-[0_8px_24px_oklch(0.33_0.07_138/0.25)] transition-transform duration-200 group-hover:-rotate-6">
              <img
                src="/foodwise-assets/foodwise-mark.png"
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
              <span aria-hidden="true" className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-[oklch(0.975_0.012_88)] bg-[oklch(0.72_0.115_75)] font-serif text-xs font-bold text-[oklch(0.27_0.038_82)]">?</span>
            </span>
            <span className="leading-none">
              <span className="block font-serif text-[1.45rem] font-bold tracking-[-0.05em]">FoodWise</span>
              <span className="mt-1 block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[oklch(0.45_0.06_138)]">health guide · ถามก่อนกิน</span>
            </span>
          </a>
          <div className="hidden items-center gap-2 border-b border-dotted border-[oklch(0.45_0.06_138)] pb-1 text-sm text-[oklch(0.42_0.027_78)] sm:flex">
            <BookOpenCheck className="h-4 w-4 text-[oklch(0.42_0.075_138)]" aria-hidden="true" />
            <span>คำตอบมีเหตุผลอธิบายได้</span>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative isolate border-b border-[oklch(0.84_0.018_85)] bg-[oklch(0.925_0.035_99)]">
          <div className="absolute inset-y-0 right-0 hidden w-[54%] overflow-hidden lg:block">
            <img
              src="/foodwise-assets/foodwise-hero.jpg"
              alt="ข้าวกล้อง เต้าหู้ ผัก และอาหารเพื่อสุขภาพบนโต๊ะไม้"
              className="hero-art h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.925_0.035_99)_0%,oklch(0.925_0.035_99/0.85)_18%,transparent_64%)]" />
          </div>
          <div className="relative mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-2 text-sm font-bold text-[oklch(0.41_0.075_138)]">
                <span className="h-px w-8 bg-current" />
                <span>รู้ก่อนเลือกอาหาร</span>
              </div>
              <h1 className="max-w-xl font-serif text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-[oklch(0.235_0.035_78)] sm:text-5xl lg:text-6xl">
                กินจานนี้ได้ไหม
                <span className="block italic text-[oklch(0.41_0.075_138)]">เมื่อคุณเป็นเกาต์</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[oklch(0.38_0.027_78)] sm:text-lg">
                เริ่มจากอาหารที่อยู่ตรงหน้า แล้วอ่านคำแนะนำที่ชัดเจนพร้อมเหตุผลและข้อควรระวังเฉพาะบริบทของคุณ
              </p>
              <div className="mt-8 inline-flex items-center gap-3 border-y border-[oklch(0.72_0.05_96)] py-3 text-sm text-[oklch(0.38_0.027_78)]">
                <HeartPulse className="h-5 w-5 text-[oklch(0.49_0.14_31)]" aria-hidden="true" />
                <span>ข้อมูลช่วยตัดสินใจ ไม่ใช่การวินิจฉัยหรือแผนรักษา</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
          <div className="lg:grid lg:grid-cols-[minmax(265px,0.72fr)_minmax(0,1.7fr)] lg:gap-12">
            <aside className="mb-8 border-b border-[oklch(0.82_0.02_85)] pb-8 lg:sticky lg:top-5 lg:mb-0 lg:h-fit lg:border-b-0 lg:border-r lg:pr-10">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[oklch(0.45_0.06_138)]">โปรไฟล์วันนี้</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.88_0.06_145)] px-2.5 py-1 text-xs font-bold text-[oklch(0.33_0.07_145)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" /> กำลังใช้
                </span>
              </div>
              <h2 className="mt-3 font-serif text-2xl font-semibold tracking-[-0.035em]">ภาวะสุขภาพที่นำมาคิด</h2>

              <div className="notebook-divider mt-5 border-y border-[oklch(0.82_0.02_85)] py-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[oklch(0.41_0.075_138)] text-[oklch(0.97_0.015_100)]">
                    <HeartPulse className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-bold">โรคเกาต์</p>
                    <p className="mt-0.5 text-xs text-[oklch(0.46_0.025_78)]">เปิดกฎอาหารที่ผ่านการคัดแหล่งอ้างอิงแล้ว</p>
                  </div>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-5">
                <input
                  type="checkbox"
                  checked={isFlare}
                  onChange={(event) => setIsFlare(event.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-[oklch(0.5_0.03_85)] accent-[oklch(0.41_0.075_138)]"
                />
                <span>
                  <strong className="block">ตอนนี้กำลังมีอาการกำเริบ</strong>
                  <span className="mt-0.5 block text-[oklch(0.46_0.025_78)]">เพิ่มระดับความระวังให้กลุ่มอาหารที่มีความเสี่ยง</span>
                </span>
              </label>

              <label className="mt-6 block">
                <span className="text-sm font-bold">ภาวะหรือยาที่เกี่ยวข้อง</span>
                <textarea
                  value={additionalContext}
                  onChange={(event) => setAdditionalContext(event.target.value)}
                  className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[oklch(0.78_0.025_85)] bg-[oklch(0.99_0.008_90)] p-3 text-sm leading-5 outline-none transition focus:border-[oklch(0.41_0.075_138)] focus:ring-4 focus:ring-[oklch(0.41_0.075_138/0.12)]"
                  placeholder="เช่น โรคไต, เบาหวาน, ยาขับปัสสาวะ"
                />
              </label>
              {additionalContext.trim() ? (
                <p className="mt-2 text-xs leading-5 text-[oklch(0.46_0.025_78)]">
                  บันทึกบริบทแล้ว แต่คำตอบรุ่นนี้ยังประเมินจากเกาต์เป็นหลัก จึงไม่แทนคำแนะนำเฉพาะโรคร่วม
                </p>
              ) : null}

              <div className="notebook-divider mt-7 border-t border-dashed border-[oklch(0.72_0.035_86)] pt-5">
                <div className="flex gap-3">
                  <Droplets className="mt-0.5 h-5 w-5 shrink-0 text-[oklch(0.42_0.075_138)]" aria-hidden="true" />
                  <p className="text-sm leading-6 text-[oklch(0.40_0.027_78)]">
                    <strong className="text-[oklch(0.28_0.035_78)]">มองทั้งมื้อ ไม่ใช่แค่วัตถุดิบ</strong>
                    <br />น้ำตาลเติม เครื่องดื่มแอลกอฮอล์ และขนาดเสิร์ฟ อาจเปลี่ยนคำแนะนำได้
                  </p>
                </div>
              </div>
            </aside>

            <div className="pb-12 lg:pb-20">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[oklch(0.45_0.06_138)]">ตรวจอาหาร</p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">พิมพ์อาหารที่กำลังจะกิน</h2>
                </div>
                <span className="marker-note">คำตอบปรับทันทีเมื่อคุณตรวจรายการใหม่</span>
              </div>

              <form
                className="mt-6 flex flex-col gap-3 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  checkFood();
                }}
              >
                <label className="group relative flex min-h-15 flex-1 items-center border-b-2 border-[oklch(0.55_0.04_85)] bg-[oklch(0.99_0.008_90)] px-4 transition focus-within:border-[oklch(0.41_0.075_138)]">
                  <Search className="mr-3 h-5 w-5 shrink-0 text-[oklch(0.45_0.06_138)]" aria-hidden="true" />
                  <input
                    value={foodName}
                    onChange={(event) => setFoodName(event.target.value)}
                    className="w-full bg-transparent text-lg font-semibold outline-none placeholder:font-normal placeholder:text-[oklch(0.56_0.02_78)]"
                    placeholder="เช่น ตับหมู, เต้าหู้, กุ้งเผา"
                    aria-label="ชื่ออาหารที่ต้องการตรวจ"
                  />
                </label>
                <button className="inline-flex min-h-15 items-center justify-center gap-2 bg-[oklch(0.41_0.075_138)] px-6 text-base font-bold text-[oklch(0.97_0.015_100)] transition duration-200 hover:bg-[oklch(0.35_0.07_138)] active:scale-[0.98] sm:min-w-44" type="submit">
                  ดูคำแนะนำ <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-bold uppercase tracking-[0.13em] text-[oklch(0.48_0.03_78)]">ลองเช็ก</span>
                {QUICK_FOODS.map((food) => (
                  <button
                    className="rounded-full border border-[oklch(0.75_0.03_85)] bg-transparent px-3 py-1.5 text-sm transition hover:border-[oklch(0.41_0.075_138)] hover:bg-[oklch(0.91_0.04_143)]"
                    key={food}
                    onClick={() => checkFood(food)}
                    type="button"
                  >
                    {food}
                  </button>
                ))}
              </div>

              <div className="decision-rail mt-7">
                <div className="decision-rail-step">
                  <span>01</span>
                  <p><strong>อ่านบริบท</strong><br />เกาต์และช่วงกำเริบ</p>
                </div>
                <div className="decision-rail-step">
                  <span>02</span>
                  <p><strong>อ่านส่วนผสม</strong><br />พิวรีน น้ำตาล แอลกอฮอล์</p>
                </div>
                <div className="decision-rail-step">
                  <span>03</span>
                  <p><strong>ให้คำตอบ</strong><br />พร้อมเหตุผลและทางเลือก</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2" aria-label="ความหมายของสถานะคำแนะนำอาหาร">
                <span className="mr-1 self-center text-xs font-bold uppercase tracking-[0.13em] text-[oklch(0.48_0.03_78)]">สามระดับที่ใช้ตัดสินใจ</span>
                <StateStamp status="ok" />
                <StateStamp status="limit" />
                <StateStamp status="avoid" />
              </div>

              <section aria-live="polite" className="mt-8">
                <div className={`relative overflow-hidden ${visual.band} ${visual.texture} p-6 sm:p-8`}>
                  <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full border-[18px] border-current opacity-10" />
                  <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold opacity-85">
                        <span className={`h-2.5 w-2.5 rounded-full ${visual.dot}`} />
                        {visual.title}
                      </div>
                      <p className="mt-4 text-sm font-semibold opacity-85">สำหรับผู้ที่เป็นเกาต์</p>
                      <h3 className="mt-1 font-serif text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{verdict.label}</h3>
                      <p className="mt-4 max-w-xl text-base leading-7 opacity-95">{verdict.summary}</p>
                    </div>
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-current/30 bg-black/5">
                      <StatusIcon className="h-7 w-7" aria-hidden="true" />
                    </span>
                  </div>
                </div>

                <div className="notebook-divider border-b border-x border-[oklch(0.80_0.022_85)] bg-[oklch(0.985_0.009_88)]">
                  <div className="grid md:grid-cols-[1.25fr_0.9fr]">
                    <div className="p-6 sm:p-8">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[oklch(0.45_0.06_138)]">คำตอบนี้วัดจากอะไร</p>
                      <p className="mt-4 max-w-2xl text-base leading-7 text-[oklch(0.33_0.03_78)]">{verdict.reason}</p>
                      <p className="mt-5 border-l border-[oklch(0.53_0.08_82)] pl-4 text-sm font-semibold leading-6 text-[oklch(0.34_0.04_80)]">{verdict.servingGuidance}</p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {verdict.tags.map((tag) => (
                          <span className="rounded-full bg-[oklch(0.90_0.032_95)] px-3 py-1.5 text-xs font-bold text-[oklch(0.36_0.045_78)]" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-[oklch(0.82_0.022_85)] bg-[oklch(0.94_0.025_102)] p-6 sm:p-8 md:border-l md:border-t-0">
                      <div className="flex items-center gap-2 text-[oklch(0.38_0.07_138)]">
                        <Leaf className="h-5 w-5" aria-hidden="true" />
                        <p className="text-xs font-bold uppercase tracking-[0.16em]">เมื่อเลือกใหม่ได้</p>
                      </div>
                      <p className="mt-4 font-serif text-2xl font-semibold leading-tight tracking-[-0.035em]">ลองเลือกสิ่งเหล่านี้แทน</p>
                      <ul className="mt-5 space-y-3">
                        {nextChoice(verdict.status).map((choice, index) => (
                          <li className="flex items-center gap-3 text-sm" key={choice}>
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-[oklch(0.41_0.075_138)] text-xs font-bold text-[oklch(0.97_0.015_100)]">{index + 1}</span>
                            <span>{choice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-[oklch(0.82_0.022_85)] px-6 py-4 text-sm text-[oklch(0.45_0.027_78)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <span>ร่องรอยข้อมูล: Mayo Clinic, อัปเดต 2 เม.ย. 2025</span>
                    <a className="inline-flex items-center gap-1 font-bold text-[oklch(0.38_0.07_138)] hover:underline" href={verdict.sourceUrl} target="_blank" rel="noreferrer">
                      อ่านแหล่งอ้างอิง <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </section>

              <section className="notebook-divider mt-12 border-t border-[oklch(0.79_0.026_85)] pt-8">
                <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[oklch(0.45_0.06_138)]">เมื่อข้อมูลยังไม่พอ</p>
                    <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-[-0.045em]">อย่ารีบให้คำตอบ ถ้าสูตรอาหารยังไม่ชัด</h2>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-[oklch(0.43_0.027_78)]">
                      อาหารไม่คุ้นเคยจะไม่ถูกตีความว่า “กินได้” อัตโนมัติ ระบบจะชวนดูสูตรและส่วนผสมก่อน เพื่อป้องกันความมั่นใจเกินข้อมูล
                    </p>
                    <a className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[oklch(0.38_0.07_138)] hover:underline" href="#top">
                      กลับไปตรวจอาหารอื่น <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                  <div className="relative min-h-64 overflow-hidden bg-[oklch(0.90_0.035_98)]">
                    <img
                      src="/foodwise-assets/foodwise-kitchen-note.jpg"
                      alt="สมุดบันทึกอาหารและวัตถุดิบในครัว"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.90_0.035_98/0.92),transparent_68%)]" />
                    <div className="absolute inset-y-0 left-0 flex max-w-64 flex-col justify-center p-6 sm:p-8">
                      <Sparkles className="h-6 w-6 text-[oklch(0.41_0.075_138)]" aria-hidden="true" />
                      <p className="mt-3 font-serif text-xl font-semibold leading-tight">ความชัดเจนสำคัญกว่า “คำตอบเร็ว”</p>
                      <p className="mt-2 text-sm leading-5 text-[oklch(0.38_0.027_78)]">กฎใหม่ควรมาพร้อมผู้ตรวจทาน แหล่งอ้างอิง และวันที่ทบทวนข้อมูล</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="notebook-divider mt-12 flex flex-col gap-4 border-y border-[oklch(0.76_0.03_85)] py-6 sm:flex-row sm:items-start">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[oklch(0.84_0.055_35)] text-[oklch(0.42_0.10_31)]">
                  <CircleAlert className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="text-sm leading-6 text-[oklch(0.37_0.029_78)]">
                  <p className="font-bold">หยุดเช็กกับเว็บ และคุยกับผู้เชี่ยวชาญ</p>
                  <p className="mt-1">หากมีอาการปวดข้อบวมร้อนรุนแรง มีไข้ หรืออาการต่างจากเดิม ควรติดต่อบุคลากรทางการแพทย์โดยเร็ว อย่าใช้เว็บแอปนี้แทนการดูแลเร่งด่วน</p>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[oklch(0.27_0.038_82)] text-[oklch(0.94_0.018_95)]">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/foodwise-assets/foodwise-pantry.jpg"
              alt=""
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
          <div className="relative mx-auto flex max-w-[1440px] flex-col justify-between gap-8 px-5 py-12 sm:px-8 sm:py-14 lg:flex-row lg:items-end lg:px-12">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[oklch(0.78_0.09_145)]">ระบบที่จะต่อยอด</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">เริ่มจากเกาต์ แล้วเพิ่มโรคเฉพาะคนอย่างมีมาตรฐาน</h2>
              <p className="mt-4 text-sm leading-6 text-[oklch(0.83_0.018_95)]">โครงสร้างข้อมูลแยกโรค บริบท อาหาร เหตุผล ขนาดเสิร์ฟ แหล่งอ้างอิง และระดับความมั่นใจ จึงต่อยอดเป็นระบบตรวจทานโดยผู้เชี่ยวชาญได้โดยไม่ต้องรื้อหน้าจอหลัก</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-[oklch(0.88_0.035_95)]">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[oklch(0.78_0.12_145)]" />โรค</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[oklch(0.78_0.11_78)]" />อาหาร</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[oklch(0.77_0.13_35)]" />บริบท</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[oklch(0.88_0.02_95)]" />อ้างอิง</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[oklch(0.235_0.032_78)] text-[oklch(0.82_0.02_92)]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-7 text-xs sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <span>FoodWise Health, ต้นแบบคำแนะนำอาหารตามภาวะสุขภาพ</span>
          <span>ข้อมูลในหน้าเว็บนี้ไม่ใช่คำแนะนำทางการแพทย์เฉพาะบุคคล</span>
        </div>
      </footer>
    </div>
  );
}
