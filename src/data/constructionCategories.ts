/**
 * Comprehensive Construction Expense Categories Data & Helper Functions
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

export interface CategoryGroup {
  groupNameBn: string;
  groupNameEn: string;
  expenseType: 'MATERIAL' | 'LABOUR' | 'CONTRACTOR' | 'SALARY' | 'CONVEYANCE' | 'FOOD' | 'ELECTRICITY' | 'OTHER';
  items: { bn: string; en: string }[];
}

export const DEFAULT_CONSTRUCTION_CATEGORIES: CategoryGroup[] = [
  {
    groupNameBn: '📦 ম্যাটেরিয়াল / কাঁচামাল (Materials)',
    groupNameEn: '📦 Raw Building Materials',
    expenseType: 'MATERIAL',
    items: [
      { bn: 'সিমেন্ট (Cement)', en: 'Cement' },
      { bn: 'রড / স্টীল (Rebar / Steel)', en: 'Rebar / Steel' },
      { bn: 'ইট / কনক্রিট ব্লক (Bricks / Concrete Blocks)', en: 'Bricks / Blocks' },
      { bn: 'বালু - সিলেটি লাল / ভিটি (Sand - Red & Sylhet)', en: 'Sand (Sylhet/Local)' },
      { bn: 'পাথর / খোয়া (Stone Chips / Khoa / Aggregate)', en: 'Stone Chips / Aggregate' },
      { bn: 'রেডি মিক্স কনক্রিট (Ready Mix Concrete)', en: 'Ready Mix Concrete' },
      { bn: 'টাইলস ও মার্বেল (Tiles & Marble)', en: 'Tiles & Marble' },
      { bn: 'স্যানিটারি ও প্লাম্বিং পাইপ/ফিটিংস (Sanitary & Plumbing)', en: 'Sanitary & Plumbing Pipes' },
      { bn: 'ইলেক্ট্রিক্যাল তার, সুইচ ও ফিটিংস (Electrical Cables & Fittings)', en: 'Electrical Wire & Fittings' },
      { bn: 'থাই গ্লাস, অ্যালুমিনিয়াম ও ডোর (Thai Glass & Aluminum)', en: 'Thai Glass & Aluminum' },
      { bn: 'গ্রিল, এমএস ও এসএস মেটাল (Grill, MS & SS Metal)', en: 'Grill & Metal Works' },
      { bn: 'রঙ, পুটি ও পেইন্টিং সামগ্রী (Paints, Primer & Putty)', en: 'Paints & Finishing Materials' },
      { bn: 'ওয়াটারপ্রুফিং কেমিক্যাল (Waterproofing Chemical)', en: 'Waterproofing Chemical' },
      { bn: 'কাঠ, দরজা ও ডোর ফ্রেম (Timber & Door Frames)', en: 'Timber & Door Frames' },
      { bn: 'সাটারিং শিট, কাঠের বাটাম ও প্লাইউড (Shuttering Sheet & Plywood)', en: 'Shuttering Sheet & Plywood' },
      { bn: 'সেফটি ইকুইপমেন্ট ও হেলমেট (Safety Helmets, Vest & Boots)', en: 'Safety Equipment & Boots' },
      { bn: 'হার্ডওয়্যার ও প্লাস্টিক মেটেরিয়াল (Hardware & Tools)', en: 'Hardware Tools' }
    ]
  },
  {
    groupNameBn: '👷 লেবার ও মিস্ত্রি মজুরি (Labour & Wages)',
    groupNameEn: '👷 Worker Wages & Labour',
    expenseType: 'LABOUR',
    items: [
      { bn: 'রাজমিস্ত্রি মজুরি (Masonry Labour / Rajmistri)', en: 'Masonry Labour' },
      { bn: 'রড বাইন্ডিং ও কাটিং মিস্ত্রি (Rod Binding Labour)', en: 'Rod Binding Labour' },
      { bn: 'সাটারিং ও সেন্টারিং মিস্ত্রি (Shuttering & Centering Labour)', en: 'Shuttering Labour' },
      { bn: 'মাটি কাটার লেবার (Excavation Labour)', en: 'Excavation Labour' },
      { bn: 'গাতনি ও প্লাস্টার মিস্ত্রি (Brickwork & Plaster Labour)', en: 'Brickwork & Plaster Labour' },
      { bn: 'টাইলস ও মার্বেল ফিটিং মিস্ত্রি (Tiles & Marble Labour)', en: 'Tiles Fitter Wages' },
      { bn: 'স্যানিটারি ও প্লাম্বিং মিস্ত্রি (Plumbing Labour)', en: 'Plumbing Labour' },
      { bn: 'ইলেক্ট্রিশিয়ান মজুরি (Electrician Labour)', en: 'Electrician Labour' },
      { bn: 'রঙ মিস্ত্রি মজুরি (Painter Labour)', en: 'Painter Labour' },
      { bn: 'পাইলিং লেবার ও গিয়ার ওয়ার্কার (Piling Workers)', en: 'Piling Workers' },
      { bn: 'দৈনিক হেলপার / দিনমজুর (Daily Helpers / Laborers)', en: 'Daily Helpers' }
    ]
  },
  {
    groupNameBn: '🏗️ কন্ট্রাক্টর বিল (Contractor Bills)',
    groupNameEn: '🏗️ Contractor Bills & Sub-contracts',
    expenseType: 'CONTRACTOR',
    items: [
      { bn: 'পাইলিং সাব-কন্ট্রাক্টর বিল (Piling Contractor Bill)', en: 'Piling Contractor Bill' },
      { bn: 'সিভিল ওয়ার্কস কন্ট্রাক্টর বিল (Civil Works Contractor Bill)', en: 'Civil Works Contractor Bill' },
      { bn: 'মাটি কাটা এস্কেভেশন কন্ট্রাক্টর (Excavation Contractor)', en: 'Excavation Contractor' },
      { bn: 'স্যানিটারি ও প্লাম্বিং কন্ট্রাক্টর (Sanitary Contractor)', en: 'Sanitary Contractor' },
      { bn: 'ইলেক্ট্রিক্যাল সাব-কন্ট্রাক্টর (Electrical Contractor)', en: 'Electrical Sub-contractor' },
      { bn: 'থাই, গ্লাস ও গ্লেজিং কন্ট্রাক্টর (Thai Glass & Glazing Contractor)', en: 'Thai Glass Contractor' },
      { bn: 'লিফট / এলিমিনেটর সরবরাহ ও স্থাপন (Lift & Elevator Contractor)', en: 'Elevator & Lift Contractor' },
      { bn: 'ফায়ার ফাইটিং ও সেফটি সিস্টেম (Fire Safety Contractor)', en: 'Fire Fighting Contractor' },
      { bn: 'ইন্টেরিয়র ও ডেকোরেশন কাজ (Interior & Finishing Contractor)', en: 'Interior Finishing Contractor' }
    ]
  },
  {
    groupNameBn: '🚜 ভারী যন্ত্রপাতি ও সরঞ্জাম ভাড়া (Machinery & Equipment Rent)',
    groupNameEn: '🚜 Machinery & Equipment Rent',
    expenseType: 'OTHER',
    items: [
      { bn: 'পাইলিং রিগ ও ভেকু ভাড়া (Piling Rig & Excavator JCB Rent)', en: 'Piling Rig & Excavator Rent' },
      { bn: 'মিক্সার মেশিন ও ম্যাটেরিয়াল লিফট (Concrete Mixer & Tower Hoist Rent)', en: 'Concrete Mixer & Lift Rent' },
      { bn: 'জেনারেটর ভাড়া ও ডিজেল/ফুয়েল (Generator Rent & Diesel Fuel)', en: 'Generator Rent & Diesel' },
      { bn: 'ক্রেন ও হেইস্ট ভাড়া (Tower Crane & Mobile Crane Rent)', en: 'Crane & Hoist Rent' },
      { bn: 'ভাইব্রেটার ও প্লেট কম্প্যাক্টর (Vibrator Machine & Compactor Rent)', en: 'Vibrator Machine Rent' },
      { bn: 'সাটারিং প্রপস ও স্ক্যাফোল্ডিং ভাড়া (Props & Scaffolding Pipe Rent)', en: 'Props & Scaffolding Pipe Rent' }
    ]
  },
  {
    groupNameBn: '📑 কনসালটেন্সি, ডিজাইন ও পারমিশন (Consultancy & Approvals)',
    groupNameEn: '📑 Consultancy & Official Approvals',
    expenseType: 'OTHER',
    items: [
      { bn: 'আর্কিটেকচারাল ডিজাইন ফি (Architectural Design Fee)', en: 'Architect Fee' },
      { bn: 'স্ট্রাকচারাল ডিজাইন ও ড্রয়িং ফি (Structural Design Fee)', en: 'Structural Engineering Fee' },
      { bn: 'সয়েল টেস্ট ও ল্যাব রিপোর্ট ফি (Soil Test & Lab Report Fee)', en: 'Soil Test & Lab Report' },
      { bn: 'রাজউক / সিটি কর্পোরেশন প্ল্যান পাস ফি (RAJUK / Municipality Approval Fee)', en: 'RAJUK & Approval Fee' },
      { bn: 'ডিজিটাল ল্যান্ড সার্ভে (Digital Land Survey Fee)', en: 'Digital Land Survey' },
      { bn: 'পরিবেশ ও ফায়ার লাইসেন্স ফি (Fire & Environmental Clearance Fee)', en: 'Clearance & Permit Fee' },
      { bn: 'আইনগত ও আইনি পরামর্শ ফি (Legal Advisor & Registry Fee)', en: 'Legal & Registration Fee' }
    ]
  },
  {
    groupNameBn: '🏢 সাইট অফিস ও অন্যান্য ওভারহেড (Site Office & Administrative)',
    groupNameEn: '🏢 Site Office & Overhead',
    expenseType: 'OTHER',
    items: [
      { bn: 'নাইট গার্ড ও সিকিউরিটি বেতন (Site Security Guard Salary)', en: 'Site Security Salary' },
      { bn: 'সাইট ইঞ্জিনিয়ার ভাতা / সম্মানি (Site Engineer Allowance)', en: 'Site Engineer Allowance' },
      { bn: 'সাইট অফিস অস্থায়ী বিদ্যুৎ ও পানি বিল (Site Electricity & Water)', en: 'Site Electricity & Water' },
      { bn: 'সাইট অফিস রুম ভাড়া (Site Office Rent)', en: 'Site Office Rent' },
      { bn: 'শ্রমিক ও সাইট মেহমানদের নাস্তা/চা (Site Staff Tea & Snacks)', en: 'Site Tea & Snacks' },
      { bn: 'সাইট কনভেয়েন্স ও লোকাল ট্রাভেল (Site Conveyance & Travel)', en: 'Site Conveyance' },
      { bn: 'সাইট পেটি ক্যাশ ও সাধারণ খরচ (Site Petty Cash)', en: 'Site Petty Cash' }
    ]
  }
];

const CUSTOM_CATEGORIES_KEY = 'skrp_custom_categories_v1';

export function getSavedCustomCategories(): string[] {
  try {
    const data = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomCategoryToStorage(categoryName: string): string[] {
  const trimmed = categoryName.trim();
  if (!trimmed) return getSavedCustomCategories();

  const current = getSavedCustomCategories();
  if (!current.includes(trimmed)) {
    const updated = [trimmed, ...current];
    try {
      localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving custom category', e);
    }
    return updated;
  }
  return current;
}

export const DEFAULT_MONTHLY_EXPENSE_HEADS = [
  'MD. eleyes',
  'Tutul',
  'Tutul Food Bill',
  'Electricity Bill',
  'Common Service Bill',
  'Office Rent & Maintenance',
  'Internet & Stationary'
];

const CUSTOM_MONTHLY_HEADS_KEY = 'skrp_custom_monthly_heads_v1';

export function getSavedCustomMonthlyExpenseHeads(): string[] {
  try {
    const data = localStorage.getItem(CUSTOM_MONTHLY_HEADS_KEY);
    const parsed: string[] = data ? JSON.parse(data) : [];
    return Array.from(new Set([...DEFAULT_MONTHLY_EXPENSE_HEADS, ...parsed]));
  } catch {
    return DEFAULT_MONTHLY_EXPENSE_HEADS;
  }
}

export function saveCustomMonthlyExpenseHeadToStorage(headName: string): string[] {
  const trimmed = headName.trim();
  if (!trimmed) return getSavedCustomMonthlyExpenseHeads();

  const current = getSavedCustomMonthlyExpenseHeads();
  if (!current.includes(trimmed)) {
    const updated = [...current, trimmed];
    try {
      const customOnly = updated.filter(h => !DEFAULT_MONTHLY_EXPENSE_HEADS.includes(h));
      localStorage.setItem(CUSTOM_MONTHLY_HEADS_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.error('Error saving custom monthly expense head', e);
    }
    return updated;
  }
  return current;
}
