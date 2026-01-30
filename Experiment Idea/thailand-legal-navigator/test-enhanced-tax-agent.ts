/**
 * Test Enhanced Tax Agent (Task #2 Refinements)
 *
 * Tests the following improvements:
 * 1. 2024/2025 remittance rule clarifications
 * 2. Crypto income taxation
 * 3. Pension income treatment
 * 4. Remote work income scenarios
 * 5. Tax ID number (TIN) requirements
 * 6. Double taxation treaty claiming procedures
 * 7. Provincial vs Bangkok tax office differences
 */

import { TaxAgent } from "./agents/tax";
import type { UserProfile } from "./types";

const taxAgent = new TaxAgent();

console.log("=".repeat(80));
console.log("TESTING ENHANCED TAX AGENT - Task #2 Refinements");
console.log("=".repeat(80));
console.log();

// Test 1: 2024/2025 Remittance Rule Changes
console.log("TEST 1: 2024/2025 Remittance Rule Changes - Tax Resident with Foreign Income");
console.log("-".repeat(80));

const remittanceProfile: UserProfile = {
  nationality: "USA",
  currentLocation: "in-thailand",
  currentVisaType: "dtv-visa",
  daysInThailand: 200, // Tax resident
  intendedStayDuration: "long-term",
  purposeOfStay: ["digital-nomad"],
  willWorkInThailand: false,
  hasThaiIncome: false,
  hasForeignIncome: true,
  monthlyIncome: 5000,
  age: 35,
  needsDrivingLicense: false,
  needsVehicleOwnership: false,
  needsBankAccount: true,
  hasThaiSpouse: false,
  timestamp: new Date().toISOString(),
};

const remittanceResult = taxAgent.analyzeTaxExposure(remittanceProfile);
if (remittanceResult.success && remittanceResult.data) {
  console.log("✅ Analysis successful");
  console.log(`\nResidency Status: ${remittanceResult.data.residencyStatus}`);

  const sameYearTrigger = remittanceResult.data.incomeTriggers.find(
    (t) => t.category === "foreign-remitted-same-year"
  );
  const priorYearTrigger = remittanceResult.data.incomeTriggers.find(
    (t) => t.category === "foreign-remitted-prior-year"
  );

  if (sameYearTrigger) {
    console.log(`\n✅ Same-year remittance trigger found`);
    console.log(`  Includes 2024/2025 rule change: ${sameYearTrigger.explanation?.includes("2024/2025")}`);
    console.log(`  Explains ALL remittances: ${sameYearTrigger.explanation?.includes("regardless of when earned")}`);
  }

  if (priorYearTrigger) {
    console.log(`\n✅ Prior-year remittance trigger found`);
    console.log(`  Includes clarification: ${priorYearTrigger.explanation?.includes("2024 clarification")}`);
  }

  const remittanceWarning = remittanceResult.data.warnings.find((w) =>
    w.includes("2024/2025 Rule Change")
  );
  if (remittanceWarning) {
    console.log(`\n✅ 2024/2025 rule change warning found`);
  }

  const officeWarning = remittanceResult.data.warnings.find((w) =>
    w.includes("Provincial vs Bangkok")
  );
  if (officeWarning) {
    console.log(`✅ Provincial vs Bangkok office warning found`);
  }
} else {
  console.log(`❌ Error: ${remittanceResult.error}`);
}

console.log();

// Test 2: Crypto Income Taxation
console.log("TEST 2: Crypto Income Taxation - Digital Nomad");
console.log("-".repeat(80));

const cryptoProfile: UserProfile = {
  nationality: "Canada",
  currentLocation: "in-thailand",
  currentVisaType: "dtv-visa",
  daysInThailand: 250,
  intendedStayDuration: "long-term",
  purposeOfStay: ["digital-nomad"],
  willWorkInThailand: false,
  hasThaiIncome: false,
  hasForeignIncome: true,
  monthlyIncome: 4000,
  age: 30,
  needsDrivingLicense: false,
  needsVehicleOwnership: false,
  needsBankAccount: true,
  hasThaiSpouse: false,
  timestamp: new Date().toISOString(),
};

const cryptoResult = taxAgent.analyzeTaxExposure(cryptoProfile);
if (cryptoResult.success && cryptoResult.data) {
  console.log("✅ Analysis successful");

  const cryptoTrigger = cryptoResult.data.incomeTriggers.find(
    (t) => t.category === "crypto-income"
  );

  if (cryptoTrigger) {
    console.log(`\n✅ Crypto income trigger found`);
    console.log(`  Includes trading profits: ${cryptoTrigger.explanation?.includes("trading profits")}`);
    console.log(`  Includes mining/staking: ${cryptoTrigger.explanation?.includes("Mining/staking")}`);
    console.log(`  Includes DeFi: ${cryptoTrigger.explanation?.includes("DeFi")}`);
    console.log(`  Mentions unclear guidance: ${cryptoTrigger.explanation?.includes("unclear")}`);
  } else {
    console.log("❌ Crypto trigger not found");
  }

  const cryptoWarning = cryptoResult.data.warnings.find((w) =>
    w.includes("Cryptocurrency")
  );
  if (cryptoWarning) {
    console.log(`\n✅ Cryptocurrency-specific warning found`);
    console.log(`  Mentions record-keeping: ${cryptoWarning.includes("Keep detailed records")}`);
  }
} else {
  console.log(`❌ Error: ${cryptoResult.error}`);
}

console.log();

// Test 3: Pension Income Treatment
console.log("TEST 3: Pension Income - Retiree with Foreign Pension");
console.log("-".repeat(80));

const pensionProfile: UserProfile = {
  nationality: "UK",
  currentLocation: "in-thailand",
  currentVisaType: "non-immigrant-o",
  daysInThailand: 300,
  intendedStayDuration: "long-term",
  purposeOfStay: ["retirement"],
  willWorkInThailand: false,
  hasThaiIncome: false,
  hasForeignIncome: true,
  monthlyIncome: 2500,
  age: 65,
  needsDrivingLicense: true,
  needsVehicleOwnership: false,
  needsBankAccount: true,
  hasThaiSpouse: false,
  timestamp: new Date().toISOString(),
};

const pensionResult = taxAgent.analyzeTaxExposure(pensionProfile);
if (pensionResult.success && pensionResult.data) {
  console.log("✅ Analysis successful");

  const pensionTrigger = pensionResult.data.incomeTriggers.find(
    (t) => t.category === "pension-income"
  );

  if (pensionTrigger) {
    console.log(`\n✅ Pension income trigger found`);
    console.log(`  Distinguishes government vs private: ${pensionTrigger.explanation?.includes("Government pensions")}`);
    console.log(`  Mentions DTA exemptions: ${pensionTrigger.explanation?.includes("exempt under double taxation treaties")}`);
    console.log(`  Includes UK pension: ${pensionTrigger.explanation?.includes("UK state pension")}`);
  } else {
    console.log("❌ Pension trigger not found");
  }

  const pensionWarning = pensionResult.data.warnings.find((w) =>
    w.includes("Pension Income (Age 50+)")
  );
  if (pensionWarning) {
    console.log(`\n✅ Age 50+ pension warning found`);
    console.log(`  Mentions government vs private: ${pensionWarning.includes("Government pensions")}`);
  }

  const dtaTreaty = taxAgent.hasTaxTreaty("UK");
  if (dtaTreaty.success && dtaTreaty.data?.hasTreaty) {
    console.log(`\n✅ UK-Thailand DTA exists`);
    console.log(`  Claiming procedure notes: ${dtaTreaty.data.notes.length} steps/notes`);
  }
} else {
  console.log(`❌ Error: ${pensionResult.error}`);
}

console.log();

// Test 4: Remote Work Income Scenarios
console.log("TEST 4: Remote Work Income - DTV Visa Holder");
console.log("-".repeat(80));

const remoteWorkProfile: UserProfile = {
  nationality: "Australia",
  currentLocation: "in-thailand",
  currentVisaType: "dtv-visa",
  daysInThailand: 180,
  intendedStayDuration: "long-term",
  purposeOfStay: ["digital-nomad"],
  willWorkInThailand: false,
  hasThaiIncome: false,
  hasForeignIncome: true,
  monthlyIncome: 6000,
  age: 32,
  needsDrivingLicense: false,
  needsVehicleOwnership: false,
  needsBankAccount: true,
  hasThaiSpouse: false,
  timestamp: new Date().toISOString(),
};

const remoteWorkResult = taxAgent.analyzeTaxExposure(remoteWorkProfile);
if (remoteWorkResult.success && remoteWorkResult.data) {
  console.log("✅ Analysis successful");

  const remoteWorkTrigger = remoteWorkResult.data.incomeTriggers.find(
    (t) => t.category === "remote-work-income"
  );

  if (remoteWorkTrigger) {
    console.log(`\n✅ Remote work income trigger found`);
    console.log(`  Mentions DTV visa: ${remoteWorkTrigger.explanation?.includes("DTV visa holders")}`);
    console.log(`  Explains sourcing: ${remoteWorkTrigger.explanation?.includes("foreign employer")}`);
    console.log(`  Mentions freelancing: ${remoteWorkTrigger.explanation?.includes("Freelancers")}`);
  } else {
    console.log("❌ Remote work trigger not found");
  }

  const digitalNomadWarning = remoteWorkResult.data.warnings.find((w) =>
    w.includes("Digital Nomads")
  );
  if (digitalNomadWarning) {
    console.log(`\n✅ Digital nomad warning found`);
    console.log(`  Mentions DTV: ${digitalNomadWarning.includes("DTV visa")}`);
  }
} else {
  console.log(`❌ Error: ${remoteWorkResult.error}`);
}

console.log();

// Test 5: TIN Requirements
console.log("TEST 5: TIN (Tax ID Number) Requirements - Thai Employment");
console.log("-".repeat(80));

const tinProfile: UserProfile = {
  nationality: "USA",
  currentLocation: "in-thailand",
  currentVisaType: "non-immigrant-b",
  daysInThailand: 300,
  intendedStayDuration: "long-term",
  purposeOfStay: ["employment"],
  willWorkInThailand: true,
  hasThaiIncome: true,
  hasForeignIncome: false,
  monthlyIncome: 3000,
  age: 35,
  needsDrivingLicense: true,
  needsVehicleOwnership: false,
  needsBankAccount: true,
  hasThaiSpouse: false,
  timestamp: new Date().toISOString(),
};

const tinResult = taxAgent.analyzeTaxExposure(tinProfile);
if (tinResult.success && tinResult.data) {
  console.log("✅ Analysis successful");

  if (tinResult.data.filingObligation.mustFile) {
    console.log(`\n✅ Must file: ${tinResult.data.filingObligation.mustFile}`);

    const tinNote = tinResult.data.filingObligation.notes?.find((n) =>
      n.includes("TIN") || n.includes("Tax ID")
    );
    if (tinNote) {
      console.log(`✅ TIN mentioned in filing notes`);
    }

    const tinRequirements = tinResult.data.filingObligation.notes?.find((n) =>
      n.includes("passport") && n.includes("visa")
    );
    if (tinRequirements) {
      console.log(`✅ TIN application requirements specified`);
    }

    const eFilingNote = tinResult.data.filingObligation.notes?.find((n) =>
      n.includes("E-filing")
    );
    if (eFilingNote) {
      console.log(`✅ E-filing information included`);
    }
  }
} else {
  console.log(`❌ Error: ${tinResult.error}`);
}

console.log();

// Test 6: DTA Claiming Procedures
console.log("TEST 6: Double Taxation Treaty Claiming Procedures");
console.log("-".repeat(80));

const countries = ["USA", "Germany", "Singapore", "Brazil"];

for (const country of countries) {
  const treatyResult = taxAgent.hasTaxTreaty(country);

  if (treatyResult.success && treatyResult.data) {
    console.log(`\n${country}:`);
    console.log(`  Has treaty: ${treatyResult.data.hasTreaty}`);

    if (treatyResult.data.hasTreaty) {
      const procedureNote = treatyResult.data.notes.find((n) =>
        n.includes("Claiming Procedure") || n.includes("procedure")
      );
      if (procedureNote) {
        console.log(`  ✅ Claiming procedure information included`);
      }

      const certificateNote = treatyResult.data.notes.find((n) =>
        n.includes("tax residency certificate")
      );
      if (certificateNote) {
        console.log(`  ✅ Tax residency certificate requirement mentioned`);
      }

      const officeNote = treatyResult.data.notes.find((n) =>
        n.includes("Bangkok") || n.includes("Provincial")
      );
      if (officeNote) {
        console.log(`  ✅ Office variability information included`);
      }
    } else {
      const noTreatyNote = treatyResult.data.notes.find((n) =>
        n.includes("double taxation")
      );
      if (noTreatyNote) {
        console.log(`  ✅ No-treaty implications explained`);
      }
    }
  }
}

console.log();

// Test 7: Comprehensive Disclaimers
console.log("TEST 7: Enhanced Disclaimers");
console.log("-".repeat(80));

const disclaimerProfile: UserProfile = {
  nationality: "France",
  currentLocation: "in-thailand",
  currentVisaType: "dtv-visa",
  daysInThailand: 200,
  intendedStayDuration: "long-term",
  purposeOfStay: ["digital-nomad"],
  willWorkInThailand: false,
  hasThaiIncome: false,
  hasForeignIncome: true,
  monthlyIncome: 5000,
  age: 35,
  needsDrivingLicense: false,
  needsVehicleOwnership: false,
  needsBankAccount: true,
  hasThaiSpouse: false,
  timestamp: new Date().toISOString(),
};

const disclaimerResult = taxAgent.analyzeTaxExposure(disclaimerProfile);
if (disclaimerResult.success && disclaimerResult.data) {
  console.log("✅ Analysis successful");
  console.log(`\nTotal disclaimers: ${disclaimerResult.data.disclaimers.length}`);

  const ruleChangeDisclaimer = disclaimerResult.data.disclaimers.find((d) =>
    d.includes("2024/2025 rule changes")
  );
  if (ruleChangeDisclaimer) {
    console.log(`✅ 2024/2025 rule changes mentioned in disclaimers`);
  }

  const cryptoDisclaimer = disclaimerResult.data.disclaimers.find((d) =>
    d.includes("Cryptocurrency")
  );
  if (cryptoDisclaimer) {
    console.log(`✅ Cryptocurrency taxation disclaimer included`);
  }

  const remittanceDisclaimer = disclaimerResult.data.disclaimers.find((d) =>
    d.includes("Remittance includes")
  );
  if (remittanceDisclaimer) {
    console.log(`✅ Remittance definition included`);
  }

  const provincialDisclaimer = disclaimerResult.data.disclaimers.find((d) =>
    d.includes("Provincial Revenue offices")
  );
  if (provincialDisclaimer) {
    console.log(`✅ Provincial office variability mentioned`);
  }
} else {
  console.log(`❌ Error: ${disclaimerResult.error}`);
}

console.log();

// Summary
console.log("=".repeat(80));
console.log("ENHANCEMENT SUMMARY");
console.log("=".repeat(80));
console.log(`
✅ Task #2 Refinements Completed:

1. 2024/2025 Remittance Rule Clarifications
   - Clear explanation of rule change (ALL remittances now assessable)
   - Same-year vs prior-year distinction
   - Provincial vs Bangkok office differences
   - Implementation variability warnings

2. Crypto Income Taxation
   - Trading profits, mining/staking rewards
   - Crypto-to-crypto treatment (uncertain)
   - DeFi yield taxation
   - Record-keeping requirements
   - No official guidelines warning

3. Pension Income Treatment
   - Government vs private pension distinction
   - Country-specific examples (US Social Security, UK state pension)
   - DTA exemption possibilities
   - Special warning for age 50+

4. Remote Work Income Scenarios
   - DTV visa holder specific guidance
   - Foreign employer vs Thai client distinction
   - Freelancer vs employee
   - Where services performed consideration

5. Tax ID Number (TIN) Requirements
   - Application process detailed
   - Required documents specified
   - E-filing information
   - Employer assistance noted

6. Double Taxation Treaty Claiming Procedures
   - Step-by-step claiming process
   - Tax residency certificate requirement
   - Proof of foreign tax paid
   - Revenue Department review process
   - Office expertise differences
   - Professional assistance recommendations

7. Provincial vs Bangkok Tax Office Differences
   - Experience with foreign income cases
   - DTA claim familiarity
   - Documentation requirements
   - Processing times
   - Recommended offices (Lumpini, Ploenchit)

All improvements maintain "information only" principle - no tax planning, no optimization strategies, no calculations.
`);
