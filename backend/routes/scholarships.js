const express = require("express");
const Scholarship = require("../models/Scholarship");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// If your fieldsOfStudy data is strict and accurate, set this to true so a
// field mismatch hides the scholarship. When false it only lowers the score.
const FIELD_IS_HARD = false;

const lower = (v) => String(v == null ? "" : v).trim().toLowerCase();
const list = (v) => (Array.isArray(v) ? v : []);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ==========================================
// GENDER
// ==========================================

function genderKey(value) {
  const v = lower(value);
  if (!v) return null;
  if (/^(all|any|both|everyone|open|no restriction|male and female|men and women|boys and girls)/.test(v)) return "all";
  if (/^(female|girl|girls|woman|women|f|lady|ladies)$/.test(v)) return "female";
  if (/^(male|boy|boys|man|men|m)$/.test(v)) return "male";
  return "other"; // "Other", "Prefer not to say", etc.
}

// Safety net for old data where "girls only" is written in free text.
function genderFromText(text) {
  const t = lower(text);
  const near = "[^.;,\\n]{0,25}";
  const fem = "(girls?|female|women|woman)";
  const mal = "(boys?|male|men|man)";
  const only = (g) =>
    new RegExp(`\\b${g}s?\\b${near}\\bonly\\b|\\bonly\\b${near}\\b${g}\\b`).test(t);
  const mentionsFemale = new RegExp(`\\b${fem}\\b`).test(t);
  const mentionsMale = new RegExp(`\\b${mal}\\b`).test(t);

  if (only(fem) && !mentionsMale) return ["female"];
  if (only(mal) && !mentionsFemale) return ["male"];
  return [];
}

function checkGender(s, user) {
  let keys = list(s.genders).map(genderKey).filter(Boolean);

  if (keys.length === 0) {
    const text = [
      ...list(s.eligibility),
      ...list(s.restrictions),
      s.name,
      s.description,
    ].join(" ");
    keys = genderFromText(text);
  }

  const open =
    keys.length === 0 ||
    keys.includes("all") ||
    (keys.includes("female") && keys.includes("male"));

  if (open) return { ok: true, restricted: false };
  return { ok: keys.includes(genderKey(user.gender)), restricted: true };
}

// ==========================================
// EDUCATION LEVEL
// ==========================================

function levelKey(value) {
  const v = lower(value);
  if (/phd|ph\.d|doctor/.test(v)) return "phd";
  if (/post\s*-?\s*graduat|\bpg\b|master/.test(v)) return "pg";
  if (/under\s*-?\s*graduat|\bug\b|bachelor|\bgraduat/.test(v)) return "ug";
  if (/diploma/.test(v)) return "diploma";
  if (/\b12(th)?\b|\bxii\b|\bhsc\b|intermediate/.test(v)) return "12th";
  if (/\b10(th)?\b|\bssc\b|matric/.test(v)) return "10th";
  return v;
}

function checkEducation(s, user) {
  const levels = list(s.educationLevels);
  if (levels.length === 0) return { ok: true, explicit: false };
  const mine = levelKey(user.educationLevel);
  return { ok: levels.some((l) => levelKey(l) === mine), explicit: true };
}

// ==========================================
// CATEGORY
// ==========================================

const categoryKey = (v) => {
  const x = lower(v);
  return x === "open" ? "general" : x; // signup says "Open", profile says "General"
};

function checkCategory(s, user) {
  const cats = list(s.categories).map(categoryKey);
  const mine = categoryKey(user.category);

  if (cats.length === 0) {
    // Old data: category may only be mentioned in text. Whole-word match only,
    // so "SC" no longer matches "scholarship" and "ST" no longer matches "student".
    const text = [...list(s.eligibility), ...list(s.restrictions), s.name, s.description]
      .join(" ")
      .toLowerCase();
    const mentioned = mine && new RegExp(`\\b${escapeRegex(mine)}\\b`).test(text);
    return { ok: true, explicit: false, mentioned: !!mentioned };
  }
  if (cats.some((c) => ["all", "any", "all categories"].includes(c))) {
    return { ok: true, explicit: false, mentioned: false };
  }
  // The user's own category is listed: strongest match.
  if (cats.includes(mine)) return { ok: true, explicit: true, mentioned: false };

  // "open" (= general) means unreserved, so students of every category may
  // apply. Without this rule SC/ST/OBC users would lose all private,
  // central and merit scholarships. They just rank lower than a direct match.
  if (cats.includes("general")) return { ok: true, explicit: false, mentioned: false };

  return { ok: false, explicit: true, mentioned: false };
}

// ==========================================
// INCOME
// ==========================================

const LAKH = 100000;

// "Below ₹1 lakh" -> 0..1L, "₹1–2.5 lakh" -> 1L..2.5L, "Above ₹8 lakh" -> 8L..infinity
function incomeBand(text) {
  const t = lower(text).replace(/,/g, "");
  const nums = (t.match(/\d+(\.\d+)?/g) || []).map(Number);
  if (nums.length === 0) return null;
  if (/below|under|less/.test(t)) return { min: 0, max: nums[0] * LAKH };
  if (/above|over|more/.test(t)) return { min: nums[0] * LAKH, max: Infinity };
  if (nums.length >= 2) return { min: nums[0] * LAKH, max: nums[1] * LAKH };
  return { min: nums[0] * LAKH, max: nums[0] * LAKH };
}

// "no" = definitely over the limit, "maybe" = band straddles the limit
function checkIncome(s, user) {
  const limit = s.maxIncome;
  const band = incomeBand(user.annualIncome);
  if (limit == null || !band) return "ok";
  if (band.min > limit) return "no";
  if (band.max > limit) return "maybe";
  return "ok";
}

// ==========================================
// FIELD + LOCATION (ranking only)
// ==========================================

function fieldMatches(s, user) {
  const fields = list(s.fieldsOfStudy).map(lower);
  if (fields.length === 0) return true;
  const uf = lower(user.fieldOfStudy);
  const uc = lower(user.course);
  return fields.some(
    (f) =>
      f.includes("higher education") ||
      f.includes("eligible") ||
      (uf && (uf.includes(f) || f.includes(uf))) ||
      (uc && (uc.includes(f) || f.includes(uc)))
  );
}

function locationMatches(s, user) {
  const locs = list(s.location).map(lower);
  if (locs.length === 0) return true;
  const state = lower(user.state);
  return locs.some((l) => l === state || l === "india" || l === "all india" || l === "all");
}

// ==========================================
// MAIN MATCHING
// Step 1: rules that REMOVE a scholarship (gender, education, category, income)
// Step 2: score what is left, to rank it
// ==========================================

function matchScholarships(user, scholarships) {
  const results = [];

  for (const s of scholarships) {
    const gender = checkGender(s, user);
    const education = checkEducation(s, user);
    const category = checkCategory(s, user);
    const income = checkIncome(s, user);
    const field = fieldMatches(s, user);

    // ---- Step 1: eligibility rules ----
    if (!gender.ok) continue;
    if (!education.ok) continue;
    if (!category.ok) continue;
    if (income === "no") continue;
    if (FIELD_IS_HARD && !field) continue;

    // ---- Step 2: score ----
    let score = 0;
    const matched = [];
    const warnings = [];

    score += 25;
    matched.push(education.explicit ? "Education level matches" : "Open to all education levels");

    if (field) {
      score += 25;
      matched.push("Field/course matches");
    } else {
      warnings.push("Field/course may not match");
    }

    if (locationMatches(s, user)) {
      score += 15;
      matched.push("Location matches");
    } else {
      warnings.push("Location may not match");
    }

    if (category.explicit) {
      score += 20;
      matched.push("Category matches");
    } else if (category.mentioned) {
      score += 20;
      matched.push("Category appears eligible");
    } else {
      score += 10;
    }

    score += 10;
    if (gender.restricted) matched.push("Gender matches");

    if (income === "ok") {
      score += 5;
      matched.push("Income is within limit");
    } else {
      warnings.push("Your income band may exceed the limit. Please verify.");
    }

    results.push({
      ...s,
      matchScore: score,
      matchPercentage: score,
      eligibilityStatus: income === "maybe" ? "Check income limit" : "Eligible",
      matchedCriteria: matched,
      failedCriteria: warnings,
    });
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results.filter((r) => r.matchScore >= 50);
}

// ==========================================
// GET /recommended  (uses the logged-in user from the database)
// ==========================================

router.get("/recommended", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const scholarships = await Scholarship.find({ isActive: true }).lean();
    const results = matchScholarships(user, scholarships);

    // Diagnostic line (safe to delete later). Shows up in Render > Logs.
    console.log(
      `[recommended] user: ${user.educationLevel} / ${user.category} / ${user.gender} / ${user.annualIncome}` +
        ` | active scholarships in DB: ${scholarships.length} | matched: ${results.length}`
    );

    res.json(results);
  } catch (error) {
    console.error("Scholarship recommendation error:", error);
    res.status(500).json({
      message: "Failed to generate scholarship recommendations.",
      error: error.message,
    });
  }
});

module.exports = router;
module.exports.matchScholarships = matchScholarships;