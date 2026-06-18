document.addEventListener("DOMContentLoaded", () => {
    if (typeof PortfolioSite !== "undefined") {
        PortfolioSite.setupNav("../");
    }

    const cards = document.querySelectorAll(".video-card");

    cards.forEach(card => {
        const openVideo = () => {
            const youtubeUrl = card.dataset.youtube;
            if (youtubeUrl) {
                window.open(youtubeUrl, "_blank", "noopener,noreferrer");
            }
        };

        card.addEventListener("click", openVideo);

        card.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openVideo();
            }
        });
    });
});