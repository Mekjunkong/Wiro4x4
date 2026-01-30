/**
 * AGENT 10: LEGAL INFORMATION
 *
 * Responsibility:
 * - Provide factual information about Thai law
 * - Explain legal requirements and restrictions
 * - Describe legal processes and required documents
 *
 * Scope:
 * - Property & Real Estate Law
 * - Business & Commercial Law
 * - Employment Law
 *
 * Forbidden:
 * - Legal advice or recommendations
 * - Interpretation of specific situations
 * - Predictions of legal outcomes
 * - Opinions on legal strategies
 *
 * Language constraints:
 * - "Thai law defines..."
 * - "The law requires..."
 * - "According to [specific law]..."
 * - "Legal provisions state..."
 */

import type { AgentResponse } from "@/types";
import type {
  LegalTopic,
  LegalDomain,
  LegalScenario,
  PropertyLegalInfo,
  BusinessLegalInfo,
  EmploymentLegalInfo,
  LegalResourceDirectory,
} from "@/types/legal";

// ============================================================================
// LEGAL INFORMATION AGENT
// ============================================================================

export class LegalAgent {
  /**
   * Get legal information for a specific topic
   */
  getLegalInfo(domain: LegalDomain, topicKey: string): AgentResponse<LegalTopic> {
    let topic: LegalTopic | undefined;

    switch (domain) {
      case "property":
        topic = PROPERTY_LAW_DATABASE[topicKey];
        break;
      case "business":
        topic = BUSINESS_LAW_DATABASE[topicKey];
        break;
      case "employment":
        topic = EMPLOYMENT_LAW_DATABASE[topicKey];
        break;
    }

    if (!topic) {
      return {
        success: false,
        error: `No legal information found for ${domain}/${topicKey}`,
      };
    }

    return {
      success: true,
      data: topic,
    };
  }

  /**
   * Get all topics in a legal domain
   */
  getDomainTopics(domain: LegalDomain): AgentResponse<LegalTopic[]> {
    let topics: LegalTopic[] = [];

    switch (domain) {
      case "property":
        topics = Object.values(PROPERTY_LAW_DATABASE);
        break;
      case "business":
        topics = Object.values(BUSINESS_LAW_DATABASE);
        break;
      case "employment":
        topics = Object.values(EMPLOYMENT_LAW_DATABASE);
        break;
    }

    return {
      success: true,
      data: topics,
    };
  }

  /**
   * Get legal resource directory
   */
  getLegalResources(category?: string): AgentResponse<LegalResourceDirectory[]> {
    const resources = category
      ? LEGAL_RESOURCES.filter((r) => r.category === category)
      : LEGAL_RESOURCES;

    return {
      success: true,
      data: resources,
    };
  }
}

// ============================================================================
// PROPERTY LAW DATABASE
// ============================================================================

const PROPERTY_LAW_DATABASE: Record<string, LegalTopic> = {
  "condo-ownership": {
    domain: "property",
    topic: "Condominium Ownership by Foreigners",
    description:
      "Thai law allows foreigners to own condominium units under specific conditions and restrictions.",
    relevantLaws: [
      "Condominium Act B.E. 2522 (1979)",
      "Land Code Amendment Act",
      "Foreign Business Act B.E. 2542 (1999)",
    ],
    keyPoints: [
      "Foreigners can own condominium units (not land) in Thailand",
      "Foreign ownership in any condominium building is limited to 49% of total unit space",
      "Remaining 51% must be Thai-owned",
      "Funds must be brought from abroad with proper documentation (Foreign Exchange Transaction Form)",
      "Unit must be registered at Land Office in foreign name",
      "Foreign ownership quota is calculated per building, not per development",
    ],
    requiredDocuments: [
      "Passport",
      "Foreign Exchange Transaction Form (FET) or proof of foreign currency transfer",
      "Sale and Purchase Agreement",
      "Condominium ownership transfer documents",
      "Proof of funds origin (bank statements, wire transfer confirmation)",
    ],
    officialResources: [
      "Land Department (www.dol.go.th)",
      "Bank of Thailand (for FET forms)",
      "Local Land Office for registration",
    ],
    commonScenarios: [
      {
        scenario: "Purchasing a condo unit from developer",
        whatTheLawSays:
          "Thai law requires funds for purchase to be transferred from abroad in foreign currency. A Foreign Exchange Transaction Form (FET) must be obtained from receiving bank as proof.",
        requiredSteps: [
          "Transfer funds from foreign bank account in foreign currency",
          "Receive FET form from Thai bank",
          "Complete sale agreement with developer",
          "Register ownership at Land Office",
          "Verify building's foreign ownership quota is not exceeded",
        ],
        typicalDocuments: [
          "FET form",
          "Passport",
          "Sale agreement",
          "Building ownership documents",
        ],
        governmentOffice: "Land Department Office",
        notes: [
          "FET form is critical - without it, ownership may not be registered in foreign name",
          "Building must have remaining foreign quota available",
          "Registration must be completed within timeframe specified in sale agreement",
        ],
      },
      {
        scenario: "Inheriting a condo from Thai spouse",
        whatTheLawSays:
          "Foreign heirs inheriting property from Thai nationals may face restrictions. Thai law may require sale or transfer to comply with foreign ownership limits.",
        prohibitions: [
          "Foreigners cannot inherit land (only buildings/condos)",
          "Inherited condo may need to be sold if building foreign quota exceeded",
        ],
        notes: [
          "Estate and inheritance law is complex",
          "Professional legal counsel strongly recommended",
          "Tax implications for inheritance",
        ],
      },
      {
        scenario: "Verifying foreign quota before purchase",
        whatTheLawSays:
          "Thai law requires condominium buildings to maintain no more than 49% foreign ownership. Buyers should verify available quota BEFORE transfer.",
        requiredSteps: [
          "Request foreign quota certificate from condominium juristic person",
          "Verify at Land Office that building has not exceeded 49% foreign ownership",
          "Check that specific unit being purchased is not already counted in foreign quota",
          "Ensure quota availability in writing before payment",
        ],
        typicalDocuments: [
          "Foreign ownership quota certificate (from condo juristic person)",
          "Building registration documents",
          "List of foreign-owned units in building",
        ],
        governmentOffice: "Land Department Office, Condominium Juristic Person",
        notes: [
          "Foreign quota is calculated per building, NOT per development (multi-building condos have separate quotas)",
          "Quota can be exhausted even if building is not fully sold",
          "If quota exhausted, unit must be registered in Thai name (lease arrangement possible)",
          "Developers sometimes mis-represent available quota - verify independently",
          "Quota calculation uses total square meters, not number of units",
        ],
      },
      {
        scenario: "Property transfer fees and taxes",
        whatTheLawSays:
          "Thai law requires payment of transfer fees and taxes when ownership changes. Rates: (1) Transfer fee: 2% of registered value, (2) Stamp duty: 0.5% of registered value OR Business tax: 3.3% of registered value (if sold within 5 years by company), (3) Withholding tax: Progressive 0.5-10% based on registered value. Total typically 4-6% of property value.",
        typicalDocuments: [
          "Sale agreement showing agreed allocation of costs",
          "Transfer fee payment receipts",
          "Tax payment receipts (business tax or stamp duty)",
          "Withholding tax payment receipt",
        ],
        notes: [
          "Transfer fee: Usually split 50/50 between buyer and seller (negotiable)",
          "Business tax vs stamp duty: Cannot pay both - one or the other applies",
          "Withholding tax: Seller's responsibility but buyer often pays to complete transfer",
          "Registered value may be lower than sale price (but risky - tax authorities can challenge)",
          "Land Office will not register transfer until all fees/taxes paid",
          "Budget 5-6% of purchase price for fees/taxes (buyer's side: typically 2-3%)",
        ],
      },
      {
        scenario: "Joint ownership with Thai spouse",
        whatTheLawSays:
          "Thai law allows foreigners married to Thai nationals to purchase property jointly, but land cannot be owned by foreigner. Condominium purchase requires declaration that funds are spouse's separate property (not matrimonial).",
        requiredSteps: [
          "Obtain marriage certificate (translated and legalized if married abroad)",
          "Sign declaration at Land Office that funds are Thai spouse's separate property",
          "Transfer funds showing Thai spouse as source (or sign statement that foreign funds are gift to Thai spouse)",
          "Complete transfer in Thai spouse's name (for land) or joint names (for condo if quota available)",
        ],
        requiredDocuments: [
          "Marriage certificate",
          "Kor Ror 22 form (declaration of separate property)",
          "Both spouses' passports/IDs",
          "Proof of funds",
        ],
        typicalDocuments: [
          "Signed declaration that foreign spouse has no claim to property",
          "Statement that property is Thai spouse's separate property under Section 1471 of Civil & Commercial Code",
        ],
        governmentOffice: "Land Department Office",
        prohibitions: [
          "Foreign spouse cannot be beneficial owner of land",
          "Cannot use matrimonial property (jointly owned assets during marriage) to buy land in foreign name",
        ],
        notes: [
          "This declaration protects Land Office but has complex legal implications for divorce/death",
          "If marriage dissolves: foreign spouse may have limited claim despite funding purchase",
          "If Thai spouse dies: foreign spouse may not inherit land (only buildings)",
          "Prenuptial agreement recommended to clarify ownership",
          "Consult family law attorney before purchasing in Thai spouse's name",
          "Some foreigners uncomfortable signing declaration they have 'no claim' to property they funded",
        ],
      },
    ],
    restrictions: [
      "Cannot own land (only the condo unit)",
      "Cannot exceed 49% foreign ownership in building",
      "Cannot purchase with Thai-sourced funds and register in foreign name (must use foreign funds)",
      "Cannot own property near borders or military installations (additional restrictions)",
    ],
    disclaimers: [
      "This is legal information only, not legal advice",
      "Property law is complex and fact-specific",
      "Consult a licensed Thai property lawyer before any transaction",
      "Laws and regulations are subject to change",
      "Individual circumstances may require different approaches",
    ],
  },

  "land-ownership": {
    domain: "property",
    topic: "Land Ownership Restrictions for Foreigners",
    description:
      "Thai law generally prohibits foreigners from owning land, with limited exceptions.",
    relevantLaws: [
      "Land Code B.E. 2497 (1954)",
      "Land Code Amendment",
      "Foreign Business Act B.E. 2542 (1999)",
    ],
    keyPoints: [
      "Foreigners generally CANNOT own land in Thailand",
      "Land can be leased for up to 30 years (renewable)",
      "Thai companies with majority Thai ownership can own land",
      "Foreign spouse of Thai national cannot own land (even through marriage)",
      "Exception: Investment of 40 million THB or more under Board of Investment (BOI)",
      "Structures on land (buildings/houses) can be owned separately from land",
    ],
    restrictions: [
      "No direct land ownership by foreigners (with rare exceptions)",
      "Cannot use nominee structure (Thai person holding land for foreigner) - this is illegal",
      "Cannot circumvent restrictions through marriage",
      "Leases exceeding 30 years are void",
    ],
    commonScenarios: [
      {
        scenario: "Long-term lease of land",
        whatTheLawSays:
          "Thai law allows land to be leased to foreigners for up to 30 years. Lease must be registered at Land Office to be enforceable.",
        requiredSteps: [
          "Negotiate lease agreement with Thai landowner",
          "Register lease at Land Department Office",
          "Pay registration fee (approximately 1% of total lease value)",
          "Ensure lease terms do not exceed 30 years",
        ],
        typicalDocuments: [
          "Passport",
          "Lease agreement",
          "Land title deed (Chanote)",
          "Landowner's ID",
        ],
        governmentOffice: "Land Department Office",
        notes: [
          "Verbal agreements are not enforceable for land leases",
          "Registration is essential for legal protection",
          "Renewal clauses for additional 30-year terms are legally uncertain",
        ],
      },
      {
        scenario: "Buying land through Thai company",
        whatTheLawSays:
          "A Thai company with at least 51% Thai ownership can own land. However, using Thai nominees (Thai shareholders with no real investment) to circumvent foreign ownership restrictions is illegal under Thai law.",
        prohibitions: [
          "Nominee structures are illegal and void",
          "Authorities can investigate and void transactions",
          "Criminal penalties may apply for nominee arrangements",
        ],
        notes: [
          "Legitimate Thai companies with genuine Thai shareholders can own land",
          "Nominee structures are high-risk and may result in loss of property",
          "Legal advice essential before pursuing this structure",
        ],
      },
    ],
    officialResources: [
      "Land Department (www.dol.go.th)",
      "Ministry of Interior",
      "Board of Investment (for BOI exceptions)",
    ],
    penalties: [
      "Void transactions if nominee structure discovered",
      "Possible criminal prosecution for fraudulent land acquisition",
      "Forced sale of illegally held land",
    ],
    disclaimers: [
      "Land law in Thailand is strict and heavily enforced",
      "Attempting to circumvent restrictions is illegal and risky",
      "Professional legal counsel is essential for any land-related transaction",
      "This is information only, not legal advice",
    ],
  },

  "rental-lease": {
    domain: "property",
    topic: "Rental and Lease Agreements (Residential)",
    description:
      "Thai law governs rental and lease agreements for residential properties.",
    relevantLaws: [
      "Civil and Commercial Code - Book III (Property)",
      "Lease of Immovable Property Act",
    ],
    keyPoints: [
      "Leases under 3 years: oral agreement valid but written recommended",
      "Leases 3+ years: must be in writing and registered at Land Office",
      "Residential rental: typically 1-year contracts",
      "Deposit typically 1-2 months rent (must be returned unless damage)",
      "30-day notice typically required for termination",
      "Property inspection recommended at move-in and move-out",
    ],
    commonScenarios: [
      {
        scenario: "Renting a condominium (residential)",
        whatTheLawSays:
          "Thai law allows oral or written lease agreements for terms under 3 years. Written agreements are enforceable without registration.",
        requiredSteps: [
          "Negotiate rent and terms with landlord",
          "Sign lease agreement (typically 1 year)",
          "Pay deposit (1-2 months) and first month rent",
          "Conduct property inspection and document condition",
          "Receive keys and copies of agreement",
        ],
        typicalDocuments: [
          "Lease agreement",
          "Passport copy",
          "Deposit receipt",
          "Property condition checklist",
        ],
        notes: [
          "Ensure lease is in both Thai and English",
          "Photograph property condition before move-in",
          "Clarify utility payment responsibilities",
          "Understand notice period for termination",
        ],
      },
      {
        scenario: "Early termination of lease",
        whatTheLawSays:
          "Thai law does not automatically allow early termination. Early termination terms must be specified in the lease agreement. Without such clause, tenant may be liable for remaining rent.",
        prohibitions: [
          "Cannot terminate without agreement unless landlord breaches contract",
          "Cannot withhold rent without legal justification",
        ],
        notes: [
          "Negotiate early termination clause before signing",
          "Typical clause: 1-2 months notice + forfeit deposit",
          "Landlord breach may allow termination (e.g., uninhabitable property)",
        ],
      },
      {
        scenario: "Deposit return disputes",
        whatTheLawSays:
          "Thai law requires landlord to return deposit unless legitimate deductions for damage beyond normal wear and tear. Landlord must provide evidence of damage and costs.",
        notes: [
          "Normal wear and tear is landlord's responsibility",
          "Burden of proof for damage is on landlord",
          "Disputes can be resolved through mediation or Small Claims Court",
          "Document property condition at move-in and move-out",
        ],
      },
      {
        scenario: "Property inspection requirements (move-in/move-out)",
        whatTheLawSays:
          "Thai law does not mandate formal property inspections, but they are essential to protect tenant's deposit and document property condition.",
        requiredSteps: [
          "Conduct walk-through inspection with landlord BEFORE signing lease",
          "Document all existing damage, defects, wear with photos/video",
          "Note condition of: walls, floors, appliances, fixtures, furniture",
          "Create written inspection checklist, signed by both parties",
          "Repeat inspection at move-out, compare to move-in condition",
        ],
        typicalDocuments: [
          "Property condition checklist (move-in and move-out)",
          "Timestamped photos of property",
          "Video walkthrough",
          "Signed acknowledgment from landlord",
        ],
        notes: [
          "Best practice: Take photos of EVERYTHING (walls, floors, appliances, even working appliances)",
          "Document utilities (electric/water) meter readings at move-in and move-out",
          "If landlord refuses inspection: major red flag, reconsider renting",
          "WhatsApp photos with landlord present can serve as evidence",
          "Move-out inspection should compare to move-in checklist, not ideal condition",
          "Normal wear: small nail holes, minor scuffs, faded paint (landlord pays)",
          "Damage: large holes, broken fixtures, stains, burns (tenant may pay)",
        ],
      },
    ],
    restrictions: [
      "Leases over 30 years are void",
      "Certain lease terms may be unenforceable if against public policy",
      "Automatic rent increases may be limited",
    ],
    officialResources: [
      "Consumer Protection Board",
      "Small Claims Court (for deposit disputes)",
      "Land Department (for lease registration)",
    ],
    disclaimers: [
      "Rental law varies between residential and commercial property",
      "Individual lease terms supersede general law in many cases",
      "Dispute resolution can be costly - prevention is better",
      "This is information only, not legal advice",
    ],
  },

  "commercial-lease": {
    domain: "property",
    topic: "Commercial Property Leases",
    description:
      "Thai law governs commercial leases differently from residential, with longer terms and different protections.",
    relevantLaws: [
      "Civil and Commercial Code - Book III (Property)",
      "Lease of Immovable Property Act",
    ],
    keyPoints: [
      "Commercial leases typically 3-30 years",
      "Must be registered at Land Office if 3+ years",
      "Less tenant protection than residential leases",
      "Rent increases common (built into contract)",
      "Substantial deposits typical (3-6 months rent)",
      "Early termination penalties more severe",
      "Landlord may require personal guarantee",
    ],
    commonScenarios: [
      {
        scenario: "Leasing commercial space for restaurant/retail",
        whatTheLawSays:
          "Thai law allows commercial leases up to 30 years, must be registered if 3+ years. Commercial leases have fewer statutory protections than residential - contract terms are critical.",
        requiredSteps: [
          "Negotiate lease term (typically 3, 5, or 10 years)",
          "Agree on rent escalation (typically 5-10% every 3 years)",
          "Determine who pays utilities, maintenance, repairs",
          "Negotiate improvements/renovations allowances",
          "Register lease at Land Office (if 3+ years)",
          "Pay registration fee (~1% of total lease value)",
        ],
        typicalDocuments: [
          "Commercial lease agreement",
          "Company registration documents (if business entity)",
          "Personal guarantee (from director/owner)",
          "Deposit receipt (typically 3-6 months)",
          "Land title deed (Chanote)",
        ],
        governmentOffice: "Land Department Office",
        notes: [
          "Commercial leases heavily favor landlords - negotiate carefully",
          "Rent escalation clauses common and binding",
          "Landlord may require 'key money' (non-refundable upfront payment) - negotiable",
          "Improvements: Clarify who owns at end of lease (usually landlord keeps)",
          "Personal guarantee: Director may be personally liable if company defaults",
          "Early termination often requires paying all remaining rent",
        ],
      },
      {
        scenario: "Commercial lease renewal or extension",
        whatTheLawSays:
          "Thai law limits leases to 30 years maximum. Renewal clauses for additional terms are legally uncertain - courts may not enforce automatic renewal beyond initial 30-year limit.",
        requiredSteps: [
          "Review original lease for renewal clauses",
          "Negotiate new terms with landlord (not automatic)",
          "Sign new lease agreement for additional term",
          "Re-register at Land Office (if 3+ years)",
        ],
        notes: [
          "Renewal is NOT guaranteed even if contract states 'renewable'",
          "Landlord can renegotiate terms at renewal (higher rent, different terms)",
          "Total lease term (original + renewals) cannot exceed 30 years per registration",
          "Some leases structured as: 30 years + 30 years (legally questionable, may not be enforceable)",
          "If significant business investment: negotiate longer initial term rather than relying on renewals",
        ],
      },
    ],
    restrictions: [
      "Maximum 30-year lease term",
      "Automatic renewal clauses may not be enforceable",
      "Cannot lease land as foreigner unless building separate structure",
    ],
    officialResources: [
      "Land Department (www.dol.go.th)",
      "Department of Business Development (for business licenses)",
    ],
    disclaimers: [
      "Commercial lease law offers less tenant protection than residential",
      "Contract terms are critical - legal review essential before signing",
      "This is information only, not legal advice",
    ],
  },

  "usufruct-vs-lease": {
    domain: "property",
    topic: "Usufruct vs Lease vs Ownership Rights",
    description:
      "Thai law offers different property rights structures with varying durations and protections.",
    relevantLaws: [
      "Civil and Commercial Code - Sections 1417-1428 (Usufruct)",
      "Civil and Commercial Code - Book III (Lease)",
      "Land Code B.E. 2497 (1954)",
    ],
    keyPoints: [
      "Ownership: Foreigners cannot own land (condos only)",
      "Lease: Maximum 30 years, registered at Land Office",
      "Usufruct: Lifetime right to use property (but max 30 years, extendable)",
      "Superficies: Right to own buildings on someone else's land",
      "Habitation: Personal right to live in property (non-transferable)",
      "Each right offers different protections and durations",
    ],
    commonScenarios: [
      {
        scenario: "Usufruct vs Lease for foreigner married to Thai spouse",
        whatTheLawSays:
          "Thai law allows usufruct (lifetime right to use property) as alternative to lease. Usufruct can be granted for lifetime of holder or maximum 30 years (renewable). Lease is limited to 30 years.",
        requiredSteps: [
          "Decide between lease (30 years) or usufruct (lifetime or 30 years)",
          "Register right at Land Office (both require registration)",
          "Pay registration fee (approximately 1% of property value)",
        ],
        typicalDocuments: [
          "Usufruct agreement or Lease agreement",
          "Land title deed (Chanote)",
          "Marriage certificate (if spouse granting usufruct)",
          "Thai spouse's consent",
        ],
        governmentOffice: "Land Department Office",
        notes: [
          "USUFRUCT: Right to use property for lifetime (or 30 years if specified). Can build, renovate, rent out. Cannot sell land itself. Ends upon death (cannot pass to heirs).",
          "LEASE: Right to use for specified term (max 30 years). Renewable (though renewal not guaranteed). Can be inherited or sold (if contract allows).",
          "OWNERSHIP: Foreigners cannot own land. Can own buildings/structures separately from land.",
          "Usufruct advantages: Can be lifetime (vs 30-year lease), stronger right than lease, harder for owner to terminate.",
          "Usufruct disadvantages: Ends on death (cannot inherit), limited to 30 years if not lifetime, cannot sell the usufruct right easily.",
          "For house on wife's land: Usufruct more secure than lease (wife cannot easily evict).",
          "Divorce risk: Both usufruct and lease can be challenged - prenuptial agreement recommended.",
        ],
      },
      {
        scenario: "Superficies right for building on leased land",
        whatTheLawSays:
          "Thai law allows superficies right - ownership of buildings separate from land ownership. Foreigners can own buildings even if land is owned by Thai national.",
        requiredSteps: [
          "Lease land OR obtain usufruct",
          "Obtain superficies right from landowner",
          "Register superficies at Land Office",
          "Build or purchase buildings",
          "Register building ownership separately",
        ],
        notes: [
          "Superficies allows foreigner to OWN the building while Thai person owns land",
          "Building can be sold independently of land",
          "Superficies typically granted for 30 years (same term as lease)",
          "At end of lease/superficies: building may revert to landowner (unless extended)",
          "Useful for: House on Thai spouse's land, villa on leased land",
        ],
      },
    ],
    restrictions: [
      "Foreigners cannot own land (lease/usufruct only)",
      "Usufruct cannot exceed lifetime or 30 years (renewable)",
      "Usufruct cannot be sold or transferred (ends with holder)",
      "Lease maximum 30 years per term",
    ],
    officialResources: [
      "Land Department (www.dol.go.th)",
      "Local Land Office for registration",
    ],
    penalties: [
      "Unregistered usufruct/lease not enforceable",
      "Verbal agreements void for land rights",
    ],
    disclaimers: [
      "Property rights law is complex and case-specific",
      "Divorce, death, and inheritance significantly affect rights",
      "Professional legal counsel essential for property rights structures",
      "This is information only, not legal advice",
    ],
  },

  "condo-common-fees": {
    domain: "property",
    topic: "Condominium Common Fees and Disputes",
    description:
      "Thai condominium law establishes juristic person to manage common areas, collect fees, and resolve disputes.",
    relevantLaws: [
      "Condominium Act B.E. 2522 (1979)",
      "Civil and Commercial Code",
    ],
    keyPoints: [
      "All condominiums must have juristic person (management entity)",
      "Common fees mandatory for all unit owners",
      "Common fees used for: maintenance, security, utilities for common areas, repairs, reserves",
      "Juristic person has authority over common areas and rules",
      "Unit owners can be sued for unpaid common fees",
      "Disputes resolved through: juristic person, mediation, or courts",
    ],
    commonScenarios: [
      {
        scenario: "Understanding common fee obligations",
        whatTheLawSays:
          "Thai law requires all condominium unit owners to pay common area maintenance fees to juristic person. Fees set by majority vote of co-owners. Non-payment can lead to legal action.",
        requiredSteps: [
          "Understand fee structure (monthly rate per sqm)",
          "Review fee breakdown (what services included)",
          "Budget for fees (typically 30-70 THB per sqm per month)",
          "Pay fees on time to avoid penalties",
        ],
        typicalDocuments: [
          "Common fee invoice (monthly)",
          "Annual budget from juristic person",
          "Fee breakdown (maintenance, security, utilities)",
        ],
        notes: [
          "Common fees typically 30-70 THB per sqm per month (luxury condos: 100+ THB)",
          "Fees cover: security guards, common area electric/water, pool maintenance, elevator maintenance, cleaning, landscaping, management office",
          "Sinking fund: One-time fee for major repairs (roofing, facade, structural)",
          "Fees can increase: Juristic person can vote to raise fees (majority required)",
          "Non-payment consequences: Late fees, legal action, lien on property, cannot sell until fees paid",
        ],
      },
      {
        scenario: "Disputes with juristic person or co-owners",
        whatTheLawSays:
          "Thai law grants juristic person authority to enforce condominium rules and manage common areas. Disputes can be resolved through internal process, mediation, or courts.",
        requiredSteps: [
          "Review condominium rules and bylaws",
          "Raise issue with juristic person committee",
          "Attend co-owner meeting to vote on issues",
          "If unresolved: Mediation through local office or court",
        ],
        notes: [
          "Common disputes: Noise complaints, parking, pet policies, renovations, common fee increases",
          "Juristic person power: Can fine owners for rule violations, restrict access to common areas, sue for unpaid fees",
          "Renovation restrictions: Major renovations require juristic person approval",
          "Voting power: Usually 1 vote per unit (or proportional to ownership percentage)",
          "Majority rules: Juristic person decisions typically require majority vote",
          "Court: Last resort, expensive, time-consuming",
        ],
      },
      {
        scenario: "Common area damage or maintenance issues",
        whatTheLawSays:
          "Thai law assigns responsibility for common area maintenance to juristic person. Common areas include: lobbies, hallways, elevators, pools, gyms, parking, building exterior.",
        requiredSteps: [
          "Report issue to juristic person/management",
          "Document issue with photos/video",
          "Follow up if not resolved within reasonable timeframe",
          "Escalate to committee meeting if necessary",
        ],
        notes: [
          "Common area: Juristic person responsible (paid by common fees)",
          "Unit interior: Owner responsible (except structural issues)",
          "Water leaks from common pipes: Juristic person pays",
          "Water leaks from unit plumbing: Unit owner pays",
          "Delayed maintenance: Juristic person may be liable if negligence causes damage",
          "Major repairs: May require sinking fund or special assessment (voted by co-owners)",
        ],
      },
    ],
    restrictions: [
      "Cannot refuse to pay common fees (even if dispute with juristic person)",
      "Cannot modify common areas without juristic person approval",
      "Cannot violate condominium rules/bylaws",
    ],
    officialResources: [
      "Condominium Juristic Person Office",
      "Land Department (for condominium registration issues)",
      "Consumer Protection Board (for disputes)",
    ],
    penalties: [
      "Late fees for unpaid common fees (typically 1.5% per month)",
      "Legal action and lien on property for non-payment",
      "Fines for rule violations (amount set by bylaws)",
      "Cannot sell unit with outstanding common fee debt",
    ],
    disclaimers: [
      "Condominium law varies by building age and bylaws",
      "Individual condominium rules may be more restrictive than general law",
      "Disputes can be complex - legal advice may be needed",
      "This is information only, not legal advice",
    ],
  },
};

// ============================================================================
// BUSINESS LAW DATABASE
// ============================================================================

const BUSINESS_LAW_DATABASE: Record<string, LegalTopic> = {
  "company-formation": {
    domain: "business",
    topic: "Company Formation in Thailand",
    description:
      "Thai law allows several business entity types with different foreign ownership restrictions.",
    relevantLaws: [
      "Civil and Commercial Code",
      "Foreign Business Act B.E. 2542 (1999)",
      "Limited Partnership, Limited Company, Association and Foundation Act",
    ],
    keyPoints: [
      "Main entity types: Limited Company, Partnership, Branch Office, Representative Office",
      "Foreign ownership restrictions depend on business type",
      "Minimum 3 shareholders required for Limited Company",
      "Minimum 3 directors required (can be same as shareholders)",
      "Registered capital requirements vary by business type",
      "Foreign Business License required for certain businesses",
    ],
    commonScenarios: [
      {
        scenario: "Forming a Thai Limited Company (majority Thai ownership)",
        whatTheLawSays:
          "Thai law allows formation of limited companies with minimum 3 shareholders. If foreign ownership exceeds certain thresholds, business may be subject to Foreign Business Act restrictions.",
        requiredSteps: [
          "Reserve company name with Department of Business Development (DBD)",
          "Prepare Memorandum of Association and Articles of Association",
          "Register company with DBD",
          "Obtain Tax ID from Revenue Department",
          "Register for VAT (if applicable)",
          "Register for Social Security",
          "Obtain necessary business licenses",
        ],
        typicalDocuments: [
          "Memorandum of Association",
          "Articles of Association",
          "Shareholder passports/IDs",
          "Director passports/IDs",
          "Office lease agreement (registered office)",
          "Shareholder meeting minutes",
        ],
        governmentOffice: "Department of Business Development (DBD)",
        notes: [
          "Minimum registered capital: varies by business (typically 1-2 million THB for foreign workers)",
          "Work permit requirements: 2 million THB capital per foreign employee (general rule)",
          "Professional assistance recommended for registration",
        ],
      },
      {
        scenario: "Foreign-owned company (100% foreign ownership)",
        whatTheLawSays:
          "Thai Foreign Business Act restricts foreign ownership in certain business activities. Majority foreign-owned companies may require Foreign Business License (FBL) or qualify for BOI promotion.",
        requiredSteps: [
          "Verify business activity is not on prohibited list",
          "Apply for Foreign Business License if required",
          "OR apply for BOI promotion if eligible",
          "Register company with minimum capital (typically 2-3 million THB for FBL)",
          "Complete standard company registration process",
        ],
        prohibitions: [
          "Certain businesses are prohibited for foreigners (List 1 of FBA)",
          "Restricted businesses require minimum Thai ownership or FBL (Lists 2-3)",
        ],
        notes: [
          "Foreign Business License process is lengthy and complex",
          "BOI promotion offers significant advantages (100% ownership, tax benefits)",
          "Consult specialist for foreign-majority businesses",
        ],
      },
    ],
    restrictions: [
      "Nominee shareholder structures are illegal",
      "Certain businesses restricted or prohibited for foreigners",
      "Minimum capital requirements for work permits",
      "At least 51% Thai ownership required for land ownership",
    ],
    officialResources: [
      "Department of Business Development (www.dbd.go.th)",
      "Board of Investment (www.boi.go.th)",
      "Revenue Department",
      "Ministry of Commerce",
    ],
    penalties: [
      "Operating without proper license: fines and possible imprisonment",
      "Nominee structures: void transactions, criminal liability",
      "False declarations: fines up to 1 million THB",
    ],
    disclaimers: [
      "Business law is complex and varies by industry",
      "Foreign ownership restrictions are strictly enforced",
      "Professional legal and accounting advice essential",
      "This is information only, not legal advice",
    ],
  },

  "foreign-business-restrictions": {
    domain: "business",
    topic: "Foreign Business Act Restrictions",
    description:
      "Thai Foreign Business Act categorizes business activities into three lists with different restriction levels.",
    relevantLaws: ["Foreign Business Act B.E. 2542 (1999)", "Ministerial Regulations under FBA"],
    keyPoints: [
      "List 1: Absolutely prohibited for foreigners (e.g., newspapers, rice farming, land trading)",
      "List 2: Restricted unless Cabinet approval (e.g., certain services)",
      "List 3: Restricted unless Foreign Business License obtained (e.g., retail, construction, legal services)",
      "Foreign = >49% foreign ownership or control",
      "BOI promotion can exempt from FBA restrictions",
      "Treaty of Amity (US-Thai) provides some exemptions",
    ],
    commonScenarios: [
      {
        scenario: "Operating a retail business as foreigner",
        whatTheLawSays:
          "Retail business is on List 3 of Foreign Business Act. Foreign-majority ownership requires Foreign Business License (FBL) or BOI promotion.",
        requiredSteps: [
          "Verify specific business activity classification",
          "Apply for Foreign Business License OR",
          "Apply for BOI promotion (if eligible)",
          "Meet minimum capital requirements (3 million THB for FBL)",
          "Demonstrate benefit to Thailand (employment, technology transfer, etc.)",
        ],
        notes: [
          "FBL approval is discretionary and can take 6-12 months",
          "E-commerce and online retail may face different treatment",
          "BOI promotion much faster but requires meeting investment criteria",
        ],
      },
    ],
    restrictions: [
      "List 1 businesses: absolutely prohibited (special exception only)",
      "Lists 2-3: require license or Thai majority ownership",
      "Treaty of Amity only applies to US nationals",
    ],
    officialResources: [
      "Department of Business Development",
      "Board of Investment",
      "Ministry of Commerce",
    ],
    disclaimers: [
      "FBA enforcement is strict",
      "Business classification can be ambiguous - professional advice needed",
      "This is information only, not legal advice",
    ],
  },
};

// ============================================================================
// EMPLOYMENT LAW DATABASE
// ============================================================================

const EMPLOYMENT_LAW_DATABASE: Record<string, LegalTopic> = {
  "employment-contract": {
    domain: "employment",
    topic: "Employment Contracts and Labor Standards",
    description:
      "Thai labor law establishes minimum standards for employment relationships and working conditions.",
    relevantLaws: [
      "Labor Protection Act B.E. 2541 (1998)",
      "Labor Relations Act B.E. 2518 (1975)",
      "Social Security Act B.E. 2533 (1990)",
    ],
    keyPoints: [
      "Written employment contract recommended but not legally required for all positions",
      "Certain terms are mandatory by law regardless of contract",
      "Maximum working hours: 8 hours/day, 48 hours/week (general work)",
      "Overtime: 1.5x regular rate for weekday OT, 3x for holidays",
      "Minimum wage: varies by province (2024: 330-370 THB/day)",
      "Annual leave: minimum 6 days per year after 1 year of service",
      "Sick leave: 30 days per year with medical certificate",
      "Probation period: typically 119 days (no legal limit but affects severance)",
    ],
    commonScenarios: [
      {
        scenario: "Starting employment with written contract",
        whatTheLawSays:
          "Thai law does not mandate written contracts for all positions, but written contracts provide clarity and are recommended. Contract must comply with Labor Protection Act minimum standards.",
        requiredSteps: [
          "Review employment contract carefully",
          "Ensure minimum wage compliance",
          "Verify working hours and overtime provisions",
          "Confirm leave entitlements (annual, sick, business)",
          "Understand termination notice requirements",
          "Register for Social Security",
        ],
        typicalDocuments: [
          "Employment contract (Thai and English)",
          "Job description",
          "Company policies/employee handbook",
          "Social Security registration",
        ],
        notes: [
          "Contract terms cannot be less favorable than legal minimums",
          "If contract is silent, legal minimums apply",
          "Amendments should be in writing",
        ],
      },
      {
        scenario: "Overtime work requirements",
        whatTheLawSays:
          "Thai labor law limits overtime to 36 hours per week. Employee consent is required for overtime work. Overtime must be compensated at 1.5x regular rate (weekdays), 2x (holidays if regular day off), 3x (holidays if regular work day).",
        prohibitions: [
          "Cannot force overtime without employee consent",
          "Cannot exceed maximum working hours without proper compensation",
          "Cannot use 'salary includes overtime' clause to avoid overtime pay",
        ],
        notes: [
          "Certain positions exempt from overtime rules (managerial, professional)",
          "Employees can refuse unreasonable overtime requests",
          "Detailed time records should be maintained",
        ],
      },
    ],
    restrictions: [
      "Cannot pay below minimum wage",
      "Cannot exceed maximum working hours limits",
      "Cannot deprive employee of minimum statutory benefits",
      "Cannot discriminate based on certain protected characteristics",
    ],
    officialResources: [
      "Department of Labor Protection and Welfare (www.labour.go.th)",
      "Social Security Office",
      "Labor Court (for disputes)",
    ],
    disclaimers: [
      "Employment law is detailed and complex",
      "Individual circumstances may affect rights and obligations",
      "Contracts should be reviewed by legal professionals",
      "This is information only, not legal advice",
    ],
  },

  "termination-severance": {
    domain: "employment",
    topic: "Employment Termination and Severance Pay",
    description:
      "Thai labor law regulates how employment relationships can be terminated and requires severance pay in certain circumstances.",
    relevantLaws: ["Labor Protection Act B.E. 2541 (1998)", "Labor Relations Act"],
    keyPoints: [
      "Notice period: depends on contract and tenure (typically 1 month for monthly employees)",
      "Severance pay: required for termination by employer without cause",
      "Severance rates based on years of service (120 days - 400 days of wages)",
      "No severance if: employee resigns, termination for serious misconduct, end of fixed-term contract",
      "Special termination pay: additional 15 days wages for employees with 6+ months service (certain conditions)",
      "Unfair dismissal protections exist",
    ],
    commonScenarios: [
      {
        scenario: "Employer terminating without cause (redundancy, restructuring)",
        whatTheLawSays:
          "Thai law requires employer to pay severance if terminating employment without employee fault. Severance amount depends on length of service.",
        requiredSteps: [
          "Provide advance notice (per contract or law)",
          "Calculate severance: 120-400 days wages depending on tenure",
          "Pay all outstanding wages, unused leave",
          "Provide employment certificate",
          "Process Social Security termination",
        ],
        notes: [
          "Severance calculation: <1 year=30 days, 1-3 years=90 days, 3-6 years=180 days, 6-10 years=240 days, 10-20 years=300 days, 20+ years=400 days",
          "Payment in lieu of notice may be possible",
          "Special termination payment may apply (15 days wages)",
        ],
      },
      {
        scenario: "Employee resignation (voluntary)",
        whatTheLawSays:
          "Thai law allows employees to resign with proper notice (per contract). No severance pay is due from employer for voluntary resignation.",
        requiredSteps: [
          "Provide written resignation letter",
          "Work notice period (typically 1 month for monthly employees)",
          "OR negotiate immediate release with employer consent",
          "Complete handover procedures",
          "Receive final wages and unused leave payment",
        ],
        notes: [
          "Notice period per contract (if longer than legal requirement)",
          "Employer cannot compel employee to stay beyond reasonable notice",
          "Employee may forfeit bonuses or benefits if leaving before scheduled payment",
        ],
      },
      {
        scenario: "Termination for serious misconduct",
        whatTheLawSays:
          "Thai Labor Protection Act allows immediate termination without severance for serious misconduct (dishonesty, willful disobedience, assault, criminal conviction causing damage, etc.).",
        prohibitions: [
          "Employer must have clear evidence of misconduct",
          "Burden of proof is on employer",
          "Minor infractions do not justify summary dismissal",
        ],
        notes: [
          "Examples of serious misconduct: theft, fraud, assault, repeated gross negligence",
          "Warning system recommended for minor issues",
          "Unfair dismissal claims can be filed with Labor Court",
        ],
      },
    ],
    penalties: [
      "Unfair dismissal: reinstatement or compensation up to 1 year wages",
      "Failure to pay severance: employee can sue for payment plus damages",
    ],
    officialResources: [
      "Department of Labor Protection and Welfare",
      "Labor Court",
      "Tripartite Committee for Labor Relations",
    ],
    disclaimers: [
      "Termination law is complex with many exceptions",
      "Documentation is critical for both employers and employees",
      "Unfair dismissal claims should be filed within 60 days",
      "This is information only, not legal advice",
    ],
  },
};

// ============================================================================
// LEGAL RESOURCES DIRECTORY
// ============================================================================

const LEGAL_RESOURCES: LegalResourceDirectory[] = [
  {
    category: "government-offices",
    resources: [
      {
        name: "Land Department",
        type: "Government Office",
        specialty: ["Property registration", "Land ownership", "Leases"],
        website: "www.dol.go.th",
        notes: ["Handles all property registration", "Branch offices in every province"],
      },
      {
        name: "Department of Business Development (DBD)",
        type: "Government Office",
        specialty: ["Company registration", "Business licenses"],
        website: "www.dbd.go.th",
        notes: ["Company registration", "Foreign Business Licenses"],
      },
      {
        name: "Board of Investment (BOI)",
        type: "Government Office",
        specialty: ["Investment promotion", "BOI privileges"],
        website: "www.boi.go.th",
        notes: ["Offers tax and non-tax benefits for qualifying businesses"],
      },
      {
        name: "Department of Labor Protection and Welfare",
        type: "Government Office",
        specialty: ["Labor law", "Employment disputes"],
        website: "www.labour.go.th",
        notes: ["Enforces labor protection laws", "Handles complaints"],
      },
      {
        name: "Labor Court",
        type: "Court",
        specialty: ["Employment disputes", "Unfair dismissal", "Severance claims"],
        notes: ["Specialized court for labor matters", "Can order reinstatement or compensation"],
      },
    ],
  },
  {
    category: "embassies",
    resources: [
      {
        name: "Embassy Contact for Nationals",
        type: "Embassy/Consulate",
        notes: [
          "Can provide list of local lawyers",
          "Cannot provide legal advice",
          "Can assist with legal emergencies (arrest, detention)",
        ],
      },
    ],
  },
  {
    category: "lawyers",
    resources: [
      {
        name: "Thai Bar Association",
        type: "Professional Association",
        website: "www.lawyerscouncil.or.th",
        notes: [
          "Can provide referrals to licensed lawyers",
          "Verify lawyer credentials",
          "File complaints about lawyer misconduct",
        ],
      },
    ],
  },
  {
    category: "legal-aid",
    resources: [
      {
        name: "Legal Aid Office (Department of Rights and Liberties Protection)",
        type: "Government Legal Aid",
        notes: [
          "Free legal assistance for qualifying individuals",
          "Income requirements apply",
          "Civil and criminal cases",
        ],
      },
    ],
  },
];
