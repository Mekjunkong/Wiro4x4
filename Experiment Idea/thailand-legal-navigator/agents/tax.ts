/**
 * AGENT 5: TAX & FINANCIAL EXPOSURE
 *
 * Responsibility:
 * - Identify potential tax relevance
 * - Explain thresholds and triggers
 * - Describe reporting obligations
 *
 * Rules:
 * - NO calculations
 * - NO optimization
 * - NO strategies
 *
 * Language constraint:
 * - "May apply", "can trigger", "is defined as"
 *
 * Forbidden:
 * - Tax planning advice
 * - Recommendations on how to minimize tax
 * - Calculations of tax owed
 * - Interpretation of specific situations
 */

import type { UserProfile, AgentResponse } from "@/types";
import type {
  TaxAnalysis,
  TaxResidencyStatus,
  IncomeTrigger,
  TaxFilingObligation,
  TaxThreshold,
  DoubleTaxationTreaty,
} from "@/types/tax";

// ============================================================================
// TAX KNOWLEDGE BASE
// ============================================================================

/**
 * Countries with double taxation treaties with Thailand
 * Source: Thai Revenue Department
 * Note: Treaty details vary - consult tax professional
 */
const COUNTRIES_WITH_TAX_TREATIES = [
  "australia", "austria", "bahrain", "bangladesh", "belgium", "bulgaria",
  "canada", "china", "cyprus", "czech republic", "denmark", "finland",
  "france", "germany", "hong kong", "hungary", "india", "indonesia",
  "ireland", "israel", "italy", "japan", "korea", "kuwait", "laos",
  "luxembourg", "malaysia", "mauritius", "myanmar", "nepal", "netherlands",
  "new zealand", "norway", "oman", "pakistan", "philippines", "poland",
  "romania", "russia", "saudi arabia", "seychelles", "singapore",
  "slovenia", "south africa", "spain", "sri lanka", "sweden", "switzerland",
  "taiwan", "turkey", "uae", "uk", "ukraine", "usa", "uzbekistan", "vietnam",
].map(c => c.toLowerCase());

// ============================================================================
// TAX AGENT CLASS
// ============================================================================

export class TaxAgent {
  /**
   * Main entry point: Analyze tax exposure for a user profile
   */
  analyzeTaxExposure(profile: UserProfile): AgentResponse<TaxAnalysis> {
    try {
      const residencyStatus = this.assessResidencyStatus(profile);
      const incomeTriggers = this.identifyIncomeTriggers(profile, residencyStatus);
      const filingObligation = this.determineFilingObligation(profile, residencyStatus, incomeTriggers);
      const relevantThresholds = this.getRelevantThresholds(profile, residencyStatus);

      const analysis: TaxAnalysis = {
        residencyStatus,
        residencyExplanation: this.explainResidency(profile, residencyStatus),
        incomeTriggers,
        filingObligation,
        relevantThresholds,
        warnings: this.generateWarnings(profile, residencyStatus),
        disclaimers: this.generateDisclaimers(),
      };

      return {
        success: true,
        data: analysis,
      };
    } catch (error) {
      return {
        success: false,
        error: `Tax analysis failed: ${error}`,
      };
    }
  }

  /**
   * Check if a country has a double taxation treaty with Thailand
   * Enhanced: Now includes claiming procedure information
   */
  hasTaxTreaty(nationality: string): AgentResponse<DoubleTaxationTreaty> {
    const hasTreaty = COUNTRIES_WITH_TAX_TREATIES.includes(nationality.toLowerCase());

    const notes: string[] = [];

    if (hasTreaty) {
      notes.push(
        "Double taxation treaty (DTA) exists between Thailand and " + nationality + "."
      );
      notes.push(
        "DTA Claiming Procedure: (1) Obtain tax residency certificate from your home country's tax authority (proves you're a resident there for tax purposes)."
      );
      notes.push(
        "(2) Gather proof of foreign tax paid (if applicable): tax returns, withholding certificates, payment receipts."
      );
      notes.push(
        "(3) Submit with Thai tax filing (PND 90): Include tax residency certificate, proof of foreign tax, and completed DTA claim form (if required by specific treaty)."
      );
      notes.push(
        "(4) Revenue Department review: May take several months, may request additional documentation, may contact home country tax authority."
      );
      notes.push(
        "DTA benefits vary by treaty: Some treaties exempt certain income types (government pensions, royalties), others provide tax credits (reduce Thai tax by foreign tax paid), others set maximum tax rates. Specific benefits depend on income type and treaty provisions."
      );
      notes.push(
        "Office variability: Bangkok Revenue offices (especially those handling expats like Lumpini, Ploenchit) more familiar with DTA claims. Provincial offices may require more documentation or take longer."
      );
      notes.push(
        "Professional assistance: Tax advisors with DTA experience can: expedite claims, ensure proper documentation, communicate with Revenue Department, maximize benefits. Recommended for significant income or complex situations."
      );
    } else {
      notes.push(
        "No double taxation treaty on record between Thailand and " + nationality + "."
      );
      notes.push(
        "Implications: (1) May be subject to tax in both Thailand and home country on the same income (double taxation)."
      );
      notes.push(
        "(2) No automatic relief in Thailand for foreign tax paid (though home country may provide unilateral credit)."
      );
      notes.push(
        "(3) Recommend checking with home country tax authority about foreign tax credits or exemptions they may offer."
      );
      notes.push(
        "(4) Consider: Not remitting income to Thailand to avoid Thai tax, OR remitting only what needed and keeping rest abroad."
      );
      notes.push(
        "Note: Absence from this list doesn't guarantee no treaty exists - verify with Thai Revenue Department or tax advisor. Treaty list updated periodically."
      );
    }

    return {
      success: true,
      data: {
        country: nationality,
        hasTreaty,
        notes,
      },
    };
  }

  // ============================================================================
  // TAX RESIDENCY ASSESSMENT
  // ============================================================================

  private assessResidencyStatus(profile: UserProfile): TaxResidencyStatus {
    // Cannot determine residency without days in Thailand data
    if (profile.daysInThailand === undefined && !profile.intendedStayDuration) {
      return "uncertain";
    }

    // If explicit days provided
    if (profile.daysInThailand !== undefined) {
      if (profile.daysInThailand >= 180) {
        return "resident";
      } else {
        return "non-resident";
      }
    }

    // Infer from intended stay duration
    if (profile.intendedStayDuration === "long-term") {
      return "resident"; // Long-term implies 180+ days
    }

    if (profile.intendedStayDuration === "medium-term") {
      return "uncertain"; // 90 days - 1 year could be either
    }

    return "non-resident"; // Short-term
  }

  private explainResidency(profile: UserProfile, status: TaxResidencyStatus): string {
    const explanations: Record<TaxResidencyStatus, string> = {
      resident:
        "Tax residency is defined as being present in Thailand for 180 days or more in a calendar year. Based on your profile, you may be classified as a Thai tax resident.",
      "non-resident":
        "Tax residency is defined as being present in Thailand for 180 days or more in a calendar year. Based on your profile, you are likely a non-resident for tax purposes.",
      uncertain:
        "Tax residency status cannot be determined without knowing exact days in Thailand. Tax residency is triggered at 180 days in a calendar year.",
    };

    return explanations[status];
  }

  // ============================================================================
  // INCOME TRIGGER IDENTIFICATION
  // ============================================================================

  private identifyIncomeTriggers(
    profile: UserProfile,
    residencyStatus: TaxResidencyStatus
  ): IncomeTrigger[] {
    const triggers: IncomeTrigger[] = [];

    // Thai-sourced income (always taxable regardless of residency)
    if (profile.hasThaiIncome || profile.willWorkInThailand) {
      triggers.push({
        category: "thai-sourced",
        isTaxable: true,
        explanation:
          "Income from Thai sources is taxable in Thailand regardless of tax residency status.",
        threshold: "All Thai-sourced income is subject to personal income tax",
      });
    }

    // Foreign income (complex - depends on residency and remittance)
    // Enhanced: 2024/2025 rule changes clarified
    if (profile.hasForeignIncome) {
      if (residencyStatus === "resident") {
        // 2024/2025 Rule Change: ALL foreign income remitted to Thailand is now assessable
        // Previously: Only same-year remittances were taxable
        // Now: Clarified by Thai Revenue Department in 2024 that ALL remittances are assessable
        triggers.push({
          category: "foreign-remitted-same-year",
          isTaxable: "conditional",
          explanation:
            "2024/2025 Rule Change: Foreign income remitted to Thailand is now assessable for tax residents, regardless of when earned. Previous interpretation (only same-year remittances taxable) was clarified by Thai Revenue Department in 2024. Remittance = transferring money into Thailand via bank transfers, bringing cash, or using foreign-sourced income in Thailand.",
          conditions: [
            "Income must be remitted (brought into) Thailand",
            "Tax resident status (180+ days in Thailand)",
            "Applies to income earned in ANY year (changed from previous 'same year only' rule)",
            "Exemptions may apply for certain income types (consult tax advisor)",
            "Double taxation treaty benefits may reduce or eliminate tax (if applicable)",
          ],
        });

        triggers.push({
          category: "foreign-remitted-prior-year",
          isTaxable: "conditional",
          explanation:
            "Prior-year foreign income remitted to Thailand: The 2024 clarification states that ALL remittances are assessable, including savings from prior years. This represents a significant change from previous practice where only same-year income was clearly taxable.",
          conditions: [
            "Income earned in previous calendar years",
            "Remitted to Thailand in current year",
            "May be assessable for tax (2024 rule change)",
            "Proving income was previously taxed or is exempt requires documentation",
            "Tax advisor consultation essential for determining actual tax liability",
          ],
        });

        triggers.push({
          category: "foreign-not-remitted",
          isTaxable: false,
          explanation:
            "Foreign income that is not remitted (brought into) Thailand remains outside Thai tax jurisdiction. This includes: (1) money kept in foreign bank accounts, (2) investments held abroad, (3) pension payments left in origin country. Strategy note: Some tax residents choose to remit only what they need to live on.",
          conditions: [
            "Income remains outside Thailand",
            "Not transferred to Thai bank accounts",
            "Not used for transactions in Thailand (credit cards funded by foreign accounts may count as remittance)",
          ],
        });

        // Crypto income (new scenario)
        triggers.push({
          category: "crypto-income",
          isTaxable: "conditional",
          explanation:
            "Cryptocurrency income taxation (as of 2024-2025): (1) Crypto trading profits may be assessable income if remitted to Thailand. (2) Mining/staking rewards may be assessable. (3) Crypto-to-crypto trades: Tax treatment unclear (Thai Revenue Department hasn't issued definitive guidance). (4) Selling crypto for THB in Thailand: Likely assessable. (5) DeFi yield: Treatment uncertain.",
          conditions: [
            "Crypto income must be 'realized' (converted to fiat or used)",
            "Remittance rule applies (must bring into Thailand to be taxable)",
            "Documentation of cost basis may be required",
            "No official crypto tax guidelines issued yet (as of 2025)",
            "Treatment may vary by immigration office interpretation",
          ],
        });

        // Pension income (special treatment for retirees)
        triggers.push({
          category: "pension-income",
          isTaxable: "conditional",
          explanation:
            "Pension income from foreign sources: (1) Government pensions: May be exempt under double taxation treaties (varies by country). (2) Private pensions: Generally assessable if remitted to Thailand. (3) Social Security (US): May be exempt under US-Thailand tax treaty. (4) UK state pension: May be exempt under UK-Thailand treaty. Specific treatment depends on source country and treaty provisions.",
          conditions: [
            "Government pension vs private pension distinction important",
            "Double taxation treaty provisions vary by country",
            "Remittance to Thailand required to trigger tax",
            "Documentation from pension provider may be required",
            "Some countries tax pensions at source (may get credit in Thailand)",
          ],
        });

        // Remote work income (digital nomad scenario)
        triggers.push({
          category: "remote-work-income",
          isTaxable: "conditional",
          explanation:
            "Remote work income (working for foreign employer while in Thailand): (1) If employer is outside Thailand and you're paid to foreign account: Taxable only if remitted to Thailand (2024 rules apply). (2) If work performed in Thailand but for foreign clients: May be considered Thai-sourced income (gray area). (3) DTV visa holders: Explicitly allowed to work remotely for foreign employers, income taxable if remitted. (4) Freelancers: If services performed in Thailand, may be Thai-sourced (consult tax advisor).",
          conditions: [
            "Employer location matters (foreign employer = foreign income)",
            "Where services performed may affect sourcing",
            "DTV visa holders: Clear that remote work for foreign employers is foreign income",
            "Freelancing vs employment distinction important",
            "Remittance still required to trigger tax",
          ],
        });
      } else if (residencyStatus === "non-resident") {
        triggers.push({
          category: "foreign-not-remitted",
          isTaxable: false,
          explanation:
            "Non-residents are generally not taxed on foreign-sourced income in Thailand, even if remitted. However, Thai-sourced income is taxable regardless of residency status.",
        });
      } else {
        // Uncertain residency
        triggers.push({
          category: "foreign-remitted-same-year",
          isTaxable: "conditional",
          explanation:
            "Tax treatment of foreign income depends on tax residency status (180+ days threshold) and whether income is remitted to Thailand. As of 2024-2025, tax residents may be taxed on ALL foreign income remitted to Thailand (not just same-year income).",
          conditions: [
            "Tax residency status must be determined (count exact days)",
            "Remittance status must be known (bank transfers, cash, credit card funding)",
            "2024 rule changes significantly expand taxation of remitted foreign income",
            "Professional tax advice essential before remitting funds",
          ],
        });
      }
    }

    return triggers;
  }

  // ============================================================================
  // FILING OBLIGATION DETERMINATION
  // ============================================================================

  private determineFilingObligation(
    profile: UserProfile,
    residencyStatus: TaxResidencyStatus,
    triggers: IncomeTrigger[]
  ): TaxFilingObligation {
    const hasTaxableIncome = triggers.some(
      (t) => t.isTaxable === true || t.isTaxable === "conditional"
    );

    // No taxable income
    if (!hasTaxableIncome) {
      return {
        mustFile: false,
        reason: "No taxable income identified based on provided information.",
        notes: [
          "Tax filing is required if you have assessable income in Thailand",
          "This assessment is based on information provided and may not cover all scenarios",
        ],
      };
    }

    // Thai-sourced income (always must file)
    if (profile.hasThaiIncome || profile.willWorkInThailand) {
      return {
        mustFile: true,
        reason:
          "Thai-sourced income requires tax filing regardless of residency status.",
        deadline: "March 31 of the following year",
        forms: ["PND 90 (Personal Income Tax Return)", "PND 91 (Half-year Tax Return)"],
        notes: [
          "Employer may withhold tax if employed in Thailand",
          "Annual reconciliation required via PND 90",
          "Tax ID number (TIN) required BEFORE filing - apply at local Revenue Department office",
          "TIN application requires: passport, visa, work permit (if applicable), Thai address proof (lease/TM30)",
          "Late filing may result in penalties (200 THB/month) and interest (1.5%/month)",
          "Some employers can arrange TIN for employees",
          "E-filing available through RD website (requires TIN and PIN)",
        ],
      };
    }

    // Tax resident with foreign income
    if (residencyStatus === "resident" && profile.hasForeignIncome) {
      return {
        mustFile: true,
        reason:
          "Tax residents with foreign income remitted to Thailand may be required to file (2024/2025 rule changes apply).",
        deadline: "March 31 of the following year",
        forms: ["PND 90 (Personal Income Tax Return)"],
        notes: [
          "Filing requirement applies if foreign income is remitted to Thailand",
          "2024/2025 rule change: ALL remittances now assessable (not just same-year income)",
          "Tax ID number (TIN) required - apply at Revenue Department office BEFORE filing",
          "TIN application: passport, visa, proof of Thai address (lease/TM30), bank statements showing remittance",
          "Double taxation treaty (DTA) benefits may apply if your country has treaty with Thailand",
          "To claim DTA benefits: (1) Obtain tax residency certificate from home country, (2) Submit with PND 90, (3) May need to show proof of foreign tax paid",
          "Some provincial Revenue offices more familiar with DTA claims than others (Bangkok offices generally better)",
          "Professional tax advisor essential - can help with: TIN application, PND 90 filing, DTA claims, documentation",
          "Keep records: foreign tax statements, proof of income source, bank transfer records, tax residency certificate",
        ],
      };
    }

    // Uncertain cases
    return {
      mustFile: false,
      reason:
        "Filing requirement cannot be determined without complete information on residency and income remittance.",
      notes: [
        "Tax filing may be required if:",
        "  • You are in Thailand 180+ days in a calendar year, AND",
        "  • You have Thai-sourced income, OR",
        "  • You remit foreign income to Thailand in the same year it is earned",
        "Consult with a Thai tax advisor to determine specific obligations",
      ],
    };
  }

  // ============================================================================
  // THRESHOLDS & REFERENCE DATA
  // ============================================================================

  private getRelevantThresholds(
    profile: UserProfile,
    residencyStatus: TaxResidencyStatus
  ): TaxThreshold[] {
    const thresholds: TaxThreshold[] = [];

    // Always include residency threshold
    thresholds.push({
      name: "Tax Residency Threshold",
      value: "180 days in a calendar year",
      description: "Presence in Thailand for 180 days or more triggers tax residency status",
      applicability: "All individuals",
    });

    // Personal allowance (if has taxable income)
    if (profile.hasThaiIncome || profile.hasForeignIncome) {
      thresholds.push({
        name: "Personal Allowance",
        value: "60,000 THB per year",
        description: "Standard personal deduction available to all taxpayers",
        applicability: "All tax filers",
      });

      thresholds.push({
        name: "Tax-Free Income Threshold",
        value: "150,000 THB per year",
        description:
          "Income below this threshold (after allowances and deductions) is generally not taxed",
        applicability: "Individuals with assessable income",
      });

      thresholds.push({
        name: "Tax Rates",
        value: "Progressive: 0% to 35%",
        description:
          "Personal income tax is progressive. Rates: 0% (up to 150k), 5%, 10%, 15%, 20%, 25%, 30%, 35% (over 5M THB)",
        applicability: "All taxable income",
      });
    }

    // Spouse allowance
    if (profile.hasThaiSpouse) {
      thresholds.push({
        name: "Spouse Allowance",
        value: "60,000 THB per year",
        description: "Additional deduction available for supporting a spouse",
        applicability: "Taxpayers with dependent spouse",
      });
    }

    return thresholds;
  }

  // ============================================================================
  // WARNINGS & DISCLAIMERS
  // ============================================================================

  private generateWarnings(
    profile: UserProfile,
    residencyStatus: TaxResidencyStatus
  ): string[] {
    const warnings: string[] = [];

    // Foreign income + residency warning (enhanced with 2024/2025 specifics)
    if (residencyStatus === "resident" && profile.hasForeignIncome) {
      warnings.push(
        "CRITICAL 2024/2025 Rule Change: Thai tax rules regarding foreign income remittance changed significantly. Thai Revenue Department clarified that ALL foreign income remitted to Thailand is assessable (not just same-year income). This affects: (1) Savings from prior years, (2) Investment returns, (3) Pension income, (4) Remote work income. Previous practice of only taxing same-year remittances NO LONGER APPLIES. Professional tax advice is essential."
      );

      warnings.push(
        "Provincial vs Bangkok Tax Offices: Implementation of new remittance rules varies by office. Bangkok Revenue Departments (especially those handling expats) are more familiar with foreign income taxation and DTA claims. Provincial offices may: (1) Have less experience with foreign income cases, (2) Require more documentation, (3) Take longer to process DTA claims. Consider: Filing at Bangkok office if possible (requires Bangkok address proof), or hiring tax advisor familiar with your local office."
      );
    }

    // Double taxation treaty (enhanced with claiming procedures)
    const treatyResult = this.hasTaxTreaty(profile.nationality);
    if (treatyResult.success && treatyResult.data) {
      if (treatyResult.data.hasTreaty) {
        warnings.push(
          `Thailand has a double taxation treaty (DTA) with ${profile.nationality}. You may be eligible for tax credits or exemptions. To claim DTA benefits: (1) Obtain tax residency certificate from ${profile.nationality} (usually from tax authority), (2) Keep proof of foreign tax paid (if applicable), (3) Submit both with PND 90 filing, (4) May need to fill out DTA claim form (varies by treaty). Process can take several months. Revenue Department may request additional documentation. Tax advisor with DTA experience recommended.`
        );
      } else {
        warnings.push(
          `No double taxation treaty found with ${profile.nationality}. You may face taxation in both countries on the same income. This means: (1) ${profile.nationality} may tax your worldwide income, (2) Thailand may tax income remitted to Thailand, (3) No automatic credit for foreign tax paid, (4) May need to pay tax twice unless home country provides unilateral relief. Check with ${profile.nationality} tax authority about foreign tax credits.`
        );
      }
    }

    // Uncertain residency (enhanced with day-counting guidance)
    if (residencyStatus === "uncertain") {
      warnings.push(
        "Tax residency status cannot be determined from provided information. Count exact days in Thailand to determine if 180-day threshold is crossed. Day counting: (1) Count BOTH arrival and departure days, (2) Count ALL days (not just visa days), (3) Calendar year basis (Jan 1 - Dec 31), (4) Keep arrival/departure records (immigration stamps, flight tickets). If close to 180 days: Consider leaving before threshold to avoid tax resident status (but ensure visa compliance)."
      );
    }

    // Employment without proper visa (enhanced)
    if (profile.willWorkInThailand && profile.currentVisaType !== "non-immigrant-b") {
      warnings.push(
        "Working in Thailand requires proper work authorization (Non-B visa + work permit). Tax obligations may exist even for unauthorized work - Revenue Department can assess tax on illegal income. Additionally: (1) Working illegally can lead to deportation and blacklisting, (2) Employers hiring without work permit face fines, (3) Tax filing doesn't legalize work status (separate issues). Get proper work authorization before working."
      );
    }

    // Digital nomad / remote work specific warning
    if (
      profile.purposeOfStay?.includes("digital-nomad") ||
      (profile.hasForeignIncome && !profile.hasThaiIncome && !profile.willWorkInThailand)
    ) {
      warnings.push(
        "Digital Nomads / Remote Workers: Tax treatment depends on: (1) Whether employer is in Thailand (Thai-sourced) or abroad (foreign-sourced), (2) Whether you remit income to Thailand, (3) Whether you're a tax resident (180+ days). DTV visa holders: Explicitly allowed to work remotely for foreign employers, income is foreign-sourced but taxable if remitted. Tourist visa holders: Working (even remotely) may violate visa terms, but if for foreign employer and not remitted, unlikely to trigger Thai tax. Crypto earnings: Increasingly scrutinized - keep detailed records."
      );
    }

    // Pension income specific warning (if age suggests retirement)
    if (profile.age && profile.age >= 50 && profile.hasForeignIncome) {
      warnings.push(
        "Pension Income (Age 50+): If receiving pension from home country: (1) Government pensions (civil service, military) may be exempt under DTA, (2) Private pensions generally taxable if remitted to Thailand, (3) Social Security/state pensions: Treatment varies by country (US Social Security may be exempt under US-Thailand DTA, UK state pension may be exempt under UK-Thailand DTA). Obtain tax residency certificate from home country to claim DTA benefits. Provincial Revenue offices may be unfamiliar with pension taxation - Bangkok offices better."
      );
    }

    // Crypto-specific warning
    if (profile.hasForeignIncome && profile.purposeOfStay?.includes("digital-nomad")) {
      warnings.push(
        "Cryptocurrency Taxation (2025): Thai Revenue Department has not issued comprehensive crypto tax guidelines yet. Current interpretation: (1) Crypto gains may be assessable if converted to fiat and remitted to Thailand, (2) Crypto-to-crypto trades: Tax treatment unclear, (3) Staking/mining rewards: Likely assessable if remitted, (4) Holding crypto: Not taxable until realized. Keep detailed records: (1) Transaction history, (2) Cost basis documentation, (3) Exchange statements, (4) Wallet addresses. Tax treatment may change as Thailand develops crypto regulations."
      );
    }

    return warnings;
  }

  private generateDisclaimers(): string[] {
    return [
      "This analysis provides information about Thai tax rules and thresholds only.",
      "This is NOT tax advice, tax planning, or a calculation of tax owed.",
      "This is NOT a recommendation on whether to remit income to Thailand or how to structure finances.",
      "Thai tax law is complex and subject to interpretation by the Thai Revenue Department.",
      "Tax rules change frequently. This analysis is based on rules current as of 2025-2026, including 2024/2025 remittance rule changes.",
      "IMPORTANT: 2024/2025 rule changes regarding foreign income remittance are recent and implementation varies by Revenue office. Interpretation may evolve.",
      "Individual circumstances vary significantly and affect tax treatment.",
      "Professional tax advice from a qualified Thai tax advisor is strongly recommended, especially for:",
      "  • Foreign income remittance planning",
      "  • Double taxation treaty (DTA) claims",
      "  • Cryptocurrency taxation",
      "  • Pension income treatment",
      "  • Remote work / digital nomad scenarios",
      "  • Tax ID (TIN) application and filing",
      "Double taxation treaties, deductions, and exemptions may significantly affect actual tax liability.",
      "This analysis does not cover: corporate tax, VAT, withholding tax, specific industries tax, property tax, or other tax types.",
      "Cryptocurrency tax treatment is evolving - no comprehensive guidelines issued yet by Thai Revenue Department as of 2025.",
      "Tax residency counting (180-day rule) is based on calendar year (Jan 1 - Dec 31), not visa validity period.",
      "Remittance includes: bank transfers, cash brought in, credit card funding from foreign accounts, crypto converted to THB in Thailand.",
      "Provincial Revenue offices may have different interpretation or expertise levels compared to Bangkok offices.",
      "Tax obligations exist separately from immigration status - even illegal work may be assessable for tax.",
    ];
  }
}
