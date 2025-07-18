document.addEventListener("DOMContentLoaded", () => {
  const projectsPerPage = 3;
  let currentPage = 1;

  const projectItems = document.querySelectorAll(".project-item");
  const totalProjects = projectItems.length;
  const totalPages = Math.ceil(totalProjects / projectsPerPage);

  const prevButton = document.getElementById("prev-page");
  const nextButton = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");
  const paginationControls = document.getElementById("projects-pagination");

  function showPage(page) {
    const startIndex = (page - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;

    projectItems.forEach((item, index) => {
      if (index >= startIndex && index < endIndex) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  }

  function updatePaginationControls() {
    if (totalPages <= 1) {
      paginationControls.style.display = "none";
      return;
    }

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
  }

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      showPage(currentPage);
      updatePaginationControls();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      showPage(currentPage);
      updatePaginationControls();
    }
  });

  showPage(1);
  updatePaginationControls();
});
