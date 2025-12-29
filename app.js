// Application principale
let currentAssembleeId = null;
let currentResolutionId = null;
let currentVotes = {}; // { lotId: 'pour'|'contre'|'abstention' }

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await db.init();
    setupEventListeners();
    await loadDashboard();
});

// Configuration des événements
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            showView(view);
        });
    });

    // Dashboard
    document.getElementById('btnNewAssemblee').addEventListener('click', () => {
        createNewAssemblee();
    });

    // Copropriété
    document.getElementById('btnAddLot').addEventListener('click', () => {
        openModal('modalLot');
        document.getElementById('modalLotTitle').textContent = 'Ajouter un lot';
        clearLotForm();
    });

    document.getElementById('btnSaveLot').addEventListener('click', async () => {
        await saveLot();
    });

    // Assemblée
    document.getElementById('btnBackToList').addEventListener('click', () => {
        showAssembleeList();
    });

    document.getElementById('btnMarkPresence').addEventListener('click', () => {
        openModal('modalPresence');
        loadLotsForPresence();
    });

    document.getElementById('btnSavePresence').addEventListener('click', async () => {
        await savePresence();
    });

    document.getElementById('btnAddProcuration').addEventListener('click', () => {
        openModal('modalProcuration');
        loadLotsForProcuration();
    });

    document.getElementById('btnSaveProcuration').addEventListener('click', async () => {
        await saveProcuration();
    });

    document.getElementById('btnAddResolution').addEventListener('click', async () => {
        openModal('modalResolution');
        document.getElementById('modalResolutionTitle').textContent = 'Ajouter une résolution';
        await clearResolutionForm();
    });

    document.getElementById('btnSaveResolution').addEventListener('click', async () => {
        await saveResolution();
    });

    // Votes
    document.getElementById('btnSaveVote').addEventListener('click', async () => {
        await saveVote();
    });

    // Actions
    document.getElementById('btnGenerateReport').addEventListener('click', () => {
        generatePDFReport();
    });

    document.getElementById('btnExportData').addEventListener('click', () => {
        exportData();
    });

    document.getElementById('btnShareEmail').addEventListener('click', () => {
        shareByEmail();
    });

    // Modales
    document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.modal || e.target.closest('[data-modal]')?.dataset.modal;
            if (modalId) closeModal(modalId);
        });
    });

    // Sauvegarde automatique copropriété
    document.getElementById('coproName').addEventListener('blur', saveCoproprieteInfo);
    document.getElementById('coproAddress').addEventListener('blur', saveCoproprieteInfo);
}

// Navigation entre vues
function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    if (viewName === 'dashboard') {
        loadDashboard();
    } else if (viewName === 'copro') {
        loadCopropriete();
    } else if (viewName === 'assemblee') {
        loadAssemblees();
    }
}

// Modales
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Dashboard
async function loadDashboard() {
    const assemblees = await db.getAssemblees();
    const lots = await db.getLots();
    const copro = await db.getCopropriete();

    document.getElementById('statAssemblees').textContent = assemblees.length;
    document.getElementById('statLots').textContent = lots.length;
    document.getElementById('statCoproprietaires').textContent = lots.length;

    const listContainer = document.getElementById('assembleesList');
    listContainer.innerHTML = '';

    if (assemblees.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucune assemblée pour le moment</p>';
        return;
    }

    // Charger le nombre réel de résolutions pour chaque assemblée
    for (const assemblee of assemblees.slice(0, 5)) {
        const resolutions = await db.getResolutions(assemblee.id);
        const resolutionsCount = resolutions.length;

        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${assemblee.type} - ${formatDate(assemblee.date)}</div>
                <div class="list-item-subtitle">${resolutionsCount} résolution(s)</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-icon" onclick="openAssemblee(${assemblee.id})">→</button>
            </div>
        `;
        listContainer.appendChild(item);
    }
}

// Copropriété
async function loadCopropriete() {
    const copro = await db.getCopropriete();
    if (copro) {
        document.getElementById('coproName').value = copro.name || '';
        document.getElementById('coproAddress').value = copro.address || '';
    }

    await loadLots();
}

async function loadLots() {
    const lots = await db.getLots();
    const container = document.getElementById('lotsList');
    container.innerHTML = '';

    if (lots.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucun lot enregistré</p>';
        return;
    }

    lots.forEach(lot => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">Lot ${lot.number} - ${lot.owner}</div>
                <div class="list-item-subtitle">${lot.tantiemes} tantièmes - ${lot.type}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-icon" onclick="editLot(${lot.id})">✏️</button>
                <button class="btn-icon" onclick="deleteLot(${lot.id})">🗑️</button>
            </div>
        `;
        container.appendChild(item);
    });
}

async function saveCoproprieteInfo() {
    const name = document.getElementById('coproName').value;
    const address = document.getElementById('coproAddress').value;
    await db.saveCopropriete({ name, address });
}

function clearLotForm() {
    document.getElementById('lotNumber').value = '';
    document.getElementById('lotOwner').value = '';
    document.getElementById('lotTantiemes').value = '';
    document.getElementById('lotType').value = 'appartement';
}

async function saveLot() {
    const number = document.getElementById('lotNumber').value;
    const owner = document.getElementById('lotOwner').value;
    const tantiemes = parseInt(document.getElementById('lotTantiemes').value);
    const type = document.getElementById('lotType').value;

    if (!number || !owner || !tantiemes) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    const lot = { number, owner, tantiemes, type };
    if (window.editingLotId) {
        lot.id = window.editingLotId;
    }

    await db.saveLot(lot);
    closeModal('modalLot');
    await loadLots();
    window.editingLotId = null;
}

async function editLot(id) {
    const lot = await db.getLot(id);
    if (lot) {
        window.editingLotId = id;
        document.getElementById('modalLotTitle').textContent = 'Modifier le lot';
        document.getElementById('lotNumber').value = lot.number;
        document.getElementById('lotOwner').value = lot.owner;
        document.getElementById('lotTantiemes').value = lot.tantiemes;
        document.getElementById('lotType').value = lot.type;
        openModal('modalLot');
    }
}

async function deleteLot(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
        await db.deleteLot(id);
        await loadLots();
    }
}

// Assemblées
async function loadAssemblees() {
    const assemblees = await db.getAssemblees();
    const container = document.getElementById('assembleesListSelector');
    container.innerHTML = '';

    if (assemblees.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucune assemblée. Créez-en une nouvelle.</p>';
        return;
    }

    // Charger le nombre réel de résolutions pour chaque assemblée
    for (const assemblee of assemblees) {
        const resolutions = await db.getResolutions(assemblee.id);
        const resolutionsCount = resolutions.length;

        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${assemblee.type} - ${formatDate(assemblee.date)}</div>
                <div class="list-item-subtitle">${resolutionsCount} résolution(s)</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-icon" onclick="openAssemblee(${assemblee.id})">→</button>
            </div>
        `;
        container.appendChild(item);
    }
}

function showAssembleeList() {
    document.getElementById('assembleeSelector').style.display = 'block';
    document.getElementById('assembleeDetail').style.display = 'none';
    currentAssembleeId = null;
    loadAssemblees();
}

async function createNewAssemblee() {
    const date = new Date().toISOString().split('T')[0];
    const assemblee = {
        date,
        type: 'AGO',
        resolutionsCount: 0
    };
    const id = await db.saveAssemblee(assemblee);
    await openAssemblee(id);
}

async function openAssemblee(id) {
    // Changer de vue vers "assemblee" si on n'y est pas déjà
    showView('assemblee');
    
    currentAssembleeId = id;
    const assemblee = await db.getAssemblee(id);
    
    if (!assemblee) return;

    document.getElementById('assembleeSelector').style.display = 'none';
    document.getElementById('assembleeDetail').style.display = 'block';
    document.getElementById('assembleeTitle').textContent = `${assemblee.type} - ${formatDate(assemblee.date)}`;
    document.getElementById('assembleeDate').value = assemblee.date;
    document.getElementById('assembleeType').value = assemblee.type;

    // Supprimer les anciens event listeners pour éviter les doublons
    const dateInput = document.getElementById('assembleeDate');
    const typeInput = document.getElementById('assembleeType');
    
    // Cloner et remplacer pour supprimer les anciens listeners
    const newDateInput = dateInput.cloneNode(true);
    const newTypeInput = typeInput.cloneNode(true);
    dateInput.parentNode.replaceChild(newDateInput, dateInput);
    typeInput.parentNode.replaceChild(newTypeInput, typeInput);

    // Sauvegarde automatique des modifications
    newDateInput.addEventListener('change', async () => {
        assemblee.date = newDateInput.value;
        await db.saveAssemblee(assemblee);
    });
    newTypeInput.addEventListener('change', async () => {
        assemblee.type = newTypeInput.value;
        await db.saveAssemblee(assemblee);
    });

    await loadAssembleeData();
}

async function loadAssembleeData() {
    await loadQuorum();
    await loadPresences();
    await loadProcurations();
    await loadResolutions();
}

// Quorum
async function loadQuorum() {
    const lots = await db.getLots();
    const presences = await db.getPresences(currentAssembleeId);
    const procurations = await db.getProcurations(currentAssembleeId);

    // Calcul des voix présentes
    let totalVoix = 0;
    let presentesVoix = 0;

    lots.forEach(lot => {
        totalVoix += lot.tantiemes;
    });

    // Lots présents directement
    const lotsPresentsIds = new Set(presences.map(p => p.lotId));
    presences.forEach(presence => {
        const lot = lots.find(l => l.id === presence.lotId);
        if (lot) presentesVoix += lot.tantiemes;
    });

    // Ajout des voix des procurations
    procurations.forEach(proc => {
        const lotMandant = lots.find(l => l.id === proc.mandantId);
        const lotMandataire = lots.find(l => l.id === proc.mandataireId);
        if (lotMandant && lotMandataire && lotsPresentsIds.has(proc.mandataireId)) {
            presentesVoix += lotMandant.tantiemes;
        }
    });

    const quorumPercent = totalVoix > 0 ? Math.round((presentesVoix / totalVoix) * 100) : 0;
    const quorumValid = presentesVoix >= totalVoix / 2;

    document.getElementById('quorumValue').textContent = `${quorumPercent}%`;
    document.getElementById('quorumPresents').textContent = presentesVoix;
    document.getElementById('quorumTotal').textContent = totalVoix;
    
    const statusEl = document.getElementById('quorumStatus');
    if (quorumValid) {
        statusEl.textContent = '✓ Quorum atteint';
        statusEl.className = 'quorum-status valid';
    } else {
        statusEl.textContent = '✗ Quorum non atteint';
        statusEl.className = 'quorum-status invalid';
    }
}

// Présences
async function loadPresences() {
    const presences = await db.getPresences(currentAssembleeId);
    const lots = await db.getLots();
    const container = document.getElementById('presencesList');
    container.innerHTML = '';

    if (presences.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucune présence enregistrée</p>';
        return;
    }

    presences.forEach(presence => {
        const lot = lots.find(l => l.id === presence.lotId);
        if (!lot) return;

        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">Lot ${lot.number} - ${lot.owner}</div>
                <div class="list-item-subtitle">${lot.tantiemes} voix</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-icon" onclick="deletePresence(${presence.id})">🗑️</button>
            </div>
        `;
        container.appendChild(item);
    });
}

async function loadLotsForPresence() {
    const lots = await db.getLots();
    const presences = await db.getPresences(currentAssembleeId);
    const presencesLotIds = new Set(presences.map(p => p.lotId));

    const select = document.getElementById('presenceLot');
    select.innerHTML = '';

    lots.forEach(lot => {
        if (!presencesLotIds.has(lot.id)) {
            const option = document.createElement('option');
            option.value = lot.id;
            option.textContent = `Lot ${lot.number} - ${lot.owner} (${lot.tantiemes} voix)`;
            select.appendChild(option);
        }
    });
}

async function savePresence() {
    const lotId = parseInt(document.getElementById('presenceLot').value);
    if (!lotId) {
        alert('Veuillez sélectionner un lot');
        return;
    }

    await db.savePresence({
        assembleeId: currentAssembleeId,
        lotId: lotId
    });

    closeModal('modalPresence');
    await loadAssembleeData();
}

async function deletePresence(id) {
    if (confirm('Supprimer cette présence ?')) {
        await db.deletePresence(id);
        await loadAssembleeData();
    }
}

// Procurations
async function loadProcurations() {
    const procurations = await db.getProcurations(currentAssembleeId);
    const lots = await db.getLots();
    const container = document.getElementById('procurationsList');
    container.innerHTML = '';

    if (procurations.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucune procuration enregistrée</p>';
        return;
    }

    procurations.forEach(proc => {
        const mandant = lots.find(l => l.id === proc.mandantId);
        const mandataire = lots.find(l => l.id === proc.mandataireId);
        if (!mandant || !mandataire) return;

        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">Lot ${mandant.number} → Lot ${mandataire.number}</div>
                <div class="list-item-subtitle">${mandant.owner} donne procuration à ${mandataire.owner}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-icon" onclick="deleteProcuration(${proc.id})">🗑️</button>
            </div>
        `;
        container.appendChild(item);
    });
}

async function loadLotsForProcuration() {
    const lots = await db.getLots();
    const selectMandant = document.getElementById('procurationMandant');
    const selectMandataire = document.getElementById('procurationMandataire');

    selectMandant.innerHTML = '';
    selectMandataire.innerHTML = '';

    lots.forEach(lot => {
        const option1 = document.createElement('option');
        option1.value = lot.id;
        option1.textContent = `Lot ${lot.number} - ${lot.owner}`;
        selectMandant.appendChild(option1.cloneNode(true));
        selectMandataire.appendChild(option1);
    });
}

async function saveProcuration() {
    const mandantId = parseInt(document.getElementById('procurationMandant').value);
    const mandataireId = parseInt(document.getElementById('procurationMandataire').value);

    if (!mandantId || !mandataireId) {
        alert('Veuillez sélectionner les deux lots');
        return;
    }

    if (mandantId === mandataireId) {
        alert('Le mandant et le mandataire doivent être différents');
        return;
    }

    await db.saveProcuration({
        assembleeId: currentAssembleeId,
        mandantId: mandantId,
        mandataireId: mandataireId
    });

    closeModal('modalProcuration');
    await loadAssembleeData();
}

async function deleteProcuration(id) {
    if (confirm('Supprimer cette procuration ?')) {
        await db.deleteProcuration(id);
        await loadAssembleeData();
    }
}

// Résolutions
async function loadResolutions() {
    const resolutions = await db.getResolutions(currentAssembleeId);
    const container = document.getElementById('resolutionsList');
    container.innerHTML = '';

    if (resolutions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucune résolution</p>';
        return;
    }

    resolutions.forEach(resolution => {
        const item = document.createElement('div');
        item.className = 'list-item';
        
        const hasVotes = resolution.hasVotes || false;
        const statusBadge = hasVotes ? '<span class="badge badge-success">Votée</span>' : '<span class="badge badge-warning">En attente</span>';
        
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">Résolution ${resolution.number}: ${resolution.libelle.substring(0, 50)}${resolution.libelle.length > 50 ? '...' : ''}</div>
                <div class="list-item-subtitle">Majorité: ${getMajoriteLabel(resolution.majorite)} ${statusBadge}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-icon" onclick="openVote(${resolution.id})">🗳️</button>
                <button class="btn-icon" onclick="editResolution(${resolution.id})">✏️</button>
                <button class="btn-icon" onclick="deleteResolution(${resolution.id})">🗑️</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function getMajoriteLabel(majorite) {
    const labels = {
        'simple': 'Majorité simple',
        'absolue': 'Majorité absolue',
        '2tiers': 'Majorité des 2/3',
        'unanimite': 'Unanimité'
    };
    return labels[majorite] || majorite;
}

async function clearResolutionForm() {
    // Calculer le prochain numéro de résolution disponible
    const resolutions = await db.getResolutions(currentAssembleeId);
    let nextNumber = 1;
    if (resolutions.length > 0) {
        // Trouver le numéro maximum et ajouter 1
        const maxNumber = Math.max(...resolutions.map(r => r.number || 0));
        nextNumber = maxNumber + 1;
    }
    document.getElementById('resolutionNumber').value = nextNumber;
    document.getElementById('resolutionLibelle').value = '';
    document.getElementById('resolutionMajorite').value = 'simple';
}

async function saveResolution() {
    let number = document.getElementById('resolutionNumber').value;
    const libelle = document.getElementById('resolutionLibelle').value;
    const majorite = document.getElementById('resolutionMajorite').value;

    if (!libelle) {
        alert('Veuillez remplir le libellé de la résolution');
        return;
    }

    // Si le numéro est vide, générer automatiquement le prochain numéro
    if (!number || number.trim() === '') {
        const resolutions = await db.getResolutions(currentAssembleeId);
        let nextNumber = 1;
        if (resolutions.length > 0) {
            const maxNumber = Math.max(...resolutions.map(r => r.number || 0));
            nextNumber = maxNumber + 1;
        }
        number = nextNumber;
    }

    const resolution = {
        assembleeId: currentAssembleeId,
        number: parseInt(number) || 1,
        libelle,
        majorite
    };

    if (window.editingResolutionId) {
        resolution.id = window.editingResolutionId;
    }

    await db.saveResolution(resolution);
    closeModal('modalResolution');
    await loadResolutions();
    window.editingResolutionId = null;
}

async function editResolution(id) {
    const resolution = await db.getResolution(id);
    if (resolution) {
        window.editingResolutionId = id;
        document.getElementById('modalResolutionTitle').textContent = 'Modifier la résolution';
        document.getElementById('resolutionNumber').value = resolution.number;
        document.getElementById('resolutionLibelle').value = resolution.libelle;
        document.getElementById('resolutionMajorite').value = resolution.majorite;
        openModal('modalResolution');
    }
}

async function deleteResolution(id) {
    if (confirm('Supprimer cette résolution ? Les votes associés seront également supprimés.')) {
        await db.deleteVotesByResolution(id);
        await db.deleteResolution(id);
        await loadResolutions();
    }
}

// Votes
async function openVote(resolutionId) {
    currentResolutionId = resolutionId;
    const resolution = await db.getResolution(resolutionId);
    if (!resolution) return;

    document.getElementById('modalVoteTitle').textContent = `Vote - Résolution ${resolution.number}`;
    document.getElementById('voteResolutionInfo').innerHTML = `
        <strong>Résolution ${resolution.number}</strong><br>
        ${resolution.libelle}<br>
        <small>Majorité requise: ${getMajoriteLabel(resolution.majorite)}</small>
    `;

    // Charger les votes existants
    const existingVotes = await db.getVotes(resolutionId);
    currentVotes = {};
    existingVotes.forEach(vote => {
        currentVotes[vote.lotId] = vote.vote;
    });

    await loadVoteLots();
    updateVoteResults();
    openModal('modalVote');
}

async function loadVoteLots() {
    const lots = await db.getLots();
    const presences = await db.getPresences(currentAssembleeId);
    const procurations = await db.getProcurations(currentAssembleeId);

    // Construire la liste des lots avec voix (présents + procurations)
    const lotsAvecVoix = new Map();

    // Lots présents directement
    presences.forEach(presence => {
        const lot = lots.find(l => l.id === presence.lotId);
        if (lot) {
            lotsAvecVoix.set(lot.id, {
                lot: lot,
                voix: lot.tantiemes,
                type: 'present'
            });
        }
    });

    // Ajouter les procurations
    procurations.forEach(proc => {
        const lotMandant = lots.find(l => l.id === proc.mandantId);
        const lotMandataire = lots.find(l => l.id === proc.mandataireId);
        if (lotMandant && lotMandataire && lotsAvecVoix.has(proc.mandataireId)) {
            const existing = lotsAvecVoix.get(proc.mandataireId);
            existing.voix += lotMandant.tantiemes;
            existing.procurations = existing.procurations || [];
            existing.procurations.push(lotMandant);
        }
    });

    const container = document.getElementById('voteLotsList');
    container.innerHTML = '';

    lotsAvecVoix.forEach((data, lotId) => {
        const item = document.createElement('div');
        item.className = 'vote-lot-item';
        
        let infoText = `Lot ${data.lot.number} - ${data.lot.owner} (${data.voix} voix)`;
        if (data.procurations && data.procurations.length > 0) {
            infoText += ` + procurations`;
        }

        const currentVote = currentVotes[lotId] || null;

        item.innerHTML = `
            <div class="vote-lot-info">${infoText}</div>
            <div class="vote-lot-actions">
                <button class="vote-btn pour ${currentVote === 'pour' ? 'active' : ''}" 
                        onclick="setVote(${lotId}, 'pour')">Pour</button>
                <button class="vote-btn contre ${currentVote === 'contre' ? 'active' : ''}" 
                        onclick="setVote(${lotId}, 'contre')">Contre</button>
                <button class="vote-btn abstention ${currentVote === 'abstention' ? 'active' : ''}" 
                        onclick="setVote(${lotId}, 'abstention')">Abst.</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function setVote(lotId, vote) {
    currentVotes[lotId] = vote;
    loadVoteLots();
    updateVoteResults();
}

async function updateVoteResults() {
    const lots = await db.getLots();
    const presences = await db.getPresences(currentAssembleeId);
    const procurations = await db.getProcurations(currentAssembleeId);
    const resolution = await db.getResolution(currentResolutionId);

    // Calculer les voix par lot (présent + procurations)
    const voixParLot = new Map();
    
    presences.forEach(presence => {
        const lot = lots.find(l => l.id === presence.lotId);
        if (lot) {
            voixParLot.set(lot.id, lot.tantiemes);
        }
    });

    procurations.forEach(proc => {
        const lotMandant = lots.find(l => l.id === proc.mandantId);
        const lotMandataire = lots.find(l => l.id === proc.mandataireId);
        if (lotMandant && lotMandataire && voixParLot.has(proc.mandataireId)) {
            voixParLot.set(proc.mandataireId, voixParLot.get(proc.mandataireId) + lotMandant.tantiemes);
        }
    });

    let pour = 0, contre = 0, abstention = 0;

    Object.entries(currentVotes).forEach(([lotId, vote]) => {
        const voix = voixParLot.get(parseInt(lotId)) || 0;
        if (vote === 'pour') pour += voix;
        else if (vote === 'contre') contre += voix;
        else if (vote === 'abstention') abstention += voix;
    });

    const total = pour + contre + abstention;
    const totalVoix = Array.from(voixParLot.values()).reduce((a, b) => a + b, 0);

    document.getElementById('votePour').textContent = pour;
    document.getElementById('voteContre').textContent = contre;
    document.getElementById('voteAbstention').textContent = abstention;
    document.getElementById('voteTotal').textContent = total;

    document.getElementById('votePourPercent').textContent = total > 0 ? Math.round((pour / total) * 100) + '%' : '0%';
    document.getElementById('voteContrePercent').textContent = total > 0 ? Math.round((contre / total) * 100) + '%' : '0%';
    document.getElementById('voteAbstentionPercent').textContent = total > 0 ? Math.round((abstention / total) * 100) + '%' : '0%';

    // Vérifier si la résolution est approuvée
    const statusEl = document.getElementById('voteStatus');
    let approuve = false;

    if (resolution.majorite === 'simple' || resolution.majorite === 'absolue') {
        approuve = pour > (total / 2);
    } else if (resolution.majorite === '2tiers') {
        approuve = pour >= (total * 2 / 3);
    } else if (resolution.majorite === 'unanimite') {
        approuve = pour === total && contre === 0;
    }

    if (approuve) {
        statusEl.textContent = '✓ Résolution approuvée';
        statusEl.className = 'vote-status approuve';
    } else {
        statusEl.textContent = '✗ Résolution rejetée';
        statusEl.className = 'vote-status rejete';
    }
}

async function saveVote() {
    // Supprimer les anciens votes
    await db.deleteVotesByResolution(currentResolutionId);

    // Enregistrer les nouveaux votes
    for (const [lotId, vote] of Object.entries(currentVotes)) {
        await db.saveVote({
            resolutionId: currentResolutionId,
            lotId: parseInt(lotId),
            vote: vote
        });
    }

    // Marquer la résolution comme votée
    const resolution = await db.getResolution(currentResolutionId);
    resolution.hasVotes = true;
    await db.saveResolution(resolution);

    closeModal('modalVote');
    await loadResolutions();
}

// Génération PDF
async function generatePDFReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const assemblee = await db.getAssemblee(currentAssembleeId);
    const copro = await db.getCopropriete();
    const lots = await db.getLots();
    const presences = await db.getPresences(currentAssembleeId);
    const procurations = await db.getProcurations(currentAssembleeId);
    const resolutions = await db.getResolutions(currentAssembleeId);

    // Fonction helper pour vérifier si on doit ajouter une nouvelle page
    function checkNewPage(requiredSpace = 20) {
        if (y + requiredSpace > 280) {
            doc.addPage();
            y = 20;
            return true;
        }
        return false;
    }

    let y = 20;

    // En-tête
    doc.setFontSize(20);
    doc.text('Rapport d\'Assemblée Générale', 20, y);
    y += 10;

    doc.setFontSize(12);
    if (copro) {
        doc.text(`Copropriété: ${copro.name || ''}`, 20, y);
        y += 7;
        if (copro.address) {
            doc.text(`Adresse: ${copro.address}`, 20, y);
            y += 7;
        }
    }

    doc.text(`Date: ${formatDate(assemblee.date)}`, 20, y);
    y += 7;
    doc.text(`Type: ${assemblee.type}`, 20, y);
    y += 15;

    // Calcul du quorum
    let totalVoix = lots.reduce((sum, lot) => sum + lot.tantiemes, 0);
    let presentesVoix = 0;
    const lotsPresentsIds = new Set(presences.map(p => p.lotId));
    
    presences.forEach(presence => {
        const lot = lots.find(l => l.id === presence.lotId);
        if (lot) presentesVoix += lot.tantiemes;
    });

    procurations.forEach(proc => {
        const lotMandant = lots.find(l => l.id === proc.mandantId);
        const lotMandataire = lots.find(l => l.id === proc.mandataireId);
        if (lotMandant && lotMandataire && lotsPresentsIds.has(proc.mandataireId)) {
            presentesVoix += lotMandant.tantiemes;
        }
    });

    const quorumPercent = totalVoix > 0 ? Math.round((presentesVoix / totalVoix) * 100) : 0;

    // Section Quorum
    checkNewPage(20);
    doc.setFontSize(14);
    doc.text('Quorum', 20, y);
    y += 7;
    doc.setFontSize(12);
    doc.text(`Présents: ${presentesVoix} voix sur ${totalVoix} (${quorumPercent}%)`, 20, y);
    y += 7;
    doc.text(`Quorum ${quorumPercent >= 50 ? 'atteint' : 'non atteint'}`, 20, y);
    y += 15;

    // Section Présences et Absences
    checkNewPage(30);
    doc.setFontSize(14);
    doc.text('Présences et Absences', 20, y);
    y += 7;
    doc.setFontSize(11);
    
    // Lots présents
    const lotsPresents = presences.map(p => {
        const lot = lots.find(l => l.id === p.lotId);
        return lot ? { lot, present: true } : null;
    }).filter(Boolean);

    const lotsAbsents = lots.filter(lot => !lotsPresentsIds.has(lot.id));

    doc.setFontSize(10);
    doc.text('Lots présents:', 20, y);
    y += 5;
    
    if (lotsPresents.length > 0) {
        lotsPresents.forEach(({ lot }) => {
            checkNewPage(5);
            doc.text(`  • Lot ${lot.number} - ${lot.owner} (${lot.tantiemes} tantièmes)`, 25, y);
            y += 5;
        });
    } else {
        doc.text('  Aucun lot présent', 25, y);
        y += 5;
    }

    y += 3;
    doc.text('Lots absents:', 20, y);
    y += 5;

    if (lotsAbsents.length > 0) {
        lotsAbsents.forEach(lot => {
            checkNewPage(5);
            doc.text(`  • Lot ${lot.number} - ${lot.owner} (${lot.tantiemes} tantièmes)`, 25, y);
            y += 5;
        });
    } else {
        doc.text('  Aucun lot absent', 25, y);
        y += 5;
    }

    y += 10;

    // Section Procurations
    if (procurations.length > 0) {
        checkNewPage(20);
        doc.setFontSize(14);
        doc.text('Procurations', 20, y);
        y += 7;
        doc.setFontSize(10);
        
        procurations.forEach(proc => {
            checkNewPage(10);
            const lotMandant = lots.find(l => l.id === proc.mandantId);
            const lotMandataire = lots.find(l => l.id === proc.mandataireId);
            if (lotMandant && lotMandataire) {
                // Construire le texte de la procuration
                const textLine = `  • Lot ${lotMandant.number} (${lotMandant.owner}) -> Lot ${lotMandataire.number} (${lotMandataire.owner}) - ${lotMandant.tantiemes} tantiemes`;
                // Utiliser splitTextToSize pour gérer les longues lignes et les caractères spéciaux
                const textLines = doc.splitTextToSize(textLine, 165);
                doc.text(textLines, 25, y);
                y += textLines.length * 5;
            }
        });
        y += 10;
    }

    // Section Résolutions et votes détaillés
    for (const resolution of resolutions) {
        checkNewPage(30);
        
        doc.setFontSize(14);
        doc.text(`Résolution ${resolution.number}`, 20, y);
        y += 7;
        doc.setFontSize(11);
        const libelleLines = doc.splitTextToSize(resolution.libelle, 170);
        doc.text(libelleLines, 20, y);
        y += libelleLines.length * 5 + 5;
        doc.setFontSize(10);
        doc.text(`Majorité requise: ${getMajoriteLabel(resolution.majorite)}`, 20, y);
        y += 7;

        const votes = await db.getVotes(resolution.id);
        if (votes.length > 0) {
            let pour = 0, contre = 0, abstention = 0;

            // Calculer les voix par lot (présent + procurations)
            const voixParLot = new Map();
            presences.forEach(presence => {
                const lot = lots.find(l => l.id === presence.lotId);
                if (lot) voixParLot.set(lot.id, lot.tantiemes);
            });

            procurations.forEach(proc => {
                const lotMandant = lots.find(l => l.id === proc.mandantId);
                const lotMandataire = lots.find(l => l.id === proc.mandataireId);
                if (lotMandant && lotMandataire && voixParLot.has(proc.mandataireId)) {
                    voixParLot.set(proc.mandataireId, voixParLot.get(proc.mandataireId) + lotMandant.tantiemes);
                }
            });

            // Calculer les totaux
            votes.forEach(vote => {
                const voix = voixParLot.get(vote.lotId) || 0;
                if (vote.vote === 'pour') pour += voix;
                else if (vote.vote === 'contre') contre += voix;
                else if (vote.vote === 'abstention') abstention += voix;
            });

            const total = pour + contre + abstention;
            
            // Résultats globaux
            doc.setFontSize(11);
            doc.text('Résultats:', 20, y);
            y += 6;
            doc.setFontSize(10);
            doc.text(`  Pour: ${pour} voix (${total > 0 ? Math.round((pour / total) * 100) : 0}%)`, 25, y);
            y += 5;
            doc.text(`  Contre: ${contre} voix (${total > 0 ? Math.round((contre / total) * 100) : 0}%)`, 25, y);
            y += 5;
            doc.text(`  Abstention: ${abstention} voix (${total > 0 ? Math.round((abstention / total) * 100) : 0}%)`, 25, y);
            y += 5;
            doc.text(`  Total exprimé: ${total} voix`, 25, y);
            y += 8;

            // Détail des votes par lot
            checkNewPage(15);
            doc.setFontSize(11);
            doc.text('Détail des votes:', 20, y);
            y += 6;
            doc.setFontSize(9);

            // Grouper par type de vote
            const votesPour = votes.filter(v => v.vote === 'pour');
            const votesContre = votes.filter(v => v.vote === 'contre');
            const votesAbstention = votes.filter(v => v.vote === 'abstention');

            if (votesPour.length > 0) {
                doc.setFontSize(10);
                doc.text('  Pour:', 25, y);
                y += 5;
                doc.setFontSize(9);
                votesPour.forEach(vote => {
                    checkNewPage(5);
                    const lot = lots.find(l => l.id === vote.lotId);
                    if (lot) {
                        const voix = voixParLot.get(lot.id) || 0;
                        // Vérifier si ce lot a des procurations
                        const procurationsRecues = procurations.filter(p => p.mandataireId === lot.id);
                        let detail = `    • Lot ${lot.number} - ${lot.owner}: ${voix} voix`;
                        if (procurationsRecues.length > 0) {
                            const voixProcurations = procurationsRecues.reduce((sum, p) => {
                                const lotMandant = lots.find(l => l.id === p.mandantId);
                                return sum + (lotMandant ? lotMandant.tantiemes : 0);
                            }, 0);
                            detail += ` (dont ${voixProcurations} par procuration)`;
                        }
                        doc.text(detail, 30, y);
                        y += 4;
                    }
                });
                y += 3;
            }

            if (votesContre.length > 0) {
                checkNewPage(10);
                doc.setFontSize(10);
                doc.text('  Contre:', 25, y);
                y += 5;
                doc.setFontSize(9);
                votesContre.forEach(vote => {
                    checkNewPage(5);
                    const lot = lots.find(l => l.id === vote.lotId);
                    if (lot) {
                        const voix = voixParLot.get(lot.id) || 0;
                        const procurationsRecues = procurations.filter(p => p.mandataireId === lot.id);
                        let detail = `    • Lot ${lot.number} - ${lot.owner}: ${voix} voix`;
                        if (procurationsRecues.length > 0) {
                            const voixProcurations = procurationsRecues.reduce((sum, p) => {
                                const lotMandant = lots.find(l => l.id === p.mandantId);
                                return sum + (lotMandant ? lotMandant.tantiemes : 0);
                            }, 0);
                            detail += ` (dont ${voixProcurations} par procuration)`;
                        }
                        doc.text(detail, 30, y);
                        y += 4;
                    }
                });
                y += 3;
            }

            if (votesAbstention.length > 0) {
                checkNewPage(10);
                doc.setFontSize(10);
                doc.text('  Abstention:', 25, y);
                y += 5;
                doc.setFontSize(9);
                votesAbstention.forEach(vote => {
                    checkNewPage(5);
                    const lot = lots.find(l => l.id === vote.lotId);
                    if (lot) {
                        const voix = voixParLot.get(lot.id) || 0;
                        const procurationsRecues = procurations.filter(p => p.mandataireId === lot.id);
                        let detail = `    • Lot ${lot.number} - ${lot.owner}: ${voix} voix`;
                        if (procurationsRecues.length > 0) {
                            const voixProcurations = procurationsRecues.reduce((sum, p) => {
                                const lotMandant = lots.find(l => l.id === p.mandantId);
                                return sum + (lotMandant ? lotMandant.tantiemes : 0);
                            }, 0);
                            detail += ` (dont ${voixProcurations} par procuration)`;
                        }
                        doc.text(detail, 30, y);
                        y += 4;
                    }
                });
                y += 3;
            }

            // Statut de la résolution
            checkNewPage(10);
            let approuve = false;
            if (resolution.majorite === 'simple' || resolution.majorite === 'absolue') {
                approuve = pour > (total / 2);
            } else if (resolution.majorite === '2tiers') {
                approuve = pour >= (total * 2 / 3);
            } else if (resolution.majorite === 'unanimite') {
                approuve = pour === total && contre === 0;
            }

            doc.setFontSize(11);
            doc.setTextColor(approuve ? 52 : 255, approuve ? 199 : 59, approuve ? 89 : 48);
            doc.text(`Résultat: ${approuve ? 'APPROUVÉE' : 'REJETÉE'}`, 20, y);
            doc.setTextColor(0, 0, 0); // Remettre en noir
            y += 7;
        } else {
            doc.text('Non votée', 20, y);
            y += 5;
        }
        y += 10;
    }

    // Sauvegarder
    const fileName = `AG_${assemblee.type}_${assemblee.date.replace(/-/g, '')}.pdf`;
    doc.save(fileName);
}

// Export données
async function exportData() {
    const assemblee = await db.getAssemblee(currentAssembleeId);
    const lots = await db.getLots();
    const presences = await db.getPresences(currentAssembleeId);
    const procurations = await db.getProcurations(currentAssembleeId);
    const resolutions = await db.getResolutions(currentAssembleeId);

    // CSV des présences
    let csv = 'Lot,Propriétaire,Tantièmes\n';
    presences.forEach(presence => {
        const lot = lots.find(l => l.id === presence.lotId);
        if (lot) {
            csv += `${lot.number},"${lot.owner}",${lot.tantiemes}\n`;
        }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AG_${assemblee.date}_presences.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Partage par email
async function shareByEmail() {
    const assemblee = await db.getAssemblee(currentAssembleeId);
    const copro = await db.getCopropriete();

    // Générer le PDF d'abord
    await generatePDFReport();

    // Note: Pour ouvrir Mail avec pièce jointe, il faudrait utiliser
    // mailto: avec data URI ou File API, mais c'est limité
    // On peut au moins ouvrir mailto avec le sujet et le corps
    const subject = encodeURIComponent(`Rapport ${assemblee.type} - ${formatDate(assemblee.date)}`);
    const body = encodeURIComponent(`Veuillez trouver ci-joint le rapport de l'assemblée générale.\n\n${copro ? copro.name : 'Copropriété'}`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// Utilitaires
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Exposer les fonctions globales
window.openAssemblee = openAssemblee;
window.editLot = editLot;
window.deleteLot = deleteLot;
window.deletePresence = deletePresence;
window.deleteProcuration = deleteProcuration;
window.openVote = openVote;
window.editResolution = editResolution;
window.deleteResolution = deleteResolution;
window.setVote = setVote;

