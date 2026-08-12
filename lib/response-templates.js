'use strict';

const MANDATORY_CLOSING = "Would you like me to recommend the best solution for your business?";

function enforceClosing(text) {
  const trimmed = (text || '').trim();
  if (trimmed.endsWith(MANDATORY_CLOSING)) return trimmed;
  return `${trimmed}\n\n${MANDATORY_CLOSING}`;
}

const TEMPLATES = {
  AUTOMOTIVE: {
    answer: enforceClosing(`🚗 **PRV Consultant Strategic Analysis for Auto Parts Manufacturers**

Based on your manufacturing profile as an automotive component producer, **you should NOT take generic certifications**. 

We specifically recommend **IATF 16949:2016** (Automotive Quality Management System) along with the **5 Automotive Core Tools**.

### Why IATF 16949 is Required for Your Business:
1️⃣ **Mandatory OEM Empanelment**: Top automotive OEMs (Maruti Suzuki, Tata Motors, Hyundai, Mahindra, Hero MotoCorp) and Tier-1 suppliers strictly mandate IATF 16949 certification to award vendor purchase orders.
2️⃣ **Zero-Defect Standard**: Automotive supply chains require zero PPM rejections, full traceability, and strict defect prevention.
3️⃣ **5 Automotive Core Tools Mastery**:
   - **APQP**: Advanced Product Quality Planning for new part development.
   - **PPAP**: Production Part Approval Process for buyer sign-off.
   - **FMEA**: Failure Mode & Effects Analysis to prevent shopfloor errors.
   - **MSA**: Measurement Systems Analysis for gauge accuracy.
   - **SPC**: Statistical Process Control to guarantee process capability (Cpk > 1.33).

⏱️ **Timeline**: 2 to 3 months (includes shopfloor core tools implementation & audit handholding).
🤝 **How PRV Helps**: PRV's automotive consultants implement Core Tools directly on your shopfloor and guarantee Tier-1/OEM audit clearance.`),
    quickReplies: ['IATF 16949 Roadmap', 'Core Tools Workshop', 'MACE Audit Prep', 'Book Free Consultation']
  },

  FIVES: {
    answer: enforceClosing(`✨ **5S Workplace Management & Visual Control System**

• **What it is**: 5-step Japanese methodology: Sort, Set in Order, Shine, Standardize, Sustain.
• **Benefits**: Organizes plant floor, eliminates search time, clears OEM audits.
• **Timeline**: 1 to 3 weeks.
• **How PRV Helps**: Red-tagging campaigns, shadow board installation & monthly 5S scorecards.`),
    quickReplies: ['5S Workshop', '5S vs Kaizen vs Lean', 'Book Free Consultation']
  },

  LEAN: {
    answer: enforceClosing(`🏭 **Lean Manufacturing & Operational Excellence Blueprint**

• **What it is**: Systematic strategy to eliminate 7 Mudas waste & cut manufacturing lead times.
• **Benefits**: 30%-50% WIP reduction, higher OEE, zero bottleneck delays.
• **Timeline**: 1 to 3 months.
• **How PRV Helps**: On-site Value Stream Mapping, SMED line balancing & lean transformation.`),
    quickReplies: ['Lean Transformation', '5S vs Kaizen vs Lean', 'Book Free Consultation']
  },

  KAIZEN: {
    answer: enforceClosing(`🔄 **Kaizen Continuous Improvement & Gemba Problem Solving**

• **What it is**: Employee-driven philosophy of daily micro-improvements.
• **Benefits**: Solves shopfloor defects, cuts scrap, sustains high workforce morale.
• **Timeline**: 2 to 4 weeks rollout.
• **How PRV Helps**: Gemba walks, operator 7 QC tools training & suggestion reward system.`),
    quickReplies: ['Kaizen Event', '5S vs Kaizen vs Lean', 'Book Free Consultation']
  },

  ZED: {
    answer: enforceClosing(`💰 **ZED — Zero Defect Zero Effect MSME Scheme**

PRV Consultancy helps MSMEs and industrial units claim direct government financial subsidies:
• **Up to 80% Subsidy** on audit & certification costs
• **₹10,000 Handholding Support Grant** for consultancy
• **0.5% Concessional Bank Interest Rate** on business loans
• **Up to ₹5 Lakhs Capital Subsidy** for testing equipment

📋 **Eligibility Check**: Do you hold an active **Udyam MSME Registration** for your unit?`),
    quickReplies: ['ZED MSME Subsidy', 'ZED vs ISO 9001', 'Book Free Consultation']
  },

  ISO9001: {
    answer: enforceClosing(`📜 **ISO 9001:2015 — Quality Management System (QMS)**

ISO 9001 is an internationally recognized standard for a Quality Management System (QMS). It gives organizations a structured framework to:
- Manage and document key business processes
- Consistently meet customer requirements
- Monitor quality performance and reduce errors
- Support continual improvement

Applicable to all industries — manufacturing, IT, healthcare, services, and more.`),
    quickReplies: ['Why do I need ISO 9001?', 'ISO 9001 process steps', 'ISO 9001 documents', 'Book Free Consultation']
  },

  EXPORT: {
    answer: enforceClosing(`🌍 **PRV Consultant Export Certification Roadmap**

Export certification requirements depend strictly on your **product category** and **target country**:

• **Machinery & Electronics**: Require **CE Marking** & **RoHS/REACH** (European Union).
• **Food, Pharma & Cosmetics**: Require **FDA Registration**, **ISO 22000 / HACCP**, and **HALAL**.
• **Textiles & Consumer Goods**: Require **SEDEX / SMETA Ethical Audits** for global retail buyers.
• **All Product Lines**: Require **ISO 9001:2015** as baseline quality assurance.

👉 **To give you the exact export requirement**: What specific product does your company manufacture, and which country are you planning to export to?`),
    quickReplies: ['Exporting Machinery', 'Exporting Food/Pharma', 'Exporting Textiles', 'Book Free Consultation']
  },

  ISO_OVERVIEW: {
    answer: enforceClosing(`📜 **Professional Overview of ISO (International Organization for Standardization)**

ISO is an independent, non-governmental international organization based in Geneva, Switzerland. It develops globally recognized standards for quality, safety, security, environmental protection, and operational efficiency.

### Key ISO Standards for Businesses:
• **ISO 9001:2015**: Quality Management System (QMS) - Standard for tenders & vendor onboarding.
• **ISO 14001:2015**: Environmental Management System (EMS) - Standard for pollution compliance & ESG.
• **ISO 45001:2018**: Occupational Health & Safety (OH&S) - Standard for worker safety & Factory Act compliance.
• **ISO 27001:2022**: Information Security (ISMS) - Standard for IT companies & data protection.
• **ISO 22000:2018**: Food Safety (FSMS) - Standard for food processors & exporters.
• **ISO 50001:2018**: Energy Management (EnMS) - Standard for slacking factory power bills.

👉 **Which industry or product does your company operate in?** Tell me your business type, and I will recommend the exact ISO standard that will bring you the highest business value.`),
    quickReplies: ['Recommend for my business', 'ISO 9001 QMS', 'ISO 27001 ISMS', 'ISO 22000 Food Safety']
  },

  ISO_VS_ZED: {
    answer: enforceClosing(`📊 **ISO 9001 vs ZED MSME Scheme Matrix**

| Parameter | ISO 9001:2015 | ZED MSME Scheme |
| --- | --- | --- |
| **Origin** | International Standard (Geneva) | Ministry of MSME, Govt of India |
| **Govt Subsidy** | No direct subsidy | Up to 80% Subsidy + ₹10,000 Grant |
| **Bank Benefit** | Corporate tender eligibility | 0.5% lower loan interest rate |
| **Scope** | Quality Management SOPs | Zero Defect + Zero Effect |

🎯 **PRV Verdict**: Apply for ZED to claim 80% Govt grant & loan discounts, while retaining ISO 9001 for buyer tenders!`),
    quickReplies: ['ZED MSME Subsidy', 'ISO 9001 QMS', 'Book Free Consultation']
  },

  FIVE_VS_KAIZEN_VS_LEAN: {
    answer: enforceClosing(`📊 **5S vs Kaizen vs Lean Manufacturing Matrix**

| Parameter | 5S | Kaizen | Lean Manufacturing |
| --- | --- | --- | --- |
| **Focus** | Physical organization | Daily worker micro-ideas | Total value stream flow |
| **Timeline** | 1 to 3 weeks | Daily continuous habit | 1 to 3 months |
| **Result** | Clean & safe plant | Micro defect reduction | 50% lead time reduction |

🎯 **PRV Verdict**: Implement 5S first, cultivate Kaizen habits, and execute Lean Manufacturing!`),
    quickReplies: ['5S Workshop', 'Lean Transformation', 'Book Free Consultation']
  }
};

module.exports = {
  MANDATORY_CLOSING,
  enforceClosing,
  TEMPLATES
};
