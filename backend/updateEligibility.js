const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "data", "scholarships.js");
const scholarships = require(filePath);

const updates = {
  "Government of India Post-Matric Scholarship – SC": {
    categories: ["SC"],
  },

  "Post-Matric Tuition Fee & Examination Fee – SC": {
    categories: ["SC"],
  },

  "Maintenance Allowance – SC Professional Courses": {
    categories: ["SC"],
    maxIncome: 250000,
  },

  "Post-Matric Scholarship – ST": {
    categories: ["ST"],
  },

  "Tuition Fee & Exam Fee for Tribal Students – Freeship": {
    categories: ["ST"],
  },

  "Vocational Education Fee Reimbursement – ST": {
    categories: ["ST"],
  },

  "Vocational Education Maintenance Allowance – ST": {
    categories: ["ST"],
    maxIncome: 250000,
  },

  "Vocational Training Fee Reimbursement – ST": {
    categories: ["ST"],
  },

  "Post-Matric Scholarship – VJNT": {
    categories: ["VJNT"],
  },

  "Tuition Fees & Examination Fees – VJNT": {
    categories: ["VJNT"],
  },

  "Maintenance Allowance – VJNT/SBC Professional Courses": {
    categories: ["VJNT", "SBC"],
    maxIncome: 100000,
  },

  "Post-Matric Scholarship – OBC": {
    categories: ["OBC"],
  },

  "Tuition Fees & Examination Fees – OBC": {
    categories: ["OBC"],
  },

  "Post-Matric Scholarship – SBC": {
    categories: ["SBC"],
  },

  "Tuition Fees & Examination Fees – SBC": {
    categories: ["SBC"],
  },

  "OBC Girls Post-Matric Scholarship – Professional Courses": {
    categories: ["OBC"],
    genders: ["Female"],
  },

  "Tuition & Examination Fees – OBC Girls": {
    categories: ["OBC"],
    genders: ["Female"],
  },
};

let updated = 0;
const notFound = [];

for (const scholarship of scholarships) {
  const update = updates[scholarship.name];

  if (update) {
    Object.assign(scholarship, update);
    updated++;
  }
}

for (const name of Object.keys(updates)) {
  if (!scholarships.some((s) => s.name === name)) {
    notFound.push(name);
  }
}

const output = `const scholarships = ${JSON.stringify(
  scholarships,
  null,
  2
)};

module.exports = scholarships;
`;

fs.writeFileSync(filePath, output, "utf8");

console.log(`Updated and saved: ${updated}`);

if (notFound.length) {
  console.log("\nNot found:");
  notFound.forEach((name) => console.log("-", name));
}