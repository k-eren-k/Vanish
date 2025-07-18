document.addEventListener("DOMContentLoaded", () => {
  const packagesPerPage = 6;
  const packagesGrid = document.getElementById("packages-grid");
  const paginationControls = document.getElementById("npm-pagination-controls");
  const prevButton = document.getElementById("npm-prev-page");
  const nextButton = document.getElementById("npm-next-page");
  const pageInfo = document.getElementById("npm-page-info");

  if (!packagesGrid) return;

  let allPackages = [];
  let currentPage = 1;
  let totalPages = 1;

  const displayPackages = () => {
    packagesGrid.innerHTML = "";
    const startIndex = (currentPage - 1) * packagesPerPage;
    const endIndex = startIndex + packagesPerPage;
    const packagesToShow = allPackages.slice(startIndex, endIndex);

    packagesToShow.forEach((pkg) => {
      const displayName =
        pkg.name.length > 8 ? pkg.name.substring(0, 8) + "…" : pkg.name;
      const rawDescription = pkg.description || "No description provided.";
      const displayDesc =
        rawDescription.length > 100
          ? rawDescription.substring(0, 100) + "…"
          : rawDescription;
      const displayDownloads = (pkg.downloads || 0).toLocaleString("en-US");

      const packageCardHTML = `
                <a href="${pkg.links.npm}" target="_blank" rel="noopener noreferrer" class="package-card">
                    <div class="package-card-header">
                        <i class="fab fa-npm"></i>
                        <h3 class="package-card-title" title="${pkg.name}">${displayName}</h3>
                    </div>
                    <p class="package-card-description">${displayDesc}</p>
                    <div class="package-card-footer">
                        <span class="package-card-info">
                            <i class="fas fa-tag"></i>
                            v${pkg.version}
                        </span>
                        <span class="package-card-info">
                            <i class="fas fa-download"></i>
                            ${displayDownloads}
                        </span>
                    </div>
                </a>
            `;
      packagesGrid.innerHTML += packageCardHTML;
    });

    updatePaginationControls();
  };

  const updatePaginationControls = () => {
    totalPages = Math.ceil(allPackages.length / packagesPerPage);

    paginationControls.style.display = "flex";
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    if (totalPages <= 1) {
      prevButton.disabled = true;
      nextButton.disabled = true;
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/npm-packages");
      if (!response.ok)
        throw new Error(`Server responded with status: ${response.status}`);

      allPackages = await response.json();
      allPackages.sort((a, b) => new Date(b.date) - new Date(a.date));
      displayPackages();
    } catch (error) {
      console.error("Failed to fetch NPM packages:", error);
      packagesGrid.innerHTML =
        '<p style="color: #a0a0a0; grid-column: 1 / -1;">Could not load packages at this time.</p>';
    }
  };

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayPackages();
    }
  });

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayPackages();
    }
  });

  fetchPackages();
});
