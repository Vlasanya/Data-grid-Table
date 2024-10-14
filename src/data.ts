export interface RowData {
  id: number;
  name: string; // Data Store
  platform: string;
  service: string;
  owners: string;
  region: string;
  dataStoreSensitivityScore: number;
  riskRating: number;
  sensitiveDataTypes: number;
  sensitiveFieldsFiles: number;
  sensitiveRecords: number;
  dataTags: string;
}

export const SERVER_DATA: RowData[] = [
  {
    id: 1,
    name: "Data Store 1", // Example name
    platform: "Platform A", // Can be set from `commodity`
    service: "Service X", // Can be set from `desk`
    owners: "Mark Ramirez", // Use traderName as owners
    region: "United States", // Map from countryCode using countryMap
    dataStoreSensitivityScore: 67, // Can be a simulated score
    riskRating: 45, // Example risk rating
    sensitiveDataTypes: 4, // Simulate or derive from quantity
    sensitiveFieldsFiles: 2875, // Use quantity as a proxy
    sensitiveRecords: 1456, // Use filledQuantity
    dataTags: "Tag-1", // Simulate tags
  },
  {
    id: 2,
    name: "Data Store 2",
    platform: "Platform B",
    service: "Service Y",
    owners: "James Erickson",
    region: "Italy",
    dataStoreSensitivityScore: 75,
    riskRating: 82,
    sensitiveDataTypes: 3,
    sensitiveFieldsFiles: 1556,
    sensitiveRecords: 1883,
    dataTags: "Tag-2",
  },
  {
    id: 3,
    name: "Data Store 3",
    platform: "Platform C",
    service: "Service Z",
    owners: "Vincent Tucker",
    region: "United Kingdom",
    dataStoreSensitivityScore: 54,
    riskRating: 92,
    sensitiveDataTypes: 5,
    sensitiveFieldsFiles: 1560,
    sensitiveRecords: 1347,
    dataTags: "Tag-3",
  },
  {
    id: 4,
    name: "Data Store 4",
    platform: "Platform D",
    service: "Service W",
    owners: "Lisa King",
    region: "Australia",
    dataStoreSensitivityScore: 83,
    riskRating: 15,
    sensitiveDataTypes: 2,
    sensitiveFieldsFiles: 1966,
    sensitiveRecords: 1494,
    dataTags: "Tag-4",
  },
  {
    id: 5,
    name: "Data Store 5",
    platform: "Platform E",
    service: "Service V",
    owners: "Karen Grimes",
    region: "France",
    dataStoreSensitivityScore: 61,
    riskRating: 65,
    sensitiveDataTypes: 6,
    sensitiveFieldsFiles: 1072,
    sensitiveRecords: 397,
    dataTags: "Tag-5",
  },
  {
    id: 6,
    name: "Data Store 6",
    platform: "Platform F",
    service: "Service U",
    owners: "Rachel Garrett",
    region: "France",
    dataStoreSensitivityScore: 59,
    riskRating: 42,
    sensitiveDataTypes: 7,
    sensitiveFieldsFiles: 904,
    sensitiveRecords: 375,
    dataTags: "Tag-6",
  },
  {
    id: 7,
    name: "Data Store 7",
    platform: "Platform G",
    service: "Service T",
    owners: "Brenda Daniels",
    region: "Japan",
    dataStoreSensitivityScore: 93,
    riskRating: 87,
    sensitiveDataTypes: 8,
    sensitiveFieldsFiles: 1949,
    sensitiveRecords: 1189,
    dataTags: "Tag-7",
  },
];

export const countryMap: { [key: string]: string } = {
  IT: "Italy",
  US: "United States",
  GB: "United Kingdom",
  AU: "Australia",
  FR: "France",
  DE: "Germany",
  CA: "Canada",
  JP: "Japan",
  CN: "China",
  IN: "India",
  BR: "Brazil",
  MX: "Mexico",
  RU: "Russia",
  ZA: "South Africa",
  ES: "Spain",
  NL: "Netherlands",
  SE: "Sweden",
  CH: "Switzerland",
  PT: "Portugal",
  AR: "Argentina",
  PL: "Poland",
  BE: "Belgium",
  SG: "Singapore",
  KR: "South Korea",
  NZ: "New Zealand",
  TR: "Turkey",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  IL: "Israel",
  GR: "Greece",
  DK: "Denmark",
};
