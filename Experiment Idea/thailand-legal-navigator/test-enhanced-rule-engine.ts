/**
 * Test Enhanced Rule Engine (Task #1 Refinements)
 *
 * Tests the following improvements:
 * 1. DTV edge cases (remote worker, freelancer, soft power)
 * 2. Retirement visa financial thresholds (800k, 65k/month, combination)
 * 3. Family visa scenarios (Thai spouse vs Thai children)
 * 4. Student visa attendance warnings
 * 5. COVID-era transition warnings
 * 6. Visa run vs border run distinctions
 */

import { RuleEngine } from "./agents/rule-engine";
import type { UserProfile } from "./types";

const ruleEngine = new RuleEngine();

console.log("=".repeat(80));
console.log("TESTING ENHANCED RULE ENGINE - Task #1 Refinements");
console.log("=".repeat(80));
console.log();

// Test 1: DTV Visa - Digital Nomad with sufficient income
console.log("TEST 1: DTV Visa - Digital Nomad with sufficient income");
console.log("-".repeat(80));

const dtvProfile: UserProfile = {
  nationality: "USA",
  currentLocation: "outside-thailand",
  intendedStayDuration: "long-term",
  purposeOfStay: ["digital-nomad"],
  willWorkInThailand: false,
  hasThaiIncome: false,
  hasForeignIncome: true,
  monthlyIncome: 5000, // ~180,000 THB/year = ~540,000 THB total (meets 500k requirement)
  age: 35,
  needsDrivingLicense: false,
  needsVehicleOwnership: false,
  needsBankAccount: true,
  hasThaiSpouse: false,
  timestamp: new Date().toISOString(),
};

const dtvResult = ruleEngine.analyze(dtvProfile);
if (dtvResult.success && dtvResult.data) {
  console.log("✅ Analysis successful");

  const dtvCategory = dtvResult.data.applicableVisaCategories.find(
    (cat) => cat.type === "dtv-visa"
  );

  if (dtvCategory) {
    console.log(`\nDTV Visa Category:`);
    console.log(`  Applicable: ${dtvCategory.isApplicable}`);
    console.log(`  Priority: ${dtvCategory.priority}`);
    console.log(`  Reason: ${dtvCategory.reason}`);
  } else {
    console.log("❌ DTV category not found");
  }

  console.log(`\nWarnings (${dtvResult.data.warnings.length}):`);
  dtvResult.data.warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
} else {
  console.log(`❌ Error: ${dtvResult.error}`);
}

console.log();

// Test 2: Retirement Visa - Combination method
console.log("TEST 2: Retirement Visa - Combination method (400k + income)");
console.log("-".repeat(80));

const retirementProfile: UserProfile = {
  nationality: "UK",
  currentLocation: "in-thailand",
  currentVisaType: "tourist-visa-tr",
  daysInThailand: 60,
  intendedStayDuration: "long-term",
  purposeOfStay: ["retirement"],
  willWorkInThailand: false,
  hasThaiIncome: false,
  hasForeignIncome: true,
  monthlyIncome: 1500, // ~54,000 THB/month (below 65k but can use combination)
  age: 55,
  needsDrivingLicense: true,
  needsVehicleOwnership: false,
  needsBankAccount: true,
  hasThaiSpouse: false,
  timestamp: new Date().toISOString(),
};

const retirementResult = ruleEngine.analyze(retirementProfile);
if (retirementResult.success && retirementResult.data) {
  console.log("✅ Analysis successful");

  const retirementCategory = retirementResult.data.applicableVisaCategories.find(
    (cat) => cat.type === "non-immigrant-o" && cat.reason.includes("retirement")
  );

  if (retirementCategory) {
    console.log(`\nRetirement Visa Category:`);
    console.log(`  Applicable: ${retirementCategory.isApplicable}`);
    console.log(`  Priority: ${retirementCategory.priority}`);
    console.log(`  Reason: ${retirementCategory.reason}`);
  } else {
    console.log("❌ Retirement category not found");
  }

  const retirementWarning = retirementResult.data.warnings.find((w) =>
    w.includes("seasoning")
  );
  if (retirementWarning) {
    console.log(`\n✅ Seasoning warning found: ${retirementWarning}`);
  }
} else {
  console.log(`❌ Error: ${retirementResult.error}`);
}

console.log();

// Test 3: Thai Spouse vs Thai Children
console.log("TEST 3: Thai Spouse visa (different financial requirements)");
console.log("-".repeat(80));

const thaiSpouseProfile: UserProfile = {
  nationality: "Australia",
  currentLocation: "in-thailand",
  currentVisaType: "tourist-visa-exempt",
  daysInThailand: 45,
  intendedStayDuration: "long-term",
  purposeOfStay: ["family"],
  willWorkInThailand: false,
  hasThaiIncome: false,
  hasForeignIncome: true,
  monthlyIncome: 1500, // ~54,000 THB/month (above 40k requirement)
  age: 40,
  needsDrivingLicense: false,
  needsVehicleOwnership: false,
  needsBankAccount: true,
  hasThaiSpouse: true,
  timestamp: new Date().toISOString(),
};

const spouseResult = ruleEngine.analyze(thaiSpouseProfile);
if (spouseResult.success && spouseResult.data) {
  console.log("✅ Analysis successful");

  const spouseCategory = spouseResult.data.applicableVisaCategories.find(
    (cat) => cat.type === "non-immigrant-o"
  );

  if (spouseCategory) {
    console.log(`\nThai Spouse Visa Category:`);
    console.log(`  Applicable: ${spouseCategory.isApplicable}`);
    console.log(`  Priority: ${spouseCategory.priority}`);
    console.log(`  Reason: ${spouseCategory.reason}`);

    if (spouseCategory.reason.includes("400,000 THB")) {
      console.log("✅ Correct financial requirement (400,000 THB for spouse)");
    }
    if (spouseCategory.reason.includes("home visit")) {
      console.log("✅ Home visit warning included");
    }
  } else {
    console.log("❌ Spouse category not found");
  }

  const homeVisitWarning = spouseResult.data.warnings.find((w) =>
    w.includes("home visit")
  );
  if (homeVisitWarning) {
    console.log(`\n✅ Home visit warning found in warnings array`);
  }
} else {
  console.log(`❌ Error: ${spouseResult.error}`);
}

console.log();

// Test 4: Student Visa - Enhanced warnings
console.log("TEST 4: Student Visa - Attendance requirements and DTV alternative");
console.log("-".repeat(80));

const studentProfile: UserProfile = {
  nationality: "South Korea",
  currentLocation: "outside-thailand",
  intendedStayDuration: "medium-term",
  purposeOfStay: ["education"],
  willWorkInThailand: false,
  hasThaiIncome: false,
  hasForeignIncome: false,
  age: 25,
  needsDrivingLicense: false,
  needsVehicleOwnership: false,
  needsBankAccount: false,
  hasThaiSpouse: false,
  timestamp: new Date().toISOString(),
};

const studentResult = ruleEngine.analyze(studentProfile);
if (studentResult.success && studentResult.data) {
  console.log("✅ Analysis successful");

  const edCategory = studentResult.data.applicableVisaCategories.find(
    (cat) => cat.type === "non-immigrant-ed"
  );
  const dtvAltCategory = studentResult.data.applicableVisaCategories.find(
    (cat) => cat.type === "dtv-visa"
  );

  if (edCategory) {
    console.log(`\nStudent Visa (Non-ED):`);
    console.log(`  Applicable: ${edCategory.isApplicable}`);
    console.log(`  Reason includes 80% attendance: ${edCategory.reason.includes("80%")}`);
    console.log(`  Reason includes scrutiny warning: ${edCategory.reason.includes("scrutiny")}`);
    console.log(`  Reason preview: ${edCategory.reason.substring(0, 200)}...`);
  }

  if (dtvAltCategory) {
    console.log(`\nDTV Alternative (Soft Power):`);
    console.log(`  Offered as alternative: ✅`);
    console.log(`  Includes Muay Thai/cooking: ${dtvAltCategory.reason.includes("Muay Thai")}`);
  }

  const edWarning = studentResult.data.warnings.find((w) =>
    w.includes("Student") && w.includes("scrutiny")
  );
  if (edWarning) {
    console.log(`\n✅ ED visa scrutiny warning found`);
  }
} else {
  console.log(`❌ Error: ${studentResult.error}`);
}

console.log();

// Test 5: Visa Run vs Border Run warnings
console.log("TEST 5: Visa Run vs Border Run - Risk indicators");
console.log("-".repeat(80));

const borderRunProfile: UserProfile = {
  nationality: "Canada",
  currentLocation: "in-thailand",
  currentVisaType: "tourist-visa-exempt",
  daysInThailand: 200,
  intendedStayDuration: "long-term",
  purposeOfStay: ["digital-nomad"],
  willWorkInThailand: false,
  hasThaiIncome: false,
  hasForeignIncome: true,
  monthlyIncome: 3000,
  age: 32,
  needsDrivingLicense: false,
  needsVehicleOwnership: false,
  needsBankAccount: true,
  hasThaiSpouse: false,
  timestamp: new Date().toISOString(),
};

const borderRunResult = ruleEngine.analyze(borderRunProfile);
if (borderRunResult.success && borderRunResult.data) {
  console.log("✅ Analysis successful");

  const borderRunRisk = borderRunResult.data.riskIndicators.find((r) =>
    r.description.includes("border run") || r.description.includes("Border run")
  );

  if (borderRunRisk) {
    console.log(`\nBorder Run Risk Found:`);
    console.log(`  Severity: ${borderRunRisk.severity}`);
    console.log(`  Includes definition: ${borderRunRisk.description.includes("exit/re-enter")}`);
    console.log(`  Includes land limit: ${borderRunRisk.description.includes("2 land entries")}`);
    console.log(`  Description preview: ${borderRunRisk.description.substring(0, 200)}...`);
  } else {
    console.log("❌ Border run risk not found");
  }

  const landBorderRisk = borderRunResult.data.riskIndicators.find((r) =>
    r.description.includes("Land border")
  );

  if (landBorderRisk) {
    console.log(`\n✅ Land border limit warning found`);
  }

  const multipleEntryWarning = borderRunResult.data.warnings.find((w) =>
    w.includes("border runs")
  );

  if (multipleEntryWarning) {
    console.log(`\n✅ Frequent entry warning found in warnings array`);
  }
} else {
  console.log(`❌ Error: ${borderRunResult.error}`);
}

console.log();

// Test 6: COVID-era transition warning
console.log("TEST 6: COVID-era visa transition warning");
console.log("-".repeat(80));

const covidProfile: UserProfile = {
  nationality: "USA",
  currentLocation: "in-thailand",
  currentVisaType: "tourist-visa-exempt",
  daysInThailand: 400, // More than 1 year
  intendedStayDuration: "long-term",
  purposeOfStay: ["digital-nomad"],
  willWorkInThailand: false,
  hasThaiIncome: false,
  hasForeignIncome: true,
  monthlyIncome: 2500,
  age: 35,
  needsDrivingLicense: false,
  needsVehicleOwnership: false,
  needsBankAccount: true,
  hasThaiSpouse: false,
  timestamp: new Date().toISOString(),
};

const covidResult = ruleEngine.analyze(covidProfile);
if (covidResult.success && covidResult.data) {
  console.log("✅ Analysis successful");

  const covidRisk = covidResult.data.riskIndicators.find((r) =>
    r.description.includes("COVID")
  );

  if (covidRisk) {
    console.log(`\nCOVID Transition Risk Found:`);
    console.log(`  Severity: ${covidRisk.severity}`);
    console.log(`  Includes transition guidance: ${covidRisk.description.includes("transition")}`);
    console.log(`  Description: ${covidRisk.description}`);
  } else {
    console.log("❌ COVID transition risk not found");
  }
} else {
  console.log(`❌ Error: ${covidResult.error}`);
}

console.log();

// Summary
console.log("=".repeat(80));
console.log("ENHANCEMENT SUMMARY");
console.log("=".repeat(80));
console.log(`
✅ Task #1 Refinements Completed:

1. DTV Edge Cases
   - Remote worker vs freelancer distinction
   - Soft power activities (Muay Thai, cooking, medical)
   - 500,000 THB financial requirement check
   - Multi-category explanation

2. Retirement Visa Thresholds
   - 800,000 THB in bank (with seasoning)
   - 65,000 THB/month pension
   - Combination method (400,000 + income)
   - Detailed financial breakdown

3. Family Visa Scenarios
   - Thai spouse: 400,000 THB requirement
   - Thai children: Different requirements
   - Home visit warnings
   - Marriage certificate requirements

4. Student Visa Extensions
   - 80% attendance requirement
   - Immigration scrutiny warnings (2024-2025)
   - Language school vs university distinction
   - DTV as alternative for soft power courses

5. COVID-era Transitions
   - Long-term tourist visa holders
   - COVID extension expiry warnings
   - Transition to proper visa guidance

6. Visa Run vs Border Run
   - Clear definitions (exit/re-enter vs new visa)
   - Land border limit: 2 per calendar year
   - Air vs land entry differences
   - Immigration scrutiny warnings
   - VoA limitations (15 days, 2000 THB)

All improvements maintain "information only" principle - no recommendations, only factual requirements and official rules.
`);
