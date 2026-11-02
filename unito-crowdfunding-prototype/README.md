# CrowdUniTO — Prototipo di Crowdfunding per la Ricerca UniTO
> Progetto prototipale per il corso universitario di **Human-Computer Interaction (HCI)**  
> Ispirato alla partnership tra **Università degli Studi di Torino** e **Ginger Crowdfunding** (*ideaginger.it*)

---

## 🚀 Come visualizzare il progetto
Il progetto è stato sviluppato **senza backend né dipendenze esterne**, utilizzando **percorsi relativi** e **routing client-side basato su hash** (`#/nome-pagina`).  
Può essere eseguito aprendo direttamente il file nel browser (senza necessità di avviare un server web locale):

- **Percorso file:** [`/Users/ardhila/.gemini/antigravity/scratch/unito-crowdfunding-prototype/index.html`](file:///Users/ardhila/.gemini/antigravity/scratch/unito-crowdfunding-prototype/index.html)
- Oppure da terminale:
  ```bash
  open /Users/ardhila/.gemini/antigravity/scratch/unito-crowdfunding-prototype/index.html
  ```

---

## 🏛️ Identità & Caratteristiche Realizzate

### 1. Header & Brand Istituzionale
- **In alto a sinistra, affiancati:**
  - **Logo UniTO:** sigillo istituzionale con dicitura *"Università degli Studi di Torino"*.
  - **Logo CrowdUniTO:** brand icon geometrica in gradiente con il nome provvisorio *"CrowdUniTO — La ricerca che raddoppia"*.
- **Voci di Navigazione:**
  - `Home` (`#/home`)
  - `Proponi progetto` (`#/proponi`)
  - `FAQ` (`#/faq`)
  - `Cerca progetti` (menu a tendina con filtro rapido per le aree: *Tutte le aree, Medicina & Salute, Ambiente & Clima, Beni Culturali & Società, AI & STEM, Agricoltura & Biodiversità*)
  - **Barra di ricerca:** ricerca istantanea con reindirizzamento al catalogo filtrato (`#/cerca?q=...`)
  - **Accedi:** pagina di login (`#/login`) con pulsante *"Accesso Rapido Demo 1-Click"* (Prof. Marco Bianchi) per facilitare la valutazione HCI
  - **Registrati (per progettisti):** modulo dedicato ai ricercatori (`#/registrati`)

### 2. Home Page
- **Descrizione incisiva (massimo 3 righe):**
  > *CrowdUniTO è la piattaforma di crowdfunding per la ricerca dell'Università di Torino basata sul meccanismo "lasci o raddoppi": se il progetto raccoglie il 100% dell'obiettivo grazie alle donazioni dei cittadini, l'Ateneo ne raddoppia l'importo erogando fino a 10.000 € di cofinanziamento a fondo perduto.*
- **Schema visuale interattivo "Lasci o Raddoppi":**  
  `Cittadini donano € 10.000` + `UniTO raddoppia con € 10.000` = `€ 20.000 al Laboratorio!`.
- **Card Progetto con Cerchio di Percentuale:**  
  Grafica ispirata a Idea Ginger con indicatore circolare SVG di avanzamento, badge *"Raddoppio UniTO 2x"*, importo raccolto, obiettivo, giorni rimasti e conteggio sostenitori.
- **Fascia Blu con pulsante verde "Invia la tua proposta":**  
  Banner scuro (`#0D2B45`) con CTA verde smeraldo (`#16A34A`): porta al login se ospite (con reindirizzamento successivo) o direttamente al modulo se già autenticati.

### 3. Pagina "Proponi progetto" (`#/proponi`)
Strutturata nelle **4 Fasi Numerate** richieste:
1. **Fase 1 - Formazione & Risorse:**  
   Preparazione al crowdfunding curata dall'Ateneo e Ginger.  
   &rarr; Link interno alla pagina [**Formazione & Calendario**](#/formazione): moduli didattici, tabella calendario con date, sedi e **modulo di iscrizione simulata**.
2. **Fase 2 - Candidatura & Valutazione:**  
   Invio del modulo online con garanzia di esito formale entro **15 giorni lavorativi** dal Comitato Tecnico-Scientifico UniTO.
3. **Fase 3 - Accompagnamento & Pacchetti Servizi:**  
   Affiancamento 1-a-1 di un Campaign Manager dedicato, piano promozionale e grafica UniTO.  
   &rarr; Link interno alla pagina [**Pacchetti**](#/pacchetti): confronto tra **Base** (350 € + IVA), **Avanzato** (650 € + IVA) e **Personalizzato**, con form di richiesta contatto.
4. **Fase 4 - Cofinanziamento e messa online:**  
   Pubblicazione con quota trasparente per i servizi tecnici (350 € + IVA) ed eventuale raddoppio dei fondi fino a 10.000 €.
- **Sotto, la stessa fascia blu con pulsante verde "Invia la tua proposta":**  
  Se non loggato indirizza al login/registrazione con redirect automatico; se loggato apre direttamente il modulo di candidatura online (`#/candidatura`).

### 4. Pagina 404 in Italiano (`#/404`)
- Testabile digitando un hash inesistente (es. `#/errore-test`) o cliccando sul link nel footer.
- Spiegazione chiara in italiano dell'errore.
- Barra di ricerca per trovare subito il progetto desiderato.
- Griglia di **link utili di navigazione** (Home, Catalogo Progetti, Proponi, Formazione, Pacchetti, FAQ).

### 5. Linee Guida HCI & Accessibilità Applicate
- **Sottolineatura dei link nel testo:** tutti i collegamenti nei paragrafi, schede, accordion e descrizioni sono esplicitamente sottolineati (`text-decoration: underline !important`).
- **Heuristic Evaluation (Nielsen):**
  - *Visibilità dello stato del sistema:* badge raddoppio, cerchio di percentuale live, feedback toast post-donazione e post-iscrizione.
  - *Riconoscimento anziché ricordo:* filtri per dipartimenti, anteprime immediate, dropdown categorizzati.
  - *Flessibilità ed efficienza:* switch demo per testare sia lo stato utente anonimo sia utente ricercatore autenticato.
- **Accessibilità WCAG 2.1 AA:** skip-link per la tastiera, contrasti di colore conformi, ruoli semantici e attributi ARIA.
