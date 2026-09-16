export type EditorialArticle = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags?: string[];
  image?: string;
  markdown?: string;
};

export const areas = [
  {
    name: "Pinoso",
    places: "Pinoso, Ubeda, Canyada del Trigo og Torre del Rico",
    text: "For deg som vil ha store tomter, privatliv, sol, vingårder og et roligere helårsliv med lokale tjenester.",
  },
  {
    name: "Aspe og Monforte del Cid",
    places: "Aspe, Monforte del Cid, Novelda, La Romana og Font del Llop",
    text: "Et godt valg når du ønsker innlandsfølelse, men vil ha kortere vei til Alicante, golf og større servicetilbud.",
  },
  {
    name: "Hondon-dalen",
    places: "Hondon de las Nieves, Hondon de los Frailes, La Canalosa og Barbarroja",
    text: "Dalen passer for kjøpere som vil ha utsikt, landsbyliv, romslige tomter og et mer landlig hverdagsliv.",
  },
];

export const articles: EditorialArticle[] = [
  {
    slug: "10000-m2-hva-gjor-du-med-plassen",
    title: "10 000 m² – hva gjør du egentlig med all den plassen?",
    excerpt:
      "En stor tomt er mer enn avstand til naboen. Den kan bli kjøkkenhage, frukttrær, uteplasser, natur, hobbyer og et helt annet hverdagsliv.",
    date: "2026-09-16",
    tags: ["Eco Life", "Tomt", "Livsstil", "Innlandet"],
    image: "/assets/areas.jpg",
    markdown: `# 10 000 m² – hva gjør du egentlig med all den plassen?

Når nordmenn ser en tomt på 10 000 eller 15 000 kvadratmeter for første gang, er den vanligste reaksjonen ofte den samme: **Hva skal jeg med så mye plass?**

Det er et naturlig spørsmål. Ved kysten er vi vant til å tenke på uteområdet som terrasse, basseng og kanskje en liten hage. I innlandet kan selve tomten bli en like viktig del av livet som huset.

Det betyr ikke at du skal bli bonde. Det betyr at du plutselig får valg du ikke hadde før.

## Huset bruker bare en liten del av historien

Tenk deg en moderne villa, basseng og terrasse samlet på én del av eiendommen. Rundt ligger det fortsatt store arealer igjen. Noen lar mye av tomten være natur. Andre utvikler den gradvis over flere år.

Du kan for eksempel lage:

- en kjøkkenhage med tomater, paprika, squash, urter og salat
- områder med frukttrær eller mandel- og oliventrær der forholdene passer
- noen rader med druer
- en stor pergola eller et utekjøkken
- plass til hunder, hobbyer eller verksted
- rolige soner med skygge, benker og utsikt
- et område der barn og barnebarn kan løpe fritt når de er på besøk

Poenget er ikke å fylle hver kvadratmeter. Det er friheten i å **ikke måtte fylle alt**.

## Privatliv blir en annen type luksus

På mange kystprosjekter handler luksus om materialer, utsikt eller kort vei til stranden. I innlandet kan luksus bety noe annet: å åpne døren om morgenen uten å se rett inn i naboens terrasse.

Du kan sitte ute med kaffe før resten av huset våkner. Du kan ha middag med venner uten å tenke på at lyd og lys treffer naboen noen meter unna. Du kan plante trær fordi du vil ha dem der – ikke fordi det er akkurat 30 centimeter igjen mellom bassengkanten og muren.

For mange er denne følelsen vanskelig å forstå før de står på en stor tomt selv.

## Tomten kan utvikle seg sammen med livet ditt

Du trenger ikke ha en perfekt plan første dag.

År én kan handle om hus, basseng, adkomst og de viktigste uteområdene. År to planter du kanskje trær. Senere kommer kjøkkenhagen, en bedre sitteplass mot kveldssolen eller et lite område med vinranker.

Det fine er at eiendommen kan få historie. Du planter et tre og ser det vokse. Du lærer hvor solen står i august. Du finner ut hvor det alltid blåser litt. Etter noen år kjenner du tomten på en måte du aldri gjør med en ferdig terrasse.

## 10 000 m² betyr ikke automatisk at du kan bygge

Her er det viktig å skille drømmen fra jussen.

En stor rustikk tomt er ikke automatisk byggbar. Areal, kommuneplan, klassifisering, adkomst, vann, strøm, avløp, beskyttelser og andre forhold må kontrolleres for den konkrete eiendommen. I mange innlandsprosjekter møter kjøpere tomter på rundt én hektar eller mer fordi arealkrav er en del av planvurderingen, men størrelsen alene gir ingen byggetillatelse.

Det samme gjelder ekstra bygg, dyrehold, landbruksbruk og andre tiltak: det som er mulig må vurderes konkret.

## Spørsmålet vi liker bedre

I stedet for å spørre «hva skal jeg med 10 000 m²?» kan du prøve dette:

**Hva ville jeg gjort hvis plass ikke lenger var begrensningen?**

Kanskje svaret er grønnsaker. Kanskje det er oliventrær. Kanskje et rolig hjørne med utsikt og en bok. Kanskje du ikke vil gjøre noe som helst – bare vite at rommet rundt huset er ditt.

Det er nettopp derfor Pinoso Eco Life starter med livsstilen før vi starter med tomten.

[Se aktuelle tomter](/tomter) · [Utforsk områdene](/omrader)`,
  },
  {
    slug: "et-annet-tempo-vanlig-tirsdag-innlandet",
    title: "Et annet tempo – slik kan en vanlig tirsdag i innlandet se ut",
    excerpt:
      "Den største forskjellen merkes kanskje ikke i ferien, men på en helt vanlig hverdag: mindre hastverk, mer ute og mer tid i nærmiljøet.",
    date: "2026-09-16",
    tags: ["Eco Life", "Hverdagsliv", "Pinoso", "Livsstil"],
    image: "/assets/hero-pinoso-dream.jpg",
    markdown: `# Et annet tempo – slik kan en vanlig tirsdag i innlandet se ut

Det er lett å selge Spania med solnedganger, basseng og lange lunsjer. Men hvis du vurderer å bo her fast eller store deler av året, er et annet spørsmål viktigere:

**Hvordan føles en helt vanlig tirsdag?**

I innlandet er det ofte nettopp hverdagen som blir salgsargumentet.

## Morgenen trenger ikke starte med en plan

Du åpner døren og går ut med kaffe. Det er ikke sikkert du hører annet enn fugler, en bil langt borte eller noen som arbeider på en naboeiendom.

Har du hund, starter dagen kanskje med en tur langs en liten vei mellom vinmarker eller mandeltrær. Har du hage, ser du om tomatene trenger vann. Har du ingenting som skal gjøres, kan du ganske enkelt sette deg ned.

Det høres enkelt ut. Det er nettopp poenget.

## Landsbyen blir en del av rutinen

Senere kjører du inn til Pinoso eller en av landsbyene rundt. Du handler, tar en kaffe eller ordner et praktisk ærend. Etter hvert begynner noen ansikter å bli kjente.

Du trenger ikke idealisere landsbylivet for å merke forskjellen. Mindre steder fungerer annerledes enn store ferieområder. Du går oftere tilbake til de samme butikkene, den samme kafeen og de samme håndverkerne.

Tilhørighet skjer ikke på en uke. Den bygges av gjentakelser.

## Ettermiddagen foregår mer ute

Mange flytter til Spania for klimaet, men ender likevel med å organisere livet sitt omtrent som før. Med mer plass rundt boligen blir det lettere å bruke uteområdet som en del av selve huset.

Du kan spise lunsj ute, ordne litt i hagen, ta en sykkeltur eller bare flytte arbeidet til en skyggefull terrasse.

Når huset ligger på en større tomt, er uteområdet ikke bare noe du ser gjennom vinduet. Det blir et sted du bruker.

## Tid går ikke saktere – men den kan føles annerledes

Klokken går naturligvis like fort i Pinoso som i Oslo, Bergen eller Alicante. Forskjellen ligger i hva som fyller timene.

Mindre kø. Mindre leting etter parkering. Færre mennesker tett på. Kortere vei fra ytterdøren til naturen. Mer plass til aktiviteter som ikke krever booking eller planlegging.

For noen føles dette frigjørende. Andre savner bylivet, sjøen eller et større sosialt tilbud. Innlandet passer ikke automatisk for alle, og det er en fordel å vite det før man kjøper.

## Derfor bør du besøke området som om du allerede bodde der

Ikke bruk hele visningsturen på boliger.

Handle mat. Kjør gjennom området om kvelden. Ta en kaffe på en vanlig ukedag. Gå en tur. Se hvor lang tid det faktisk tar til butikken, helsetjenester og det du bruker i hverdagen.

Spør deg selv om du liker rytmen når ingenting spesielt skjer.

For det er nettopp disse dagene du kjøper flest av.

[Utforsk områdene](/omrader) · [Se boliger](/eiendommer)`,
  },
  {
    slug: "fra-supermarked-til-egen-hage",
    title: "Fra supermarked til egen hage – hvor mye kan du egentlig dyrke?",
    excerpt:
      "Du trenger ikke bli selvforsynt for at en kjøkkenhage skal endre hverdagen. Noen tomater, urter og frukttrær kan være nok til å skape et helt annet forhold til maten.",
    date: "2026-09-16",
    tags: ["Eco Life", "Kjøkkenhage", "Frukt", "Tomt"],
    image: "/assets/areas.jpg",
    markdown: `# Fra supermarked til egen hage – hvor mye kan du egentlig dyrke?

En av de fineste sidene ved å ha stor tomt er ikke nødvendigvis størrelsen. Det er at du kan bruke litt av den til noe som gir deg glede hver eneste uke.

For mange starter det med noen tomatplanter.

Så kommer urtene. Kanskje paprika. Et sitrontre hvis mikroklimaet passer. Etter hvert lærer du hva som trives akkurat på din eiendom.

## Målet trenger ikke være selvforsyning

Ordet «selvforsynt» høres stort ut. For de fleste er det heller ikke et realistisk eller ønskelig mål.

Vi liker bedre tanken på å bli **litt mer selvberget**.

Det kan bety at du plukker urter rett før middagen. At tomatene om sommeren kommer fra hagen. At du har noen frukttrær som gir mer enn dere klarer å spise når de først produserer.

Det endrer ikke hele matbudsjettet. Det endrer opplevelsen av maten.

## Klima betyr mye – men vann betyr enda mer

Innlandet i Alicante har varme, tørre perioder. Hva du kan dyrke avhenger derfor ikke bare av hvor mye jord du eier.

Du må forstå:

- vanntilgang og vannkvalitet
- jordtype og drenering
- sol og vind på akkurat din tomt
- frostlommer og høyde
- hvor mye tid du faktisk vil bruke på stell

Dryppvanning kan gjøre en stor forskjell, men også dette må planlegges ut fra den konkrete eiendommen og tilgjengelig vann.

## Start lite nok til at det er hyggelig

En vanlig feil er å lage en hage som blir en jobb før man har rukket å glede seg over den.

Begynn med et lite område nær huset. Fire eller fem sorter du faktisk liker å spise. Et par frukttrær. Urter ved utekjøkkenet.

Hvis du elsker det, kan du utvide.

Hvis du oppdager at du heller vil bruke tiden på sykkel eller ved bassenget, har du fortsatt en hage som er enkel å holde.

## Frukttrær gir eiendommen historie

Et tre er annerledes enn et møbel. Du kjøper det ikke ferdig.

Du planter det. Ser det etablere seg. Venter på første ordentlige avling. Noen år senere står det der som en del av stedet.

Det er noe av det som gjør en stor tomt interessant: du kan lage et hjem som blir mer personlig jo lenger du bor der.

## Spør om tomten før du planlegger hagen

Hvis dyrking er viktig for deg, bør det inn i tomtevurderingen fra starten.

En flott utsikt hjelper lite hvis den delen av tomten du ønsker å dyrke på er upraktisk, svært bratt eller mangler en realistisk vannløsning.

Fortell oss derfor ikke bare hvor mange soverom du trenger. Fortell oss hva du drømmer om å gjøre utenfor huset.

[Se tomter](/tomter) · [Fortell oss hva du ser etter](/#kontakt)`,
  },
  {
    slug: "ferske-egg-frukttraer-mer-selvberget-liv",
    title: "Ferske egg, frukttrær og et mer selvberget liv",
    excerpt:
      "For noen handler stor tomt om utsikt. For andre handler den om å hente frokosten noen meter fra kjøkkenet og bruke mer av dagen ute.",
    date: "2026-09-16",
    tags: ["Eco Life", "Selvberget", "Høner", "Landliv"],
    image: "/assets/hero-pinoso-dream.jpg",
    markdown: `# Ferske egg, frukttrær og et mer selvberget liv

Se for deg at du går ut om morgenen for å hente noen egg. På vei tilbake ser du om fikenene er modne eller plukker et par sitroner til kjøkkenet.

Det er ikke et selvforsyningsprosjekt. Det er bare en annen måte å bo på.

For noen kjøpere er akkurat denne muligheten viktigere enn et ekstra gjesterom.

## Du trenger ikke drive gård

En stor eiendom betyr ikke at hele tomten må være i produksjon.

Noen få høner kan være nok for den som liker tanken på ferske egg. Noen trær kan gi mer frukt enn en familie trenger. Et lite bed kan dekke mye av sommerens behov for urter og enkelte grønnsaker.

Det interessante er ikke volumet. Det er kontakten med stedet.

Du begynner å legge merke til sesonger. Når mandeltrærne blomstrer. Når druene modner. Når solen endrer retning og et område som var perfekt i april plutselig trenger skygge i juli.

## Dyr krever ansvar – og regler

Det er lett å romantisere høner på landet. I virkeligheten trenger de daglig stell, skygge, vann, beskyttelse og gode forhold.

Lokale regler, naboavstand, dyrevelferd og bruk av eiendommen må også undersøkes før du bestemmer deg for dyrehold. En stor tomt betyr ikke automatisk at alle typer bruk er tillatt.

Derfor bør dette være en del av spørsmålet før du kjøper, ikke en overraskelse etterpå.

## Et mer selvberget liv handler også om ferdigheter

Å dyrke noe selv lærer deg små ting som er lette å undervurdere.

Du lærer å vanne riktig. Beskjære. Forstå jord. Ta vare på en avling som kommer samtidig. Lage mat med det du faktisk har tilgjengelig.

Noen lærer å sylte. Andre lager oliven. Noen planter druer fordi de er nysgjerrige på vintradisjonen i området.

Du trenger ikke være ekspert. Det er nettopp prosessen som kan være en del av livet du kjøper deg inn i.

## Den egentlige luksusen kan være valgfriheten

Du kan velge å bruke tomten aktivt.

Du kan også velge å la store deler av den være rolig, åpen og naturlig.

Det viktige er at du har muligheten.

Når vi vurderer tomter for Pinoso Eco Life, ønsker vi derfor å vite mer enn hvor stort hus du vil bygge. Vi vil vite om du ser for deg hunder, kjøkkenhage, frukttrær, sykler, gjester, stillhet – eller ganske enkelt mye luft mellom deg og neste nabo.

Det er slik tomten begynner å bli en del av hjemmet.

[Utforsk tomtene](/tomter) · [Les mer i magasinet](/magasin)`,
  },
  {
    slug: "kjop-nybygg-i-spania",
    title: "Hvorfor mange nordmenn vurderer Pinoso-området",
    excerpt:
      "Store tomter, roligere tempo og moderne villaer gjør innlandet interessant. Her er hva du bør undersøke først.",
    date: "2026-04-29",
    tags: ["Kjøpsguide", "Pinoso"],
  },
  {
    slug: "trygg-kjopsprosess",
    title: "Slik gjør vi kjøpsprosessen tryggere",
    excerpt:
      "Fra behovsavklaring til overtakelse: en god prosess handler om struktur, dokumentasjon og riktig rådgivning.",
    date: "2026-04-29",
    tags: ["Kjøpsguide"],
  },
  {
    slug: "costa-blanca-nord",
    title: "Tomt før bolig: slik vurderer du riktig beliggenhet",
    excerpt:
      "Areal, regulering, adkomst, vann og strøm betyr mye når drømmen er villa med plass rundt seg.",
    date: "2026-04-29",
    tags: ["Tomt", "Kjøpsguide"],
  },
];

export const processSteps = [
  "Behov og budsjett avklares i en innledende samtale.",
  "Vi matcher deg med aktuelle prosjekter og områder.",
  "Du får strukturert oversikt, dokumenter og anbefalinger.",
  "Visninger planlegges fysisk eller digitalt.",
  "Advokat, bank, NIE og kontrakt koordineres med trygge partnere.",
  "Overtakelse og oppfølging gjøres ryddig etter kjøpet.",
];
