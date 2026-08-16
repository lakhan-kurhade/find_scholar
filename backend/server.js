const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Scholarship = require("./models/Scholarship");
const authRoutes = require("./routes/auth");

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Find Scholar API is running"
  });
});

// ==========================================
// CREATE SCHOLARSHIP
// ==========================================

app.post("/api/scholarships", async (req, res) => {
  try {
    const scholarship = new Scholarship(req.body);

    const savedScholarship = await scholarship.save();

    res.status(201).json(savedScholarship);
  } catch (error) {
    console.error("Create scholarship error:", error);

    res.status(500).json({
      message: "Failed to add scholarship",
      error: error.message
    });
  }
});

// ==========================================
// GET ALL SCHOLARSHIPS
// ==========================================

app.get("/api/scholarships", async (req, res) => {
  try {
    const scholarships = await Scholarship.find({
      isActive: true
    });

    res.json(scholarships);
  } catch (error) {
    console.error("Get scholarships error:", error);

    res.status(500).json({
      message: "Failed to fetch scholarships",
      error: error.message
    });
  }
});

// ==========================================
// FILTER SCHOLARSHIPS
// ==========================================

app.get("/api/scholarships/filter", async (req, res) => {
  try {
    const {
      educationLevel,
      fieldOfStudy,
      providerType,
      location
    } = req.query;

    const filter = {
      isActive: true
    };

    // Education level
    if (educationLevel) {
      filter.educationLevels = educationLevel;
    }

    // Field of study
    if (fieldOfStudy) {
      filter.fieldsOfStudy = {
        $regex: fieldOfStudy,
        $options: "i"
      };
    }

    // Provider type
    if (providerType) {
      filter.providerType = providerType;
    }

    // Location
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i"
      };
    }

    const scholarships = await Scholarship.find(filter);

    res.json({
      count: scholarships.length,
      scholarships
    });

  } catch (error) {
    console.error("Scholarship filter error:", error);

    res.status(500).json({
      message: "Failed to filter scholarships",
      error: error.message
    });
  }
});

// ==========================================
// RECOMMENDATION HELPERS
// ==========================================

const normalize = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim();
};

const normalizeText = (value) => {
  return normalize(value)
    .replace(/₹/g, "")
    .replace(/,/g, "");
};

// Convert student income selection into maximum income.
const getStudentIncomeLimit = (income) => {
  const value = normalizeText(income);

  // Numeric income
  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  if (
    value.includes("below 1") ||
    value.includes("less than 1")
  ) {
    return 100000;
  }

  if (
    value.includes("1–2.5") ||
    value.includes("1-2.5") ||
    value.includes("1 to 2.5")
  ) {
    return 250000;
  }

  if (
    value.includes("2.5–5") ||
    value.includes("2.5-5") ||
    value.includes("2.5 to 5")
  ) {
    return 500000;
  }

  if (
    value.includes("5–8") ||
    value.includes("5-8") ||
    value.includes("5 to 8")
  ) {
    return 800000;
  }

  if (
    value.includes("8–10") ||
    value.includes("8-10") ||
    value.includes("8 to 10")
  ) {
    return 1000000;
  }

  if (
    value.includes("10–12") ||
    value.includes("10-12") ||
    value.includes("10 to 12")
  ) {
    return 1200000;
  }

  if (
    value.includes("above 12") ||
    value.includes("12+") ||
    value.includes("above")
  ) {
    return 15000000;
  }

  return null;
};

// Extract maximum income from scholarship text.
const getScholarshipIncomeLimit = (
  scholarship
) => {
  // First priority: structured maxIncome
  if (
    scholarship.maxIncome !== null &&
    scholarship.maxIncome !== undefined
  ) {
    return Number(scholarship.maxIncome);
  }

  const incomeText = normalizeText(
    scholarship.incomeCriteria
  );

  if (!incomeText) {
    return null;
  }

  // Examples:
  // ₹8 lakh
  // up to ₹8 lakh
  // less than ₹8 lakh
  // below ₹2.5 lakh

  const lakhMatch = incomeText.match(
    /(?:up to|below|less than|under|upto)?\s*(\d+(?:\.\d+)?)\s*lakh/
  );

  if (lakhMatch) {
    return Number(lakhMatch[1]) * 100000;
  }

  const croreMatch = incomeText.match(
    /(?:up to|below|less than|under|upto)?\s*(\d+(?:\.\d+)?)\s*crore/
  );

  if (croreMatch) {
    return Number(croreMatch[1]) * 10000000;
  }

  return null;
};

// ==========================================
// CATEGORY DETECTION
// ==========================================

const categoryAliases = {
  sc: ["sc", "scheduled caste"],
  st: ["st", "scheduled tribe"],
  obc: ["obc", "other backward class"],
  vjnt: ["vjnt"],
  sbc: ["sbc"],
  ews: ["ews"],
  ebc: ["ebc"],
  sebc: ["sebc"],
  open: ["open", "general", "unreserved"]
};

const categoryMatchesText = (
  category,
  text
) => {
  const normalizedCategory = normalize(category);

  const aliases =
    categoryAliases[normalizedCategory] || [
      normalizedCategory
    ];

  return aliases.some((alias) =>
    text.includes(alias)
  );
};

// Detect whether scholarship is specifically
// restricted to a particular category.
const getRestrictedCategories = (
  scholarshipText
) => {
  const restricted = [];

  const categories = [
    "sc",
    "st",
    "obc",
    "vjnt",
    "sbc",
    "ews",
    "ebc",
    "sebc"
  ];

  categories.forEach((category) => {
    if (
      categoryMatchesText(
        category,
        scholarshipText
      )
    ) {
      restricted.push(category);
    }
  });

  return restricted;
};

// ==========================================
// GENDER DETECTION
// ==========================================

const isFemaleOnly = (text) => {
  return (
    text.includes("female") ||
    text.includes("girl") ||
    text.includes("girls") ||
    text.includes("women") ||
    text.includes("woman")
  );
};

const isMaleOnly = (text) => {
  return (
    text.includes("male only") ||
    text.includes("boys") ||
    text.includes("men only")
  );
};

// ==========================================
// RECOMMENDED SCHOLARSHIPS
// ==========================================

app.get("/api/scholarships/recommended", async (req, res) => {
  try {
    const {
      educationLevel,
      fieldOfStudy,
      state,
      category,
      gender,
      annualIncome,
    } = req.query;

    // ==========================================
    // FETCH ACTIVE SCHOLARSHIPS
    // ==========================================

    const scholarships = await Scholarship.find({
      isActive: true,
    }).lean();

    // ==========================================
    // NORMALIZATION HELPERS
    // ==========================================

    const normalize = (value) => {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[₹,]/g, "")
        .replace(/\s+/g, " ");
    };

    const toArray = (value) => {
      if (!Array.isArray(value)) {
        return [];
      }

      return value
        .map((item) => normalize(item))
        .filter(Boolean);
    };

    const userEducation = normalize(educationLevel);
    const userFieldOfStudy = normalize(fieldOfStudy);
    const userState = normalize(state);
    const userCategory = normalize(category);
    const userGender = normalize(gender);
    const userIncome = normalize(annualIncome);

    // ==========================================
    // INCOME CONVERTER
    //
    // FIX (v1): scholarship.maxIncome is stored as a raw
    // INR number (e.g. 250000), not lakhs. Every returned
    // value here must also be in raw INR so the two are
    // comparable.
    //
    // FIX (v2): the previous parser only matched a fixed
    // set of hardcoded substrings (e.g. "5 - 8", "above 10").
    // signup.tsx uses en-dash ranges like "₹5–8 lakh" and
    // profile.tsx uses hyphen ranges with an extra "8 - 10"
    // bracket and "Above ₹10 lakh" wording that didn't line
    // up with the hardcoded checks. In particular "Above ₹8
    // Lakh" (from signup) matched NONE of the hardcoded
    // branches and fell through to a generic regex that
    // grabbed the number 8 and treated the user's income as
    // capped at exactly ₹8 lakh — silently letting through
    // scholarships meant only for lower-income applicants.
    //
    // This version parses the underlying pattern (below/
    // above/range/single value, in lakh or crore) instead of
    // matching fixed strings, and normalizes en-dash/em-dash
    // to a regular hyphen first so both screens' formats work
    // identically. "Above X" is treated as genuinely unbounded
    // (Infinity), not capped at X.
    // ==========================================

    const getIncomeValue = (income) => {
      const value = normalize(income);

      if (!value) {
        return null;
      }

      // Treat en-dash / em-dash the same as a hyphen so both
      // signup.tsx ("₹1–2.5 lakh") and profile.tsx
      // ("₹1 - ₹2.5 Lakh") parse identically.
      const cleaned = value.replace(/[–—]/g, "-");

      // "below / under / less than X lakh"
      const belowMatch = cleaned.match(
        /(?:below|under|less than)\s*(\d+(?:\.\d+)?)\s*lakh/
      );

      if (belowMatch) {
        return Number(belowMatch[1]) * 100000;
      }

      // "above / over / more than X lakh" -> unbounded,
      // NOT capped at X.
      const aboveMatch = cleaned.match(
        /(?:above|over|more than)\s*(\d+(?:\.\d+)?)\s*lakh/
      );

      if (aboveMatch) {
        return Infinity;
      }

      // "A - B lakh" range -> use the upper bound B
      const rangeMatch = cleaned.match(
        /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*lakh/
      );

      if (rangeMatch) {
        return Number(rangeMatch[2]) * 100000;
      }

      // single "X lakh"
      const singleMatch = cleaned.match(
        /(\d+(?:\.\d+)?)\s*lakh/
      );

      if (singleMatch) {
        return Number(singleMatch[1]) * 100000;
      }

      // crore, with the same below/above/range handling
      const croreBelowMatch = cleaned.match(
        /(?:below|under|less than)\s*(\d+(?:\.\d+)?)\s*crore/
      );

      if (croreBelowMatch) {
        return Number(croreBelowMatch[1]) * 10000000;
      }

      const croreAboveMatch = cleaned.match(
        /(?:above|over|more than)\s*(\d+(?:\.\d+)?)\s*crore/
      );

      if (croreAboveMatch) {
        return Infinity;
      }

      const croreMatch = cleaned.match(
        /(\d+(?:\.\d+)?)\s*crore/
      );

      if (croreMatch) {
        return Number(croreMatch[1]) * 10000000;
      }

      // plain numeric input (e.g. "550000") -> already raw INR
      if (/^\d+(\.\d+)?$/.test(cleaned)) {
        return Number(cleaned);
      }

      return null;
    };

    const userIncomeValue =
      getIncomeValue(userIncome);

    // ==========================================
    // SCHOLARSHIP SEARCH TEXT
    //
    // Name + eligibility + restrictions +
    // description are used as fallback signals.
    // ==========================================

    const getScholarshipText = (scholarship) => {
      return normalize(
        [
          scholarship.name || "",
          scholarship.description || "",
          ...(scholarship.eligibility || []),
          ...(scholarship.restrictions || []),
        ].join(" ")
      );
    };

    // ==========================================
    // GENDER RULE
    // ==========================================

    const getGenderRule = (scholarship) => {
      const explicitGenders =
        toArray(scholarship.genders);

      // ------------------------------------------
      // FIRST: structured genders field
      // ------------------------------------------

      if (explicitGenders.length > 0) {
        const female = explicitGenders.some((value) =>
          [
            "female",
            "girl",
            "girls",
            "woman",
            "women",
          ].includes(value)
        );

        const male = explicitGenders.some((value) =>
          [
            "male",
            "boy",
            "boys",
            "man",
            "men",
          ].includes(value)
        );

        if (female && male) {
          return "all";
        }

        if (female) {
          return "female";
        }

        if (male) {
          return "male";
        }

        return "all";
      }

      // ------------------------------------------
      // FALLBACK: scholarship text
      // ------------------------------------------

      const text =
        getScholarshipText(scholarship);

      const femaleOnlyPatterns = [
        /\bfemale students?\b/,
        /\bfemale student\b/,
        /\bgirl students?\b/,
        /\bgirl student\b/,
        /\bfor girls\b/,
        /\bfor women\b/,
        /\bwomen students?\b/,
        /\bwomen in\b/,
        /\bwoman pursuing\b/,
        /\bwomen pursuing\b/,
        /\bfemale engineering students?\b/,
        /\bfor female\b/,
        /\bonly women\b/,
        /\bonly girls\b/,
        /\bfemale candidates?\b/,
      ];

      const maleOnlyPatterns = [
        /\bmale students?\b/,
        /\bmale student\b/,
        /\bboy students?\b/,
        /\bboy student\b/,
        /\bfor boys\b/,
        /\bfor men\b/,
        /\bmen students?\b/,
        /\bmale candidates?\b/,
        /\bfor male\b/,
        /\bonly men\b/,
        /\bonly boys\b/,
      ];

      const femaleMatch =
        femaleOnlyPatterns.some((pattern) =>
          pattern.test(text)
        );

      const maleMatch =
        maleOnlyPatterns.some((pattern) =>
          pattern.test(text)
        );

      if (femaleMatch && maleMatch) {
        return "all";
      }

      if (femaleMatch) {
        return "female";
      }

      if (maleMatch) {
        return "male";
      }

      return "all";
    };

    // ==========================================
    // CATEGORY RULE
    // ==========================================

    const getCategoryRule = (scholarship) => {
      const explicitCategories =
        toArray(scholarship.categories);

      // ------------------------------------------
      // FIRST: structured category field
      //
      // FIX: "open" means open to ALL categories per
      // the data spec, even when it appears alongside
      // other tags like ["open", "sebc", "ews"]. The
      // previous version only granted "open" status
      // when the categories array was empty, which
      // caused every scholarship tagged "open" to be
      // wrongly treated as restricted to a literal
      // "open" category.
      // ------------------------------------------

      if (explicitCategories.includes("open")) {
        return {
          type: "open",
          categories: explicitCategories,
        };
      }

      if (explicitCategories.length > 0) {
        return {
          type: "restricted",
          categories: explicitCategories,
        };
      }

      // ------------------------------------------
      // FALLBACK: scholarship name + restrictions
      // (only reached when categories is empty)
      // ------------------------------------------

      const text =
        getScholarshipText(scholarship);

      const detected = [];

      if (
        /\bsc\b/.test(text) ||
        /\bscheduled caste\b/.test(text)
      ) {
        detected.push("sc");
      }

      if (
        /\bst\b/.test(text) ||
        /\bscheduled tribe\b/.test(text)
      ) {
        detected.push("st");
      }

      if (
        /\bsebc\b/.test(text) ||
        /\bsocially and educationally backward\b/.test(text)
      ) {
        detected.push("sebc");
      }

      if (
        /\bobc\b/.test(text) ||
        /\bother backward class\b/.test(text)
      ) {
        detected.push("obc");
      }

      if (
        /\bews\b/.test(text) ||
        /\beconomically weaker section\b/.test(text)
      ) {
        detected.push("ews");
      }

      if (
        /\bvjnt\b/.test(text) ||
        /\bvimukta\b/.test(text) ||
        /\bnomadic tribes\b/.test(text)
      ) {
        detected.push("vjnt");
      }

      if (
        /\bsbc\b/.test(text) ||
        /\bspecial backward class\b/.test(text)
      ) {
        detected.push("sbc");
      }

      if (
        /\bminority\b/.test(text) ||
        /\bminorities\b/.test(text)
      ) {
        detected.push("minority");
      }

      if (detected.length > 0) {
        return {
          type: "restricted",
          categories: [...new Set(detected)],
        };
      }

      return {
        type: "open",
        categories: [],
      };
    };

    // ==========================================
    // CATEGORY MATCH
    // ==========================================

    const getCategoryMatch = (scholarship) => {
      const rule =
        getCategoryRule(scholarship);

      if (rule.type === "open") {
        return {
          match: true,
          restricted: false,
          matched: "Category open to all",
        };
      }

      if (
        rule.categories.includes(
          userCategory
        )
      ) {
        return {
          match: true,
          restricted: true,
          matched: "Category",
        };
      }

      const aliases = {
        general: ["general", "open", "unreserved"],
        sc: ["sc", "scheduled caste"],
        st: ["st", "scheduled tribe"],
        obc: ["obc", "other backward class"],
        sebc: ["sebc"],
        ews: ["ews", "economically weaker section"],
        vjnt: ["vjnt", "vimukta", "nomadic tribes"],
        sbc: ["sbc", "special backward class"],
        minority: ["minority", "minorities"],
      };

      const userAliases =
        aliases[userCategory] || [
          userCategory,
        ];

      const aliasMatch =
        rule.categories.some((ruleCategory) =>
          userAliases.includes(ruleCategory)
        );

      if (aliasMatch) {
        return {
          match: true,
          restricted: true,
          matched: "Category",
        };
      }

      return {
        match: false,
        restricted: true,
        matched: null,
      };
    };

    // ==========================================
    // STATE RULE
    //
    // FIX: previously any location array containing
    // "india" (e.g. ["Maharashtra", "India"]) matched
    // every state, because the check for "universal"
    // India-wide scholarships ran before checking for
    // a specific state tag. Now a scholarship is only
    // treated as matching every state when its location
    // list has NO specific state/country in it — pure
    // ["India"] entries. If a specific state (like
    // "Maharashtra") is present, the user's state must
    // match it exactly.
    // ==========================================

    const getStateMatch = (scholarship) => {
      const locations =
        toArray(scholarship.location);

      if (locations.length === 0) {
        return true;
      }

      const genericTags = [
        "india",
        "all india",
        "pan india",
        "international",
      ];

      const hasSpecificPlace = locations.some(
        (loc) => !genericTags.includes(loc)
      );

      if (!hasSpecificPlace) {
        // Pure India-wide (or generic) scholarship
        if (
          locations.includes("india") ||
          locations.includes("all india") ||
          locations.includes("pan india")
        ) {
          return true;
        }
      }

      // Has a specific state/country tag (e.g. Maharashtra,
      // United Kingdom) — user's state must match it exactly.
      return locations.includes(
        userState
      );
    };

    // ==========================================
    // EDUCATION RULE
    // ==========================================

    const getEducationMatch =
      (scholarship) => {
        const levels =
          toArray(
            scholarship.educationLevels
          );

        if (levels.length === 0) {
          return true;
        }

        if (
          levels.includes(
            userEducation
          )
        ) {
          return true;
        }

        if (
          userEducation === "ug" &&
          (
            levels.includes("undergraduate") ||
            levels.includes("graduation")
          )
        ) {
          return true;
        }

        if (
          userEducation === "pg" &&
          (
            levels.includes("postgraduate") ||
            levels.includes("post graduation")
          )
        ) {
          return true;
        }

        return false;
      };

    // ==========================================
    // FIELD OF STUDY RULE
    //
    // FIX: this rule did not exist before. The frontend
    // (recommendations.tsx) has always sent `fieldOfStudy`
    // as a query param, but the endpoint never read it or
    // used it, so a Commerce/Arts/Law student would be shown
    // Engineering- or Medical-only scholarships with no
    // filtering at all. This closes that gap.
    //
    // "All eligible fields" (or an empty fieldsOfStudy array)
    // means the scholarship is open to any field, matching
    // how "open" works for the category rule.
    //
    // A small alias map handles known wording mismatches
    // between the frontend options and the seed data, e.g.
    // the frontend offers "Medicine" while the scholarship
    // data uses "Medical".
    // ==========================================

    const fieldOfStudyAliases = {
      medicine: ["medical", "medicine"],
      medical: ["medical", "medicine"],
    };

    const getFieldOfStudyMatch =
      (scholarship) => {
        const fields =
          toArray(
            scholarship.fieldsOfStudy
          );

        if (fields.length === 0) {
          return true;
        }

        if (
          fields.includes("all eligible fields") ||
          fields.includes("all fields")
        ) {
          return true;
        }

        if (!userFieldOfStudy) {
          // No field of study on the profile — don't
          // exclude field-restricted scholarships based
          // on missing data, since this rule is new and
          // profiles may not have been re-saved yet.
          return true;
        }

        if (
          fields.includes(
            userFieldOfStudy
          )
        ) {
          return true;
        }

        const aliases =
          fieldOfStudyAliases[
            userFieldOfStudy
          ] || [userFieldOfStudy];

        return fields.some((field) =>
          aliases.includes(field)
        );
      };

    // ==========================================
    // INCOME RULE
    //
    // FIX: previously an unparseable userIncomeValue
    // (null) caused this to return true unconditionally,
    // silently letting income-capped scholarships through
    // for a user whose income bracket didn't parse. Every
    // other rule (education, gender, category, state)
    // fails CLOSED (excludes) on ambiguity, so income now
    // matches that behavior for consistency and safety.
    // ==========================================

    const getIncomeMatch =
      (scholarship) => {
        if (
          scholarship.maxIncome === null ||
          scholarship.maxIncome === undefined
        ) {
          return true;
        }

        if (
          userIncomeValue === null
        ) {
          return false;
        }

        return (
          userIncomeValue <=
          Number(
            scholarship.maxIncome
          )
        );
      };

    // ==========================================
    // BUILD RECOMMENDATIONS
    // ==========================================

    const recommendations =
      scholarships
        .map((scholarship) => {
          let score = 0;

          const matchedCriteria = [];
          const failedCriteria = [];

          // ========================================
          // 1. EDUCATION — 25 POINTS
          // ========================================

          const educationMatch =
            getEducationMatch(
              scholarship
            );

          if (!educationMatch) {
            failedCriteria.push(
              "Education level"
            );
          } else {
            score += 25;

            const levels =
              toArray(
                scholarship.educationLevels
              );

            if (levels.length > 0) {
              matchedCriteria.push(
                "Education level"
              );
            } else {
              matchedCriteria.push(
                "Education not restricted"
              );
            }
          }

          // ========================================
          // 2. FIELD OF STUDY — 20 POINTS
          // ========================================

          const fieldOfStudyMatch =
            getFieldOfStudyMatch(
              scholarship
            );

          if (!fieldOfStudyMatch) {
            failedCriteria.push(
              "Field of study"
            );
          } else {
            score += 20;

            const fields =
              toArray(
                scholarship.fieldsOfStudy
              );

            if (
              fields.length === 0 ||
              fields.includes("all eligible fields") ||
              fields.includes("all fields")
            ) {
              matchedCriteria.push(
                "Field of study open to all"
              );
            } else {
              matchedCriteria.push(
                "Field of study"
              );
            }
          }

          // ========================================
          // 3. GENDER — 15 POINTS
          // ========================================

          const genderRule =
            getGenderRule(
              scholarship
            );

          let genderMatch = true;

          if (
            genderRule === "female"
          ) {
            genderMatch =
              userGender === "female";
          }

          if (
            genderRule === "male"
          ) {
            genderMatch =
              userGender === "male";
          }

          if (!genderMatch) {
            failedCriteria.push(
              "Gender"
            );
          } else {
            score += 15;

            if (
              genderRule === "all"
            ) {
              matchedCriteria.push(
                "Gender open to all"
              );
            } else {
              matchedCriteria.push(
                "Gender"
              );
            }
          }

          // ========================================
          // 4. CATEGORY — 15 POINTS
          // ========================================

          const categoryResult =
            getCategoryMatch(
              scholarship
            );

          if (!categoryResult.match) {
            failedCriteria.push(
              "Category"
            );
          } else {
            score += 15;

            matchedCriteria.push(
              categoryResult.matched
            );
          }

          // ========================================
          // 5. STATE — 10 POINTS
          // ========================================

          const stateMatch =
            getStateMatch(
              scholarship
            );

          if (!stateMatch) {
            failedCriteria.push(
              "State"
            );
          } else {
            score += 10;

            const locations =
              toArray(
                scholarship.location
              );

            if (
              locations.length === 0 ||
              locations.includes("india") ||
              locations.includes("all india") ||
              locations.includes("pan india")
            ) {
              matchedCriteria.push(
                "Location not restricted"
              );
            } else {
              matchedCriteria.push(
                "State"
              );
            }
          }

          // ========================================
          // 6. INCOME — 15 POINTS
          // ========================================

          const incomeMatch =
            getIncomeMatch(
              scholarship
            );

          if (!incomeMatch) {
            failedCriteria.push(
              "Income"
            );
          } else {
            score += 15;

            if (
              scholarship.maxIncome === null ||
              scholarship.maxIncome === undefined
            ) {
              matchedCriteria.push(
                "Income not restricted"
              );
            } else {
              matchedCriteria.push(
                "Income"
              );
            }
          }

          // ========================================
          // HARD FILTER
          // ========================================

          if (
            failedCriteria.length > 0
          ) {
            return null;
          }

          // ========================================
          // MATCH PERCENTAGE
          // ========================================

          const matchPercentage =
            Math.min(
              100,
              Math.round(score)
            );

          // ========================================
          // STATUS
          // ========================================

          let eligibilityStatus =
            "Possible Match";

          if (
            matchPercentage >= 90
          ) {
            eligibilityStatus =
              "Highly Recommended";
          } else if (
            matchPercentage >= 75
          ) {
            eligibilityStatus =
              "Recommended";
          } else if (
            matchPercentage >= 60
          ) {
            eligibilityStatus =
              "Good Match";
          }

          // ========================================
          // RETURN
          // ========================================

          return {
            ...scholarship,

            matchScore: score,

            matchPercentage,

            eligibilityStatus,

            matchedCriteria,

            failedCriteria,
          };
        })
        .filter(
          (scholarship) =>
            scholarship !== null
        )
        .sort(
          (a, b) =>
            b.matchScore -
            a.matchScore
        );

    // ==========================================
    // RESPONSE
    // ==========================================

    res.json(
      recommendations
    );
  } catch (error) {
    console.error(
      "Recommendation error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to generate scholarship recommendations.",
      error:
        error.message,
    });
  }
});


// ==========================================
// GET SCHOLARSHIP BY ID
// ==========================================

app.get(
  "/api/scholarships/:id",
  async (req, res) => {
    try {
      const scholarship =
        await Scholarship.findById(
          req.params.id
        );

      if (!scholarship) {
        return res.status(404).json({
          message:
            "Scholarship not found"
        });
      }

      res.json(scholarship);

    } catch (error) {
      console.error(
        "Get scholarship by ID error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch scholarship",

        error: error.message
      });
    }
  }
);

// ==========================================
// UPDATE SCHOLARSHIP
// ==========================================

app.put(
  "/api/scholarships/:id",
  async (req, res) => {
    try {
      const scholarship =
        await Scholarship.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true
          }
        );

      if (!scholarship) {
        return res.status(404).json({
          message:
            "Scholarship not found"
        });
      }

      res.json(scholarship);

    } catch (error) {
      console.error(
        "Update scholarship error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update scholarship",

        error: error.message
      });
    }
  }
);

// ==========================================
// DELETE SCHOLARSHIP
// ==========================================

app.delete(
  "/api/scholarships/:id",
  async (req, res) => {
    try {
      const scholarship =
        await Scholarship.findByIdAndDelete(
          req.params.id
        );

      if (!scholarship) {
        return res.status(404).json({
          message:
            "Scholarship not found"
        });
      }

      res.json({
        message:
          "Scholarship deleted successfully"
      });

    } catch (error) {
      console.error(
        "Delete scholarship error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete scholarship",

        error: error.message
      });
    }
  }
);

// ==========================================
// CONNECT MONGODB + START SERVER
// ==========================================

const PORT =
  process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB connected successfully"
    );

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });