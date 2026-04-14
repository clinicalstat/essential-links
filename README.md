# Essential Links for Statistical Programmers

**1,708 curated resources** across 17 sections for clinical statistical programmers — searchable, free, and open source.

🔗 **Live site:** [clinicalstat.github.io/essential-links](https://clinicalstat.github.io/essential-links/)

---

## What This Is

A single-page reference tool that brings together the resources clinical statistical programmers actually use — CDISC standards, regulatory guidance, R/SAS/Python tools, submission templates, ICH guidelines, and more — in one searchable, filterable interface.

Built by a working programmer, not scraped from a textbook.

## Sections

| Section | Resources | What's Inside |
|---------|-----------|---------------|
| CDISC Standards & Guides | 249 | SDTM/ADaM/CDASH/SEND domains, Define-XML versions, QRS instruments, CT downloads, Wiki spaces |
| NCI EVS FTP Directory | 62 | CT packages, FDA terminology sets, oncology/genomics codes |
| External Terminologies | 55 | MedDRA, SNOMED CT, LOINC, WHO Drug, ICD-10/11, ATC, UNII |
| ICH Guidelines | 63 | Full E-series (E1–E20), M-series (M1–M14), Q-series, S-series, guideline portals |
| Regulatory & Submission | 173 | FDA/EMA/PMDA guidance, 21 CFR, TCG, Protocol Development, SAP templates, PhUSE deliverables |
| Global Regulatory Agencies | 219 | 70+ ClinRegs country profiles, regional frameworks (India, China, Japan, Brazil, UK, etc.) |
| Free Tools & Open Source | 337 | pharmaverse, admiral, teal, NEST, R/Python/SAS packages, Shiny ecosystem, CRAN task views, AI/ML |
| Papers Conferences & Learning | 132 | Lex Jansen, PharmaSUG, PhUSE, free training, journals, TransCelerate, industry blogs |
| Therapeutic Area User Guides | 89 | TAUGs across oncology, cardiovascular, diabetes, neurology, infectious disease, and more |
| Statistical Methods & Guidance | 56 | Estimands, adaptive designs, multiplicity, missing data, Bayesian methods, sample size tools |
| eCTD & Submission Packaging | 49 | eCTD specs (ICH M4/M8), Define-XML implementation, reviewer's guides, submission gateways |
| Pharmacovigilance & Safety | 35 | MedDRA coding, signal detection, CIOMS/PSUR/PBRER, safety reporting standards |
| Real-World Data & Digital Health | 51 | RWD/RWE frameworks, EHR interoperability, digital health technologies, biomarkers |
| Biostatistics Software & Validation | 56 | R validation framework, containers/reproducibility, EDC systems, Pinnacle 21, SCE |
| PK/PD & Pharmacometrics | 26 | NONMEM, Monolix, Phoenix, R/Python PK packages, regulatory guidance |
| Data Privacy & Anonymization | 20 | GDPR/HIPAA regulations, anonymization tools, data sharing platforms |
| Clinical Operations & Project Mgmt | 36 | EDC, CTMS, eTMF, RTSM, eCOA/ePRO, RBQM, centralized monitoring, eConsent |

## Features

- **Smart search** with 60+ synonym groups (e.g., search "adverse event" → finds MedDRA, CTCAE, SMQ)
- **Parent-child section grouping** — 8 parent categories organize 17 sections
- **Mobile-first responsive design** — sticky search, section grid, back navigation
- **Chatbot assistant** with intent-based matching across 45+ clinical programming topics
- **Dark/light mode** toggle
- **Card/list view** toggle
- **Favorites** system (local storage)
- **Copy link** to clipboard
- **Primary + alternate links** for every resource (wiki.cdisc.org open links where available)
- **Zero dependencies** — single HTML file, no build step, no framework

## Quick Start

```bash
# Clone and open
git clone https://github.com/clinicalstat/essential-links.git
open essential-links/index.html
```

Or just visit [clinicalstat.github.io/essential-links](https://clinicalstat.github.io/essential-links/).

## Excel Version

An Excel workbook (`Essential_Links_For_Statistical_Programmers.xlsx`) with the same 1,708 entries is available in the repository — 17 data sheets with hyperlinks, auto-filters, and category headers.

## Link Philosophy

- Primary links point to the **most direct, open-access** version of each resource
- CDISC membership-gated links are replaced with **wiki.cdisc.org** open alternatives wherever possible
- Alternate links provide a secondary path (e.g., official CDISC page as alt when wiki is primary)
- Regulatory links go to **official agency pages** (FDA, EMA, PMDA, ICH) — not aggregators

## Contributing

Found a broken link? Missing a resource? Open an issue or submit a PR.

When adding entries, follow this JSON structure:

```json
{
  "sheet": "Section Name",
  "category": "CATEGORY NAME",
  "resource": "Display Name",
  "description": "Short description.",
  "link": "https://primary-url.com",
  "altLink": "https://alternate-url.com"
}
```

## Version History

| Version | Date | Resources | Sections | Notes |
|---------|------|-----------|----------|-------|
| 4.0 | Apr 2026 | 1,708 | 17 | ICH section, SAP/Protocol categories, mobile redesign, chatbot v2, parent-child grouping |
| 3.0 | Apr 2026 | 1,729 | 16 | Major expansion, 8 new sections, CDISC wiki links |
| 2.0 | Apr 2026 | 464 | 8 | Web app launch, smart search, chatbot |
| 1.0 | Mar 2026 | 464 | 8 | Initial Excel release |

## Author

**Mohan Peddineni**
Principal Statistical Programmer | 11+ years in clinical trials

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/mohan-peddineni)
[![GitHub](https://img.shields.io/badge/GitHub-clinicalstat-333?style=flat&logo=github)](https://github.com/clinicalstat)

---

*Free and open for everyone. If you found this useful, share it with your team.*
