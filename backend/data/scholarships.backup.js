const scholarships = [
  {
    name: "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti – DTE",
    provider: "Maharashtra Directorate of Technical Education",
    providerType: "Government",
    description:
      "Financial assistance for eligible Maharashtra students pursuing diploma, undergraduate or postgraduate technical and professional education.",
    educationLevels: ["Diploma", "UG", "PG"],
    fieldsOfStudy: [
      "Engineering",
      "Pharmacy",
      "Technical and Professional Courses"
    ],
    academicCriteria: "Scheme-specific",
    incomeCriteria: "Up to ₹8 lakh",
    eligibility: [
      "Maharashtra domicile",
      "Eligible CAP admission",
      "EBC/EWS and other applicable scheme conditions"
    ],
    benefits: [
      "Tuition fee support",
      "Examination fee support"
    ],
    documentsRequired: [
      "Aadhaar",
      "Domicile certificate",
      "Income certificate",
      "Admission/CAP documents",
      "Marksheets",
      "Bank details"
    ],
    restrictions: [
      "Must satisfy DTE/MahaDBT scheme conditions"
    ],
    location: ["Maharashtra", "India"],
    officialLink: "https://mahadbt.maharashtra.gov.in/",
    lastVerified: new Date("2026-08-15"),
    isActive: true
  },

  {
    name: "Dr. Panjabrao Deshmukh Vastigruh Nirvah Bhatta",
    provider: "Maharashtra Directorate of Technical Education",
    providerType: "Government",
    description:
      "Hostel and living maintenance assistance for eligible Maharashtra students pursuing professional and technical education.",
    educationLevels: ["Diploma", "UG", "PG"],
    fieldsOfStudy: [
      "Engineering",
      "Pharmacy",
      "Technical and Professional Courses"
    ],
    academicCriteria: "Scheme-specific",
    incomeCriteria: "Scheme-specific",
    eligibility: [
      "Maharashtra student",
      "Eligible professional or technical course",
      "Must satisfy hostel and income conditions"
    ],
    benefits: [
      "Hostel maintenance allowance",
      "Living expense support"
    ],
    documentsRequired: [
      "Domicile certificate",
      "Income certificate",
      "Admission documents",
      "Hostel or residence documents",
      "Aadhaar",
      "Bank details"
    ],
    restrictions: [
      "Hostel/residence conditions apply",
      "Course eligibility conditions apply"
    ],
    location: ["Maharashtra", "India"],
    officialLink: "https://mahadbt.maharashtra.gov.in/",
    lastVerified: new Date("2026-08-15"),
    isActive: true
  },

  {
    name: "Government of India Post-Matric Scholarship – SC",
    provider: "Government of India / Maharashtra",
    providerType: "Government",
    description:
      "Post-matric scholarship support for eligible Scheduled Caste students pursuing recognised higher education.",
    educationLevels: ["Diploma", "UG", "PG"],
    fieldsOfStudy: ["Recognised Post-Matric Courses"],
    academicCriteria: "Scheme-specific",
    incomeCriteria: "Scheme-specific",
    eligibility: [
      "SC student",
      "Eligible post-matric course",
      "Must satisfy Maharashtra and central scheme conditions"
    ],
    benefits: [
      "Maintenance allowance",
      "Eligible fee support"
    ],
    documentsRequired: [
      "Caste certificate",
      "Income certificate",
      "Domicile certificate",
      "Marksheets",
      "Admission proof",
      "Aadhaar",
      "Bank details"
    ],
    restrictions: [
      "SC category requirement",
      "Recognised course/institution requirement"
    ],
    location: ["Maharashtra", "India"],
    officialLink: "https://mahadbt.maharashtra.gov.in/",
    lastVerified: new Date("2026-08-15"),
    isActive: true
  },

  {
    name: "Post-Matric Scholarship – Persons with Disability",
    provider: "Maharashtra Government",
    providerType: "Government",
    description:
      "Scholarship and maintenance support for eligible Maharashtra students with disabilities pursuing post-matric education.",
    educationLevels: ["Diploma", "UG", "PG"],
    fieldsOfStudy: ["Eligible Post-Matric Courses"],
    academicCriteria: "Scheme-specific",
    incomeCriteria: "Scheme-specific",
    eligibility: [
      "Maharashtra student",
      "Eligible disability category",
      "Eligible post-matric course"
    ],
    benefits: [
      "Scholarship support",
      "Maintenance allowance"
    ],
    documentsRequired: [
      "Disability certificate",
      "Domicile certificate",
      "Income certificate",
      "Marksheets",
      "Admission proof",
      "Aadhaar",
      "Bank details"
    ],
    restrictions: [
      "Disability percentage/category conditions apply",
      "Course eligibility conditions apply"
    ],
    location: ["Maharashtra", "India"],
    officialLink: "https://mahadbt.maharashtra.gov.in/",
    lastVerified: new Date("2026-08-15"),
    isActive: true
  },

  {
    name: "Eklavya Scholarship",
    provider: "Maharashtra Directorate of Higher Education",
    providerType: "Government",
    description:
      "Merit-based scholarship for eligible Maharashtra postgraduate students in Arts, Commerce, Law and Science.",
    educationLevels: ["PG"],
    fieldsOfStudy: [
      "Arts",
      "Commerce",
      "Law",
      "Science"
    ],
    academicCriteria:
      "60% for Arts/Commerce/Law and 70% for Science",
    incomeCriteria: "Up to ₹75,000",
    eligibility: [
      "Maharashtra resident",
      "Eligible postgraduate student",
      "Must satisfy academic and income requirements"
    ],
    benefits: [
      "₹5,000 scholarship"
    ],
    documentsRequired: [
      "Marksheets",
      "Income certificate",
      "Domicile certificate",
      "Admission proof",
      "Bank details"
    ],
    restrictions: [
      "Course conditions apply",
      "Employment conditions may apply"
    ],
    location: ["Maharashtra", "India"],
    officialLink: "https://mahadbt.maharashtra.gov.in/",
    lastVerified: new Date("2026-08-15"),
    isActive: true
  }
];

module.exports = scholarships;