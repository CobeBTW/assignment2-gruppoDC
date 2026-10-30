/**
 * CrowdUniTO - Piattaforma di Crowdfunding per la Ricerca dell'Università degli Studi di Torino
 * Logica Applicativa Client-Side, Hash Routing, Simulazione Autenticazione e Ricerca
 * Progetto didattico per il corso di Human-Computer Interaction (HCI)
 *
 * [REVISIONE] VERSIONE MIGLIORATA (29/10/2026) — copia separata dal prototipo del gruppo.
 * Contiene le correzioni della revisione più alcune migliorie legate ai problemi dell'Assignment 1.
 * Cercate "[REVISIONE]" (problemi corretti o da decidere) e "[NUOVO]" (parti aggiunte).
 * L'elenco completo con le motivazioni è in MODIFICHE.md.
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. DATABASE MOCK LOCALE (Categorie, Progetti, Formazione, FAQ)
     ========================================================================== */

  // [REVISIONE] Le aree tematiche erano scritte a mano in 5 punti diversi, con etichette diverse
  // ("Agricoltura & Cibo" in Home, "Agricoltura & Biodiversità" nel menu; InclusiveCity aveva
  // etichetta "Società & Diritti" ma id "cultura" = "Beni Culturali & Società"...).
  // → CORRETTO: un'unica fonte (CATEGORIES) usata da menu, filtri, card, footer e candidatura,
  //   in ordine alfabetico (A1, euristica 7: "categorie presentate in ordine casuale").
  const CATEGORIES = [
    { id: 'agro', label: 'Agricoltura & Biodiversità', icon: 'leaf' },
    { id: 'ambiente', label: 'Ambiente & Clima', icon: 'globe' },
    { id: 'cultura', label: 'Cultura & Società', icon: 'book' },
    { id: 'tech', label: 'Intelligenza Artificiale & STEM', icon: 'cpu' },
    { id: 'salute', label: 'Medicina & Salute', icon: 'heart' }
  ];

  // Regola reale di Funds TOgether (UniTO): al 100% dell'obiettivo l'Ateneo aggiunge
  // una cifra pari a quella raccolta, fino a un massimo di 10.000 € per progetto.
  const MATCHING_CAP = 10000;

  // [REVISIONE] Obiettivi economici: prima andavano da 10.000 a 25.000 €. Con il tetto di 10.000 €
  // l'Ateneo NON raddoppia una campagna da 20.000 € (aggiunge solo il 50%), quindi i messaggi
  // "Raddoppio UniTO 2x" e "Vale € 50 con il raddoppio" erano falsi per 5 progetti su 6.
  // → CORRETTO: obiettivi riportati tra 6.000 e 10.000 € (come le campagne reali di Funds TOgether 2026,
  //   da 4.700 a 10.000 €), mantenendo le stesse percentuali di avanzamento. Verificate se nel PDF
  //   avete citato gli importi vecchi.
  // [REVISIONE] Il campo "percentage" era salvato a mano e poteva non coincidere con collected/target:
  // → ora viene calcolato (vedi getProjectStats).
  const MOCK_PROJECTS = [
    {
      id: 'p1',
      title: 'NeuroPark: Riabilitazione in Realtà Virtuale per il Parkinson',
      category: 'salute',
      proponent: 'Prof.ssa Marina Rossi',
      department: 'Dipartimento di Neuroscienze "Rita Levi Montalcini"',
      excerpt: 'Sviluppiamo protocolli immersivi su misura per aiutare le persone con Parkinson a recuperare l\'autonomia motoria e cognitiva nella vita quotidiana.',
      description: 'Il progetto NeuroPark nasce dalla collaborazione tra neurologi, bioingegneri e fisioterapisti dell\'Università di Torino. L\'obiettivo è creare una suite software terapeutica fruibile tramite visori VR commerciali, abbattendo i costi della neuroriabilitazione e portandola anche a domicilio dei pazienti piemontesi con diagnosi precoce di morbo di Parkinson.',
      target: 10000,
      collected: 8200,
      supporters: 148,
      daysLeft: 12,
      status: 'active',
      matchingActive: true,
      colorAccent: '#9F1239',
      imageGradient: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)',
      scientificGoal: 'Validazione clinica su 60 pazienti del presidio Molinette - Città della Salute di Torino.',
      budgetBreakdown: [
        { item: 'Acquisto di 4 visori VR con eye-tracking', cost: 3600 },
        { item: 'Sviluppo di scenari virtuali dedicati', cost: 3400 },
        { item: 'Borsa di ricerca di 3 mesi per un bioingegnere', cost: 3000 }
      ],
      team: [
        { name: 'Prof.ssa Marina Rossi', role: 'Neurologa, responsabile scientifica' },
        { name: 'Ing. Davide Ferrero', role: 'Bioingegnere, sviluppo degli ambienti VR' },
        { name: 'Dott.ssa Sara Galli', role: 'Fisioterapista, protocolli di riabilitazione' }
      ],
      contactEmail: 'neuropark.crowd@unito.it',
      glossary: [
        { term: 'Realtà virtuale (VR)', def: 'ambienti 3D che si esplorano con un visore: il paziente si muove in una cucina o in un supermercato simulati, in sicurezza.' },
        { term: 'Eye-tracking', def: 'sensore che registra dove si posa lo sguardo; aiuta i terapisti a capire dove il paziente fa più fatica.' },
        { term: 'Neuroriabilitazione', def: 'esercizi che aiutano il cervello a recuperare movimenti e abilità quotidiane.' },
        { term: 'Validazione clinica', def: 'verifica, su un gruppo di pazienti seguiti dai medici, che il metodo funzioni e sia sicuro.' }
      ],
      updates: [
        { date: '24 ottobre 2026', title: 'Superato l\'80% dell\'obiettivo', text: 'Grazie ai primi 148 sostenitori siamo all\'82%. Mancano meno di 2.000 € per sbloccare il cofinanziamento dell\'Università.' },
        { date: '10 ottobre 2026', title: 'Primo test con 5 volontari', text: 'Abbiamo provato lo scenario "Supermercato" con cinque volontari del centro Parkinson: tutti hanno completato il percorso, due hanno chiesto di poterlo ripetere a casa.' },
        { date: '1 ottobre 2026', title: 'La campagna è online', text: 'Da oggi è possibile sostenere NeuroPark. Racconteremo qui ogni passo della sperimentazione.' }
      ],
      answeredQuestions: [
        { q: 'Il trattamento sarà gratuito per i pazienti?', a: 'Sì. Durante la sperimentazione clinica i pazienti coinvolti non sostengono alcun costo: visori e software sono forniti dal laboratorio.' },
        { q: 'Posso candidarmi come paziente volontario?', a: 'La selezione avviene tramite il Centro Parkinson delle Molinette. Scrivici con il modulo qui sotto e ti metteremo in contatto con il medico referente.' }
      ],
      rewards: [
        { amount: 25, title: 'Ringraziamento scientifico', desc: 'Attestato digitale nominativo e newsletter sull\'avanzamento della sperimentazione.' },
        { amount: 75, title: 'Webinar con il team', desc: 'Partecipazione al webinar con la Prof.ssa Rossi e dimostrazione dal vivo degli ambienti VR.', limit: 100, claimed: 41 },
        { amount: 150, title: 'Visita ai laboratori NeuroPark', desc: 'Invito per 2 persone al laboratorio di neuroscienze e prova guidata del visore terapeutico.', limit: 20, claimed: 17 }
      ]
    },
    {
      id: 'p2',
      title: 'BioSensor: Rete di Piante Sentinella per l\'Aria di Torino',
      category: 'ambiente',
      proponent: 'Dott. Andrea Bianchi',
      department: 'Dipartimento di Scienze della Vita e Biologia dei Sistemi',
      excerpt: 'Installazione di bio-indicatori vegetali e microsensori nei cortili scolastici torinesi per mappare e ridurre in tempo reale le polveri sottili (PM2.5 e PM10).',
      description: 'Una rete capillare di piante specificamente selezionate per la capacità di bio-accumulo di metalli pesanti e polveri, dotate di microsensori IoT a basso consumo. Il progetto coinvolge 15 istituti scolastici della Città Metropolitana di Torino in percorsi di citizen science partecipata.',
      target: 8000,
      collected: 8400,
      supporters: 215,
      daysLeft: 0,
      closedOn: '15 ottobre 2026',
      status: 'funded',
      matchingActive: true,
      colorAccent: '#166534',
      imageGradient: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
      scientificGoal: 'Mappatura ad altissima risoluzione della qualità dell\'aria nei pressi degli edifici scolastici.',
      budgetBreakdown: [
        { item: 'Kit di sensori IoT per le scuole', cost: 3000 },
        { item: 'Fornitura e messa a dimora delle piante bio-indicatrici', cost: 2000 },
        { item: 'Piattaforma open data accessibile al pubblico', cost: 3000 }
      ],
      team: [
        { name: 'Dott. Andrea Bianchi', role: 'Biologo vegetale, responsabile scientifico' },
        { name: 'Dott.ssa Elisa Martini', role: 'Ingegnera ambientale, rete di sensori' }
      ],
      contactEmail: 'biosensor.crowd@unito.it',
      updates: [
        { date: '28 ottobre 2026', title: 'Le prime 5 scuole hanno le loro piante sentinella', text: 'Le classi hanno partecipato alla messa a dimora. I primi dati sui PM10 sono già visibili sulla piattaforma open data.' },
        { date: '15 ottobre 2026', title: 'Obiettivo raggiunto: l\'Università raddoppia', text: 'Abbiamo raccolto 8.400 € (105%). L\'Ateneo aggiunge altri 8.400 €: la rete potrà coprire tutte le 15 scuole invece delle 8 previste.' }
      ],
      answeredQuestions: [
        { q: 'I dati saranno pubblici?', a: 'Sì, tutti i dati raccolti saranno pubblicati con licenza aperta e consultabili da cittadini e scuole.' }
      ],
      rewards: [
        { amount: 20, title: 'Amico delle piante', desc: 'Kit di semi autoctoni piemontesi per impollinatori spedito a casa.', shipping: true },
        { amount: 50, title: 'Adozione di una pianta sentinella', desc: 'Il tuo nome su una targhetta della pianta installata in una scuola e accesso ai dati in tempo reale.', limit: 60, claimed: 60 }
      ]
    },
    {
      id: 'p3',
      title: 'Codices: Digitalizzazione dei Manoscritti Medievali di Ateneo',
      category: 'cultura',
      proponent: 'Prof.ssa Elena Giraudo',
      department: 'Dipartimento di Studi Storici',
      excerpt: 'Salviamo dal degrado fisico e rendiamo fruibili liberamente in alta definizione codici pergamenacei del Trecento custoditi nella Biblioteca Storica di UniTO.',
      description: 'Attraverso scanner multispettrali a luce fredda, il team di ricerca acquisirà e decifrerà palinsesti e note a margine finora illeggibili di oltre 40 manoscritti medievali piemontesi. I testi digitalizzati con licenza Creative Commons saranno consultabili liberamente da studiosi e cittadini di tutto il mondo.',
      target: 6000,
      collected: 5520,
      supporters: 185,
      daysLeft: 5,
      status: 'active',
      matchingActive: true,
      colorAccent: '#92400E',
      imageGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      scientificGoal: 'Conservazione digitale permanente e trascrizione collaborativa aperta a studenti e ricercatori.',
      budgetBreakdown: [
        { item: 'Noleggio di uno scanner planetario ad alta risoluzione', cost: 2600 },
        { item: 'Restauro conservativo preliminare delle legature', cost: 1900 },
        { item: 'Sviluppo di un visualizzatore web ad accesso aperto', cost: 1500 }
      ],
      team: [
        { name: 'Prof.ssa Elena Giraudo', role: 'Storica medievista, responsabile scientifica' },
        { name: 'Dott. Pietro Accornero', role: 'Restauratore, Biblioteca storica di Ateneo' }
      ],
      contactEmail: 'codices.crowd@unito.it',
      glossary: [
        { term: 'Palinsesto', def: 'pergamena raschiata e riscritta nel Medioevo: sotto il testo visibile ne resta uno più antico.' },
        { term: 'Scanner multispettrale', def: 'fotografa la pagina con luci di colori diversi e fa riaffiorare l\'inchiostro cancellato.' }
      ],
      updates: [
        { date: '20 ottobre 2026', title: 'Il primo codice è stato restaurato', text: 'La legatura del codice più fragile è stata consolidata: è pronto per la scansione.' }
      ],
      answeredQuestions: [],
      rewards: [
        { amount: 30, title: 'Segnalibro storico', desc: 'Segnalibro tipografico artigianale con riproduzione di un capolettera miniato del XIV secolo.', shipping: true },
        { amount: 100, title: 'Riproduzione fine art', desc: 'Stampa giclée su carta cotone numerata di una carta miniata medievale.', limit: 50, claimed: 22, shipping: true }
      ]
    },
    {
      id: 'p4',
      title: 'SaveAlpineBees: Salvaguardia dell\'Ape Nera nelle Valli di Lanzo',
      category: 'agro',
      proponent: 'Prof. Luca Barberis',
      department: 'Dipartimento di Scienze Agrarie, Forestali e Alimentari (DISAFA)',
      excerpt: 'Tutela dell\'Apis mellifera mellifera autoctona delle valli alpine torinesi contro l\'ibridazione e gli impatti del cambiamento climatico.',
      description: 'Il progetto mira a mappare il patrimonio genetico delle popolazioni residue di Ape Nera Alpina in Piemonte, istituendo oasi di fecondazione protette in alta quota e corsi di formazione per gli apicoltori locali al fine di conservare la biodiversità dell\'ecosistema montano.',
      target: 9000,
      collected: 4050,
      supporters: 92,
      daysLeft: 24,
      status: 'active',
      matchingActive: true,
      colorAccent: '#0D9488',
      imageGradient: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
      scientificGoal: 'Analisi del DNA di 120 colonie alpine e riforestazione con specie floreali mellifere native.',
      budgetBreakdown: [
        { item: 'Sequenziamento genetico dei campioni', cost: 3500 },
        { item: 'Arnie elettroniche con bilancia e sensori di covata', cost: 3000 },
        { item: 'Piantumazione di essenze nettarifere alpine', cost: 2500 }
      ],
      team: [
        { name: 'Prof. Luca Barberis', role: 'Entomologo, responsabile scientifico' },
        { name: 'Dott.ssa Giulia Rey', role: 'Genetista, analisi del DNA' }
      ],
      contactEmail: 'alpinebees.crowd@unito.it',
      updates: [],
      answeredQuestions: [],
      rewards: [
        { amount: 35, title: 'Vasetto di miele della ricerca', desc: 'Vasetto da 250 g di miele millefiori di alta montagna prodotto dalle arnie del progetto.', limit: 150, claimed: 61, shipping: true },
        { amount: 120, title: 'Giornata in apiario con il ricercatore', desc: 'Visita guidata con tuta protettiva presso l\'apiario sperimentale di Grugliasco.', limit: 15, claimed: 9 }
      ]
    },
    {
      id: 'p5',
      title: 'QuantumHealth: Algoritmi Quantistici per la Diagnosi Oncologica',
      category: 'tech',
      proponent: 'Dott.ssa Chiara Romano',
      department: 'Dipartimento di Fisica & Dipartimento di Informatica',
      excerpt: 'Applicazione del Quantum Machine Learning all\'analisi genomica per anticipare le mutazioni resistenti alle terapie nel tumore al seno.',
      description: 'I calcolatori tradizionali impiegano settimane per processare le interazioni tra migliaia di biomarcatori genetici. Utilizzando emulatori di quantum annealing e computer quantistici del consorzio di ateneo, acceleriamo drasticamente la previsione delle terapie farmacologiche più efficaci per ciascuna singola paziente.',
      target: 10000,
      collected: 7800,
      supporters: 164,
      daysLeft: 16,
      status: 'active',
      matchingActive: true,
      colorAccent: '#4F46E5',
      imageGradient: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
      scientificGoal: 'Algoritmo open-source validato su dataset di 1.200 profili genetici oncologici anonimizzati.',
      budgetBreakdown: [
        { item: 'Ore di calcolo su cluster e cloud quantistico', cost: 4500 },
        { item: 'Validazione biologica dei bersagli individuati', cost: 3500 },
        { item: 'Borsa di 2 mesi per un giovane data scientist', cost: 2000 }
      ],
      team: [
        { name: 'Dott.ssa Chiara Romano', role: 'Fisica, responsabile scientifica' },
        { name: 'Prof. Ivan Conti', role: 'Informatico, algoritmi quantistici' },
        { name: 'Dott. Marco Ferri', role: 'Oncologo, validazione clinica dei dati' }
      ],
      contactEmail: 'quantumhealth.crowd@unito.it',
      glossary: [
        { term: 'Quantum machine learning', def: 'algoritmi che "imparano" dai dati usando computer quantistici, molto più rapidi su alcuni calcoli.' },
        { term: 'Biomarcatore', def: 'caratteristica misurabile (per esempio una mutazione del DNA) che indica come si comporterà la malattia.' },
        { term: 'Dataset anonimizzato', def: 'raccolta di dati da cui sono stati tolti nomi e riferimenti personali dei pazienti.' }
      ],
      updates: [
        { date: '18 ottobre 2026', title: 'Primi risultati sull\'emulatore', text: 'Sul primo blocco di 200 profili l\'algoritmo ha ridotto i tempi di analisi da 9 giorni a 6 ore.' }
      ],
      answeredQuestions: [],
      rewards: [
        { amount: 50, title: 'Donatore per la ricerca quantistica', desc: 'Ringraziamento nominativo nell\'articolo scientifico open access e copia in anteprima via email.' },
        { amount: 200, title: 'Workshop "Fisica quantistica e medicina"', desc: 'Partecipazione al corso divulgativo di una giornata tenuto dai docenti del team.', limit: 30, claimed: 12 }
      ]
    },
    {
      id: 'p6',
      title: 'InclusiveCity: Mappare e Abbattere le Barriere Invisibili a Torino',
      category: 'cultura',
      proponent: 'Prof. Matteo Vercelli',
      department: 'Dipartimento di Culture, Politica e Società',
      excerpt: 'Una piattaforma georeferenziata co-creata con persone neurodivergenti per mappare sovraccarichi sensoriali, accessibilità cognitiva e barriere urbane.',
      description: 'Torino vista attraverso gli occhi di persone con autismo, ipersensibilità sensoriale e disabilità motorie invisibili. Ricercatori in sociologia urbana e psicologia cognitiva collaborano con associazioni di quartiere per produrre la prima "Mappa della Tranquillità e dell\'Accessibilità Civica" della città.',
      target: 7000,
      collected: 5110,
      supporters: 115,
      daysLeft: 9,
      status: 'active',
      matchingActive: true,
      colorAccent: '#C026D3',
      imageGradient: 'linear-gradient(135deg, #FAE8FF 0%, #F5D0FE 100%)',
      scientificGoal: 'Linee guida di urbanistica accessibile per le Circoscrizioni e la Città di Torino.',
      budgetBreakdown: [
        { item: 'Sviluppo dell\'app mobile di co-design partecipativo', cost: 2800 },
        { item: '10 laboratori sensoriali sul campo con le famiglie', cost: 2450 },
        { item: 'Stampa e diffusione della guida cartacea accessibile', cost: 1750 }
      ],
      team: [
        { name: 'Prof. Matteo Vercelli', role: 'Sociologo urbano, responsabile scientifico' },
        { name: 'Dott.ssa Anna Lupo', role: 'Psicologa cognitiva' }
      ],
      contactEmail: 'inclusivecity.crowd@unito.it',
      updates: [],
      answeredQuestions: [],
      rewards: [
        { amount: 15, title: 'Sostenitore dell\'inclusione', desc: 'Kit di adesivi d\'artista dedicati alla neurodiversità e mappa digitale in anteprima.', shipping: true },
        { amount: 60, title: 'Partecipazione alla mappatura urbana', desc: 'Invito al walk-lab guidato nei quartieri storici con i ricercatori.', limit: 25, claimed: 19 }
      ]
    }
  ];

  const TRAINING_SESSIONS = [
    {
      id: 'tr-01',
      title: 'Edizione Autunno 2026 - In Presenza',
      startDate: '18 Novembre 2026',
      schedule: 'Mercoledì ore 14:30 - 18:30 (3 incontri settimanali)',
      location: 'Campus Luigi Einaudi (CLE) - Aula C4, Lungo Dora Siena 100',
      seatsTotal: 25,
      seatsLeft: 6,
      instructors: 'Dott.ssa Laura Rinaldi (Campaign Manager Ginger) & Ufficio Trasferimento Tecnologico UniTO',
      modules: ['Modulo 1: Dalla ricerca scientifica alla campagna di crowdfunding', 'Modulo 2: Storytelling, video & ricompense etiche', 'Modulo 3: Strategie di rete, ufficio stampa e lancio']
    },
    {
      id: 'tr-02',
      title: 'Edizione Digitale - Online Interattivo',
      startDate: '3 Dicembre 2026',
      schedule: 'Giovedì ore 15:00 - 18:00 (Webex Campus)',
      location: 'Online su Webex UniTO (con laboratori pratici in sottogruppi)',
      seatsTotal: 40,
      seatsLeft: 14,
      instructors: 'Team Ginger Crowdfunding & Dipartimento di Management UniTO',
      modules: ['Modulo 1: Regole del bando "Lasci o Raddoppi" e pianificazione economica', 'Modulo 2: Social media e community building per ricercatori', 'Modulo 3: Analisi dati, conversioni e gestione sostenitori']
    },
    {
      id: 'tr-03',
      title: 'Edizione Inverno 2027 - Sede Storica',
      startDate: '14 Gennaio 2027',
      schedule: 'Venerdì ore 09:30 - 13:30 (4 incontri)',
      location: 'Palazzo del Rettorato - Sala Principe d\'Acaja, Via Verdi 8',
      seatsTotal: 20,
      seatsLeft: 9,
      instructors: 'Prof. Paolo Ferraris & Consulenti Accreditati Ginger',
      modules: ['Modulo 1: Progettazione del budget trasparente e rendicontazione', 'Modulo 2: Video pitch e public speaking scientifico', 'Modulo 3: Coinvolgimento di aziende, fondazioni e matching fund']
    }
  ];

  /* [NUOVO] FAQ come dati: servono sia alla pagina FAQ (divisa per pubblico e per tema)
     sia alla ricerca globale dell'header (A1, euristica 7: la ricerca funzionava solo sui progetti).
     A1, euristica 10 (sev. 3): le FAQ erano pensate per il progettista; ora la parte per chi dona
     copre come si dona, metodi di pagamento, bonifico, commissioni, dati personali e dopo la donazione. */
  const FAQ_ITEMS = [
    // --- Per chi sostiene ---
    { id: 'come-donare', audience: 'sostenitori', group: 'Donare', q: 'Come si svolge una donazione, passo per passo?',
      a: 'Scegli un progetto e premi "Sostieni il progetto". La procedura ha 4 passi: 1) scegli l\'importo o una ricompensa, 2) inserisci nome, cognome ed email, 3) scegli il metodo di pagamento, 4) controlla il riepilogo e conferma. Puoi tornare indietro in qualsiasi momento senza perdere i dati inseriti. Non serve creare un account.' },
    { id: 'metodi-pagamento', audience: 'sostenitori', group: 'Donare', q: 'Quali metodi di pagamento posso usare?',
      a: 'Puoi donare con carta di credito o debito (Visa, Mastercard, Maestro), PayPal, Satispay e bonifico bancario per tutte le campagne. Tutti i pagamenti digitali (carta, PayPal, Satispay) vengono conteggiati subito nella raccolta.' },
    { id: 'bonifico', audience: 'sostenitori', group: 'Donare', q: 'Ho scelto il bonifico: quando viene conteggiata la mia donazione?',
      a: 'Dopo la conferma la donazione risulta "in attesa del bonifico": ricevi IBAN, causale e importo da versare. Hai 5 giorni per effettuare il bonifico. La donazione viene aggiunta al totale raccolto solo quando l\'importo arriva sul conto, di solito 1-2 giorni lavorativi dopo il pagamento.' },
    { id: 'commissioni', audience: 'sostenitori', group: 'Donare', q: 'Quanto della mia donazione arriva davvero al progetto?',
      a: 'La piattaforma non trattiene commissioni sulle donazioni. Vengono sottratte soltanto le commissioni del metodo di pagamento scelto (per esempio quelle del circuito della carta), che restano a carico del progetto e non tue.' },
    { id: 'raddoppio', audience: 'sostenitori', group: 'Raddoppio e regole', q: 'Come funziona il meccanismo "Lasci o Raddoppi"?',
      a: 'Quando una campagna raggiunge il 100% dell\'obiettivo entro la scadenza, l\'Università di Torino aggiunge una cifra pari a quella raccolta, fino a un massimo di 10.000 € per progetto. Esempio: una campagna da 8.000 € che raccoglie 8.000 € riceve altri 8.000 € dall\'Ateneo. Se la campagna non arriva al 100%, il cofinanziamento non scatta.' },
    { id: 'tutto-o-niente', audience: 'sostenitori', group: 'Raddoppio e regole', q: 'Cosa succede se un progetto non raggiunge il 100% dell\'obiettivo?',
      a: 'Le campagne seguono la regola "tutto o niente": se alla scadenza l\'obiettivo non è raggiunto, il progetto non riceve nulla e le donazioni vengono rimborsate per intero ai sostenitori, senza trattenute. Non devi fare nulla: il rimborso è automatico sullo stesso metodo di pagamento.' },
    { id: 'detrazioni', audience: 'sostenitori', group: 'Ricevute, tasse e privacy', q: 'Le donazioni sono deducibili dalle tasse?',
      a: 'Sì. Le donazioni in denaro alle università pubbliche sono deducibili dal reddito senza limiti di importo (art. 10, comma 1, lett. l-quater del TUIR), se fatte con strumenti tracciabili come carta, PayPal o bonifico. Dopo la donazione ricevi via email la ricevuta con i dati dell\'Università di Torino: conservala per la dichiarazione dei redditi. Per casi particolari rivolgiti al tuo CAF o commercialista.' },
    { id: 'anonimo', audience: 'sostenitori', group: 'Ricevute, tasse e privacy', q: 'Posso donare in forma anonima?',
      a: 'Sì. Nel secondo passo della donazione scegli "Non mostrare il mio nome": non comparirai nell\'elenco pubblico dei sostenitori, ma riceverai comunque la ricevuta, che è privata.' },
    { id: 'dati-personali', audience: 'sostenitori', group: 'Ricevute, tasse e privacy', q: 'Come vengono trattati i miei dati personali?',
      a: 'Nome, cognome ed email servono solo per emettere la ricevuta e, se lo chiedi, per inviarti gli aggiornamenti del progetto. I dati della carta non vengono salvati dalla piattaforma: li gestisce direttamente il circuito di pagamento. Puoi chiedere in ogni momento la cancellazione dei tuoi dati dalla pagina Assistenza.' },
    { id: 'seguire-progetto', audience: 'sostenitori', group: 'Dopo la donazione', q: 'Come posso seguire un progetto che ho sostenuto?',
      a: 'Nella scheda di ogni progetto trovi la sezione "Aggiornamenti", dove il team racconta l\'avanzamento della ricerca e l\'uso dei fondi. Se hai lasciato la tua email riceverai anche gli aggiornamenti principali e l\'esito della campagna.' },
    { id: 'ricompense', audience: 'sostenitori', group: 'Dopo la donazione', q: 'Quando riceverò la ricompensa?',
      a: 'Le ricompense vengono consegnate dopo la chiusura della campagna, solo se ha raggiunto l\'obiettivo. Le ricompense a disponibilità limitata indicano sempre quanti posti restano (per esempio "Ne restano 3 su 20").' },
    // --- Per i ricercatori ---
    { id: 'chi-puo', audience: 'ricercatori', group: 'Partecipare', q: 'Chi può proporre un progetto di crowdfunding?',
      a: 'Possono presentare domanda docenti, ricercatori (RTT, RTDA, RTDB), assegnisti di ricerca, specializzandi e dottorandi dell\'Università di Torino. Se il capogruppo non è strutturato, nel team deve esserci un docente o ricercatore di ruolo che sia responsabile dei fondi.' },
    { id: 'formazione-obbligatoria', audience: 'ricercatori', group: 'Partecipare', q: 'È obbligatorio frequentare i moduli di formazione?',
      a: 'Sì, almeno un componente del team deve frequentare per intero un\'edizione del percorso formativo (in presenza o online), prima della pubblicazione. Consulta il <a href="#/formazione" class="text-link">calendario delle edizioni disponibili</a>.' },
    { id: 'esito', audience: 'ricercatori', group: 'Candidatura e costi', q: 'Entro quanto tempo riceverò una risposta alla candidatura?',
      a: 'Il Comitato Tecnico-Scientifico di UniTO comunica l\'esito formale entro <strong>15 giorni lavorativi</strong> dall\'invio del modulo online, all\'indirizzo email istituzionale.' },
    { id: 'quota', audience: 'ricercatori', group: 'Candidatura e costi', q: 'Cosa comprende la quota di 350 € + IVA?',
      a: 'La quota copre la gestione tecnica, la pubblicazione della campagna, la revisione dei testi e un incontro 1-a-1 con un Campaign Manager. Può essere imputata ai fondi di ricerca del Dipartimento. Il confronto completo è nella <a href="#/pacchetti" class="text-link">pagina dei pacchetti di servizi</a>.' }
  ];
  /* ==========================================================================
     2. GESTIONE DELLO STATO UTENTE (SIMULAZIONE CLIENT-SIDE LOCALSTORAGE)
     ========================================================================== */

  const AUTH_STORAGE_KEY = 'crowdunito_auth_user';
  const SUBMITTED_STORAGE_KEY = 'crowdunito_proposals';
  const TRAINING_ENROLL_KEY = 'crowdunito_training_enrollments';
  const DONATIONS_KEY = 'crowdunito_donations';             // [NUOVO] donazioni simulate
  const PROPOSAL_DRAFT_KEY = 'crowdunito_proposal_draft';    // [NUOVO] bozza candidatura
  const CHECKOUT_PREFIX = 'crowdunito_checkout_';            // [NUOVO] dati del checkout (sessionStorage)

  // [REVISIONE] localStorage/sessionStorage possono lanciare eccezioni (navigazione privata,
  // alcuni browser con file://, spazio esaurito) e diversi JSON.parse non erano protetti:
  // un errore bloccava tutta la pagina. → CORRETTO con due helper sicuri usati ovunque.
  function readJSON(key, fallback, useSession) {
    try {
      const store = useSession ? window.sessionStorage : window.localStorage;
      const raw = store.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value, useSession) {
    try {
      const store = useSession ? window.sessionStorage : window.localStorage;
      if (value === null || value === undefined) {
        store.removeItem(key);
      } else {
        store.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      /* Prototipo: se lo storage non è disponibile i dati restano solo in memoria */
    }
  }

  function getCurrentUser() {
    return readJSON(AUTH_STORAGE_KEY, null);
  }

  function setCurrentUser(user) {
    writeJSON(AUTH_STORAGE_KEY, user || null);
    updateHeaderAuthUI();
  }

  /* --- [NUOVO] Donazioni simulate e statistiche dei progetti --- */

  function getDonations() {
    return readJSON(DONATIONS_KEY, []);
  }

  function saveDonation(donation) {
    const all = getDonations();
    all.push(donation);
    writeJSON(DONATIONS_KEY, all);
  }

  /**
   * Stato aggiornato di un progetto: ai dati di partenza si sommano le donazioni simulate
   * CONFERMATE fatte in questo browser. Le donazioni con bonifico restano "in attesa" e non
   * vengono conteggiate finché il bonifico non arriva (A1, euristica 1: la conferma del bonifico
   * faceva credere di aver già donato).
   */
  function getProjectStats(p) {
    const mine = getDonations().filter(d => d.projectId === p.id);
    const confirmed = mine.filter(d => d.status === 'confermata');
    const collected = p.collected + confirmed.reduce((sum, d) => sum + d.amount, 0);
    const supporters = p.supporters + confirmed.length;
    const percentage = Math.round((collected / p.target) * 100);
    const reachedGoal = collected >= p.target;
    // Regola Funds TOgether: al 100% l'Ateneo aggiunge quanto raccolto, max 10.000 €
    const matching = Math.min(reachedGoal ? collected : p.target, MATCHING_CAP);
    return {
      collected,
      supporters,
      percentage,
      reachedGoal,
      matching,
      missing: Math.max(p.target - collected, 0),
      isOpen: p.status === 'active' && p.daysLeft > 0,
      myDonations: mine
    };
  }

  /** Posti rimasti per una ricompensa a disponibilità limitata (null = illimitata) */
  function rewardRemaining(p, reward) {
    if (!reward.limit) return null;
    const localClaims = getDonations().filter(d => d.projectId === p.id && d.rewardTitle === reward.title && d.status !== 'annullata').length;
    return Math.max(reward.limit - reward.claimed - localClaims, 0);
  }

  function getProjectById(id) {
    return MOCK_PROJECTS.find(item => item.id === id) || null;
  }

  /* --- [NUOVO] Helper di formattazione e sicurezza --- */

  // [REVISIONE] toLocaleString('it-IT') non mette il punto delle migliaia sui numeri di 4 cifre:
  // in Home si leggeva "€ 8100" accanto a "€ 16.400". → CORRETTO con un formattatore unico.
  function fmtNum(n) {
    return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function fmtEur(n) {
    return '€ ' + fmtNum(n);
  }

  // [REVISIONE] I testi inseriti dall'utente (titolo della proposta, nome, ricerca...) venivano
  // inseriti direttamente con innerHTML: un titolo con < o " rompeva la pagina. → CORRETTO con esc().
  function esc(value) {
    return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function catLabel(id) {
    const c = CATEGORIES.find(cat => cat.id === id);
    return c ? c.label : 'Altro';
  }

  function initials(name) {
    return String(name)
      .replace(/^(Prof\.ssa|Prof\.|Dott\.ssa|Dott\.|Ing\.)\s*/i, '')
      .split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  function dateInDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function todayLong() {
    return dateInDays(0);
  }

  const CATEGORY_ICONS = {
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><polyline points="3.5 12 8 12 10 9 13 15 15 12 20.5 12"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="16" y2="7"/><line x1="9" y1="11" x2="14" y2="11"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>'
  };

  function categoryIcon(categoryId, color, size) {
    const c = CATEGORIES.find(cat => cat.id === categoryId);
    const path = CATEGORY_ICONS[c ? c.icon : 'book'];
    return `<svg width="${size || 44}" height="${size || 44}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  /* ==========================================================================
     3. ROUTER CLIENT-SIDE BASATO SU HASH (#/...)
     ========================================================================== */

  // [NUOVO] Funzioni di pulizia della pagina corrente (es. il timer del checkout),
  // eseguite a ogni cambio di pagina per non lasciare intervalli attivi.
  let pageCleanups = [];
  let isFirstRender = true;

  function onLeavePage(fn) {
    pageCleanups.push(fn);
  }

  function navigateTo(hash) {
    if (window.location.hash === hash) {
      handleRouting();
    } else {
      window.location.hash = hash;
    }
  }

  function getRoute() {
    let hash = window.location.hash || '#/home';
    if (!hash.startsWith('#/')) {
      hash = '#/home';
    }
    // Rimuovi eventuali parametri di query se presenti
    const [path, queryString] = hash.slice(2).split('?');
    const params = new URLSearchParams(queryString || '');
    return { path, params, raw: hash };
  }

  function handleRouting() {
    const { path, params } = getRoute();
    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;

    pageCleanups.forEach(fn => { try { fn(); } catch (e) { /* ignora */ } });
    pageCleanups = [];

    // [REVISIONE] Lo scroll "smooth" a ogni cambio pagina faceva scorrere visibilmente tutta la
    // pagina precedente prima di mostrare la nuova. → CORRETTO: salto immediato in cima.
    window.scrollTo(0, 0);

    // Aggiorna stato attivo nella navigazione
    updateNavActive(path);
    closeDropdown();

    // Routing delle pagine
    if (path === '' || path === 'home') {
      renderHome(appRoot);
    } else if (path === 'proponi') {
      renderProponi(appRoot, params);
    } else if (path === 'formazione') {
      renderFormazione(appRoot);
    } else if (path === 'pacchetti') {
      renderPacchetti(appRoot);
    } else if (path === 'candidatura') {
      renderCandidatura(appRoot, params);
    } else if (path === 'faq') {
      renderFaq(appRoot, params);
    } else if (path === 'come-funziona') {
      renderComeFunziona(appRoot);
    } else if (path === 'assistenza') {
      renderAssistenza(appRoot, params);
    } else if (path === 'cerca') {
      renderCerca(appRoot, params);
    } else if (path.startsWith('progetto/')) {
      // [REVISIONE] Un id inesistente (es. #/progetto/p99) mostrava in silenzio NeuroPark:
      // l'utente vedeva un progetto diverso da quello cercato. → CORRETTO: pagina 404.
      const project = getProjectById(path.replace('progetto/', ''));
      if (project) {
        renderProgetto(appRoot, project);
      } else {
        render404(appRoot, path);
      }
    } else if (path.startsWith('sostieni/')) {
      const project = getProjectById(path.replace('sostieni/', ''));
      if (project) {
        renderSostieni(appRoot, project, params);
      } else {
        render404(appRoot, path);
      }
    } else if (path.startsWith('conferma/')) {
      renderConferma(appRoot, path.replace('conferma/', ''));
    } else if (path === 'login') {
      renderLogin(appRoot, params);
    } else if (path === 'recupera-password') {
      renderRecuperaPassword(appRoot);
    } else if (path === 'registrati') {
      renderRegistrati(appRoot, params);
    } else if (path === 'profilo') {
      renderProfilo(appRoot);
    } else {
      // Rotta sconosciuta -> Pagina 404
      render404(appRoot, path);
    }

    // [NUOVO] Titolo della scheda del browser coerente con la pagina (orientamento, cronologia,
    // screen reader) e focus sul titolo principale dopo il cambio di pagina.
    const h1 = appRoot.querySelector('h1');
    document.title = (path === '' || path === 'home' || !h1)
      ? 'CrowdUniTO | Il crowdfunding per la ricerca dell\'Università di Torino'
      : `${h1.textContent.trim().replace(/\s+/g, ' ')} | CrowdUniTO`;
    if (h1 && !isFirstRender) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
    isFirstRender = false;
  }

  function updateNavActive(currentPath) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const targetPath = href.replace('#/', '');
      // [REVISIONE] Le pagine figlie non evidenziavano la voce madre (es. "Formazione" non
      // illuminava "Proponi progetto"): l'utente non capiva in che sezione si trovava.
      const sectionOf = {
        formazione: 'proponi', pacchetti: 'proponi', candidatura: 'proponi'
      };
      const current = sectionOf[currentPath] || currentPath;
      if (current === targetPath || (current === '' && targetPath === 'home')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // [REVISIONE] "Cerca progetti" (menu a tendina) non risultava mai attivo, nemmeno nel catalogo
    // o in una scheda progetto. → CORRETTO.
    const toggle = document.getElementById('cercaDropdownToggle');
    if (toggle) {
      const inCatalog = currentPath === 'cerca' || /^(progetto|sostieni|conferma)\//.test(currentPath);
      toggle.classList.toggle('active', inCatalog);
    }
  }

  /* ==========================================================================
     4. COMPONENTI RIUTILIZZABILI (Cerchio di Percentuale, Banner Blu, Loghi)
     ========================================================================== */

  /**
   * Genera il codice HTML del Cerchio di Percentuale (firma visiva Ginger Crowdfunding)
   */
  function renderPercentageCircle(percentage, size = 68) {
    const radius = 28;
    const circumference = 2 * Math.PI * radius; // ~175.93
    const clamped = Math.min(Math.max(percentage, 0), 100);
    const strokeDashoffset = circumference * (1 - clamped / 100);

    let strokeColor = '#00A896'; // Ginger Teal
    if (percentage >= 100) {
      strokeColor = '#16A34A'; // Verde successo
    } else if (percentage < 50) {
      strokeColor = '#D97706'; // Ambra
    }

    return `
      <div class="percentage-circle-widget" style="width:${size}px; height:${size}px;" role="img" aria-label="${percentage}% dell'obiettivo raggiunto">
        <svg viewBox="0 0 68 68" width="${size}" height="${size}" class="circle-svg" aria-hidden="true">
          <circle cx="34" cy="34" r="${radius}" class="circle-track"></circle>
          <circle cx="34" cy="34" r="${radius}" class="circle-indicator"
            stroke="${strokeColor}"
            stroke-dasharray="${circumference.toFixed(2)}"
            stroke-dashoffset="${strokeDashoffset.toFixed(2)}"
            transform="rotate(-90 34 34)">
          </circle>
        </svg>
        <div class="circle-inner-label" aria-hidden="true">
          <span class="circle-pct-number">${percentage}%</span>
        </div>
      </div>
    `;
  }

  /**
   * Componente Card Progetto in stile Idea Ginger con cerchio di percentuale
   */
  function renderProjectCard(p) {
    const s = getProjectStats(p);
    // [REVISIONE] L'icona al centro della copertina era il simbolo del dollaro ($) per tutti i
    // progetti, su un sito in euro. → CORRETTO: icona dell'area tematica.
    // [REVISIONE] Per una campagna conclusa il pulsante diceva comunque "Scopri & Dona".
    return `
      <article class="ginger-project-card" data-category="${p.category}" id="card-${p.id}">
        <div class="card-thumb-wrap" style="background: ${p.imageGradient};">
          <div class="card-top-badges">
            <span class="badge-cat-tag">${esc(catLabel(p.category))}</span>
            ${p.matchingActive ? `
              <span class="badge-match-pill" title="Al 100% dell'obiettivo l'Università aggiunge una cifra pari a quella raccolta (max 10.000 €)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                UniTO raddoppia
              </span>
            ` : ''}
          </div>
          <div class="card-thumb-center-icon">
            ${categoryIcon(p.category, p.colorAccent, 46)}
          </div>
          <div class="card-status-flag ${s.isOpen ? '' : 'funded'}">
            ${s.isOpen ? `${p.daysLeft} giorni rimasti` : '✓ Obiettivo raggiunto e raddoppiato'}
          </div>
        </div>

        <div class="card-content-area">
          <div class="card-proponent-info">
            <span class="unito-verified-check" title="Progetto verificato dall'Università di Torino" aria-hidden="true">✓</span>
            <span class="department-name" title="${esc(p.department)}">${esc(p.department)}</span>
          </div>

          <h3 class="card-project-title">
            <a href="#/progetto/${p.id}" class="card-title-link">${esc(p.title)}</a>
          </h3>

          <p class="card-summary-text">${esc(p.excerpt)}</p>

          <div class="card-metrics-row">
            <div class="metrics-circle-col">
              ${renderPercentageCircle(s.percentage, 66)}
            </div>
            <div class="metrics-figures-col">
              <div class="metric-amount-gathered">${fmtEur(s.collected)}</div>
              <div class="metric-amount-target">raccolti su <strong>${fmtEur(p.target)}</strong></div>
              <div class="metric-supporters-count">${s.supporters} sostenitori</div>
            </div>
          </div>

          <div class="card-actions-row">
            <a href="#/progetto/${p.id}" class="btn btn-card-detail" aria-label="${s.isOpen ? 'Scopri e sostieni' : 'Vedi i risultati di'}: ${esc(p.title)}">${s.isOpen ? 'Scopri e sostieni' : 'Vedi i risultati'}</a>
          </div>
        </div>
      </article>
    `;
  }

  /** Progetti aperti prima, poi i conclusi (ordine "In evidenza") */
  function featuredOrder(list) {
    return list.slice().sort((a, b) => {
      const ao = getProjectStats(a).isOpen ? 0 : 1;
      const bo = getProjectStats(b).isOpen ? 0 : 1;
      return ao - bo;
    });
  }

  /**
   * Componente "Fascia blu con pulsante verde 'Invia la tua proposta'"
   * Con logica: se utente loggato -> va al modulo (#/candidatura), altrimenti al login (#/login)
   */
  function renderBlueProposalBanner(subtitleText = null) {
    const currentUser = getCurrentUser();
    const targetUrl = currentUser ? '#/candidatura' : '#/login?redirect=candidatura';
    const sub = subtitleText || 'Sei un ricercatore, docente o assegnista dell\'Università di Torino? Partecipa alla nuova call di ateneo: ricevi formazione, affiancamento dedicato e il raddoppio dei fondi raccolti dai cittadini sostenitori.';

    return `
      <section class="blue-callout-strip" aria-labelledby="banner-proposta-title">
        <div class="container blue-strip-inner">
          <div class="blue-strip-text">
            <div class="blue-strip-badge">Bando ricerca UniTO • Edizione 2026/2027</div>
            <h2 id="banner-proposta-title" class="blue-strip-title">Porta la tua ricerca fuori dai laboratori: ti aiutiamo noi</h2>
            <p class="blue-strip-desc">${sub}</p>
            <div class="blue-strip-highlights">
              <span>✓ Formazione d'Ateneo gratuita</span>
              <span>✓ Consulenza 1-a-1 con un Campaign Manager</span>
              <span>✓ Cofinanziamento 1:1 fino a 10.000 €</span>
            </div>
          </div>
          <div class="blue-strip-action">
            <a href="${targetUrl}" class="btn-green-cta" id="btnPropostaBanner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Invia la tua proposta
            </a>
            <span class="blue-strip-subnote">
              ${currentUser ? 'Accesso effettuato come ' + esc(currentUser.name) : 'Ti chiederemo di accedere con le credenziali UniTO'}
            </span>
          </div>
        </div>
      </section>
    `;
  }

  /** [NUOVO] Briciole di pane coerenti in tutte le pagine (A1, euristica 3) */
  function breadcrumb(items) {
    return `
      <nav class="breadcrumb-trail" aria-label="Percorso di navigazione">
        ${items.map((it, i) => i < items.length - 1
          ? `<a href="${it.href}">${esc(it.label)}</a> <span aria-hidden="true">&rsaquo;</span>`
          : `<span aria-current="page">${esc(it.label)}</span>`).join(' ')}
      </nav>
    `;
  }

  /* ==========================================================================
     [NUOVO] 4b. VALIDAZIONE DEI FORM CON ERRORI PERSISTENTI
     A1, euristica 9 (sev. 3): nei login di IdeaGinger il messaggio d'errore spariva appena si
     cliccava fuori dal campo e restava solo un bordo rosso poco visibile. Nel prototipo i form usavano
     i fumetti nativi del browser ("required"), che hanno lo stesso difetto: spariscono e indicano un
     solo campo alla volta.
     Soluzione: messaggio sotto ogni campo, che resta finché il campo non è corretto, + riepilogo in
     cima al form con link ai campi + focus sul riepilogo.
     Uso: enhanceForm(form, { onValid: fn, custom: { idCampo: el => 'errore' | '' } })
     ========================================================================== */

  function fieldLabel(form, el) {
    if (el.dataset.label) return el.dataset.label;
    const lbl = el.id ? form.querySelector(`label[for="${el.id}"]`) : null;
    const text = lbl ? lbl.textContent : (el.getAttribute('aria-label') || el.name || 'questo campo');
    return text.replace('*', '').replace(/\s+/g, ' ').trim();
  }

  function isFieldActive(el) {
    return !el.disabled && el.type !== 'hidden' && !el.closest('[hidden]');
  }

  function validateField(form, el, custom) {
    const label = fieldLabel(form, el);
    const value = (el.value || '').trim();

    if (el.type === 'checkbox') {
      if (el.required && !el.checked) return el.dataset.msgRequired || 'Per proseguire devi spuntare questa casella.';
      return '';
    }

    if (el.required && !value) {
      if (el.dataset.msgRequired) return el.dataset.msgRequired;
      return el.tagName === 'SELECT' ? `Seleziona un'opzione per «${label}».` : `Compila il campo «${label}».`;
    }

    if (value) {
      if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        return 'Inserisci un indirizzo email valido, ad esempio nome@email.com o nome.cognome@unito.it.';
      }
      if (el.type === 'number') {
        const num = Number(value);
        if (Number.isNaN(num)) return `Inserisci un numero in «${label}».`;
        if (el.min !== '' && num < Number(el.min)) return el.dataset.msgMin || `Il valore minimo è ${fmtNum(el.min)}.`;
        if (el.max !== '' && num > Number(el.max)) return el.dataset.msgMax || `Il valore massimo è ${fmtNum(el.max)}.`;
      }
      if (el.minLength > 0 && value.length < el.minLength) {
        return el.dataset.msgMinlength || `Inserisci almeno ${el.minLength} caratteri (ora sono ${value.length}).`;
      }
      if (el.maxLength > 0 && el.value.length > el.maxLength) {
        return `Hai superato il limite di ${el.maxLength} caratteri.`;
      }
      if (el.pattern && !new RegExp('^(?:' + el.pattern + ')$').test(value)) {
        return el.dataset.msgPattern || `Il formato di «${label}» non è corretto.`;
      }
    }

    if (custom && el.id && typeof custom[el.id] === 'function') {
      return custom[el.id](el) || '';
    }
    return '';
  }

  function errorAnchor(el) {
    // Dove inserire il messaggio: dopo il gruppo radio, dopo la label della checkbox o dopo l'input
    const radioGroup = el.type === 'radio' ? el.closest('[data-radio-group]') : null;
    if (radioGroup) return radioGroup;
    if (el.type === 'checkbox' && el.closest('label')) return el.closest('label');
    if (el.closest('.input-with-addon')) return el.closest('.input-with-addon');
    return el;
  }

  function showFieldError(el, message) {
    const anchor = errorAnchor(el);
    const errId = 'err-' + (el.id || el.name);
    let errEl = document.getElementById(errId);
    const targets = el.type === 'radio' ? [...document.querySelectorAll(`input[name="${el.name}"]`)] : [el];

    if (message) {
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'field-error';
        errEl.id = errId;
        anchor.insertAdjacentElement('afterend', errEl);
      }
      errEl.innerHTML = `<span aria-hidden="true">⚠</span> ${esc(message)}`;
      targets.forEach(t => {
        t.setAttribute('aria-invalid', 'true');
        const described = (t.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
        if (!described.includes(errId)) described.push(errId);
        t.setAttribute('aria-describedby', described.join(' '));
      });
      if (el.type === 'radio') anchor.classList.add('has-error');
    } else {
      if (errEl) errEl.remove();
      targets.forEach(t => {
        t.removeAttribute('aria-invalid');
        const described = (t.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== errId);
        if (described.length) t.setAttribute('aria-describedby', described.join(' '));
        else t.removeAttribute('aria-describedby');
      });
      if (el.type === 'radio') anchor.classList.remove('has-error');
    }
  }

  function enhanceForm(form, opts) {
    if (!form) return null;
    const options = opts || {};
    form.setAttribute('novalidate', '');
    const touched = new Set();

    function controls() {
      const all = [...form.querySelectorAll('input, select, textarea')].filter(isFieldActive);
      // Un solo controllo per gruppo di radio
      const seenRadio = new Set();
      return all.filter(el => {
        if (el.type !== 'radio') return true;
        if (seenRadio.has(el.name)) return false;
        seenRadio.add(el.name);
        return true;
      });
    }

    function radioError(el) {
      const group = [...form.querySelectorAll(`input[name="${el.name}"]`)].filter(isFieldActive);
      const isRequired = group.some(r => r.required);
      if (isRequired && !group.some(r => r.checked)) {
        const holder = el.closest('[data-radio-group]');
        return (holder && holder.dataset.msgRequired) || 'Seleziona una delle opzioni.';
      }
      const custom = options.custom && options.custom[el.name];
      return typeof custom === 'function' ? (custom(el) || '') : '';
    }

    function check(el) {
      const msg = el.type === 'radio' ? radioError(el) : validateField(form, el, options.custom);
      showFieldError(el, msg);
      return msg;
    }

    function renderSummary(errors) {
      let box = form.querySelector(':scope > .form-error-summary');
      if (!errors.length) {
        if (box) box.remove();
        return null;
      }
      if (!box) {
        box = document.createElement('div');
        box.className = 'form-error-summary';
        box.setAttribute('role', 'alert');
        box.setAttribute('tabindex', '-1');
        form.insertAdjacentElement('afterbegin', box);
      }
      box.innerHTML = `
        <strong>${errors.length === 1 ? 'C\'è 1 campo da correggere' : `Ci sono ${errors.length} campi da correggere`}:</strong>
        <ul>
          ${errors.map(e => `<li><a href="#${e.el.id || ''}" data-focus-field="${e.el.id || e.el.name}">${esc(e.msg)}</a></li>`).join('')}
        </ul>
      `;
      box.querySelectorAll('[data-focus-field]').forEach(link => {
        link.addEventListener('click', ev => {
          ev.preventDefault();
          ev.stopPropagation();
          const key = link.getAttribute('data-focus-field');
          const target = document.getElementById(key) || form.querySelector(`[name="${key}"]`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.focus({ preventScroll: true });
          }
        });
      });
      return box;
    }

    function validateAll() {
      const errors = [];
      controls().forEach(el => {
        const msg = check(el);
        if (msg) errors.push({ el, msg });
      });
      return errors;
    }

    // Ri-validazione "dal vivo" solo per i campi già toccati: l'errore resta visibile
    // finché l'utente non lo corregge, poi sparisce subito (feedback immediato).
    form.addEventListener('input', e => {
      const el = e.target;
      if (touched.has(el.id || el.name) || el.getAttribute('aria-invalid') === 'true') {
        check(el);
        if (form.querySelector(':scope > .form-error-summary')) {
          const remaining = controls().map(c => ({ el: c, msg: c.getAttribute('aria-invalid') === 'true' ? (document.getElementById('err-' + (c.id || c.name)) || {}).textContent : '' })).filter(x => x.msg);
          renderSummary(remaining.map(x => ({ el: x.el, msg: x.msg.replace('⚠', '').trim() })));
        }
      }
    });
    form.addEventListener('change', e => {
      const el = e.target;
      if (el.type === 'radio' || el.type === 'checkbox' || el.tagName === 'SELECT') {
        touched.add(el.id || el.name);
        if (el.getAttribute('aria-invalid') === 'true' || el.type === 'radio') check(el);
      }
    });
    form.addEventListener('focusout', e => {
      const el = e.target;
      if (!el.matches || !el.matches('input, select, textarea') || el.type === 'radio') return;
      if ((el.value || '').trim() !== '' || touched.has(el.id || el.name)) {
        touched.add(el.id || el.name);
        check(el);
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const errors = validateAll();
      controls().forEach(c => touched.add(c.id || c.name));
      const box = renderSummary(errors);
      if (errors.length) {
        if (box) {
          box.scrollIntoView({ behavior: 'smooth', block: 'center' });
          box.focus({ preventScroll: true });
        }
        return;
      }
      if (typeof options.onValid === 'function') options.onValid(e);
    });

    return { validateAll, renderSummary };
  }

  /** [NUOVO] Contatore di caratteri visibile per i campi con maxlength */
  function attachCounter(textarea) {
    if (!textarea || !textarea.maxLength || textarea.maxLength < 0) return;
    const counter = document.createElement('small');
    counter.className = 'char-counter';
    counter.setAttribute('aria-live', 'polite');
    const update = () => {
      const left = textarea.maxLength - textarea.value.length;
      counter.textContent = `${textarea.value.length} / ${fmtNum(textarea.maxLength)} caratteri`;
      counter.classList.toggle('near-limit', left < 100);
    };
    textarea.insertAdjacentElement('afterend', counter);
    textarea.addEventListener('input', update);
    update();
  }

  /** [NUOVO] Pannello di conferma persistente (al posto dei soli toast, che spariscono dopo 4,5 s) */
  function successPanel(title, bodyHtml, actionsHtml) {
    return `
      <div class="inline-success-panel" role="status" tabindex="-1">
        <div class="inline-success-icon" aria-hidden="true">✓</div>
        <div>
          <h3>${title}</h3>
          ${bodyHtml}
          ${actionsHtml ? `<div class="inline-success-actions">${actionsHtml}</div>` : ''}
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     5. RENDERER DELLE SINGOLE PAGINE
     ========================================================================== */
  /**
   * PAGINA 1: HOME
   * Vincolo: descrizione dell'iniziativa breve e incisiva (massimo 3 righe) con lo schema "lasci o raddoppi".
   */
  function renderHome(container) {
    container.innerHTML = `
      <!-- Hero Section Home -->
      <section class="home-hero-section">
        <div class="container hero-layout-grid">
          <div class="hero-left-col">
            <div class="hero-institutional-pill">
              <span class="pill-dot"></span>
              Iniziativa di Terza Missione & Crowdfunding dell'Università di Torino
            </div>

            <h1 class="hero-main-title">
              Sostieni la ricerca scientifica.<br>
              <span class="highlight-burgundy">L'Università raddoppia la tua donazione.</span>
            </h1>

            <!-- Descrizione breve e incisiva: MASSIMO 3 RIGHE con lo schema "lasci o raddoppi" -->
            <div class="hero-concise-box">
              <p class="hero-three-lines-desc">
                <strong>CrowdUniTO</strong> è la piattaforma di crowdfunding per la ricerca dell'Università di Torino basata sul meccanismo <em>"lasci o raddoppi"</em>: se il progetto raccoglie il 100% dell'obiettivo grazie alle donazioni dei cittadini, <strong>l'Ateneo ne raddoppia l'importo</strong> erogando fino a 10.000 € di cofinanziamento a fondo perduto.
              </p>
            </div>

            <!-- Schema visuale Lasci o Raddoppi -->
            <!-- [REVISIONE] "Fondo di Ateneo 5x1000": fonte non verificata (il 5x1000 è un'altra cosa) → sostituito con "Fondi di Ateneo". -->
            <div class="schema-lasci-raddoppi-bar" aria-label="Come funziona il matching 1 a 1">
              <div class="schema-step">
                <span class="schema-badge">1. Cittadini & Donatori</span>
                <strong>Donano € 10.000</strong>
                <small>Fino al 100% dell'obiettivo</small>
              </div>
              <div class="schema-operator">+</div>
              <div class="schema-step schema-unito">
                <span class="schema-badge badge-unito">2. Università di Torino</span>
                <strong>Raddoppia con € 10.000</strong>
                <small>Fondi di Ateneo, max 10.000 €</small>
              </div>
              <div class="schema-operator">=</div>
              <div class="schema-step schema-result">
                <span class="schema-badge badge-success">3. Laboratorio</span>
                <strong>€ 20.000 alla Ricerca!</strong>
                <small>Obiettivo raddoppiato</small>
              </div>
            </div>

            <div class="hero-cta-buttons">
              <a href="#campagne-in-corso" class="btn btn-primary-burgundy btn-lg" id="btnEsploraHome">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Esplora i progetti attivi
              </a>
              <a href="#/proponi" class="btn btn-secondary-outline btn-lg">
                Sei un ricercatore? Proponi un progetto
              </a>
            </div>
            <!-- [NUOVO] Rassicurazione per chi è alla prima esperienza di crowdfunding -->
            <p class="hero-first-time-note">
              Prima volta? <a href="#/come-funziona" class="text-link">Scopri in 2 minuti come funziona la donazione</a>: non serve registrarsi e, se il progetto non raggiunge l'obiettivo, vieni rimborsato.
            </p>
          </div>

          <!-- Colonna Destra: Box Garanzia & Numeri di Impatto -->
          <div class="hero-right-col">
            <div class="trust-summary-card">
              <div class="trust-card-header">
                <div class="trust-crest-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B1538" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <h2 class="trust-title">Garanzia dell'Università di Torino</h2>
                  <p class="trust-subtitle">Tutti i progetti sono selezionati dal Comitato Tecnico-Scientifico di Ateneo</p>
                </div>
              </div>

              <!-- [REVISIONE] "100% Raddoppio garantito da UniTO" era fuorviante: il raddoppio scatta solo
                   se la campagna arriva al 100% (e con un tetto di 10.000 €). Anche "34 laboratori" e
                   "€ 425.000" erano poco plausibili per un programma con 5 progetti l'anno (Funds TOgether è
                   alla 4ª edizione). → Numeri di esempio resi verosimili. -->
              <div class="trust-numbers-grid">
                <div class="trust-num-box">
                  <span class="trust-big-num">€ 298.000</span>
                  <span class="trust-lbl">Fondi raccolti e cofinanziati</span>
                </div>
                <div class="trust-num-box">
                  <span class="trust-big-num">20</span>
                  <span class="trust-lbl">Progetti finanziati in 4 edizioni</span>
                </div>
                <div class="trust-num-box">
                  <span class="trust-big-num">1:1</span>
                  <span class="trust-lbl">Cofinanziamento UniTO al 100%, fino a 10.000 €</span>
                </div>
                <div class="trust-num-box">
                  <span class="trust-big-num">2.900+</span>
                  <span class="trust-lbl">Cittadini sostenitori</span>
                </div>
              </div>

              <div class="trust-tax-alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B45309" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span><strong>Benefici fiscali:</strong> le donazioni alle università pubbliche sono deducibili dal reddito senza limiti di importo. <a href="#/faq?apri=detrazioni">Come ottenere la ricevuta</a></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sezione Campagne con Filtri Rapidi -->
      <section class="section-campaigns-catalog" id="campagne-in-corso" aria-labelledby="title-campagne">
        <div class="container">
          <div class="catalog-header-bar">
            <div>
              <span class="section-pre-title">CAMPAGNE DI CROWDFUNDING</span>
              <h2 id="title-campagne" class="section-title-large">Progetti aperti al sostegno</h2>
              <p class="section-sub-copy">Scegli la ricerca che vuoi sostenere: se la campagna raggiunge l'obiettivo, l'Università raddoppia quanto raccolto.</p>
            </div>
            <!-- [REVISIONE] Il numero "6 campagne" era scritto a mano: ora è calcolato. -->
            <a href="#/cerca" class="link-view-all">Vedi tutte le ${MOCK_PROJECTS.length} campagne nel catalogo &rarr;</a>
          </div>

          <!-- Filtri per Area Tematica -->
          <!-- [REVISIONE] role="tablist" non era corretto (non ci sono tab/tabpanel): ora è un gruppo di
               pulsanti con aria-pressed. Etichette generate da CATEGORIES, con il numero di progetti. -->
          <div class="home-pills-bar" role="group" aria-label="Filtra i progetti per area">
            <button class="pill-filter-btn active" data-cat="all" aria-pressed="true">Tutte le aree (${MOCK_PROJECTS.length})</button>
            ${CATEGORIES.map(c => {
              const n = MOCK_PROJECTS.filter(p => p.category === c.id).length;
              return `<button class="pill-filter-btn" data-cat="${c.id}" aria-pressed="false">${esc(c.label)} (${n})</button>`;
            }).join('')}
          </div>

          <!-- Griglia Card Progetti con Cerchio Percentuale -->
          <div class="projects-flex-grid" id="homeCardsContainer">
            ${featuredOrder(MOCK_PROJECTS).map(p => renderProjectCard(p)).join('')}
          </div>
          <p class="home-filter-live" id="homeFilterLive" aria-live="polite"></p>
        </div>
      </section>

      <!-- Come Funziona il Meccanismo Lasci o Raddoppi -->
      <section class="section-how-it-works" aria-labelledby="how-title">
        <div class="container">
          <div class="center-heading-block">
            <span class="section-pre-title">IL MODELLO VIRTUOSO</span>
            <h2 id="how-title" class="section-title-large">Come funziona la formula "Lasci o Raddoppi"?</h2>
            <p class="section-sub-copy">Un patto trasparente di cofinanziamento tra cittadini, ricercatori e l'Università degli Studi di Torino.</p>
          </div>

          <div class="three-steps-grid">
            <div class="step-card">
              <div class="step-card-num">01</div>
              <h3 class="step-card-title">Il team di ricerca lancia la campagna</h3>
              <p class="step-card-desc">
                Docenti, assegnisti e ricercatori UniTO definiscono un obiettivo economico trasparente (es. 8.000 €) per finanziare una linea di studio o una tecnologia specifica.
              </p>
            </div>
            <div class="step-card">
              <div class="step-card-num">02</div>
              <h3 class="step-card-title">I cittadini donano e diffondono</h3>
              <p class="step-card-desc">
                Sostenitori, famiglie, pazienti e aziende donano online con carta, PayPal o bonifico. Per tutta la durata della campagna il cerchio percentuale mostra i progressi in tempo reale.
              </p>
            </div>
            <div class="step-card highlight">
              <div class="step-card-num">03</div>
              <h3 class="step-card-title">Al 100% UniTO raddoppia i fondi</h3>
              <p class="step-card-desc">
                Se il traguardo viene raggiunto entro la scadenza, l'Ateneo versa una cifra pari a quella raccolta dai cittadini (fino a 10.000 €). Se non viene raggiunto, le donazioni vengono rimborsate.
              </p>
            </div>
          </div>
          <p class="center-more-link"><a href="#/come-funziona" class="text-link">Tutti i dettagli: metodi di pagamento, ricevuta, regola "tutto o niente" &rarr;</a></p>
        </div>
      </section>

      <!-- Fascia blu con pulsante verde "Invia la tua proposta" -->
      ${renderBlueProposalBanner()}
    `;

    // Attacca listener per i filtri delle pillole in Home
    const pills = container.querySelectorAll('.pill-filter-btn');
    const cards = container.querySelectorAll('.ginger-project-card');

    const live = container.querySelector('#homeFilterLive');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');
        const cat = pill.getAttribute('data-cat');
        let visible = 0;

        cards.forEach(card => {
          if (cat === 'all' || card.getAttribute('data-category') === cat) {
            card.style.display = 'flex';
            visible++;
          } else {
            card.style.display = 'none';
          }
        });
        // Feedback per screen reader sul risultato del filtro
        if (live) live.textContent = `${visible} progetti mostrati.`;
      });
    });

    // Scroll liscio verso le campagne se si clicca sul pulsante hero
    const btnEsplora = container.querySelector('#btnEsploraHome');
    if (btnEsplora) {
      btnEsplora.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('campagne-in-corso');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }
  /**
   * PAGINA 2: PROPONI PROGETTO
   * Vincoli rigorosi da specifica:
   * - 4 fasi numerate:
   *   Fase 1 - Formazione & Risorse: moduli di preparazione al crowdfunding curati dall'Ateneo
   *            (link alla pagina interna "Formazione": calendario con data di inizio, modalità, iscrizione simulata).
   *   Fase 2 - Candidatura & Valutazione: invio del modulo online ed esito entro 15 giorni lavorativi dal comitato UniTO.
   *   Fase 3 - Accompagnamento & Pacchetti Servizi: affiancamento di un referente, strategie di promozione, materiale grafico
   *            (link alla pagina interna "Pacchetti": Base, Avanzato, e contatto per pacchetto personalizzato).
   *   Fase 4 - Cofinanziamento e messa online: pubblicazione con quota trasparente (350 € + IVA, esempio) ed eventuale raddoppio dei fondi.
   * - Sotto, la stessa fascia blu con pulsante verde "Invia la tua proposta":
   *   se l'utente non è loggato porta al login e poi al modulo, altrimenti direttamente al modulo.
   */
  function renderProponi(container, params) {
    container.innerHTML = `
      <section class="proponi-header-hero">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/home">Home</a> &rsaquo; <span>Proponi progetto</span>
          </div>
          <span class="section-pre-title">PER DOCENTI, RICERCATORI E DOTTORANDI UNITO</span>
          <h1 class="page-main-heading">Come proporre un progetto di crowdfunding</h1>
          <p class="page-intro-lead">
            Il programma di crowdfunding di Ateneo <strong>Funds TOgether</strong> supporta la comunità scientifica di UniTO nell'ideazione, comunicazione e raccolta fondi per progetti di ricerca ad alto impatto. Scopri le <strong>4 fasi del percorso</strong> per trasformare la tua idea in una campagna di successo con il raddoppio dei fondi.
          </p>
        </div>
      </section>

      <!-- Le 4 Fasi Numerate Richieste Specificamente -->
      <section class="section-four-phases" aria-labelledby="fasi-heading">
        <div class="container">
          <div class="section-block-header">
            <h2 id="fasi-heading" class="section-title-large">Il percorso in 4 fasi</h2>
            <p class="section-sub-copy">Dall'idea iniziale alla pubblicazione online e al cofinanziamento dell'Ateneo.</p>
          </div>

          <div class="phases-timeline-list">

            <!-- FASE 1 -->
            <div class="phase-timeline-card" id="fase-1">
              <div class="phase-badge-number">
                <span>FASE</span>
                <strong>1</strong>
              </div>
              <div class="phase-body-content">
                <div class="phase-meta-tag">Preparazione & Competenze</div>
                <h3 class="phase-title">Formazione & Risorse</h3>
                <p class="phase-desc">
                  I moduli di preparazione al crowdfunding curati dall'Ateneo e dagli esperti di Ginger Crowdfunding ti guidano passo dopo passo: come impostare un obiettivo economico realistico, definire ricompense etiche e coinvolgere cittadini e donatori attraverso una comunicazione scientifica accessibile e coinvolgente.
                </p>
                <div class="phase-link-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B1538" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>Consulta il calendario con le prossime edizioni e registrati subito:</span>
                  <a href="#/formazione" class="phase-prominent-link">Vai alla pagina interna Formazione & Calendario &rarr;</a>
                </div>
              </div>
            </div>

            <!-- FASE 2 -->
            <div class="phase-timeline-card" id="fase-2">
              <div class="phase-badge-number">
                <span>FASE</span>
                <strong>2</strong>
              </div>
              <div class="phase-body-content">
                <div class="phase-meta-tag">Selezione Accademica</div>
                <h3 class="phase-title">Candidatura & Valutazione</h3>
                <p class="phase-desc">
                  Compila e invia il modulo online con la tua idea di ricerca, gli obiettivi scientifici, il budget preventivato e il piano di diffusione. Il Comitato Tecnico-Scientifico di UniTO esaminerà la proposta garantendo un <strong>esito formale entro 15 giorni lavorativi</strong> dalla sottomissione.
                </p>
                <div class="phase-features-list">
                  <div class="feature-bullet">
                    <strong>Tempi certi:</strong> Risposta motivata entro 15 giorni lavorativi via posta istituzionale @unito.it.
                  </div>
                  <div class="feature-bullet">
                    <strong>Criteri di valutazione:</strong> Chiarezza divulgativa, fattibilità economica, impatto sociale e scientifico sul territorio.
                  </div>
                </div>
              </div>
            </div>

            <!-- FASE 3 -->
            <div class="phase-timeline-card" id="fase-3">
              <div class="phase-badge-number">
                <span>FASE</span>
                <strong>3</strong>
              </div>
              <div class="phase-body-content">
                <div class="phase-meta-tag">Supporto Strategico & Comunicativo</div>
                <h3 class="phase-title">Accompagnamento & Pacchetti Servizi</h3>
                <p class="phase-desc">
                  Una volta approvato il progetto, avrai l'<strong>affiancamento 1-a-1 di un referente Campaign Manager dedicato</strong>, che ti supporterà nell'elaborazione del piano strategico di promozione, nella revisione dei testi e nella produzione del materiale grafico istituzionale brandizzato UniTO.
                </p>
                <div class="phase-link-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B1538" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  <span>Scegli il livello di supporto più adatto al tuo laboratorio:</span>
                  <a href="#/pacchetti" class="phase-prominent-link">Scopri i Pacchetti Servizi (Base, Avanzato, Personalizzato) &rarr;</a>
                </div>
              </div>
            </div>

            <!-- FASE 4 -->
            <div class="phase-timeline-card" id="fase-4">
              <div class="phase-badge-number">
                <span>FASE</span>
                <strong>4</strong>
              </div>
              <div class="phase-body-content">
                <div class="phase-meta-tag">Lancio & Raddoppio dei Fondi</div>
                <h3 class="phase-title">Cofinanziamento e messa online</h3>
                <!-- [REVISIONE] DA DECIDERE: la quota di 350 € + IVA viene dall'analisi di IdeaGinger (A1).
                     Nel regolamento reale di Funds TOgether (UniTO, 2024) l'apertura del profilo per i team
                     selezionati è gratuita. Se volete restare fedeli al programma reale, togliete la quota
                     qui, in Pacchetti, nelle FAQ e nella candidatura. -->
                <p class="phase-desc">
                  La campagna viene pubblicata ufficialmente sulla piattaforma CrowdUniTO. I servizi di gestione tecnica e hosting sono erogati a una <strong>quota trasparente di 350 € + IVA</strong> (copribile tramite fondi ordinari di ricerca del dipartimento). Se la raccolta raggiunge il 100% dell'obiettivo prefissato grazie ai sostenitori, scatta il <strong>raddoppio integrale dei fondi da parte dell'Università di Torino</strong> fino a un massimo di 10.000 € per progetto!
                </p>
                <div class="phase-summary-pill-box">
                  <span class="summary-pill">Quota servizi: 350 € + IVA</span>
                  <span class="summary-pill">Durata campagna: 30-45 giorni</span>
                  <span class="summary-pill highlight">Raddoppio UniTO: fino a 10.000 € al raggiungimento del 100%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- Requisiti di Candidatura & FAQ Rapida Ricercatori -->
      <section class="section-researcher-criteria">
        <div class="container">
          <div class="criteria-card-grid">
            <div class="criteria-info-box">
              <h3 class="criteria-box-title">Chi può candidarsi?</h3>
              <ul class="criteria-list">
                <li>Docenti ordinari e associati dell'Università degli Studi di Torino</li>
                <li>Ricercatori a tempo indeterminato e determinato (RTT, RTDA, RTDB)</li>
                <li>Assegnisti di ricerca e dottorandi (con l'avallo formale del Responsabile di Laboratorio o Tutor)</li>
                <li>Personale tecnico-amministrativo coinvolto in progetti di Terza Missione e public engagement</li>
              </ul>
              <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);">
                Hai dubbi sull'idoneità del tuo progetto? Consulta la nostra <a href="#/faq" class="text-link">sezione FAQ completa per ricercatori</a>.
              </p>
            </div>

            <div class="criteria-info-box">
              <h3 class="criteria-box-title">Cosa serve per compilare il modulo online?</h3>
              <ul class="criteria-list">
                <li>Titolo della proposta e settore scientifico-disciplinare (SSD)</li>
                <!-- [REVISIONE] Qui c'era "max 2.000 battute", nel modulo "massimo 1.500 caratteri": allineato a 1.500. -->
                <li>Abstract divulgativo comprensibile a un pubblico non accademico (max 1.500 caratteri)</li>
                <li>Stima del budget economico necessario con indicazione della quota raddoppio</li>
                <li>Contatto istituzionale e disponibilità a partecipare al percorso formativo obbligatorio</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Sotto, la stessa fascia blu con pulsante verde "Invia la tua proposta":
           se l'utente non è loggato porta al login e poi al modulo, altrimenti direttamente al modulo -->
      ${renderBlueProposalBanner('Pronto a candidare il tuo laboratorio? Clicca sul pulsante sottostante per iniziare la compilazione guidata del modulo.')}
    `;

    // [NUOVO] Link diretti a una fase (es. #/proponi?fase=4 dalla pagina Pacchetti)
    const fase = params && params.get('fase');
    const faseEl = fase ? container.querySelector('#fase-' + fase) : null;
    if (faseEl) {
      setTimeout(() => faseEl.scrollIntoView({ block: 'start' }), 50);
      faseEl.classList.add('phase-highlight');
    }
  }
  /**
   * PAGINA 3: FORMAZIONE (Fase 1)
   * Calendario con data di inizio, modalità, iscrizione simulata.
   */
  function renderFormazione(container, justEnrolled) {
    const enrollments = readJSON(TRAINING_ENROLL_KEY, []);
    const currentUser = getCurrentUser();

    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/home">Home</a> &rsaquo; <a href="#/proponi">Proponi progetto</a> &rsaquo; <span>Formazione & Calendario</span>
          </div>
          <span class="section-pre-title">FASE 1 • PREPARAZIONE AL CROWDFUNDING</span>
          <h1 class="page-main-heading">Formazione e risorse per ricercatori</h1>
          <p class="page-intro-lead">
            La preparazione è il fattore chiave per superare il 100% della raccolta fondi e sbloccare il raddoppio UniTO. L'Ateneo organizza cicli formativi gratuiti tenuti da professionisti della comunicazione scientifica e della raccolta fondi.
          </p>
        </div>
      </section>

      <section class="section-training-details">
        <div class="container">
          <!-- Moduli Didattici -->
          <div class="training-modules-overview">
            <h2 class="section-title-large">I 3 moduli del percorso formativo</h2>
            <div class="three-steps-grid" style="margin-top: 1.5rem;">
              <div class="step-card">
                <div class="step-card-num">M1</div>
                <h3 class="step-card-title">Storytelling Scientifico & Video Pitch</h3>
                <p class="step-card-desc">
                  Come tradurre concetti accademici complessi in narrazioni emozionanti e comprensibili per i non addetti ai lavori, senza perdere il rigore scientifico.
                </p>
              </div>
              <div class="step-card">
                <div class="step-card-num">M2</div>
                <h3 class="step-card-title">Budget Trasparente & Ricompense Etiche</h3>
                <p class="step-card-desc">
                  Come formulare un traguardo economico credibile, scorporare i costi e progettare ricompense tangibili che gratifichino donatori privati e aziende sostenitrici.
                </p>
              </div>
              <div class="step-card">
                <div class="step-card-num">M3</div>
                <h3 class="step-card-title">Lancio, Community & Media Relations</h3>
                <p class="step-card-desc">
                  Mappatura delle cerchie relazionali, strategie social, sinergia con l'Ufficio Stampa d'Ateneo ed eventi territoriali durante i 45 giorni di campagna attiva.
                </p>
              </div>
            </div>
          </div>

          <!-- Calendario Sessioni Disponibili -->
          <div class="training-calendar-block" style="margin-top: 4rem;">
            <div class="section-block-header">
              <h2 class="section-title-large">Calendario delle prossime edizioni 2026/2027</h2>
              <p class="section-sub-copy">Scegli la sessione più comoda per te e compila il modulo di iscrizione simulata sottostante.</p>
            </div>

            <div class="calendar-table-wrap">
              <table class="styled-table" aria-label="Tabella calendario corsi formazione crowdfunding">
                <thead>
                  <tr>
                    <th>Edizione / Titolo</th>
                    <th>Data d'Inizio</th>
                    <th>Modalità & Sede</th>
                    <th>Orario & Frequenza</th>
                    <th>Posti Disponibili</th>
                    <th>Stato Iscrizioni</th>
                  </tr>
                </thead>
                <tbody>
                  ${TRAINING_SESSIONS.map(session => {
                    const isEnrolled = enrollments.some(e => e.sessionId === session.id);
                    return `
                      <tr>
                        <td>
                          <strong>${session.title}</strong><br>
                          <small style="color: var(--text-muted);">${session.instructors}</small>
                        </td>
                        <td><span class="badge-date">${session.startDate}</span></td>
                        <td>${session.location}</td>
                        <td>${session.schedule}</td>
                        <td>
                          <span class="badge-seats">${isEnrolled ? session.seatsLeft - 1 : session.seatsLeft} su ${session.seatsTotal} posti liberi</span>
                        </td>
                        <td>
                          ${isEnrolled ? `
                            <span class="status-enrolled-pill">✓ Già Iscritto</span>
                          ` : `
                            <button class="btn btn-sm btn-outline-burgundy btn-select-session" data-session-id="${session.id}" data-session-title="${session.title}">
                              Seleziona questa edizione
                            </button>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Modulo di Iscrizione Simulata -->
          <div class="enrollment-form-card" id="form-iscrizione-box" style="margin-top: 3.5rem;">
            <div class="enrollment-header">
              <div class="enrollment-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B1538" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7.5" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              </div>
              <div>
                <h3 class="enrollment-title">Modulo di iscrizione al percorso</h3>
                <p class="enrollment-desc">L'iscrizione è riservata al personale di ricerca e docenza dell'Università di Torino.</p>
              </div>
            </div>

            ${justEnrolled ? successPanel('Iscrizione confermata', `<p>Ti sei iscritto a <strong>${esc(justEnrolled.sessionTitle)}</strong>. Il link e il programma arriveranno a <strong>${esc(justEnrolled.email)}</strong>.</p>`, '<a href="#/proponi?fase=2" class="btn btn-sm btn-outline-burgundy">Passo successivo: la candidatura</a> <a href="#/profilo" class="btn btn-sm btn-ghost">Vedi le mie iscrizioni</a>') : ''}
            <form id="trainingEnrollForm" class="styled-form-grid">
              <div class="form-group form-full">
                <label for="enrollSessionSelect">Edizione Formativa Selezionata <span class="required">*</span></label>
                <select id="enrollSessionSelect" required class="form-control">
                  <option value="">-- Seleziona una sessione dal calendario --</option>
                  ${TRAINING_SESSIONS.map(s => `<option value="${s.id}">${s.title} (Inizio: ${s.startDate} - ${s.location})</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label for="enrollName">Nome e Cognome Ricercatore <span class="required">*</span></label>
                <input type="text" id="enrollName" required class="form-control" autocomplete="name" placeholder="Es. Prof. Marco Bianchi" value="${currentUser ? esc(currentUser.name) : ''}">
              </div>

              <div class="form-group">
                <label for="enrollEmail">Email <span class="required">*</span></label>
                <input type="email" id="enrollEmail" required class="form-control" autocomplete="email" placeholder="nome.cognome@email.com o @unito.it" value="${currentUser ? esc(currentUser.email) : ''}">
              </div>

              <div class="form-group">
                <label for="enrollDepartment">Dipartimento di Afferenza <span class="required">*</span></label>
                <select id="enrollDepartment" required class="form-control">
                  <option value="">-- Seleziona Dipartimento UniTO --</option>
                  <option value="Neuroscienze">Dipartimento di Neuroscienze "Rita Levi Montalcini"</option>
                  <option value="Scienze della Vita">Dipartimento di Scienze della Vita e Biologia dei Sistemi</option>
                  <option value="Studi Storici">Dipartimento di Studi Storici</option>
                  <option value="Fisica">Dipartimento di Fisica</option>
                  <option value="Informatica">Dipartimento di Informatica</option>
                  <option value="DISAFA">Dipartimento di Scienze Agrarie, Forestali e Alimentari (DISAFA)</option>
                  <option value="CPS">Dipartimento di Culture, Politica e Società</option>
                  <option value="Altro">Altro Dipartimento o Struttura Speciale UniTO</option>
                </select>
              </div>

              <div class="form-group">
                <label for="enrollRole">Ruolo Accademico <span class="required">*</span></label>
                <select id="enrollRole" required class="form-control">
                  <option value="Ordinario">Professore Ordinario</option>
                  <option value="Associato">Professore Associato</option>
                  <option value="Ricercatore">Ricercatore (RTT / RTDA / RTDB)</option>
                  <option value="Assegnista">Assegnista di Ricerca</option>
                  <option value="Dottorando">Dottorando di Ricerca</option>
                </select>
              </div>

              <div class="form-group form-full">
                <label for="enrollNotes">Breve idea di massima della campagna (opzionale)</label>
                <textarea id="enrollNotes" class="form-control" rows="2" placeholder="Descrivi in 2 righe l'ambito di studio su cui vorresti impostare la campagna..."></textarea>
              </div>

              <div class="form-group form-full">
                <button type="submit" class="btn btn-primary-burgundy btn-lg" id="btnSubmitEnrollment">
                  Conferma l'iscrizione gratuita
                </button>
                <span class="form-side-note">
                  Simulazione: i dati vengono salvati solo in questo browser.
                </span>
              </div>
            </form>
          </div>

          <div style="margin-top: 2.5rem; text-align: center;">
            <p>Completata la formazione, il passo successivo è l'invio della candidatura ufficiale.</p>
            <p><a href="#/proponi" class="text-link">&larr; Torna alle 4 fasi del percorso</a> oppure <a href="#/pacchetti" class="text-link">Scopri i pacchetti di servizio della Fase 3 &rarr;</a></p>
          </div>
        </div>
      </section>

      <!-- Fascia blu di chiusura -->
      ${renderBlueProposalBanner()}
    `;

    // Event listeners per selezionare rapidamente la sessione dai pulsanti in tabella
    const sessionBtns = container.querySelectorAll('.btn-select-session');
    const selectDropdown = container.querySelector('#enrollSessionSelect');
    sessionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-session-id');
        if (selectDropdown) {
          selectDropdown.value = id;
          document.getElementById('form-iscrizione-box').scrollIntoView({ behavior: 'smooth' });
          selectDropdown.focus();
        }
      });
    });

    // Form submit simulato
    // [REVISIONE] Prima: fumetti nativi del browser + toast generico "Compila tutti i campi",
    // nessun controllo sull'email @unito.it e possibilità di iscriversi due volte alla stessa edizione.
    // → CORRETTO con enhanceForm (errori persistenti accanto ai campi) e controllo dei duplicati.
    const form = container.querySelector('#trainingEnrollForm');
    enhanceForm(form, {
      custom: {
        enrollSessionSelect: el => enrollments.some(e => e.sessionId === el.value)
          ? 'Sei già iscritto a questa edizione: scegline un\'altra o controlla la tua area personale.'
          : ''
      },
      onValid: () => {
        const sessionId = selectDropdown.value;
        const session = TRAINING_SESSIONS.find(t => t.id === sessionId);
        const entry = {
          sessionId,
          sessionTitle: session ? session.title : sessionId,
          name: container.querySelector('#enrollName').value.trim(),
          email: container.querySelector('#enrollEmail').value.trim(),
          dept: container.querySelector('#enrollDepartment').value,
          role: container.querySelector('#enrollRole').value,
          enrolledAt: new Date().toISOString()
        };
        const all = readJSON(TRAINING_ENROLL_KEY, []);
        all.push(entry);
        writeJSON(TRAINING_ENROLL_KEY, all);

        showToast(`Iscrizione confermata per ${entry.name}.`, 'success');
        renderFormazione(container, entry);
        const panel = container.querySelector('.inline-success-panel');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
          panel.focus({ preventScroll: true });
        }
      }
    });
  }
  /**
   * PAGINA 4: PACCHETTI (Fase 3)
   * Base, Avanzato, e contatto per pacchetto personalizzato.
   */
  function renderPacchetti(container) {
    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/home">Home</a> &rsaquo; <a href="#/proponi">Proponi progetto</a> &rsaquo; <span>Pacchetti Servizi</span>
          </div>
          <span class="section-pre-title">FASE 3 • ACCOMPAGNAMENTO & SERVIZI</span>
          <h1 class="page-main-heading">Pacchetti di accompagnamento e consulenza</h1>
          <p class="page-intro-lead">
            Ogni progetto approvato dal comitato accademico beneficia del supporto professionale dei Campaign Manager accreditati da UniTO. Scegli il livello di affiancamento ideale per le esigenze del tuo gruppo di lavoro.
          </p>
        </div>
      </section>

      <section class="section-packages-compare">
        <div class="container">
          <!-- Griglia a 3 Colonne per i Pacchetti Richiesti -->
          <div class="packages-pricing-grid">

            <!-- Pacchetto BASE -->
            <div class="pricing-card package-base">
              <div class="pricing-card-header">
                <span class="package-tier-label">ESSENZIALE</span>
                <h3 class="package-name">Pacchetto Base</h3>
                <div class="package-price-row">
                  <span class="price-val">350 €</span>
                  <span class="price-vat">+ IVA</span>
                </div>
                <p class="price-subtext">Quota trasparente detraibile o imputabile a fondi di ricerca dipartimentali.</p>
              </div>

              <div class="pricing-card-features">
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span><strong>1 Incontro di kick-off strategico (2 ore)</strong> con il Campaign Manager referente.</span>
                </div>
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span>Revisione formale e ottimizzazione editoriale dei testi della scheda di raccolta.</span>
                </div>
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span>Linee guida per la definizione di ricompense coerenti ed etiche per i donatori.</span>
                </div>
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span>Attivazione gateway di pagamento con ricevute fiscali automatiche UniTO.</span>
                </div>
                <div class="feature-item-check muted">
                  <span class="check-icon cross">✕</span>
                  <span>Kit grafico personalizzato e riprese video (a cura del proponente).</span>
                </div>
              </div>

              <div class="pricing-card-action">
                <a href="#/candidatura?package=base" class="btn btn-outline-burgundy btn-block">
                  Scegli Pacchetto Base
                </a>
              </div>
            </div>

            <!-- Pacchetto AVANZATO (Consigliato) -->
            <div class="pricing-card package-advanced popular">
              <div class="popular-ribbon">CONSIGLIATO DA UNITO</div>
              <div class="pricing-card-header">
                <span class="package-tier-label">COMPLETO & GUIDATO</span>
                <h3 class="package-name">Pacchetto Avanzato</h3>
                <div class="package-price-row">
                  <span class="price-val">650 €</span>
                  <span class="price-vat">+ IVA</span>
                </div>
                <p class="price-subtext">La scelta più adottata dai dipartimenti per massimizzare la probabilità di raddoppio.</p>
              </div>

              <div class="pricing-card-features">
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span><strong>Tutto ciò che è incluso nel Pacchetto Base</strong>, più:</span>
                </div>
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span><strong>3 Incontri dedicati di co-progettazione e coaching</strong> durante la campagna.</span>
                </div>
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span><strong>Kit grafico professionale personalizzato:</strong> banner social, copertina e infografica di impatto con logo UniTO.</span>
                </div>
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span>Piano editoriale dettagliato per i canali social e newsletter del laboratorio.</span>
                </div>
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span>Supporto alla redazione del comunicato stampa in raccordo con l'Ufficio Stampa d'Ateneo.</span>
                </div>
              </div>

              <div class="pricing-card-action">
                <a href="#/candidatura?package=avanzato" class="btn btn-primary-burgundy btn-block">
                  Scegli Pacchetto Avanzato
                </a>
              </div>
            </div>

            <!-- Pacchetto PERSONALIZZATO -->
            <div class="pricing-card package-custom">
              <div class="pricing-card-header">
                <span class="package-tier-label">SU MISURA</span>
                <h3 class="package-name">Pacchetto Personalizzato</h3>
                <div class="package-price-row">
                  <span class="price-val">Su Preventivo</span>
                </div>
                <p class="price-subtext">Ideato per consorzi inter-dipartimentali, grandi progetti PNRR o target &gt; 30.000 €.</p>
              </div>

              <div class="pricing-card-features">
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span>Tutti i servizi del pacchetto avanzato ad alta intensità.</span>
                </div>
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span><strong>Produzione video professionale in loco:</strong> riprese in laboratorio con operatore e montaggio cinematografico 4K.</span>
                </div>
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span>Strategia di partnership con imprese, fondazioni bancarie e sponsor territoriali.</span>
                </div>
                <div class="feature-item-check">
                  <span class="check-icon">✓</span>
                  <span>Organizzazione evento pubblico di lancio o conferenza stampa dedicata.</span>
                </div>
              </div>

              <div class="pricing-card-action">
                <a href="#contatto-personalizzato" class="btn btn-secondary-outline btn-block" id="btnScrollToCustomForm">
                  Richiedi Consulenza Personalizzata
                </a>
              </div>
            </div>

          </div>

          <!-- Modulo di Contatto per Pacchetto Personalizzato -->
          <div class="custom-package-contact-box" id="contatto-personalizzato" style="margin-top: 4.5rem;">
            <div class="contact-box-header">
              <div class="contact-box-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00A896" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div>
                <h3 class="contact-box-title">Contatto per Pacchetto Personalizzato</h3>
                <p class="contact-box-desc">
                  Hai esigenze particolari o una campagna con target superiore a 30.000 €? Raccontaci le tue necessità e ti ricontatteremo entro 48 ore lavorative per strutturare una proposta tecnica dedicata.
                </p>
              </div>
            </div>

            <form id="customPackageForm" class="styled-form-grid" style="margin-top: 1.5rem;">
              <div class="form-group">
                <label for="customContactName">Nome e Cognome Referente <span class="required">*</span></label>
                <input type="text" id="customContactName" required class="form-control" autocomplete="name" placeholder="Es. Prof.ssa Giulia Valenti">
              </div>

              <div class="form-group">
                <label for="customContactEmail">Email <span class="required">*</span></label>
                <input type="email" id="customContactEmail" required class="form-control" autocomplete="email" placeholder="giulia.valenti@email.com o @unito.it">
              </div>

              <div class="form-group">
                <label for="customContactTarget">Obiettivo Economico Stimato</label>
                <select id="customContactTarget" class="form-control">
                  <option value="20k-30k">Tra 20.000 € e 30.000 €</option>
                  <option value="30k-50k">Tra 30.000 € e 50.000 €</option>
                  <option value="50k+">Superiore a 50.000 €</option>
                </select>
              </div>

              <div class="form-group">
                <label for="customContactNeeds">Servizio Principale Richiesto</label>
                <select id="customContactNeeds" class="form-control">
                  <option value="video">Produzione Video Professionale con troupe</option>
                  <option value="sponsor">Ricerca Matching Fund privati / Imprese</option>
                  <option value="press">Ufficio Stampa & Media Relations continuativa</option>
                  <option value="all">Pacchetto Completo Full-Service</option>
                </select>
              </div>

              <div class="form-group form-full">
                <label for="customContactMessage">Descrizione del Progetto e Richieste Particolari <span class="required">*</span></label>
                <textarea id="customContactMessage" required minlength="20" maxlength="1000" class="form-control" rows="3" placeholder="Indica il dipartimento promotore, se vi sono partner esterni e quali elementi desideri includere nel preventivo su misura..."></textarea>
              </div>

              <div class="form-group form-full">
                <button type="submit" class="btn btn-primary-burgundy btn-lg" id="btnSubmitCustomContact">
                  Invia Richiesta per Pacchetto Personalizzato
                </button>
              </div>
            </form>
          </div>

          <div style="margin-top: 3rem; text-align: center;">
            <!-- [REVISIONE] I due link portavano entrambi alla stessa pagina (inizio di "Proponi"), anche quello che prometteva la Fase 4. -->
            <p>Sei pronto per il passaggio successivo? <a href="#/proponi?fase=4" class="text-link">Consulta la Fase 4: cofinanziamento e messa online</a> oppure torna alla <a href="#/proponi" class="text-link">panoramica del percorso</a>.</p>
          </div>
        </div>
      </section>

      <!-- Fascia blu di chiusura -->
      ${renderBlueProposalBanner()}
    `;

    // Listener per scorrere al form personalizzato
    const scrollBtn = container.querySelector('#btnScrollToCustomForm');
    if (scrollBtn) {
      scrollBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('contatto-personalizzato').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Submit simulato del form pacchetto personalizzato
    // [REVISIONE] Prima: nessuna validazione reale (bastava un'email qualsiasi) e solo un toast che
    // spariva dopo 4,5 secondi, mentre il form veniva svuotato. → Errori persistenti + conferma che resta.
    const customForm = container.querySelector('#customPackageForm');
    attachCounter(container.querySelector('#customContactMessage'));
    enhanceForm(customForm, {
      onValid: () => {
        const name = container.querySelector('#customContactName').value.trim();
        const email = container.querySelector('#customContactEmail').value.trim();
        const ticket = 'PKG-' + Math.floor(1000 + Math.random() * 9000);
        customForm.outerHTML = successPanel(
          'Richiesta inviata',
          `<p>Grazie ${esc(name)}, abbiamo ricevuto la richiesta n. <strong>${ticket}</strong> per il Pacchetto Personalizzato. Ti risponderemo a <strong>${esc(email)}</strong> entro 48 ore lavorative.</p>`,
          '<a href="#/proponi" class="btn btn-sm btn-outline-burgundy">Torna al percorso in 4 fasi</a>'
        );
        const panel = container.querySelector('.inline-success-panel');
        if (panel) panel.focus();
        showToast('Richiesta per il Pacchetto Personalizzato inviata.', 'success');
      }
    });
  }
  /**
   * PAGINA 5: CANDIDATURA (Modulo online per "Invia la tua proposta")
   * Se l'utente non è loggato, mostra avviso con reindirizzamento al login, altrimenti il modulo completo.
   */
  function renderCandidatura(container, params) {
    const currentUser = getCurrentUser();
    const preselectedPackage = params.get('package') || 'avanzato';

    // SE L'UTENTE NON È LOGGATO
    if (!currentUser) {
      container.innerHTML = `
        <section class="inner-page-hero">
          <div class="container">
            <div class="breadcrumb-trail">
              <a href="#/home">Home</a> &rsaquo; <a href="#/proponi">Proponi progetto</a> &rsaquo; <span>Candidatura Online</span>
            </div>
            <span class="section-pre-title">ACCESSO RICHIESTO</span>
            <h1 class="page-main-heading">Candidatura di un progetto di ricerca</h1>
          </div>
        </section>

        <section class="section-auth-required">
          <div class="container">
            <div class="auth-required-box">
              <div class="lock-shield-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8B1538" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h2 class="auth-gate-title">Autenticazione richiesta per inviare una proposta</h2>
              <p class="auth-gate-desc">
                In base alle linee guida di Ateneo, per sottomettere un progetto al comitato scientifico di CrowdUniTO è necessario autenticarsi con le proprie credenziali universitarie (SCU UniTO) o con un account Progettista.
              </p>
              <div class="auth-gate-actions">
                <a href="#/login?redirect=candidatura" class="btn btn-primary-burgundy btn-lg">
                  Accedi con le tue credenziali
                </a>
                <button class="btn btn-secondary-outline btn-lg" id="btnDemoQuickLogin">
                  Accedi subito come Ricercatore Demo (1-Click)
                </button>
              </div>
              <p style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted);">
                Non sei ancora registrato? <a href="#/registrati?redirect=candidatura" class="text-link">Registrati come progettista</a>.
              </p>
            </div>
          </div>
        </section>
      `;

      const demoBtn = container.querySelector('#btnDemoQuickLogin');
      if (demoBtn) {
        demoBtn.addEventListener('click', () => {
          setCurrentUser({
            name: 'Prof. Marco Bianchi',
            email: 'marco.bianchi@unito.it',
            role: 'Professore Associato',
            department: 'Dipartimento di Neuroscienze "Rita Levi Montalcini"'
          });
          showToast('Accesso effettuato come Prof. Marco Bianchi!', 'success');
          navigateTo('#/candidatura');
        });
      }
      return;
    }

    // SE L'UTENTE È LOGGATO: MOSTRA IL MODULO COMPLETO
    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/home">Home</a> &rsaquo; <a href="#/proponi">Proponi progetto</a> &rsaquo; <span>Modulo di Candidatura</span>
          </div>
          <div class="user-greeting-pill">
            <span class="user-avatar-circle">👤</span>
            <span>Connesso come <strong>${esc(currentUser.name)}</strong> (${esc(currentUser.department || 'Università di Torino')})</span>
            <button type="button" class="btn-text-logout" id="btnLogoutInForm">Esci dall'account</button>
          </div>
          <span class="section-pre-title">FASE 2 • INVIO DELLA PROPOSTA AL COMITATO</span>
          <h1 class="page-main-heading">Modulo di candidatura del progetto</h1>
          <p class="page-intro-lead">
            Compila i dettagli scientifici ed economici della tua proposta di crowdfunding. Il Comitato Tecnico-Scientifico di UniTO valuterà la candidatura e ti comunicherà l'esito formale entro <strong>15 giorni lavorativi</strong>.
          </p>
        </div>
      </section>

      <section class="section-application-form">
        <div class="container">
          <!-- [NUOVO] Bozza salvata automaticamente: chiudendo la pagina o premendo "Annulla" il lavoro non va perso
               (A1, euristica 3: nel form di IdeaGinger tornando indietro si perdevano tutti i dati). -->
          <div class="draft-status-bar" id="draftStatusBar" aria-live="polite">
            <span id="draftStatusText">Le modifiche vengono salvate automaticamente come bozza in questo browser.</span>
            <button type="button" class="btn-text-logout" id="btnClearDraft" hidden>Ricomincia da zero</button>
          </div>
          <form id="projectProposalForm" class="comprehensive-proposal-form">

            <!-- SEZIONE 1: DATI DEL PROPONENTE -->
            <fieldset class="form-section-fieldset">
              <legend class="fieldset-legend">
                <span class="step-circle">1</span>
                <span>Dati del Responsabile Scientifico / Proponente</span>
              </legend>

              <div class="form-grid-two-cols">
                <div class="form-group">
                  <label for="propName">Nome e Cognome Proponente <span class="required">*</span></label>
                  <input type="text" id="propName" required class="form-control" autocomplete="name" value="${esc(currentUser.name)}">
                </div>

                <div class="form-group">
                  <label for="propEmail">Email del referente <span class="required">*</span></label>
                  <input type="email" id="propEmail" required class="form-control" autocomplete="email" value="${esc(currentUser.email)}">
                </div>

                <div class="form-group">
                  <label for="propDepartment">Dipartimento UniTO di Afferenza <span class="required">*</span></label>
                  <select id="propDepartment" required class="form-control">
                    <option value="Dipartimento di Neuroscienze" ${currentUser.department && currentUser.department.includes('Neuroscienze') ? 'selected' : ''}>Dipartimento di Neuroscienze "Rita Levi Montalcini"</option>
                    <option value="Dipartimento di Scienze della Vita e Biologia dei Sistemi">Dipartimento di Scienze della Vita e Biologia dei Sistemi</option>
                    <option value="Dipartimento di Studi Storici">Dipartimento di Studi Storici</option>
                    <option value="Dipartimento di Fisica">Dipartimento di Fisica</option>
                    <option value="Dipartimento di Informatica">Dipartimento di Informatica</option>
                    <option value="DISAFA">Dipartimento di Scienze Agrarie, Forestali e Alimentari (DISAFA)</option>
                    <option value="Dipartimento di Culture, Politica e Società">Dipartimento di Culture, Politica e Società</option>
                    <option value="Altro">Altro Dipartimento</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="propRole">Qualifica Accademica <span class="required">*</span></label>
                  <select id="propRole" required class="form-control">
                    <option value="Professore Associato" selected>Professore Associato</option>
                    <option value="Professore Ordinario">Professore Ordinario</option>
                    <option value="Ricercatore a Tempo Determinato">Ricercatore a Tempo Determinato</option>
                    <option value="Assegnista di Ricerca">Assegnista di Ricerca</option>
                    <option value="Dottorando">Dottorando con nulla osta tutor</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <!-- SEZIONE 2: LA PROPOSTA SCIENTIFICA -->
            <fieldset class="form-section-fieldset">
              <legend class="fieldset-legend">
                <span class="step-circle">2</span>
                <span>Descrizione del Progetto di Ricerca</span>
              </legend>

              <div class="form-group form-full">
                <label for="propTitle">Titolo della Campagna di Ricerca <span class="required">*</span></label>
                <input type="text" id="propTitle" required minlength="10" maxlength="90" class="form-control" placeholder="Es. BioSensor: Monitoraggio della qualità dell'aria con piante sentinella">
                <small class="form-hint">Scegli un titolo breve, chiaro e accattivante per il pubblico non specialistico.</small>
              </div>

              <div class="form-grid-two-cols">
                <div class="form-group">
                  <label for="propCategory">Ambito Tematico di Ricerca <span class="required">*</span></label>
                  <!-- [REVISIONE] Le aree del modulo non coincidevano con quelle del catalogo (c'era anche
                       "Scienze Sociali" che nel sito non esiste): ora vengono da CATEGORIES. -->
                  <select id="propCategory" required class="form-control">
                    <option value="">-- Seleziona l'area --</option>
                    ${CATEGORIES.map(c => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label for="propDuration">Durata prevista della Campagna Online</label>
                  <select id="propDuration" class="form-control">
                    <option value="30">30 giorni (Consigliata per campagne focalizzate)</option>
                    <option value="45" selected>45 giorni (Standard di Ateneo)</option>
                    <option value="60">60 giorni (Per progetti ad alta complessità)</option>
                  </select>
                </div>
              </div>

              <div class="form-group form-full">
                <label for="propAbstract">Abstract divulgativo (da 200 a 1.500 caratteri) <span class="required">*</span></label>
                <!-- [REVISIONE] Il limite di 1.500 caratteri era solo scritto nell'etichetta: ora c'è maxlength + contatore. -->
                <textarea id="propAbstract" required minlength="200" maxlength="1500" class="form-control" rows="5" placeholder="Spiega in parole semplici: qual è il problema affrontato? Come risolverà la situazione questo progetto? Perché i cittadini dovrebbero donare?"></textarea>
              </div>

              <div class="form-group form-full">
                <label for="propImpact">Impatto sul Territorio e Terza Missione <span class="required">*</span></label>
                <textarea id="propImpact" required minlength="50" maxlength="800" class="form-control" rows="3" placeholder="Quali ricadute concrete avrà la ricerca sulla cittadinanza piemontese e sulla società?"></textarea>
              </div>
            </fieldset>

            <!-- SEZIONE 3: PIANO ECONOMICO & RADDOPPIO -->
            <fieldset class="form-section-fieldset">
              <legend class="fieldset-legend">
                <span class="step-circle">3</span>
                <span>Budget Economico & Richiesta Raddoppio UniTO</span>
              </legend>

              <div class="form-grid-two-cols">
                <div class="form-group">
                  <label for="propTargetAmount">Traguardo della Raccolta Donatori (€) <span class="required">*</span></label>
                  <input type="number" id="propTargetAmount" required class="form-control" min="2000" max="50000" step="500" value="8000" data-msg-min="L'obiettivo minimo è 2.000 €." data-msg-max="Per obiettivi oltre 50.000 € richiedi il Pacchetto Personalizzato.">
                  <small class="form-hint">Cifra che verrà raccolta presso sostenitori privati e cittadini.</small>
                </div>

                <div class="form-group">
                  <label for="propMatchingAmount">Cofinanziamento Richiesto a UniTO (€)</label>
                  <input type="text" id="propMatchingAmount" readonly tabindex="-1" class="form-control readonly-input" value="€ 8.000 (raddoppio completo)">
                  <small class="form-hint">L'Ateneo raddoppia i fondi fino a un tetto massimo di 10.000 €.</small>
                </div>
              </div>

              <div class="form-group form-full">
                <label for="propBudgetPlan">Sintesi delle Principali Voci di Spesa <span class="required">*</span></label>
                <textarea id="propBudgetPlan" required minlength="30" maxlength="800" class="form-control" rows="3" placeholder="Es. Strumentazione e reagenti di laboratorio: 4.000 €; Borsa di ricerca studente: 4.000 €; Materiali di divulgazione ed eventi con le scuole: 2.000 €"></textarea>
              </div>
            </fieldset>

            <!-- SEZIONE 4: PACCHETTO DI SERVIZI SELEZIONATO -->
            <fieldset class="form-section-fieldset">
              <legend class="fieldset-legend">
                <span class="step-circle">4</span>
                <span>Scelta Pacchetto di Accompagnamento & Trasparenza</span>
              </legend>

              <div class="package-selection-radios">
                <label class="package-radio-card ${preselectedPackage === 'base' ? 'selected' : ''}">
                  <input type="radio" name="selectedPackage" value="base" ${preselectedPackage === 'base' ? 'checked' : ''}>
                  <div>
                    <strong>Pacchetto Base (350 € + IVA)</strong>
                    <p>1 Incontro kick-off con Campaign Manager, revisione testi e guida alle ricompense.</p>
                  </div>
                </label>

                <label class="package-radio-card ${preselectedPackage === 'avanzato' ? 'selected' : ''}">
                  <input type="radio" name="selectedPackage" value="avanzato" ${preselectedPackage === 'avanzato' ? 'checked' : ''}>
                  <div>
                    <strong>Pacchetto Avanzato (650 € + IVA - Consigliato)</strong>
                    <p>3 Incontri dedicati, kit grafico completo UniTO, piano editoriale social e supporto stampa.</p>
                  </div>
                </label>

                <label class="package-radio-card ${preselectedPackage === 'custom' ? 'selected' : ''}">
                  <input type="radio" name="selectedPackage" value="custom" ${preselectedPackage === 'custom' ? 'checked' : ''}>
                  <div>
                    <strong>Pacchetto Personalizzato (Su preventivo)</strong>
                    <p>Troupe video in laboratorio, sponsor privati e public engagement avanzato.</p>
                  </div>
                </label>
              </div>

              <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                Hai bisogno di dettagli sui servizi? <a href="#/pacchetti" class="text-link" target="_blank" rel="noopener">Rivedi la tabella comparativa dei pacchetti &nearr;<span class="sr-only"> (si apre in una nuova scheda)</span></a>
              </div>
            </fieldset>

            <!-- SEZIONE 5: CONFERMA E INVIO -->
            <div class="form-confirm-box">
              <label class="checkbox-label">
                <input type="checkbox" required id="propAcceptTerms" data-msg-required="Per inviare la proposta devi confermare di aver letto il bando e di averla condivisa con il Direttore del Dipartimento.">
                <span>Dichiaro di aver preso visione del bando di Ateneo <strong>"Lasci o Raddoppi"</strong> e confermo che la proposta è stata condivisa con il Direttore del Dipartimento promotore.</span>
              </label>

              <div class="form-submit-row">
                <button type="submit" class="btn btn-green-submit btn-lg" id="btnSubmitProposal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Invia la tua proposta al Comitato UniTO
                </button>
                <a href="#/proponi" class="btn btn-ghost">Annulla (la bozza resta salvata)</a>
              </div>
            </div>
          </form>
        </div>
      </section>
    `;

    // Calcolo reattivo della quota raddoppio
    const targetInput = container.querySelector('#propTargetAmount');
    const matchingOutput = container.querySelector('#propMatchingAmount');
    function updateMatching() {
      const val = parseFloat(targetInput.value) || 0;
      const matching = Math.min(val, MATCHING_CAP);
      matchingOutput.value = val <= 0
        ? '—'
        : `${fmtEur(matching)} (${matching === val ? 'raddoppio completo' : 'tetto massimo: l\'Ateneo copre il ' + Math.round(matching / val * 100) + '%'})`;
    }
    if (targetInput && matchingOutput) {
      targetInput.addEventListener('input', updateMatching);
    }

    // [NUOVO] Bozza automatica in localStorage
    const form = container.querySelector('#projectProposalForm');
    const draftFields = ['propDepartment', 'propRole', 'propTitle', 'propCategory', 'propDuration', 'propAbstract', 'propImpact', 'propTargetAmount', 'propBudgetPlan'];
    const draftText = container.querySelector('#draftStatusText');
    const clearDraftBtn = container.querySelector('#btnClearDraft');
    const savedDraft = readJSON(PROPOSAL_DRAFT_KEY, null);
    if (savedDraft && savedDraft.values) {
      draftFields.forEach(id => {
        const el = container.querySelector('#' + id);
        if (el && savedDraft.values[id] !== undefined) el.value = savedDraft.values[id];
      });
      if (savedDraft.package) {
        const radio = container.querySelector(`input[name="selectedPackage"][value="${savedDraft.package}"]`);
        if (radio && !params.get('package')) radio.checked = true;
      }
      draftText.textContent = `Abbiamo ripristinato la bozza salvata il ${savedDraft.savedAt}.`;
      clearDraftBtn.hidden = false;
    }
    updateMatching();
    ['propAbstract', 'propImpact', 'propBudgetPlan', 'propTitle'].forEach(id => attachCounter(container.querySelector('#' + id)));

    let draftTimer = null;
    form.addEventListener('input', () => {
      clearTimeout(draftTimer);
      draftTimer = setTimeout(() => {
        const values = {};
        draftFields.forEach(id => { const el = container.querySelector('#' + id); if (el) values[id] = el.value; });
        const pkg = container.querySelector('input[name="selectedPackage"]:checked');
        const now = new Date();
        const savedAt = now.toLocaleDateString('it-IT') + ' alle ' + now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        writeJSON(PROPOSAL_DRAFT_KEY, { values, package: pkg ? pkg.value : null, savedAt });
        draftText.textContent = `Bozza salvata automaticamente alle ${now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}.`;
        clearDraftBtn.hidden = false;
      }, 600);
    });
    onLeavePage(() => clearTimeout(draftTimer));
    clearDraftBtn.addEventListener('click', () => {
      writeJSON(PROPOSAL_DRAFT_KEY, null);
      showToast('Bozza eliminata: il modulo è stato svuotato.', 'info');
      renderCandidatura(container, params);
    });

    // Radio selection card active state
    // [REVISIONE] Lo stato "selected" si aggiornava solo al click del mouse: con la tastiera (frecce)
    // la card evidenziata non corrispondeva al radio selezionato. → ora segue l'evento "change".
    const radioCards = container.querySelectorAll('.package-radio-card');
    function syncPackageCards() {
      radioCards.forEach(c => c.classList.toggle('selected', c.querySelector('input').checked));
    }
    radioCards.forEach(card => card.querySelector('input').addEventListener('change', syncPackageCards));
    syncPackageCards();

    // Logout rapido nel form
    const logoutBtn = container.querySelector('#btnLogoutInForm');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        setCurrentUser(null);
        showToast('Disconnessione effettuata.', 'info');
        navigateTo('#/proponi');
      });
    }

    // Submit del form
    // [REVISIONE] Prima: fumetti nativi del browser (spariscono) e nessun controllo su lunghezze/email.
    enhanceForm(form, {
      onValid: () => {
        const title = container.querySelector('#propTitle').value.trim();
        const target = container.querySelector('#propTargetAmount').value;
        const selectedPkg = container.querySelector('input[name="selectedPackage"]:checked')?.value || 'avanzato';

        const protocolNumber = 'UNITO-CROWD-2026-' + Math.floor(10000 + Math.random() * 90000);

        // Salva la proposta nel localStorage
        const proposals = readJSON(SUBMITTED_STORAGE_KEY, []);
        proposals.unshift({
          protocol: protocolNumber,
          title,
          proponent: currentUser.name,
          email: currentUser.email,
          department: container.querySelector('#propDepartment').value,
          targetAmount: target,
          package: selectedPkg,
          submittedAt: new Date().toLocaleDateString('it-IT'),
          status: 'In valutazione (esito entro 15 giorni lavorativi)'
        });
        writeJSON(SUBMITTED_STORAGE_KEY, proposals);
        writeJSON(PROPOSAL_DRAFT_KEY, null);

        // Schermata di successo
        container.innerHTML = `
          <section class="inner-page-hero">
            <div class="container">
              <div class="submission-success-card">
                <div class="success-checkmark-circle">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span class="badge-success-tag">CANDIDATURA TRASMESSA</span>
                <h1 class="success-title">Proposta inviata al Comitato Scientifico UniTO</h1>
                <p class="success-lead">
                  La proposta di ricerca <strong>"${esc(title)}"</strong> è stata acquisita con il protocollo:
                </p>
                <div class="protocol-box">
                  <span class="protocol-label">Numero di protocollo:</span>
                  <strong class="protocol-code">${protocolNumber}</strong>
                </div>

                <div class="success-next-steps">
                  <h2>Cosa succederà adesso?</h2>
                  <div class="next-steps-list">
                    <div class="step-item">
                      <strong>1. Valutazione accademica:</strong> il comitato esaminerà la fattibilità entro <strong>15 giorni lavorativi</strong> (indicativamente entro il ${dateInDays(21)}).
                    </div>
                    <div class="step-item">
                      <strong>2. Riscontro via email:</strong> riceverai la comunicazione formale all'indirizzo istituzionale <em>${esc(currentUser.email)}</em>.
                    </div>
                    <div class="step-item">
                      <strong>3. Assegnazione del Campaign Manager:</strong> in caso di esito positivo verrai contattato per avviare la Fase 3 con il pacchetto scelto (${esc(selectedPkg.toUpperCase())}).
                    </div>
                  </div>
                </div>

                <div class="success-actions">
                  <a href="#/profilo" class="btn btn-primary-burgundy btn-lg">Visualizza le mie candidature</a>
                  <a href="#/home" class="btn btn-secondary-outline btn-lg">Torna alla Home</a>
                </div>
              </div>
            </div>
          </section>
        `;
        document.title = 'Proposta inviata | CrowdUniTO';
        window.scrollTo(0, 0);
        const h1 = container.querySelector('h1');
        if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
      }
    });
  }
  /**
   * PAGINA 6: CERCA PROGETTI (Catalogo con ricerca live e filtri)
   * [REVISIONE] Modifiche principali:
   *  - il filtro "Stato" partiva da "Campagne in corso", ma il menu "Tutte le aree (6)" e il titolo
   *    promettevano tutte le campagne "attive e concluse": con 6 annunciate se ne vedevano 5. → default "Tutti gli stati";
   *  - il valore cercato veniva inserito nell'attributo value senza escape (una " rompeva la pagina);
   *  - la ricerca trovava solo progetti: A1 (euristica 7) chiedeva una ricerca globale anche su
   *    "costi", "FAQ", ecc. → ora mostra anche i risultati nelle FAQ e nelle pagine informative;
   *  - l'URL resta sincronizzato con la ricerca (si può condividere / tornare indietro).
   */
  const INFO_PAGES = [
    { href: '#/come-funziona', title: 'Come funziona la donazione', text: 'donare donazione pagamento carta paypal bonifico satispay ricevuta raddoppio cofinanziamento tutto o niente rimborso commissioni sicurezza dati' },
    { href: '#/proponi', title: 'Proponi un progetto: il percorso in 4 fasi', text: 'proporre candidatura ricercatore docente fasi requisiti chi può valutazione comitato costi quota' },
    { href: '#/formazione', title: 'Formazione e calendario per ricercatori', text: 'formazione corso calendario iscrizione moduli edizione storytelling video' },
    { href: '#/pacchetti', title: 'Pacchetti di servizi: Base, Avanzato, Personalizzato', text: 'pacchetti costi prezzo 350 iva servizi campaign manager video grafica preventivo' },
    { href: '#/assistenza', title: 'Assistenza e contatti', text: 'assistenza contatti aiuto ticket richiesta email problema supporto cancellazione dati privacy' },
    { href: '#/faq', title: 'Domande frequenti (FAQ)', text: 'faq domande frequenti risposte' }
  ];

  function normalizeText(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/<[^>]+>/g, ' ');
  }

  /** Cerca nelle FAQ e nelle pagine informative: restituisce i risultati ordinati per pertinenza */
  function searchInfo(query) {
    const terms = normalizeText(query).split(/\s+/).filter(t => t.length >= 3);
    if (!terms.length) return [];
    const score = text => terms.reduce((acc, t) => acc + (normalizeText(text).includes(t) ? 1 : 0), 0);
    const faq = FAQ_ITEMS.map(f => ({
      href: `#/faq?apri=${f.id}`,
      title: f.q,
      meta: `FAQ ${f.audience === 'sostenitori' ? 'per chi sostiene' : 'per i ricercatori'} · ${f.group}`,
      score: score(f.q) * 2 + score(f.a)
    }));
    const pages = INFO_PAGES.map(pg => ({ href: pg.href, title: pg.title, meta: 'Pagina informativa', score: score(pg.title) * 2 + score(pg.text) }));
    return faq.concat(pages).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);
  }

  function renderCerca(container, params) {
    const initialQuery = params.get('q') || '';
    const initialCategory = params.get('cat') || 'all';
    const initialCatLabel = initialCategory !== 'all' ? catLabel(initialCategory) : '';

    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          ${breadcrumb(initialCatLabel
            ? [{ href: '#/home', label: 'Home' }, { href: '#/cerca', label: 'Cerca progetti' }, { label: initialCatLabel }]
            : [{ href: '#/home', label: 'Home' }, { label: 'Cerca progetti' }])}
          <span class="section-pre-title">CATALOGO DELLA RICERCA</span>
          <h1 class="page-main-heading">Cerca le campagne di ricerca UniTO</h1>
          <p class="page-intro-lead">
            Esplora tutte le campagne di crowdfunding, aperte e concluse, dei dipartimenti dell'Università degli Studi di Torino.
          </p>
        </div>
      </section>

      <section class="section-search-workspace">
        <div class="container">
          <!-- Barra dei Filtri e Ricerca Live -->
          <div class="search-filter-controls-card">
            <div class="search-field-large">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <label for="catalogSearchInput" class="sr-only">Cerca progetti</label>
              <input type="search" id="catalogSearchInput" placeholder="Cerca per titolo, docente, dipartimento o parola chiave..." value="${esc(initialQuery)}">
            </div>

            <div class="filter-dropdowns-row">
              <div class="dropdown-item">
                <label for="filterCategorySelect">Area disciplinare:</label>
                <select id="filterCategorySelect" class="form-control-sm">
                  <option value="all" ${initialCategory === 'all' ? 'selected' : ''}>Tutte le aree (${MOCK_PROJECTS.length})</option>
                  ${CATEGORIES.map(c => `<option value="${c.id}" ${initialCategory === c.id ? 'selected' : ''}>${esc(c.label)} (${MOCK_PROJECTS.filter(p => p.category === c.id).length})</option>`).join('')}
                </select>
              </div>

              <div class="dropdown-item">
                <label for="filterStatusSelect">Stato della raccolta:</label>
                <select id="filterStatusSelect" class="form-control-sm">
                  <option value="all" selected>Tutti gli stati</option>
                  <option value="active">Campagne in corso</option>
                  <option value="funded">Obiettivo raggiunto e raddoppiato</option>
                </select>
              </div>

              <div class="dropdown-item">
                <label for="sortSelect">Ordina per:</label>
                <select id="sortSelect" class="form-control-sm">
                  <option value="featured">In evidenza (aperte prima)</option>
                  <option value="percentage">Più vicini al 100%</option>
                  <option value="collected">Fondi raccolti</option>
                  <option value="days">Scadenza più vicina</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Conteggio Risultati -->
          <div class="results-header-bar">
            <span id="resultsCountNotice" aria-live="polite">Visualizzazione progetti...</span>
          </div>

          <!-- Griglia Risultati -->
          <div class="projects-flex-grid" id="catalogGrid"></div>

          <!-- [NUOVO] Risultati nelle pagine informative e nelle FAQ -->
          <div id="infoResults"></div>
        </div>
      </section>

      <!-- Fascia blu finale -->
      ${renderBlueProposalBanner()}
    `;

    const searchInput = container.querySelector('#catalogSearchInput');
    const categorySelect = container.querySelector('#filterCategorySelect');
    const statusSelect = container.querySelector('#filterStatusSelect');
    const sortSelect = container.querySelector('#sortSelect');
    const grid = container.querySelector('#catalogGrid');
    const countNotice = container.querySelector('#resultsCountNotice');
    const infoBox = container.querySelector('#infoResults');

    function syncUrl(q, cat) {
      const qs = new URLSearchParams();
      if (q) qs.set('q', q);
      if (cat && cat !== 'all') qs.set('cat', cat);
      const target = '#/cerca' + (qs.toString() ? '?' + qs.toString() : '');
      try { history.replaceState(null, '', target); } catch (e) { /* file:// in alcuni browser */ }
    }

    function updateCatalog() {
      const rawQ = searchInput.value.trim();
      const q = normalizeText(rawQ);
      const cat = categorySelect.value || 'all';
      const status = statusSelect.value || 'all';
      const sort = sortSelect.value || 'featured';
      syncUrl(rawQ, cat);

      let filtered = MOCK_PROJECTS.filter(p => {
        const haystack = normalizeText([p.title, p.department, p.proponent, p.excerpt, catLabel(p.category), (p.team || []).map(t => t.name).join(' ')].join(' '));
        const matchesQuery = !q || q.split(/\s+/).every(term => haystack.includes(term));
        const matchesCat = cat === 'all' || p.category === cat;
        const isOpen = getProjectStats(p).isOpen;
        const matchesStatus = status === 'all' || (status === 'active' ? isOpen : !isOpen);
        return matchesQuery && matchesCat && matchesStatus;
      });

      // Ordinamento
      if (sort === 'percentage') {
        filtered.sort((a, b) => getProjectStats(b).percentage - getProjectStats(a).percentage);
      } else if (sort === 'collected') {
        filtered.sort((a, b) => getProjectStats(b).collected - getProjectStats(a).collected);
      } else if (sort === 'days') {
        // Le campagne concluse (0 giorni) vanno in fondo, non in cima
        filtered.sort((a, b) => (a.daysLeft || 999) - (b.daysLeft || 999));
      } else {
        filtered = featuredOrder(filtered);
      }

      countNotice.textContent = filtered.length === 1
        ? 'Trovato 1 progetto.'
        : `Trovati ${filtered.length} progetti${rawQ ? ` per «${rawQ}»` : ''}.`;

      const info = rawQ ? searchInfo(rawQ) : [];

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="empty-results-box" style="grid-column: 1 / -1;">
            <p>Nessun progetto corrisponde a questi criteri.${info.length ? ' Abbiamo però trovato delle risposte nelle FAQ e nelle pagine informative, qui sotto.' : ''}</p>
            <button type="button" class="btn btn-outline-burgundy btn-sm" id="btnResetFilters">Reimposta la ricerca e i filtri</button>
          </div>
        `;
        grid.querySelector('#btnResetFilters').addEventListener('click', () => {
          searchInput.value = '';
          categorySelect.value = 'all';
          statusSelect.value = 'all';
          sortSelect.value = 'featured';
          updateCatalog();
          searchInput.focus();
        });
      } else {
        grid.innerHTML = filtered.map(p => renderProjectCard(p)).join('');
      }

      infoBox.innerHTML = info.length ? `
        <section class="info-results-box" aria-labelledby="infoResultsTitle">
          <h2 id="infoResultsTitle">Nelle FAQ e nelle pagine informative (${info.length})</h2>
          <ul>
            ${info.map(r => `<li><a href="${r.href}">${esc(r.title)}</a><small>${esc(r.meta)}</small></li>`).join('')}
          </ul>
        </section>
      ` : '';
    }

    let typingTimer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(updateCatalog, 200);
    });
    onLeavePage(() => clearTimeout(typingTimer));
    categorySelect.addEventListener('change', updateCatalog);
    statusSelect.addEventListener('change', updateCatalog);
    sortSelect.addEventListener('change', updateCatalog);

    updateCatalog();
  }
  /**
   * PAGINA 7: SCHEDA DETTAGLIO PROGETTO (es. #/progetto/p1)
   * [REVISIONE] Riscritta. Problemi della versione precedente:
   *  - i badge "Medicina & Salute" e "Matching Fund 2x" riusavano la classe delle card (position:absolute)
   *    e finivano sopra la barra istituzionale, ai due angoli della pagina;
   *  - nessun modo di contattare il team (A1, euristica 10, severità 4: nel progetto RePatch la sezione
   *    "Contattami" non aveva recapiti) → nuova sezione "Domande al team" con modulo e email;
   *  - non si capiva chi propone il progetto oltre al nome del responsabile → sezione "Il team";
   *  - nessun aggiornamento per chi ha già donato (percorso "Seguire un progetto già sostenuto");
   *  - testo tecnico senza spiegazioni (A1, euristica 2) → riquadro "In parole semplici";
   *  - indice cliccabile delle sezioni (A1, analisi mobile: testo in un unico blocco lunghissimo);
   *  - le ricompense limitate non dicevano quanti posti restano (A1, euristica 1: "Disponibilità" ambigua);
   *  - si poteva "donare" anche al progetto concluso BioSensor (prevenzione dell'errore);
   *  - "Dona" apriva una finestra modale senza gestione di tastiera/Esc, con un unico campo "Nome e Cognome"
   *    (A1, euristica 5) e senza riepilogo → sostituita dal percorso guidato #/sostieni/... in 4 passi.
   */
  function renderProgetto(container, p) {
    const s = getProjectStats(p);
    const team = p.team || [];
    const updates = p.updates || [];
    const questions = p.answeredQuestions || [];
    const myConfirmed = s.myDonations.filter(d => d.status === 'confermata');
    const myPending = s.myDonations.filter(d => d.status === 'in_attesa_bonifico');

    const sections = [
      { id: 'sez-progetto', label: 'Il progetto' },
      { id: 'sez-fondi', label: 'Come useremo i fondi' },
      { id: 'sez-team', label: 'Il team' },
      { id: 'sez-ricompense', label: 'Ricompense' },
      { id: 'sez-aggiornamenti', label: `Aggiornamenti (${updates.length})` },
      { id: 'sez-domande', label: 'Domande al team' }
    ];

    const myBanner = (myConfirmed.length || myPending.length) ? `
      <div class="my-support-banner ${myPending.length ? 'pending' : ''}" role="status">
        ${myConfirmed.length ? `<p><strong>Hai sostenuto questo progetto</strong> il ${esc(myConfirmed[myConfirmed.length - 1].dateLabel)} con ${fmtEur(myConfirmed.reduce((a, d) => a + d.amount, 0))}. Grazie! Trovi le novità nella sezione <a href="#sez-aggiornamenti">Aggiornamenti</a>.</p>` : ''}
        ${myPending.map(d => `<p><strong>Donazione di ${fmtEur(d.amount)} in attesa del bonifico.</strong> Verrà conteggiata quando arriva il pagamento. <a href="#/conferma/${d.id}">Vedi IBAN, causale e scadenza</a></p>`).join('')}
      </div>
    ` : '';

    const donatePanel = s.isOpen ? `
      <div class="detail-donate-panel" id="donatePanel">
        <div class="panel-circle-row">
          ${renderPercentageCircle(s.percentage, 90)}
          <div>
            <div class="panel-gathered-amount">${fmtEur(s.collected)}</div>
            <div class="panel-target-sub">raccolti sull'obiettivo di <strong>${fmtEur(p.target)}</strong></div>
          </div>
        </div>

        <div class="panel-status-pills-row">
          <div class="status-box">
            <strong>${s.supporters}</strong>
            <small>sostenitori</small>
          </div>
          <div class="status-box">
            <strong>${p.daysLeft}</strong>
            <small>giorni rimasti</small>
          </div>
          <div class="status-box highlight">
            <strong>${s.reachedGoal ? '✓' : fmtEur(s.missing)}</strong>
            <small>${s.reachedGoal ? 'obiettivo raggiunto' : 'mancano'}</small>
          </div>
        </div>

        <!-- [REVISIONE] Il testo diceva che l'Ateneo versa "ulteriori € 10.000 raddoppiando il valore di ogni
             donazione" senza condizioni: ora spiega quando scatta il raddoppio e cosa succede se non scatta. -->
        <div class="panel-matching-explanation">
          ${s.reachedGoal
            ? `<strong>Obiettivo raggiunto.</strong> Alla scadenza l'Università aggiungerà <strong>${fmtEur(s.matching)}</strong>. Puoi ancora donare: i fondi in più restano al progetto.`
            : `<strong>Lasci o Raddoppi:</strong> se i ${fmtEur(s.missing)} che mancano arrivano entro ${p.daysLeft} giorni, l'Università aggiunge <strong>${fmtEur(s.matching)}</strong>. Altrimenti tutte le donazioni vengono rimborsate.`}
        </div>

        <div class="panel-cta-row">
          <a href="#/sostieni/${p.id}" class="btn btn-green-cta btn-block" id="btnSostieni">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            Sostieni il progetto
          </a>
          <a href="#sez-domande" class="btn btn-ghost btn-block btn-sm">Hai un dubbio? Scrivi al team</a>
        </div>

        <ul class="panel-reassurance-list">
          <li>Non serve registrarsi</li>
          <li>Carta, PayPal o bonifico</li>
          <li>Ricevuta per la deduzione fiscale via email</li>
        </ul>
      </div>
    ` : `
      <div class="detail-donate-panel concluded" id="donatePanel">
        <div class="panel-circle-row">
          ${renderPercentageCircle(s.percentage, 90)}
          <div>
            <div class="panel-gathered-amount">${fmtEur(s.collected)}</div>
            <div class="panel-target-sub">raccolti sull'obiettivo di <strong>${fmtEur(p.target)}</strong></div>
          </div>
        </div>
        <div class="panel-status-pills-row">
          <div class="status-box">
            <strong>${s.supporters}</strong>
            <small>sostenitori</small>
          </div>
          <div class="status-box">
            <strong>Conclusa</strong>
            <small>il ${esc(p.closedOn || '')}</small>
          </div>
          <div class="status-box highlight">
            <strong>2x</strong>
            <small>raddoppio ottenuto</small>
          </div>
        </div>
        <div class="panel-success-explanation">
          <strong>Obiettivo raggiunto!</strong> L'Università ha aggiunto ${fmtEur(s.matching)}: in totale <strong>${fmtEur(s.collected + s.matching)}</strong> per la ricerca.
        </div>
        <p class="panel-closed-note">La raccolta è chiusa: non è più possibile donare a questo progetto.</p>
        <div class="panel-cta-row">
          <a href="#/cerca" class="btn btn-secondary-outline btn-block">Scopri le campagne ancora aperte</a>
          <a href="#sez-aggiornamenti" class="btn btn-ghost btn-block btn-sm">Leggi come stanno usando i fondi</a>
        </div>
      </div>
    `;

    const rewardsHtml = p.rewards.map((r, i) => {
      const left = rewardRemaining(p, r);
      const soldOut = left === 0;
      const usedPct = r.limit ? Math.round(((r.limit - left) / r.limit) * 100) : 0;
      return `
        <div class="reward-selection-card ${soldOut ? 'sold-out' : ''}">
          <div class="reward-top-row">
            <span class="reward-pledge-badge">${fmtEur(r.amount)} o più</span>
            ${r.shipping ? '<span class="reward-ship-tag">Spedizione inclusa</span>' : ''}
          </div>
          <h3 class="reward-card-title">${esc(r.title)}</h3>
          <p class="reward-card-desc">${esc(r.desc)}</p>
          ${r.limit ? `
            <div class="reward-availability ${left <= 5 ? 'low' : ''}">
              <div class="reward-avail-bar" aria-hidden="true"><span style="width:${usedPct}%"></span></div>
              <span>${soldOut ? `Esaurita: tutti i ${r.limit} posti sono stati presi` : `Ne restano <strong>${left} su ${r.limit}</strong>`}</span>
            </div>
          ` : '<div class="reward-availability"><span>Disponibilità illimitata</span></div>'}
          ${s.isOpen
            ? (soldOut
              ? '<button type="button" class="btn btn-sm btn-block btn-disabled-look" disabled>Ricompensa esaurita</button>'
              : `<a href="#/sostieni/${p.id}?ricompensa=${i}" class="btn btn-outline-burgundy btn-sm btn-block">Scegli questa ricompensa</a>`)
            : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <section class="project-detail-hero">
        <div class="container">
          ${breadcrumb([
            { href: '#/home', label: 'Home' },
            { href: '#/cerca', label: 'Cerca progetti' },
            { href: `#/cerca?cat=${p.category}`, label: catLabel(p.category) },
            { label: p.title.split(':')[0] }
          ])}

          <div class="project-detail-header-grid">
            <!-- Colonna Sinistra: Titolo e Dati -->
            <div>
              <!-- [REVISIONE] Il tag dell'area ora è un link al catalogo filtrato (A1, euristica 4:
                   in RePatch i tag funzionavano, i badge Agenda 2030 no). -->
              <div class="detail-badges">
                <a href="#/cerca?cat=${p.category}" class="badge-cat-tag badge-link" title="Vedi tutti i progetti di quest'area">${esc(catLabel(p.category))}</a>
                ${p.matchingActive ? `
                  <span class="badge-match-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    Cofinanziamento UniTO attivo
                  </span>
                ` : ''}
              </div>

              <h1 class="project-detail-title">${esc(p.title)}</h1>

              <div class="project-proponent-bar">
                <span class="unito-verified-check" aria-hidden="true">✓</span>
                <span>Responsabile scientifico: <strong>${esc(p.proponent)}</strong></span>
                <span class="separator" aria-hidden="true">•</span>
                <span>${esc(p.department)}</span>
              </div>

              <p class="project-detail-lead">${esc(p.excerpt)}</p>
              ${myBanner}
            </div>

            <!-- Colonna Destra: Box Donazione & Cerchio di Percentuale -->
            ${donatePanel}
          </div>
        </div>
      </section>

      <!-- [NUOVO] Indice cliccabile delle sezioni -->
      <nav class="project-section-nav" aria-label="Sezioni della scheda progetto">
        <div class="container">
          <ul>
            ${sections.map(sec => `<li><a href="#${sec.id}" data-section-link="${sec.id}">${esc(sec.label)}</a></li>`).join('')}
          </ul>
        </div>
      </nav>

      <!-- Contenuti Principali Scheda Progetto -->
      <section class="section-detail-body">
        <div class="container detail-content-layout">
          <!-- Colonna Sinistra: Descrizione, Metodologia, Budget -->
          <div class="detail-main-col">
            <div class="rich-text-block" id="sez-progetto">
              <h2>Cos'è il progetto e perché è importante</h2>
              <p>${esc(p.description)}</p>
              <p>
                Il team di ricerca del <strong>${esc(p.department)}</strong> ha sviluppato la metodologia dopo oltre due anni di sperimentazione preliminare. I fondi raccolti tramite CrowdUniTO permetteranno di accelerare la fase applicativa e validare l'impatto sul campo.
              </p>

              <h3>Obiettivo scientifico prioritario</h3>
              <p>${esc(p.scientificGoal)}</p>

              ${p.glossary && p.glossary.length ? `
                <aside class="glossary-box" aria-labelledby="glossary-title-${p.id}">
                  <h3 id="glossary-title-${p.id}">In parole semplici</h3>
                  <dl>
                    ${p.glossary.map(g => `<div><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`).join('')}
                  </dl>
                </aside>
              ` : ''}
            </div>

            <div class="rich-text-block detail-section" id="sez-fondi">
              <h2>Come useremo i fondi</h2>
              <p>Ogni euro raccolto è collegato a una voce di spesa e rendicontato dal Dipartimento.</p>
              <ul class="budget-bars-list">
                ${p.budgetBreakdown.map(item => {
                  const pct = Math.round((item.cost / p.target) * 100);
                  return `
                    <li>
                      <div class="budget-bar-head">
                        <span class="budget-item-name">${esc(item.item)}</span>
                        <strong class="budget-item-cost">${fmtEur(item.cost)} <small>(${pct}%)</small></strong>
                      </div>
                      <div class="budget-bar-track" aria-hidden="true"><span style="width:${pct}%; background:${p.colorAccent};"></span></div>
                    </li>
                  `;
                }).join('')}
                <li class="budget-total-row">
                  <span>Totale dell'obiettivo</span>
                  <strong>${fmtEur(p.target)}</strong>
                </li>
              </ul>
              <p class="budget-matching-note">
                Al raggiungimento dell'obiettivo l'Università aggiunge fino a <strong>${fmtEur(s.matching)}</strong>, che il team userà per ampliare la sperimentazione seguendo lo stesso piano di spesa.
              </p>

              <div class="guarantee-unito-badge-box">
                <div class="badge-icon" aria-hidden="true">🏛️</div>
                <div>
                  <strong>Regola "tutto o niente":</strong> se l'obiettivo non viene raggiunto entro la scadenza, il progetto non riceve nulla e tutte le donazioni vengono rimborsate per intero ai sostenitori.
                </div>
              </div>
            </div>

            <div class="rich-text-block detail-section" id="sez-team">
              <h2>Chi propone il progetto</h2>
              <p>${esc(p.department)} · Università degli Studi di Torino</p>
              <ul class="team-cards-list">
                ${team.map(m => `
                  <li class="team-member-card">
                    <span class="team-avatar" aria-hidden="true" style="background:${p.colorAccent};">${esc(initials(m.name))}</span>
                    <div>
                      <strong>${esc(m.name)}</strong>
                      <small>${esc(m.role)}</small>
                    </div>
                  </li>
                `).join('')}
              </ul>
              <p class="team-verified-note"><span aria-hidden="true">✓</span> Progetto selezionato dal Comitato Tecnico-Scientifico dell'Università di Torino.</p>
            </div>

            <div class="rich-text-block detail-section" id="sez-aggiornamenti">
              <h2>Aggiornamenti dal team</h2>
              ${updates.length ? `
                <ol class="updates-timeline">
                  ${updates.map(u => `
                    <li>
                      <time>${esc(u.date)}</time>
                      <h3>${esc(u.title)}</h3>
                      <p>${esc(u.text)}</p>
                    </li>
                  `).join('')}
                </ol>
              ` : `
                <p class="empty-state-notice">Il team non ha ancora pubblicato aggiornamenti. Chi dona e lascia la propria email riceve ogni nuovo aggiornamento.</p>
              `}
            </div>

            <div class="rich-text-block detail-section" id="sez-domande">
              <h2>Domande al team</h2>
              ${questions.length ? `
                <div class="answered-questions">
                  ${questions.map(q => `
                    <details>
                      <summary>${esc(q.q)}</summary>
                      <p>${esc(q.a)}</p>
                    </details>
                  `).join('')}
                </div>
              ` : ''}
              <div class="ask-team-card" id="askTeamBox">
                <h3>Fai una domanda a ${esc(p.proponent)} e al team</h3>
                <p class="ask-team-sub">Di solito rispondono entro 3 giorni lavorativi. Puoi anche scrivere a <a href="mailto:${esc(p.contactEmail)}">${esc(p.contactEmail)}</a>.</p>
                <form id="askTeamForm" class="styled-form-grid">
                  <div class="form-group">
                    <label for="askName">Nome <span class="required">*</span></label>
                    <input type="text" id="askName" required class="form-control" autocomplete="given-name">
                  </div>
                  <div class="form-group">
                    <label for="askEmail">Email per la risposta <span class="required">*</span></label>
                    <input type="email" id="askEmail" required class="form-control" autocomplete="email" placeholder="nome@email.it">
                  </div>
                  <div class="form-group form-full">
                    <label for="askText">La tua domanda <span class="required">*</span></label>
                    <textarea id="askText" required minlength="10" maxlength="600" rows="3" class="form-control" placeholder="Es. I pazienti di altre regioni potranno partecipare alla sperimentazione?"></textarea>
                  </div>
                  <div class="form-group form-full">
                    <label class="checkbox-label">
                      <input type="checkbox" id="askPublic" checked>
                      <span>Se è utile ad altri, il team può pubblicare la risposta qui (senza il mio nome)</span>
                    </label>
                  </div>
                  <div class="form-group form-full">
                    <button type="submit" class="btn btn-primary-burgundy">Invia la domanda al team</button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Colonna Destra: Ricompense Selezionabili -->
          <aside class="detail-sidebar-col" id="sez-ricompense" aria-labelledby="rewards-title">
            <h2 class="rewards-sidebar-title" id="rewards-title">${s.isOpen ? 'Scegli una ricompensa' : 'Ricompense della campagna'}</h2>
            ${s.isOpen ? '<p class="rewards-sidebar-sub">Le ricompense si ricevono dopo la chiusura, solo se la campagna raggiunge l\'obiettivo.</p>' : ''}
            <div class="rewards-list-stack">
              ${rewardsHtml}

              ${s.isOpen ? `
                <div class="reward-selection-card custom-donate-card">
                  <h3 class="reward-card-title">Dona senza ricompensa</h3>
                  <p class="reward-card-desc">Scegli tu l'importo, a partire da 5 €. Ricevi comunque la ricevuta per la deduzione fiscale.</p>
                  <form id="freeAmountForm" class="free-amount-form">
                    <label for="customPledgeInput" class="sr-only">Importo in euro</label>
                    <div class="input-with-addon">
                      <span aria-hidden="true">€</span>
                      <input type="number" id="customPledgeInput" min="5" step="1" value="30" required class="form-control" data-msg-min="L'importo minimo è 5 €." data-msg-required="Inserisci l'importo che vuoi donare.">
                    </div>
                    <button type="submit" class="btn btn-primary-burgundy btn-sm">Continua</button>
                  </form>
                </div>
              ` : ''}
            </div>
          </aside>
        </div>
      </section>
    `;

    // Importo libero → percorso di donazione
    const freeForm = container.querySelector('#freeAmountForm');
    enhanceForm(freeForm, {
      onValid: () => {
        const val = Math.round(Number(container.querySelector('#customPledgeInput').value));
        navigateTo(`#/sostieni/${p.id}?importo=${val}`);
      }
    });

    // Domanda al team
    const askForm = container.querySelector('#askTeamForm');
    attachCounter(container.querySelector('#askText'));
    enhanceForm(askForm, {
      onValid: () => {
        const name = container.querySelector('#askName').value.trim();
        const email = container.querySelector('#askEmail').value.trim();
        const box = container.querySelector('#askTeamBox');
        box.outerHTML = successPanel(
          'Domanda inviata al team',
          `<p>Grazie ${esc(name)}! ${esc(p.proponent)} e il team risponderanno a <strong>${esc(email)}</strong>, di solito entro 3 giorni lavorativi.</p>`,
          `<a href="#/progetto/${p.id}" class="btn btn-sm btn-outline-burgundy">Fai un'altra domanda</a>`
        );
        const panel = container.querySelector('.inline-success-panel');
        if (panel) panel.focus();
      }
    });

    // [NUOVO] Evidenzia nell'indice la sezione visibile
    const links = [...container.querySelectorAll('[data-section-link]')];
    if ('IntersectionObserver' in window && links.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            links.forEach(l => {
              const on = l.getAttribute('data-section-link') === entry.target.id;
              l.classList.toggle('active', on);
              if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
            });
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(sec => {
        const el = container.querySelector('#' + sec.id);
        if (el) observer.observe(el);
      });
      onLeavePage(() => observer.disconnect());
    }
  }
  /* ==========================================================================
     [NUOVO] PERCORSO DI DONAZIONE IN 4 PASSI (#/sostieni/<id>?passo=1..4)
     È il percorso sviluppato "in profondità" (persona: chi dona per la prima volta).
     Risponde ai problemi del task "Effettuare una donazione" dell'A1:
       - euristica 5 (sev. 2): Nome e Cognome in un unico campo → due campi separati;
       - euristica 5 (sev. 2): campi della carta senza asterisco → tutti marcati e validati;
       - euristica 9 (sev. 3): senza metodo di pagamento si veniva rimandati alla Home → errore accanto
         ai metodi, nessun reindirizzamento, dati conservati;
       - euristica 3 (sev. 3): tornando indietro si perdevano i dati → ogni passo ha un URL proprio
         (funziona anche il tasto Indietro del browser) e i dati restano in sessionStorage;
       - euristica 1 (sev. 3): limite di tempo nascosto → il tempo esiste solo se si sceglie una ricompensa
         limitata, è sempre visibile, si può estendere e alla scadenza non si perde nulla;
       - euristica 1 (sev. 2): conferma del bonifico ambigua → stato "in attesa del bonifico" esplicito;
       - euristica 4 (sev. 2): Satispay presente o assente senza spiegazioni → sempre visibile, con il motivo.
     ========================================================================== */

  const CHECKOUT_STEPS = [
    { n: 1, label: 'Contributo', title: 'Scegli il tuo contributo' },
    { n: 2, label: 'I tuoi dati', title: 'I tuoi dati' },
    { n: 3, label: 'Pagamento', title: 'Come vuoi pagare' },
    { n: 4, label: 'Riepilogo', title: 'Controlla e conferma' }
  ];
  const RESERVATION_MINUTES = 120; // 2 ore limite di tempo sempre attivo per completare la donazione
  const PAY_METHODS = {
    carta: 'Carta di credito o debito',
    paypal: 'PayPal',
    bonifico: 'Bonifico bancario',
    satispay: 'Satispay'
  };
  // I dati della carta restano SOLO in memoria (mai nello storage), come farebbe un sito reale.
  const cardMemory = {};

  function loadCheckout(p) {
    return readJSON(CHECKOUT_PREFIX + p.id, null, true);
  }

  function saveCheckout(p, state) {
    writeJSON(CHECKOUT_PREFIX + p.id, state, true);
  }

  function luhnOk(digits) {
    let sum = 0;
    let dbl = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = Number(digits[i]);
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }

  function shortTitle(p) {
    return p.title.split(':')[0];
  }

  function renderSostieni(container, p, params) {
    const s = getProjectStats(p);

    // Campagna chiusa: niente form, spiegazione e alternative (prevenzione dell'errore)
    if (!s.isOpen) {
      container.innerHTML = `
        <section class="inner-page-hero">
          <div class="container narrow-container">
            ${breadcrumb([{ href: '#/home', label: 'Home' }, { href: `#/progetto/${p.id}`, label: shortTitle(p) }, { label: 'Sostieni' }])}
            <h1 class="page-main-heading">La raccolta per «${esc(shortTitle(p))}» è chiusa</h1>
            <p class="page-intro-lead">La campagna si è conclusa il ${esc(p.closedOn || '')} raggiungendo il ${s.percentage}% dell'obiettivo. Non è più possibile donare, ma puoi seguire come vengono usati i fondi.</p>
            <div class="hero-cta-buttons">
              <a href="#/progetto/${p.id}" class="btn btn-primary-burgundy">Vedi i risultati del progetto</a>
              <a href="#/cerca" class="btn btn-secondary-outline">Scopri le campagne aperte</a>
            </div>
          </div>
        </section>
      `;
      return;
    }

    const saved = loadCheckout(p);
    const state = saved || { completed: 0, rewardIndex: null, amount: 30, visibility: 'nome', updatesOptIn: true, wantReceipt: false };
    let canonicalNeeded = false;

    // Ingresso dalla scheda progetto con ricompensa o importo già scelti
    if (params.has('ricompensa')) {
      const idx = parseInt(params.get('ricompensa'), 10);
      const r = p.rewards[idx];
      if (r && rewardRemaining(p, r) !== 0) {
        if (state.rewardIndex !== idx) delete state.reservationExpires;
        state.rewardIndex = idx;
        state.amount = Math.max(r.amount, state.rewardIndex === idx && state.amount ? state.amount : 0, r.amount);
      }
      canonicalNeeded = true;
    }
    if (params.has('importo')) {
      const val = Math.round(Number(params.get('importo')));
      state.rewardIndex = null;
      state.amount = val >= 5 ? val : 5;
      canonicalNeeded = true;
    }

    let step = parseInt(params.get('passo') || '1', 10);
    if (![1, 2, 3, 4].includes(step)) step = 1;
    // Non si può saltare in avanti a un passo non ancora raggiunto
    if (step > state.completed + 1) { step = state.completed + 1; canonicalNeeded = true; }
    // Dopo un ricaricamento i dati della carta non ci sono più: si torna al pagamento
    let cardLostNotice = false;
    if (step === 4 && state.method === 'carta' && !cardMemory[p.id]) {
      step = 3; canonicalNeeded = true; cardLostNotice = true;
    }

    // Il limite di tempo di 2 ore è sempre attivo per qualsiasi donazione (con o senza ricompensa)
    if (!state.reservationExpires) {
      state.reservationExpires = Date.now() + RESERVATION_MINUTES * 60000;
    }
    saveCheckout(p, state);

    if (canonicalNeeded) {
      try { history.replaceState(null, '', `#/sostieni/${p.id}?passo=${step}`); } catch (e) { /* ignora */ }
    }

    const resumedNotice = saved && saved.completed > 0 && !params.has('passo') && !params.has('ricompensa') && !params.has('importo');
    const stepInfo = CHECKOUT_STEPS[step - 1];

    container.innerHTML = `
      <section class="inner-page-hero checkout-hero">
        <div class="container">
          ${breadcrumb([
            { href: '#/home', label: 'Home' },
            { href: '#/cerca', label: 'Cerca progetti' },
            { href: `#/progetto/${p.id}`, label: shortTitle(p) },
            { label: 'Sostieni il progetto' }
          ])}
          <h1 class="page-main-heading">Sostieni ${esc(shortTitle(p))}</h1>
          <p class="page-intro-lead">Quattro passi, circa due minuti. Puoi tornare indietro quando vuoi: i dati inseriti restano salvati.</p>
          ${resumedNotice ? `<p class="checkout-resume-note" role="status">Abbiamo ripreso la donazione da dove l'avevi lasciata. <button type="button" class="btn-text-logout" id="btnRestartCheckout">Ricomincia da capo</button></p>` : ''}
          ${cardLostNotice ? '<p class="checkout-resume-note warn" role="status">Per sicurezza i dati della carta non vengono salvati: reinseriscili per continuare.</p>' : ''}

          <ol class="checkout-stepper" aria-label="Avanzamento della donazione">
            ${CHECKOUT_STEPS.map(st => {
              if (st.n < step || (st.n <= state.completed && st.n !== step)) {
                return `<li class="done"><a href="#/sostieni/${p.id}?passo=${st.n}"><span class="step-num" aria-hidden="true">✓</span><span>${st.label}<span class="sr-only"> (completato, torna a questo passo)</span></span></a></li>`;
              }
              if (st.n === step) {
                return `<li class="current" aria-current="step"><span class="step-num">${st.n}</span><span>${st.label}</span></li>`;
              }
              return `<li class="todo"><span class="step-num">${st.n}</span><span>${st.label}</span></li>`;
            }).join('')}
          </ol>
        </div>
      </section>

      <section class="checkout-body">
        <div class="container checkout-layout">
          <div class="checkout-main">
            <h2 class="checkout-step-title"><span>Passo ${step} di 4</span>${stepInfo.title}</h2>
            <div id="checkoutStepHost"></div>
          </div>
          <aside class="checkout-sidebar" aria-label="Riepilogo della donazione">
            <div id="checkoutSummaryHost"></div>
            <div id="checkoutTimerHost" aria-live="polite"></div>
            <div class="checkout-help-card">
              <strong>Hai un dubbio?</strong>
              <ul>
                <li><a href="#/come-funziona" target="_blank" rel="noopener">Come funziona la donazione<span class="sr-only"> (si apre in una nuova scheda)</span></a></li>
                <li><a href="#/faq?apri=tutto-o-niente" target="_blank" rel="noopener">Cosa succede se non si raggiunge l'obiettivo<span class="sr-only"> (si apre in una nuova scheda)</span></a></li>
                <li><a href="#/assistenza?progetto=${p.id}" target="_blank" rel="noopener">Scrivi all'assistenza<span class="sr-only"> (si apre in una nuova scheda)</span></a></li>
              </ul>
              <small>I link si aprono in una nuova scheda: questa donazione resta qui.</small>
            </div>
            <p class="cs-secure"><span aria-hidden="true">🔒</span> Prototipo: nessun addebito reale. I dati della carta non vengono mai salvati.</p>
          </aside>
        </div>
      </section>
    `;

    const host = container.querySelector('#checkoutStepHost');
    const summaryHost = container.querySelector('#checkoutSummaryHost');
    const timerHost = container.querySelector('#checkoutTimerHost');

    const restartBtn = container.querySelector('#btnRestartCheckout');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        writeJSON(CHECKOUT_PREFIX + p.id, null, true);
        delete cardMemory[p.id];
        navigateTo(`#/sostieni/${p.id}?passo=1`);
      });
    }

    function currentReward() {
      return state.rewardIndex !== null && state.rewardIndex !== undefined ? p.rewards[state.rewardIndex] : null;
    }

    function goTo(n) {
      saveCheckout(p, state);
      navigateTo(`#/sostieni/${p.id}?passo=${n}`);
    }

    /* ---------- Riepilogo laterale ---------- */
    function drawSummary() {
      const r = currentReward();
      const amount = Number(state.amount) || 0;
      // Quanto del contributo verrebbe raddoppiato (il tetto è 10.000 € per progetto)
      const matchable = Math.max(0, Math.min(amount, MATCHING_CAP - s.collected));
      summaryHost.innerHTML = `
        <div class="checkout-summary-card">
          <div class="cs-project">
            <span class="cs-icon" style="background:${p.imageGradient};">${categoryIcon(p.category, p.colorAccent, 22)}</span>
            <div>
              <strong>${esc(shortTitle(p))}</strong>
              <small>${esc(p.proponent)}</small>
            </div>
          </div>
          <div class="cs-progress">
            <div class="cs-progress-track" aria-hidden="true"><span style="width:${Math.min(s.percentage, 100)}%"></span></div>
            <small>${s.percentage}% raccolto · ${s.reachedGoal ? 'obiettivo raggiunto' : `mancano ${fmtEur(s.missing)}`} · ${p.daysLeft} giorni</small>
          </div>
          <dl class="cs-lines">
            <div><dt>La tua donazione</dt><dd>${amount >= 5 ? fmtEur(amount) : '—'}</dd></div>
            <div><dt>Ricompensa</dt><dd>${r ? esc(r.title) : 'Nessuna'}</dd></div>
            ${state.method ? `<div><dt>Pagamento</dt><dd>${esc(PAY_METHODS[state.method])}</dd></div>` : ''}
            <div class="cs-matching"><dt>Raddoppio UniTO possibile</dt><dd>${matchable > 0 ? '+ ' + fmtEur(matchable) : '—'}</dd></div>
          </dl>
          <p class="cs-note">Il raddoppio arriva solo se la campagna raggiunge l'obiettivo entro la scadenza; altrimenti la donazione ti viene rimborsata.</p>
        </div>
      `;
    }

    /* ---------- Riserva della ricompensa / sessione (timer 2 ore sempre attivo) ---------- */
    let timerPhase = null;
    function timerPhaseNow() {
      const left = (state.reservationExpires || 0) - Date.now();
      if (left <= 0) return 'expired';
      if (left <= 5 * 60000) return 'warning';
      return 'ok';
    }
    function clockText() {
      const left = Math.max(0, (state.reservationExpires || 0) - Date.now());
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      const sec = Math.floor((left % 60000) / 1000);
      if (h > 0) {
        return `${h}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
      }
      return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
    function drawTimer() {
      const r = currentReward();
      timerPhase = timerPhaseNow();
      if (timerPhase === 'expired') {
        timerHost.innerHTML = `
          <div class="timer-card expired" role="alert">
            <strong>Sessione di donazione scaduta</strong>
            <p>Il tempo limite di 2 ore per completare la donazione è scaduto. I dati inseriti sono ancora memorizzati.</p>
            <button type="button" class="btn btn-sm btn-primary-burgundy" id="btnRenewReservation">Rinnova per altre 2 ore</button>
          </div>`;
      } else {
        const isWarn = timerPhase === 'warning';
        timerHost.innerHTML = `
          <div class="timer-card ${isWarn ? 'warning' : ''}">
            <strong>${isWarn ? 'Attenzione: tempo quasi scaduto' : (r ? 'Ricompensa e sessione riservate' : 'Tempo a disposizione per completare')}</strong>
            <p>${r ? `«${esc(r.title)}» e la tua sessione sono riservate per:` : 'Hai un limite di tempo per completare la donazione:'}
              <span class="timer-clock" role="timer" aria-live="off">${clockText()}</span></p>
            ${isWarn
              ? '<button type="button" class="btn btn-sm btn-primary-burgundy" id="btnExtendReservation">Mi serve più tempo (+30 minuti)</button>'
              : '<small>Hai 2 ore di tempo: i dati inseriti restano memorizzati anche se cambi pagina.</small>'}
          </div>`;
      }
      const renew = timerHost.querySelector('#btnRenewReservation');
      if (renew) renew.addEventListener('click', () => {
        state.reservationExpires = Date.now() + RESERVATION_MINUTES * 60000;
        saveCheckout(p, state);
        drawTimer();
        showToast('Tempo rinnovato per altre 2 ore.', 'success');
      });
      const extend = timerHost.querySelector('#btnExtendReservation');
      if (extend) extend.addEventListener('click', () => {
        state.reservationExpires = (state.reservationExpires || Date.now()) + 30 * 60000;
        saveCheckout(p, state);
        drawTimer();
        showToast('Hai altri 30 minuti di tempo.', 'success');
      });
    }
    const tick = setInterval(() => {
      if (timerPhaseNow() !== timerPhase) {
        drawTimer();
      } else {
        const clock = timerHost.querySelector('.timer-clock');
        if (clock) clock.textContent = clockText();
      }
    }, 1000);
    onLeavePage(() => clearInterval(tick));

    /* ---------- Bottone "Indietro": salva senza validare ---------- */
    function wireBack(collect) {
      const back = host.querySelector('[data-go-back]');
      if (back) back.addEventListener('click', () => {
        if (collect) collect();
        goTo(step - 1);
      });
    }

    /* ========== PASSO 1: CONTRIBUTO ========== */
    if (step === 1) {
      host.innerHTML = `
        <form id="checkoutForm" class="checkout-form">
          <fieldset class="checkout-fieldset" data-radio-group="rewardChoice" data-msg-required="Scegli una ricompensa oppure «Solo donazione».">
            <legend>Vuoi una ricompensa? <span class="required">*</span></legend>
            <label class="choice-card">
              <input type="radio" name="rewardChoice" value="none" required ${state.rewardIndex === null ? 'checked' : ''}>
              <span class="choice-body">
                <span class="choice-head"><strong>Solo donazione, senza ricompensa</strong><span class="choice-price">da € 5</span></span>
                <small>Tutto il contributo va alla ricerca.</small>
              </span>
            </label>
            ${p.rewards.map((r, i) => {
              const left = rewardRemaining(p, r);
              const soldOut = left === 0;
              return `
                <label class="choice-card ${soldOut ? 'is-disabled' : ''}">
                  <input type="radio" name="rewardChoice" value="${i}" required ${state.rewardIndex === i ? 'checked' : ''} ${soldOut ? 'disabled' : ''}>
                  <span class="choice-body">
                    <span class="choice-head"><strong>${esc(r.title)}</strong><span class="choice-price">${fmtEur(r.amount)} o più</span></span>
                    <small>${esc(r.desc)}</small>
                    ${r.limit ? `<small class="choice-avail ${left <= 5 ? 'low' : ''}">${soldOut ? 'Esaurita' : `Ne restano ${left} su ${r.limit}`}</small>` : ''}
                    ${r.shipping ? '<small class="choice-avail">Spedizione inclusa: ti chiederemo l\'indirizzo</small>' : ''}
                  </span>
                </label>
              `;
            }).join('')}
          </fieldset>

          <div class="form-group amount-group">
            <label for="donationAmount">Importo della donazione <span class="required">*</span></label>
            <div class="input-with-addon amount-input">
              <span aria-hidden="true">€</span>
              <input type="number" id="donationAmount" required min="5" step="1" inputmode="numeric" class="form-control" value="${esc(state.amount)}" data-msg-required="Inserisci l'importo che vuoi donare.">
            </div>
            <small class="form-hint" id="amountHint"></small>
            <div class="quick-amounts" role="group" aria-label="Importi rapidi">
              ${[10, 25, 50, 100].map(v => `<button type="button" class="quick-amount-btn" data-amount="${v}">${fmtEur(v)}</button>`).join('')}
            </div>
          </div>

          <div class="impact-preview" id="impactPreview" aria-live="polite"></div>

          <div class="checkout-actions">
            <a href="#/progetto/${p.id}" class="btn btn-ghost">Annulla e torna al progetto</a>
            <button type="submit" class="btn btn-primary-burgundy btn-lg">Continua: i tuoi dati &rarr;</button>
          </div>
        </form>
      `;

      const form = host.querySelector('#checkoutForm');
      const amountInput = host.querySelector('#donationAmount');
      const hint = host.querySelector('#amountHint');
      const impact = host.querySelector('#impactPreview');

      function refreshAmountRules(autoRaise) {
        const r = currentReward();
        const min = r ? r.amount : 5;
        amountInput.min = String(min);
        amountInput.dataset.msgMin = r
          ? `Per la ricompensa «${r.title}» l'importo minimo è ${fmtEur(r.amount)}.`
          : 'L\'importo minimo è 5 €.';
        if (autoRaise && r && Number(amountInput.value) < r.amount) {
          amountInput.value = r.amount;
          hint.textContent = `Abbiamo portato l'importo a ${fmtEur(r.amount)}, il minimo per questa ricompensa. Puoi aumentarlo.`;
        } else {
          hint.textContent = r ? `Minimo ${fmtEur(r.amount)} per questa ricompensa: puoi aggiungere quanto vuoi.` : 'Minimo 5 €.';
        }
        state.amount = Math.round(Number(amountInput.value)) || 0;
      }

      function refreshImpact() {
        const amount = Math.round(Number(amountInput.value)) || 0;
        const matchable = Math.max(0, Math.min(amount, MATCHING_CAP - s.collected));
        if (amount < 5) {
          impact.innerHTML = '';
          return;
        }
        impact.innerHTML = `
          <div class="impact-figures">
            <div><small>Tu doni</small><strong>${fmtEur(amount)}</strong></div>
            <span aria-hidden="true">+</span>
            <div><small>UniTO aggiunge*</small><strong>${fmtEur(matchable)}</strong></div>
            <span aria-hidden="true">=</span>
            <div class="impact-total"><small>Alla ricerca</small><strong>${fmtEur(amount + matchable)}</strong></div>
          </div>
          <p>* Solo se la campagna raggiunge l'obiettivo di ${fmtEur(p.target)} entro ${p.daysLeft} giorni. Se non lo raggiunge, ti rimborsiamo ${fmtEur(amount)}.</p>
        `;
      }

      host.querySelectorAll('input[name="rewardChoice"]').forEach(radio => {
        radio.addEventListener('change', () => {
          const prev = state.rewardIndex;
          state.rewardIndex = radio.value === 'none' ? null : Number(radio.value);
          if (!state.reservationExpires) {
            state.reservationExpires = Date.now() + RESERVATION_MINUTES * 60000;
          }
          refreshAmountRules(true);
          refreshImpact();
          saveCheckout(p, state);
          drawSummary();
          drawTimer();
        });
      });
      amountInput.addEventListener('input', () => {
        state.amount = Math.round(Number(amountInput.value)) || 0;
        saveCheckout(p, state);
        refreshImpact();
        drawSummary();
      });
      host.querySelectorAll('.quick-amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          amountInput.value = btn.getAttribute('data-amount');
          amountInput.dispatchEvent(new Event('input', { bubbles: true }));
          amountInput.focus();
        });
      });

      refreshAmountRules(false);
      refreshImpact();

      enhanceForm(form, {
        onValid: () => {
          state.amount = Math.round(Number(amountInput.value));
          state.completed = Math.max(state.completed, 1);
          goTo(2);
        }
      });
    }

    /* ========== PASSO 2: DATI ========== */
    if (step === 2) {
      const r = currentReward();
      const needsShipping = !!(r && r.shipping);
      host.innerHTML = `
        <form id="checkoutForm" class="checkout-form">
          <div class="styled-form-grid">
            <!-- A1, euristica 5: Nome e Cognome erano un unico campo e "Mario" bastava a superare il controllo -->
            <div class="form-group">
              <label for="donorFirstName">Nome <span class="required">*</span></label>
              <input type="text" id="donorFirstName" required class="form-control" autocomplete="given-name" value="${esc(state.firstName || '')}" data-msg-required="Inserisci il tuo nome: serve per la ricevuta.">
            </div>
            <div class="form-group">
              <label for="donorLastName">Cognome <span class="required">*</span></label>
              <input type="text" id="donorLastName" required class="form-control" autocomplete="family-name" value="${esc(state.lastName || '')}" data-msg-required="Inserisci il tuo cognome: serve per la ricevuta.">
            </div>
            <div class="form-group form-full">
              <label for="donorEmail">Email <span class="required">*</span></label>
              <input type="email" id="donorEmail" required class="form-control" autocomplete="email" placeholder="nome@email.it" value="${esc(state.email || '')}" aria-describedby="donorEmailHint">
              <small class="form-hint" id="donorEmailHint">Qui ricevi la conferma e la ricevuta. Non serve creare un account.</small>
            </div>
          </div>

          <fieldset class="checkout-fieldset compact" data-radio-group="visibility">
            <legend>Come vuoi comparire tra i sostenitori?</legend>
            <label class="choice-card slim">
              <input type="radio" name="visibility" value="nome" ${state.visibility !== 'anonimo' ? 'checked' : ''}>
              <span class="choice-body"><strong>Con nome e iniziale del cognome</strong><small>Per esempio "Laura F."</small></span>
            </label>
            <label class="choice-card slim">
              <input type="radio" name="visibility" value="anonimo" ${state.visibility === 'anonimo' ? 'checked' : ''}>
              <span class="choice-body"><strong>In forma anonima</strong><small>Il tuo nome resta solo sulla ricevuta, che è privata.</small></span>
            </label>
          </fieldset>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="wantReceipt" ${state.wantReceipt ? 'checked' : ''}>
              <span>Voglio la ricevuta per la deduzione fiscale (aggiungo il codice fiscale)</span>
            </label>
          </div>
          <div class="form-group cf-group" id="cfGroup" ${state.wantReceipt ? '' : 'hidden'}>
            <label for="donorCf">Codice fiscale <span class="required">*</span></label>
            <input type="text" id="donorCf" required class="form-control uppercase-input" maxlength="16" autocomplete="off" value="${esc(state.cf || '')}"
              pattern="[A-Za-z]{6}[0-9LMNPQRSTUVlmnpqrstuv]{2}[A-Za-z][0-9LMNPQRSTUVlmnpqrstuv]{2}[A-Za-z][0-9LMNPQRSTUVlmnpqrstuv]{3}[A-Za-z]"
              data-msg-pattern="Il codice fiscale ha 16 caratteri, per esempio RSSMRA80A01L219X." data-msg-required="Inserisci il codice fiscale oppure togli la spunta alla ricevuta per la deduzione.">
          </div>

          ${needsShipping ? `
            <fieldset class="checkout-fieldset compact">
              <legend>Dove spediamo «${esc(r.title)}»?</legend>
              <div class="styled-form-grid">
                <div class="form-group form-full">
                  <label for="shipAddress">Indirizzo <span class="required">*</span></label>
                  <input type="text" id="shipAddress" required class="form-control" autocomplete="street-address" value="${esc(state.shipAddress || '')}" placeholder="Via e numero civico">
                </div>
                <div class="form-group">
                  <label for="shipZip">CAP <span class="required">*</span></label>
                  <input type="text" id="shipZip" required inputmode="numeric" maxlength="5" pattern="[0-9]{5}" data-msg-pattern="Il CAP ha 5 cifre." class="form-control" autocomplete="postal-code" value="${esc(state.shipZip || '')}">
                </div>
                <div class="form-group">
                  <label for="shipCity">Città <span class="required">*</span></label>
                  <input type="text" id="shipCity" required class="form-control" autocomplete="address-level2" value="${esc(state.shipCity || '')}">
                </div>
              </div>
              <small class="form-hint">La ricompensa viene spedita dopo la chiusura della campagna, solo se raggiunge l'obiettivo.</small>
            </fieldset>
          ` : ''}

          <div class="form-group">
            <label for="donorMessage">Un messaggio per il team (facoltativo)</label>
            <textarea id="donorMessage" class="form-control" rows="2" maxlength="300" placeholder="Es. Forza ragazzi, mio padre aspetta questo progetto!">${esc(state.message || '')}</textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="updatesOptIn" ${state.updatesOptIn !== false ? 'checked' : ''}>
              <span>Inviami via email gli aggiornamenti di questo progetto e l'esito della campagna</span>
            </label>
          </div>

          <div class="checkout-actions">
            <button type="button" class="btn btn-ghost" data-go-back>&larr; Indietro</button>
            <button type="submit" class="btn btn-primary-burgundy btn-lg">Continua: pagamento &rarr;</button>
          </div>
        </form>
      `;

      const form = host.querySelector('#checkoutForm');
      const receipt = host.querySelector('#wantReceipt');
      const cfGroup = host.querySelector('#cfGroup');
      const cfInput = host.querySelector('#donorCf');
      attachCounter(host.querySelector('#donorMessage'));
      receipt.addEventListener('change', () => {
        cfGroup.hidden = !receipt.checked;
        if (!receipt.checked) showFieldError(cfInput, '');
        if (receipt.checked) cfInput.focus();
      });
      cfInput.addEventListener('input', () => { cfInput.value = cfInput.value.toUpperCase(); });

      function collect() {
        state.firstName = host.querySelector('#donorFirstName').value.trim();
        state.lastName = host.querySelector('#donorLastName').value.trim();
        state.email = host.querySelector('#donorEmail').value.trim();
        state.visibility = (host.querySelector('input[name="visibility"]:checked') || {}).value || 'nome';
        state.wantReceipt = receipt.checked;
        state.cf = cfInput.value.trim().toUpperCase();
        state.message = host.querySelector('#donorMessage').value.trim();
        state.updatesOptIn = host.querySelector('#updatesOptIn').checked;
        if (needsShipping) {
          state.shipAddress = host.querySelector('#shipAddress').value.trim();
          state.shipZip = host.querySelector('#shipZip').value.trim();
          state.shipCity = host.querySelector('#shipCity').value.trim();
        }
        saveCheckout(p, state);
      }
      // Salvataggio continuo: anche chiudendo la scheda per sbaglio i dati non si perdono
      form.addEventListener('input', collect);
      form.addEventListener('change', collect);
      wireBack(collect);

      enhanceForm(form, {
        onValid: () => {
          collect();
          state.completed = Math.max(state.completed, 2);
          goTo(3);
        }
      });
    }

    /* ========== PASSO 3: PAGAMENTO ========== */
    if (step === 3) {
      const card = cardMemory[p.id] || {};
      host.innerHTML = `
        <form id="checkoutForm" class="checkout-form">
          <fieldset class="checkout-fieldset pay-methods" data-radio-group="payMethod" data-msg-required="Scegli un metodo di pagamento per continuare.">
            <legend>Metodo di pagamento <span class="required">*</span></legend>
            <label class="choice-card">
              <input type="radio" name="payMethod" value="carta" required ${state.method === 'carta' ? 'checked' : ''}>
              <span class="choice-body"><span class="choice-head"><strong>Carta di credito o debito</strong><span class="choice-price">immediato</span></span><small>Visa, Mastercard, Maestro. La donazione conta subito.</small></span>
            </label>
            <label class="choice-card">
              <input type="radio" name="payMethod" value="paypal" required ${state.method === 'paypal' ? 'checked' : ''}>
              <span class="choice-body"><span class="choice-head"><strong>PayPal</strong><span class="choice-price">immediato</span></span><small>Alla conferma autorizzi il pagamento sul sito di PayPal.</small></span>
            </label>
            <label class="choice-card">
              <input type="radio" name="payMethod" value="bonifico" required ${state.method === 'bonifico' ? 'checked' : ''}>
              <span class="choice-body"><span class="choice-head"><strong>Bonifico bancario</strong><span class="choice-price">1-2 giorni</span></span><small>La donazione conta quando arriva il bonifico. Avrai 5 giorni per farlo.</small></span>
            </label>
            <label class="choice-card">
              <input type="radio" name="payMethod" value="satispay" required ${state.method === 'satispay' ? 'checked' : ''}>
              <span class="choice-body"><span class="choice-head"><strong>Satispay</strong><span class="choice-price">immediato</span></span>
                <small>Paga direttamente con la tua app Satispay (simulato nel prototipo).</small></span>
            </label>
          </fieldset>

          <div class="pay-details" id="payDetails-carta" ${state.method === 'carta' ? '' : 'hidden'}>
            <p class="pay-test-note">Pagamento simulato: puoi usare il numero di prova <strong>4242 4242 4242 4242</strong>, una scadenza futura e un CVC qualsiasi.</p>
            <div class="styled-form-grid">
              <div class="form-group form-full">
                <label for="cardName">Intestatario della carta <span class="required">*</span></label>
                <input type="text" id="cardName" required class="form-control" autocomplete="cc-name" value="${esc(card.name || [state.firstName, state.lastName].filter(Boolean).join(' '))}">
              </div>
              <div class="form-group form-full">
                <label for="cardNumber">Numero della carta <span class="required">*</span></label>
                <input type="text" id="cardNumber" required class="form-control card-number-input" inputmode="numeric" autocomplete="cc-number" maxlength="23" placeholder="1234 5678 9012 3456" value="${esc(card.number || '')}">
              </div>
              <div class="form-group">
                <label for="cardExpiry">Scadenza (MM/AA) <span class="required">*</span></label>
                <input type="text" id="cardExpiry" required class="form-control" inputmode="numeric" autocomplete="cc-exp" maxlength="5" placeholder="MM/AA" value="${esc(card.expiry || '')}">
              </div>
              <div class="form-group">
                <label for="cardCvc">CVC <span class="required">*</span></label>
                <input type="text" id="cardCvc" required class="form-control" inputmode="numeric" autocomplete="cc-csc" maxlength="4" placeholder="3 cifre sul retro" value="${esc(card.cvc || '')}">
              </div>
            </div>
          </div>
          <div class="pay-details info" id="payDetails-paypal" ${state.method === 'paypal' ? '' : 'hidden'}>
            <p>Dopo il riepilogo, alla conferma si aprirebbe PayPal per autorizzare il pagamento (simulato in questo prototipo).</p>
          </div>
          <div class="pay-details info" id="payDetails-bonifico" ${state.method === 'bonifico' ? '' : 'hidden'}>
            <p>Dopo la conferma ti mostreremo <strong>IBAN, causale e importo da versare</strong> e te li invieremo via email. Fino all'arrivo del bonifico la donazione risulterà <strong>«in attesa»</strong> e non verrà conteggiata nella raccolta.</p>
          </div>
          <div class="pay-details info" id="payDetails-satispay" ${state.method === 'satispay' ? '' : 'hidden'}>
            <p>Alla conferma riceverai la richiesta di pagamento nell'app Satispay (simulato).</p>
          </div>

          <div class="checkout-actions">
            <button type="button" class="btn btn-ghost" data-go-back>&larr; Indietro (i dati restano)</button>
            <button type="submit" class="btn btn-primary-burgundy btn-lg">Continua: riepilogo &rarr;</button>
          </div>
        </form>
      `;

      const form = host.querySelector('#checkoutForm');
      const numberInput = host.querySelector('#cardNumber');
      const expiryInput = host.querySelector('#cardExpiry');
      const cvcInput = host.querySelector('#cardCvc');

      host.querySelectorAll('input[name="payMethod"]').forEach(radio => {
        radio.addEventListener('change', () => {
          state.method = radio.value;
          Object.keys(PAY_METHODS).forEach(key => {
            const box = host.querySelector('#payDetails-' + key);
            if (box) box.hidden = key !== radio.value;
          });
          saveCheckout(p, state);
          drawSummary();
        });
      });

      // Formattazione automatica (riduce gli errori di battitura)
      numberInput.addEventListener('input', () => {
        const digits = numberInput.value.replace(/\D/g, '').slice(0, 19);
        numberInput.value = digits.replace(/(.{4})/g, '$1 ').trim();
      });
      expiryInput.addEventListener('input', e => {
        let v = expiryInput.value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
        else if (v.length === 2 && e.inputType !== 'deleteContentBackward') v = v + '/';
        expiryInput.value = v;
      });
      cvcInput.addEventListener('input', () => { cvcInput.value = cvcInput.value.replace(/\D/g, '').slice(0, 4); });

      function collect() {
        cardMemory[p.id] = {
          name: host.querySelector('#cardName').value.trim(),
          number: numberInput.value.trim(),
          expiry: expiryInput.value.trim(),
          cvc: cvcInput.value.trim()
        };
        const checked = host.querySelector('input[name="payMethod"]:checked');
        state.method = checked ? checked.value : state.method;
        saveCheckout(p, state);
      }
      wireBack(collect);

      enhanceForm(form, {
        custom: {
          cardNumber: el => {
            const digits = el.value.replace(/\s/g, '');
            if (!/^\d{13,19}$/.test(digits)) return `Il numero della carta deve avere da 13 a 19 cifre (ne hai inserite ${digits.replace(/\D/g, '').length}).`;
            if (!luhnOk(digits)) return 'Il numero della carta non è valido: controlla di averlo copiato correttamente.';
            return '';
          },
          cardExpiry: el => {
            const m = el.value.match(/^(\d{2})\/(\d{2})$/);
            if (!m) return 'Scrivi la scadenza nel formato MM/AA, per esempio 08/28.';
            const month = Number(m[1]);
            const year = 2000 + Number(m[2]);
            if (month < 1 || month > 12) return 'Il mese della scadenza deve essere tra 01 e 12.';
            const now = new Date();
            if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return 'La carta risulta scaduta: usa un\'altra carta o un altro metodo.';
            return '';
          },
          cardCvc: el => /^\d{3,4}$/.test(el.value) ? '' : 'Il CVC è il codice di 3 cifre (4 per American Express) sul retro della carta.'
        },
        onValid: () => {
          collect();
          state.completed = Math.max(state.completed, 3);
          goTo(4);
        }
      });
    }

    /* ========== PASSO 4: RIEPILOGO E CONFERMA ========== */
    if (step === 4) {
      const r = currentReward();
      const card = cardMemory[p.id] || {};
      const isTransfer = state.method === 'bonifico';
      const last4 = (card.number || '').replace(/\s/g, '').slice(-4);
      const matchable = Math.max(0, Math.min(state.amount, MATCHING_CAP - s.collected));
      const shownName = state.visibility === 'anonimo' ? 'Anonimo' : `${state.firstName} ${(state.lastName || '').charAt(0)}.`;

      host.innerHTML = `
        <div class="review-blocks">
          <section class="review-block" aria-labelledby="rv1">
            <div class="review-head"><h3 id="rv1">Contributo</h3><a href="#/sostieni/${p.id}?passo=1">Modifica<span class="sr-only"> il contributo</span></a></div>
            <dl>
              <div><dt>Importo</dt><dd>${fmtEur(state.amount)}</dd></div>
              <div><dt>Ricompensa</dt><dd>${r ? esc(r.title) : 'Nessuna (solo donazione)'}</dd></div>
            </dl>
          </section>
          <section class="review-block" aria-labelledby="rv2">
            <div class="review-head"><h3 id="rv2">I tuoi dati</h3><a href="#/sostieni/${p.id}?passo=2">Modifica<span class="sr-only"> i tuoi dati</span></a></div>
            <dl>
              <div><dt>Nome e cognome</dt><dd>${esc(state.firstName)} ${esc(state.lastName)}</dd></div>
              <div><dt>Email</dt><dd>${esc(state.email)}</dd></div>
              <div><dt>Tra i sostenitori</dt><dd>${esc(shownName)}</dd></div>
              <div><dt>Ricevuta per la deduzione</dt><dd>${state.wantReceipt ? 'Sì, con codice fiscale ' + esc(state.cf) : 'Ricevuta semplice'}</dd></div>
              ${r && r.shipping ? `<div><dt>Spedizione</dt><dd>${esc(state.shipAddress)}, ${esc(state.shipZip)} ${esc(state.shipCity)}</dd></div>` : ''}
              ${state.message ? `<div><dt>Messaggio al team</dt><dd>"${esc(state.message)}"</dd></div>` : ''}
            </dl>
          </section>
          <section class="review-block" aria-labelledby="rv3">
            <div class="review-head"><h3 id="rv3">Pagamento</h3><a href="#/sostieni/${p.id}?passo=3">Modifica<span class="sr-only"> il pagamento</span></a></div>
            <dl>
              <div><dt>Metodo</dt><dd>${esc(PAY_METHODS[state.method] || '')}${state.method === 'carta' && last4 ? ` che termina con ${esc(last4)}` : ''}</dd></div>
            </dl>
          </section>
        </div>

        <div class="review-total ${isTransfer ? 'transfer' : ''}">
          <span>${isTransfer ? 'Importo da versare con bonifico' : 'Totale della donazione'}</span>
          <strong>${fmtEur(state.amount)}</strong>
        </div>

        <ul class="review-after">
          ${isTransfer
            ? '<li>Dopo la conferma vedrai IBAN e causale: la donazione resterà <strong>in attesa</strong> finché il bonifico non arriva.</li>'
            : '<li>L\'importo viene addebitato subito e riceverai la ricevuta via email.</li>'}
          <li>Se la campagna raggiunge l'obiettivo, l'Università aggiunge ${matchable > 0 ? fmtEur(matchable) : 'il cofinanziamento'} grazie al tuo contributo.</li>
          <li>Se non lo raggiunge, ti rimborsiamo l'intero importo senza che tu debba fare nulla.</li>
        </ul>

        <form id="checkoutForm" class="checkout-form">
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="acceptPrivacy" required ${state.acceptPrivacy ? 'checked' : ''} data-msg-required="Per confermare devi dichiarare di aver letto l'informativa sui dati personali.">
              <span>Ho letto l'<a href="#/faq?apri=dati-personali" target="_blank" rel="noopener">informativa sul trattamento dei dati personali<span class="sr-only"> (si apre in una nuova scheda)</span></a> <span class="required">*</span></span>
            </label>
          </div>
          <div class="checkout-actions">
            <button type="button" class="btn btn-ghost" data-go-back>&larr; Indietro</button>
            <button type="submit" class="btn btn-green-cta btn-lg" id="btnConfirmDonation">
              ${isTransfer ? `Conferma e ricevi i dati per il bonifico` : `Conferma la donazione di ${fmtEur(state.amount)}`}
            </button>
          </div>
        </form>
      `;

      const form = host.querySelector('#checkoutForm');
      const privacy = host.querySelector('#acceptPrivacy');
      privacy.addEventListener('change', () => { state.acceptPrivacy = privacy.checked; saveCheckout(p, state); });
      wireBack(null);

      enhanceForm(form, {
        onValid: () => {
          const btn = host.querySelector('#btnConfirmDonation');
          // Feedback durante l'elaborazione (euristica 1) e niente doppio invio
          btn.disabled = true;
          btn.classList.add('is-loading');
          btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Elaborazione in corso…';

          setTimeout(() => {
            const rw = currentReward();
            // Se la riserva è scaduta ma ci sono ancora posti, la rinnoviamo in silenzio: nessun dato perso
            if (rw && rw.limit && rewardRemaining(p, rw) === 0) {
              btn.disabled = false;
              btn.classList.remove('is-loading');
              btn.textContent = 'Conferma la donazione';
              showToast('Nel frattempo la ricompensa si è esaurita: scegline un\'altra. I tuoi dati sono salvati.', 'warning');
              goTo(1);
              return;
            }
            const donation = {
              id: 'CU-' + Date.now().toString(36).toUpperCase().slice(-6),
              projectId: p.id,
              amount: state.amount,
              rewardTitle: rw ? rw.title : null,
              firstName: state.firstName,
              lastName: state.lastName,
              email: state.email,
              anonymous: state.visibility === 'anonimo',
              wantReceipt: !!state.wantReceipt,
              method: state.method,
              cardLast4: state.method === 'carta' ? last4 : null,
              updatesOptIn: state.updatesOptIn !== false,
              status: state.method === 'bonifico' ? 'in_attesa_bonifico' : 'confermata',
              dateLabel: todayLong(),
              dueDate: state.method === 'bonifico' ? dateInDays(5) : null
            };
            saveDonation(donation);
            writeJSON(CHECKOUT_PREFIX + p.id, null, true);
            delete cardMemory[p.id];
            navigateTo('#/conferma/' + donation.id);
          }, 1200);
        }
      });
    }

    drawSummary();
    drawTimer();
  }

  /* ==========================================================================
     [NUOVO] PAGINA DI CONFERMA DELLA DONAZIONE (#/conferma/<codice>)
     A1, euristica 1 (sev. 2): con il bonifico IdeaGinger mostrava "Grazie per quello che stai facendo"
     e "Quota donata: 10€" anche se il pagamento non era avvenuto. Qui:
       - stato esplicito in cima ("Donazione registrata: manca il bonifico");
       - "Importo da versare" al posto di "Quota donata";
       - data entro cui pagare, IBAN e causale copiabili.
     ========================================================================== */
  function renderConferma(container, donationId) {
    const d = getDonations().find(x => x.id === donationId);
    if (!d) {
      container.innerHTML = `
        <section class="inner-page-hero">
          <div class="container narrow-container">
            ${breadcrumb([{ href: '#/home', label: 'Home' }, { label: 'Donazione non trovata' }])}
            <h1 class="page-main-heading">Donazione non trovata</h1>
            <p class="page-intro-lead">Non troviamo la donazione <code>${esc(donationId)}</code> in questo browser. Se hai donato da un altro dispositivo, trovi il riepilogo nell'email di conferma.</p>
            <div class="hero-cta-buttons">
              <a href="#/cerca" class="btn btn-primary-burgundy">Vai ai progetti</a>
              <a href="#/assistenza" class="btn btn-secondary-outline">Chiedi all'assistenza</a>
            </div>
          </div>
        </section>
      `;
      return;
    }

    const p = getProjectById(d.projectId);
    const s = getProjectStats(p);
    const pending = d.status === 'in_attesa_bonifico';
    const causale = `CrowdUniTO ${d.id} ${shortTitle(p)}`;
    const iban = 'IT60 X054 2811 1010 0000 0123 456';
    const methodLabel = d.method === 'carta' && d.cardLast4 ? `Carta che termina con ${d.cardLast4}` : PAY_METHODS[d.method];
    const projectUrl = window.location.href.split('#')[0] + '#/progetto/' + p.id;

    container.innerHTML = `
      <section class="inner-page-hero confirm-page">
        <div class="container narrow-container">
          ${breadcrumb([{ href: '#/home', label: 'Home' }, { href: `#/progetto/${p.id}`, label: shortTitle(p) }, { label: pending ? 'Donazione in attesa' : 'Donazione confermata' }])}

          <div class="confirm-status-card ${pending ? 'pending' : 'ok'}">
            <div class="confirm-status-icon" aria-hidden="true">${pending ? '⏳' : '✓'}</div>
            <div>
              <span class="confirm-status-badge">${pending ? 'In attesa del bonifico' : 'Donazione confermata'}</span>
              <h1>${pending ? 'Donazione registrata: manca il bonifico' : `Grazie ${esc(d.firstName)}, la tua donazione è confermata`}</h1>
              <p>${pending
                ? `Per completarla fai un bonifico con i dati qui sotto <strong>entro il ${esc(d.dueDate)}</strong>. Finché il bonifico non arriva, la donazione <strong>non viene conteggiata</strong> nella raccolta.`
                : `Abbiamo inviato la conferma e la ricevuta${d.wantReceipt ? ' per la deduzione fiscale' : ''} a <strong>${esc(d.email)}</strong>.`}</p>
            </div>
          </div>

          ${pending ? `
            <section class="transfer-box" aria-labelledby="transferTitle">
              <h2 id="transferTitle">Dati per il bonifico</h2>
              <dl class="copy-rows">
                <div><dt>Importo da versare</dt><dd><strong>${fmtEur(d.amount)}</strong></dd><dd><button type="button" class="copy-btn" data-copy="${d.amount}">Copia</button></dd></div>
                <div><dt>Intestatario</dt><dd>Università degli Studi di Torino</dd><dd><button type="button" class="copy-btn" data-copy="Università degli Studi di Torino">Copia</button></dd></div>
                <div><dt>IBAN <small>(di esempio)</small></dt><dd><code>${iban}</code></dd><dd><button type="button" class="copy-btn" data-copy="${iban.replace(/\s/g, '')}">Copia</button></dd></div>
                <div><dt>Causale</dt><dd><code>${esc(causale)}</code></dd><dd><button type="button" class="copy-btn" data-copy="${esc(causale)}">Copia</button></dd></div>
                <div><dt>Da pagare entro</dt><dd><strong>${esc(d.dueDate)}</strong></dd><dd></dd></div>
              </dl>
              <p class="transfer-note">Abbiamo inviato questi dati anche a <strong>${esc(d.email)}</strong>. Se il bonifico non arriva entro la scadenza la donazione viene annullata, senza costi.</p>
              <div class="prototype-control">
                <span>Solo per provare il prototipo:</span>
                <button type="button" class="btn btn-sm btn-outline-burgundy" id="btnSimulateTransfer">Simula l'arrivo del bonifico</button>
              </div>
            </section>
          ` : ''}

          <section class="confirm-summary" aria-labelledby="summaryTitle">
            <h2 id="summaryTitle">Riepilogo</h2>
            <dl>
              <div><dt>Progetto</dt><dd><a href="#/progetto/${p.id}">${esc(p.title)}</a></dd></div>
              <div><dt>${pending ? 'Importo da versare' : 'Importo donato'}</dt><dd>${fmtEur(d.amount)}</dd></div>
              <div><dt>Ricompensa</dt><dd>${d.rewardTitle ? esc(d.rewardTitle) : 'Nessuna'}</dd></div>
              <div><dt>Metodo di pagamento</dt><dd>${esc(methodLabel)}</dd></div>
              <div><dt>Tra i sostenitori</dt><dd>${d.anonymous ? 'Anonimo' : esc(d.firstName + ' ' + (d.lastName || '').charAt(0) + '.')}</dd></div>
              <div><dt>Codice donazione</dt><dd><code>${esc(d.id)}</code> · ${esc(d.dateLabel)}</dd></div>
            </dl>
          </section>

          <section class="confirm-progress" aria-labelledby="progressTitle">
            <h2 id="progressTitle">${esc(shortTitle(p))} adesso</h2>
            <div class="cs-progress-track big" aria-hidden="true"><span style="width:${Math.min(s.percentage, 100)}%"></span></div>
            <p>${pending
              ? `Raccolti ${fmtEur(s.collected)} su ${fmtEur(p.target)} (${s.percentage}%). Quando arriverà il tuo bonifico la raccolta salirà a ${fmtEur(s.collected + d.amount)}.`
              : `Grazie anche a te la raccolta è a ${fmtEur(s.collected)} su ${fmtEur(p.target)} (${s.percentage}%)${s.reachedGoal ? ': obiettivo raggiunto!' : `: mancano ${fmtEur(s.missing)} e ${p.daysLeft} giorni.`}`}</p>
          </section>

          <section class="confirm-next" aria-labelledby="nextTitle">
            <h2 id="nextTitle">Cosa succede adesso</h2>
            <ol>
              ${pending ? `<li><strong>Fai il bonifico entro il ${esc(d.dueDate)}.</strong> Ti avvisiamo via email quando lo riceviamo.</li>` : ''}
              <li><strong>La campagna resta aperta ancora ${p.daysLeft} giorni.</strong> ${s.reachedGoal ? 'L\'obiettivo è già raggiunto: alla scadenza l\'Università aggiungerà il cofinanziamento.' : 'Se raggiunge l\'obiettivo, l\'Università raddoppia quanto raccolto.'}</li>
              <li><strong>Se l'obiettivo non viene raggiunto</strong>, ti rimborsiamo ${fmtEur(d.amount)} sullo stesso metodo di pagamento, senza che tu debba fare nulla.</li>
              <li><strong>Segui il progetto:</strong> ${d.updatesOptIn ? 'riceverai gli aggiornamenti via email e ' : ''}li trovi sempre nella sezione «Aggiornamenti» della scheda.${d.rewardTitle ? ` La ricompensa «${esc(d.rewardTitle)}» arriva dopo la chiusura della campagna.` : ''}</li>
            </ol>
          </section>

          <div class="success-actions">
            <a href="#/progetto/${p.id}" class="btn btn-primary-burgundy btn-lg">Torna al progetto</a>
            <button type="button" class="btn btn-secondary-outline btn-lg" id="btnShareProject">Copia il link del progetto</button>
            <a href="#/cerca" class="btn btn-ghost btn-lg">Scopri altri progetti</a>
          </div>
        </div>
      </section>
    `;

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
        ta.remove();
        return ok;
      }
    }

    container.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await copyText(btn.getAttribute('data-copy'));
        btn.textContent = ok ? 'Copiato ✓' : 'Selezionalo a mano';
        btn.classList.toggle('copied', ok);
        setTimeout(() => { btn.textContent = 'Copia'; btn.classList.remove('copied'); }, 2500);
      });
    });

    const share = container.querySelector('#btnShareProject');
    share.addEventListener('click', async () => {
      const ok = await copyText(projectUrl);
      showToast(ok ? 'Link al progetto copiato: incollalo dove vuoi per condividerlo.' : 'Non è stato possibile copiare il link.', ok ? 'success' : 'warning');
    });

    const simulate = container.querySelector('#btnSimulateTransfer');
    if (simulate) {
      simulate.addEventListener('click', () => {
        const all = getDonations();
        const item = all.find(x => x.id === d.id);
        if (item) {
          item.status = 'confermata';
          writeJSON(DONATIONS_KEY, all);
        }
        showToast('Bonifico ricevuto: la donazione ora è confermata e conteggiata.', 'success');
        renderConferma(container, d.id);
        const h1 = container.querySelector('h1');
        if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus(); }
      });
    }
  }
  /**
   * PAGINA 8: FAQ (Domande Frequenti)
   * [REVISIONE] Riscritta a partire dai dati FAQ_ITEMS:
   *  - A1, euristica 8 (sev. 2): FAQ come lungo elenco senza temi → divise per pubblico e per argomento;
   *  - A1, euristica 10 (sev. 3): poche risposte per chi dona → aggiunte quelle su come si dona, pagamenti,
   *    bonifico, commissioni, dati personali, dopo la donazione;
   *  - le schede usavano role="tablist" senza tab/tabpanel → pulsanti con aria-pressed;
   *  - l'accordion non comunicava lo stato aperto/chiuso → aria-expanded + aria-controls;
   *  - #/faq?apri=<id> apre direttamente una risposta (usato da footer, ricerca e checkout).
   */
  function renderFaq(container, params) {
    const openId = params.get('apri');
    const openItem = FAQ_ITEMS.find(f => f.id === openId);
    let audience = (openItem && openItem.audience) || (params.get('pubblico') === 'ricercatori' ? 'ricercatori' : 'sostenitori');

    const groupsFor = aud => [...new Set(FAQ_ITEMS.filter(f => f.audience === aud).map(f => f.group))];

    function groupHtml(aud) {
      return groupsFor(aud).map(g => `
        <h2 class="faq-group-title">${esc(g)}</h2>
        ${FAQ_ITEMS.filter(f => f.audience === aud && f.group === g).map(f => `
          <div class="accordion-item ${f.id === openId ? 'open' : ''}" id="faq-${f.id}">
            <h3 class="accordion-heading">
              <button type="button" class="accordion-header" aria-expanded="${f.id === openId}" aria-controls="faq-body-${f.id}">
                <span>${esc(f.q)}</span>
                <span class="accordion-icon" aria-hidden="true">+</span>
              </button>
            </h3>
            <div class="accordion-body" id="faq-body-${f.id}">
              <p>${f.a}</p>
            </div>
          </div>
        `).join('')}
      `).join('');
    }

    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          ${breadcrumb([{ href: '#/home', label: 'Home' }, { label: 'FAQ' }])}
          <span class="section-pre-title">DOMANDE E RISPOSTE</span>
          <h1 class="page-main-heading">Domande frequenti</h1>
          <p class="page-intro-lead">
            Come si dona, cosa succede se un progetto non raggiunge l'obiettivo, ricevute e dati personali; e, per i ricercatori, come partecipare al bando.
          </p>
        </div>
      </section>

      <section class="section-faq-accordion">
        <div class="container" style="max-width: 900px;">
          <div class="faq-nav-tabs" role="group" aria-label="Scegli per chi sono le domande">
            <button type="button" class="faq-tab-btn ${audience === 'sostenitori' ? 'active' : ''}" data-audience="sostenitori" aria-pressed="${audience === 'sostenitori'}">Per chi sostiene i progetti</button>
            <button type="button" class="faq-tab-btn ${audience === 'ricercatori' ? 'active' : ''}" data-audience="ricercatori" aria-pressed="${audience === 'ricercatori'}">Per ricercatori e docenti UniTO</button>
          </div>

          <div class="faq-group-content" id="faq-sostenitori" ${audience === 'sostenitori' ? '' : 'hidden'}>
            ${groupHtml('sostenitori')}
          </div>
          <div class="faq-group-content" id="faq-ricercatori" ${audience === 'ricercatori' ? '' : 'hidden'}>
            ${groupHtml('ricercatori')}
          </div>

          <div class="faq-help-box">
            <h2>Non hai trovato la risposta?</h2>
            <p>Scrivici: ti risponde l'Ufficio Terza Missione &amp; Crowdfunding dell'Ateneo, di solito entro 2 giorni lavorativi.</p>
            <a href="#/assistenza" class="btn btn-primary-burgundy">Apri una richiesta di assistenza</a>
          </div>
        </div>
      </section>

      ${audience === 'ricercatori' ? renderBlueProposalBanner() : ''}
    `;

    // Schede Sostenitori / Ricercatori
    const tabs = container.querySelectorAll('.faq-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        audience = tab.getAttribute('data-audience');
        tabs.forEach(t => {
          const on = t === tab;
          t.classList.toggle('active', on);
          t.setAttribute('aria-pressed', String(on));
        });
        container.querySelector('#faq-sostenitori').hidden = audience !== 'sostenitori';
        container.querySelector('#faq-ricercatori').hidden = audience !== 'ricercatori';
      });
    });

    // Accordion
    container.querySelectorAll('.accordion-header').forEach(h => {
      h.addEventListener('click', () => {
        const item = h.closest('.accordion-item');
        const willOpen = !item.classList.contains('open');
        item.classList.toggle('open', willOpen);
        h.setAttribute('aria-expanded', String(willOpen));
      });
    });

    if (openItem) {
      const el = container.querySelector('#faq-' + openItem.id);
      if (el) setTimeout(() => {
        el.scrollIntoView({ block: 'start' });
        const btn = el.querySelector('.accordion-header');
        if (btn) btn.focus({ preventScroll: true });
      }, 60);
    }
  }

  /**
   * [NUOVO] PAGINA: COME FUNZIONA (per chi sostiene)
   * A1, euristica 10 (sev. 3): in IdeaGinger "Come funziona" e le FAQ erano pensate per il progettista;
   * chi dona non trovava come si svolge la donazione, quali passaggi, come vengono trattati i dati.
   * A1, euristica 4 (sev. 2): metodi di pagamento promessi ma non sempre disponibili → tabella con le regole.
   */
  function renderComeFunziona(container) {
    const example = MOCK_PROJECTS.find(p => getProjectStats(p).isOpen) || MOCK_PROJECTS[0];

    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          ${breadcrumb([{ href: '#/home', label: 'Home' }, { label: 'Come funziona' }])}
          <span class="section-pre-title">PER CHI SOSTIENE LA RICERCA</span>
          <h1 class="page-main-heading">Come funziona: sostenere un progetto in 4 passi</h1>
          <p class="page-intro-lead">
            Non serve registrarsi e bastano un paio di minuti. Se il progetto raggiunge l'obiettivo l'Università raddoppia quanto raccolto; se non lo raggiunge, ti rimborsiamo.
          </p>
        </div>
      </section>

      <section class="section-how-it-works how-page">
        <div class="container">
          <ol class="four-steps-grid">
            <li class="step-card">
              <div class="step-card-num">01</div>
              <h2 class="step-card-title">Scegli un progetto</h2>
              <p class="step-card-desc">Nel <a href="#/cerca">catalogo</a> trovi obiettivo, chi lo propone, come verranno usati i fondi e gli aggiornamenti del team.</p>
            </li>
            <li class="step-card">
              <div class="step-card-num">02</div>
              <h2 class="step-card-title">Scegli importo o ricompensa</h2>
              <p class="step-card-desc">Da 5 € in su. Le ricompense limitate mostrano sempre quanti posti restano.</p>
            </li>
            <li class="step-card">
              <div class="step-card-num">03</div>
              <h2 class="step-card-title">Inserisci i dati e paga</h2>
              <p class="step-card-desc">Nome, cognome ed email per la ricevuta. Carta, PayPal o bonifico. Prima di confermare vedi un riepilogo.</p>
            </li>
            <li class="step-card highlight">
              <div class="step-card-num">04</div>
              <h2 class="step-card-title">Segui i risultati</h2>
              <p class="step-card-desc">Ricevi la ricevuta e, se vuoi, gli aggiornamenti del team. Li trovi anche nella scheda del progetto.</p>
            </li>
          </ol>
        </div>
      </section>

      <section class="how-section">
        <div class="container how-two-cols">
          <div>
            <span class="section-pre-title">LASCI O RADDOPPI</span>
            <h2 class="section-title-large">Il cofinanziamento dell'Università</h2>
            <p>Quando una campagna raggiunge il 100% dell'obiettivo entro la scadenza, l'Università di Torino aggiunge una cifra pari a quella raccolta, fino a un massimo di 10.000 € per progetto.</p>
            <p>Prova con un esempio: <strong>${esc(example.title.split(':')[0])}</strong> ha un obiettivo di ${fmtEur(example.target)}.</p>
          </div>
          <div class="calc-card">
            <label for="calcAmount"><strong>Se dono…</strong></label>
            <div class="input-with-addon">
              <span aria-hidden="true">€</span>
              <input type="number" id="calcAmount" class="form-control" min="5" step="1" value="50" inputmode="numeric">
            </div>
            <div class="calc-result" id="calcResult" aria-live="polite"></div>
          </div>
        </div>
      </section>

      <section class="how-section alt">
        <div class="container">
          <span class="section-pre-title">TUTTO O NIENTE</span>
          <h2 class="section-title-large">Cosa succede alla scadenza</h2>
          <div class="scenario-grid">
            <div class="scenario-card ok">
              <h3>L'obiettivo è raggiunto</h3>
              <ul>
                <li>Il team riceve i fondi raccolti.</li>
                <li>L'Università aggiunge il cofinanziamento (fino a 10.000 €).</li>
                <li>Le ricompense vengono consegnate o spedite.</li>
              </ul>
            </div>
            <div class="scenario-card ko">
              <h3>L'obiettivo non è raggiunto</h3>
              <ul>
                <li>Il progetto non riceve nulla e non c'è cofinanziamento.</li>
                <li>Ti rimborsiamo l'intero importo, in automatico, sullo stesso metodo di pagamento.</li>
                <li>Non devi fare nulla.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="how-section">
        <div class="container">
          <span class="section-pre-title">PAGAMENTI</span>
          <h2 class="section-title-large">Metodi di pagamento</h2>
          <div class="calendar-table-wrap">
            <table class="styled-table">
              <caption class="sr-only">Metodi di pagamento e quando la donazione viene conteggiata</caption>
              <thead>
                <tr><th scope="col">Metodo</th><th scope="col">Quando conta la donazione</th><th scope="col">Da sapere</th></tr>
              </thead>
              <tbody>
                <tr><th scope="row">Carta di credito o debito</th><td>Subito</td><td>I dati della carta non vengono salvati dalla piattaforma.</td></tr>
                <tr><th scope="row">PayPal</th><td>Subito</td><td>Autorizzi il pagamento sul sito di PayPal.</td></tr>
                <tr><th scope="row">Bonifico bancario</th><td>Quando arriva il bonifico (1-2 giorni lavorativi)</td><td>Hai 5 giorni per pagare; fino ad allora la donazione risulta «in attesa».</td></tr>
                <tr><th scope="row">Satispay</th><td>Subito</td><td>Paga direttamente con la tua app Satispay (simulato nel prototipo).</td></tr>
              </tbody>
            </table>
          </div>
          <p class="how-note">La piattaforma non trattiene commissioni sulle donazioni: vengono sottratte solo quelle del metodo di pagamento, a carico del progetto.</p>
        </div>
      </section>

      <section class="how-section alt">
        <div class="container">
          <h2 class="section-title-large">Ricevuta, tasse e privacy</h2>
          <div class="three-steps-grid">
            <div class="step-card">
              <h3 class="step-card-title">Ricevuta e deduzione</h3>
              <p class="step-card-desc">Le donazioni alle università pubbliche sono deducibili dal reddito senza limiti di importo. <a href="#/faq?apri=detrazioni">Come funziona la ricevuta</a></p>
            </div>
            <div class="step-card">
              <h3 class="step-card-title">Donare in forma anonima</h3>
              <p class="step-card-desc">Puoi non comparire tra i sostenitori: il nome resta solo sulla ricevuta. <a href="#/faq?apri=anonimo">Dettagli</a></p>
            </div>
            <div class="step-card">
              <h3 class="step-card-title">I tuoi dati</h3>
              <p class="step-card-desc">Usiamo nome ed email solo per ricevuta e aggiornamenti. <a href="#/faq?apri=dati-personali">Come trattiamo i dati</a></p>
            </div>
          </div>
          <div class="how-cta-row">
            <a href="#/cerca" class="btn btn-primary-burgundy btn-lg">Scegli un progetto da sostenere</a>
            <a href="#/assistenza" class="btn btn-secondary-outline btn-lg">Hai altre domande? Scrivici</a>
          </div>
        </div>
      </section>
    `;

    const input = container.querySelector('#calcAmount');
    const out = container.querySelector('#calcResult');
    function update() {
      const amount = Math.round(Number(input.value)) || 0;
      if (amount < 5) {
        out.innerHTML = '<p class="calc-warning">L\'importo minimo è 5 €.</p>';
        return;
      }
      const s = getProjectStats(example);
      const matchable = Math.max(0, Math.min(amount, MATCHING_CAP - s.collected));
      out.innerHTML = `
        <p>Se la campagna raggiunge l'obiettivo, l'Università aggiunge <strong>${fmtEur(matchable)}</strong>.</p>
        <p class="calc-total">Alla ricerca arrivano <strong>${fmtEur(amount + matchable)}</strong>.</p>
        <p class="calc-small">Se invece l'obiettivo non viene raggiunto, ti vengono restituiti ${fmtEur(amount)}.</p>
      `;
    }
    input.addEventListener('input', update);
    update();
  }

  /**
   * [NUOVO] PAGINA: ASSISTENZA (#/assistenza)
   * A1, euristica 10 (sev. 2): mancava un modo diretto per chiedere aiuto/aprire un ticket; bisognava cercare
   * la pagina Contatti e scrivere un'email. Raggiungibile dalla barra in alto, dal footer, dalle FAQ e dal checkout.
   */
  function renderAssistenza(container, params) {
    const preProject = getProjectById(params.get('progetto') || '');

    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          ${breadcrumb([{ href: '#/home', label: 'Home' }, { label: 'Assistenza' }])}
          <span class="section-pre-title">SUPPORTO</span>
          <h1 class="page-main-heading">Assistenza: come possiamo aiutarti?</h1>
          <p class="page-intro-lead">Prima di scriverci, guarda se la risposta è tra queste. Altrimenti apri una richiesta: ti risponde l'Ufficio Terza Missione &amp; Crowdfunding.</p>
        </div>
      </section>

      <section class="section-assistenza">
        <div class="container assist-layout">
          <div>
            <div class="assist-quick">
              <h2>Risposte rapide</h2>
              <ul>
                ${['come-donare', 'bonifico', 'tutto-o-niente', 'detrazioni', 'dati-personali', 'chi-puo'].map(id => {
                  const f = FAQ_ITEMS.find(x => x.id === id);
                  return f ? `<li><a href="#/faq?apri=${f.id}">${esc(f.q)}</a></li>` : '';
                }).join('')}
              </ul>
            </div>

            <div class="enrollment-form-card" id="ticketBox">
              <h2 class="enrollment-title">Apri una richiesta di assistenza</h2>
              <p class="enrollment-desc">I campi con <span class="required">*</span> sono obbligatori.</p>
              <form id="ticketForm" class="styled-form-grid">
                <fieldset class="checkout-fieldset compact form-full" data-radio-group="ticketWho" data-msg-required="Indica chi sei: ci aiuta a smistare la richiesta.">
                  <legend>Chi sei? <span class="required">*</span></legend>
                  <div class="inline-radios">
                    <label><input type="radio" name="ticketWho" value="sostenitore" required ${preProject ? 'checked' : ''}> Donatore</label>
                    <label><input type="radio" name="ticketWho" value="ricercatore" required> Ricercatore o docente UniTO</label>
                    <label><input type="radio" name="ticketWho" value="altro" required> Altro</label>
                  </div>
                </fieldset>

                <div class="form-group">
                  <label for="ticketTopic">Argomento <span class="required">*</span></label>
                  <select id="ticketTopic" required class="form-control">
                    <option value="">-- Scegli l'argomento --</option>
                    <option value="pagamento" ${preProject ? 'selected' : ''}>Donazione e pagamenti</option>
                    <option value="ricevuta">Ricevuta e deduzione fiscale</option>
                    <option value="progetto">Domanda su un progetto</option>
                    <option value="candidatura">Candidatura e formazione</option>
                    <option value="account">Accesso e account</option>
                    <option value="dati">Dati personali e cancellazione</option>
                    <option value="altro">Altro</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="ticketProject">Progetto (facoltativo)</label>
                  <select id="ticketProject" class="form-control">
                    <option value="">-- Nessun progetto in particolare --</option>
                    ${MOCK_PROJECTS.map(p => `<option value="${p.id}" ${preProject && preProject.id === p.id ? 'selected' : ''}>${esc(p.title.split(':')[0])}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label for="ticketName">Nome e cognome <span class="required">*</span></label>
                  <input type="text" id="ticketName" required class="form-control" autocomplete="name">
                </div>
                <div class="form-group">
                  <label for="ticketEmail">Email per la risposta <span class="required">*</span></label>
                  <input type="email" id="ticketEmail" required class="form-control" autocomplete="email" placeholder="nome@email.it">
                </div>

                <div class="form-group form-full">
                  <label for="ticketMessage">Descrivi il problema o la domanda <span class="required">*</span></label>
                  <textarea id="ticketMessage" required minlength="20" maxlength="1000" rows="5" class="form-control" placeholder="Es. Ho scelto il bonifico ma non trovo più la causale da indicare."></textarea>
                </div>

                <div class="form-group form-full">
                  <label class="checkbox-label">
                    <input type="checkbox" id="ticketPrivacy" required data-msg-required="Per inviare la richiesta devi acconsentire all'uso dei dati per risponderti.">
                    <span>Acconsento all'uso dei miei dati solo per rispondere a questa richiesta <span class="required">*</span></span>
                  </label>
                </div>

                <div class="form-group form-full">
                  <button type="submit" class="btn btn-primary-burgundy btn-lg">Invia la richiesta</button>
                </div>
              </form>
            </div>
          </div>

          <aside class="assist-contacts" aria-labelledby="contactsTitle">
            <h2 id="contactsTitle">Altri contatti</h2>
            <p><strong>Email</strong><br><a href="mailto:crowdfunding@unito.it">crowdfunding@unito.it</a></p>
            <p><strong>Tempi di risposta</strong><br>Entro 2 giorni lavorativi.</p>
            <p><strong>Domande su un singolo progetto</strong><br>Puoi scrivere direttamente al team dalla sezione «Domande al team» della scheda del progetto.</p>
          </aside>
        </div>
      </section>
    `;

    const form = container.querySelector('#ticketForm');
    attachCounter(container.querySelector('#ticketMessage'));
    enhanceForm(form, {
      onValid: () => {
        const email = container.querySelector('#ticketEmail').value.trim();
        const ticket = 'CU-T-' + Math.floor(10000 + Math.random() * 90000);
        container.querySelector('#ticketBox').outerHTML = successPanel(
          'Richiesta inviata',
          `<p>Il numero della tua richiesta è <strong>${ticket}</strong>. Ti risponderemo a <strong>${esc(email)}</strong> entro 2 giorni lavorativi; conserva il numero per eventuali solleciti.</p>`,
          '<a href="#/home" class="btn btn-sm btn-outline-burgundy">Torna alla Home</a> <a href="#/faq" class="btn btn-sm btn-ghost">Consulta le FAQ</a>'
        );
        const panel = container.querySelector('.inline-success-panel');
        if (panel) { panel.scrollIntoView({ block: 'center' }); panel.focus({ preventScroll: true }); }
      }
    });
  }
  const ALLOWED_REDIRECTS = ['home', 'candidatura', 'profilo', 'formazione', 'proponi'];

  function safeRedirect(params) {
    const r = params.get('redirect');
    return ALLOWED_REDIRECTS.includes(r) ? r : 'home';
  }

  /**
   * PAGINA 9: LOGIN
   * [REVISIONE] Modifiche:
   *  - redirect: veniva gestito solo "candidatura"; da "Area personale" dopo l'accesso si finiva in Home;
   *  - email precompilata diversa da quella dell'accesso rapido; password già inserita → campi vuoti;
   *  - nome ricavato dall'email in MAIUSCOLO e con un solo punto sostituito → "Anna Maria Rossi";
   *  - A1, euristica 3 (sev. 2): mancava "Password dimenticata?" → nuova pagina #/recupera-password;
   *  - A1, euristica 4 (sev. 2): chi vuole solo donare non capiva se dovesse accedere → nota esplicita;
   *  - "Registrati qui" (link non descrittivo, come i "qui" criticati nell'A1);
   *  - errori persistenti accanto ai campi al posto dei fumetti del browser.
   */
  function renderLogin(container, params) {
    const redirect = safeRedirect(params);

    container.innerHTML = `
      <section class="auth-page-section">
        <div class="container auth-form-container">
          <div class="auth-card">
            <div class="auth-card-top">
              <div class="auth-crest" aria-hidden="true">🏛️</div>
              <h1 class="auth-title-h1">Accesso a CrowdUniTO</h1>
              <p>Autenticati con le tue credenziali universitarie (SCU UniTO) o con il tuo account Progettista.</p>
            </div>

            <div class="donor-no-account-note">
              <strong>Vuoi solo donare?</strong> Non serve un account: <a href="#/cerca">scegli un progetto</a> e dona come ospite.
            </div>

          


  

            <form id="loginForm" class="styled-form-grid">
              <div class="form-group form-full">
                <label for="loginEmail">Email <span class="required">*</span></label>
                <input type="email" id="loginEmail" required class="form-control" autocomplete="username" placeholder="nome.cognome@email.com o @unito.it">
              </div>

              <div class="form-group form-full">
                <label for="loginPassword">Password <span class="required">*</span></label>
                <input type="password" id="loginPassword" required class="form-control" autocomplete="current-password">
                <div class="password-row">
                  <label class="checkbox-label" style="font-size: 0.85rem; margin: 0; cursor: pointer;">
                    <input type="checkbox" id="showPassword"> <span>Mostra password</span>
                  </label>
                  <a href="#/recupera-password" class="text-link">Password dimenticata?</a>
                </div>
              </div>

              <div class="form-group form-full">
                <button type="submit" class="btn btn-secondary-outline btn-block btn-lg" id="btnSubmitLogin">
                  Accedi
                </button>
              </div>
            </form>

            <div class="auth-footer-links">
              <span>Sei un nuovo progettista? <a href="#/registrati?redirect=${redirect}" class="text-link">Crea un account progettista</a></span>
              <br>
              <a href="#/home" class="text-link" style="font-size: 0.85rem;">&larr; Torna alla Home</a>
            </div>
          </div>
        </div>
      </section>
    `;

    function doLogin(name, email, dept) {
      setCurrentUser({
        name,
        email,
        role: 'Professore Associato',
        department: dept || 'Dipartimento di Neuroscienze "Rita Levi Montalcini"'
      });
      showToast(`Benvenuto, ${name}!`, 'success');
      navigateTo('#/' + redirect);
    }

    const demoBtn = container.querySelector('#btnQuickDemoLogin');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        doLogin('Prof. Marco Bianchi', 'marco.bianchi@unito.it', 'Dipartimento di Neuroscienze "Rita Levi Montalcini"');
      });
    }

    const pwd = container.querySelector('#loginPassword');
    const showPwd = container.querySelector('#showPassword');
    if (showPwd && pwd) {
      showPwd.addEventListener('change', e => {
        pwd.type = e.target.checked ? 'text' : 'password';
      });
    }

    enhanceForm(container.querySelector('#loginForm'), {
      onValid: () => {
        const email = container.querySelector('#loginEmail').value.trim();
        const inferredName = email.split('@')[0].split(/[._-]+/).filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        doLogin(inferredName || 'Ricercatore UniTO', email);
      }
    });
  }

  /**
   * [NUOVO] PAGINA: RECUPERO PASSWORD (#/recupera-password)
   * A1, euristica 3 (sev. 2): nei login di IdeaGinger non c'era una procedura autonoma di ripristino.
   */
  function renderRecuperaPassword(container) {
    container.innerHTML = `
      <section class="auth-page-section">
        <div class="container auth-form-container">
          <div class="auth-card">
            ${breadcrumb([{ href: '#/home', label: 'Home' }, { href: '#/login', label: 'Accedi' }, { label: 'Recupera la password' }])}
            <div class="auth-card-top">
              <div class="auth-crest" aria-hidden="true">🔑</div>
              <h1 class="auth-title-h1">Recupera la password</h1>
              <p>Inserisci l'email dell'account progettista: ti invieremo un link per sceglierne una nuova.</p>
            </div>
            <div id="resetBox">
              <form id="resetForm" class="styled-form-grid">
                <div class="form-group form-full">
                  <label for="resetEmail">Email dell'account <span class="required">*</span></label>
                  <input type="email" id="resetEmail" required class="form-control" autocomplete="email" placeholder="nome.cognome@email.com o @unito.it">
                  <small class="form-hint">Accedi con le credenziali SCU UniTO? Quella password si recupera dal portale di Ateneo.</small>
                </div>
                <div class="form-group form-full">
                  <button type="submit" class="btn btn-primary-burgundy btn-block btn-lg">Invia il link di recupero</button>
                </div>
              </form>
            </div>
            <div class="auth-footer-links">
              <a href="#/login" class="text-link">&larr; Torna all'accesso</a>
            </div>
          </div>
        </div>
      </section>
    `;

    enhanceForm(container.querySelector('#resetForm'), {
      onValid: () => {
        const email = container.querySelector('#resetEmail').value.trim();
        container.querySelector('#resetBox').innerHTML = successPanel(
          'Controlla la tua email',
          `<p>Se <strong>${esc(email)}</strong> corrisponde a un account, riceverai un link valido per 30 minuti. Non lo trovi? Guarda nella cartella spam o <a href="#/assistenza">chiedi all'assistenza</a>.</p>`,
          '<a href="#/login" class="btn btn-sm btn-outline-burgundy">Torna all\'accesso</a>'
        );
        const panel = container.querySelector('.inline-success-panel');
        if (panel) panel.focus();
      }
    });
  }

  /**
   * PAGINA 10: REGISTRATI (Per Progettisti)
   * [REVISIONE] "Minimo 8 caratteri" era solo un segnaposto; email non controllata (@unito.it);
   * "Accedi qui" non descrittivo; redirect limitato a "candidatura".
   */
  function renderRegistrati(container, params) {
    const redirect = safeRedirect(params);

    container.innerHTML = `
      <section class="auth-page-section">
        <div class="container auth-form-container">
          <div class="auth-card">
            <div class="auth-card-top">
              <div class="auth-crest" aria-hidden="true">📝</div>
              <h1 class="auth-title-h1">Registrati a CrowdUniTO</h1>
              <p>Crea il tuo account per partecipare ai progetti e alle iniziative di ricerca.</p>
            </div>

            <div class="donor-no-account-note">
              <strong>Vuoi solo donare?</strong> Non serve un account: <a href="#/cerca">scegli un progetto</a> e dona come ospite.
            </div>

            <form id="registerForm" class="styled-form-grid">
              <div class="form-group">
                <label for="regFirstName">Nome <span class="required">*</span></label>
                <input type="text" id="regFirstName" required class="form-control" autocomplete="given-name" placeholder="Es. Chiara">
              </div>

              <div class="form-group">
                <label for="regLastName">Cognome <span class="required">*</span></label>
                <input type="text" id="regLastName" required class="form-control" autocomplete="family-name" placeholder="Es. Romano">
              </div>

              <div class="form-group form-full">
                <label for="regEmail">Email <span class="required">*</span></label>
                <input type="email" id="regEmail" required class="form-control" autocomplete="email" placeholder="chiara.romano@email.com o @unito.it">
              </div>

              <div class="form-group form-full">
                <label for="regDept">Dipartimento di afferenza <span class="required">*</span></label>
                <select id="regDept" required class="form-control">
                  <option value="">-- Seleziona il dipartimento --</option>
                  <option value="Dipartimento di Scienze della Vita">Dipartimento di Scienze della Vita</option>
                  <option value="Dipartimento di Neuroscienze">Dipartimento di Neuroscienze</option>
                  <option value="Dipartimento di Fisica">Dipartimento di Fisica</option>
                  <option value="Dipartimento di Informatica">Dipartimento di Informatica</option>
                  <option value="Dipartimento di Studi Storici">Dipartimento di Studi Storici</option>
                  <option value="DISAFA">DISAFA</option>
                  <option value="Altro">Altro Dipartimento</option>
                </select>
              </div>

              <div class="form-group form-full">
                <label for="regPassword">Crea una password <span class="required">*</span></label>
                <input type="password" id="regPassword" required minlength="8" class="form-control" autocomplete="new-password" aria-describedby="regPasswordHint">
                <small class="form-hint" id="regPasswordHint">Almeno 8 caratteri.</small>
              </div>

              <div class="form-group form-full">
                <label class="checkbox-label">
                  <input type="checkbox" id="regTerms" required data-msg-required="Per registrarti devi accettare l'informativa e il regolamento.">
                  <span>Accetto l'informativa sulla privacy di Ateneo e il regolamento di crowdfunding. <span class="required">*</span></span>
                </label>
              </div>

              <div class="form-group form-full">
                <button type="submit" class="btn btn-green-cta btn-block btn-lg" id="btnSubmitRegister">
                  Registrati
                </button>
              </div>
            </form>

            <div class="auth-footer-links">
              <span>Hai già un account? <a href="#/login?redirect=${redirect}" class="text-link">Accedi al tuo account</a></span>
              <br>
              <a href="#/home" class="text-link" style="font-size: 0.85rem;">&larr; Torna alla Home</a>
            </div>
          </div>
        </div>
      </section>
    `;

    enhanceForm(container.querySelector('#registerForm'), {
      onValid: () => {
        const firstName = container.querySelector('#regFirstName').value.trim();
        const lastName = container.querySelector('#regLastName').value.trim();
        const fullName = `${firstName} ${lastName}`.trim();
        setCurrentUser({
          name: fullName,
          firstName,
          lastName,
          email: container.querySelector('#regEmail').value.trim(),
          role: 'Progettista registrato',
          department: container.querySelector('#regDept').value
        });
        showToast(`Registrazione completata. Benvenuto ${fullName}!`, 'success');
        navigateTo('#/' + redirect);
      }
    });
  }
  /**
   * PAGINA 11: PROFILO / AREA PERSONALE
   */
  function renderProfilo(container) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigateTo('#/login?redirect=profilo');
      return;
    }

    // [REVISIONE] Venivano mostrate candidature e iscrizioni di tutti gli account usati nel browser.
    const proposals = readJSON(SUBMITTED_STORAGE_KEY, []).filter(pr => !pr.email || pr.email === currentUser.email);
    const enrollments = readJSON(TRAINING_ENROLL_KEY, []).filter(en => !en.email || en.email === currentUser.email);

    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          ${breadcrumb([{ href: '#/home', label: 'Home' }, { label: 'Area personale' }])}
          <span class="section-pre-title">DASHBOARD RICERCATORE</span>
          <h1 class="page-main-heading">Benvenuto, ${esc(currentUser.name)}</h1>
          <p class="page-intro-lead">
            Qui puoi monitorare lo stato di avanzamento delle tue proposte di ricerca inviate al comitato UniTO e le iscrizioni ai corsi di formazione.
          </p>
        </div>
      </section>

      <section class="section-profile-content">
        <div class="container">
          <div class="profile-layout-grid">
            <!-- Box Dati Utente -->
            <div class="profile-user-card">
              <div class="user-big-avatar" aria-hidden="true">👤</div>
              <h2 class="user-display-name">${esc(currentUser.name)}</h2>
              <p class="user-display-role">${esc(currentUser.role || 'Ricercatore UniTO')}</p>
              <p class="user-display-dept">${esc(currentUser.department || 'Università degli Studi di Torino')}</p>
              <p class="user-display-email">${esc(currentUser.email)}</p>
              <hr style="margin: 1.25rem 0; border: none; border-top: 1px solid var(--border-color);">
              <a href="#/candidatura" class="btn btn-green-cta btn-block btn-sm">+ Nuova Proposta</a>
              <button type="button" class="btn btn-outline-burgundy btn-block btn-sm" id="btnProfileLogout" style="margin-top: 0.5rem;">Esci dall'account</button>
            </div>

            <!-- Colonna Proposte e Iscrizioni -->
            <div class="profile-main-activity">
              <div class="activity-block">
                <h2>Le tue candidature (${proposals.length})</h2>
                ${proposals.length === 0 ? `
                  <div class="empty-state-notice">
                    <p>Non hai ancora inviato alcuna proposta di progetto.</p>
                    <a href="#/proponi" class="text-link">Scopri il percorso in 4 fasi e candida il tuo laboratorio &rarr;</a>
                  </div>
                ` : `
                  <div class="proposals-list-table">
                    ${proposals.map(p => `
                      <div class="proposal-row-card">
                        <div class="prop-row-top">
                          <span class="prop-protocol-tag">${esc(p.protocol)}</span>
                          <span class="prop-status-tag">${esc(p.status)}</span>
                        </div>
                        <h3 class="prop-title-text">${esc(p.title)}</h3>
                        <div class="prop-meta-details">
                          <span>Inviata il: <strong>${p.submittedAt}</strong></span>
                          <span>Obiettivo: <strong>${fmtEur(p.targetAmount)}</strong></span>
                          <span>Pacchetto: <strong>${esc(String(p.package).toUpperCase())}</strong></span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>

              <div class="activity-block" style="margin-top: 3rem;">
                <h2>Iscrizioni ai percorsi formativi (${enrollments.length})</h2>
                ${enrollments.length === 0 ? `
                  <div class="empty-state-notice">
                    <p>Nessuna iscrizione attiva ai moduli formativi.</p>
                    <a href="#/formazione" class="text-link">Consulta il calendario ed iscriviti a un'edizione &rarr;</a>
                  </div>
                ` : `
                  <ul class="enrollment-list-view">
                    ${enrollments.map(e => `
                      <li class="enroll-item">
                        <div>
                          <strong>${esc(e.sessionTitle || (TRAINING_SESSIONS.find(t => t.id === e.sessionId) || {}).title || e.sessionId)}</strong><br>
                          <small style="color: var(--text-muted);">Registrato il: ${new Date(e.enrolledAt).toLocaleDateString('it-IT')}</small>
                        </div>
                        <span class="status-enrolled-pill">✓ Confermato</span>
                      </li>
                    `).join('')}
                  </ul>
                `}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    const logoutBtn = container.querySelector('#btnProfileLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        setCurrentUser(null);
        showToast('Logout effettuato.', 'info');
        navigateTo('#/home');
      });
    }
  }
  /**
   * PAGINA 12: 404 IN ITALIANO (Vincolo esplicito da specifica)
   * Aggiungi una pagina 404 in italiano, con menu e link utili.
   */
  function render404(container, attemptedRoute) {
    container.innerHTML = `
      <section class="section-error-404">
        <div class="container error-404-wrapper">
          <div class="error-404-badge">ERRORE 404 • PAGINA NON TROVATA</div>

          <div class="error-visual-icon" aria-hidden="true">
            <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#8B1538" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          <h1 class="error-404-title">La pagina che cerchi non è disponibile</h1>
          <p class="error-404-lead">
            L'indirizzo che hai digitato (<code>#/${esc(attemptedRoute || '')}</code>) non corrisponde ad alcun esperimento o contenuto della piattaforma CrowdUniTO. Potrebbe essere stato rimosso o il link potrebbe contenere un refuso.
          </p>

          <!-- Barra di Ricerca Immediata sulla pagina 404 -->
          <div class="error-search-box">
            <form id="formSearch404" class="search-field-large">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="search" id="input404Search" placeholder="Cerca un progetto, un docente o un'informazione..." aria-label="Cerca nel sito">
              <button type="submit" class="btn btn-primary-burgundy btn-sm">Cerca</button>
            </form>
          </div>

          <!-- Mappa di Link Utili di Navigazione Richiesta -->
          <div class="error-useful-links-block">
            <h2 class="useful-links-heading">Link Utili per proseguire la navigazione:</h2>
            <div class="useful-links-grid">
              <a href="#/home" class="useful-link-card">
                <span class="card-icon" aria-hidden="true">🏠</span>
                <div>
                  <strong>Home Page</strong>
                  <small>Torna alla presentazione dell'iniziativa e ai progetti in evidenza</small>
                </div>
              </a>

              <a href="#/cerca" class="useful-link-card">
                <span class="card-icon" aria-hidden="true">🔬</span>
                <div>
                  <strong>Cerca Progetti</strong>
                  <small>Esplora il catalogo di tutte le campagne attive dell'Ateneo</small>
                </div>
              </a>

              <a href="#/proponi" class="useful-link-card">
                <span class="card-icon" aria-hidden="true">🚀</span>
                <div>
                  <strong>Proponi Progetto</strong>
                  <small>Scopri le 4 fasi per candidare la tua ricerca e raddoppiare i fondi</small>
                </div>
              </a>

              <a href="#/come-funziona" class="useful-link-card">
                <span class="card-icon" aria-hidden="true">💡</span>
                <div>
                  <strong>Come funziona</strong>
                  <small>Come si dona, metodi di pagamento e regola "tutto o niente"</small>
                </div>
              </a>

              <a href="#/assistenza" class="useful-link-card">
                <span class="card-icon" aria-hidden="true">🛟</span>
                <div>
                  <strong>Assistenza</strong>
                  <small>Non trovi quello che cerchi? Scrivici</small>
                </div>
              </a>

              <a href="#/faq" class="useful-link-card">
                <span class="card-icon" aria-hidden="true">❓</span>
                <div>
                  <strong>Domande Frequenti (FAQ)</strong>
                  <small>Chiarimenti sul raddoppio, deduzioni fiscali e regole del bando</small>
                </div>
              </a>
            </div>
          </div>

          <div style="margin-top: 2.5rem;">
            <a href="#/home" class="btn btn-primary-burgundy btn-lg">
              &larr; Torna alla Home Principale
            </a>
          </div>
        </div>
      </section>
    `;

    const form404 = container.querySelector('#formSearch404');
    if (form404) {
      form404.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = container.querySelector('#input404Search').value.trim();
        navigateTo(`#/cerca?q=${encodeURIComponent(q)}`);
      });
    }
  }
  /* ==========================================================================
     6. HEADER INTERATTIVO (Menu a tendina, Barra di Ricerca, Stato Auth)
     ========================================================================== */

  function closeDropdown() {
    const toggle = document.getElementById('cercaDropdownToggle');
    const menu = document.getElementById('cercaDropdownMenu');
    if (toggle && menu) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('show');
    }
  }

  function setupHeader() {
    // 1. Barra di ricerca nell'Header (ricerca globale: progetti + FAQ + pagine informative)
    const headerSearchForm = document.getElementById('headerSearchForm');
    const headerSearchInput = document.getElementById('headerSearchInput');

    if (headerSearchForm && headerSearchInput) {
      headerSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = headerSearchInput.value.trim();
        navigateTo(q ? `#/cerca?q=${encodeURIComponent(q)}` : '#/cerca');
      });
    }

    // 2. Menu a tendina "Cerca progetti", generato da CATEGORIES
    // [REVISIONE] role="menu"/"menuitem" senza navigazione con le frecce: ora è un elenco di link
    // che si chiude con Esc, uscendo col Tab o scegliendo una voce.
    const dropdownToggle = document.getElementById('cercaDropdownToggle');
    const dropdownMenu = document.getElementById('cercaDropdownMenu');

    if (dropdownToggle && dropdownMenu) {
      dropdownMenu.innerHTML = `
        <li><a href="#/cerca" class="dropdown-item-link"><strong>Tutte le campagne (${MOCK_PROJECTS.length})</strong></a></li>
        <li class="dropdown-divider" aria-hidden="true"></li>
        ${CATEGORIES.map(c => `
          <li><a href="#/cerca?cat=${c.id}" class="dropdown-item-link">
            <span class="dropdown-cat-icon" aria-hidden="true">${categoryIcon(c.id, 'currentColor', 18)}</span>
            ${esc(c.label)}
          </a></li>`).join('')}
      `;

      dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
        dropdownToggle.setAttribute('aria-expanded', String(!isExpanded));
        dropdownMenu.classList.toggle('show');
      });

      // Chiudi il menu se si clicca all'esterno
      document.addEventListener('click', (e) => {
        if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
          closeDropdown();
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
          closeDropdown();
          dropdownToggle.focus();
        }
      });
      dropdownMenu.addEventListener('focusout', (e) => {
        if (!dropdownMenu.contains(e.relatedTarget) && e.relatedTarget !== dropdownToggle) closeDropdown();
      });
    }

    // 3. Link alle aree nel footer, dalla stessa fonte del menu
    const footerExplore = document.getElementById('footerExploreLinks');
    if (footerExplore) {
      footerExplore.insertAdjacentHTML('beforeend', CATEGORIES.map(c => `<li><a href="#/cerca?cat=${c.id}">${esc(c.label)}</a></li>`).join(''));
    }

    // 4. Inizializza lo stato auth dell'header
    updateHeaderAuthUI();
  }

  function updateHeaderAuthUI() {
    const user = getCurrentUser();
    const authContainer = document.getElementById('headerAuthContainer');
    if (!authContainer) return;

    if (user) {
      // [REVISIONE] Il nome abbreviato prendeva le prime due parole ("Prof. Marco"): ora nome senza titolo.
      const shortName = String(user.name).replace(/^(Prof\.ssa|Prof\.|Dott\.ssa|Dott\.|Ing\.)\s*/i, '');
      authContainer.innerHTML = `
        <div class="header-user-badge">
          <a href="#/profilo" class="header-user-link" title="Vai alla tua area personale">
            <span class="user-avatar-sm" aria-hidden="true">👤</span>
            <span class="user-name-short">${esc(shortName)}</span>
          </a>
          <button type="button" class="btn-logout-header" id="btnHeaderLogout">Esci</button>
        </div>
      `;
      const btnLogout = document.getElementById('btnHeaderLogout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          setCurrentUser(null);
          showToast('Disconnessione effettuata.', 'info');
          navigateTo('#/home');
        });
      }
    } else {
      authContainer.innerHTML = `
        <a href="#/login" class="nav-auth-link btn-login">Accedi</a>
        <a href="#/registrati" class="nav-auth-link btn-register">Registrati <span class="reg-note"></span></a>
      `;
    }
  }

  /* [NUOVO] Link interni alla pagina ("#app-root", "#sez-fondi"...): spostano scroll e focus senza cambiare pagina.
     [REVISIONE] Prima lo skip link cambiava l'hash in "#app-root" e il router ricaricava la Home. */
  function setupInPageLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link || link.target === '_blank') return;
      const href = link.getAttribute('href');
      if (href.startsWith('#/') || href.length < 2) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    });
  }

  /* [NUOVO] Pulsante "Torna su" (A1, euristica 7, sev. 1) */
  function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    const toggle = () => { btn.hidden = window.scrollY < 700; };
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const h1 = document.querySelector('#app-root h1');
      if (h1) {
        h1.setAttribute('tabindex', '-1');
        h1.focus({ preventScroll: true });
      }
    });
    toggle();
  }

  /* ==========================================================================
     7. SISTEMA DI NOTIFICHE TOAST (Accessibilità e Feedback immediato)
     ========================================================================== */

  function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.setAttribute('role', type === 'warning' ? 'alert' : 'status');
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon" aria-hidden="true">${type === 'success' ? '✓' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span class="toast-msg"></span>
      </div>
      <button type="button" class="toast-close" aria-label="Chiudi la notifica">&times;</button>
    `;
    // [REVISIONE] Il messaggio (con nomi ed email digitati dall'utente) era inserito come HTML.
    toast.querySelector('.toast-msg').textContent = message;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    // [REVISIONE] 4,5 secondi sono pochi per leggere i messaggi più lunghi: la durata ora dipende dalla lunghezza.
    const duration = Math.min(9000, 3500 + message.length * 40);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /* ==========================================================================
     8. INIZIALIZZAZIONE DELL'APPLICAZIONE AL CARICAMENTO DELLA PAGINA
     ========================================================================== */

  window.addEventListener('DOMContentLoaded', () => {
    setupHeader();
    setupInPageLinks();
    setupBackToTop();
    window.addEventListener('hashchange', handleRouting);
    handleRouting();
  });

  // Esponi per eventuale debug didattico nella console del browser
  window.CrowdUniTO = {
    navigateTo,
    getCurrentUser,
    setCurrentUser,
    showToast,
    MOCK_PROJECTS,
    getDonations
  };

})();
