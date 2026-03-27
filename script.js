// Configurações da API
const API_BASE_URL = 'http://localhost:3000/api'; 
const API_TEAMS_ENDPOINT = `${API_BASE_URL}/teams`;

// --- ESTRUTURA PARA A API ---
// Payload esperado na requisição:
// {
//   reporterType: "comunidade" | "organizacao",
//   orgEmail: "contato@galofa.com" | null,
//   name: "Galo FA",
//   city: "Belo Horizonte",
//   state: "MG",
//   logoUrl: "https://...",
//   trainingLocation: "Sesi Esportes",
//   tryoutLink: "https://forms.gle/...",
//   isOpenTryout: true | false,
//   social: { instagram: "galofamericano", youtube: "galofatv" }
// }

// Mock de Dados Iniciais
let teamsData = [
    {
        id: "1", name: "João Pessoa Espectros", city: "João Pessoa", state: "PB",
        logoUrl: "https://upload.wikimedia.org/wikipedia/pt/d/db/Jo%C3%A3o_Pessoa_Espectros.png",
        trainingLocation: "Vila Olímpica Parahyba", tryoutLink: "https://forms.gle/espectros",
        isOpenTryout: true,
        social: { instagram: "jpespectros", youtube: "" }
    },
    {
        id: "2", name: "Galo FA", city: "Belo Horizonte", state: "MG",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Galo_Futebol_Americano.png",
        trainingLocation: "CTE UFMG", tryoutLink: "https://galofamericano.com.br",
        isOpenTryout: false,
        social: { instagram: "galofamericano", youtube: "galofatv" }
    },
    {
        id: "3", name: "Timbó Rex", city: "Timbó", state: "SC",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/07/T-Rex_Sports_Academy.png",
        trainingLocation: "Complexo Esportivo Timbó", tryoutLink: "https://forms.gle/trex",
        isOpenTryout: true,
        social: { instagram: "timbo_rex", youtube: "trexoficial" }
    }
];

// Contextos
const teamsGrid = document.getElementById('teams-grid');
const searchInput = document.getElementById('search-input');
const teamForm = document.getElementById('team-form');

// -------------------------------------------------------------
// LÓGICA DA PÁGINA: INDEX (VISUALIZAÇÃO DE TIMES)
// -------------------------------------------------------------
if (teamsGrid) {
    function fetchTeams() {
        renderTeams(teamsData);
    }

    function renderTeams(teams) {
        teamsGrid.innerHTML = '';
        if(teams.length === 0) {
            teamsGrid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; margin-top: 2rem; font-size: 1.1rem;">Nenhuma vaga ou time encontrado. Tente pesquisar de outra forma.</p>`;
            return;
        }

        teams.forEach((team, index) => {
            const card = document.createElement('div');
            card.className = team.isOpenTryout ? 'team-card card-highlight' : 'team-card';
            card.style.animationDelay = `${index * 0.05}s`;

            let socialHTML = '';
            if (team.social) {
                if (team.social.instagram) {
                    const igUser = team.social.instagram.replace('@', '');
                    socialHTML += `<a href="https://instagram.com/${igUser}" target="_blank" title="Instagram" class="social-instagram"><i class="fa-brands fa-instagram"></i></a>`;
                }
                if (team.social.youtube) {
                    const ytUser = team.social.youtube.replace('@', '');
                    socialHTML += `<a href="https://youtube.com/@${ytUser}" target="_blank" title="YouTube" class="social-youtube"><i class="fa-brands fa-youtube"></i></a>`;
                }
            }

            const imgUrl = team.logoUrl || 'https://via.placeholder.com/150/1e293b/10b981?text=FABR';
            
            // Badge / Pílula de recrutamento
            const badgeHTML = team.isOpenTryout 
                ? `<div class="badge badge-open"><i class="fa-solid fa-fire"></i> PENEIRA ABERTA</div>`
                : `<div class="badge badge-closed"><i class="fa-solid fa-users"></i> Formando Elenco</div>`;

            const btnText = team.isOpenTryout ? 'Quero Participar da Seletiva' : 'Acessar Link do Time';

            card.innerHTML = `
                ${badgeHTML}
                <img src="${imgUrl}" alt="Escudo ${team.name}" class="team-logo" onerror="this.src='https://via.placeholder.com/150/1e293b/10b981?text=FABR'">
                <div class="team-info">
                    <h3>${team.name}</h3>
                    <p class="location"><i class="fa-solid fa-location-dot"></i> ${team.city}, ${team.state}</p>
                    <p class="training-loc"><i class="fa-solid fa-map-pin"></i> ${team.trainingLocation || 'Local a definir'}</p>
                </div>
                <div class="card-actions">
                    <a href="${team.tryoutLink || '#'}" target="_blank" class="${team.isOpenTryout ? 'btn-tryout glow-btn' : 'btn-tryout'}"><i class="fa-solid fa-helmet-un"></i> ${btnText}</a>
                </div>
                <div class="social-links">
                    ${socialHTML || '<span style="font-size: 0.8rem; color: #64748b;">Nenhuma rede oficial</span>'}
                </div>
            `;
            teamsGrid.appendChild(card);
        });
    }

    searchInput?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filteredTeams = teamsData.filter(t => 
            t.name.toLowerCase().includes(term) || 
            t.city.toLowerCase().includes(term) ||
            t.state.toLowerCase().includes(term)
        );
        renderTeams(filteredTeams);
    });

    document.addEventListener('DOMContentLoaded', fetchTeams);
}

// -------------------------------------------------------------
// LÓGICA DA PÁGINA: ANÚNCIO / CADASTRO DA COMUNIDADE
// -------------------------------------------------------------
if (teamForm) {
    const reporterType = document.getElementById('reporter-type');
    const orgEmailGroup = document.getElementById('org-email-group');
    const emailInput = document.getElementById('contact-email');

    // Mostra input de email apenas se for a organização listando a vaga
    reporterType.addEventListener('change', (e) => {
        if (e.target.value === 'organizacao') {
            orgEmailGroup.classList.remove('hidden');
            emailInput.required = true;
        } else {
            orgEmailGroup.classList.add('hidden');
            emailInput.required = false;
            emailInput.value = '';
        }
    });

    teamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Publicando Anúncio...';
        submitBtn.disabled = true;

        const payload = {
            reporterType: reporterType.value,
            orgEmail: emailInput.value.trim() || null,
            name: document.getElementById('team-name').value.trim(),
            city: document.getElementById('team-city').value.trim(),
            state: document.getElementById('team-state').value.trim().toUpperCase(),
            logoUrl: document.getElementById('team-logo').value.trim(),
            trainingLocation: document.getElementById('team-training').value.trim(),
            tryoutLink: document.getElementById('team-tryout').value.trim(),
            isOpenTryout: document.getElementById('is-open-tryout').checked,
            social: {
                instagram: document.getElementById('social-instagram').value.trim() || undefined,
                youtube: document.getElementById('social-youtube').value.trim() || undefined
            }
        };

        try {
            await new Promise(res => setTimeout(res, 1200));
            
            teamForm.classList.add('hidden');
            document.querySelector('.form-warning').classList.add('hidden');
            
            const successDiv = document.getElementById('success-message');
            successDiv.classList.remove('hidden');

            console.log("SUCESSO: Vaga enviada para aprovação:", payload);
        } catch (err) {
            alert("Erro ao anunciar a vaga. Tente novamente.");
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        } 
    });
}
