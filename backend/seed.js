// backend/reseed.js
//
// Replaces migrate.js for this one-time fix. Run this ONCE to bring the
// database in line with the canonical data/scholarships.js (categories,
// genders, maxIncome fully populated on every record).
//
// Why not just reuse migrate.js (findOneAndUpdate + upsert)?
// findOneAndUpdate's upsert path does not reliably run Mongoose's array
// enum validators the same way `.save()` / `.create()` do — that's how
// genders: ["Female"] (capitalized) got into the DB despite the schema
// only allowing lowercase "female". This script uses insertMany with
// { ordered: false } after wiping the collection, which DOES validate
// against the schema per-document, so a mistake in the seed file will
// throw here instead of silently landing in Mongo.
//
// Usage: node reseed.js

const mongoose = require("mongoose");
require("dotenv").config();

const Scholarship = require("./models/Scholarship");
const scholarships = require("./data/scholarships");

const normalizeGender = (g) => String(g).trim().toLowerCase();
const normalizeCategory = (c) => String(c).trim().toLowerCase();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  // Defensive normalization in case any record in data/scholarships.js
  // still has mixed casing — belt and suspenders alongside the schema enum.
  const normalized = scholarships.map((s) => ({
    ...s,
    genders: (s.genders || []).map(normalizeGender),
    categories: (s.categories || []).map(normalizeCategory),
  }));

  const names = normalized.map((s) => s.name);
  const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
  if (duplicates.length) {
    console.warn(
      "⚠️  Duplicate scholarship names in seed file (will overwrite each other):",
      [...new Set(duplicates)]
    );
  }

  console.log(`Wiping existing scholarships collection...`);
  await Scholarship.deleteMany({});

  console.log(`Inserting ${normalized.length} scholarships with validation...`);
  try {
    const inserted = await Scholarship.insertMany(normalized, {
      ordered: false, // report all validation errors, not just the first
      runValidators: true,
    });
    console.log(`✅ Inserted ${inserted.length} scholarships successfully.`);
  } catch (error) {
    // insertMany with ordered:false throws a BulkWriteError containing
    // all failures — surface them individually so bad records are obvious.
    if (error.writeErrors) {
      console.error(`❌ ${error.writeErrors.length} record(s) failed validation:`);
      error.writeErrors.forEach((e) => {
        console.error(`  - ${e.err?.errmsg || e.errmsg}`);
      });
    } else {
      console.error("❌ Seeding failed:", error.message);
    }
  }

  await mongoose.connection.close();
  console.log("Done.");
}

run().catch((error) => {
  console.error("Reseed script crashed:", error);
  process.exit(1);
});