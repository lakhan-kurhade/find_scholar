const express = require("express");
const Scholarship = require("../models/Scholarship");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ==========================================
// GET RECOMMENDED SCHOLARSHIPS
// ==========================================

router.get("/recommended", authMiddleware, async (req, res) => {
  try {
    // Get logged-in user
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Get all active scholarships
    const scholarships = await Scholarship.find({
      isActive: true,
    });

    const userIncome = Number(
      String(user.annualIncome || "")
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .replace(/lakh/gi, "00000")
        .replace(/lakhs/gi, "00000")
        .replace(/[^\d.]/g, "")
    );

    const recommendations = scholarships.map((scholarship) => {
      let score = 0;
      const reasons = [];
      const warnings = [];

      // ==========================================
      // 1. EDUCATION LEVEL
      // ==========================================

      if (
        scholarship.educationLevels.length === 0 ||
        scholarship.educationLevels.some(
          (level) =>
            level.toLowerCase() ===
            user.educationLevel.toLowerCase()
        )
      ) {
        score += 25;
        reasons.push("Education level matches");
      }

      // ==========================================
      // 2. FIELD OF STUDY
      // ==========================================

      const userField = user.fieldOfStudy.toLowerCase();
      const userCourse = user.course.toLowerCase();

      const fieldMatch =
        scholarship.fieldsOfStudy.length === 0 ||
        scholarship.fieldsOfStudy.some((field) => {
          const scholarshipField = field.toLowerCase();

          return (
            userField.includes(scholarshipField) ||
            scholarshipField.includes(userField) ||
            userCourse.includes(scholarshipField) ||
            scholarshipField.includes(userCourse) ||
            scholarshipField.includes("higher education") ||
            scholarshipField.includes("eligible")
          );
        });

      if (fieldMatch) {
        score += 25;
        reasons.push("Field/course matches");
      } else {
        warnings.push("Field/course may not match");
      }

      // ==========================================
      // 3. STATE / LOCATION
      // ==========================================

      const userState = user.state.toLowerCase();

      const locationMatch =
        scholarship.location.length === 0 ||
        scholarship.location.some((location) => {
          const scholarshipLocation = location.toLowerCase();

          return (
            scholarshipLocation === userState ||
            scholarshipLocation === "india"
          );
        });

      if (locationMatch) {
        score += 15;
        reasons.push("Location matches");
      } else {
        warnings.push("Location may not match");
      }

      // ==========================================
      // 4. CATEGORY
      // ==========================================

      if (scholarship.categories.length > 0) {
        const categoryMatch = scholarship.categories.some(
          (category) =>
            category.toLowerCase() ===
            user.category.toLowerCase()
        );

        if (categoryMatch) {
          score += 20;
          reasons.push("Category matches");
        } else {
          warnings.push("Category does not match");
        }
      } else {
        // Existing seed data often stores category
        // information inside eligibility text.
        const eligibilityText = [
          ...(scholarship.eligibility || []),
          ...(scholarship.restrictions || []),
          scholarship.name,
          scholarship.description || "",
        ]
          .join(" ")
          .toLowerCase();

        if (
          eligibilityText.includes(
            user.category.toLowerCase()
          )
        ) {
          score += 20;
          reasons.push("Category appears eligible");
        }
      }

      // ==========================================
      // 5. GENDER
      // ==========================================

      if (scholarship.genders.length > 0) {
        const genderMatch = scholarship.genders.includes(
          user.gender
        );

        if (genderMatch) {
          score += 10;
          reasons.push("Gender matches");
        } else {
          warnings.push("Gender requirement may not match");
        }
      } else {
        score += 10;
      }

      // ==========================================
      // 6. INCOME
      // ==========================================

      if (
        scholarship.maxIncome !== null &&
        !isNaN(userIncome) &&
        userIncome > 0
      ) {
        if (userIncome <= scholarship.maxIncome) {
          score += 5;
          reasons.push("Income is within limit");
        } else {
          warnings.push("Income may exceed the limit");
        }
      } else {
        score += 5;
      }

      // ==========================================
      // MATCH LEVEL
      // ==========================================

      let matchLevel = "Possible Match";

      if (score >= 85) {
        matchLevel = "Excellent Match";
      } else if (score >= 70) {
        matchLevel = "Strong Match";
      } else if (score < 50) {
        matchLevel = "Low Match";
      }

      return {
        scholarship,
        score,
        matchLevel,
        reasons,
        warnings,
      };
    });

    // ==========================================
    // SORT BEST MATCH FIRST
    // ==========================================

    recommendations.sort((a, b) => b.score - a.score);

    // Only return useful recommendations
    const filteredRecommendations =
      recommendations.filter(
        (item) => item.score >= 50
      );

    res.json({
      message: "Scholarship recommendations generated successfully.",
      user: {
        educationLevel: user.educationLevel,
        course: user.course,
        fieldOfStudy: user.fieldOfStudy,
        state: user.state,
        category: user.category,
        gender: user.gender,
        annualIncome: user.annualIncome,
      },
      count: filteredRecommendations.length,
      recommendations: filteredRecommendations,
    });
  } catch (error) {
    console.error(
      "Scholarship recommendation error:",
      error
    );

    res.status(500).json({
      message: "Failed to generate scholarship recommendations.",
      error: error.message,
    });
  }
});

module.exports = router;