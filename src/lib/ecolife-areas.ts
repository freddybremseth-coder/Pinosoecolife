export type EcoLifeArea = {
  slug: string;
  name: string;
  region: "Alicante" | "Murcia";
  zone: "vinland" | "landsby" | "praktisk" | "fjell";
  eyebrow: string;
  summary: string;
  story: string[];
  bestFor: string[];
  highlights: string[];
  photo: string;
  searchTerms: string[];
};

// These profiles adapt the fact-checked Zen Eco Homes Inland area work to the
// Pinoso Eco Life brand. The emphasis here is everyday life, land and fit — not
// a duplicate property-market description. Concrete planning/buildability must
// always be checked on the individual plot.
export const ecoLifeAreas: EcoLifeArea[] = [
  {
    slug: "pinoso",
    name: "Pinoso",
    region: "Alicante",
    zone: "vinland",
    eyebrow: "Vinland · store tomter · helårsliv",
    summary:
      "Pinoso er kjernen i Eco Life-idéen: en by som fungerer hele året, med vinlandskap, lokale tjenester og landlige eiendommer der uteområdet kan bli en stor del av hverdagen.",
    story: [
      "Mange kommer hit fordi de ønsker mer enn selve huset. De vil ha plass til basseng uten innsyn, utekjøkken, familie på besøk, hunder, hage eller bare følelsen av å åpne døren mot landskap i stedet for en nabobalkong.",
      "Byen har et etablert hverdagsliv med butikker, restauranter og lokale håndverkere, mens vinmarker og mindre landsbyer begynner kort vei utenfor sentrum. Det gjør det mulig å bo landlig uten at alle praktiske ærender blir et prosjekt.",
      "For Pinoso Eco Life er dette området der tomten virkelig kan bli en del av hjemmet: natur, dyrking, trær, uteplasser og små prosjekter som utvikles over tid.",
    ],
    bestFor: ["Moderne villa på stor tomt", "Privatliv og uteområder", "Vinland og lokalt hverdagsliv"],
    highlights: ["Monastrell og lokal vinkultur", "Stort omland med fincaer og tomter", "By med tjenester gjennom hele året"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Pinoso-_Torre_del_Reloj.jpg/960px-Pinoso-_Torre_del_Reloj.jpg",
    searchTerms: ["Pinoso", "El Pinos", "El Pinós", "Ubeda", "Encebras"],
  },
  {
    slug: "monovar",
    name: "Monóvar",
    region: "Alicante",
    zone: "landsby",
    eyebrow: "Vinby · hverdagsliv · finca-landskap",
    summary:
      "Monóvar passer for deg som liker et lokalt bymiljø, men vil ha vinmarker, mandeltrær og større eiendommer rett utenfor byen.",
    story: [
      "I sentrum finner du butikker, kaféer og restauranter som brukes gjennom hele året. Byen er mindre preget av internasjonal turisme enn mange kyststeder, og det gir en annen rytme i hverdagen.",
      "Kjører du noen minutter ut, åpner landskapet seg. Her kan en eiendom romme hage, gjester, dyr eller verksted samtidig som du fortsatt har et levende sentrum i nærheten.",
      "Monóvar er derfor interessant for kjøpere som vil ha det landlige uten å gjøre seg avhengig av lange kjøreturer for alle daglige behov.",
    ],
    bestFor: ["Finca med nærhet til by", "Helårsboende", "Vin, mandler og landlig frihet"],
    highlights: ["Vinby med lokal identitet", "Landsteder i omlandet", "Praktisk forbindelse mot Elda/Petrer"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Monovar.Ermita_de_Santa_B%C3%A1rbara.jpg/960px-Monovar.Ermita_de_Santa_B%C3%A1rbara.jpg",
    searchTerms: ["Monovar", "Monóvar", "Algueña", "Salinas"],
  },
  {
    slug: "la-romana",
    name: "La Romana",
    region: "Alicante",
    zone: "landsby",
    eyebrow: "Vinmarker · småveier · ro",
    summary:
      "La Romana er for deg som mener alvor når du sier at du vil ha fred, natur og plass rundt boligen, men fortsatt ønsker landsby og større byer innen praktisk rekkevidde.",
    story: [
      "Her merkes det landlige livet raskt. Vinmarker, mandeltrær og småveier gjør at uteplassen og tomten ofte blir like viktig som selve huset.",
      "For noen handler kjøpet om hage og frukttrær. For andre om hunder, gjester, et hobbyprosjekt eller ganske enkelt færre naboer tett på. Det er nettopp friheten til å velge som er sterk.",
      "La Romana har et roligere og mindre internasjonalt preg enn Pinoso og Hondón. For riktig kjøper er det ikke en ulempe, men selve grunnen til å velge stedet.",
    ],
    bestFor: ["Ro og privatliv", "Kjøkkenhage og uteprosjekter", "Lite, lokalt landsbymiljø"],
    highlights: ["Mellom Pinoso, Novelda og Monóvar", "Vin- og mandellandskap", "Landlig hverdag med landsbyen i nærheten"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/La_Romana_Sunrise.jpg/960px-La_Romana_Sunrise.jpg",
    searchTerms: ["La Romana", "Romana"],
  },
  {
    slug: "hondon-de-las-nieves",
    name: "Hondón de las Nieves",
    region: "Alicante",
    zone: "landsby",
    eyebrow: "El Fondó de les Neus · vinmarker · dal",
    summary:
      "Hondón de las Nieves gir en mykere overgang til innlandslivet: vinmarker og større uteområder, men også et område som allerede er kjent blant internasjonale boligeiere.",
    story: [
      "Vinmarker, mandeltrær og oliven er en del av landskapet rundt landsbyen. Sentrum er oversiktlig, og utenfor blir eiendommene raskt mer spredt og landlige.",
      "Her kan terrasse, basseng, utsikt, hage og plass til gjester få større betydning enn gangavstand til strand. Det er roen og rommet rundt boligen som blir en del av kjøpet.",
      "Hondón-dalene omfatter både Hondón de las Nieves og Hondón de los Frailes, med egne landsbymiljøer og ulike eiendommer rundt. Prøv begge på en vanlig ukedag, og sammenlign reisevei og service fra den faktiske adressen.",
    ],
    bestFor: ["Villa eller finca i vinlandskap", "Internasjonalt miljø", "Innlandsro med praktisk rekkevidde"],
    highlights: ["Også kjent som El Fondó de les Neus", "Vinmarker, mandel og oliven", "Ved Sierra de Crevillent"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Hond%C3%B3n_de_las_Nieves_-_Plaza_de_la_Villa_y_Ayuntamiento.jpg/960px-Hond%C3%B3n_de_las_Nieves_-_Plaza_de_la_Villa_y_Ayuntamiento.jpg",
    searchTerms: ["Hondon de las Nieves", "Hondón de las Nieves", "La Canalosa"],
  },
  {
    slug: "aspe",
    name: "Aspe",
    region: "Alicante",
    zone: "praktisk",
    eyebrow: "Vinalopó · nybygg · praktisk beliggenhet",
    summary:
      "Aspe kombinerer innlandsfølelse og større utearealer med en beliggenhet som gjør Alicante, Elche og flyplassen til en realistisk del av hverdagen.",
    story: [
      "Byen fungerer hele året og jordbruksområdene ligger tett på. Du trenger derfor ikke langt ut før landskapet åpner seg og tomtene blir større.",
      "Denne kombinasjonen gjør Aspe interessant for moderne nybygg: arkitektur og komfort som mange forbinder med kysten, men med mer rom rundt huset.",
      "Hvis du reiser ofte eller får mye besøk fra Norge, kan den praktiske beliggenheten være like viktig som selve tomtestørrelsen.",
    ],
    bestFor: ["Moderne nybygg", "Hyppige flyreiser", "Mer plass uten å bo dypt i innlandet"],
    highlights: ["Levende by gjennom året", "Druer, oliven og mandel i omlandet", "Praktisk forbindelse mot Alicante/Elche"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Basilica_de_Aspe.JPG/960px-Basilica_de_Aspe.JPG",
    searchTerms: ["Aspe"],
  },
  {
    slug: "novelda",
    name: "Novelda",
    region: "Alicante",
    zone: "praktisk",
    eyebrow: "Byliv · modernisme · landskap rundt",
    summary:
      "Novelda passer for deg som ikke vil velge mellom by og land: et ordentlig sentrum med handel og kultur, og vinmarker og landlige eiendommer like utenfor.",
    story: [
      "Noen kjøpere vil kunne gå til sentrum. Andre vil bo utenfor byen med større tomt og bruke Novelda som sitt daglige servicested. Begge livsstilene finnes innenfor samme område.",
      "Det gir mer fleksibilitet enn i små landsbyer der nesten alt krever bil, samtidig som du kan få langt mer rom rundt boligen enn i de tetteste kystområdene.",
      "For Eco Life-kjøperen er Novelda særlig interessant når ønsket om plass skal balanseres mot handel, kultur og enkel logistikk.",
    ],
    bestFor: ["Byservice + større eiendom", "Helårsboende", "Kultur og hverdagslogistikk"],
    highlights: ["Modernistisk arkitektur", "Vin- og jordbruksland rundt byen", "God forbindelse gjennom Vinalopó"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Santuario_Novelda.jpg/960px-Santuario_Novelda.jpg",
    searchTerms: ["Novelda"],
  },
  {
    slug: "monforte-del-cid",
    name: "Monforte del Cid",
    region: "Alicante",
    zone: "praktisk",
    eyebrow: "Vin · golf · kort vei til flyplassen",
    summary:
      "Monforte del Cid passer for deg som vil ha et roligere og mer åpent miljø, men ikke vil bruke mye tid på transport til Alicante, Elche eller flyplassen.",
    story: [
      "Området gir flere boformer: moderne bolig nær golf, et hjem i byen eller større eiendom i utkanten. Det gjør stedet interessant både for helårsbruk og for deg som kommer og går gjennom året.",
      "Når reiseveien til flyplassen er kort, blir helgeturer, familie på besøk og hyppige reiser enklere i praksis.",
      "Samtidig beholder området vinmarker og åpent landskap. For noen er nettopp balansen mellom tilgjengelighet og plass viktigere enn å bo dypest mulig i innlandet.",
    ],
    bestFor: ["Enkel reise til/fra Norge", "Golf og moderne bolig", "Åpent miljø nær Alicante/Elche"],
    highlights: ["Font del Llop", "Vinmarker rundt byen", "Praktisk beliggenhet mot flyplass og hovedveier"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Vi%C3%B1edos_en_Monforte_del_Cid.jpg/960px-Vi%C3%B1edos_en_Monforte_del_Cid.jpg",
    searchTerms: ["Monforte", "Monforte del Cid"],
  },
  {
    slug: "biar",
    name: "Biar",
    region: "Alicante",
    zone: "fjell",
    eyebrow: "Fjell · historie · olivenlandskap",
    summary:
      "Biar er for deg som vil ha tydeligere årstider, fjell, historie og et lokalt landsbymiljø – og som ikke trenger strandlivet som ramme rundt hver dag.",
    story: [
      "En vanlig hverdag kan være kaffe i landsbyen, tur i fjellet og hjem til olivenlunder og åpne landskap. Landsbyen lever gjennom året og har en sterk lokal identitet.",
      "Utenfor sentrum finnes større eiendommer med mulighet for mer privatliv, hage, trær, verksted eller plass til gjester. Det er et annet Spania enn kysten, både visuelt og i rytme.",
      "Biar passer spesielt godt for kjøpere som ønsker at naturen og selve eiendommen skal fylle mer av dagen enn strand, shopping og turisttilbud.",
    ],
    bestFor: ["Natur og fjell", "Finca/gård med karakter", "Lokalt landsbyliv"],
    highlights: ["Historisk borg og gamleby", "Oliven- og mandellandskap", "Serra de Mariola i nærheten"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Pueblo_y_castillo_de_Biar%2C_Alicante.jpg/960px-Pueblo_y_castillo_de_Biar%2C_Alicante.jpg",
    searchTerms: ["Biar"],
  },
  {
    slug: "villena",
    name: "Villena",
    region: "Alicante",
    zone: "fjell",
    eyebrow: "Byservice · vinland · transport",
    summary:
      "Villena er alternativet for deg som vil ha mer plass og innlandslandskap, men samtidig ønsker et større bysentrum med handel, tjenester og transport.",
    story: [
      "Du kan bo sentralt og gå til mye, eller velge en eiendom i utkanten og fortsatt ha byen tett på. Det gir fleksibilitet for helårsboende og familier.",
      "Rundt byen åpner landskapet seg med vinmarker og jordbruk. Du kan derfor kombinere byservice med finca-følelse uten at alle praktiske ting krever lange kjøreturer.",
      "Villena passer for dem som liker ideen om innlandet, men som ikke ønsker at hverdagen skal føles isolert eller avhengig av en liten landsby.",
    ],
    bestFor: ["Helårsboende og familier", "By + land i samme område", "Transport og tjenester"],
    highlights: ["Castillo de la Atalaya", "Høyhastighetstog via Villena AV", "Vin- og jordbruksland rundt byen"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Sierra_de_la_Villa._Villena._Castillo_de_la_Atalaya_1.jpg/960px-Sierra_de_la_Villa._Villena._Castillo_de_la_Atalaya_1.jpg",
    searchTerms: ["Villena"],
  },
  {
    slug: "sax",
    name: "Sax",
    region: "Alicante",
    zone: "fjell",
    eyebrow: "Småby · borg · Vinalopó",
    summary:
      "Sax kombinerer en kompakt spansk småby med muligheten til å bo landlig bare noen minutter utenfor sentrum.",
    story: [
      "Borgen over byen gir stedet en tydelig identitet, men i hverdagen er det den oversiktlige skalaen som betyr mest: lokale butikker og daglige tjenester uten storbyfølelse.",
      "Utenfor sentrum finnes casas de campo og større tomter med plass til hage, basseng, hunder, hobbyer og gjester.",
      "Sax er et godt kompromiss hvis du ønsker roligere omgivelser og et mer lokalt liv, men fortsatt vil ha enkel logistikk mot Elda, Petrer og Villena.",
    ],
    bestFor: ["Småbyliv", "Casas de campo", "God logistikk i Vinalopó"],
    highlights: ["Borgen over byen", "A-31 og togforbindelse", "Landlige eiendommer rundt sentrum"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Sax.Castillo.jpg/960px-Sax.Castillo.jpg",
    searchTerms: ["Sax"],
  },
  {
    slug: "jumilla",
    name: "Jumilla",
    region: "Murcia",
    zone: "vinland",
    eyebrow: "Murcia · Monastrell · store horisonter",
    summary:
      "Jumilla er et tydeligere innlandsvalg for deg som vil ha vinland, plass, lokal identitet og et større bysentrum uten å bygge hverdagen rundt kysten.",
    story: [
      "Her er vin en del av økonomien og matkulturen, ikke bare et bakteppe. Bodegas, Monastrell og lokale tradisjoner setter preg på området gjennom året.",
      "Byen er stor nok til at du ikke er avhengig av en annen by for alt, mens vinmarker og åpne landskap begynner kort vei utenfor sentrum.",
      "Jumilla passer for kjøpere som liker store horisonter og et mer utpreget innlandsklima, og som ser verdien i å være del av et område med en sterk egen identitet.",
    ],
    bestFor: ["Vin- og matinteresserte", "Finca og større tomter", "Tydelig innlandsliv i Murcia"],
    highlights: ["DOP Jumilla og Monastrell", "Castillo de Jumilla", "Sierra de Santa Ana og vinruter"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Castillo_de_Jumilla.jpg/1024px-Castillo_de_Jumilla.jpg",
    searchTerms: ["Jumilla"],
  },
  {
    slug: "castalla",
    name: "Castalla",
    region: "Alicante",
    zone: "fjell",
    eyebrow: "Foia de Castalla · borg · fjellnatur",
    summary: "Castalla ligger i en dal med fjell rundt og et bysentrum under borgen. Her kan du kombinere lokale tjenester med turer, sykling og et hjem i eller utenfor byen.",
    story: [
      "Castalla er interessant når du ønsker naturen nær hverdagen, men fortsatt vil handle, ta en kaffe og bruke et bysentrum gjennom året. Borgen og gamlebyen setter preg på stedet; landskapet rundt gir en annen ramme for turer og uteliv.",
      "I området finnes ulike boligmiljøer, fra hus i byen til villaer og landlige eiendommer. Det er stor forskjell på en bolig i en urbanisasjon og en finca med mer jord. Begynn derfor med å finne ut hvordan du vil bo – ikke bare hvor stor tomten skal være.",
      "Foia de Castalla omfatter også steder som Onil, Ibi og Tibi. Vil du ha fjell og lokal hverdag uten å bo langt inne i provinsen, er dette steder som kan sammenlignes. Kjøretider og tilgang til tjenester må vurderes fra den konkrete adressen.",
    ],
    bestFor: ["Turer og sykling i fjellandskap", "Byliv med natur i nærheten", "Valg mellom villa og landligere eiendom"],
    highlights: ["Borg og historisk bymiljø", "Foia de Castalla og fjellområder rundt", "Veiforbindelser mot Alicante"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Castillo_de_Castalla_visto_de_lejos_03.jpg/960px-Castillo_de_Castalla_visto_de_lejos_03.jpg",
    searchTerms: ["Castalla", "Foia de Castalla", "Onil", "Ibi", "Tibi"],
  },
  {
    slug: "banyeres-de-mariola",
    name: "Banyeres de Mariola",
    region: "Alicante",
    zone: "fjell",
    eyebrow: "Serra de Mariola · fjellandsby · årstider",
    summary: "Banyeres de Mariola ligger høyt ved Serra de Mariola. For deg som liker turstier, et lokalt landsbymiljø og tydeligere årstider, gir stedet en annen hverdag enn de lavere delene av innlandet.",
    story: [
      "Her kan morgen- eller ettermiddagsturen gå i landskapet rundt Serra de Mariola. Landsbyen har borg, butikker og lokale tjenester, men ikke samme serviceomfang som en større by. Besøk den på en vanlig ukedag for å se om rytmen passer deg.",
      "Høyden – over 800 meter – gjør at klimaet er annerledes enn i Pinoso og ved kysten, særlig om vinteren. Det påvirker også hva du ønsker å dyrke, hvordan uteområdene brukes gjennom året, og hvordan boligen bør være isolert og oppvarmet.",
      "Velger du en eiendom utenfor sentrum, bør du kontrollere adkomst, vann, strøm, terreng og eventuelle natur- og planbegrensninger før du legger planer for bygging, dyrking eller andre tiltak.",
    ],
    bestFor: ["Fjellturer og naturnær hverdag", "Landsbyliv og tydeligere årstider", "Deg som vurderer helårsbolig i høyden"],
    highlights: ["Ved Serra de Mariola", "Over 800 meter over havet", "Borg og lokale tjenester"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Banyeres._Castell_1.JPG/960px-Banyeres._Castell_1.JPG",
    searchTerms: ["Banyeres de Mariola", "Banyeres", "Bañeres"],
  },
  {
    slug: "busot",
    name: "Busot",
    region: "Alicante",
    zone: "praktisk",
    eyebrow: "Kystnært innland · Cabeçó d’Or · landsby",
    summary: "Busot er et kystnært overgangsområde nord for Alicante: en landsby ved fjellene der du kan søke mer ro og plass uten å velge bort nærheten til sjøen.",
    story: [
      "I Busot møtes to hverdager. Du kan ha fjellene, landsbyen og turterreng rundt deg, samtidig som kysten fortsatt kan være en del av uken. Det gjør stedet annerledes enn både de tettbygde kystområdene og det dypere vininnlandet.",
      "Cuevas del Canelobre og Cabeçó d’Or er kjente landemerker i området. For den som liker gåturer og et mindre lokalmiljø, kan det være verdt å besøke både sentrum og boligområdene rundt før man velger adresse.",
      "Busot ligger ikke i den samme kjernen av store rustikke tomter som Pinoso. Boligtyper, tomtestørrelser, faktisk avstand til tjenester og hva det er lov å bygge eller bruke eiendommen til må vurderes individuelt. Kontakt oss gjerne hvis du ønsker at vi undersøker konkrete muligheter her.",
    ],
    bestFor: ["Fjell og kyst i samme hverdag", "Landsbymiljø nær Alicante", "Deg som ønsker å sammenligne kystnært og dypere innland"],
    highlights: ["Cabeçó d’Or og Cuevas del Canelobre", "Kystnært overgangsområde", "Bolig og tomt må vurderes konkret"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Busot_001.jpg",
    searchTerms: ["Busot"],
  },
];

export const ecoLifeAreaGroups = [
  {
    key: "vinland",
    title: "Vinland og store horisonter",
    text: "For deg som vil at jord, druer, landskap og plass skal være en tydelig del av hverdagen.",
  },
  {
    key: "landsby",
    title: "Landsbyliv og finca-ro",
    text: "For deg som ønsker et mindre lokalmiljø, hage, privatliv og et landligere tempo.",
  },
  {
    key: "praktisk",
    title: "Innlandet med enkel logistikk",
    text: "For deg som vil ha mer plass, men fortsatt prioriterer flyplass, større byer og enkel reise høyt.",
  },
  {
    key: "fjell",
    title: "Historiske byer og fjellinnland",
    text: "For deg som liker natur, tydeligere årstider, lokale bymiljøer og et annet Spania enn kysten.",
  },
] as const;

export function getEcoLifeArea(slug: string) {
  return ecoLifeAreas.find((area) => area.slug === slug) || null;
}
