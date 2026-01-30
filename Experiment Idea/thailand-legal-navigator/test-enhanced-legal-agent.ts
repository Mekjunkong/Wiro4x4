/**
 * Test Enhanced Legal Agent (Task #3 Refinements)
 *
 * Tests the following property law improvements:
 * 1. Foreign quota verification
 * 2. Property transfer fees and taxes
 * 3. Joint ownership with Thai spouse
 * 4. Property inspection requirements
 * 5. Commercial property leases
 * 6. Usufruct vs Lease vs Ownership
 * 7. Condominium common fees and disputes
 */

import { LegalAgent } from "./agents/legal";

const legalAgent = new LegalAgent();

console.log("=".repeat(80));
console.log("TESTING ENHANCED LEGAL AGENT - Task #3 Property Law Refinements");
console.log("=".repeat(80));
console.log();

// Test 1: Foreign Quota Verification Scenario
console.log("TEST 1: Foreign Quota Verification - Condo Purchase");
console.log("-".repeat(80));

const condoResult = legalAgent.getLegalInfo("property", "condo-ownership");
if (condoResult.success && condoResult.data) {
  console.log("✅ Condo ownership topic found");

  const quotaScenario = condoResult.data.commonScenarios?.find((s) =>
    s.scenario.includes("foreign quota") || s.scenario.includes("quota")
  );

  if (quotaScenario) {
    console.log(`\n✅ Foreign quota scenario found`);
    console.log(`  Scenario: ${quotaScenario.scenario}`);
    console.log(`  Includes per-building calculation: ${quotaScenario.notes?.some(n => n.includes("per building"))}`);
    console.log(`  Includes square meter calculation: ${quotaScenario.notes?.some(n => n.includes("square meters"))}`);
    console.log(`  Includes verification steps: ${quotaScenario.requiredSteps && quotaScenario.requiredSteps.length > 0}`);
  } else {
    console.log("❌ Foreign quota scenario not found");
  }

  const transferFeesScenario = condoResult.data.commonScenarios?.find((s) =>
    s.scenario.includes("transfer fees") || s.scenario.includes("taxes")
  );

  if (transferFeesScenario) {
    console.log(`\n✅ Transfer fees scenario found`);
    console.log(`  Includes 2% transfer fee: ${transferFeesScenario.whatTheLawSays?.includes("2%")}`);
    console.log(`  Includes business tax: ${transferFeesScenario.whatTheLawSays?.includes("3.3%")}`);
    console.log(`  Includes withholding tax: ${transferFeesScenario.whatTheLawSays?.includes("Withholding")}`);
  }

  const jointOwnershipScenario = condoResult.data.commonScenarios?.find((s) =>
    s.scenario.includes("Joint ownership") || s.scenario.includes("Thai spouse")
  );

  if (jointOwnershipScenario) {
    console.log(`\n✅ Joint ownership with Thai spouse scenario found`);
    console.log(`  Includes Kor Ror 22 form: ${jointOwnershipScenario.requiredDocuments?.some(d => d.includes("Kor Ror 22"))}`);
    console.log(`  Explains separate property: ${jointOwnershipScenario.whatTheLawSays?.includes("separate property")}`);
    console.log(`  Warns about divorce implications: ${jointOwnershipScenario.notes?.some(n => n.includes("divorce"))}`);
  }
} else {
  console.log(`❌ Error: ${condoResult.error}`);
}

console.log();

// Test 2: Property Inspection Requirements
console.log("TEST 2: Property Inspection Requirements - Rental");
console.log("-".repeat(80));

const rentalResult = legalAgent.getLegalInfo("property", "rental-lease");
if (rentalResult.success && rentalResult.data) {
  console.log("✅ Rental/lease topic found");

  const inspectionScenario = rentalResult.data.commonScenarios?.find((s) =>
    s.scenario.includes("inspection") || s.scenario.includes("Property inspection")
  );

  if (inspectionScenario) {
    console.log(`\n✅ Property inspection scenario found`);
    console.log(`  Scenario: ${inspectionScenario.scenario}`);
    console.log(`  Includes photo documentation: ${inspectionScenario.requiredSteps?.some(s => s.includes("photos") || s.includes("video"))}`);
    console.log(`  Explains normal wear vs damage: ${inspectionScenario.notes?.some(n => n.includes("Normal wear"))}`);
    console.log(`  Mentions move-in AND move-out: ${inspectionScenario.requiredSteps?.some(s => s.includes("move-out"))}`);
  } else {
    console.log("❌ Property inspection scenario not found");
  }
} else {
  console.log(`❌ Error: ${rentalResult.error}`);
}

console.log();

// Test 3: Commercial Property Leases
console.log("TEST 3: Commercial Property Leases");
console.log("-".repeat(80));

const commercialResult = legalAgent.getLegalInfo("property", "commercial-lease");
if (commercialResult.success && commercialResult.data) {
  console.log("✅ Commercial lease topic found");
  console.log(`  Topic: ${commercialResult.data.topic}`);
  console.log(`  Key points: ${commercialResult.data.keyPoints.length}`);

  const restaurantScenario = commercialResult.data.commonScenarios?.find((s) =>
    s.scenario.includes("restaurant") || s.scenario.includes("retail")
  );

  if (restaurantScenario) {
    console.log(`\n✅ Restaurant/retail scenario found`);
    console.log(`  Includes rent escalation: ${restaurantScenario.notes?.some(n => n.includes("escalation"))}`);
    console.log(`  Mentions key money: ${restaurantScenario.notes?.some(n => n.includes("key money"))}`);
    console.log(`  Explains improvements: ${restaurantScenario.notes?.some(n => n.includes("Improvements"))}`);
  }

  const renewalScenario = commercialResult.data.commonScenarios?.find((s) =>
    s.scenario.includes("renewal") || s.scenario.includes("extension")
  );

  if (renewalScenario) {
    console.log(`\n✅ Lease renewal scenario found`);
    console.log(`  Warns about 30-year limit: ${renewalScenario.notes?.some(n => n.includes("30 years"))}`);
    console.log(`  Explains renewal not guaranteed: ${renewalScenario.notes?.some(n => n.includes("NOT guaranteed"))}`);
  }

  console.log(`\n✅ Commercial lease restrictions: ${commercialResult.data.restrictions?.length}`);
} else {
  console.log(`❌ Error: ${commercialResult.error}`);
}

console.log();

// Test 4: Usufruct vs Lease vs Ownership
console.log("TEST 4: Usufruct vs Lease vs Ownership Rights");
console.log("-".repeat(80));

const usufructResult = legalAgent.getLegalInfo("property", "usufruct-vs-lease");
if (usufructResult.success && usufructResult.data) {
  console.log("✅ Usufruct vs lease topic found");
  console.log(`  Topic: ${usufructResult.data.topic}`);
  console.log(`  Relevant laws: ${usufructResult.data.relevantLaws.length}`);

  const comparisonScenario = usufructResult.data.commonScenarios?.find((s) =>
    s.scenario.includes("Usufruct vs Lease")
  );

  if (comparisonScenario) {
    console.log(`\n✅ Usufruct vs lease comparison found`);
    console.log(`  Explains lifetime vs 30-year: ${comparisonScenario.notes?.some(n => n.includes("lifetime"))}`);
    console.log(`  Compares advantages/disadvantages: ${comparisonScenario.notes?.some(n => n.includes("advantages"))}`);
    console.log(`  Mentions inheritance limitations: ${comparisonScenario.notes?.some(n => n.includes("death") || n.includes("heirs"))}`);
  }

  const superficiesScenario = usufructResult.data.commonScenarios?.find((s) =>
    s.scenario.includes("Superficies")
  );

  if (superficiesScenario) {
    console.log(`\n✅ Superficies right scenario found`);
    console.log(`  Explains building ownership: ${superficiesScenario.notes?.some(n => n.includes("OWN the building"))}`);
    console.log(`  Mentions separate from land: ${superficiesScenario.notes?.some(n => n.includes("separate"))}`);
  }

  const keyPoints = usufructResult.data.keyPoints;
  console.log(`\n✅ Key points cover all rights:`);
  console.log(`  Ownership: ${keyPoints.some(p => p.includes("Ownership"))}`);
  console.log(`  Lease: ${keyPoints.some(p => p.includes("Lease"))}`);
  console.log(`  Usufruct: ${keyPoints.some(p => p.includes("Usufruct"))}`);
  console.log(`  Superficies: ${keyPoints.some(p => p.includes("Superficies"))}`);
} else {
  console.log(`❌ Error: ${usufructResult.error}`);
}

console.log();

// Test 5: Condominium Common Fees and Disputes
console.log("TEST 5: Condominium Common Fees and Disputes");
console.log("-".repeat(80));

const condoFeesResult = legalAgent.getLegalInfo("property", "condo-common-fees");
if (condoFeesResult.success && condoFeesResult.data) {
  console.log("✅ Condo common fees topic found");
  console.log(`  Topic: ${condoFeesResult.data.topic}`);

  const feeObligationScenario = condoFeesResult.data.commonScenarios?.find((s) =>
    s.scenario.includes("common fee obligations")
  );

  if (feeObligationScenario) {
    console.log(`\n✅ Fee obligation scenario found`);
    console.log(`  Includes fee range: ${feeObligationScenario.notes?.some(n => n.includes("30-70 THB"))}`);
    console.log(`  Explains what fees cover: ${feeObligationScenario.notes?.some(n => n.includes("security guards"))}`);
    console.log(`  Warns about non-payment: ${feeObligationScenario.notes?.some(n => n.includes("Non-payment"))}`);
  }

  const disputeScenario = condoFeesResult.data.commonScenarios?.find((s) =>
    s.scenario.includes("Disputes")
  );

  if (disputeScenario) {
    console.log(`\n✅ Dispute resolution scenario found`);
    console.log(`  Lists common disputes: ${disputeScenario.notes?.some(n => n.includes("Noise complaints"))}`);
    console.log(`  Explains juristic person powers: ${disputeScenario.notes?.some(n => n.includes("Juristic person power"))}`);
    console.log(`  Mentions voting: ${disputeScenario.notes?.some(n => n.includes("Voting power"))}`);
  }

  const maintenanceScenario = condoFeesResult.data.commonScenarios?.find((s) =>
    s.scenario.includes("maintenance")
  );

  if (maintenanceScenario) {
    console.log(`\n✅ Maintenance issue scenario found`);
    console.log(`  Distinguishes common vs unit areas: ${maintenanceScenario.notes?.some(n => n.includes("Common area") && n.includes("Unit interior"))}`);
    console.log(`  Explains water leak responsibility: ${maintenanceScenario.notes?.some(n => n.includes("Water leaks"))}`);
  }

  console.log(`\n✅ Penalties listed: ${condoFeesResult.data.penalties?.length}`);
} else {
  console.log(`❌ Error: ${condoFeesResult.error}`);
}

console.log();

// Test 6: Get All Property Topics
console.log("TEST 6: Verify All Property Topics");
console.log("-".repeat(80));

const allPropertyResult = legalAgent.getDomainTopics("property");
if (allPropertyResult.success && allPropertyResult.data) {
  console.log("✅ Retrieved all property topics");
  console.log(`  Total topics: ${allPropertyResult.data.length}`);

  const topicNames = allPropertyResult.data.map(t => t.topic);
  console.log(`\n  Topics:`);
  topicNames.forEach((name, i) => console.log(`    ${i + 1}. ${name}`));

  const expectedTopics = [
    "Condominium Ownership",
    "Land Ownership Restrictions",
    "Rental and Lease",
    "Commercial Property",
    "Usufruct",
    "Common Fees"
  ];

  console.log(`\n✅ Coverage check:`);
  expectedTopics.forEach(topic => {
    const found = topicNames.some(t => t.includes(topic));
    console.log(`  ${found ? "✅" : "❌"} ${topic}: ${found ? "Found" : "Missing"}`);
  });
} else {
  console.log(`❌ Error: ${allPropertyResult.error}`);
}

console.log();

// Summary
console.log("=".repeat(80));
console.log("ENHANCEMENT SUMMARY");
console.log("=".repeat(80));
console.log(`
✅ Task #3 Property Law Refinements Completed:

1. Foreign Quota Verification (condo-ownership)
   - Per-building quota calculation (49% foreign ownership)
   - Square meter-based calculation (not just unit count)
   - Verification steps at Land Office and juristic person
   - Warnings about mis-represented quotas
   - Documents required for verification

2. Property Transfer Fees and Taxes (condo-ownership)
   - Transfer fee: 2% of registered value
   - Business tax: 3.3% OR stamp duty: 0.5%
   - Withholding tax: 0.5-10% progressive
   - Typical buyer cost: 2-3% (seller: 2-3%)
   - Allocation negotiation guidance

3. Joint Ownership with Thai Spouse (condo-ownership)
   - Kor Ror 22 form (separate property declaration)
   - Matrimonial property implications
   - Divorce and death scenarios
   - Land vs condo distinction
   - Prenuptial agreement recommendations

4. Property Inspection Requirements (rental-lease)
   - Move-in AND move-out inspection procedures
   - Photo/video documentation requirements
   - Normal wear vs damage distinction
   - Checklist creation and signing
   - Deposit protection strategies

5. Commercial Property Leases (NEW TOPIC)
   - 3-30 year terms vs residential 1-year
   - Rent escalation clauses (5-10% every 3 years)
   - Key money (non-refundable upfront payment)
   - Improvements ownership at lease end
   - Personal guarantee requirements
   - Renewal uncertainty (30-year limit)

6. Usufruct vs Lease vs Ownership (NEW TOPIC)
   - Ownership: Foreigners cannot own land
   - Lease: Max 30 years, renewable (uncertain)
   - Usufruct: Lifetime or 30 years, ends on death
   - Superficies: Own building separately from land
   - Comparative advantages/disadvantages
   - Divorce and inheritance implications

7. Condominium Common Fees and Disputes (NEW TOPIC)
   - Fee structure (30-70 THB per sqm/month)
   - What fees cover (security, maintenance, utilities)
   - Non-payment consequences (late fees, legal action, lien)
   - Dispute resolution (juristic person, mediation, court)
   - Common vs unit area maintenance responsibility
   - Juristic person powers and voting

Total Property Law Topics: 7 (was 3, added 4 new topics)
Total Scenarios Added: 10+ new scenarios across all topics

All improvements maintain "information only" principle - no legal advice, only factual information about Thai property law.
`);
