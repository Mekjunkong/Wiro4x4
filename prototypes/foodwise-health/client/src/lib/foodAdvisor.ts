/**
 * FoodWise Health design reminder: the interface gives a clear first answer,
 * then shows the health rationale and uncertainty without presenting a diagnosis.
 */

export type FoodStatus = "ok" | "limit" | "avoid" | "needs-review";

export type FoodVerdict = {
  status: FoodStatus;
  label: "กินได้" | "ควรจำกัด" | "ไม่ควรกินเลย" | "ต้องดูส่วนผสมเพิ่ม";
  summary: string;
  reason: string;
  servingGuidance: string;
  tags: string[];
  isFlareSensitive: boolean;
  sourceUrl: string;
};

export type FoodQuery = {
  foodName: string;
  isFlare: boolean;
};

type FoodRule = Omit<FoodVerdict, "label"> & {
  keywords: string[];
};

const SOURCE_URL =
  "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/gout-diet/art-20048524";

const STATUS_LABEL: Record<FoodStatus, FoodVerdict["label"]> = {
  ok: "กินได้",
  limit: "ควรจำกัด",
  avoid: "ไม่ควรกินเลย",
  "needs-review": "ต้องดูส่วนผสมเพิ่ม",
};

const GOUT_RULES: FoodRule[] = [
  {
    keywords: ["ตับ", "ไต", "เครื่องใน", "ผ้าขี้ริ้ว", "sweetbread", "organ meat"],
    status: "avoid",
    summary: "อาหารกลุ่มเครื่องในมีพิวรีนสูงมาก",
    reason:
      "เครื่องใน เช่น ตับและไต เป็นกลุ่มอาหารที่มีพิวรีนสูง ซึ่งร่างกายเปลี่ยนเป็นกรดยูริกได้",
    servingGuidance: "ควรงด และเลือกโปรตีนจากพืชหรือผลิตภัณฑ์นมไขมันต่ำแทน",
    tags: ["พิวรีนสูง", "เครื่องใน"],
    isFlareSensitive: true,
    sourceUrl: SOURCE_URL,
  },
  {
    keywords: ["เบียร์", "เหล้า", "สุรา", "วิสกี้", "แอลกอฮอล์", "beer", "liquor"],
    status: "avoid",
    summary: "แอลกอฮอล์ โดยเฉพาะเบียร์ เพิ่มความเสี่ยงต่ออาการกำเริบ",
    reason:
      "แอลกอฮอล์มีความเกี่ยวข้องกับความเสี่ยงของโรคเกาต์และอาจทำให้การขับกรดยูริกลดลง",
    servingGuidance: "งดระหว่างช่วงกำเริบ และปรึกษาแพทย์เรื่องขอบเขตที่เหมาะกับคุณ",
    tags: ["แอลกอฮอล์", "ช่วงกำเริบ"],
    isFlareSensitive: true,
    sourceUrl: SOURCE_URL,
  },
  {
    keywords: ["น้ำอัดลม", "น้ำหวาน", "ชาเย็น", "ชานม", "soft drink", "soda", "high fructose"],
    status: "avoid",
    summary: "เครื่องดื่มหวานจัดไม่ใช่ตัวเลือกที่เหมาะสำหรับเกาต์",
    reason:
      "น้ำตาล โดยเฉพาะอาหารหรือเครื่องดื่มที่มีฟรุกโตสสูง มีความสัมพันธ์กับความเสี่ยงของโรคเกาต์",
    servingGuidance: "เปลี่ยนเป็นน้ำเปล่าหรือเครื่องดื่มไม่หวานเป็นหลัก",
    tags: ["น้ำตาลเติม", "ฟรุกโตส"],
    isFlareSensitive: true,
    sourceUrl: SOURCE_URL,
  },
  {
    keywords: ["เนื้อวัว", "เนื้อแดง", "หมู", "แกะ", "เบคอน", "beef", "pork", "lamb", "bacon"],
    status: "limit",
    summary: "เนื้อแดงควรควบคุมปริมาณ",
    reason:
      "เนื้อแดงเป็นแหล่งพิวรีนที่ควรจำกัดสำหรับผู้ที่เป็นเกาต์",
    servingGuidance: "เลือกมื้อเล็กและไม่กินบ่อย หากกำลังมีอาการกำเริบควรปรึกษาผู้ดูแลรักษา",
    tags: ["เนื้อแดง", "พิวรีนปานกลางถึงสูง"],
    isFlareSensitive: true,
    sourceUrl: SOURCE_URL,
  },
  {
    keywords: ["ปลากะตัก", "ซาร์ดีน", "หอย", "กุ้ง", "ปู", "ปลาค็อด", "anchovy", "sardine", "shellfish", "shrimp"],
    status: "limit",
    summary: "อาหารทะเลบางชนิดมีพิวรีนสูงกว่าปกติ",
    reason:
      "ปลากะตัก ซาร์ดีน หอย และอาหารทะเลบางชนิดเป็นกลุ่มที่ควรจำกัดสำหรับผู้มีเกาต์",
    servingGuidance: "จำกัดปริมาณ และพิจารณาอาหารทั้งมื้อ ไม่ใช่เฉพาะวัตถุดิบเดียว",
    tags: ["อาหารทะเล", "พิวรีนสูง"],
    isFlareSensitive: true,
    sourceUrl: SOURCE_URL,
  },
  {
    keywords: ["ไก่", "chicken", "ไก่งวง", "turkey"],
    status: "limit",
    summary: "สัตว์ปีกเนื้อไม่ติดมันเป็นตัวเลือกที่ดีกว่าเนื้อแดง แต่ควรกินในปริมาณพอดี",
    reason:
      "แนวทางอาหารสำหรับเกาต์สนับสนุนโปรตีนไม่ติดมัน แต่ยังให้คุมปริมาณเนื้อสัตว์",
    servingGuidance: "เลือกส่วนไม่ติดหนังและสลับกับเต้าหู้ ถั่ว หรือผลิตภัณฑ์นมไขมันต่ำ",
    tags: ["โปรตีนไม่ติดมัน", "ควบคุมปริมาณ"],
    isFlareSensitive: false,
    sourceUrl: SOURCE_URL,
  },
  {
    keywords: ["เต้าหู้", "ถั่ว", "เลนทิล", "ถั่วลูกไก่", "tofu", "beans", "lentil", "chickpea"],
    status: "ok",
    summary: "โปรตีนจากพืชเป็นตัวเลือกที่เหมาะในมื้อประจำวัน",
    reason:
      "แนวทางหลายแหล่งสนับสนุนโปรตีนจากพืช เช่น ถั่วและเต้าหู้ เป็นส่วนหนึ่งของอาหารที่สมดุลสำหรับเกาต์",
    servingGuidance: "กินเป็นส่วนหนึ่งของมื้อที่สมดุล และระวังน้ำตาลหรือโซเดียมที่เติมในผลิตภัณฑ์แปรรูป",
    tags: ["โปรตีนจากพืช", "ตัวเลือกทดแทน"],
    isFlareSensitive: false,
    sourceUrl: SOURCE_URL,
  },
  {
    keywords: ["ผัก", "คะน้า", "ผักโขม", "หน่อไม้ฝรั่ง", "ถั่วลันเตา", "spinach", "asparagus", "green pea"],
    status: "ok",
    summary: "ผักส่วนใหญ่กินได้ แม้บางชนิดมีพิวรีนระดับปานกลาง",
    reason:
      "ผักบางชนิดที่มีพิวรีนไม่ได้แสดงว่าทำให้ความเสี่ยงเกาต์สูงขึ้นในแนวทางอาหารทั่วไป",
    servingGuidance: "เพิ่มผักหลากสีในมื้ออาหาร และระวังวิธีปรุงที่หวานหรือเค็มจัด",
    tags: ["ผัก", "อาหารสมดุล"],
    isFlareSensitive: false,
    sourceUrl: SOURCE_URL,
  },
  {
    keywords: ["ข้าวกล้อง", "ข้าว", "ผลไม้", "เชอร์รี่", "นมไขมันต่ำ", "โยเกิร์ต", "น้ำเปล่า", "brown rice", "cherry", "low fat milk", "yogurt", "water"],
    status: "ok",
    summary: "เป็นตัวเลือกที่เข้ากับรูปแบบอาหารสมดุลสำหรับเกาต์",
    reason:
      "อาหารกลุ่มคาร์โบไฮเดรตเชิงซ้อน ผลไม้ไม่หวานจัด ผลิตภัณฑ์นมไขมันต่ำ และน้ำเพียงพอ เป็นส่วนหนึ่งของแนวทางอาหารสำหรับเกาต์",
    servingGuidance: "เลือกแบบไม่เติมน้ำตาล และดูขนาดเสิร์ฟร่วมกับเป้าหมายสุขภาพอื่นของคุณ",
    tags: ["อาหารสมดุล", "ไม่เติมน้ำตาล"],
    isFlareSensitive: false,
    sourceUrl: SOURCE_URL,
  },
];

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function evaluateFoodForGout(query: FoodQuery): FoodVerdict {
  const normalizedFood = normalize(query.foodName);
  const match = GOUT_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalizedFood.includes(keyword)),
  );

  if (match) {
    return {
      ...match,
      label: STATUS_LABEL[match.status],
      reason:
        query.isFlare && match.isFlareSensitive
          ? `${match.reason} เนื่องจากคุณระบุว่ากำลังมีอาการกำเริบ ควรระวังเป็นพิเศษและยึดแผนรักษาที่แพทย์ให้ไว้.`
          : match.reason,
    };
  }

  return {
    status: "needs-review",
    label: STATUS_LABEL["needs-review"],
    summary: "ยังไม่พบอาหารนี้ในชุดข้อมูลเกาต์เบื้องต้น",
    reason:
      "อาหารจานเดียวอาจมีส่วนผสม วิธีปรุง และปริมาณที่ต่างกัน จึงไม่ควรตีความว่าเหมาะหรือไม่เหมาะโดยอัตโนมัติ",
    servingGuidance: "ตรวจส่วนผสม โดยเฉพาะเครื่องใน เนื้อแดง อาหารทะเล น้ำตาลเติม และแอลกอฮอล์ หรือปรึกษาผู้เชี่ยวชาญ",
    tags: ["ต้องดูสูตร", "ข้อมูลยังไม่พอ"],
    isFlareSensitive: query.isFlare,
    sourceUrl: SOURCE_URL,
  };
}
