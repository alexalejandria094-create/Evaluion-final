document.addEventListener("DOMContentLoaded", () => {
    // Tabs Navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));
            
            link.classList.add('active');
            document.getElementById(link.getAttribute('data-tab')).classList.add('active');
            
            // Reload data based on tab
            if(link.getAttribute('data-tab') === 'dashboard') loadStats();
            if(link.getAttribute('data-tab') === 'pets') loadPets();
            if(link.getAttribute('data-tab') === 'services') loadServices();
            if(link.getAttribute('data-tab') === 'appointments') loadAppointments();
        });
    });

    // Initial load
    loadStats();
    loadPets();
    loadServices();

    // Forms
    document.getElementById('pet-form').addEventListener('submit', handlePetSubmit);
    document.getElementById('app-form').addEventListener('submit', handleAppSubmit);
});

/* Modal Logic */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        if(id === 'app-modal') populateAppDropdowns();
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
    }
}

/* API Calls & UI Rendering */
async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        const stats = await res.json();
        const updateText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        updateText('st-pets', stats.totalPets);
        updateText('st-services', stats.totalServices);
        updateText('st-apps', stats.totalAppointments);
        updateText('st-conf', stats.confirmedAppointments);
    } catch(e) { console.error('Error fetching stats', e); }
}

async function loadPets() {
    try {
        const res = await fetch('/api/pets');
        const pets = await res.json();
        const tbody = document.getElementById('pets-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        pets.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td><span style="font-weight: 700; color: var(--accent);">#${p.id}</span></td>
                    <td><div style="font-weight: 600;">${p.name}</div><div style="font-size: 0.75rem; color: var(--text-secondary);">${p.breed || 'Sin raza'}</div></td>
                    <td><span class="status-badge status-completed" style="background: #f1f5f9; color: var(--text-primary);">${p.species}</span></td>
                    <td>${p.age} años</td>
                    <td>${p.owner}</td>
                    <td><i class="fa-solid fa-phone" style="font-size: 0.8rem; margin-right: 5px; opacity: 0.5;"></i> ${p.phone}</td>
                    <td>
                        <button class="btn" style="padding: 8px; background: #fee2e2; color: #ef4444;" onclick="deletePet(${p.id})">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function handlePetSubmit(e) {
    e.preventDefault();
    const pet = {
        name: document.getElementById('pet-name').value,
        species: document.getElementById('pet-species').value,
        breed: document.getElementById('pet-breed').value,
        age: parseInt(document.getElementById('pet-age').value),
        owner: document.getElementById('pet-owner').value,
        phone: document.getElementById('pet-phone').value
    };

    try {
        await fetch('/api/pets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pet)
        });
        
        closeModal('pet-modal');
        e.target.reset();
        loadPets();
        loadStats();
    } catch(e) {
        alert('Error al registrar mascota');
    }
}

async function deletePet(id) {
    if(confirm('¿Seguro que desea eliminar este paciente?')) {
        await fetch('/api/pets/' + id, { method: 'DELETE' });
        loadPets();
        loadStats();
    }
}

async function loadServices() {
    try {
        const res = await fetch('/api/services');
        window.servicesData = await res.json(); 
        const tbody = document.getElementById('services-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        window.servicesData.forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td>#${s.id}</td>
                    <td style="font-weight: 600;">${s.name}</td>
                    <td><span style="color: var(--success); font-weight: 700;">S/ ${s.price.toFixed(2)}</span></td>
                    <td><i class="fa-regular fa-clock"></i> ${s.duration}</td>
                    <td style="color: var(--text-secondary); font-size: 0.85rem;">${s.description}</td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function loadAppointments() {
    try {
        const res = await fetch('/api/appointments');
        const apps = await res.json();
        const tbody = document.getElementById('app-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        apps.forEach(a => {
            const statusClass = a.status === 'confirmed' ? 'status-confirmed' : (a.status==='completed' ? 'status-completed' : 'status-pending');
            const statusText = a.status === 'confirmed' ? 'Confirmada' : (a.status==='completed' ? 'Completada' : 'Pendiente');
            
            tbody.innerHTML += `
                <tr>
                    <td>#${a.id}</td>
                    <td style="font-weight:600;">Paciente ID #${a.petId}</td>
                    <td>${a.serviceId === 1 ? 'Consulta General' : (a.serviceId === 2 ? 'Vacunación' : 'Servicio #' + a.serviceId)}</td>
                    <td><div style="font-weight: 600;">${a.date}</div><div style="font-size: 0.75rem; color: var(--text-secondary);">${a.time}</div></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn" style="padding: 8px; background: #f1f5f9; color: var(--text-secondary);" onclick="deleteApp(${a.id})">
                            <i class="fa-solid fa-calendar-xmark"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function populateAppDropdowns() {
    try {
        const petsRes = await fetch('/api/pets');
        const pets = await petsRes.json();
        const pSelect = document.getElementById('app-petId');
        if (pSelect) {
            pSelect.innerHTML = pets.map(p => `<option value="${p.id}">${p.name} (${p.owner})</option>`).join('');
        }

        const sSelect = document.getElementById('app-serviceId');
        if (sSelect) {
            sSelect.innerHTML = (window.servicesData || []).map(s => `<option value="${s.id}">${s.name} - S/ ${s.price}</option>`).join('');
        }
    } catch(e) {}
}

async function handleAppSubmit(e) {
    e.preventDefault();
    const app = {
        petId: document.getElementById('app-petId').value,
        serviceId: document.getElementById('app-serviceId').value,
        date: document.getElementById('app-date').value,
        time: document.getElementById('app-time').value,
        status: document.getElementById('app-status').value
    };

    try {
        await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(app)
        });
        
        closeModal('app-modal');
        e.target.reset();
        loadAppointments();
        loadStats();
    } catch(e) {}
}

async function deleteApp(id) {
    if(confirm('¿Desea cancelar esta cita?')) {
        await fetch('/api/appointments/' + id, { method: 'DELETE' });
        loadAppointments();
        loadStats();
    }
}

