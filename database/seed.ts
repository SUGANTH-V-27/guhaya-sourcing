/**
 * Seed script for Guhaya Sourcing Initial Production Setup
 */
export const initialSeedBrands = [
  {
    id: "soxo",
    name: "SOXO",
    category: "Home & Kitchen Textiles",
    country: "United Kingdom",
    description: "Premium European retail client specializing in home textiles, tote bags and apparel.",
    image: "",
    logoUrl: "",
    modelCount: 1,
    totalModels: 1,
    activeOrders: 1,
  },
  {
    id: "tera",
    name: "TERA",
    category: "Casual & Outerwear",
    country: "Germany",
    description: "Contemporary casual wear brand with seasonal collections and tech packs.",
    image: "",
    logoUrl: "",
    modelCount: 1,
    totalModels: 1,
    activeOrders: 1,
  },
  {
    id: "astra",
    name: "ASTRA",
    category: "Activewear & Performance",
    country: "United States",
    description: "High performance sportswear and athleisure apparel brand.",
    image: "",
    logoUrl: "",
    modelCount: 0,
    totalModels: 0,
    activeOrders: 0,
  },
  {
    id: "korva",
    name: "KORVA",
    category: "Denim & Workwear",
    country: "Netherlands",
    description: "Sustainable denim and durable workwear collections.",
    image: "",
    logoUrl: "",
    modelCount: 0,
    totalModels: 0,
    activeOrders: 0,
  },
];

export const initialSeedModels = [
  {
    id: "5906482949644",
    brandId: "soxo",
    code: "5906482949644",
    name: "Tote Bag",
    category: "Home Textiles",
    status: "Pending",
    daysToHandover: 3,
    factoryName: "NANDHI FABRICS",
    buyer: "Kamila Jurczak",
    department: "Home Textiles",
    subclass: "Tote Bags / Kitchen Textiles",
    season: "2027",
  },
];

console.log("Seed data prepared for Guhaya Sourcing platform.");
