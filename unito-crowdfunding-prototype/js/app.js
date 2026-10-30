/**
 * CrowdUniTO - Piattaforma di Crowdfunding per la Ricerca dell'Università degli Studi di Torino
 * Logica Applicativa Client-Side, Hash Routing, Simulazione Autenticazione e Ricerca
 * Progetto didattico per il corso di Human-Computer Interaction (HCI)
 */

/*
 * [REVISIONE] 29/10/2026 — Revisione del codice
 * Convenzione dei commenti (cercate "[REVISIONE]" in index.html, app.js e style.css):
 *   CORRETTO      → errore sistemato nel codice, il commento spiega cosa non andava;
 *   DA DECIDERE   → scelta di design o di contenuto che spetta al gruppo: segnalata, non modificata;
 *   DA VERIFICARE → informazione di cui non abbiamo trovato una fonte.
 *
 * Problemi dell'Assignment 1 che il prototipo NON affronta ancora (DA DECIDERE se e come risolverli):
 *   - Euristica 9 (sev. 3): i form usano i fumetti nativi del browser ("Compila questo campo"), che spariscono
 *     e indicano un campo alla volta: è lo stesso difetto criticato nei login di IdeaGinger.
 *   - Euristica 10 (sev. 4): nella scheda progetto non c'è modo di contattare il team (problema "Contattami" di RePatch).
 *   - Euristica 1 (sev. 2): con il bonifico la donazione risulta subito "registrata con successo" e viene sommata al totale.
 *   - Euristica 5 (sev. 2): nella donazione "Nome e Cognome" è ancora un unico campo.
 *   - Euristica 3 (sev. 3): nel modulo di donazione non c'è un riepilogo né un passo "Indietro" che conservi i dati.
 *   - Euristica 3 (sev. 2): nel login manca "Password dimenticata?".
 *   - Euristica 10 (sev. 3): non c'è una pagina informativa per chi dona (come si dona, metodi di pagamento, dati personali).
 *   - Euristica 7 (sev. 1): manca il pulsante "Torna su" nelle pagine lunghe.
 *   - Euristica 10 (sev. 2): manca un pulsante ben visibile per chiedere assistenza / aprire un ticket.
 *   - Euristica 1 (sev. 1): le ricompense non dicono quanti posti restano ("X su Y").
 * Stile: molti titoli e pulsanti usano le Maiuscole Come In Inglese ("Esplora i Progetti Attivi");
 * in italiano si usa la maiuscola solo all'inizio. DA DECIDERE se uniformare.
 */
(function () {
  'use strict';

  /* ==========================================================================
     1. DATABASE MOCK LOCALE (Progetti, Formazione, FAQ, Pacchetti)
     ========================================================================== */

  // [REVISIONE] DA DECIDERE (contenuto): la regola del sito (e quella reale di Funds TOgether) è che al 100%
  // l'Ateneo aggiunge quanto raccolto "fino a un massimo di 10.000 €". Con obiettivi da 12.000 a 25.000 €
  // l'Ateneo non raddoppia: per NeuroPark (20.000 €) aggiunge 10.000 €, cioè il 50%. Quindi "Raddoppio UniTO 2x",
  // "Vale € 50 con il raddoppio!" e "Traguardo Raggiunto & Raddoppiato" sono falsi per 5 progetti su 6.
  // Due strade: (a) portare gli obiettivi a ≤ 10.000 € (le campagne reali 2026 vanno da 4.700 a 10.000 €);
  // (b) lasciare gli importi e cambiare i testi in "UniTO aggiunge fino a 10.000 €".
  const MOCK_PROJECTS = [
    {
      id: 'p1',
      title: 'NeuroPark: Riabilitazione in Realtà Virtuale per il Parkinson',
      category: 'salute',
      categoryLabel: 'Medicina & Salute',
      proponent: 'Prof.ssa Marina Rossi',
      department: 'Dipartimento di Neuroscienze "Rita Levi Montalcini"',
      excerpt: 'Sviluppiamo protocolli immersivi su misura per aiutare le persone con Parkinson a recuperare l\'autonomia motoria e cognitiva nella vita quotidiana.',
      description: 'Il progetto NeuroPark nasce dalla collaborazione tra neurologi, bioingegneri e fisioterapisti dell\'Università di Torino. L\'obiettivo è creare una suite software terapeutica fruibile tramite visori VR commerciali, abbattendo i costi della neuroriabilitazione e portandola anche a domicilio dei pazienti piemontesi con diagnosi precoce di morbo di Parkinson.',
      target: 20000,
      collected: 16400,
      percentage: 82,
      supporters: 148,
      daysLeft: 12,
      status: 'active',
      matchingActive: true,
      matchingCap: 10000,
      colorAccent: '#9F1239',
      imageGradient: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)',
      scientificGoal: 'Validazione clinica su 60 pazienti del presidio Molinette - Città della Salute di Torino.',
      budgetBreakdown: [
        { item: 'Acquisto 10 visori VR con eye-tracking', cost: '€ 6.500' },
        { item: 'Sviluppo scenari virtuali dedicati', cost: '€ 7.500' },
        { item: 'Borsa di ricerca semestrale per bioingegnere', cost: '€ 6.000' }
      ],
      rewards: [
        { amount: 25, title: 'Ringraziamento Scientifico', desc: 'Attestato digitale nominativo e iscrizione alla newsletter di avanzamento clinico.' },
        { amount: 75, title: 'Webinar Esclusivo', desc: 'Partecipazione al webinar con la Prof.ssa Rossi e dimostrazione dal vivo degli ambienti VR.' },
        { amount: 150, title: 'Visita ai Laboratori NeuroPark', desc: 'Invito per 2 persone al laboratorio di neuroscienze e prova guidata del visore terapeutico.' }
      ]
    },
    {
      id: 'p2',
      title: 'BioSensor: Rete di Piante Sentinella per l\'Aria di Torino',
      category: 'ambiente',
      categoryLabel: 'Ambiente & Clima',
      proponent: 'Dott. Andrea Bianchi',
      department: 'Dipartimento di Scienze della Vita e Biologia dei Sistemi',
      excerpt: 'Installazione di bio-indicatori vegetali e microsensori nei cortili scolastici torinesi per mappare e ridurre in tempo reale le polveri sottili (PM2.5 e PM10).',
      description: 'Una rete capillare di piante specificamente selezionate per la capacità di bio-accumulo di metalli pesanti e polveri, dotate di microsensori IoT a basso consumo. Il progetto coinvolge 15 istituti scolastici della Città Metropolitana di Torino in percorsi di citizen science partecipata.',
      target: 15000,
      collected: 15750,
      percentage: 105,
      supporters: 215,
      daysLeft: 0,
      status: 'funded',
      matchingActive: true,
      matchingCap: 10000,
      colorAccent: '#166534',
      imageGradient: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
      scientificGoal: 'Mappatura ad altissima risoluzione della qualità dell\'aria nei pressi degli edifici scolastici.',
      budgetBreakdown: [
        { item: 'Kit sensori IoT per 15 scuole', cost: '€ 5.000' },
        { item: 'Fornitura piante bio-indicatrici e piantumazione', cost: '€ 4.500' },
        { item: 'Piattaforma open data accessibile al pubblico', cost: '€ 5.500' }
      ],
      rewards: [
        { amount: 20, title: 'Amico delle Piante', desc: 'Kit di semi autoctoni piemontesi per impollinatori spedito a casa.' },
        { amount: 50, title: 'Adozione Pianta Sentinella', desc: 'Nome su una targhetta della pianta installata in una scuola e accesso al feed sensoriale in tempo reale.' }
      ]
    },
    {
      id: 'p3',
      title: 'Codices: Digitalizzazione dei Manoscritti Medievali di Ateneo',
      category: 'cultura',
      categoryLabel: 'Beni Culturali & Società',
      proponent: 'Prof.ssa Elena Giraudo',
      department: 'Dipartimento di Studi Storici',
      excerpt: 'Salviamo dal degrado fisico e rendiamo fruibili liberamente in alta definizione codici pergamenacei del Trecento custoditi nella Biblioteca Storica di UniTO.',
      description: 'Attraverso scanner multispettrali a luce fredda, il team di ricerca acquisirà e decifrerà palinsesti e note a margine finora illeggibili di oltre 40 manoscritti medievali piemontesi. I testi digitalizzati con licenza Creative Commons saranno consultabili liberamente da studiosi e cittadini di tutto il mondo.',
      target: 12000,
      collected: 11040,
      percentage: 92,
      supporters: 185,
      daysLeft: 5,
      status: 'active',
      matchingActive: true,
      matchingCap: 10000,
      colorAccent: '#92400E',
      imageGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      scientificGoal: 'Conservazione digitale permanente e trascrizione collaborativa aperta a studenti e ricercatori.',
      budgetBreakdown: [
        { item: 'Noleggio scanner planetario ad alta risoluzione', cost: '€ 5.200' },
        { item: 'Restauro conservativo preliminare delle legature', cost: '€ 3.800' },
        { item: 'Sviluppo viewer web IIIF ad accesso aperto', cost: '€ 3.000' }
      ],
      rewards: [
        { amount: 30, title: 'Segnalibro Storico', desc: 'Segnalibro tipografico artigianale con riproduzione di un capilettera miniato del XIV secolo.' },
        { amount: 100, title: 'Riproduzione Fine Art', desc: 'Stampa giclée su carta cotone numerata di una carta miniata medievale.' }
      ]
    },
    {
      id: 'p4',
      title: 'SaveAlpineBees: Salvaguardia dell\'Ape Nera nelle Valli di Lanzo',
      category: 'agro',
      categoryLabel: 'Agricoltura & Biodiversità',
      proponent: 'Prof. Luca Barberis',
      department: 'Dipartimento di Scienze Agrarie, Forestali e Alimentari (DISAFA)',
      excerpt: 'Tutela dell\'Apis mellifera mellifera autoctona delle valli alpine torinesi contro l\'ibridazione e gli impatti del cambiamento climatico.',
      description: 'Il progetto mira a mappare il patrimonio genetico delle popolazioni residue di Ape Nera Alpina in Piemonte, istituendo oasi di fecondazione protette in alta quota e corsi di formazione per gli apicoltori locali al fine di conservare la biodiversità dell\'ecosistema montano.',
      target: 18000,
      collected: 8100,
      percentage: 45,
      supporters: 92,
      daysLeft: 24,
      status: 'active',
      matchingActive: true,
      matchingCap: 10000,
      colorAccent: '#0D9488',
      imageGradient: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
      scientificGoal: 'Analisi del DNA di 120 colonie alpine e riforestazione con specie floreali mellifere native.',
      budgetBreakdown: [
        { item: 'Sequenziamento genetico campioni apiari', cost: '€ 7.000' },
        { item: 'Arnie elettroniche con bilancia e sensori di covata', cost: '€ 6.000' },
        { item: 'Piantumazione essenze nettarifere alpine', cost: '€ 5.000' }
      ],
      rewards: [
        { amount: 35, title: 'Vasetto Miele della Ricerca', desc: 'Vasetto da 250g di miele millefiori di alta montagna prodotto dalle arnie del progetto didattico.' },
        { amount: 120, title: 'Giornata in Apiario con il Ricercatore', desc: 'Visita guidata con tuta protettiva presso l\'apiario sperimentale di Grugliasco.' }
      ]
    },
    {
      id: 'p5',
      title: 'QuantumHealth: Algoritmi Quantistici per la Diagnosi Oncologica',
      category: 'tech',
      categoryLabel: 'Intelligenza Artificiale & STEM',
      proponent: 'Dott.ssa Chiara Romano',
      department: 'Dipartimento di Fisica & Dipartimento di Informatica',
      excerpt: 'Applicazione del Quantum Machine Learning all\'analisi genomica per anticipare le mutazioni resistenti alle terapie nel tumore al seno.',
      description: 'I calcolatori tradizionali impiegano settimane per processare le interazioni tra migliaia di biomarcatori genetici. Utilizzando emulatori di quantum annealing e computer quantistici del consorzio di ateneo, acceleriamo drasticamente la previsione delle terapie farmacologiche più efficaci per ciascuna singola paziente.',
      target: 25000,
      collected: 19500,
      percentage: 78,
      supporters: 164,
      daysLeft: 16,
      status: 'active',
      matchingActive: true,
      matchingCap: 10000,
      colorAccent: '#4F46E5',
      imageGradient: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
      scientificGoal: 'Algoritmo open-source validato su dataset di 1.200 profili genetici oncologici anonimizzati.',
      budgetBreakdown: [
        { item: 'Ore di calcolo su cluster e cloud quantistico QPU', cost: '€ 11.000' },
        { item: 'Validazione biologica dei target predetti', cost: '€ 8.000' },
        { item: 'Borsa di studio per giovane data scientist', cost: '€ 6.000' }
      ],
      rewards: [
        { amount: 50, title: 'Donatore per la Ricerca Quantistica', desc: 'Ringraziamento nominativo nel paper scientifico open-access e preprint via email.' },
        { amount: 200, title: 'Workshop "Fisica Quantistica & Medicina"', desc: 'Partecipazione al corso divulgativo di 1 giornata tenuto dai docenti del team.' }
      ]
    },
    {
      id: 'p6',
      title: 'InclusiveCity: Mappare e Abbattere le Barriere Invisibili a Torino',
      category: 'cultura',
      // [REVISIONE] CORRETTO: l'etichetta era "Società & Diritti" ma il progetto sta nell'area "cultura",
      // che nel menu e nei filtri si chiama "Beni Culturali & Società": la card mostrava un'area che non esiste.
      // DA DECIDERE: se l'area deve contenere anche progetti sociali, rinominatela ovunque in "Cultura & Società".
      categoryLabel: 'Beni Culturali & Società',
      proponent: 'Prof. Matteo Vercelli',
      department: 'Dipartimento di Culture, Politica e Società',
      excerpt: 'Una piattaforma georeferenziata co-creata con persone neurodivergenti per mappare sovraccarichi sensoriali, accessibilità cognitiva e barriere urbane.',
      description: 'Torino vista attraverso gli occhi di persone con autismo, ipersensibilità sensoriale e disabilità motorie invisibili. Ricercatori in sociologia urbana e psicologia cognitiva collaborano con associazioni di quartiere per produrre la prima "Mappa della Tranquillità e dell\'Accessibilità Civica" della città.',
      target: 10000,
      collected: 7300,
      percentage: 73,
      supporters: 115,
      daysLeft: 9,
      status: 'active',
      matchingActive: true,
      matchingCap: 10000,
      colorAccent: '#C026D3',
      imageGradient: 'linear-gradient(135deg, #FAE8FF 0%, #F5D0FE 100%)',
      scientificGoal: 'Linee guida di urbanistica accessibile per la Circoscrizione e la Città di Torino.',
      budgetBreakdown: [
        { item: 'Sviluppo app mobile di co-design partecipativo', cost: '€ 4.000' },
        { item: '10 Laboratori sensoriali sul campo con le famiglie', cost: '€ 3.500' },
        { item: 'Stampa e diffusione della guida cartacea accessibile', cost: '€ 2.500' }
      ],
      rewards: [
        { amount: 15, title: 'Sostenitore dell\'Inclusione', desc: 'Kit sticker d\'artista dedicati alla neurodiversità e mappa digitale in anteprima.' },
        { amount: 60, title: 'Partecipazione alla Mappatura Urbana', desc: 'Invito al walk-lab guidato nei quartieri storici con i ricercatori sociali.' }
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

  /* ==========================================================================
     2. GESTIONE DELLO STATO UTENTE (SIMULAZIONE CLIENT-SIDE LOCALSTORAGE)
     ========================================================================== */

  const AUTH_STORAGE_KEY = 'crowdunito_auth_user';
  const SUBMITTED_STORAGE_KEY = 'crowdunito_proposals';
  const TRAINING_ENROLL_KEY = 'crowdunito_training_enrollments';

  function getCurrentUser() {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  // [REVISIONE] CORRETTO: in Formazione, Candidatura e Profilo c'era JSON.parse(localStorage.getItem(...)) senza
  // try/catch: con lo storage non disponibile (navigazione privata, alcuni browser con file://) o un dato corrotto
  // la pagina restava bianca. Ora si usa questo helper.
  function readStoredList(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function writeStoredList(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      /* prototipo: se lo storage non è disponibile il dato resta solo in memoria */
    }
  }

  // [REVISIONE] CORRETTO: i testi scritti dall'utente (titolo della proposta, nome, testo cercato, indirizzo
  // sbagliato nella 404...) venivano inseriti con innerHTML così com'erano: un titolo con < o " rompeva
  // la pagina (e da URL si poteva iniettare codice). esc() li rende testo semplice.
  function esc(value) {
    return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  // [REVISIONE] CORRETTO: toLocaleString('it-IT') non mette il punto delle migliaia sui numeri di 4 cifre,
  // quindi in Home si leggeva "€ 8100" e "€ 7300" accanto a "€ 16.400". Formattatore unico per gli importi.
  function fmtNum(n) {
    return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    updateHeaderAuthUI();
  }

  /* ==========================================================================
     3. ROUTER CLIENT-SIDE BASATO SU HASH (#/...)
     ========================================================================== */

  function navigateTo(hash) {
    window.location.hash = hash;
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

    // Reset scroll in cima
    // [REVISIONE] CORRETTO: con behavior 'smooth' la nuova pagina appariva mentre lo scroll animato era ancora in corso
    // (si vedeva scorrere tutta la pagina). Salto immediato: va disattivato per un attimo anche lo
    // "scroll-behavior: smooth" impostato su <html> in style.css, che altrimenti si applica anche a scrollTo.
    const rootEl = document.documentElement;
    rootEl.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    rootEl.style.scrollBehavior = '';

    // Aggiorna stato attivo nella navigazione
    updateNavActive(path);

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
      renderFaq(appRoot);
    } else if (path === 'cerca') {
      renderCerca(appRoot, params);
    } else if (path.startsWith('progetto/')) {
      const projectId = path.replace('progetto/', '');
      // [REVISIONE] CORRETTO: con un id inesistente (es. #/progetto/p99) renderProgetto mostrava in silenzio
      // NeuroPark, cioè un progetto diverso da quello richiesto. Ora si apre la pagina 404.
      if (MOCK_PROJECTS.some(item => item.id === projectId)) {
        renderProgetto(appRoot, projectId);
      } else {
        render404(appRoot, path);
      }
    } else if (path === 'login') {
      renderLogin(appRoot, params);
    } else if (path === 'registrati') {
      renderRegistrati(appRoot, params);
    } else if (path === 'profilo') {
      renderProfilo(appRoot);
    } else {
      // Rotta sconosciuta -> Pagina 404
      render404(appRoot, path);
    }
  }

  function updateNavActive(currentPath) {
    // [REVISIONE] CORRETTO: "Cerca progetti" (pulsante del menu a tendina) non risultava mai attivo, neanche nel
    // catalogo o in una scheda progetto: l'utente non vedeva in che sezione si trovava.
    const dropdownToggle = document.getElementById('cercaDropdownToggle');
    if (dropdownToggle) {
      dropdownToggle.classList.toggle('active', currentPath === 'cerca' || currentPath.startsWith('progetto/'));
    }
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const targetPath = href.replace('#/', '');
      if (currentPath === targetPath || (currentPath === '' && targetPath === 'home')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
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
      <div class="percentage-circle-widget" style="width:${size}px; height:${size}px;" title="${percentage}% dell'obiettivo raggiunto">
        <svg viewBox="0 0 68 68" width="${size}" height="${size}" class="circle-svg" aria-hidden="true">
          <circle cx="34" cy="34" r="${radius}" class="circle-track"></circle>
          <circle cx="34" cy="34" r="${radius}" class="circle-indicator"
            stroke="${strokeColor}"
            stroke-dasharray="${circumference.toFixed(2)}"
            stroke-dashoffset="${strokeDashoffset.toFixed(2)}"
            transform="rotate(-90 34 34)">
          </circle>
        </svg>
        <div class="circle-inner-label">
          <span class="circle-pct-number">${percentage}%</span>
        </div>
      </div>
    `;
  }

  /**
   * Componente Card Progetto in stile Idea Ginger con cerchio di percentuale
   */
  function renderProjectCard(p) {
    return `
      <article class="ginger-project-card" data-category="${p.category}" id="card-${p.id}">
        <div class="card-thumb-wrap" style="background: ${p.imageGradient};">
          <div class="card-top-badges">
            <span class="badge-cat-tag">${p.categoryLabel}</span>
            ${p.matchingActive ? `
              <span class="badge-match-pill" title="L'Ateneo raddoppia i fondi al 100%">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Raddoppio UniTO 2x
              </span>
            ` : ''}
          </div>
          <!-- [REVISIONE] CORRETTO: l'icona era il simbolo del dollaro ($) su un sito che raccoglie euro. -->
          <div class="card-thumb-center-icon" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="${p.colorAccent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6.5A7 7 0 1 0 18 17.5"/><line x1="4" y1="10" x2="14" y2="10"/><line x1="4" y1="14" x2="14" y2="14"/>
            </svg>
          </div>
          <div class="card-status-flag ${p.status === 'funded' ? 'funded' : ''}">
            ${p.status === 'funded' ? '✓ Traguardo Raggiunto & Raddoppiato' : `${p.daysLeft} giorni rimasti`}
          </div>
        </div>

        <div class="card-content-area">
          <div class="card-proponent-info">
            <span class="unito-verified-check" title="Progetto verificato dall'Università di Torino">✓</span>
            <span class="department-name">${p.department}</span>
          </div>

          <h3 class="card-project-title">
            <a href="#/progetto/${p.id}" class="card-title-link">${p.title}</a>
          </h3>

          <p class="card-summary-text">${p.excerpt}</p>

          <div class="card-metrics-row">
            <div class="metrics-circle-col">
              ${renderPercentageCircle(p.percentage, 66)}
            </div>
            <div class="metrics-figures-col">
              <div class="metric-amount-gathered">€ ${fmtNum(p.collected)}</div>
              <div class="metric-amount-target">raccolti su <strong>€ ${fmtNum(p.target)}</strong></div>
              <div class="metric-supporters-count">${p.supporters} sostenitori attivi</div>
            </div>
          </div>

          <div class="card-actions-row">
            <a href="#/progetto/${p.id}" class="btn btn-card-detail">Scopri & Dona</a>
          </div>
        </div>
      </article>
    `;
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
            <div class="blue-strip-badge">Bando Ufficiale Ricerca UniTO • Edizione 2026/2027</div>
            <h2 id="banner-proposta-title" class="blue-strip-title">Porta la tua ricerca fuori dai laboratori: ti aiutiamo noi</h2>
            <p class="blue-strip-desc">${sub}</p>
            <div class="blue-strip-highlights">
              <span>✓ Formazione d'Ateneo gratuita</span>
              <span>✓ Consulenza 1-a-1 con un Campaign Manager</span>
              <span>✓ Matching Fund 1:1 fino a 10.000 €</span>
            </div>
          </div>
          <div class="blue-strip-action">
            <a href="${targetUrl}" class="btn-green-cta" id="btnPropostaBanner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Invia la tua proposta
            </a>
            <span class="blue-strip-subnote">
              ${currentUser ? 'Accesso effettuato come ' + currentUser.name : 'Richieste credenziali SCU UniTO o account Progettista'}
            </span>
          </div>
        </div>
      </section>
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
                <!-- [REVISIONE] DA VERIFICARE: "Fondo di Ateneo 5x1000" non risulta da nessuna fonte su Funds TOgether. -->
                <small>Fondo di Ateneo 5x1000</small>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Esplora i Progetti Attivi
              </a>
              <a href="#/proponi" class="btn btn-secondary-outline btn-lg">
                Sei un Ricercatore? Proponi Progetto
              </a>
            </div>
          </div>

          <!-- Colonna Destra: Box Garanzia & Numeri di Impatto -->
          <div class="hero-right-col">
            <div class="trust-summary-card">
              <div class="trust-card-header">
                <div class="trust-crest-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B1538" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <h3 class="trust-title">Certificazione & Garanzia UniTO</h3>
                  <p class="trust-subtitle">Tutti i progetti sono validati dal Comitato Tecnico-Scientifico</p>
                </div>
              </div>

              <div class="trust-numbers-grid">
                <div class="trust-num-box">
                  <span class="trust-big-num">€ 425.000</span>
                  <span class="trust-lbl">Fondi complessivi mobilitati</span>
                </div>
                <div class="trust-num-box">
                  <span class="trust-big-num">34</span>
                  <span class="trust-lbl">Laboratori finanziati</span>
                </div>
                <!-- [REVISIONE] DA DECIDERE: "Raddoppio garantito 100%" è fuorviante: il raddoppio scatta solo se la campagna
                     arriva al 100% e ha un tetto di 10.000 €. Anche "34 laboratori" e "€ 425.000" sono poco plausibili per un
                     programma con 5 progetti l'anno (Funds TOgether è alla 4ª edizione). -->
                <div class="trust-num-box">
                  <span class="trust-big-num">100%</span>
                  <span class="trust-lbl">Raddoppio garantito da UniTO</span>
                </div>
                <div class="trust-num-box">
                  <span class="trust-big-num">5.200+</span>
                  <span class="trust-lbl">Cittadini sostenitori</span>
                </div>
              </div>

              <div class="trust-tax-alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B45309" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <!-- [REVISIONE] DA CORREGGERE NEL TESTO (anche nelle FAQ): per le persone fisiche le donazioni alle università
                     sono DEDUCIBILI dal reddito senza limiti (art. 10, c. 1, lett. l-quater TUIR) se pagate con strumenti tracciabili;
                     "deducibili o detraibili" mescola due agevolazioni diverse. -->
                <span><strong>Benefici fiscali:</strong> Le donazioni alle università pubbliche sono <em>interamente deducibili o detraibili</em> ai sensi di legge (TUIR art. 10).</span>
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
              <h2 id="title-campagne" class="section-title-large">Progetti in evidenza aperti al sostegno</h2>
              <p class="section-sub-copy">Scegli la causa scientifica che vuoi sostenere e guarda la tua donazione moltiplicarsi grazie al fondo UniTO.</p>
            </div>
            <a href="#/cerca" class="link-view-all">Vedi tutte le 6 campagne nel catalogo &rarr;</a>
          </div>

          <!-- Filtri per Area Tematica -->
          <!-- [REVISIONE] CORRETTO: role="tablist" senza tab né pannelli era un uso sbagliato di ARIA (lo screen reader
               annunciava delle schede inesistenti) → gruppo di pulsanti con aria-pressed.
               CORRETTO anche "Agricoltura & Cibo": nel resto del sito l'area si chiama "Agricoltura & Biodiversità". -->
          <div class="home-pills-bar" role="group" aria-label="Filtro rapido progetti">
            <button class="pill-filter-btn active" data-cat="all" aria-pressed="true">Tutte le Aree (${MOCK_PROJECTS.length})</button>
            <button class="pill-filter-btn" data-cat="salute" aria-pressed="false">Medicina & Salute</button>
            <button class="pill-filter-btn" data-cat="ambiente" aria-pressed="false">Ambiente & Clima</button>
            <button class="pill-filter-btn" data-cat="cultura" aria-pressed="false">Beni Culturali & Società</button>
            <button class="pill-filter-btn" data-cat="tech" aria-pressed="false">Intelligenza Artificiale & STEM</button>
            <button class="pill-filter-btn" data-cat="agro" aria-pressed="false">Agricoltura & Biodiversità</button>
          </div>

          <!-- Griglia Card Progetti con Cerchio Percentuale -->
          <div class="projects-flex-grid" id="homeCardsContainer">
            ${MOCK_PROJECTS.map(p => renderProjectCard(p)).join('')}
          </div>
        </div>
      </section>

      <!-- Come Funziona il Meccanismo Lasci o Raddoppi -->
      <section class="section-how-it-works" aria-labelledby="how-title">
        <div class="container">
          <div class="center-heading-block">
            <span class="section-pre-title">IL MODELLO VIRTUOSO</span>
            <h2 id="how-title" class="section-title-large">Come funziona la formula "Lasci o Raddoppi"?</h2>
            <p class="section-sub-copy">Un patto trasparente di co-finanziamento tra cittadini, ricercatori e l'Università degli Studi di Torino.</p>
          </div>

          <div class="three-steps-grid">
            <div class="step-card">
              <div class="step-card-num">01</div>
              <h3 class="step-card-title">Il Team di Ricerca lancia la Campagna</h3>
              <p class="step-card-desc">
                Docenti, assegnisti e ricercatori UniTO definiscono un obiettivo economico trasparente (es. 10.000 €) per finanziare una linea di studio o una tecnologia specifica.
              </p>
            </div>
            <div class="step-card">
              <div class="step-card-num">02</div>
              <h3 class="step-card-title">I Cittadini donano e diffondono</h3>
              <p class="step-card-desc">
                Sostenitori, famiglie, pazienti e aziende donano online con carta o bonifico. Per tutta la durata della campagna il cerchio percentuale mostra i progressi in tempo reale.
              </p>
            </div>
            <div class="step-card highlight">
              <div class="step-card-num">03</div>
              <h3 class="step-card-title">Al 100% UniTO Raddoppia i Fondi!</h3>
              <p class="step-card-desc">
                Se il traguardo viene raggiunto entro la scadenza, l'Ateneo versa una cifra pari a quella raccolta dai cittadini (regola del matching 1:1), raddoppiando l'impatto scientifico!
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Fascia blu con pulsante verde "Invia la tua proposta" -->
      ${renderBlueProposalBanner()}
    `;

    // Attacca listener per i filtri delle pillole in Home
    const pills = container.querySelectorAll('.pill-filter-btn');
    const cards = container.querySelectorAll('.ginger-project-card');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');
        const cat = pill.getAttribute('data-cat');

        cards.forEach(card => {
          if (cat === 'all' || card.getAttribute('data-category') === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
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
            <h2 id="fasi-heading" class="section-title-large">Il Percorso in 4 Fasi</h2>
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
                <!-- [REVISIONE] DA DECIDERE: la quota di 350 € + IVA viene dall'analisi di IdeaGinger (A1). Nel regolamento
                     reale di Funds TOgether (UniTO, 2024) l'apertura del profilo per i team selezionati è gratuita.
                     Se la tenete, va bene, ma è una scelta da motivare nella relazione. -->
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
                <!-- [REVISIONE] CORRETTO: qui c'era "max 2.000 battute", nel modulo di candidatura "massimo 1.500 caratteri". -->
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

    // [REVISIONE] CORRETTO: il link "Consulta la Fase 4" della pagina Pacchetti portava all'inizio di questa pagina.
    // Ora #/proponi?fase=4 scorre direttamente alla fase indicata.
    const fase = params && params.get('fase');
    const faseEl = fase ? container.querySelector('#fase-' + fase) : null;
    if (faseEl) {
      setTimeout(() => faseEl.scrollIntoView({ block: 'start' }), 50);
    }
  }

  /**
   * PAGINA 3: FORMAZIONE (Fase 1)
   * Calendario con data di inizio, modalità, iscrizione simulata.
   */
  function renderFormazione(container) {
    const enrollments = readStoredList(TRAINING_ENROLL_KEY);
    const currentUser = getCurrentUser();

    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/home">Home</a> &rsaquo; <a href="#/proponi">Proponi progetto</a> &rsaquo; <span>Formazione & Calendario</span>
          </div>
          <span class="section-pre-title">FASE 1 • PREPARAZIONE AL CROWDFUNDING</span>
          <h1 class="page-main-heading">Formazione & Risorse per Ricercatori</h1>
          <p class="page-intro-lead">
            La preparazione è il fattore chiave per superare il 100% della raccolta fondi e sbloccare il raddoppio UniTO. L'Ateneo organizza cicli formativi gratuiti tenuti da professionisti della comunicazione scientifica e della raccolta fondi.
          </p>
        </div>
      </section>

      <section class="section-training-details">
        <div class="container">
          <!-- Moduli Didattici -->
          <div class="training-modules-overview">
            <h2 class="section-title-large">I 3 Moduli del Percorso Formativo</h2>
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
              <h2 class="section-title-large">Calendario delle Prossime Edizioni 2026/2027</h2>
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
                              Seleziona questa Edizione
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
                <h3 class="enrollment-title">Modulo di Iscrizione Simulata al Percorso</h3>
                <p class="enrollment-desc">L'iscrizione è riservata al personale di ricerca e docenza dell'Università di Torino.</p>
              </div>
            </div>

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
                <input type="text" id="enrollName" required class="form-control" placeholder="Es. Prof. Marco Bianchi" value="${currentUser ? esc(currentUser.name) : ''}">
              </div>

              <div class="form-group">
                <label for="enrollEmail">Email Istituzionale UniTO (@unito.it) <span class="required">*</span></label>
                <!-- [REVISIONE] CORRETTO: l'etichetta chiede un'email @unito.it ma il campo accettava qualsiasi indirizzo. -->
                <input type="email" id="enrollEmail" required pattern=".+@unito\\.it" title="Usa il tuo indirizzo istituzionale che termina con @unito.it" class="form-control" placeholder="nome.cognome@unito.it" value="${currentUser ? esc(currentUser.email) : ''}">
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
                  Conferma Iscrizione Gratuita al Corso
                </button>
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 1rem;">
                  Simulazione interattiva: i dati vengono salvati localmente nel browser.
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
    const form = container.querySelector('#trainingEnrollForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const sessionId = selectDropdown.value;
        const name = container.querySelector('#enrollName').value.trim();
        const email = container.querySelector('#enrollEmail').value.trim();
        const dept = container.querySelector('#enrollDepartment').value;
        const role = container.querySelector('#enrollRole').value;

        if (!sessionId || !name || !email || !dept) {
          showToast('Compila tutti i campi obbligatori contrassegnati da asterisco.', 'warning');
          return;
        }

        const enrollments = readStoredList(TRAINING_ENROLL_KEY);
        // [REVISIONE] CORRETTO: ci si poteva iscrivere più volte alla stessa edizione (e il profilo mostrava doppioni).
        if (enrollments.some(en => en.sessionId === sessionId && en.email === email)) {
          showToast('Risulti già iscritto a questa edizione con questo indirizzo email.', 'warning');
          selectDropdown.focus();
          return;
        }
        enrollments.push({
          sessionId,
          name,
          email,
          dept,
          role,
          enrolledAt: new Date().toISOString()
        });
        writeStoredList(TRAINING_ENROLL_KEY, enrollments);

        showToast(`Iscrizione confermata con successo per ${name}! Riceverai il link di accesso a ${email}.`, 'success');
        renderFormazione(container);
      });
    }
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
          <h1 class="page-main-heading">Pacchetti di Accompagnamento e Consulenza</h1>
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
                <input type="text" id="customContactName" required class="form-control" placeholder="Es. Prof.ssa Giulia Valenti">
              </div>

              <div class="form-group">
                <label for="customContactEmail">Email @unito.it <span class="required">*</span></label>
                <input type="email" id="customContactEmail" required pattern=".+@unito\\.it" title="Usa il tuo indirizzo istituzionale che termina con @unito.it" class="form-control" placeholder="giulia.valenti@unito.it">
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
                <textarea id="customContactMessage" required class="form-control" rows="3" placeholder="Indica il dipartimento promotore, se vi sono partner esterni e quali elementi desideri includere nel preventivo su misura..."></textarea>
              </div>

              <div class="form-group form-full">
                <button type="submit" class="btn btn-primary-burgundy btn-lg" id="btnSubmitCustomContact">
                  Invia Richiesta per Pacchetto Personalizzato
                </button>
              </div>
            </form>
          </div>

          <div style="margin-top: 3rem; text-align: center;">
            <!-- [REVISIONE] CORRETTO: entrambi i link portavano all'inizio di "Proponi", anche quello che prometteva la Fase 4. -->
            <p>Sei pronto per il passaggio successivo? <a href="#/proponi?fase=4" class="text-link">Consulta la Fase 4: Cofinanziamento e messa online</a> oppure torna alla <a href="#/proponi" class="text-link">panoramica del percorso</a>.</p>
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
    const customForm = container.querySelector('#customPackageForm');
    if (customForm) {
      customForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = container.querySelector('#customContactName').value.trim();
        const email = container.querySelector('#customContactEmail').value.trim();
        showToast(`Grazie ${name}! La tua richiesta per il Pacchetto Personalizzato è stata presa in carico. Ti risponderemo a ${email} entro 48 ore.`, 'success');
        customForm.reset();
      });
    }
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
            <h1 class="page-main-heading">Candidatura Progetto di Ricerca</h1>
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
            <button class="btn-text-logout" id="btnLogoutInForm" title="Esci dall'account">[Disconnetti]</button>
          </div>
          <span class="section-pre-title">FASE 2 • INVIO DELLA PROPOSTA AL COMITATO</span>
          <h1 class="page-main-heading">Modulo Ufficiale di Candidatura Progetto</h1>
          <p class="page-intro-lead">
            Compila i dettagli scientifici ed economici della tua proposta di crowdfunding. Il Comitato Tecnico-Scientifico di UniTO valuterà la candidatura e ti comunicherà l'esito formale entro <strong>15 giorni lavorativi</strong>.
          </p>
        </div>
      </section>

      <section class="section-application-form">
        <div class="container">
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
                  <input type="text" id="propName" required class="form-control" value="${esc(currentUser.name)}">
                </div>

                <div class="form-group">
                  <label for="propEmail">Email Istituzionale UniTO <span class="required">*</span></label>
                  <input type="email" id="propEmail" required pattern=".+@unito\\.it" title="Usa il tuo indirizzo istituzionale che termina con @unito.it" class="form-control" value="${esc(currentUser.email)}">
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
                <input type="text" id="propTitle" required class="form-control" placeholder="Es. BioSensor: Monitoraggio della qualità dell'aria con piante sentinella">
                <small class="form-hint">Scegli un titolo breve, chiaro e accattivante per il pubblico non specialistico.</small>
              </div>

              <div class="form-grid-two-cols">
                <div class="form-group">
                  <label for="propCategory">Ambito Tematico di Ricerca <span class="required">*</span></label>
                  <!-- [REVISIONE] CORRETTO: le etichette erano diverse da quelle del catalogo (es. "Agricoltura, Cibo & Biodiversità").
                       DA DECIDERE: "Scienze Sociali, Giuridiche ed Economiche" non esiste come area nel catalogo:
                       aggiungetela al sito oppure toglietela da qui. -->
                  <select id="propCategory" required class="form-control">
                    <option value="salute">Medicina & Salute</option>
                    <option value="ambiente">Ambiente & Clima</option>
                    <option value="cultura">Beni Culturali & Società</option>
                    <option value="tech">Intelligenza Artificiale & STEM</option>
                    <option value="agro">Agricoltura & Biodiversità</option>
                    <option value="sociale">Scienze Sociali, Giuridiche ed Economiche</option>
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
                <label for="propAbstract">Abstract Divulgativo (Massimo 1.500 caratteri) <span class="required">*</span></label>
                <!-- [REVISIONE] CORRETTO: il limite di 1.500 caratteri era solo scritto nell'etichetta, non applicato. -->
                <textarea id="propAbstract" required maxlength="1500" class="form-control" rows="4" placeholder="Spiega in parole semplici: qual è il problema affrontato? Come risolverà la situazione questo progetto? Perché i cittadini dovrebbero donare?"></textarea>
              </div>

              <div class="form-group form-full">
                <label for="propImpact">Impatto sul Territorio e Terza Missione <span class="required">*</span></label>
                <textarea id="propImpact" required class="form-control" rows="3" placeholder="Quali ricadute concrete avrà la ricerca sulla cittadinanza piemontese e sulla società?"></textarea>
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
                  <input type="number" id="propTargetAmount" required class="form-control" min="2000" max="50000" step="500" value="10000">
                  <small class="form-hint">Cifra che verrà raccolta presso sostenitori privati e cittadini.</small>
                </div>

                <div class="form-group">
                  <label for="propMatchingAmount">Cofinanziamento Richiesto a UniTO (€)</label>
                  <input type="text" id="propMatchingAmount" readonly class="form-control readonly-input" value="€ 10.000 (Raddoppio 100%)">
                  <small class="form-hint">L'Ateneo raddoppia i fondi fino a un tetto massimo di 10.000 €.</small>
                </div>
              </div>

              <div class="form-group form-full">
                <label for="propBudgetPlan">Sintesi delle Principali Voci di Spesa <span class="required">*</span></label>
                <textarea id="propBudgetPlan" required class="form-control" rows="3" placeholder="Es. Strumentazione e reagenti di laboratorio: 4.000 €; Borsa di ricerca studente: 4.000 €; Materiali di divulgazione ed eventi con le scuole: 2.000 €"></textarea>
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
                Hai bisogno di dettagli sui servizi? <a href="#/pacchetti" class="text-link" target="_blank">Rivedi la tabella comparativa dei pacchetti &nearr;</a>
              </div>
            </fieldset>

            <!-- SEZIONE 5: CONFERMA E INVIO -->
            <div class="form-confirm-box">
              <label class="checkbox-label">
                <input type="checkbox" required id="propAcceptTerms">
                <span>Dichiaro di aver preso visione del bando di Ateneo <strong>"Lasci o Raddoppi"</strong> e confermo che la proposta è stata condivisa con il Direttore del Dipartimento promotore.</span>
              </label>

              <div class="form-submit-row">
                <button type="submit" class="btn btn-green-submit btn-lg" id="btnSubmitProposal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Invia la tua proposta al Comitato UniTO
                </button>
                <a href="#/proponi" class="btn btn-ghost">Annulla</a>
              </div>
            </div>
          </form>
        </div>
      </section>
    `;

    // Calcolo reattivo della quota raddoppio
    const targetInput = container.querySelector('#propTargetAmount');
    const matchingOutput = container.querySelector('#propMatchingAmount');
    if (targetInput && matchingOutput) {
      targetInput.addEventListener('input', () => {
        const val = parseFloat(targetInput.value) || 0;
        const matching = Math.min(val, 10000);
        matchingOutput.value = `€ ${fmtNum(matching)} (Raddoppio ${matching === val ? '100%' : 'fino al cap di 10.000 €'})`;
      });
    }

    // Radio selection card active state
    // [REVISIONE] CORRETTO: l'evidenziazione seguiva solo il click del mouse; cambiando pacchetto con le frecce della
    // tastiera la card evidenziata non corrispondeva al pacchetto selezionato. Ora segue l'evento "change".
    const radioCards = container.querySelectorAll('.package-radio-card');
    radioCards.forEach(card => {
      card.querySelector('input').addEventListener('change', () => {
        radioCards.forEach(c => c.classList.toggle('selected', c.querySelector('input').checked));
      });
    });

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
    const form = container.querySelector('#projectProposalForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = container.querySelector('#propTitle').value.trim();
        const abstract = container.querySelector('#propAbstract').value.trim();
        const target = container.querySelector('#propTargetAmount').value;
        const selectedPkg = container.querySelector('input[name="selectedPackage"]:checked')?.value || 'avanzato';

        const protocolNumber = 'UNITO-CROWD-2026-' + Math.floor(10000 + Math.random() * 90000);

        // Salva la proposta nel localStorage
        const proposals = readStoredList(SUBMITTED_STORAGE_KEY);
        proposals.unshift({
          protocol: protocolNumber,
          title,
          proponent: currentUser.name,
          email: currentUser.email,
          department: container.querySelector('#propDepartment').value,
          targetAmount: target,
          package: selectedPkg,
          submittedAt: new Date().toLocaleDateString('it-IT'),
          status: 'In Valutazione (Esito entro 15 gg)'
        });
        writeStoredList(SUBMITTED_STORAGE_KEY, proposals);

        // Schermata di successo
        container.innerHTML = `
          <section class="inner-page-hero">
            <div class="container">
              <div class="submission-success-card">
                <div class="success-checkmark-circle">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span class="badge-success-tag">CANDIDATURA TRASMESSA CON SUCCESSO</span>
                <h1 class="success-title">Proposta inviata al Comitato Scientifico UniTO</h1>
                <p class="success-lead">
                  La proposta di ricerca <strong>"${esc(title)}"</strong> è stata acquisita dal sistema di ateneo con il protocollo:
                </p>
                <div class="protocol-box">
                  <span class="protocol-label">Numero di Protocollo Ufficiale:</span>
                  <strong class="protocol-code">${protocolNumber}</strong>
                </div>

                <div class="success-next-steps">
                  <h3>Cosa succederà adesso?</h3>
                  <div class="next-steps-list">
                    <div class="step-item">
                      <strong>1. Valutazione Accademica:</strong> Il comitato di esperti esaminerà i criteri di fattibilità entro <strong>15 giorni lavorativi</strong>.
                    </div>
                    <div class="step-item">
                      <strong>2. Riscontro via Email:</strong> Riceverai la comunicazione formale all'indirizzo istituzionale <em>${esc(currentUser.email)}</em>.
                    </div>
                    <div class="step-item">
                      <strong>3. Assegnazione Campaign Manager:</strong> In caso di esito positivo verrai contattato per avviare la Fase 3 con il pacchetto scelto (${selectedPkg.toUpperCase()}).
                    </div>
                  </div>
                </div>

                <div class="success-actions">
                  <a href="#/home" class="btn btn-primary-burgundy btn-lg">Torna alla Home</a>
                  <a href="#/profilo" class="btn btn-secondary-outline btn-lg">Visualizza le mie candidature</a>
                </div>
              </div>
            </div>
          </section>
        `;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /**
   * PAGINA 6: CERCA PROGETTI (Catalogo con ricerca live e filtri)
   */
  function renderCerca(container, params) {
    const initialQuery = params.get('q') || '';
    const initialCategory = params.get('cat') || 'all';

    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/home">Home</a> &rsaquo; <span>Cerca progetti</span>
          </div>
          <span class="section-pre-title">CATALOGO DELLA RICERCA</span>
          <h1 class="page-main-heading">Cerca le Campagne di Ricerca UniTO</h1>
          <p class="page-intro-lead">
            Esplora tutte le iniziative di crowdfunding attive e concluse dei dipartimenti dell'Università degli Studi di Torino.
          </p>
        </div>
      </section>

      <section class="section-search-workspace">
        <div class="container">
          <!-- Barra dei Filtri e Ricerca Live -->
          <div class="search-filter-controls-card">
            <div class="search-field-large">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="search" id="catalogSearchInput" placeholder="Cerca per titolo, docente, dipartimento o parola chiave..." value="${esc(initialQuery)}" aria-label="Cerca progetti">
            </div>

            <div class="filter-dropdowns-row">
              <div class="dropdown-item">
                <label for="filterCategorySelect">Area Disciplinare:</label>
                <select id="filterCategorySelect" class="form-control-sm">
                  <option value="all" ${initialCategory === 'all' ? 'selected' : ''}>Tutte le Aree (${MOCK_PROJECTS.length})</option>
                  <option value="salute" ${initialCategory === 'salute' ? 'selected' : ''}>Medicina & Salute</option>
                  <option value="ambiente" ${initialCategory === 'ambiente' ? 'selected' : ''}>Ambiente & Clima</option>
                  <option value="cultura" ${initialCategory === 'cultura' ? 'selected' : ''}>Beni Culturali & Società</option>
                  <option value="tech" ${initialCategory === 'tech' ? 'selected' : ''}>Intelligenza Artificiale & STEM</option>
                  <option value="agro" ${initialCategory === 'agro' ? 'selected' : ''}>Agricoltura & Biodiversità</option>
                </select>
              </div>

              <div class="dropdown-item">
                <label for="filterStatusSelect">Stato Raccolta:</label>
                <!-- [REVISIONE] CORRETTO: il filtro partiva da "Campagne in corso", mentre il titolo promette le campagne
                     "attive e concluse" e il menu dice "Tutte le Aree (6)": se ne vedevano 5 su 6 senza capire perché. -->
                <select id="filterStatusSelect" class="form-control-sm">
                  <option value="all" selected>Tutti gli stati</option>
                  <option value="active">Campagne in corso</option>
                  <option value="funded">Obiettivo Raggiunto & Raddoppiato</option>
                </select>
              </div>

              <div class="dropdown-item">
                <label for="sortSelect">Ordina per:</label>
                <select id="sortSelect" class="form-control-sm">
                  <option value="featured">In Evidenza</option>
                  <option value="percentage">Più vicini al 100%</option>
                  <option value="collected">Fondi raccolti</option>
                  <option value="days">Scadenza più vicina</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Conteggio Risultati -->
          <div class="results-header-bar">
            <span id="resultsCountNotice">Visualizzazione progetti...</span>
          </div>

          <!-- Griglia Risultati -->
          <div class="projects-flex-grid" id="catalogGrid"></div>
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

    function updateCatalog() {
      const q = (searchInput && searchInput.value) ? String(searchInput.value).toLowerCase().trim() : '';
      const cat = (categorySelect && categorySelect.value) ? categorySelect.value : 'all';
      const status = (statusSelect && statusSelect.value) ? statusSelect.value : 'all';
      const sort = (sortSelect && sortSelect.value) ? sortSelect.value : 'featured';

      let filtered = MOCK_PROJECTS.filter(p => {
        const matchesQuery = !q || p.title.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.proponent.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q);

        const matchesCat = cat === 'all' || p.category === cat;
        const matchesStatus = status === 'all' || p.status === status;

        return matchesQuery && matchesCat && matchesStatus;
      });

      // Ordinamento
      if (sort === 'percentage') {
        filtered.sort((a, b) => b.percentage - a.percentage);
      } else if (sort === 'collected') {
        filtered.sort((a, b) => b.collected - a.collected);
      } else if (sort === 'days') {
        // [REVISIONE] CORRETTO: le campagne concluse (0 giorni) finivano in cima a "Scadenza più vicina".
        filtered.sort((a, b) => (a.daysLeft || Infinity) - (b.daysLeft || Infinity));
      }

      countNotice.textContent = `Trovati ${filtered.length} progetti di ricerca corrispondenti ai criteri.`;

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="empty-results-box" style="grid-column: 1 / -1;">
            <p>Nessun progetto trovato per i criteri selezionati.</p>
            <button class="btn btn-outline-burgundy btn-sm" id="btnResetFilters">Reimposta filtri di ricerca</button>
          </div>
        `;
        const resetBtn = grid.querySelector('#btnResetFilters');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            searchInput.value = '';
            categorySelect.value = 'all';
            statusSelect.value = 'all';
            updateCatalog();
          });
        }
      } else {
        grid.innerHTML = filtered.map(p => renderProjectCard(p)).join('');
      }
    }

    searchInput.addEventListener('input', updateCatalog);
    categorySelect.addEventListener('change', updateCatalog);
    statusSelect.addEventListener('change', updateCatalog);
    sortSelect.addEventListener('change', updateCatalog);

    updateCatalog();
  }

  /**
   * PAGINA 7: SCHEDA DETTAGLIO PROGETTO (es. #/progetto/p1)
   * Include la spiegazione del raddoppio, cerchio percentuale, ricompense e donazione simulata con feedback immediato!
   */
  function renderProgetto(container, projectId) {
    const p = MOCK_PROJECTS.find(item => item.id === projectId) || MOCK_PROJECTS[0];
    const currentUser = getCurrentUser();
    const isClosed = p.status !== 'active' || p.daysLeft <= 0;

    container.innerHTML = `
      <section class="project-detail-hero">
        <div class="container">
          <!-- [REVISIONE] CORRETTO: la briciola diceva "Progetti" mentre la voce di menu è "Cerca progetti". -->
          <div class="breadcrumb-trail">
            <a href="#/home">Home</a> &rsaquo; <a href="#/cerca">Cerca progetti</a> &rsaquo; <span>${p.title}</span>
          </div>

          <div class="project-detail-header-grid">
            <!-- Colonna Sinistra: Titolo e Dati -->
            <div>
              <!-- [REVISIONE] CORRETTO: qui si riusava .card-top-badges, che nelle card è position:absolute: i due badge
                   finivano sopra la barra istituzionale, agli angoli della pagina. Classe aggiuntiva .detail-badges in style.css. -->
              <div class="card-top-badges detail-badges">
                <span class="badge-cat-tag">${p.categoryLabel}</span>
                ${p.matchingActive ? `
                  <span class="badge-match-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    Matching Fund UniTO 2x Attivo
                  </span>
                ` : ''}
              </div>

              <h1 class="project-detail-title">${p.title}</h1>

              <div class="project-proponent-bar">
                <span class="unito-verified-check">✓</span>
                <span>Responsabile Scientifico: <strong>${p.proponent}</strong></span>
                <span class="separator">•</span>
                <span>${p.department}</span>
              </div>

              <p class="project-detail-lead">${p.excerpt}</p>
            </div>

            <!-- Colonna Destra: Box Donazione & Cerchio di Percentuale -->
            <div class="detail-donate-panel" id="donatePanel">
              <div class="panel-circle-row">
                ${renderPercentageCircle(p.percentage, 90)}
                <div>
                  <div class="panel-gathered-amount">€ <span id="dynCollected">${fmtNum(p.collected)}</span></div>
                  <div class="panel-target-sub">raccolti sull'obiettivo di <strong>€ ${fmtNum(p.target)}</strong></div>
                </div>
              </div>

              <div class="panel-status-pills-row">
                <div class="status-box">
                  <strong id="dynSupporters">${p.supporters}</strong>
                  <small>sostenitori</small>
                </div>
                <div class="status-box">
                  <strong>${p.daysLeft > 0 ? p.daysLeft : 'Concluso'}</strong>
                  <small>${p.daysLeft > 0 ? 'giorni rimasti' : 'successo'}</small>
                </div>
                <div class="status-box highlight">
                  <strong>2x</strong>
                  <small>Raddoppio UniTO</small>
                </div>
              </div>

              <!-- Banner formula Lasci o Raddoppi per questa campagna -->
              <div class="panel-matching-explanation">
                <strong>Iniziativa "Lasci o Raddoppi":</strong> Se la campagna raggiunge il 100%, l'Università di Torino versa ulteriori <strong>€ ${fmtNum(p.matchingCap)}</strong> raddoppiando il valore di ogni donazione!
              </div>

              <!-- [REVISIONE] CORRETTO: si poteva "donare" anche alla campagna conclusa BioSensor (0 giorni rimasti) e la
                   donazione veniva sommata al totale. Per le campagne concluse il pulsante è sostituito da un avviso. -->
              ${isClosed ? `
              <div class="panel-cta-row">
                <p class="panel-closed-note">La raccolta è chiusa: non è più possibile donare a questo progetto.</p>
                <a href="#/cerca" class="btn btn-secondary-outline btn-block">Scopri le campagne ancora aperte</a>
              </div>
              ` : `
              <div class="panel-cta-row">
                <button class="btn btn-green-cta btn-block" id="btnOpenDonateModal">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  Dona a questo progetto
                </button>
              </div>
              `}

              <div class="panel-tax-notice">
                <span>Ricevuta deducibile fiscalmente generata all'istante via email.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contenuti Principali Scheda Progetto -->
      <section class="section-detail-body">
        <div class="container detail-content-layout">
          <!-- Colonna Sinistra: Descrizione, Metodologia, Budget -->
          <div class="detail-main-col">
            <div class="rich-text-block">
              <h2>Cos'è il progetto e perché è fondamentale</h2>
              <p>${p.description}</p>
              <p>
                Il team di ricerca dell'<strong>${p.department}</strong> ha sviluppato la metodologia dopo oltre due anni di sperimentazione preliminare. I fondi raccolti tramite CrowdUniTO permetteranno di accelerare la fase applicativa e validare l'impatto sul campo.
              </p>

              <h3>Obiettivo scientifico prioritario</h3>
              <p>${p.scientificGoal}</p>

              <h3>Come verranno impiegati i fondi (Trasparenza UniTO)</h3>
              <p>In ossequio al principio di rendicontazione aperta dell'Ateneo, ogni euro raccolto viene tracciato analiticamente:</p>
              <ul class="budget-bullet-list">
                ${p.budgetBreakdown.map(item => `
                  <li>
                    <span class="budget-item-name">${item.item}</span>
                    <strong class="budget-item-cost">${item.cost}</strong>
                  </li>
                `).join('')}
              </ul>

              <div class="guarantee-unito-badge-box">
                <div class="badge-icon">🏛️</div>
                <div>
                  <strong>Garanzia Istituzionale di Ateneo:</strong> In caso di mancato raggiungimento del target minimo ("tutto o niente"), i fondi donati non andranno persi e saranno riaccreditati integralmente ai sostenitori.
                </div>
              </div>
            </div>
          </div>

          <!-- Colonna Destra: Ricompense Selezionabili -->
          <div class="detail-sidebar-col">
            <h3 class="rewards-sidebar-title">${isClosed ? 'Ricompense della campagna' : 'Scegli una Ricompensa per Sostenere'}</h3>
            <div class="rewards-list-stack">
              ${p.rewards.map(r => `
                <div class="reward-selection-card" data-amount="${r.amount}">
                  <div class="reward-top-row">
                    <span class="reward-pledge-badge">Dona € ${r.amount}</span>
                    <!-- [REVISIONE] DA DECIDERE: vero solo per obiettivi ≤ 10.000 € (vedi nota su MOCK_PROJECTS). -->
                    <span class="reward-double-val">Vale € ${r.amount * 2} con il raddoppio!</span>
                  </div>
                  <h4 class="reward-card-title">${r.title}</h4>
                  <p class="reward-card-desc">${r.desc}</p>
                  ${isClosed ? '' : `<button class="btn btn-outline-burgundy btn-sm btn-block btn-select-reward" data-amount="${r.amount}">
                    Dona € ${r.amount}
                  </button>`}
                </div>
              `).join('')}

              ${isClosed ? '' : `<div class="reward-selection-card custom-donate-card">
                <h4 class="reward-card-title">Donazione con Importo Libero</h4>
                <p class="reward-card-desc">Inserisci la cifra che desideri donare. Ogni contributo riceverà la ricevuta fiscale ufficiale UniTO.</p>
                <div class="custom-amount-input-row">
                  <span aria-hidden="true">€</span>
                  <!-- [REVISIONE] CORRETTO: con step="5" un importo come 12 € veniva rifiutato dal browser nella finestra
                       di donazione ("inserisci un valore valido"), senza spiegare perché. Ora step="1". -->
                  <input type="number" id="customPledgeInput" min="5" step="1" value="50" class="form-control-sm" aria-label="Importo libero in euro">
                  <button class="btn btn-primary-burgundy btn-sm" id="btnCustomPledge">Dona</button>
                </div>
              </div>`}
            </div>
          </div>
        </div>
      </section>

      <!-- Modal Donazione Simulata -->
      <!-- [REVISIONE] CORRETTO (accessibilità della finestra modale): role="dialog" era sullo sfondo e mancavano
           aria-modal e il titolo collegato; non si chiudeva con Esc né cliccando fuori; il focus restava sotto
           la finestra; il pulsante "×" veniva letto come "per". -->
      <div class="modal-backdrop" id="donateModal" style="display:none;" aria-hidden="true">
        <div class="modal-dialog-box" role="dialog" aria-modal="true" aria-labelledby="donateModalTitle">
          <div class="modal-header">
            <h3 id="donateModalTitle">Sostieni: ${p.title}</h3>
            <button type="button" class="modal-close-btn" id="btnCloseModal" aria-label="Chiudi la finestra di donazione">&times;</button>
          </div>
          <div class="modal-body">
            <!-- [REVISIONE] CORRETTO: la frase prometteva il raddoppio senza condizioni, in contrasto con le FAQ
                 ("solo se la campagna raggiunge il 100%"). -->
            <div class="matching-reminder-pill">
              🎉 <strong>Lasci o Raddoppi:</strong> se la campagna raggiunge il 100% dell'obiettivo, il fondo UniTO <strong>raddoppia</strong> le donazioni (fino a 10.000 €).
            </div>

            <form id="simulatedDonationForm">
              <div class="form-group">
                <label for="modalDonationAmount">Importo Donazione (€) <span class="required">*</span></label>
                <input type="number" id="modalDonationAmount" min="5" step="1" required class="form-control" value="50">
              </div>

              <div class="form-group">
                <label for="donorName">Il tuo Nome e Cognome <span class="required">*</span></label>
                <!-- [REVISIONE] DA DECIDERE: è lo stesso problema segnalato nell'A1 (euristica 5, sev. 2): Nome e Cognome in un
                     unico campo, e basta una parola per superare il controllo. Andrebbero separati. -->
                <input type="text" id="donorName" required class="form-control" placeholder="Es. Laura Ferrari" value="${currentUser ? esc(currentUser.name) : ''}">
              </div>

              <div class="form-group">
                <label for="donorEmail">La tua Email per la Ricevuta Fiscale <span class="required">*</span></label>
                <input type="email" id="donorEmail" required class="form-control" placeholder="laura.ferrari@email.it" value="${currentUser ? esc(currentUser.email) : ''}">
              </div>

              <!-- [REVISIONE] CORRETTO: l'etichetta <label> non era collegata a nessun campo → fieldset/legend. -->
              <fieldset class="form-group modal-fieldset">
                <legend>Metodo di Pagamento (Simulato):</legend>
                <div class="payment-methods-grid">
                  <label class="pay-radio selected">
                    <input type="radio" name="payMethod" value="card" checked>
                    <span>💳 Carta di Credito</span>
                  </label>
                  <label class="pay-radio">
                    <input type="radio" name="payMethod" value="satispay">
                    <span>🔴 Satispay</span>
                  </label>
                  <label class="pay-radio">
                    <input type="radio" name="payMethod" value="bonifico">
                    <span>🏛️ Bonifico UniTO</span>
                  </label>
                </div>
              </fieldset>

              <label class="checkbox-label" style="margin-top: 1rem;">
                <input type="checkbox" id="anonCheck">
                <span>Desidero donare in forma anonima (non mostrare il mio nome pubblicamente)</span>
              </label>

              <div class="modal-footer" style="margin-top: 1.5rem;">
                <button type="submit" class="btn btn-green-cta btn-lg btn-block" id="btnConfirmDonation">
                  Conferma Donazione Simulata
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Modal listeners
    const modal = container.querySelector('#donateModal');
    const btnOpenModal = container.querySelector('#btnOpenDonateModal');
    const btnCloseModal = container.querySelector('#btnCloseModal');
    const amountInput = container.querySelector('#modalDonationAmount');

    let lastFocused = null;

    function closeModal() {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', onModalKeydown);
      if (lastFocused && document.body.contains(lastFocused)) lastFocused.focus();
    }

    function onModalKeydown(e) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'Tab') {
        // Il focus resta dentro la finestra finché è aperta
        const focusables = [...modal.querySelectorAll('button, input, select, textarea, a[href]')].filter(el => !el.disabled);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    function openModalWithAmount(amount) {
      lastFocused = document.activeElement;
      if (amountInput) amountInput.value = amount;
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      document.addEventListener('keydown', onModalKeydown);
      if (amountInput) amountInput.focus();
    }

    if (btnOpenModal) {
      btnOpenModal.addEventListener('click', () => openModalWithAmount(50));
    }
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', closeModal);
    }
    if (modal) {
      // Click sullo sfondo scuro (fuori dalla finestra) = chiudi
      modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    }

    // Click su ricompense
    container.querySelectorAll('.btn-select-reward').forEach(btn => {
      btn.addEventListener('click', () => {
        const amt = btn.getAttribute('data-amount') || 50;
        openModalWithAmount(amt);
      });
    });

    // Custom pledge button
    const customBtn = container.querySelector('#btnCustomPledge');
    const customInput = container.querySelector('#customPledgeInput');
    if (customBtn && customInput) {
      customBtn.addEventListener('click', () => {
        const val = parseInt(customInput.value, 10) || 50;
        openModalWithAmount(val);
      });
    }

    // Submit della donazione simulata
    const donateForm = container.querySelector('#simulatedDonationForm');
    if (donateForm) {
      donateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amt = parseInt(amountInput.value, 10) || 50;
        const donorName = container.querySelector('#donorName').value.trim();

        // Aggiorna lo stato del progetto in memoria
        p.collected += amt;
        p.supporters += 1;
        p.percentage = Math.round((p.collected / p.target) * 100);

        closeModal();
        document.removeEventListener('keydown', onModalKeydown);

        // [REVISIONE] DA DECIDERE: con "Bonifico" la donazione viene subito sommata al totale e il messaggio dice
        // "registrata con successo": è lo stesso problema dell'A1 (euristica 1, sev. 2) — il pagamento non è ancora avvenuto.
        showToast(`Grazie di cuore, ${donorName}! La tua donazione di € ${amt} è stata registrata con successo (valore con raddoppio: € ${amt * 2}).`, 'success');

        // Ricarica la scheda per riflettere il nuovo progresso e il cerchio aggiornato
        renderProgetto(container, p.id);
      });
    }
  }

  /**
   * PAGINA 8: FAQ (Domande Frequenti)
   */
  function renderFaq(container) {
    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/home">Home</a> &rsaquo; <span>FAQ</span>
          </div>
          <span class="section-pre-title">DOMANDE E RISPOSTE</span>
          <h1 class="page-main-heading">Domande Frequenti (FAQ)</h1>
          <p class="page-intro-lead">
            Tutto quello che c'è da sapere sul funzionamento di CrowdUniTO, la formula "Lasci o Raddoppi", i benefici fiscali per i sostenitori e le linee guida per i ricercatori.
          </p>
        </div>
      </section>

      <section class="section-faq-accordion">
        <div class="container" style="max-width: 900px;">
          <!-- FAQ Tabs Sostenitori / Ricercatori -->
          <!-- [REVISIONE] CORRETTO: role="tablist" senza role="tab"/"tabpanel" era un uso errato di ARIA → pulsanti con aria-pressed. -->
          <div class="faq-nav-tabs" role="group" aria-label="Scegli il gruppo di domande">
            <button class="faq-tab-btn active" data-target="faq-donatori" aria-pressed="true">Per i Cittadini & Sostenitori</button>
            <button class="faq-tab-btn" data-target="faq-ricercatori" aria-pressed="false">Per i Ricercatori & Docenti UniTO</button>
          </div>

          <!-- FAQ Gruppo 1: Donatori -->
          <div class="faq-group-content active" id="faq-donatori">
            <div class="accordion-item">
              <button class="accordion-header">
                <span>Come funziona il meccanismo "Lasci o Raddoppi"?</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <p>
                  "Lasci o raddoppi" è il principio di co-finanziamento (<em>match funding</em>) adottato dall'Università di Torino. Quando una campagna raggiunge il 100% dell'obiettivo grazie alle donazioni raccolte dai cittadini, l'Ateneo stanzia una cifra pari a quella raccolta (fino a un massimo di 10.000 € a progetto), raddoppiando l'impatto economico della ricerca.
                </p>
              </div>
            </div>

            <div class="accordion-item">
              <button class="accordion-header">
                <span>Le donazioni sono deducibili o detraibili dalle tasse?</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <p>
                  <!-- [REVISIONE] DA CORREGGERE NEL TESTO: per le persone fisiche sono deducibili senza limiti (art. 10, c. 1,
                       lett. l-quater TUIR) se pagate con strumenti tracciabili; "deducibili o detraibili" è impreciso. -->
                  <strong>Sì, al 100%.</strong> Le donazioni a favore delle Università statali godono dei massimi benefici fiscali previsti dall'art. 10 del TUIR. Subito dopo la donazione riceverai via email la ricevuta valida ai fini della dichiarazione dei redditi (730 / Modello Redditi) con il codice fiscale dell'Università degli Studi di Torino.
                </p>
              </div>
            </div>

            <div class="accordion-item">
              <button class="accordion-header">
                <span>Cosa succede se un progetto non raggiunge il 100% dell'obiettivo?</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <p>
                  I progetti di CrowdUniTO operano secondo la regola del "Tutto o Niente". Se al termine dei giorni prestabiliti la campagna non ha raggiunto il budget minimo fissato, nessuna donazione viene addebitata e gli importi vengono riaccreditati integralmente ai sostenitori, senza alcuna trattenuta.
                </p>
              </div>
            </div>

            <div class="accordion-item">
              <button class="accordion-header">
                <span>Posso donare in forma anonima?</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <p>
                  Certamente. In fase di conferma della donazione è sufficiente spuntare l'opzione "Dona in forma anonima": il tuo nome non comparirà nell'elenco pubblico dei sostenitori, ma riceverai comunque la ricevuta fiscale privata.
                </p>
              </div>
            </div>
          </div>

          <!-- FAQ Gruppo 2: Ricercatori -->
          <div class="faq-group-content" id="faq-ricercatori" style="display:none;">
            <div class="accordion-item">
              <button class="accordion-header">
                <span>Chi può proporre un progetto di crowdfunding?</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <p>
                  Possono presentare domanda docenti ordinari, associati, ricercatori (RTT, RTDA, RTDB), assegnisti di ricerca e dottorandi dell'Università di Torino. Per assegnisti e dottorandi è richiesta la lettera di avallo del Responsabile di Laboratorio o Tutor accademico.
                </p>
              </div>
            </div>

            <div class="accordion-item">
              <button class="accordion-header">
                <span>Cosa comprende la quota trasparente di 350 € + IVA?</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <p>
                  La quota copre le spese di gestione tecnica, hosting della campagna sulla piattaforma, revisione dei testi e un incontro formativo 1-a-1 con un Campaign Manager. La spesa può essere imputata direttamente ai fondi di ricerca ordinari del Dipartimento. Maggiori dettagli nella <a href="#/pacchetti" class="text-link">pagina Pacchetti Servizi</a>.
                </p>
              </div>
            </div>

            <div class="accordion-item">
              <button class="accordion-header">
                <span>Entro quanto tempo riceverò una risposta alla candidatura?</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <p>
                  Il Comitato Tecnico-Scientifico di UniTO si riunisce periodicamente ed emette l'esito formale entro <strong>15 giorni lavorativi</strong> dalla sottomissione online del modulo di proposta.
                </p>
              </div>
            </div>

            <div class="accordion-item">
              <button class="accordion-header">
                <span>È obbligatorio frequentare i moduli di formazione?</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <p>
                  Sì, la partecipazione ad almeno una sessione formativa (in presenza o online) è propedeutica alla pubblicazione online, per garantire standard elevati di comunicazione scientifica. Consulta il <a href="#/formazione" class="text-link">calendario delle edizioni disponibili</a>.
                </p>
              </div>
            </div>
          </div>

          <div style="margin-top: 3.5rem; text-align: center; background: #fff; padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <h3>Non hai trovato la risposta che cercavi?</h3>
            <p style="color: var(--text-secondary); margin: 0.5rem 0 1.25rem 0;">L'Ufficio Terza Missione & Crowdfunding dell'Ateneo è a tua disposizione.</p>
            <p>Scrivici a: <a href="mailto:crowdfunding@unito.it" class="text-link">crowdfunding@unito.it</a> oppure <a href="#/proponi" class="text-link">scopri come proporre un progetto</a>.</p>
          </div>
        </div>
      </section>

      <!-- Fascia blu -->
      ${renderBlueProposalBanner()}
    `;

    // FAQ tab toggle
    const tabs = container.querySelectorAll('.faq-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-pressed', 'true');
        const targetId = tab.getAttribute('data-target');
        container.querySelectorAll('.faq-group-content').forEach(g => {
          g.style.display = g.id === targetId ? 'block' : 'none';
        });
      });
    });

    // Accordion expand/collapse
    // [REVISIONE] CORRETTO: lo stato aperto/chiuso era solo visivo (classe CSS): con lo screen reader non si capiva
    // se la risposta fosse aperta. Aggiunti aria-expanded e aria-controls.
    const headers = container.querySelectorAll('.accordion-header');
    headers.forEach((h, idx) => {
      const body = h.nextElementSibling;
      if (body) {
        body.id = body.id || `faq-answer-${idx}`;
        h.setAttribute('aria-controls', body.id);
      }
      h.setAttribute('aria-expanded', 'false');
      h.addEventListener('click', () => {
        const item = h.parentElement;
        const isOpen = item.classList.contains('open');
        item.parentElement.querySelectorAll('.accordion-item').forEach(i => {
          i.classList.remove('open');
          const btn = i.querySelector('.accordion-header');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          h.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /**
   * PAGINA 9: LOGIN
   */
  function renderLogin(container, params) {
    // [REVISIONE] CORRETTO: il parametro redirect finiva nell'href senza controlli; ora sono ammesse solo pagine note.
    const ALLOWED_REDIRECTS = ['home', 'candidatura', 'profilo', 'formazione', 'proponi'];
    const redirect = ALLOWED_REDIRECTS.includes(params.get('redirect')) ? params.get('redirect') : 'home';

    container.innerHTML = `
      <section class="auth-page-section">
        <div class="container auth-form-container">
          <div class="auth-card">
            <div class="auth-card-top">
              <div class="auth-crest" aria-hidden="true">🏛️</div>
              <!-- [REVISIONE] CORRETTO: la pagina non aveva un <h1> (il titolo era un <h2>). -->
              <h1 class="auth-title-h1">Accesso a CrowdUniTO</h1>
              <p>Autenticati con le tue credenziali universitarie (SCU UniTO) o con il tuo account Progettista.</p>
            </div>

            <!-- Pulsante Demo 1-Click per Esaminatori HCI -->
            <div class="demo-login-callout">
              <strong>Accesso Rapido per Valutazione Prototipo:</strong>
              <p style="font-size:0.8rem; margin: 0.35rem 0 0.75rem 0;">Accedi istantaneamente come docente/ricercatore senza digitare credenziali:</p>
              <button class="btn btn-primary-burgundy btn-sm btn-block" id="btnQuickDemoLogin">
                ⚡ Accedi come Prof. Marco Bianchi (Ricercatore Demo)
              </button>
            </div>

            <div class="auth-divider"><span>oppure inserisci le credenziali</span></div>

            <form id="loginForm" class="styled-form-grid">
              <div class="form-group form-full">
                <label for="loginEmail">Indirizzo Email istituzionale (@unito.it) <span class="required">*</span></label>
                <!-- [REVISIONE] CORRETTO: l'email precompilata (m.bianchi@unito.it) era diversa da quella dell'accesso rapido
                     (marco.bianchi@unito.it): lo stesso utente demo risultava con due indirizzi.
                     DA DECIDERE: email e password precompilate non servono, visto che c'è già l'accesso rapido; un campo
                     password già pieno sembra un dato salvato da qualcun altro. -->
                <input type="email" id="loginEmail" required class="form-control" placeholder="nome.cognome@unito.it" value="marco.bianchi@unito.it">
              </div>

              <div class="form-group form-full">
                <label for="loginPassword">Password <span class="required">*</span></label>
                <input type="password" id="loginPassword" required class="form-control" value="password123">
                <!-- [REVISIONE] DA DECIDERE: manca "Password dimenticata?" (A1, euristica 3, sev. 2: era tra i problemi del login di IdeaGinger). -->
              </div>

              <div class="form-group form-full">
                <button type="submit" class="btn btn-secondary-outline btn-block btn-lg" id="btnSubmitLogin">
                  Accedi con Credenziali
                </button>
              </div>
            </form>

            <div class="auth-footer-links">
              <!-- [REVISIONE] CORRETTO: "Registrati qui" è un link non descrittivo, lo stesso problema dei "qui" segnalato nell'A1. -->
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
        name: name || 'Prof. Marco Bianchi',
        email: email || 'm.bianchi@unito.it',
        role: 'Professore Associato',
        department: dept || 'Dipartimento di Neuroscienze "Rita Levi Montalcini"'
      });
      showToast(`Benvenuto, ${name || 'Prof. Marco Bianchi'}!`, 'success');
      // [REVISIONE] CORRETTO: veniva gestito solo redirect=candidatura; chi arrivava da "Area Personale"
      // (#/login?redirect=profilo) dopo l'accesso finiva in Home invece che nel profilo.
      navigateTo('#/' + redirect);
    }

    const quickBtn = container.querySelector('#btnQuickDemoLogin');
    if (quickBtn) {
      quickBtn.addEventListener('click', () => {
        doLogin('Prof. Marco Bianchi', 'marco.bianchi@unito.it', 'Dipartimento di Neuroscienze');
      });
    }

    const form = container.querySelector('#loginForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = container.querySelector('#loginEmail').value.trim();
        // [REVISIONE] CORRETTO: il nome veniva ricavato in MAIUSCOLO e sostituendo solo il primo punto
        // ("anna.maria.rossi" → "ANNA MARIA.ROSSI"). Ora: "Anna Maria Rossi".
        const inferredName = email.split('@')[0].split(/[._-]+/).filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        doLogin(inferredName || 'Ricercatore UniTO', email);
      });
    }
  }

  /**
   * PAGINA 10: REGISTRATI (Per Progettisti)
   */
  function renderRegistrati(container, params) {
    const ALLOWED_REDIRECTS = ['home', 'candidatura', 'profilo', 'formazione', 'proponi'];
    const redirect = ALLOWED_REDIRECTS.includes(params.get('redirect')) ? params.get('redirect') : 'home';

    container.innerHTML = `
      <section class="auth-page-section">
        <div class="container auth-form-container">
          <div class="auth-card">
            <div class="auth-card-top">
              <div class="auth-crest" aria-hidden="true">📝</div>
              <h1 class="auth-title-h1">Registrati come Progettista</h1>
              <p>Crea il tuo profilo di ricercatore per candidare progetti al bando "Lasci o Raddoppi".</p>
            </div>

            <form id="registerForm" class="styled-form-grid">
              <div class="form-group form-full">
                <label for="regName">Nome e Cognome <span class="required">*</span></label>
                <input type="text" id="regName" required class="form-control" placeholder="Es. Dott.ssa Chiara Romano">
              </div>

              <div class="form-group form-full">
                <label for="regEmail">Email Istituzionale (@unito.it) <span class="required">*</span></label>
                <input type="email" id="regEmail" required pattern=".+@unito\\.it" title="Usa il tuo indirizzo istituzionale che termina con @unito.it" class="form-control" placeholder="chiara.romano@unito.it">
              </div>

              <div class="form-group form-full">
                <label for="regDept">Dipartimento di Afferenza <span class="required">*</span></label>
                <select id="regDept" required class="form-control">
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
                <label for="regPassword">Crea Password <span class="required">*</span></label>
                <!-- [REVISIONE] CORRETTO: "Minimo 8 caratteri" era solo un segnaposto, il campo accettava anche 1 carattere. -->
                <input type="password" id="regPassword" required minlength="8" class="form-control" placeholder="Minimo 8 caratteri" aria-describedby="regPasswordHint">
                <small class="form-hint" id="regPasswordHint">Almeno 8 caratteri.</small>
              </div>

              <div class="form-group form-full">
                <label class="checkbox-label">
                  <input type="checkbox" required>
                  <span>Accetto l'informativa sulla privacy di Ateneo e il regolamento di crowdfunding.</span>
                </label>
              </div>

              <div class="form-group form-full">
                <button type="submit" class="btn btn-green-cta btn-block btn-lg" id="btnSubmitRegister">
                  Completa Registrazione Progettista
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

    const form = container.querySelector('#registerForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = container.querySelector('#regName').value.trim();
        const email = container.querySelector('#regEmail').value.trim();
        const dept = container.querySelector('#regDept').value;

        setCurrentUser({
          name,
          email,
          role: 'Progettista Registrato',
          department: dept
        });

        showToast(`Registrazione completata con successo! Benvenuto ${name}.`, 'success');
        navigateTo('#/' + redirect);
      });
    }
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

    // [REVISIONE] CORRETTO: venivano mostrate le candidature e le iscrizioni di TUTTI gli utenti che avevano
    // usato il browser (es. dopo aver provato due account): ora solo quelle dell'utente collegato.
    const proposals = readStoredList(SUBMITTED_STORAGE_KEY).filter(pr => !pr.email || pr.email === currentUser.email);
    const enrollments = readStoredList(TRAINING_ENROLL_KEY).filter(en => !en.email || en.email === currentUser.email);

    container.innerHTML = `
      <section class="inner-page-hero">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/home">Home</a> &rsaquo; <span>Area Personale Progettista</span>
          </div>
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
              <div class="user-big-avatar">👤</div>
              <h2 class="user-display-name">${esc(currentUser.name)}</h2>
              <p class="user-display-role">${esc(currentUser.role || 'Ricercatore UniTO')}</p>
              <p class="user-display-dept">${esc(currentUser.department || 'Università degli Studi di Torino')}</p>
              <p class="user-display-email">${esc(currentUser.email)}</p>
              <hr style="margin: 1.25rem 0; border: none; border-top: 1px solid var(--border-color);">
              <a href="#/candidatura" class="btn btn-green-cta btn-block btn-sm">+ Nuova Proposta</a>
              <button class="btn btn-outline-burgundy btn-block btn-sm" id="btnProfileLogout" style="margin-top: 0.5rem;">Disconnetti</button>
            </div>

            <!-- Colonna Proposte e Iscrizioni -->
            <div class="profile-main-activity">
              <div class="activity-block">
                <h2>Le tue Candidature di Progetto (${proposals.length})</h2>
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
                          <span class="prop-protocol-tag">${p.protocol}</span>
                          <span class="prop-status-tag">${p.status}</span>
                        </div>
                        <h3 class="prop-title-text">${esc(p.title)}</h3>
                        <div class="prop-meta-details">
                          <span>Inviata il: <strong>${p.submittedAt}</strong></span>
                          <span>Budget Richiesto: <strong>€ ${fmtNum(p.targetAmount)}</strong></span>
                          <span>Pacchetto: <strong>${p.package.toUpperCase()}</strong></span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>

              <div class="activity-block" style="margin-top: 3rem;">
                <h2>Iscrizioni ai Percorsi Formativi (${enrollments.length})</h2>
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
                          <!-- [REVISIONE] CORRETTO: veniva mostrato il codice interno ("TR-01") invece del nome dell'edizione. -->
                          <strong>${esc((TRAINING_SESSIONS.find(t => t.id === e.sessionId) || {}).title || e.sessionId)}</strong><br>
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
              <input type="search" id="input404Search" placeholder="Cerca un progetto di ricerca, un docente o un dipartimento..." aria-label="Cerca">
              <button type="submit" class="btn btn-primary-burgundy btn-sm">Cerca</button>
            </form>
          </div>

          <!-- Mappa di Link Utili di Navigazione Richiesta -->
          <div class="error-useful-links-block">
            <h2 class="useful-links-heading">Link Utili per proseguire la navigazione:</h2>
            <div class="useful-links-grid">
              <a href="#/home" class="useful-link-card">
                <span class="card-icon">🏠</span>
                <div>
                  <strong>Home Page</strong>
                  <small>Torna alla presentazione dell'iniziativa e ai progetti in evidenza</small>
                </div>
              </a>

              <a href="#/cerca" class="useful-link-card">
                <span class="card-icon">🔬</span>
                <div>
                  <strong>Cerca Progetti</strong>
                  <small>Esplora il catalogo di tutte le campagne attive dell'Ateneo</small>
                </div>
              </a>

              <a href="#/proponi" class="useful-link-card">
                <span class="card-icon">🚀</span>
                <div>
                  <strong>Proponi Progetto</strong>
                  <small>Scopri le 4 fasi per candidare la tua ricerca e raddoppiare i fondi</small>
                </div>
              </a>

              <a href="#/formazione" class="useful-link-card">
                <span class="card-icon">📅</span>
                <div>
                  <strong>Calendario Formazione</strong>
                  <small>Date, sedi e iscrizione simulata ai corsi di preparazione</small>
                </div>
              </a>

              <a href="#/pacchetti" class="useful-link-card">
                <span class="card-icon">📦</span>
                <div>
                  <strong>Pacchetti Servizi</strong>
                  <small>Confronto tra Pacchetto Base, Avanzato e Personalizzato</small>
                </div>
              </a>

              <a href="#/faq" class="useful-link-card">
                <span class="card-icon">❓</span>
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

  function setupHeader() {
    // 1. Barra di ricerca nell'Header
    const headerSearchForm = document.getElementById('headerSearchForm');
    const headerSearchInput = document.getElementById('headerSearchInput');

    if (headerSearchForm && headerSearchInput) {
      headerSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = headerSearchInput.value.trim();
        navigateTo(`#/cerca?q=${encodeURIComponent(q)}`);
      });
    }

    // 2. Menu a tendina "Cerca progetti"
    const dropdownToggle = document.getElementById('cercaDropdownToggle');
    const dropdownMenu = document.getElementById('cercaDropdownMenu');

    if (dropdownToggle && dropdownMenu) {
      dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
        dropdownToggle.setAttribute('aria-expanded', !isExpanded);
        dropdownMenu.classList.toggle('show');
      });

      // Chiudi il menu se si clicca all'esterno
      document.addEventListener('click', (e) => {
        if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
          dropdownToggle.setAttribute('aria-expanded', 'false');
          dropdownMenu.classList.remove('show');
        }
      });

      // [REVISIONE] CORRETTO: con la tastiera il menu restava aperto (nessun Esc) e dopo aver scelto una voce
      // rimaneva aperto sulla pagina successiva.
      const closeDropdown = () => {
        dropdownToggle.setAttribute('aria-expanded', 'false');
        dropdownMenu.classList.remove('show');
      };
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
          closeDropdown();
          dropdownToggle.focus();
        }
      });
      dropdownMenu.addEventListener('click', (e) => {
        if (e.target.closest('a')) closeDropdown();
      });
      dropdownMenu.addEventListener('focusout', (e) => {
        if (!dropdownMenu.contains(e.relatedTarget) && e.relatedTarget !== dropdownToggle) closeDropdown();
      });
    }

    // [REVISIONE] CORRETTO: i link interni a un elemento ("#app-root" dello skip link, "#contatto-personalizzato"...)
    // cambiavano l'hash; il router non li riconosceva e ricaricava la Home. Ora spostano solo scroll e focus.
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href.startsWith('#/') || href.length < 2) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    });

    // 3. Inizializza lo stato auth dell'header
    updateHeaderAuthUI();
  }

  function updateHeaderAuthUI() {
    const user = getCurrentUser();
    const authContainer = document.getElementById('headerAuthContainer');
    if (!authContainer) return;

    if (user) {
      authContainer.innerHTML = `
        <div class="header-user-badge">
          <!-- [REVISIONE] DA DECIDERE: il nome abbreviato prende le prime due parole, quindi "Prof. Marco Bianchi" diventa
               "Prof. Marco". Forse meglio nome e cognome senza titolo. -->
          <a href="#/profilo" class="header-user-link" title="Vai alla tua Area Personale">
            <span class="user-avatar-sm" aria-hidden="true">👤</span>
            <span class="user-name-short">${esc(user.name.split(' ')[0])} ${esc(user.name.split(' ')[1] || '')}</span>
          </a>
          <button class="btn-logout-header" id="btnHeaderLogout" title="Disconnetti">Esci</button>
        </div>
      `;
      const btnLogout = document.getElementById('btnHeaderLogout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          setCurrentUser(null);
          showToast('Disconnessione effettuata con successo.', 'info');
          navigateTo('#/home');
        });
      }
    } else {
      authContainer.innerHTML = `
        <a href="#/login" class="nav-auth-link btn-login">Accedi</a>
        <a href="#/registrati" class="nav-auth-link btn-register">Registrati <span class="reg-note">(per progettisti)</span></a>
      `;
    }
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
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon" aria-hidden="true">${type === 'success' ? '✓' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span class="toast-msg"></span>
      </div>
      <button type="button" class="toast-close" aria-label="Chiudi la notifica">&times;</button>
    `;
    // [REVISIONE] CORRETTO: il messaggio (che contiene nomi ed email digitati dall'utente) era inserito come HTML.
    toast.querySelector('.toast-msg').textContent = message;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  /* ==========================================================================
     8. INIZIALIZZAZIONE DELL'APPLICAZIONE AL CARICAMENTO DELLA PAGINA
     ========================================================================== */

  window.addEventListener('DOMContentLoaded', () => {
    setupHeader();
    window.addEventListener('hashchange', handleRouting);
    handleRouting();
  });

  // Esponi per eventuale debug didattico nella console del browser
  window.CrowdUniTO = {
    navigateTo,
    getCurrentUser,
    setCurrentUser,
    showToast,
    MOCK_PROJECTS
  };

})();
