const articleAreaLinks: Record<string, string[]> = {
  "10000-m2-hva-gjor-du-med-plassen": ["pinoso", "la-romana", "hondon-de-las-nieves", "biar"],
  "et-annet-tempo-vanlig-tirsdag-innlandet": ["pinoso", "monovar", "biar", "villena"],
  "fra-supermarked-til-egen-hage": ["pinoso", "la-romana", "monovar", "jumilla"],
  "ferske-egg-frukttraer-mer-selvberget-liv": ["pinoso", "la-romana", "biar", "hondon-de-las-nieves"],
  "sykkel-fra-ytterdoren-innlandet": ["biar", "sax", "pinoso", "jumilla"],
  "naboen-mer-enn-personen-bak-veggen": ["la-romana", "monovar", "hondon-de-las-nieves", "villena"],
  "du-kjoper-rommet-rundt-huset": ["pinoso", "hondon-de-las-nieves", "la-romana", "biar"],
  "fra-blank-tomt-til-eget-landskap": ["pinoso", "aspe", "monforte-del-cid", "biar"],
  "egne-druer-og-lage-vin": ["pinoso", "monovar", "jumilla"],
  "nar-familien-kommer-pa-besok": ["hondon-de-las-nieves", "aspe", "monforte-del-cid", "pinoso"],
  "privatliv-er-den-nye-luksusen": ["pinoso", "la-romana", "biar", "hondon-de-las-nieves"],
  "10000-m2-i-praksis-for-du-bygger": ["pinoso", "aspe", "monforte-del-cid", "hondon-de-las-nieves"],
};

const alternativeAreaLinks: Record<string, string[]> = {
  pinoso: ["monovar", "jumilla", "la-romana"],
  monovar: ["pinoso", "la-romana", "novelda"],
  "la-romana": ["monovar", "hondon-de-las-nieves", "pinoso"],
  "hondon-de-las-nieves": ["aspe", "la-romana", "pinoso"],
  aspe: ["novelda", "monforte-del-cid", "hondon-de-las-nieves"],
  novelda: ["aspe", "monforte-del-cid", "monovar"],
  "monforte-del-cid": ["aspe", "novelda", "hondon-de-las-nieves"],
  biar: ["villena", "sax", "pinoso"],
  villena: ["biar", "sax", "novelda"],
  sax: ["villena", "biar", "novelda"],
  jumilla: ["pinoso", "monovar", "biar"],
};

export function getArticleAreaSlugs(articleSlug: string, limit = 4) {
  return (articleAreaLinks[articleSlug] || []).slice(0, limit);
}

export function getAreaArticleSlugs(areaSlug: string, limit = 4) {
  return Object.entries(articleAreaLinks)
    .filter(([, areaSlugs]) => areaSlugs.includes(areaSlug))
    .map(([articleSlug]) => articleSlug)
    .slice(0, limit);
}

export function getAlternativeAreaSlugs(areaSlug: string, limit = 3) {
  return (alternativeAreaLinks[areaSlug] || []).slice(0, limit);
}

export function getRelatedArticleSlugs(articleSlug: string, limit = 3) {
  const sourceAreas = new Set(articleAreaLinks[articleSlug] || []);

  return Object.entries(articleAreaLinks)
    .filter(([candidateSlug]) => candidateSlug !== articleSlug)
    .map(([candidateSlug, candidateAreas], index) => ({
      slug: candidateSlug,
      score: candidateAreas.reduce((sum, areaSlug) => sum + (sourceAreas.has(areaSlug) ? 1 : 0), 0),
      index,
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((candidate) => candidate.slug);
}
