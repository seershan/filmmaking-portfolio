document.addEventListener("DOMContentLoaded", () => {
    if (typeof PortfolioSite !== "undefined") {
        PortfolioSite.setupNav("../");
    }

    const grid = document.getElementById("film-grid");
    const dataEl = document.getElementById("film-data");

    if (!grid || !dataEl) {
        console.error("Film grid or film data missing");
        return;
    }

    let films = [];
    try {
        films = JSON.parse(dataEl.textContent.trim());
    } catch (error) {
        console.error("Failed to parse film data", error);
        return;
    }

    grid.innerHTML = films.map((film, index) => renderFilmCard(film, index)).join("");

    const cards = Array.from(grid.querySelectorAll(".film-card"));

    cards.forEach(card => {
        const posterBtn = card.querySelector(".film-poster");
        const expandBtn = card.querySelector(".expand-btn");

        const toggle = () => {
            const isOpen = card.classList.contains("is-open");

            cards.forEach(other => closeCard(other));

            if (!isOpen) {
                openCard(card);
                setTimeout(() => {
                    card.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 180);
            }
        };

        if (posterBtn) posterBtn.addEventListener("click", toggle);
        if (expandBtn) expandBtn.addEventListener("click", toggle);

        const watchBtn = card.querySelector(".watch-now");
        if (watchBtn) {
            watchBtn.addEventListener("click", e => {
                e.stopPropagation();
            });
        }
    });

    function openCard(card) {
        const posterBtn = card.querySelector(".film-poster");
        const details = card.querySelector(".film-details");

        card.classList.add("is-open");
        if (posterBtn) posterBtn.setAttribute("aria-expanded", "true");
        if (details) details.setAttribute("aria-hidden", "false");
    }

    function closeCard(card) {
        const posterBtn = card.querySelector(".film-poster");
        const details = card.querySelector(".film-details");

        card.classList.remove("is-open");
        if (posterBtn) posterBtn.setAttribute("aria-expanded", "false");
        if (details) details.setAttribute("aria-hidden", "true");
    }

    function renderFilmCard(film, index) {
        const chips = [
            film.year,
            film.genre,
            film.runtime,
            film.language
        ].filter(Boolean).map(value => `<span class="meta-chip">${escapeHTML(value)}</span>`).join("");

        const basics = [
            { label: "Directed By", value: film.director },
            { label: "Written By", value: film.writer },
            { label: "Cinematography", value: film.cinematography },
            { label: "Cast", value: Array.isArray(film.cast) ? film.cast.join(", ") : film.cast }
        ].filter(item => item.value);

        const basicCards = basics.map(item => `
            <div class="credit-row">
                <span class="credit-label">${escapeHTML(item.label)}</span>
                <span class="credit-value">${escapeHTML(item.value)}</span>
            </div>
        `).join("");

        const extraCredits = Array.isArray(film.extraCredits) && film.extraCredits.length
            ? `
                <div class="film-section">
                    <h5>Additional Credits</h5>
                    <div class="film-layout">
                        ${film.extraCredits.map(item => `
                            <div class="credit-row">
                                <span class="credit-label">${escapeHTML(item.label)}</span>
                                <span class="credit-value">${escapeHTML(item.value)}</span>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `
            : "";

        const festivalSelections = Array.isArray(film.festivalSelections) && film.festivalSelections.length
            ? `
                <div class="film-section">
                    <h5>Festival Selections</h5>
                    <ul class="film-list">
                        ${film.festivalSelections.map(item => `<li>${escapeHTML(item)}</li>`).join("")}
                    </ul>
                </div>
            `
            : "";

        const awardsWon = Array.isArray(film.awardsWon) && film.awardsWon.length
            ? `
                <div class="film-section">
                    <h5>Awards Won</h5>
                    <ul class="film-list">
                        ${film.awardsWon.map(item => `<li>${escapeHTML(item)}</li>`).join("")}
                    </ul>
                </div>
            `
            : "";

        return `
            <article class="film-card" data-film-index="${index}">
                <div class="film-card-top">
                    <div class="film-poster-wrap">
                        <button class="film-poster" type="button" aria-expanded="false" aria-controls="film-details-${index}">
                            <img src="${escapeHTML(film.poster)}" alt="${escapeHTML(film.title)} poster" loading="lazy">
                            <span class="film-poster-badge">Click to expand</span>
                        </button>
                    </div>

                    <div class="film-content">
                        <div class="film-head">
                            <div>
                                <h3>${escapeHTML(film.title)}</h3>
                                <p>${escapeHTML([film.genre, film.runtime, film.year].filter(Boolean).join(" · "))}</p>
                            </div>
                        </div>

                        <div class="expand-row">
                            <button class="expand-btn" type="button">Expand</button>
                        </div>
                    </div>
                </div>

                <div class="film-details" id="film-details-${index}" aria-hidden="true">
                    <div class="film-panel">
                        <h4 class="film-detail-title">${escapeHTML(film.title)}</h4>

                        <div class="film-summary">
                            <span class="film-summary-label">Summary</span>
                            <p>${escapeHTML(film.description)}</p>
                        </div>

                        <div class="film-meta-chips">
                            ${chips}
                        </div>

                        <div class="film-layout">
                            ${basicCards}
                        </div>

                        ${film.productionNotes ? `
                            <div class="film-section">
                                <h5>Production Notes</h5>
                                <p class="film-description" style="margin-bottom:0;">${escapeHTML(film.productionNotes)}</p>
                            </div>
                        ` : ""}

                        ${extraCredits}
                        ${festivalSelections}
                        ${awardsWon}

                        <div class="film-actions">
                            <a class="watch-now" href="${escapeHTML(film.watchUrl)}" target="_blank" rel="noopener noreferrer">
                                Watch Now
                            </a>
                        </div>

                        <div class="toggle-hint">Click the poster or Expand to collapse this film.</div>
                    </div>
                </div>
            </article>
        `;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }
});