export const selfSufficientTopics = [
  {
    slug: "solenergi",
    title: "Solenergi og strøm",
    lead: "Solceller, batterier og trygg strømforsyning på en finca i innlandet.",
    question: "Hvor uavhengig av strømnettet ønsker du egentlig å være?",
    sections: [
      { title: "Start med forbruket", text: "Kartlegg faktisk døgnforbruk, sommerkjøling, varmtvann, elbil og eventuelle vannpumper før anlegget dimensjoneres. Solrike dager alene sier lite om behovet om natten eller i perioder med dårlig vær." },
      { title: "Nett, hybrid eller off-grid?", text: "En nettilkoblet løsning, et hybridanlegg med batteri og et helt frittstående anlegg har ulike kostnader og krav til reservekapasitet. Off-grid krever særlig nøye planlegging av vinterproduksjon og kritiske laster." },
      { title: "Sjekk før du bestemmer deg", text: "Be en kvalifisert installatør undersøke tak eller plassering, skygge, elektrisk anlegg, nødvendige tillatelser, vedlikehold og reelle prisoverslag. Sammenlign levetidskostnad, ikke bare antall paneler." },
    ],
    checklist: ["Strømforbruk fordelt på sommer og vinter", "Tilgang til strømnett og dokumentert kapasitet", "Plassering, skygge og takets egnethet", "Skriftlig tilbud med batterilevetid, garanti og vedlikehold"],
    faqs: [
      { question: "Må jeg ha batteri sammen med solceller?", answer: "Nei. Et nettilkoblet anlegg kan fungere uten batteri. Batteri kan øke eget forbruk av produsert strøm, men lønnsomhet og behov må beregnes for ditt forbruk." },
      { question: "Kan et hus være helt uavhengig av strømnettet?", answer: "Det kan være teknisk mulig, men krever prosjektering for de svakeste produksjonsperiodene, lagring og ofte en reserveplan. Off-grid er ikke automatisk det billigste valget." },
    ],
    links: [{ label: "Spanias offisielle veiledere om egenproduksjon (IDAE)", href: "https://www.idae.es/tecnologias/energias-renovables/oficina-de-autoconsumo/guias-tecnicas-sobre-autoconsumo" }],
  },
  {
    slug: "dyrk-egen-mat",
    title: "Dyrk din egen mat",
    lead: "Kjøkkenhage, frukttrær og jord som tåler varme og tørre perioder.",
    question: "Hva kan du faktisk høste fra en stor tomt i Alicante-innlandet?",
    sections: [
      { title: "Begynn i liten skala", text: "En avgrenset kjøkkenhage nær huset gjør det lettere å følge med på jord, skygge og vannforbruk. Utvid etter én hel sesong fremfor å anlegge alt samtidig." },
      { title: "Velg etter mikroklima", text: "Pinoso og høyereliggende innlandsområder kan få både sommervarme og vinterfrost. Tomat, paprika, urter, mandler, oliven og ulike frukttrær må vurderes mot jord, eksponering og vannressurser på den konkrete eiendommen." },
      { title: "Planlegg høsting og vedlikehold", text: "Lag plass til kompost, redskaper, skygge og effektiv vanning. Tenk gjennom hvor mye tid du faktisk vil bruke når du også reiser bort." },
    ],
    checklist: ["Jordtype, drenering og mulig jordforbedring", "Sol og skygge gjennom året", "Dokumentert tilgang til vann for vanning", "Plan for vedlikehold når eiendommen står tom"],
    faqs: [
      { question: "Kan man dyrke mat hele året i Pinoso?", answer: "Ulike vekster kan dyrkes til ulike tider, men sesongene påvirkes av både sommervarme og mulig vinterfrost. Dyrkingsplanen må tilpasses mikroklimaet." },
      { question: "Trenger jeg å bruke hele tomten?", answer: "Nei. En liten kjøkkenhage nær huset kan være mer nyttig og lettere å vedlikeholde enn et stort dyrkingsareal." },
    ],
    links: [],
  },
  {
    slug: "vann",
    title: "Vann og ressursbruk",
    lead: "Vannkilde, lagring, kvalitet og smart vanning er avgjørende på landet.",
    question: "Har tomten dokumentert vann til både bolig og det du vil dyrke?",
    sections: [
      { title: "Undersøk rettighetene først", text: "Spør om dokumentasjon på tilkobling, leveringskapasitet, brønnrettigheter og eventuell tilgang til vanningsvann. At det finnes en brønn eller et rør på tomten er ikke i seg selv dokumentasjon på lovlig eller tilstrekkelig forsyning." },
      { title: "Skill drikkevann fra vanning", text: "Vannkvalitet, filtrering, lagringsbehov og eventuell behandling bør vurderes separat for husholdning og hage. Anlegg og tillatelser må kontrolleres lokalt." },
      { title: "Bruk mindre vann", text: "Dryppvanning, jorddekke, skygge, passende planter og oppsamling der det er tillatt kan redusere behovet. Beregn vannbruk før du planlegger store grøntområder." },
    ],
    checklist: ["Dokumentasjon på vannkilde og rettigheter", "Prøver og vurdering av vannkvalitet", "Kapasitet til bolig og planlagt vanning", "Kostnader til lagring, pumpe, filtrering og vedlikehold"],
    faqs: [
      { question: "Betyr en brønn på tomten at vannforsyningen er sikret?", answer: "Nei. Lovlig bruk, kapasitet og vannkvalitet må undersøkes. Be om dokumentasjon og faglig vurdering før kjøpet." },
      { question: "Er regnvann nok til en kjøkkenhage?", answer: "Det avhenger av nedbør, lagringskapasitet og avlingene. I tørre perioder bør man ikke basere en dyrkingsplan på ubekreftet regnvannstilgang." },
    ],
    links: [],
  },
  {
    slug: "planlegg-tomten",
    title: "Planlegg den store tomten",
    lead: "Fra 10 000 m² råtomt til et gjennomtenkt sted å leve.",
    question: "Hvordan får du plass til drømmen uten å overse de viktige begrensningene?",
    sections: [
      { title: "Lag et kart over hverdagen", text: "Plasser bolig, adkomst, terrasse, parkering, eventuell kjøkkenhage og naturlige soner etter sol, vind, terreng og tilgjengelig vann. Bevar gjerne store deler av tomten som natur." },
      { title: "Undersøk bygge- og bruksrett", text: "Rustikk tomt er ikke automatisk byggbar. Kommuneplan, klassifisering, minimumsareal, beskyttelser, avstandskrav og tillatelser må vurderes for hver eiendom før noe loves." },
      { title: "Bygg i etapper", text: "Prioriter lovlig og fungerende infrastruktur først. Planter og uteområder kan utvikles gradvis etter at du har blitt kjent med stedet gjennom årstidene." },
    ],
    checklist: ["Planstatus og tillatt bruk bekreftet skriftlig", "Adkomst, terreng og eventuelle flom- eller naturrestriksjoner", "Vann, strøm og lovlig avløpsløsning", "Plass til bygning og ønskede aktiviteter innenfor regelverket"],
    faqs: [
      { question: "Kan jeg bygge på en rustikk tomt på 10 000 m²?", answer: "Ikke ut fra størrelsen alene. Byggerett må undersøkes i gjeldende kommuneplan og kontrolleres for akkurat den eiendommen." },
      { question: "Kan jeg sette opp flere småhus eller uthus?", answer: "Slike tiltak kan være regulert eller forbudt. Undersøk tillatelser og tomtens klassifisering før du legger inn ekstra bygg i planen." },
    ],
    links: [],
  },
  {
    slug: "dyr-og-smabruk",
    title: "Dyr og småbruk",
    lead: "Et lite dyrehold krever mer enn ledig plass.",
    question: "Passer høner eller andre dyr inn i den hverdagen du ønsker?",
    sections: [
      { title: "Begynn med ansvar og tid", text: "Dyr trenger daglig tilsyn, vann, skygge, egnet ly og beskyttelse. Feriefravær, sommervarme og veterinærtilgang bør planlegges på forhånd." },
      { title: "Kontroller lokale regler", text: "Registreringskrav, dyrevelferd, nabohensyn, kommunale bestemmelser og eventuell landbruksstatus varierer etter type og omfang av dyrehold. Undersøk dette før kjøp eller etablering." },
      { title: "Tenk helhetlig", text: "Kompostering, hage og et lite dyrehold kan utfylle hverandre, men hygiene, avfall, skadedyr og vannforbruk må inngå i planen." },
    ],
    checklist: ["Lokale regler og registreringsplikt for ønsket dyrehold", "Daglig tilsyn og plan ved fravær", "Skygge, vann, sikring og hygiene", "Veterinær, fôr og løpende kostnader"],
    faqs: [
      { question: "Kan jeg ha høner på en stor tomt?", answer: "Det kan være mulig, men størrelse alene gir ikke tillatelse. Kommunale og regionale krav, registrering og dyrevelferd må sjekkes." },
      { question: "Passer dyrehold hvis vi bare bor i Spania deler av året?", answer: "Bare dersom ansvarlig og stabilt daglig tilsyn kan ordnes også når dere er borte. Det bør avklares før man skaffer dyr." },
    ],
    links: [],
  },
  {
    slug: "baerekraftig-bolig",
    title: "Bærekraftig bolig og komfort",
    lead: "Et moderne hjem som fungerer godt gjennom varme somre og kjøligere vintre.",
    question: "Hvordan bygger du energieffektivt uten å ofre komforten?",
    sections: [
      { title: "Design etter klimaet", text: "Byggets orientering, utvendig solskjerming, isolasjon og ventilasjon kan redusere kjøle- og varmebehov før tekniske løsninger velges." },
      { title: "Se huset og tomten sammen", text: "Solceller, vannsystem, avløpsløsning, adkomst og uteareal må prosjekteres som deler av samme helhet. Avklar lokale regler og tekniske forhold tidlig." },
      { title: "Regn på hele livsløpet", text: "Sammenlign investering, energibruk, drift, vedlikehold og fremtidig utskifting. Et kostnadseksempel må alltid vise antakelsene det bygger på." },
    ],
    checklist: ["Boligens orientering og utvendig solskjerming", "Isolasjon, lufttetthet og ventilasjon", "Beregnet kjøle- og varmebehov", "Helhetlig budsjett for energi, vann og vedlikehold"],
    faqs: [
      { question: "Er solceller det viktigste for et energieffektivt hus?", answer: "Nei. God bygningsutforming, isolasjon, skygge og effektiv teknikk reduserer først energibehovet; solceller kan deretter dekke deler av forbruket." },
      { question: "Kan jeg planlegge tekniske løsninger etter at huset er ferdig?", answer: "Noe kan ettermonteres, men plass, føringsveier og samspill mellom strøm, vann og avløp er ofte enklere å løse tidlig i prosjektet." },
    ],
    links: [],
  },
] as const;
