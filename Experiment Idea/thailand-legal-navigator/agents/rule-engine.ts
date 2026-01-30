/**
 * AGENT 2: RULE ENGINE
 *
 * Responsibility:
 * - Match user profile against predefined decision trees
 * - Identify legally applicable categories
 *
 * Allowed outputs:
 * - Applicable visa categories
 * - Applicable paperwork domains
 * - Risk indicators (non-judgmental)
 *
 * Forbidden:
 * - Recommendations
 * - Opinions
 * - Predictions
 */

import type {
  UserProfile,
  RuleEngineOutput,
  VisaCategory,
  PaperworkDomain,
  TaxExposureLevel,
  RiskIndicator,
  AgentResponse,
  VisaType,
} from "@/types";

// ============================================================================
// NATIONALITY DATA
// ============================================================================

/**
 * Visa-exempt countries (as of 2025)
 * Source: Thai Immigration Bureau
 * Note: Duration varies by nationality (30-90 days)
 */
const VISA_EXEMPT_COUNTRIES = [
  // Americas
  "usa", "canada", "brazil", "argentina", "chile", "peru", "mexico",

  // Europe - Schengen
  "austria", "belgium", "czech republic", "denmark", "estonia", "finland",
  "france", "germany", "greece", "hungary", "iceland", "italy", "latvia",
  "liechtenstein", "lithuania", "luxembourg", "malta", "netherlands", "norway",
  "poland", "portugal", "slovakia", "slovenia", "spain", "sweden", "switzerland",

  // Europe - Non-Schengen
  "uk", "ireland",

  // Asia
  "japan", "south korea", "singapore", "malaysia", "hong kong", "macau",
  "brunei", "philippines", "vietnam", "indonesia", "laos", "mongolia",

  // Middle East
  "israel", "turkey", "uae", "bahrain", "oman", "qatar", "kuwait",

  // Oceania
  "australia", "new zealand",

  // Africa
  "south africa",

  // Add more as per official list
].map(c => c.toLowerCase());

/**
 * Visa-on-arrival countries (15 days, 2000 THB at airport)
 * Source: Thai Immigration Bureau
 */
const VISA_ON_ARRIVAL_COUNTRIES = [
  "andorra", "bulgaria", "bhutan", "china", "cyprus", "ethiopia",
  "fiji", "georgia", "india", "kazakhstan", "latvia", "lithuania",
  "maldives", "malta", "mauritius", "papua new guinea", "romania",
  "san marino", "saudi arabia", "taiwan", "uzbekistan", "vanuatu",
].map(c => c.toLowerCase());

// ============================================================================
// DECISION TREES
// ============================================================================

export class RuleEngine {
  /**
   * Main entry point: Analyze user profile and return applicable rules
   */
  analyze(profile: UserProfile): AgentResponse<RuleEngineOutput> {
    try {
      // Calculate tax exposure once and pass to dependent methods
      const taxExposure = this.assessTaxExposure(profile);

      const applicableVisaCategories = this.matchVisaCategories(profile);
      const requiredPaperwork = this.determinePaperwork(profile, taxExposure);
      const riskIndicators = this.identifyRisks(profile, taxExposure);

      const output: RuleEngineOutput = {
        applicableVisaCategories,
        requiredPaperwork,
        taxExposure,
        riskIndicators,
        warnings: this.generateWarnings(profile, taxExposure),
      };

      return {
        success: true,
        data: output,
      };
    } catch (error) {
      return {
        success: false,
        error: `Rule engine analysis failed: ${error}`,
      };
    }
  }

  // ============================================================================
  // VISA CATEGORY MATCHING
  // ============================================================================

  private matchVisaCategories(profile: UserProfile): VisaCategory[] {
    // Use Map to deduplicate visa types and keep highest priority
    const categoriesMap = new Map<VisaType, VisaCategory>();

    /**
     * Helper to add category with deduplication
     * If category exists, keeps the one with highest priority
     */
    const addCategory = (category: VisaCategory) => {
      const existing = categoriesMap.get(category.type);
      if (!existing || this.priorityValue(category.priority) > this.priorityValue(existing.priority)) {
        categoriesMap.set(category.type, category);
      }
    };

    // DECISION TREE 1: Tourist vs Long Stay
    if (profile.intendedStayDuration === "short-term") {
      // Short-term stay (< 90 days)
      const canUseExempt = this.canUseVisaExempt(profile);

      addCategory({
        type: "tourist-visa-exempt",
        isApplicable: canUseExempt,
        reason: canUseExempt
          ? "Nationality may qualify for visa exemption (verify duration with Thai embassy)"
          : "Visa exemption may not apply for this nationality; tourist visa required",
        priority: canUseExempt ? "primary" : "secondary",
      });

      // Visa on Arrival (for eligible countries)
      const canUseVoA = this.canUseVisaOnArrival(profile);
      if (canUseVoA) {
        addCategory({
          type: "tourist-visa-on-arrival",
          isApplicable: true,
          reason: "Visa on Arrival available at Thai airports (15 days, 2000 THB)",
          priority: "secondary",
        });
      }

      // Tourist visa TR (available to all)
      addCategory({
        type: "tourist-visa-tr",
        isApplicable: true,
        reason: "Tourist visa (TR) can be obtained for short-term stays (60 days + 30 day extension)",
        priority: canUseExempt ? "secondary" : "primary",
      });
    }

    // DECISION TREE 2: Employment
    if (profile.willWorkInThailand || profile.purposeOfStay.includes("employment")) {
      addCategory({
        type: "non-immigrant-b",
        isApplicable: true,
        reason: "Employment in Thailand requires Non-Immigrant B visa and work permit",
        priority: "primary",
      });
    }

    // DECISION TREE 3: Digital Nomad / Remote Work
    if (
      profile.purposeOfStay.includes("digital-nomad") &&
      !profile.willWorkInThailand &&
      profile.hasForeignIncome
    ) {
      // DTV (Destination Thailand Visa) - for digital nomads/remote workers
      // Enhanced: Check financial requirements and qualifying activities
      const meetsFinancialRequirement = (profile.monthlyIncome ?? 0) * 36 >= 500000; // ~500,000 THB in bank/proof of income

      // DTV has multiple qualifying categories as of 2025:
      // 1. Remote workers employed by foreign companies
      // 2. Freelancers with foreign clients
      // 3. Soft power activities (Muay Thai training, Thai cooking classes, medical treatment, seminars)
      const dtvReason = meetsFinancialRequirement
        ? "DTV (Destination Thailand Visa) may apply for: (1) remote workers employed abroad, (2) freelancers with foreign clients, (3) participants in Thai soft power activities (Muay Thai, cooking classes, medical treatment). Requires proof of 500,000 THB equivalent in bank or income documentation."
        : "DTV requires financial proof (~500,000 THB in bank or equivalent foreign income). Current estimated income: ~" +
          Math.round((profile.monthlyIncome ?? 0) * 36) + " THB/year. Verify specific requirements for your qualifying activity category.";

      addCategory({
        type: "dtv-visa",
        isApplicable: meetsFinancialRequirement,
        reason: dtvReason,
        priority: meetsFinancialRequirement ? "primary" : "possible",
      });

      // Tourist visa TR as fallback
      addCategory({
        type: "tourist-visa-tr",
        isApplicable: true,
        reason: "Tourist visa can be used for short-term stays while working remotely for foreign companies (not Thai companies). Immigration may question frequent entries on tourist visas.",
        priority: meetsFinancialRequirement ? "secondary" : "primary",
      });
    }

    // DECISION TREE 4: Retirement
    if (profile.purposeOfStay.includes("retirement")) {
      // Check if age/income data provided
      if (!profile.age || !profile.monthlyIncome) {
        addCategory({
          type: "non-immigrant-o",
          isApplicable: false,
          reason: "Retirement visa eligibility requires age and income information (age 50+, financial proof required: 800,000 THB in Thai bank OR 65,000 THB/month pension OR combination method: 400,000 THB + monthly income)",
          priority: "primary",
        });
      } else {
        const meetsAgeRequirement = profile.age >= 50;

        // Financial requirements (updated 2025):
        // Method 1: 800,000 THB in Thai bank (must season for 2-3 months before application)
        // Method 2: 65,000 THB/month pension (proof required)
        // Method 3: Combination (400,000 THB in bank + monthly income totaling 800,000 THB annually)
        const monthlyIncomeThb = profile.monthlyIncome * 36; // Rough conversion at ~36 THB/USD
        const annualIncomeThb = monthlyIncomeThb * 12;

        const meetsIncomeRequirement = monthlyIncomeThb >= 65000; // 65,000 THB/month
        const meetsBankRequirement = annualIncomeThb >= 800000; // Assuming annual income shows ability to maintain 800k
        const meetsCombinationPotential = annualIncomeThb >= 400000; // Can potentially use combination method

        let reason: string;
        let isApplicable: boolean;

        if (!meetsAgeRequirement) {
          reason = `Retirement visa requires age 50+ (currently ${profile.age}). Financial requirements: (1) 800,000 THB in Thai bank account (must season 2-3 months), OR (2) 65,000 THB/month pension income, OR (3) combination of 400,000 THB in bank + monthly income.`;
          isApplicable = false;
        } else if (meetsIncomeRequirement || meetsBankRequirement) {
          reason = "May qualify for Non-O retirement visa. Financial options: (1) 800,000 THB in Thai bank (2-3 month seasoning required), (2) 65,000 THB/month pension, (3) combination method (400,000 THB + income). Verify exact requirements at your immigration office.";
          isApplicable = true;
        } else if (meetsCombinationPotential) {
          reason = `May qualify using combination method: deposit 400,000 THB in Thai bank + show monthly income. Total must equal 800,000 THB annually. Current estimated income: ~${Math.round(annualIncomeThb)} THB/year. Verify with immigration office.`;
          isApplicable = true;
        } else {
          reason = `Financial requirements not met. Need: (1) 800,000 THB in bank, OR (2) 65,000 THB/month, OR (3) combination totaling 800,000 THB/year. Current estimated income: ~${Math.round(annualIncomeThb)} THB/year.`;
          isApplicable = false;
        }

        addCategory({
          type: "non-immigrant-o",
          isApplicable,
          reason,
          priority: "primary",
        });
      }
    }

    // DECISION TREE 5: Family / Thai Spouse / Thai Children
    if (profile.purposeOfStay.includes("family") || profile.hasThaiSpouse) {
      // Enhanced: Different requirements for Thai spouse vs Thai children
      let reason: string;

      if (profile.hasThaiSpouse) {
        // Thai spouse visa requirements:
        // - Marriage certificate (legalized by Thai embassy if married abroad)
        // - 400,000 THB in Thai bank (seasoned 2 months) OR 40,000 THB/month income
        const monthlyIncomeThb = (profile.monthlyIncome ?? 0) * 36;
        const annualIncomeThb = monthlyIncomeThb * 12;

        const meetsFinancialRequirement =
          annualIncomeThb >= 400000 || monthlyIncomeThb >= 40000;

        reason = meetsFinancialRequirement
          ? "Non-O visa can be obtained for Thai spouse. Requirements: (1) marriage certificate (legalized by Thai embassy if married abroad), (2) financial proof: 400,000 THB in Thai bank account (2-month seasoning) OR 40,000 THB/month income. Note: 1-year extension requires home visit by immigration."
          : `Non-O visa for Thai spouse requires financial proof: (1) 400,000 THB in bank OR (2) 40,000 THB/month income. Current estimated income: ~${Math.round(annualIncomeThb)} THB/year. Also requires marriage certificate legalized by Thai embassy.`;
      } else if (profile.purposeOfStay.includes("family")) {
        // Family could include Thai children (different from spouse)
        // Thai child visa requirements:
        // - Child's Thai birth certificate
        // - Usually no financial requirement (or lower than spouse visa)
        // - May require proof of relationship (DNA test in some cases)
        reason =
          "Non-O visa can be obtained for supporting Thai national family members. If for Thai child: requires child's Thai birth certificate and proof of relationship. Financial requirements may be lower than Thai spouse visa (verify with immigration). If for elderly Thai parent: different requirements apply.";
      } else {
        reason =
          "Non-O visa can be obtained for family purposes (supporting Thai national). Specific requirements vary: Thai spouse (400,000 THB financial proof), Thai child (birth certificate, minimal financial proof), Thai parent (different criteria). Verify specific requirements for your family situation.";
      }

      addCategory({
        type: "non-immigrant-o",
        isApplicable: true,
        reason,
        priority: "primary",
      });
    }

    // DECISION TREE 6: Education
    if (profile.purposeOfStay.includes("education")) {
      // Enhanced: Different requirements for universities vs language schools
      // University: Legitimate degree programs, easier extensions
      // Language school: Strict attendance requirements (80% minimum), immigration scrutiny increased after 2024
      // Other: Muay Thai schools, cooking schools (may now qualify for DTV instead of ED)

      const reason =
        "Non-ED visa applies for students enrolled in legitimate Thai educational institutions. Requirements: (1) acceptance letter from school, (2) proof of tuition payment, (3) maintain 80% minimum attendance for visa extensions. Note: Language school ED visas face increased immigration scrutiny as of 2024-2025 (frequent attendance checks, school visits). Universities: easier extensions. Alternative: DTV visa now available for Muay Thai training, Thai cooking courses (500,000 THB financial proof required).";

      addCategory({
        type: "non-immigrant-ed",
        isApplicable: true,
        reason,
        priority: "primary",
      });

      // Add DTV as possible alternative for soft power education
      addCategory({
        type: "dtv-visa",
        isApplicable: true,
        reason:
          "DTV visa (soft power category) may be an alternative for Muay Thai training, Thai cooking classes, or cultural courses. Requires 500,000 THB financial proof. May be preferable to ED visa for short-term courses to avoid attendance monitoring.",
        priority: "possible",
      });
    }

    // DECISION TREE 7: SMART Visa (Skilled Professionals)
    if (
      profile.willWorkInThailand &&
      profile.purposeOfStay.includes("employment")
    ) {
      // SMART Visa for highly-skilled professionals in targeted industries
      // (Science, Technology, Engineering, Arts, and targeted sectors)
      const hasRequiredIncome = (profile.monthlyIncome ?? 0) >= 3500; // ~100,000 THB/month threshold

      addCategory({
        type: "smart-visa",
        isApplicable: hasRequiredIncome,
        reason: hasRequiredIncome
          ? "SMART Visa may apply for highly-skilled professionals in targeted industries (verify sector eligibility and qualification requirements)"
          : "SMART Visa requires high income threshold (~100,000 THB/month) and specific industry qualifications",
        priority: hasRequiredIncome ? "possible" : "secondary",
      });
    }

    // DECISION TREE 8: Long-term stay options (> 1 year)
    if (profile.intendedStayDuration === "long-term") {
      // LTR Visa (Long-Term Resident)
      if (profile.monthlyIncome && profile.monthlyIncome >= 6700) {
        // ~80k USD/year threshold for some LTR categories
        addCategory({
          type: "ltr-visa",
          isApplicable: true,
          reason: "LTR visa may apply for high-income individuals (verify specific category requirements: Wealthy Global Citizen, Work-from-Thailand Professional, etc.)",
          priority: "possible",
        });
      }

      // Elite Visa (membership-based)
      addCategory({
        type: "elite-visa",
        isApplicable: true,
        reason: "Elite visa provides long-term stay option (5-20 years, membership-based, verify cost)",
        priority: "possible",
      });
    }

    // DECISION TREE 9: COVID-era visa transitions (for users with special extensions)
    // Note: COVID amnesty ended in 2021, COVID extensions ended in 2022, but some users may still be affected
    if (
      profile.currentVisaType &&
      (profile.currentVisaType.includes("tourist") ||
        profile.currentVisaType === "tourist-visa-exempt")
    ) {
      // If user has been in Thailand continuously since COVID era (pre-2022), they may need guidance
      // This is informational - we can't detect COVID extension holders automatically
      // Add risk indicator in risk section instead
    }

    // Convert map to array and sort by priority
    return Array.from(categoriesMap.values()).sort((a, b) =>
      this.priorityValue(b.priority) - this.priorityValue(a.priority)
    );
  }

  // ============================================================================
  // PAPERWORK DETERMINATION
  // ============================================================================

  private determinePaperwork(
    profile: UserProfile,
    taxExposure: TaxExposureLevel
  ): PaperworkDomain[] {
    const paperwork: PaperworkDomain[] = [];

    // Visa extension needed?
    if (
      profile.intendedStayDuration === "medium-term" ||
      profile.intendedStayDuration === "long-term"
    ) {
      paperwork.push("visa-extension");
    }

    // 90-day reporting applies to all long-term stays
    if (
      profile.currentLocation === "in-thailand" &&
      profile.intendedStayDuration !== "short-term"
    ) {
      paperwork.push("90-day-reporting");
    }

    // TM30 reporting (required for all foreigners staying in Thailand)
    if (profile.currentLocation === "in-thailand") {
      paperwork.push("tm30-reporting");
    }

    // Work permit required for employment
    if (profile.willWorkInThailand) {
      paperwork.push("work-permit");
    }

    // Driving license
    if (profile.needsDrivingLicense) {
      paperwork.push("driving-license");
    }

    // Vehicle registration
    if (profile.needsVehicleOwnership) {
      paperwork.push("vehicle-registration");
    }

    // Residence certificate (needed for many administrative tasks)
    if (
      profile.needsDrivingLicense ||
      profile.needsVehicleOwnership ||
      profile.needsBankAccount
    ) {
      paperwork.push("residence-certificate");
    }

    // Bank account
    if (profile.needsBankAccount) {
      paperwork.push("bank-account");
    }

    // Tax filing determination (use pre-calculated taxExposure)
    if (taxExposure === "likely" || taxExposure === "certain") {
      paperwork.push("tax-filing");
    }

    return paperwork;
  }

  // ============================================================================
  // TAX EXPOSURE ASSESSMENT
  // ============================================================================

  private assessTaxExposure(profile: UserProfile): TaxExposureLevel {
    // Key factors:
    // - 180+ days in Thailand = tax resident
    // - Thai-sourced income = always taxable
    // - Foreign income remitted to Thailand = taxable (2024 rules)

    const isLongStay = profile.intendedStayDuration === "long-term";
    const isMediumStay = profile.intendedStayDuration === "medium-term";
    const hasTaxableIncome = profile.hasThaiIncome || profile.hasForeignIncome;

    // No taxable income
    if (!hasTaxableIncome) {
      return "none";
    }

    // Thai-sourced income is always taxable
    if (profile.hasThaiIncome) {
      return "certain";
    }

    // Long-term stay with foreign income (likely tax resident)
    if (isLongStay && profile.hasForeignIncome) {
      return "likely";
    }

    // Medium-term stay with foreign income (might reach 180 days)
    if (isMediumStay && profile.hasForeignIncome) {
      return "possible";
    }

    return "possible";
  }

  // ============================================================================
  // RISK IDENTIFICATION
  // ============================================================================

  private identifyRisks(
    profile: UserProfile,
    taxExposure: TaxExposureLevel
  ): RiskIndicator[] {
    const risks: RiskIndicator[] = [];

    // Digital nomad on tourist visa risk
    if (
      profile.purposeOfStay.includes("digital-nomad") &&
      (profile.currentVisaType === "tourist-visa-exempt" ||
       profile.currentVisaType === "tourist-visa-tr")
    ) {
      risks.push({
        type: "immigration",
        severity: "warning",
        description:
          "Working remotely on tourist visa may be questioned at immigration. Verify latest digital nomad visa options (DTV).",
      });
    }

    // Employment without proper visa
    if (profile.willWorkInThailand && !profile.currentVisaType?.includes("non-immigrant-b")) {
      risks.push({
        type: "immigration",
        severity: "critical",
        description:
          "Employment in Thailand without proper work authorization (Non-B visa + work permit) is illegal.",
      });
    }

    // Tax residency risk
    if (taxExposure === "likely" || taxExposure === "certain") {
      risks.push({
        type: "tax",
        severity: "warning",
        description:
          "Tax residency may apply. Consult with a Thai tax advisor regarding filing obligations and foreign income reporting.",
      });
    }

    // Visa overstay risk
    if (
      profile.intendedStayDuration === "long-term" &&
      (profile.currentVisaType === "tourist-visa-exempt" ||
       profile.currentVisaType === "tourist-visa-tr")
    ) {
      risks.push({
        type: "immigration",
        severity: "critical",
        description:
          "Tourist visa/exemption is not suitable for long-term stay. Visa extension or different visa category required.",
      });
    }

    // Multiple tourist entries warning (enhanced: visa run vs border run distinction)
    if (
      profile.currentVisaType === "tourist-visa-exempt" &&
      profile.intendedStayDuration !== "short-term"
    ) {
      risks.push({
        type: "immigration",
        severity: "warning",
        description:
          "Extended stays on visa exemption using 'border runs' (leaving and re-entering on visa exemption) trigger immigration scrutiny. Definitions: (1) 'Border run' = exit/re-enter on visa exemption (increasingly questioned, especially by land border). (2) 'Visa run' = exit to obtain new visa (more acceptable but still scrutinized if frequent). Immigration officers may deny entry after 2-3 consecutive visa exempt entries, especially at land borders (limited to 2 land entries per calendar year as of 2024). Air entries: more flexible but not unlimited. Consider proper long-term visa (Non-O, DTV, etc.) to avoid denial of entry.",
      });
    }

    // Visa-on-Arrival limitations
    if (
      profile.currentVisaType === "tourist-visa-on-arrival" &&
      profile.intendedStayDuration !== "short-term"
    ) {
      risks.push({
        type: "immigration",
        severity: "critical",
        description:
          "Visa-on-Arrival (VoA) is strictly for short stays (15 days max, obtainable only at airports, costs 2000 THB). Cannot be extended. Multiple consecutive VoA entries may be denied. Not suitable for extended stays - consider tourist visa (TR) or longer-term visa category.",
      });
    }

    // Land border entry limitations (2024 rule)
    if (
      profile.currentVisaType === "tourist-visa-exempt" &&
      profile.currentLocation === "in-thailand"
    ) {
      risks.push({
        type: "immigration",
        severity: "info",
        description:
          "Land border visa-exempt entries limited to 2 times per calendar year (as of 2024 rule). If planning multiple entries, use air entry (more flexible) or obtain proper tourist visa (TR). Exceeding 2 land entries may result in denial at border checkpoint.",
      });
    }

    // COVID-era visa transition warning
    // For users who may still be on old COVID extensions or haven't transitioned properly
    if (
      profile.currentLocation === "in-thailand" &&
      profile.daysInThailand &&
      profile.daysInThailand > 365 &&
      (profile.currentVisaType === "tourist-visa-exempt" ||
        profile.currentVisaType === "tourist-visa-tr")
    ) {
      risks.push({
        type: "immigration",
        severity: "warning",
        description:
          "Long-term continuous stay on tourist visa/exemption may indicate need to transition to proper visa category. If you received COVID-era extensions (2020-2022): these have expired and you must transition to a proper long-term visa (Non-O, Non-B, Non-ED, DTV, etc.). Continuing on tourist visas after extended stay may result in immigration questioning or denial of entry/extension.",
      });
    }

    // New DTV visa holders - 90-day reporting reminder
    if (profile.currentVisaType === "dtv-visa") {
      risks.push({
        type: "immigration",
        severity: "info",
        description:
          "DTV visa holders must comply with 90-day reporting (every 90 consecutive days in Thailand) and TM30 registration (within 24 hours of arrival at residence). DTV is valid for 5 years with 180-day stays per entry. Can be extended for additional 180 days (total 360 days per year). Verify work restrictions: remote work for foreign companies only, not Thai clients.",
      });
    }

    return risks;
  }

  // ============================================================================
  // WARNING GENERATION
  // ============================================================================

  private generateWarnings(
    profile: UserProfile,
    taxExposure: TaxExposureLevel
  ): string[] {
    const warnings: string[] = [];

    // Office variability warning
    warnings.push(
      "Immigration requirements may vary by office location. Verify specific requirements with your local immigration office. Bangkok Immigration Office in Muang Thong Thani tends to have stricter interpretation than provincial offices."
    );

    // Rule change warning (updated for 2025-2026)
    warnings.push(
      "Thai immigration and tax rules are subject to change. This analysis is based on rules current as of early 2025-2026. Recent major changes: (1) DTV visa launched in 2024, (2) Land border visa-exempt limit (2/year) implemented 2024, (3) Tax on foreign remittances clarified in 2024-2025. Verify current rules with official sources."
    );

    // Tax warning
    if (taxExposure !== "none") {
      warnings.push(
        "Tax obligations depend on multiple factors including days in Thailand and income source. Professional tax advice is recommended. Note: 2024 tax law changes affect foreign income remitted to Thailand - previously only same-year remittances were taxable, now all remittances may be taxable if you're a tax resident (180+ days)."
      );
    }

    // DTV warning (if applicable)
    if (profile.purposeOfStay.includes("digital-nomad")) {
      warnings.push(
        "DTV (Destination Thailand Visa) launched in 2024. Categories: (1) Digital Nomads/Remote Workers, (2) Freelancers, (3) Soft Power (Muay Thai, cooking, medical treatment, seminars). Requires 500,000 THB proof. Valid 5 years, 180 days per entry, extendable once for 180 days (total 360 days/year). Verify latest requirements and application process at Thai embassy/consulate in your country."
      );
    }

    // Retirement visa warning (if applicable)
    if (profile.purposeOfStay.includes("retirement")) {
      warnings.push(
        "Retirement visa financial requirements strictly enforced: 800,000 THB must be seasoned in Thai bank account for 2-3 months BEFORE application, then maintained at 400,000+ THB throughout the year. Some offices require funds to return to 800,000 THB 2-3 months before annual extension. Verify exact seasoning requirements with your immigration office."
      );
    }

    // Family visa warning (if applicable)
    if (profile.hasThaiSpouse || profile.purposeOfStay.includes("family")) {
      warnings.push(
        "Family/Thai spouse visa extensions often require home visit by immigration officers to verify genuine relationship. Prepare: photos of couple together, joint utility bills, witness statements from neighbors. Visit is usually scheduled but can be unannounced. Some offices more strict than others."
      );
    }

    // Student visa warning (if applicable)
    if (profile.purposeOfStay.includes("education")) {
      warnings.push(
        "Student (ED) visa scrutiny increased significantly in 2024-2025, especially for language schools. Immigration now conducts attendance checks, unannounced school visits, and student interviews. Language schools must report absences. 80% minimum attendance required. Fake schools shut down. ED visa holders working illegally face deportation and blacklisting. Consider DTV visa for soft power courses (Muay Thai, cooking) as alternative."
      );
    }

    // Multiple entry warning
    if (
      profile.currentVisaType === "tourist-visa-exempt" &&
      profile.currentLocation === "in-thailand"
    ) {
      warnings.push(
        "Frequent visa-exempt entries ('border runs') increasingly questioned by immigration. After 2-3 consecutive entries (especially by land), immigration may: (1) question purpose of stay, (2) require proof of funds/accommodation/onward travel, (3) deny entry. Land border crossings limited to 2 per calendar year. If staying long-term, obtain proper visa category to avoid denial of entry."
      );
    }

    return warnings;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Check if nationality qualifies for visa exemption
   */
  private canUseVisaExempt(profile: UserProfile): boolean {
    return VISA_EXEMPT_COUNTRIES.includes(profile.nationality.toLowerCase());
  }

  /**
   * Check if nationality qualifies for visa on arrival
   */
  private canUseVisaOnArrival(profile: UserProfile): boolean {
    return VISA_ON_ARRIVAL_COUNTRIES.includes(profile.nationality.toLowerCase());
  }

  /**
   * Convert priority to numeric value for comparison
   */
  private priorityValue(priority: "primary" | "secondary" | "possible"): number {
    return { primary: 3, secondary: 2, possible: 1 }[priority] || 0;
  }
}
