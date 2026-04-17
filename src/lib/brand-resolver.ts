import Fuse from 'fuse.js';

interface BrandData {
  name: string;
  slug: string;
  hex: string;
  aliases?: string[];
  fullName?: string;
}

interface ResolutionResult {
  input: string;
  brand: string;
  slug: string;
  hex: string;
  found: boolean;
  source: string;
  svg?: string;
  sourceUrl?: string;
}

const COMMON_ALIASES: Record<string, string[]> = {
  'fb': ['facebook', 'meta'],
  'ig': ['instagram'],
  'yt': ['youtube'],
  'gh': ['github'],
  'li': ['linkedin'],
  'tw': ['twitter', 'x'],
  'tiktok': ['tiktok'],
  'pin': ['pinterest'],
  'reddit': ['reddit'],
  'discord': ['discord'],
  'spot': ['spotify'],
  'slack': ['slack'],
  'zoom': ['zoom'],
  'dropbox': ['dropbox'],
  'notion': ['notion'],
  'figma': ['figma'],
  'webflow': ['webflow'],
  'vercel': ['vercel'],
  'aws': ['amazon-web-services', 'amazon'],
  'gcp': ['google-cloud', 'google'],
  'azure': ['microsoft-azure', 'microsoft'],
  'goog': ['google'],
  'googl': ['google'],
  'amzn': ['amazon'],
  'amz': ['amazon'],
  'msft': ['microsoft'],
  'aapl': ['apple'],
  'nvda': ['nvidia'],
  'tsla': ['tesla'],
  'meta': ['facebook'],
};

const STOCK_TICKERS: Record<string, string> = {
  'aapl': 'apple',
  'goog': 'google',
  'googl': 'google',
  'amzn': 'amazon',
  'msft': 'microsoft',
  'meta': 'facebook',
  'fb': 'facebook',
  'nvda': 'nvidia',
  'tsla': 'tesla',
  'jpm': 'jpmorgan',
  'v': 'visa',
  'ma': 'mastercard',
  'dis': 'disney',
  'nflx': 'netflix',
  'pypl': 'paypal',
  'adbe': 'adobe',
  'crm': 'salesforce',
  'orcl': 'oracle',
  'ibm': 'ibm',
  'csco': 'cisco',
  'intc': 'intel',
  'amd': 'amd',
  'qcom': 'qualcomm',
  'txn': 'texas-instruments',
  'avgo': 'broadcom',
  'mu': 'micron',
  'lrcx': 'lam-research',
  'klac': 'kla',
  'mntc': 'mentor-graphics',
};

const DOMAIN_KEYWORDS: Record<string, string> = {
  'stripe': 'stripe',
  'shopify': 'shopify',
  'airbnb': 'airbnb',
  'uber': 'uber',
  'lyft': 'lyft',
  'doordash': 'doordash',
  'instacart': 'instacart',
  'robinhood': 'robinhood',
  'coinbase': 'coinbase',
  'spotify': 'spotify',
  'slack': 'slack',
  'zoom': 'zoom',
  'notion': 'notion',
  'figma': 'figma',
  'webflow': 'webflow',
  'framer': 'framer',
  'linear': 'linear',
  'vercel': 'vercel',
  'netlify': 'netlify',
  'cloudflare': 'cloudflare',
  'digitalocean': 'digitalocean',
  'heroku': 'heroku',
};

function extractDomainName(domain: string): string {
  const cleaned = domain
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/.*$/, '')
    .replace(/\.(com|org|net|io|co|ai|dev|app)$/i, '')
    .trim();
  
  return cleaned;
}

function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function extractAcronym(fullName: string): string {
  return fullName
    .split(/[\s&-]+/)
    .map(word => word[0])
    .join('')
    .toLowerCase();
}

export class BrandResolver {
  private brands: BrandData[] = [];
  private nameIndex: Map<string, BrandData> = new Map();
  private slugIndex: Map<string, BrandData> = new Map();
  private aliasIndex: Map<string, BrandData> = new Map();
  private tickerIndex: Map<string, BrandData> = new Map();
  private fuse: Fuse<BrandData> | null = null;
  private acronymIndex: Map<string, BrandData> = new Map();
  private domainIndex: Map<string, BrandData> = new Map();

  initialize(brands: Array<{ title: string; slug: string; hex: string; aliases?: { aka?: string[] } }>) {
    this.brands = brands.map(b => ({
      name: b.title,
      slug: b.slug,
      hex: b.hex,
      aliases: b.aliases?.aka || [],
      fullName: b.title,
    }));

    for (const brand of this.brands) {
      this.nameIndex.set(normalizeInput(brand.name), brand);
      this.slugIndex.set(brand.slug.toLowerCase(), brand);
      
      for (const alias of brand.aliases || []) {
        this.aliasIndex.set(normalizeInput(alias), brand);
      }
      
      const acronym = extractAcronym(brand.fullName || brand.name);
      if (acronym.length >= 2 && !this.acronymIndex.has(acronym)) {
        this.acronymIndex.set(acronym, brand);
      }
    }

    for (const [ticker, slug] of Object.entries(STOCK_TICKERS)) {
      const brand = this.brands.find(b => b.slug === slug);
      if (brand) {
        this.tickerIndex.set(ticker.toLowerCase(), brand);
      }
    }

    for (const [keyword, slug] of Object.entries(DOMAIN_KEYWORDS)) {
      const brand = this.brands.find(b => b.slug === slug);
      if (brand) {
        this.domainIndex.set(keyword, brand);
      }
    }

    this.fuse = new Fuse(this.brands, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'slug', weight: 0.3 },
        { name: 'aliases', weight: 0.2 },
        { name: 'fullName', weight: 0.1 },
      ],
      threshold: 0.35,
      includeScore: true,
      shouldSort: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
  }

  resolve(input: string): ResolutionResult {
    const normalized = normalizeInput(input);
    const originalNormalized = input.toLowerCase().trim();

    if (normalized.length < 2) {
      return this.notFoundResult(input);
    }

    if (this.slugIndex.has(normalized)) {
      const brand = this.slugIndex.get(normalized)!;
      return this.foundResult(input, brand, 'slug');
    }

    if (this.nameIndex.has(normalized)) {
      const brand = this.nameIndex.get(normalized)!;
      return this.foundResult(input, brand, 'exact');
    }

    const directAlias = COMMON_ALIASES[originalNormalized] || COMMON_ALIASES[normalized];
    if (directAlias) {
      for (const alias of directAlias) {
        const brand = this.slugIndex.get(alias.toLowerCase());
        if (brand) {
          return this.foundResult(input, brand, 'alias');
        }
      }
    }

    if (this.aliasIndex.has(normalized)) {
      const brand = this.aliasIndex.get(normalized)!;
      return this.foundResult(input, brand, 'alias');
    }

    if (this.tickerIndex.has(normalized)) {
      const brand = this.tickerIndex.get(normalized)!;
      return this.foundResult(input, brand, 'ticker');
    }

    if (this.acronymIndex.has(normalized)) {
      const brand = this.acronymIndex.get(normalized)!;
      return this.foundResult(input, brand, 'acronym');
    }

    if (originalNormalized.includes('.') && !originalNormalized.match(/^[a-z0-9]+$/)) {
      const domainName = extractDomainName(originalNormalized);
      const domainNormalized = normalizeInput(domainName);
      
      if (this.slugIndex.has(domainNormalized)) {
        const brand = this.slugIndex.get(domainNormalized)!;
        return this.foundResult(input, brand, 'domain');
      }
      
      if (this.nameIndex.has(domainNormalized)) {
        const brand = this.nameIndex.get(domainNormalized)!;
        return this.foundResult(input, brand, 'domain');
      }

      for (const [keyword, brand] of this.domainIndex) {
        if (domainNormalized.includes(keyword)) {
          return this.foundResult(input, brand, 'domain');
        }
      }

      const fuzzyResult = this.fuzzySearch(domainNormalized);
      if (fuzzyResult) {
        return { ...fuzzyResult, source: 'domain-fuzzy' };
      }
    }

    const fuzzyResult = this.fuzzySearch(normalized);
    if (fuzzyResult) {
      return fuzzyResult;
    }

    const partialResult = this.partialMatch(normalized);
    if (partialResult) {
      return partialResult;
    }

    return this.notFoundResult(input);
  }

  private fuzzySearch(query: string): ResolutionResult | null {
    if (!this.fuse || query.length < 2) return null;

    const results = this.fuse.search(query);
    
    if (results.length > 0) {
      const best = results[0];
      if (best.score !== undefined && best.score < 0.35) {
        return this.foundResult(best.item.name, best.item, 'fuzzy');
      }
    }
    return null;
  }

  private partialMatch(query: string): ResolutionResult | null {
    if (query.length < 3) return null;

    for (const brand of this.brands) {
      const nameNormalized = normalizeInput(brand.name);
      const slugNormalized = brand.slug.toLowerCase();
      
      if (nameNormalized.startsWith(query) || nameNormalized.endsWith(query)) {
        return this.foundResult(brand.name, brand, 'partial');
      }
      
      if (slugNormalized.startsWith(query)) {
        return this.foundResult(brand.name, brand, 'partial-slug');
      }
      
      if (nameNormalized.includes(query) && query.length >= 4) {
        return this.foundResult(brand.name, brand, 'contains');
      }
    }
    return null;
  }

  private foundResult(input: string, brand: BrandData, source: string): ResolutionResult {
    return {
      input,
      brand: brand.name,
      slug: brand.slug,
      hex: brand.hex,
      found: true,
      source,
    };
  }

  private notFoundResult(input: string): ResolutionResult {
    return {
      input,
      brand: '',
      slug: '',
      hex: '',
      found: false,
      source: 'not-found',
    };
  }

  resolveBatch(inputs: string[]): ResolutionResult[] {
    const seen = new Set<string>();
    const results: ResolutionResult[] = [];

    for (const input of inputs) {
      const normalized = normalizeInput(input);
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      
      results.push(this.resolve(input));
    }

    return results;
  }
}

let brandResolverInstance: BrandResolver | null = null;

export function getBrandResolver(): BrandResolver {
  if (!brandResolverInstance) {
    brandResolverInstance = new BrandResolver();
  }
  return brandResolverInstance;
}