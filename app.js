/* ==========================================================================
   PORTAL DICHTER & NEIRA - INTEGRA EMAILJS CON CLAVE PÚBLICA CORREGIDA (APP.JS)
   ========================================================================== */

const STORAGE_KEY = 'dn_portal_requests_v11';
const REPORTING_SESSION_KEY = 'dn_portal_reporting_auth';

// CREDANCIALES EMAILJS CONFIGURADAS
const EMAILJS_SERVICE_ID = 'service_b1jhrai';
const EMAILJS_TEMPLATE_ID = 'template_cpy03f3';
const EMAILJS_PUBLIC_KEY = 'OfXawgXmm_YWqDj4B';

let state = {
    requests: [],
    isReportingAuthenticated: false,
    activeTab: 'encoladas',
    activeModalId: null,
    charts: {}
};

// ==========================================================================
// 1. INICIALIZACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar SDK de EmailJS con la clave pública correcta
    try {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_PUBLIC_KEY);
            console.log("EmailJS inicializado correctamente con clave:", EMAILJS_PUBLIC_KEY);
        }
    } catch (e) {
        console.error("Error al inicializar EmailJS:", e);
    }

    loadFromStorage();

    if (state.requests.length === 0) {
        seedInitialMockData();
    }

    const savedAuth = sessionStorage.getItem(REPORTING_SESSION_KEY);
    if (savedAuth === 'true') {
        state.isReportingAuthenticated = true;
    }

    updateHeaderSessionUI();
    renderAll();
    lucide.createIcons();
});

// ==========================================================================
// 2. NAVEGACIÓN Y SESIÓN
// ==========================================================================
function updateHeaderSessionUI() {
    const badgeLabel = document.getElementById('session-label');
    const loginBtn = document.getElementById('btn-reporting-login');
    const logoutBtn = document.getElementById('btn-logout');
    const navAdminBtn = document.getElementById('nav-btn-admin');
    const navAnalyticsBtn = document.getElementById('nav-btn-analytics');

    if (state.isReportingAuthenticated) {
        if (badgeLabel) badgeLabel.textContent = 'Equipo de Reporting (Admin)';
        if (loginBtn) loginBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');

        if (navAdminBtn) navAdminBtn.classList.remove('hidden');
        if (navAnalyticsBtn) navAnalyticsBtn.classList.remove('hidden');
    } else {
        if (badgeLabel) badgeLabel.textContent = 'Modo Operaciones (Público)';
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');

        if (navAdminBtn) navAdminBtn.classList.add('hidden');
        if (navAnalyticsBtn) navAnalyticsBtn.classList.add('hidden');
    }
    lucide.createIcons();
}

function openReportingAuthModal() {
    document.getElementById('reporting-auth-modal').classList.add('active');
}

function closeReportingAuthModal() {
    document.getElementById('reporting-auth-modal').classList.remove('active');
}

function handleReportingAuth(e) {
    e.preventDefault();
    const u = document.getElementById('auth-username').value.trim().toLowerCase();
    const p = document.getElementById('auth-password').value.trim();

    if ((u === 'reporting' || u.includes('reporting')) && p === 'rep123') {
        state.isReportingAuthenticated = true;
        sessionStorage.setItem(REPORTING_SESSION_KEY, 'true');
        closeReportingAuthModal();
        updateHeaderSessionUI();
        switchTab('admin');
        showToast('¡Desbloqueadas pestañas de Reporting y Analytics!', 'success');
    } else {
        showToast('Credenciales de Reporting incorrectas', 'warning');
    }
}

function logoutReporting() {
    state.isReportingAuthenticated = false;
    sessionStorage.removeItem(REPORTING_SESSION_KEY);
    updateHeaderSessionUI();
    switchTab('encoladas');
    showToast('Sesión de Reporting cerrada.', 'info');
}

function switchTab(tabId) {
    if ((tabId === 'admin' || tabId === 'analytics') && !state.isReportingAuthenticated) {
        openReportingAuthModal();
        return;
    }

    state.activeTab = tabId;

    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const activeBtn = document.getElementById(`nav-btn-${tabId}`);
    const activeTabContent = document.getElementById(`tab-${tabId}`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activeTabContent) activeTabContent.classList.add('active');

    renderAll();

    if (tabId === 'analytics') {
        setTimeout(renderAnalyticsCharts, 100);
    }

    lucide.createIcons();
}

function toggleEncFields(type) {
    const pdvsBlock = document.getElementById('fields-specific-pdv');
    const generalBlock = document.getElementById('fields-general-study');
    const textarea = document.getElementById('enc-pdvs');

    if (type === 'SPECIFIC_PDVS') {
        pdvsBlock.classList.remove('hidden');
        generalBlock.classList.add('hidden');
        if (textarea) textarea.setAttribute('required', 'required');
    } else {
        pdvsBlock.classList.add('hidden');
        generalBlock.classList.remove('hidden');
        if (textarea) textarea.removeAttribute('required');
    }
}

function toggleBiFields(type) {
    const existingBlock = document.getElementById('fields-existing-bi');
    const newBlock = document.getElementById('fields-new-bi');

    if (type === 'EXISTING') {
        existingBlock.classList.remove('hidden');
        newBlock.classList.add('hidden');
        document.getElementById('rep-usuario').setAttribute('required', 'required');
        document.getElementById('rep-bi-name').setAttribute('required', 'required');
        document.getElementById('rep-area').removeAttribute('required');
    } else {
        existingBlock.classList.add('hidden');
        newBlock.classList.remove('hidden');
        document.getElementById('rep-usuario').removeAttribute('required');
        document.getElementById('rep-bi-name').removeAttribute('required');
        document.getElementById('rep-area').setAttribute('required', 'required');
    }
}

// ==========================================================================
// 3. PERSISTENCIA DE DATOS Y SEED DEMO
// ==========================================================================
function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) state.requests = JSON.parse(raw);
    } catch (e) {
        console.error("Error al cargar localStorage", e);
        state.requests = [];
    }
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.requests));
    } catch (e) {
        console.error("Error al guardar en localStorage", e);
    }
}

function seedInitialMockData() {
    const now = new Date();
    state.requests = [
        {
            id: 'REQ-1001',
            category: 'ENCOLADA',
            isGeneralReview: false,
            pdvCodes: ['PDV-88412', 'PDV-77109'],
            pdvCode: 'PDV-88412, PDV-77109',
            email: 'carlos.mendoza@dichter-neira.com',
            estudio: 'KO moderno',
            pais: 'Colombia',
            ola: 'Julio 2026',
            solicitante: 'Carlos Mendoza',
            analyst: 'Mayumi Sanchez',
            detalle: 'Cierre de lote bloqueado en 2 terminales por error 502.',
            status: 'RESOLVED',
            ticketNumber: 'TCK-DN-2026-9011',
            resolutionNote: 'Procesado y liberado desde la consola central.',
            createdAt: new Date(now.getTime() - 28 * 3600000).toISOString(),
            resolvedAt: new Date(now.getTime() - 14 * 3600000).toISOString()
        },
        {
            id: 'REQ-1002',
            category: 'ENCOLADA',
            isGeneralReview: true,
            pdvCodes: [],
            pdvCode: 'Revisión General Estudio',
            email: 'laura.restrepo@dichter-neira.com',
            estudio: 'Heineken',
            pais: 'México',
            ola: 'Julio 2026',
            solicitante: 'Laura Restrepo',
            analyst: 'Juliana Chimbi',
            detalle: 'Favor revisar si existen encoladas pendientes para Heineken México.',
            status: 'RESOLVED',
            ticketNumber: 'TCK-DN-2026-9042',
            resolutionNote: 'Revisado. Se encontraron 3 transacciones y fueron procesadas.',
            createdAt: new Date(now.getTime() - 40 * 3600000).toISOString(),
            resolvedAt: new Date(now.getTime() - 22 * 3600000).toISOString()
        },
        {
            id: 'REQ-1003',
            category: 'BI_NEW',
            estudio: 'P&G',
            pais: 'Panamá',
            email: 'mariana.lopez@dichter-neira.com',
            frecuencia: 'Semanal',
            area: 'Trade Marketing LatAm',
            solicitante: 'Mariana López',
            analyst: 'Mayumi Sanchez',
            detalle: 'Desarrollar tablero interactivo semanal de seguimiento de precios.',
            status: 'PENDING',
            ticketNumber: null,
            resolutionNote: null,
            createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
            resolvedAt: null
        }
    ];
    saveToStorage();
}

function addMockData() {
    const categories = ['ENCOLADA', 'BI_EXISTING', 'BI_NEW'];
    const selectedCat = categories[Math.floor(Math.random() * categories.length)];
    const paises = ['Bolivia', 'Chile', 'Colombia', 'Costa Rica', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'República Dominicana', 'Uruguay'];
    const estudios = ['KO moderno', 'KO tradicional', 'Lindley', 'Heineken', 'Storelive', 'P&G', 'CBC', 'ABI', 'AJE', 'Customer', 'Otros'];
    const olas = ['Enero 2026', 'Febrero 2026', 'Marzo 2026', 'Abril 2026', 'Mayo 2026', 'Junio 2026', 'Julio 2026', 'Agosto 2026'];
    const analysts = ['Mayumi Sanchez', 'Juliana Chimbi', null];
    const selectedAnalyst = analysts[Math.floor(Math.random() * analysts.length)];

    const createdAtDate = new Date(Date.now() - Math.floor(Math.random() * 48 + 5) * 3600000);

    const newReq = {
        id: 'REQ-' + (1000 + state.requests.length + 1),
        category: selectedCat,
        email: 'usuario.demo@dichter-neira.com',
        estudio: estudios[Math.floor(Math.random() * estudios.length)],
        pais: paises[Math.floor(Math.random() * paises.length)],
        analyst: selectedAnalyst,
        status: selectedAnalyst ? 'RESOLVED' : 'PENDING',
        ticketNumber: selectedAnalyst ? 'TCK-DN-2026-' + Math.floor(1000 + Math.random() * 9000) : null,
        resolutionNote: selectedAnalyst ? 'Atendido por la analista ' + selectedAnalyst : null,
        createdAt: createdAtDate.toISOString(),
        resolvedAt: selectedAnalyst ? new Date().toISOString() : null
    };

    if (selectedCat === 'ENCOLADA') {
        const isGen = Math.random() > 0.5;
        newReq.isGeneralReview = isGen;
        if (isGen) {
            newReq.pdvCodes = [];
            newReq.pdvCode = 'Revisión General';
        } else {
            const count = Math.floor(Math.random() * 3) + 1;
            newReq.pdvCodes = Array.from({length: count}, () => 'PDV-' + Math.floor(10000 + Math.random() * 90000));
            newReq.pdvCode = newReq.pdvCodes.join(', ');
        }
        newReq.ola = olas[Math.floor(Math.random() * olas.length)];
        newReq.solicitante = 'Operaciones D&N';
        newReq.detalle = 'Terminal encolada durante proceso de envío de datos.';
    } else if (selectedCat === 'BI_EXISTING') {
        newReq.usuario = 'analista@dichter-neira.com';
        newReq.biNameToEdit = 'Power BI Retail LatAm';
        newReq.detalle = 'Ajuste en medida DAX de precio promedio ponderado.';
    } else {
        newReq.frecuencia = 'Quincenal';
        newReq.area = 'Trade Marketing LatAm';
        newReq.solicitante = 'Gerente de Cuenta';
        newReq.detalle = 'Nuevo reporte de visualización para cliente masivo.';
    }

    state.requests.unshift(newReq);
    saveToStorage();
    renderAll();
    showToast('Solicitud simulada agregada', 'success');
}

// ==========================================================================
// 4. ENVÍO DE FORMULARIOS
// ==========================================================================
function handleEncoladaSubmit(e) {
    e.preventDefault();

    const encType = document.querySelector('input[name="encType"]:checked').value;
    const email = document.getElementById('enc-email').value.trim();
    const estudio = document.getElementById('enc-estudio').value;
    const pais = document.getElementById('enc-pais').value;
    const ola = document.getElementById('enc-ola').value;
    const solicitante = document.getElementById('enc-solicitante').value.trim() || 'Operaciones D&N';
    const observaciones = document.getElementById('enc-observaciones').value.trim() || 'Sin observaciones.';

    let pdvCodes = [];
    let isGeneralReview = false;

    if (encType === 'SPECIFIC_PDVS') {
        const pdvsText = document.getElementById('enc-pdvs').value.trim();
        pdvCodes = pdvsText
            .split(/[\s,\n]+/)
            .map(s => s.trim().toUpperCase())
            .filter(s => s.length > 0)
            .map(s => s.startsWith('PDV-') ? s : 'PDV-' + s);
    } else {
        isGeneralReview = true;
    }

    const newReq = {
        id: 'REQ-' + (1000 + state.requests.length + 1),
        category: 'ENCOLADA',
        isGeneralReview: isGeneralReview,
        pdvCodes: pdvCodes,
        pdvCode: isGeneralReview ? 'Revisión General Estudio' : pdvCodes.join(', '),
        email: email,
        estudio: estudio,
        pais: pais,
        ola: ola,
        solicitante: solicitante,
        analyst: null,
        detalle: observaciones,
        status: 'PENDING',
        ticketNumber: null,
        resolutionNote: null,
        createdAt: new Date().toISOString(),
        resolvedAt: null
    };

    state.requests.unshift(newReq);
    saveToStorage();

    document.getElementById('form-encoladas').reset();
    renderAll();

    sendSubmissionConfirmationEmail(newReq);
}

function handleReportingSubmit(e) {
    e.preventDefault();

    const biType = document.querySelector('input[name="biType"]:checked').value;
    const email = document.getElementById('rep-email').value.trim();
    const estudio = document.getElementById('rep-estudio').value;
    const pais = document.getElementById('rep-pais').value;
    const detalle = document.getElementById('rep-solicitud-detalle').value.trim();

    const newReq = {
        id: 'REQ-' + (1000 + state.requests.length + 1),
        category: biType === 'EXISTING' ? 'BI_EXISTING' : 'BI_NEW',
        email: email,
        estudio: estudio,
        pais: pais,
        analyst: null,
        detalle: detalle,
        status: 'PENDING',
        ticketNumber: null,
        resolutionNote: null,
        createdAt: new Date().toISOString(),
        resolvedAt: null
    };

    if (biType === 'EXISTING') {
        newReq.usuario = document.getElementById('rep-usuario').value.trim();
        newReq.biNameToEdit = document.getElementById('rep-bi-name').value.trim();
        newReq.solicitante = newReq.usuario;
    } else {
        newReq.frecuencia = document.getElementById('rep-frecuencia').value;
        newReq.area = document.getElementById('rep-area').value.trim();
        newReq.solicitante = `Área: ${newReq.area}`;
    }

    state.requests.unshift(newReq);
    saveToStorage();

    document.getElementById('form-reporting').reset();
    renderAll();

    sendSubmissionConfirmationEmail(newReq);
}

// ==========================================================================
// 5. ENVÍO REAL DE CORREOS A TRAVÉS DE EMAILJS + VISTA PREVIA
// ==========================================================================
function sendSubmissionConfirmationEmail(req) {
    const toEmail = req.email || 'usuario@dichter-neira.com';
    const isEncolada = req.category === 'ENCOLADA';

    const subject = isEncolada 
        ? `[Confirmación] Solicitud de Encolada ${req.id} Recibida - Dichter & Neira`
        : `[Confirmación] Solicitud de Reporting ${req.id} Recibida - Dichter & Neira`;

    const commitmentMsg = isEncolada
        ? '⏳ <strong>Tu solicitud se revisará en un máximo de 2 días hábiles.</strong>'
        : '⏳ <strong>El equipo de Reporting se contactará contigo en un plazo máximo de 3 días hábiles para evaluar la solicitud y dar fechas de entrega estimadas.</strong>';

    const htmlBody = `
        <p>Hola <strong>${escapeHtml(req.solicitante || 'Equipo Operaciones')}</strong>,</p>
        <p>Hemos recibido correctamente tu solicitud en el Portal de Dichter & Neira.</p>
        
        <div style="background:rgba(13,92,171,0.08); border-left:4px solid #0D5CAB; padding:14px; margin:14px 0; border-radius:6px; font-size:0.9rem;">
            ${commitmentMsg}
        </div>

        <div class="email-card-box">
            <div><strong>Folio ID:</strong> ${escapeHtml(req.id)}</div>
            <div><strong>Categoría:</strong> ${escapeHtml(req.category)}</div>
            <div><strong>Estudio:</strong> ${escapeHtml(req.estudio)} | <strong>País:</strong> ${escapeHtml(req.pais)}</div>
            ${req.pdvCode ? `<div><strong>Detalle / PDV:</strong> ${escapeHtml(req.pdvCode)}</div>` : ''}
            <div><strong>Detalle del Requerimiento:</strong> "${escapeHtml(req.detalle)}"</div>
        </div>

        <p style="font-size:0.8rem; color:#64748B;">Te enviaremos una notificación cuando Mayumi Sanchez o Juliana Chimbi procesen la solicitud.</p>
    `;

    openEmailPreviewModal(toEmail, subject, htmlBody);

    if (typeof emailjs !== 'undefined') {
        const templateParams = {
            to_email: toEmail,
            subject: subject,
            message: htmlBody,
            name: 'Reporting Dichter & Neira'
        };

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function(response) {
                console.log('EMAILJS SUCCESS!', response.status, response.text);
                showToast(`📧 ¡Correo REAL enviado exitosamente a: ${toEmail}!`, 'success');
            }, function(error) {
                console.error('EMAILJS FAILED...', error);
                showToast(`📧 Vista previa en pantalla (Respuesta EmailJS: ${error.text || 'verificar cuenta'})`, 'info');
            });
    } else {
        showToast(`📧 Vista previa de correo en pantalla generada`, 'success');
    }
}

function sendResolutionTicketEmail(req) {
    const toEmail = req.email || 'usuario@dichter-neira.com';
    const subject = `[Ticket Asignado] Solución Solicitud ${req.id} - D&N`;

    const htmlBody = `
        <p>Hola <strong>${escapeHtml(req.solicitante || 'Solicitante')}</strong>,</p>
        <p>Tu solicitud ha sido atendida por la analista <strong>${escapeHtml(req.analyst)}</strong> de Reporting:</p>
        <div class="email-ticket-highlight">
            <span style="font-size:0.75rem; color:#64748B;">Número de Ticket Generado</span>
            <div class="ticket-code-big">${escapeHtml(req.ticketNumber)}</div>
        </div>
        <div class="email-card-box">
            <div><strong>Analista Asignada:</strong> ${escapeHtml(req.analyst)}</div>
            <div><strong>Respuesta / Nota:</strong> "${escapeHtml(req.resolutionNote || 'Solicitud completada exitosamente.')}"</div>
        </div>
    `;

    openEmailPreviewModal(toEmail, subject, htmlBody);

    if (typeof emailjs !== 'undefined') {
        const templateParams = {
            to_email: toEmail,
            subject: subject,
            message: htmlBody,
            name: 'Reporting Dichter & Neira'
        };

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function(response) {
                console.log('EMAILJS SUCCESS!', response.status, response.text);
                showToast(`📧 ¡Correo REAL con Ticket enviado a: ${toEmail}!`, 'success');
            }, function(error) {
                console.error('EMAILJS FAILED...', error);
                showToast(`📧 Ticket guardado (Vista previa de correo mostrada)`, 'info');
            });
    }
}

// ==========================================================================
// 6. RENDERIZADO DE TABLAS E HISTORIALES
// ==========================================================================
function renderMiniDashboard() {
    const containerTotal = document.getElementById('dash-total-count');
    const containerPais = document.getElementById('breakdown-pais');
    const containerEstudio = document.getElementById('breakdown-estudio');
    const containerOla = document.getElementById('breakdown-ola');

    if (!containerPais || !containerEstudio || !containerOla) return;

    const encoladas = state.requests.filter(r => r.category === 'ENCOLADA');
    if (containerTotal) containerTotal.textContent = `Total: ${encoladas.length} encolada${encoladas.length !== 1 ? 's' : ''}`;

    const countByPais = {};
    const countByEstudio = {};
    const countByOla = {};

    encoladas.forEach(r => {
        if (r.pais) countByPais[r.pais] = (countByPais[r.pais] || 0) + 1;
        if (r.estudio) countByEstudio[r.estudio] = (countByEstudio[r.estudio] || 0) + 1;
        if (r.ola) countByOla[r.ola] = (countByOla[r.ola] || 0) + 1;
    });

    renderBreakdownList(containerPais, countByPais, 'Sin datos de país');
    renderBreakdownList(containerEstudio, countByEstudio, 'Sin datos de estudio');
    renderBreakdownList(containerOla, countByOla, 'Sin datos de ola');
}

function renderBreakdownList(container, groupObj, emptyMsg) {
    const keys = Object.keys(groupObj).sort((a, b) => groupObj[b] - groupObj[a]);

    if (keys.length === 0) {
        container.innerHTML = `<span style="font-size:0.75rem; color:var(--text-subtle);">${emptyMsg}</span>`;
        return;
    }

    container.innerHTML = keys.slice(0, 5).map(key => `
        <div class="breakdown-item">
            <span class="breakdown-name">${escapeHtml(key)}</span>
            <span class="breakdown-count">${groupObj[key]}</span>
        </div>
    `).join('');
}

function renderFieldHistory() {
    const container = document.getElementById('list-encoladas-history');
    if (!container) return;

    const encoladas = state.requests.filter(r => r.category === 'ENCOLADA');

    if (encoladas.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:20px;">No hay encoladas registradas.</p>`;
        return;
    }

    container.innerHTML = encoladas.map(req => {
        const isResolved = req.status === 'RESOLVED';
        let pdvsRender = '';
        if (req.isGeneralReview) {
            pdvsRender = `<span class="general-review-tag"><i data-lucide="search" style="width:12px"></i> Revisión General de Estudio</span>`;
        } else if (req.pdvCodes && req.pdvCodes.length > 0) {
            pdvsRender = `<div class="pdv-pill-list">${req.pdvCodes.map(code => `<span class="pdv-pill">${escapeHtml(code)}</span>`).join('')}</div>`;
        } else {
            pdvsRender = `<span class="tag-code">${escapeHtml(req.pdvCode || 'PDV')}</span>`;
        }

        return `
            <div class="item-card">
                <div class="item-top">
                    <div>${pdvsRender}</div>
                    <span class="chip-status ${isResolved ? 'resolved' : 'pending'}">
                        ${isResolved ? 'Ticket Asignado' : 'En Espera (Máx. 2 días hábiles)'}
                    </span>
                </div>
                <div style="font-size:0.83rem; color:var(--text-muted); margin-bottom:4px;">
                    Estudio: <strong>${escapeHtml(req.estudio)}</strong> | País: <strong>${escapeHtml(req.pais)}</strong> | Ola: <strong>${escapeHtml(req.ola)}</strong>
                </div>
                ${req.analyst ? `<div style="margin-bottom:4px;"><span class="analyst-chip"><i data-lucide="user-check" style="width:11px"></i> Analista: ${escapeHtml(req.analyst)}</span></div>` : ''}
                ${isResolved ? `
                    <div style="margin-top:8px; padding:8px; background:rgba(20,168,59,0.1); border-radius:6px; display:flex; justify-between; align-items:center;">
                        <span style="font-family:var(--font-mono); color:var(--dn-green); font-weight:800;">Ticket: ${escapeHtml(req.ticketNumber)}</span>
                        <button class="btn-secondary btn-sm" onclick="copyText('${escapeHtml(req.ticketNumber)}')">Copiar</button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

function renderReportingHistory() {
    const container = document.getElementById('list-reporting-history');
    if (!container) return;

    const reportingReqs = state.requests.filter(r => r.category === 'BI_EXISTING' || r.category === 'BI_NEW');

    if (reportingReqs.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:20px;">No hay solicitudes de Power BI registradas.</p>`;
        return;
    }

    container.innerHTML = reportingReqs.map(req => {
        const isResolved = req.status === 'RESOLVED';
        const isNew = req.category === 'BI_NEW';
        return `
            <div class="item-card">
                <div class="item-top">
                    <span class="tag-category">${isNew ? 'Power BI Nuevo' : 'Edición BI Existente'}</span>
                    <span class="chip-status ${isResolved ? 'resolved' : 'pending'}">
                        ${isResolved ? 'Completado' : 'En Evaluación (Máx. 3 días hábiles)'}
                    </span>
                </div>
                <div style="font-size:0.85rem; font-weight:600; margin-bottom:4px;">
                    ${isNew ? `Área: ${escapeHtml(req.area)} (Frecuencia: ${escapeHtml(req.frecuencia)})` : `BI: ${escapeHtml(req.biNameToEdit)}`}
                </div>
                <div style="font-size:0.8rem; color:var(--text-muted);">
                    Estudio: ${escapeHtml(req.estudio)} | País: ${escapeHtml(req.pais)}
                </div>
                ${req.analyst ? `<div style="margin-top:4px;"><span class="analyst-chip">Analista: ${escapeHtml(req.analyst)}</span></div>` : ''}
            </div>
        `;
    }).join('');
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    const query = (document.getElementById('admin-search')?.value || '').toLowerCase();
    const catFilter = document.getElementById('admin-category-filter')?.value || 'ALL';
    const analystFilter = document.getElementById('admin-analyst-filter')?.value || 'ALL';

    const filtered = state.requests.filter(req => {
        const matchesQuery = 
            (req.pdvCode && req.pdvCode.toLowerCase().includes(query)) ||
            (req.estudio && req.estudio.toLowerCase().includes(query)) ||
            (req.pais && req.pais.toLowerCase().includes(query)) ||
            (req.email && req.email.toLowerCase().includes(query)) ||
            (req.analyst && req.analyst.toLowerCase().includes(query)) ||
            (req.ticketNumber && req.ticketNumber.toLowerCase().includes(query));

        const matchesCat = catFilter === 'ALL' || req.category === catFilter;
        
        let matchesAnalyst = true;
        if (analystFilter === 'UNASSIGNED') {
            matchesAnalyst = !req.analyst;
        } else if (analystFilter !== 'ALL') {
            matchesAnalyst = req.analyst === analystFilter;
        }

        return matchesQuery && matchesCat && matchesAnalyst;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:var(--text-muted);">No se encontraron solicitudes con los criterios de búsqueda.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(req => {
        const isResolved = req.status === 'RESOLVED';
        const dateStr = new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        let categoryLabel = 'Encolada PDV';
        let detailText = req.pdvCode || '--';
        if (req.isGeneralReview) {
            detailText = 'Revisión General de Estudio';
        } else if (req.category === 'BI_EXISTING') {
            categoryLabel = 'BI Existente';
            detailText = req.biNameToEdit;
        } else if (req.category === 'BI_NEW') {
            categoryLabel = 'BI Nuevo';
            detailText = `Área: ${req.area}`;
        }

        return `
            <tr>
                <td style="font-size:0.78rem; color:var(--text-muted);">${dateStr}</td>
                <td><span class="tag-category">${categoryLabel}</span></td>
                <td><strong>${escapeHtml(detailText)}</strong></td>
                <td>${escapeHtml(req.estudio)}</td>
                <td>${escapeHtml(req.pais)}</td>
                <td><span style="font-size:0.81rem; color:var(--dn-blue-primary);">${escapeHtml(req.email || req.solicitante || 'N/A')}</span></td>
                <td>
                    ${req.analyst 
                        ? `<span class="analyst-chip">${escapeHtml(req.analyst)}</span>`
                        : `<span style="font-size:0.75rem; color:var(--dn-orange); font-style:italic;">-- Sin Asignar --</span>`}
                </td>
                <td><span class="chip-status ${isResolved ? 'resolved' : 'pending'}">${isResolved ? 'Resuelto' : 'Pendiente'}</span></td>
                <td>${isResolved ? `<span style="font-family:var(--font-mono); color:var(--dn-green); font-weight:700;">${escapeHtml(req.ticketNumber)}</span>` : '<span style="color:var(--text-subtle);">-- Sin Ticket --</span>'}</td>
                <td>
                    <button class="btn-secondary btn-sm" onclick="openModal('${req.id}')">
                        <i data-lucide="${isResolved ? 'edit-2' : 'check-square'}"></i> ${isResolved ? 'Editar' : 'Gestionar'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    lucide.createIcons();
}

function renderMetrics() {
    const totalPending = state.requests.filter(r => r.status === 'PENDING').length;
    const totalEncoladas = state.requests.filter(r => r.category === 'ENCOLADA').length;
    const totalBI = state.requests.filter(r => r.category.startsWith('BI_')).length;
    const totalResolved = state.requests.filter(r => r.status === 'RESOLVED').length;

    document.getElementById('stat-pending').textContent = totalPending;
    document.getElementById('stat-encoladas').textContent = totalEncoladas;
    document.getElementById('stat-bi').textContent = totalBI;
    document.getElementById('stat-resolved').textContent = totalResolved;

    const counter = document.getElementById('pending-counter');
    if (counter) {
        counter.textContent = totalPending;
        counter.style.display = totalPending > 0 ? 'inline-block' : 'none';
    }
}

function renderAll() {
    renderMiniDashboard();
    renderFieldHistory();
    renderReportingHistory();
    renderAdminTable();
    renderMetrics();
}

// ==========================================================================
// 7. TIEMPO PROMEDIO Y ANALYTICS
// ==========================================================================
function calcAvgResponseTimeForAnalyst(analystName) {
    const resolvedReqs = state.requests.filter(r => r.analyst === analystName && r.status === 'RESOLVED' && r.createdAt && r.resolvedAt);

    if (resolvedReqs.length === 0) return { avgHours: 0, count: 0 };

    let totalHours = 0;
    resolvedReqs.forEach(r => {
        const created = new Date(r.createdAt).getTime();
        const resolved = new Date(r.resolvedAt).getTime();
        const diffHours = (resolved - created) / (1000 * 3600);
        totalHours += diffHours;
    });

    const avg = totalHours / resolvedReqs.length;
    return { avgHours: Math.round(avg * 10) / 10, count: resolvedReqs.length };
}

function renderAnalyticsCharts() {
    const total = state.requests.length;
    const resolved = state.requests.filter(r => r.status === 'RESOLVED').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const mayumiMetrics = calcAvgResponseTimeForAnalyst('Mayumi Sanchez');
    const julianaMetrics = calcAvgResponseTimeForAnalyst('Juliana Chimbi');

    document.getElementById('kpi-mayumi-time').textContent = mayumiMetrics.count > 0 ? `~${mayumiMetrics.avgHours} hrs` : '--';
    document.getElementById('kpi-mayumi-solved').textContent = `${mayumiMetrics.count} solicitud${mayumiMetrics.count !== 1 ? 'es' : ''} resuelta${mayumiMetrics.count !== 1 ? 's' : ''}`;

    document.getElementById('kpi-juliana-time').textContent = julianaMetrics.count > 0 ? `~${julianaMetrics.avgHours} hrs` : '--';
    document.getElementById('kpi-juliana-solved').textContent = `${julianaMetrics.count} solicitud${julianaMetrics.count !== 1 ? 'es' : ''} resuelta${julianaMetrics.count !== 1 ? 's' : ''}`;

    const allResolved = state.requests.filter(r => r.status === 'RESOLVED' && r.createdAt && r.resolvedAt);
    let totalGeneralHours = 0;
    allResolved.forEach(r => {
        totalGeneralHours += (new Date(r.resolvedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 3600);
    });
    const avgGeneral = allResolved.length > 0 ? Math.round((totalGeneralHours / allResolved.length) * 10) / 10 : 0;

    document.getElementById('kpi-avg-time').textContent = avgGeneral > 0 ? `~${avgGeneral} hrs` : '--';
    document.getElementById('kpi-resolution-rate').textContent = `${resolutionRate}%`;
    document.getElementById('kpi-resolved-ratio').textContent = `${resolved} resueltas de ${total}`;

    Object.keys(state.charts).forEach(key => {
        if (state.charts[key]) state.charts[key].destroy();
    });

    const countMayumi = state.requests.filter(r => r.analyst === 'Mayumi Sanchez').length;
    const countJuliana = state.requests.filter(r => r.analyst === 'Juliana Chimbi').length;
    const countUnassigned = state.requests.filter(r => !r.analyst).length;

    const ctxAnalyst = document.getElementById('chart-analyst')?.getContext('2d');
    if (ctxAnalyst) {
        state.charts.analyst = new Chart(ctxAnalyst, {
            type: 'doughnut',
            data: {
                labels: ['Mayumi Sanchez', 'Juliana Chimbi', 'Sin Asignar'],
                datasets: [{
                    data: [countMayumi, countJuliana, countUnassigned],
                    backgroundColor: ['#0D5CAB', '#6D37A9', '#979697'],
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    const countByEstudio = {};
    state.requests.forEach(r => {
        if (r.estudio) countByEstudio[r.estudio] = (countByEstudio[r.estudio] || 0) + 1;
    });

    const ctxEstudio = document.getElementById('chart-estudio')?.getContext('2d');
    if (ctxEstudio) {
        state.charts.estudio = new Chart(ctxEstudio, {
            type: 'bar',
            data: {
                labels: Object.keys(countByEstudio),
                datasets: [{
                    label: 'Solicitudes',
                    data: Object.values(countByEstudio),
                    backgroundColor: '#33BDEE',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } }
            }
        });
    }

    const countByPais = {};
    state.requests.forEach(r => {
        if (r.pais) countByPais[r.pais] = (countByPais[r.pais] || 0) + 1;
    });

    const ctxPais = document.getElementById('chart-pais')?.getContext('2d');
    if (ctxPais) {
        state.charts.pais = new Chart(ctxPais, {
            type: 'bar',
            data: {
                labels: Object.keys(countByPais),
                datasets: [{
                    label: 'Solicitudes por País',
                    data: Object.values(countByPais),
                    backgroundColor: '#24335F',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    const countEncolada = state.requests.filter(r => r.category === 'ENCOLADA').length;
    const countBiExisting = state.requests.filter(r => r.category === 'BI_EXISTING').length;
    const countBiNew = state.requests.filter(r => r.category === 'BI_NEW').length;

    const ctxCategory = document.getElementById('chart-category')?.getContext('2d');
    if (ctxCategory) {
        state.charts.category = new Chart(ctxCategory, {
            type: 'pie',
            data: {
                labels: ['Encoladas PDV', 'Power BI Existente', 'Power BI Nuevo'],
                datasets: [{
                    data: [countEncolada, countBiExisting, countBiNew],
                    backgroundColor: ['#0D5CAB', '#6D37A9', '#F83875'],
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}

// ==========================================================================
// 8. MODAL DE GESTIÓN Y RESPUESTA DE TICKET
// ==========================================================================
function openModal(id) {
    const req = state.requests.find(r => r.id === id);
    if (!req) return;

    state.activeModalId = id;
    const summary = document.getElementById('modal-summary');

    summary.innerHTML = `
        <div><strong>Categoría:</strong> ${req.category}</div>
        <div><strong>Solicitante Correo:</strong> <span class="highlight-email">${escapeHtml(req.email || 'No registrado')}</span></div>
        <div><strong>Estudio:</strong> ${escapeHtml(req.estudio)} | <strong>País:</strong> ${escapeHtml(req.pais)}</div>
        <div><strong>Modalidad / PDVs:</strong> ${escapeHtml(req.pdvCode || 'Encolada')}</div>
        <div><strong>Detalle:</strong> "${escapeHtml(req.detalle)}"</div>
    `;

    document.getElementById('modalAnalyst').value = req.analyst || '';
    document.getElementById('modalTicket').value = req.ticketNumber || '';
    document.getElementById('modalNote').value = req.resolutionNote || '';

    document.getElementById('response-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('response-modal').classList.remove('active');
    state.activeModalId = null;
}

function autoGenerateTicket() {
    const ticket = 'TCK-DN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('modalTicket').value = ticket;
}

function saveModalResponse() {
    const analystVal = document.getElementById('modalAnalyst').value;
    const ticketVal = document.getElementById('modalTicket').value.trim();
    const noteVal = document.getElementById('modalNote').value.trim();

    if (!analystVal) {
        showToast('Debes seleccionar la analista asignada (Mayumi Sanchez o Juliana Chimbi)', 'warning');
        return;
    }

    if (!ticketVal) {
        showToast('Debes ingresar un número de ticket', 'warning');
        return;
    }

    const req = state.requests.find(r => r.id === state.activeModalId);
    if (req) {
        req.analyst = analystVal;
        req.ticketNumber = ticketVal;
        req.resolutionNote = noteVal;
        req.status = 'RESOLVED';
        req.resolvedAt = req.resolvedAt || new Date().toISOString();

        saveToStorage();
        renderAll();
        closeModal();

        sendResolutionTicketEmail(req);
    }
}

// ==========================================================================
// 9. VISTA PREVIA CORREOS
// ==========================================================================
function openEmailPreviewModal(toEmail, subject, htmlBody) {
    document.getElementById('email-preview-to').textContent = toEmail;
    document.getElementById('email-preview-subject').textContent = subject;
    document.getElementById('email-preview-body').innerHTML = htmlBody;
    document.getElementById('email-preview-modal').classList.add('active');
    lucide.createIcons();
}

function closeEmailPreviewModal() {
    document.getElementById('email-preview-modal').classList.remove('active');
}

// ==========================================================================
// 10. UTILS
// ==========================================================================
function exportToCSV() {
    if (state.requests.length === 0) {
        showToast('No hay datos para exportar', 'warning');
        return;
    }

    let csv = "data:text/csv;charset=utf-8,ID,Categoria,Estudio,Pais,CorreoSolicitante,Analista,Estado,Ticket,Respuesta\n";

    state.requests.forEach(r => {
        const row = [
            r.id,
            `"${r.category}"`,
            `"${r.estudio}"`,
            `"${r.pais}"`,
            `"${r.email || r.solicitante || ''}"`,
            `"${r.analyst || 'Sin Asignar'}"`,
            `"${r.status}"`,
            `"${r.ticketNumber || ''}"`,
            `"${(r.resolutionNote || '').replace(/"/g, '""')}"`
        ].join(",");
        csv += row + "\n";
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_DichtnerNeira_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.innerHTML = `<i data-lucide="info"></i> <span>${escapeHtml(msg)}</span>`;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 4000);
    }, 4000);
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => showToast(`Copiado: ${text}`, 'success'));
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
