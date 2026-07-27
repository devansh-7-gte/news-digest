const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultSources = [
  {
    name: 'TechCrunch Technology',
    domain: 'technology',
    sourceType: 'rss',
    url: 'https://techcrunch.com/feed/',
    fetchFrequencyMinutes: 60,
    isActive: true
  },
  {
    name: 'Wired Top Stories',
    domain: 'technology',
    sourceType: 'rss',
    url: 'https://www.wired.com/feed/rss',
    fetchFrequencyMinutes: 60,
    isActive: true
  },
  {
    name: 'Yahoo Finance Top News',
    domain: 'finance',
    sourceType: 'rss',
    url: 'https://finance.yahoo.com/news/rssindex',
    fetchFrequencyMinutes: 60,
    isActive: true
  },
  {
    name: 'BBC World News',
    domain: 'politics',
    sourceType: 'rss',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    fetchFrequencyMinutes: 120,
    isActive: true
  },
  {
    name: 'NYT Politics',
    domain: 'politics',
    sourceType: 'rss',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    fetchFrequencyMinutes: 120,
    isActive: true
  },
  {
    name: 'ESPN Top Stories',
    domain: 'sports',
    sourceType: 'rss',
    url: 'https://www.espn.com/espn/rss/news',
    fetchFrequencyMinutes: 180,
    isActive: true
  }
];

async function main() {
  console.log('🌱 Start seeding news sources...');

  for (const source of defaultSources) {
    try {
      const result = await prisma.newsSource.upsert({
        where: { url: source.url },
        update: {
          name: source.name,
          domain: source.domain,
          sourceType: source.sourceType,
          fetchFrequencyMinutes: source.fetchFrequencyMinutes,
          isActive: source.isActive
        },
        create: source
      });
      console.log(`✅ Upserted source: "${result.name}" (${result.domain})`);
    } catch (error) {
      console.error(`❌ Failed to seed source "${source.name}":`, error.message);
    }
  }

  console.log('🌱 Seeding news sources completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
