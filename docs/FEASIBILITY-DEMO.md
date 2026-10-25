# Carbon Horizon feasibility demo

## Implementation status

The active lab now uses the **Rhodes July 2023 pilot**, replacing the earlier
Tuscany preview experiment. It includes real Sentinel-2 spectral processing,
aligned Sentinel-1 RTC layers, quality masks, NDVI/NBR and a candidate-change
baseline. The Solidity contract has been executed with actual signed transactions
on a local EthereumJS EVM: anchor, test review, issue and retire. The saved
receipt refers to the exact pilot report. See [pipeline instructions](../pipeline/README.md).

Independent labels, trained AI, biomass/carbon estimation, accredited review and
public-chain deployment remain future work. The source-material interpretation
below explains why those stages matter; the former Tuscany first slice is retained
as historical context and is not the current demonstration.

## Lettura del progetto e direzione della demo

Questa sezione distingue ciò che propongono gli allegati dalle scelte tecniche
per tradurlo in un esperimento. Riferimenti: numerazione fisica delle 26 slide;
per il report si usa la pagina stampata (la pagina 7 è l'ottava pagina del PDF).

### Obiettivo ricostruito dagli allegati

Carbon Horizon è una proposta di infrastruttura digitale MRV: collegare
osservazioni ripetibili del territorio, stime ambientali e una catena di evidenze
verificabile per istituzioni e operatori. Il valore economico del servizio è
vendere capacità di monitoraggio, reporting e verifica; il registro digitale
supporta la fiducia nei risultati e negli eventuali asset derivati.

| Fonte | Lavoro/proposta del team | Implicazione per la demo |
| --- | --- | --- |
| Slide 2–4; report contesto, p. 2 | Dati frammentati; servizio MRV integrato | Un unico progetto territoriale deve mantenere la propria identità lungo tutte le fasi |
| Slide 12–13; report §3.2, p. 7 | Fusione Sentinel-2 ottico e Sentinel-1 radar | Stesso poligono, cronologia dei sensori e indicatori di qualità, compresi periodi nuvolosi |
| Slide 14; report §3.3, p. 7 | Random forest per biomassa; CNN per cambiamenti; elaborazione HPC | Due output distinti, con modelli, dati di riferimento, tempi e limiti misurabili |
| Slide 15; report §3.4, p. 7 | Misura, verifica, emissione e ritiro di unità | Una registrazione hash è un primo componente; manca ancora il ciclo di vita delle unità |
| Slide 16–21; report §4 | Attori pubblici iniziali e successiva espansione dei servizi dati | Mostrare il flusso operatore → revisore → utilizzatore, non soltanto una galleria di immagini |
| Slide 22, 24–25; report §5 | Accuratezza, integrazione, responsabilità e fiducia | Ogni risultato deve avere provenienza, qualità, responsabile e stato di revisione |

### Caso dimostrativo da privilegiare

Scelta progettuale proposta: un poligono forestale con una perturbazione
documentata e un'area di controllo stabile nello stesso contesto. Prima si
verifica la disponibilità congiunta di dati ottici, radar e riferimenti; soltanto
dopo si confermano luogo e date. Le scene toscane già presenti sono fixture
di accesso ai dati, non un caso di biomassa o cambiamento già validato.

Il bosco rende dimostrabili entrambe le funzioni esplicite del report: stimare
biomassa e rilevare cambiamenti. Agricoltura e identificazione delle colture sono
possibili estensioni, ma hanno target e riferimenti diversi. Il caso marittimo
nelle slide 8–9 illustra il contesto della domanda: richiederebbe dati operativi
e un modello di emissioni specifico e non va mescolato al modello forestale.

### Quali immagini e dati occorrono davvero

Le immagini da usare come evidenza devono provenire dai sensori o da calcoli
riproducibili. Visualizzazioni illustrative possono spiegare il sistema, ma non
devono essere usate come mappe di risultato. Tutti i layer devono condividere
poligono, estensione, griglia dichiarata, legenda, data e indicazione no-data.

| Layer visibile | Input necessario | Cosa dimostra |
| --- | --- | --- |
| Contesto e confine del progetto | GeoJSON del poligono, CRS e superficie calcolata | Quale territorio si sta misurando e con quale perimetro |
| RGB ottico prima/dopo | Sentinel-2 L2A B04/B03/B02 a risoluzione nativa di 10 m | Aspetto del territorio e interpretazione visiva della variazione |
| Falso colore vegetazione | Sentinel-2 B08/B04/B03 | Distribuzione della vegetazione e supporto all'interpretazione |
| Indici e maschera nuvole | B04/B08, B02 per EVI; SCL e maschere di qualità | Segnale vegetativo e quota effettivamente osservabile, non tonnellate di CO₂ |
| Red-edge e SWIR se utili al modello | B05/B06/B07/B8A/B11/B12, nativamente 20 m | Feature aggiuntive da valutare, senza promettere un dettaglio reale di 10 m dopo ricampionamento |
| Radar prima/dopo e cronologia | Sentinel-1 VV/VH calibrati e corretti geometricamente; orbita/geometria compatibili | Osservazioni complementari anche nelle acquisizioni con nuvole ottiche |
| Riferimenti e qualità | Rilievi forestali oppure impronte GEDI L4A filtrate, con incertezza e compatibilità temporale | Dati con cui addestrare e valutare la stima della biomassa |
| Biomassa e incertezza | Inferenza del modello validato sulla griglia del progetto | Stima della biomassa epigea in Mg/ha, con limiti e copertura |
| Cambiamenti e confidenza | Serie temporale allineata, modello addestrato e riferimenti indipendenti | Localizzazione, superficie e tipo di evento, con falsi positivi e casi dubbi |

Una coppia di JPEG RGB perde le bande analitiche e i metadati necessari. Il
pacchetto dovrebbe includere più date prima e dopo un evento, una scena ottica
nuvolosa e le osservazioni radar temporalmente pertinenti, oltre al controllo
stabile. Non si sceglie una differenza visiva spettacolare come prova di un
risultato ambientale senza conoscerne la causa.

Sentinel-1 non misura direttamente volume forestale o CO₂: fornisce un segnale
radar sensibile anche a umidità, geometria e struttura. La fusione va valutata
confrontando modello solo ottico, solo radar e combinato sugli stessi test.
Non equivale a ricostruire un'immagine ottica sotto le nuvole e non garantisce
osservazione continua. GEDI offre stime campionate con errore, non una verità
assoluta né una copertura densa garantita del poligono.

### Storyboard della pipeline completa

1. **Observe:** aprire il progetto forestale e selezionare una finestra temporale.
   Mostrare RGB, falso colore, radar, acquisizioni e maschere. Dimostrare che
   gli input appartengono allo stesso territorio e dichiarare le lacune.
2. **Prepare / fuse:** visualizzare qualità, allineamento, feature e provenienza.
   Mostrare quali sensori contribuiscono al risultato e quali pixel restano esclusi.
3. **Calculate / biomass:** eseguire il random forest oppure caricare un risultato
   realmente precomputato. Mostrare mappa Mg/ha, aggregato del poligono,
   incertezza, riferimenti e versione del modello.
4. **Calculate / change:** mostrare la mappa prodotta dalla CNN su date comparabili,
   con superficie coinvolta, confidenza e confronto con riferimenti indipendenti.
   Confrontare con una baseline semplice. La CNN è un modello da addestrare o
   selezionare e valutare, non un algoritmo già consegnato negli allegati.
5. **Report / review:** generare un dossier che colleghi input, area, qualità,
   modelli, risultati, parametri e limitazioni. Un revisore può approvare o
   respingere; la revisione dimostrativa non va chiamata certificazione accreditata.
6. **Anchor:** registrare l'hash del dossier approvato e verificare la corrispondenza
   da un client indipendente. Mostrare la ricevuta reale di rete e il caso alterato.
7. **Issue / retire:** in un ambiente di prova, emettere unità dimostrative legate
   a progetto, periodo, metodologia e approvazione; ritirarle con un evento
   persistente. Mostrare il rifiuto di emissioni duplicate e di un secondo ritiro.

Il pannello deve distinguere input osservato, risultato calcolato, stima del
modello, revisione umana e stato del registro. Se l'elaborazione è precomputata,
deve dirlo; non serve animare un caricamento che suggerisca una nuova inferenza.

### Biomassa, carbonio e crediti: passaggi da esplicitare

Una mappa di biomassa è una stima di stock, non una misura diretta di flusso di
CO₂ o un numero di crediti. In una demo modellistica si può illustrare:

`biomassa secca → carbonio = biomassa × frazione di carbonio documentata`

`carbonio → massa equivalente di CO₂ = carbonio × 44/12`

Area, unità, frazione di carbonio, pool inclusi ed errore devono essere espliciti.
La conversione di uno stock non dimostra rimozioni nel periodo. Anche la
differenza tra due stime richiede propagazione dell'incertezza e una valutazione
della significatività; non basta sottrarre due numeri prodotti da un modello.

Per derivare eventuali unità ammissibili servono ulteriormente baseline,
addizionalità, leakage, permanenza, rischio di inversione, metodologia e verifica.
La regola schematica della slide 3 (stima sotto soglia → credito) va quindi
trattata come intuizione di business, non implementata come formula universale.
L'ancoraggio non rende vera una misura e il controllo di doppio utilizzo dentro
un contratto non risolve il doppio conteggio tra registri o progetti sovrapposti.

### Cosa manca al prototipo attuale

Sono presenti nel pilota di Rodi: poligono esplicito, bande analitiche, radar
allineato, indici, baseline di cambiamento, provenienza e integrità dei file,
oltre al ciclo di vita dimostrativo eseguito su EVM locale. Mancano ancora
fusione appresa, riferimenti indipendenti, modelli AI valutati, stima di
biomassa/carbonio, revisione accreditata e deployment su rete pubblica.
La priorità deve essere costruire un piccolo caso coerente attraverso questi
passaggi. La disponibilità di davinci-1 non è assunta: un esperimento ridotto
può girare su risorse accessibili, misurandone costo e tempi. La scalabilità HPC
resta una verifica successiva, non dimostrata da un'inferenza su un piccolo crop.

### Fonti tecniche per le scelte aggiuntive

I seguenti dettagli implementativi completano gli allegati; non sono risultati
già ottenuti dal team:

- [Copernicus SentiWiki, Sentinel-2 mission](https://sentiwiki.copernicus.eu/web/s2-mission):
  bande e risoluzioni native.
- [Sentinel Hub, elaborazione Sentinel-1 GRD](https://docs.sentinel-hub.com/api/latest/data/sentinel-1-grd/):
  calibrazione, filtri e correzioni geometriche/radiometriche.
- [NASA ORNL DAAC, GEDI L4A v2](https://daac.ornl.gov/GEDI/guides/GEDI_L4A_AGB_Density_V2.html):
  stime di biomassa epigea per impronta e relativo errore; verificare versione,
  disponibilità, date e qualità prima della scelta del sito.

## Earlier proof-of-access slice (Tuscany; superseded in the active lab)

The initial experiment used a working explorer with two real Sentinel-2 L2A RGB
previews over tile 32TPP (Tuscany), acquired on 31 July 2024 and 11 July 2025.
The imagery and provenance are bundled in [public/demo](../public/demo/) so the
demo does not depend on an external API during a presentation.

The comparison is visual exploration. Whole-tile previews may differ in
resolution and rendering. Their differences are not a quantitative change map.
Cloud percentages describe the entire tile, not an individual parcel.

The browser checks the SHA-256 of both image files against the bundled manifest,
creates a JSON evidence record, hashes its exact serialized UTF-8 content and
lets the visitor test an altered record and download the original. The exported
`serialized` string is the exact hash input. This establishes consistency with
the saved fixture, not authenticity against an independently trusted source.
There is no AI inference, blockchain transaction or carbon-credit issuance.

Refresh the source fixtures with Python 3 (standard library only):

```sh
python scripts/fetch-scenes.py
```

This downloads only previews and metadata, not the large analytical band files.
The manifest includes source STAC item URLs, acquisition times, bounding boxes,
cloud cover, preview hashes and links to red, NIR and SCL assets.

## Experiment 1: reproducible spectral baseline

Choose a small, fixed forest or agricultural polygon within the tile. Store its
GeoJSON, CRS, selection rationale and date windows in version control. Use the
asset URLs in the manifest to retrieve bounded windows of B04, B08 and SCL with
Rasterio/GDAL. Do not download entire tiles for each web request.

1. Reproject/crop both acquisitions to the exact same grid and resolution.
2. Exclude no-data, cloud, cloud shadow and snow using SCL; resample categorical
   masks with nearest-neighbour interpolation. Record the valid-pixel fraction.
3. Read each asset's STAC scale/offset and apply it to reflectance before computing
   `NDVI = (NIR - red) / (NIR + red)`. Mask zero denominators.
4. Export RGB crops, NDVI rasters, valid-pixel masks and summary statistics.
5. Compare matched seasonal windows and additional dates to distinguish persistent
   signals from phenology, agricultural cycles and acquisition artefacts.

Deliverable: a command-line pipeline plus fixture result JSON with input IDs,
AOI, band checksums, processing version, parameters and coverage statistics.
The UI should load precomputed outputs first; a backend job API can follow.
NDVI is a vegetation index, not an AI model or a direct measure of carbon.

Acceptance: repeated runs on fixed inputs agree within a documented numerical
tolerance; masks, alignment and scale/offset handling are independently checked;
insufficient valid coverage produces an explicit unavailable result.

## Experiment 2: evaluated AI change detection

Start with a scoped task such as detecting independently labelled forest
disturbance. Establish a simple spectral-change baseline before training the
random forest or CNN proposed in the study. A biomass model is a separate
experiment requiring field/reference biomass labels and calibration.

- Acquire reference labels with provenance and appropriate usage rights.
- Separate training and evaluation geographically and temporally to reduce leakage.
- Report precision, recall, F1, confusion matrix and errors by scene/land-cover
  type. Select a threshold using validation data, not the held-out test set.
- Compare the model with the baseline and document uncertainty and failure modes.
- Export model version, input hashes, inference settings and mask alongside every
  result. Show absent/low-quality data rather than filling gaps with predictions.

Deliverable: model card, reproducible evaluation report and an inference output
the explorer can display as a layer. Agree acceptable error and coverage with a
reviewer before evaluating. Do not invent performance targets after seeing results.

## Experiment 3: blockchain anchoring and demonstrative unit lifecycle

Keep images, geospatial data and full evidence off-chain. Use an append-only
registry contract to store a hash of the exact evidence bytes and emit an event
with submitter and evidence version. First test on a local EVM, then an Ethereum
application testnet such as Sepolia after checking current network availability.

Suggested minimal interface:

```solidity
function anchor(bytes32 evidenceHash) external;
event EvidenceAnchored(bytes32 indexed evidenceHash, address indexed submitter);
```

Reject duplicate submissions of the same digest. Test event contents, duplicate
rejection and independent hash recomputation. Define who may submit evidence;
an open prototype registry is not a trusted verifier registry.

The UI should distinguish waiting for a wallet signature, submitted, confirmed,
rejected and failed transactions. Display chain ID, contract address, transaction
hash, block and an explorer link only from a real receipt. Network/wallet
configuration must remain separate from private keys; never store a signing key
in the frontend. No wallet or paid service is required for the current demo.

Acceptance: a second client verifies the downloaded record against the on-chain
digest; any byte change fails verification. Anchoring proves that a digest was
registered, not that the underlying environmental assertion is correct.

To cover slide 15, extend this experiment with explicit reviewer roles and a
demonstrative issuance/retirement workflow. Anchor-only functionality is not
the full integrity layer described in the materials. Bind each demonstrative
issuance to a project, vintage, methodology version and approved evidence;
test access control, duplicate issuance, retirement balances and rejection of
repeated retirement. Preserve retirement events even if token balances are
burned. A revised report supersedes prior evidence rather than erasing history.
For reversals, record a new event and apply an explicit handling policy.
Label all units as test units without certified environmental value.

## Demonstration narrative

1. Introduce the five workstreams and their outputs in the team-work explorer.
2. Select the pilot area and show dated, attributable source observations.
3. Inspect quality masks, a spectral baseline and a genuinely evaluated model.
4. Generate/download an evidence bundle, including parameters and limitations.
5. Verify its digest against a real testnet receipt; demonstrate tamper detection.
6. Explain what remains before MRV certification: reference measurements,
   methodology acceptance, independent verification and registry coordination.

## Primary technical references

- [Element 84 Earth Search](https://github.com/Element84/earth-search): public STAC
  catalogue used to retrieve the preview fixtures.
- [Copernicus Browser documentation](https://documentation.dataspace.copernicus.eu/Applications/Browser.html):
  imagery exploration, spectral indices and comparison tools.
- [Ethereum networks](https://ethereum.org/en/developers/docs/networks/):
  application testnets and their purpose.

These experiments test data access, analytical reproducibility and evidence
integrity. They do not, by themselves, demonstrate certified carbon outcomes,
commercial feasibility or production-scale performance.
