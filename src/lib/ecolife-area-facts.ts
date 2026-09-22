/**
 * Kjøperorientert tilleggsstoff redigert fra Zen Eco Homes' innlandsguider.
 * Innbyggertall er offisiell kommunal Padrón per 1. januar 2025:
 * Alicante: https://datos.diputacionalicante.es/censo/
 * Jumilla: https://econet.carm.es/web/crem/inicio/-/crem/sicrem/PM2100/sec2_c1.html
 * Tall for en kommune må ikke leses som innbyggere i kun landsbysentrum.
 * Kartpunkter er omtrentlige sentrumspunkter, aldri eksakt eiendomsadresse.
 * Det finnes foreløpig ikke et verifisert bokutdrag for disse innlandsguidene.
 */
export type EcoLifeAreaFacts = {
  population: number | null;
  lat: number;
  lon: number;
  practical: string[];
  populationBreakdown?: Array<{ name: string; population: number }>;
};

export const ECO_LIFE_AREA_FACTS: Record<string, EcoLifeAreaFacts> = {
  "pinoso": {
    "population": 8523,
    "lat": 38.4028,
    "lon": -1.042,
    "practical": [
      "Pinoso har et lokalt sentrum med butikker, restauranter, håndverkere og et omland av mindre landsbyer som Lel, Úbeda og Encebras.",
      "Vin, Monastrell og lokale mattradisjoner er en del av hverdagslivet. Se både sentrum og områdene utenfor byen før du vurderer en tomt."
    ]
  },
  "monovar": {
    "population": 13116,
    "lat": 38.4374,
    "lon": -0.8382,
    "practical": [
      "Monóvar har byservice og et sentrum med en egen lokal identitet. Bodegas, vin- og mandellandskap preger deler av omlandet.",
      "Sammenlign en finca utenfor byen med et hjem nær sentrum: avstand til Elda/Petrer og hverdagsærender kan bety mer enn tomtens areal alene."
    ]
  },
  "la-romana": {
    "population": 2729,
    "lat": 38.367,
    "lon": -0.8985,
    "practical": [
      "La Romana er en mindre landsby med vinmarker, mandeltrær og landlige eiendommer rundt. For en kjøper er skillet mellom landsbylivet og spredte landsteder viktig.",
      "Test ruten til matbutikk, helsehjelp og nærmeste større by. På en finca må vann, adkomst og vedlikehold undersøkes før du planlegger hage eller ekstra bygg."
    ]
  },
  "hondon-dalene": {
    "population": null,
    "lat": 38.3089,
    "lon": -0.8534,
    "practical": [
      "Hondón de las Nieves og Hondón de los Frailes er to ulike kommuner og landsbymiljøer – ikke én og samme boligadresse.",
      "Besøk begge sentrum og eiendommene rundt dem. Service, avstand til daglige ærender og det internasjonale miljøet varierer fra sted til sted."
    ],
    "populationBreakdown": [
      {
        "name": "Hondón de las Nieves",
        "population": 2738
      },
      {
        "name": "Hondón de los Frailes",
        "population": 1334
      }
    ]
  },
  "hondon-de-las-nieves": {
    "population": 2738,
    "lat": 38.3089,
    "lon": -0.8534,
    "practical": [
      "Hondón de las Nieves, også kalt El Fondó de les Neus, har et lokalt sentrum og La Canalosa innenfor kommunen.",
      "Utenfor landsbyen finner du et variert landskap av vinmarker, mandel og oliven. Test daglig service og reisevei fra den faktiske eiendommen, ikke bare fra sentrum."
    ]
  },
  "aspe": {
    "population": 22397,
    "lat": 38.345,
    "lon": -0.767,
    "practical": [
      "Aspe har et etablert bysentrum med handel, skoler og andre helårstjenester. Borddruer, oliven og mandler setter preg på omlandet.",
      "Her bør du sammenligne en villa på urban tomt med et landligere prosjekt: størrelse, vann, infrastruktur og hva som kan bygges kan være svært forskjellig."
    ]
  },
  "novelda": {
    "population": 26606,
    "lat": 38.3848,
    "lon": -0.767,
    "practical": [
      "Novelda kombinerer byservice med modernistisk arkitektur, kultur og landbruksområder rundt. Santuario de Santa María Magdalena er et kjent landemerke.",
      "Et hjem i sentrum og en finca i omlandet gir ulike behov for bil, hagearbeid og daglige ærender. Se området på en vanlig ukedag."
    ]
  },
  "monforte-del-cid": {
    "population": 9283,
    "lat": 38.37915,
    "lon": -0.72905,
    "practical": [
      "Monforte del Cid har et historisk sentrum, vin- og jordbruksland og moderne boligmiljøer ved blant annet Font del Llop.",
      "Du kan prioritere enkel tilgang til Alicante, Elche og flyplassen uten å velge samme type bolig som ved kysten. Undersøk avstand og reisevei fra den konkrete adressen."
    ]
  },
  "biar": {
    "population": 3677,
    "lat": 38.6311,
    "lon": -0.7667,
    "practical": [
      "Biar ligger ved Serra de Mariola, med borg, gamle gater, butikker, skole og lokalt landsbyliv. Rundt landsbyen ligger oliven- og mandellandskap.",
      "Om du vurderer en finca, besøk eiendommen både i varme og kjøligere perioder: høyde, skygge, adkomst og vannforhold påvirker hvordan du kan bruke stedet."
    ]
  },
  "villena": {
    "population": 34712,
    "lat": 38.6373,
    "lon": -0.8657,
    "practical": [
      "Villena har et større bysentrum med handel, marked, skoler og helsetjenester. Rundt byen ligger vin- og jordbruksområder med landlige eiendommer.",
      "Villena AV er høyhastighetsstasjonen utenfor sentrum, ikke en stasjon ved alle boliger. Regn alltid reisetiden fra den faktiske adressen, inkludert transport til stasjonen."
    ]
  },
  "sax": {
    "population": 10346,
    "lat": 38.537,
    "lon": -0.8178,
    "practical": [
      "Sax har en borg over sentrum, lokale butikker og jernbane- og veiforbindelser i Vinalopó. Elda/Petrer og Villena er andre aktuelle servicesteder.",
      "Rundt byen ligger casas de campo og større tomter. Sammenlign det å bo i sentrum med en mer avsides eiendom før du velger."
    ]
  },
  "jumilla": {
    "population": 27574,
    "lat": 38.4762,
    "lon": -1.327,
    "practical": [
      "Jumilla er et større innlandssentrum i Murcia med en egen vintradisjon knyttet til Monastrell og DOP Jumilla.",
      "Bodegas, lokale mattradisjoner og Sierra de Santa Ana kan bli del av hverdagen. Innlandsklima og avstandene skiller seg fra de kystnære områdene, så besøk også utenfor feriesesongen."
    ]
  },
  "castalla": {
    "population": 11908,
    "lat": 38.5964,
    "lon": -0.6721,
    "practical": [
      "Castalla ligger i Foia de Castalla, omgitt av fjell og med et bysentrum under borgen. Onil og Ibi er andre steder i dalen du kan sammenligne.",
      "Bolig i urbanisasjon, byhus og landsted kan gi svært ulike hverdager. Se på turterreng, service, vinterklima og den faktiske adkomsten før du velger."
    ]
  },
  "banyeres-de-mariola": {
    "population": 7347,
    "lat": 38.7154,
    "lon": -0.6596,
    "practical": [
      "Banyeres de Mariola ligger over 800 meter over havet og har et lokalt landsbymiljø ved Serra de Mariola.",
      "Her merkes årstidene tydeligere enn i lavlandet. Vurder boligens isolering og oppvarming, adkomst om vinteren og hva som trives på tomten før du planlegger helårsbruk eller dyrking."
    ]
  },
  "busot": {
    "population": 3782,
    "lat": 38.4814,
    "lon": -0.4203,
    "practical": [
      "Busot er en landsby ved Cabeçó d’Or og Cuevas del Canelobre, med kysten fortsatt relativt nær.",
      "Sammenlign landsbysentrum, villaområdene og tomter utenfor byen. Tilgang til service og sjøen kan være svært ulik avhengig av adressen."
    ]
  }
};

export function straightLineKm(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const a = radians(from.lat);
  const b = radians(to.lat);
  const latitudeDelta = radians(to.lat - from.lat);
  const longitudeDelta = radians(to.lon - from.lon);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(a) * Math.cos(b) * Math.sin(longitudeDelta / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(haversine)));
}

export const AREA_ROUTE_DESTINATIONS = [
  { label: "Alicante-Elche flyplass", lat: 38.282169, lon: -0.558156 },
  { label: "Alicante sentrum", lat: 38.3452, lon: -0.4810 },
  { label: "Elche sentrum", lat: 38.2655, lon: -0.6989 },
] as const;

export function areaDrivingDirections(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
): string {
  const origin = encodeURIComponent(`${from.lat},${from.lon}`);
  const destination = encodeURIComponent(`${to.lat},${to.lon}`);
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
}

export function areaMapEmbed({ lat, lon }: { lat: number; lon: number }): string {
  const west = (lon - 0.065).toFixed(5);
  const east = (lon + 0.065).toFixed(5);
  const south = (lat - 0.045).toFixed(5);
  const north = (lat + 0.045).toFixed(5);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${lat}%2C${lon}`;
}
