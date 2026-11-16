const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');
const header = document.getElementById('main-header');
const imgResults = {
    maquiagem: ["resultados/maquiagem/maquiagem1.jpg","resultados/maquiagem/maquiagem2.jpg","resultados/maquiagem/maquiagem3.jpg"],
    micropigmentacao: ["resultados/micropigmentacao/micropigmentacao1.png","resultados/micropigmentacao/micropigmentacao2.png","resultados/micropigmentacao/micropigmentacao3.png"],
    designSobrancelha: ["resultados/designSobrancelha/designSobrancelha1","resultados/designSobrancelha/designSobrancelha2","resultados/designSobrancelha/designSobrancelha3"],
    limpezaPele: ["resultados/limpezaPele/limpezaPele1","resultados/limpezaPele/limpezaPele2","resultados/limpezaPele/limpezaPele3"]
}
const butResults = document.querySelectorAll("button");
const carResults = document.querySelector(".gallery-carousel");
const glrResults = document.querySelector(".gallery-track");
const quantidade = Math.ceil(carResults.clientWidth / 660) + 1;

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

for (let i = 0; i < quantidade * 2; i++) {
    imgResults.maquiagem.forEach(caminho => {

        const div = document.createElement("div");
        const img = document.createElement("img");

        div.classList.add("gallery-item");

        img.src = caminho;

        div.appendChild(img);
        glrResults.appendChild(div);
    })
}
butResults.forEach(botao =>{
    botao.addEventListener("click", () =>{
        const opcao = botao.dataset.opcao;
        const conjunto = imgResults[opcao];
        const imagens = glrResults.querySelectorAll("img");
        
        imagens.forEach((imagem, indice) =>{
            imagem.src = conjunto[indice % conjunto.length];
        })
    })
})

glrResults.addEventListener("click", (evento) => {

    if (evento.target.tagName === "IMG") {
        glrResults.classList.toggle("paused");

        const itemResults = glrResults.querySelectorAll(".gallery-item img");

        itemResults.forEach(item => {

            item.addEventListener("mousemove", (evento) => {

                const rect = item.getBoundingClientRect();

                const x = evento.clientX - rect.left;

                const porcentagem = x / rect.width;

                const posicao = porcentagem * 2 - 1;

                const movimentoMax = 20;

                const movimento = posicao * movimentoMax;

                item.style.transform = `translateX(${movimento}px)`;

            });

        });
    }

});

const AGENDA_STORAGE_KEY = 'lauramakeup_agendamentos_v1';
const AGENDA_SLOT_TIMES = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00'];

let agendaBookings = JSON.parse(localStorage.getItem(AGENDA_STORAGE_KEY) || '{}');
let agendaCurrentDate = new Date();
let agendaSelectedDate = formatAgendaDate(new Date());

function saveAgendaBookings() {
    localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(agendaBookings));
}

function formatAgendaDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function isSameAgendaDate(a, b) {
    return formatAgendaDate(a) === formatAgendaDate(b);
}

const agendaMonthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function renderAgendaCalendar() {
    const monthLabel = document.getElementById('monthLabel');
    const grid = document.getElementById('daysGrid');
    if (!monthLabel || !grid) return;

    const year = agendaCurrentDate.getFullYear();
    const month = agendaCurrentDate.getMonth();
    monthLabel.textContent = `${agendaMonthNames[month]} ${year}`;

    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < startOffset; i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dateStr = formatAgendaDate(dateObj);
        const cell = document.createElement('div');
        cell.className = 'day';
        cell.textContent = d;

        if (isSameAgendaDate(dateObj, today)) cell.classList.add('today');
        if (dateStr === agendaSelectedDate) cell.classList.add('selected');
        if (agendaBookings[dateStr] && Object.keys(agendaBookings[dateStr]).length > 0) {
            cell.classList.add('has-booking');
        }

        cell.addEventListener('click', () => {
            agendaSelectedDate = dateStr;
            renderAgendaCalendar();
            renderAgendaSlots();
        });

        grid.appendChild(cell);
    }
}

function renderAgendaSlots() {
    const slotsTitle = document.getElementById('slotsTitle');
    const grid = document.getElementById('slotsGrid');
    if (!slotsTitle || !grid) return;

    const [y, m, d] = agendaSelectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const label = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    slotsTitle.textContent = `Horários — ${label}`;

    grid.innerHTML = '';

    const dayBookings = agendaBookings[agendaSelectedDate] || {};

    AGENDA_SLOT_TIMES.forEach(time => {
        const slot = document.createElement('div');
        const booked = dayBookings[time];
        slot.className = 'slot' + (booked ? ' blocked' : '');
        slot.textContent = time;
        slot.addEventListener('click', () => {
            openAgendaModal(time, booked || null);
        });
        grid.appendChild(slot);
    });
}

const agendaModalOverlay = document.getElementById('modalOverlay');
const agendaModalTitle = document.getElementById('modalTitle');
const agendaModalBody = document.getElementById('modalBody');
const agendaBtnConfirm = document.getElementById('btnConfirm');
const agendaBtnCancel = document.getElementById('btnCancel');

let agendaActiveSlotTime = null;

function escapeAgendaHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function openAgendaModal(time, existingBooking) {
    agendaActiveSlotTime = time;

    if (existingBooking) {
        agendaModalTitle.textContent = `Horário ${time} — ocupado`;
        agendaModalBody.innerHTML = `
            <div class="agenda-booking-info">
                <strong>Nome:</strong> ${escapeAgendaHtml(existingBooking.nome)}<br>
                ${existingBooking.contato ? `<strong>Contato:</strong> ${escapeAgendaHtml(existingBooking.contato)}<br>` : ''}
                ${existingBooking.obs ? `<strong>Obs:</strong> ${escapeAgendaHtml(existingBooking.obs)}` : ''}
            </div>
            <button class="agenda-btn-remove" id="btnRemoveAgenda">Liberar horário</button>
        `;
        agendaBtnConfirm.style.display = 'none';
        agendaModalOverlay.classList.add('open');

        document.getElementById('btnRemoveAgenda').addEventListener('click', () => {
            delete agendaBookings[agendaSelectedDate][time];
            if (Object.keys(agendaBookings[agendaSelectedDate]).length === 0) delete agendaBookings[agendaSelectedDate];
            saveAgendaBookings();
            closeAgendaModal();
            renderAgendaCalendar();
            renderAgendaSlots();
        });
    } else {
        agendaModalTitle.textContent = `Agendar ${time}`;
        agendaModalBody.innerHTML = `
            <label>Nome</label>
            <input type="text" id="inputNomeAgenda" placeholder="Seu nome">
            <label>Contato (opcional)</label>
            <input type="text" id="inputContatoAgenda" placeholder="WhatsApp ou e-mail">
            <label>Serviço desejado (opcional)</label>
            <input type="text" id="inputObsAgenda" placeholder="Maquiagem, sobrancelha...">
            <p class="agenda-whatsapp-note"><i class="fa-brands fa-whatsapp"></i> Ao confirmar, o WhatsApp abrirá com a mensagem pronta para você enviar.</p>
        `;
        agendaBtnConfirm.style.display = 'block';
        agendaModalOverlay.classList.add('open');
    }
}

function closeAgendaModal() {
    agendaModalOverlay.classList.remove('open');
    agendaActiveSlotTime = null;
}

if (agendaBtnCancel) {
    agendaBtnCancel.addEventListener('click', closeAgendaModal);
}

if (agendaModalOverlay) {
    agendaModalOverlay.addEventListener('click', (e) => {
        if (e.target === agendaModalOverlay) closeAgendaModal();
    });
}

const AGENDA_WHATSAPP_NUMERO = '5551999954489';

function formatAgendaDateBR(dateStr) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function enviarConfirmacaoWhatsapp(dateStr, time, dados) {
    const dataBR = formatAgendaDateBR(dateStr);
    let mensagem = `Olá! Gostaria de confirmar meu agendamento no Laura Makeup & Brows:\n\n`;
    mensagem += `📅 Data: ${dataBR}\n`;
    mensagem += `⏰ Horário: ${time}\n`;
    mensagem += `👤 Nome: ${dados.nome}\n`;
    if (dados.obs) mensagem += `💅 Serviço: ${dados.obs}\n`;
    if (dados.contato) mensagem += `📞 Contato: ${dados.contato}\n`;

    const url = `https://wa.me/${AGENDA_WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

if (agendaBtnConfirm) {
    agendaBtnConfirm.addEventListener('click', () => {
        const nomeInput = document.getElementById('inputNomeAgenda');
        if (!nomeInput) return;
        const nome = nomeInput.value.trim();
        if (!nome) {
            nomeInput.style.borderColor = '#b23a3a';
            return;
        }
        const contato = document.getElementById('inputContatoAgenda').value.trim();
        const obs = document.getElementById('inputObsAgenda').value.trim();
        const dadosAgendamento = { nome, contato, obs };

        if (!agendaBookings[agendaSelectedDate]) agendaBookings[agendaSelectedDate] = {};
        agendaBookings[agendaSelectedDate][agendaActiveSlotTime] = dadosAgendamento;
        saveAgendaBookings();

        enviarConfirmacaoWhatsapp(agendaSelectedDate, agendaActiveSlotTime, dadosAgendamento);

        closeAgendaModal();
        renderAgendaCalendar();
        renderAgendaSlots();
    });
}

const agendaPrevMonthBtn = document.getElementById('prevMonth');
const agendaNextMonthBtn = document.getElementById('nextMonth');

if (agendaPrevMonthBtn) {
    agendaPrevMonthBtn.addEventListener('click', () => {
        agendaCurrentDate.setMonth(agendaCurrentDate.getMonth() - 1);
        renderAgendaCalendar();
    });
}

if (agendaNextMonthBtn) {
    agendaNextMonthBtn.addEventListener('click', () => {
        agendaCurrentDate.setMonth(agendaCurrentDate.getMonth() + 1);
        renderAgendaCalendar();
    });
}

renderAgendaCalendar();
renderAgendaSlots();

