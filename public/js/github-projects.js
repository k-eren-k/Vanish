document.addEventListener("DOMContentLoaded", () => {
  const reposPerPage = 6;

  const projectsGrid = document.getElementById("projects-grid");
  const paginationControls = document.getElementById(
    "github-pagination-controls"
  );
  const prevButton = document.getElementById("github-prev-page");
  const nextButton = document.getElementById("github-next-page");
  const pageInfo = document.getElementById("github-page-info");

  if (!projectsGrid) {
    console.error('Error: The element with ID "projects-grid" was not found.');
    return;
  }

  let allRepos = [];
  let currentPage = 1;
  let totalPages = 1;

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: "#f1e05a",
      TypeScript: "#3178c6",
      HTML: "#e34c26",
      CSS: "#563d7c",
      Python: "#3572A5",
      Java: "#b07219",
      "C#": "#178600",
      PHP: "#4F5D95",
      "C++": "#f34b7d",
      Go: "#00ADD8",
      Ruby: "#701516",
      Vue: "#4FC08D",
      SCSS: "#c6538c",
      Shell: "#89e051",
    };
    return colors[language] || "#a0a0a0";
  };

  const displayRepos = () => {
    projectsGrid.innerHTML = "";
    const startIndex = (currentPage - 1) * reposPerPage;
    const endIndex = startIndex + reposPerPage;
    const reposToShow = allRepos.slice(startIndex, endIndex);

    if (reposToShow.length === 0 && currentPage === 1) {
      projectsGrid.innerHTML =
        '<p style="color: #a0a0a0; grid-column: 1 / -1; text-align: center;">No public repositories found for this user.</p>';
      return;
    }

    reposToShow.forEach((repo) => {
      const repoName = repo.name.replace(/-/g, " ");
      const description = repo.description || "No description provided.";

      const projectCardHTML = `
                <a href="${
                  repo.html_url
                }" target="_blank" rel="noopener noreferrer" class="project-card">
                    <div class="project-card-header">
                        <h3 class="project-card-title">${repoName}</h3>
                    </div>
                    <p class="project-card-description">${description}</p>
                    <div class="project-card-footer">
                        <div class="project-card-language">
                            ${
                              repo.language
                                ? `<span class="language-color-dot" style="background-color: ${getLanguageColor(
                                    repo.language
                                  )};"></span> <span>${repo.language}</span>`
                                : ""
                            }
                        </div>
                        <div class="project-card-stats">
                            <span><i class="fas fa-star"></i> ${
                              repo.stargazers_count
                            }</span>
                            <span><i class="fas fa-code-branch"></i> ${
                              repo.forks_count
                            }</span>
                        </div>
                    </div>
                </a>
            `;
      projectsGrid.innerHTML += projectCardHTML;
    });

    updatePaginationControls();
  };

  const updatePaginationControls = () => {
    totalPages = Math.ceil(allRepos.length / reposPerPage);

    if (totalPages <= 1) {
      paginationControls.style.display = "none";
      return;
    }

    paginationControls.style.display = "flex";
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
  };

  const fetchRepositories = async () => {
    try {
      const response = await fetch("/api/github-repos");

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      allRepos = await response.json();
      displayRepos();
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
      projectsGrid.innerHTML =
        '<p style="color: #a0a0a0; grid-column: 1 / -1; text-align: center;">Could not load projects at this time. Please try again later.</p>';
    }
  };

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayRepos();
    }
  });

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayRepos();
    }
  });

  fetchRepositories();
});
