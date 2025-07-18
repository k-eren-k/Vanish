document.addEventListener("DOMContentLoaded", () => {
  const populatePage = (config) => {
    document.title = config.siteTitle;
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", config.metaDescription);

    const header = config.header;
    document.querySelector(".logo span").textContent = header.logoText;
    const navContainer = document.querySelector(".main-navigation");
    navContainer.innerHTML = header.navLinks
      .map((link) => `<a href="${link.href}">${link.text}</a>`)
      .join("");
    const touchButton = document.querySelector(".header-actions .btn");
    touchButton.textContent = header.getInTouchButton.text;
    touchButton.href = `mailto:${header.getInTouchButton.mailto}`;

    const hero = config.hero;
    document.querySelector(".customer-badge span").textContent = hero.badgeText;
    document.querySelector(".hero-title").textContent = hero.title;
    document.querySelector(".hero-subtitle").textContent = hero.subtitle;
    document.querySelector(".action-buttons .btn-primary").textContent =
      hero.primaryButton.text;
    document.querySelector(".action-buttons .btn-primary").href =
      hero.primaryButton.href;
    document.querySelector(".action-buttons .btn-secondary").textContent =
      hero.secondaryButton.text;
    document.querySelector(".action-buttons .btn-secondary").href =
      hero.secondaryButton.href;

    document.querySelector("#spotify .section-header h2").textContent =
      config.sections.music.title;
    document.querySelector("#spotify .section-header p").textContent =
      config.sections.music.subtitle;
    document.querySelector("#projects .section-header h2").textContent =
      config.sections.github.title;
    document.querySelector("#projects .section-header p").textContent =
      config.sections.github.subtitle;

    const skillsSection = document.getElementById("skills");
    const skillsContainer = skillsSection.querySelector(".container");
    skillsContainer.innerHTML = `
            <div class="section-header text-center">
                <h2>${config.sections.skills.title}</h2>
                <p>${config.sections.skills.subtitle}</p>
            </div>
            ${config.skills
              .map(
                (category) => `
                <div class="skill-category">
                    <div class="skill-category-header">
                        <i class="${category.icon}" style="background-color: ${
                  category.iconBgColor
                }; color: ${category.iconColor};"></i>
                        <div class="skill-head">
                            <h3>${category.category}</h3>
                            <p>${category.subtitle}</p>
                        </div>
                    </div>
                    <div class="skills-detailed-grid ${category.category.toLowerCase()}">
                        ${category.items
                          .map(
                            (skill) => `
                            <div class="skill-card-detailed">
                                <h4>${skill.name}</h4>
                                <div class="progress-bar-container">
                                    <div class="progress-bar-wrapper">
                                        <div class="progress-bar-fill ${category.category.toLowerCase()}" data-width="${
                              skill.level
                            }%"></div>
                                    </div>
                                    <div class="progress-bar-labels">
                                        <span>Proficiency</span>
                                        <span>${skill.label}</span>
                                    </div>
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            `
              )
              .join("")}
        `;

    const footer = config.footer;
    document.querySelector(".site-footer-final p").textContent =
      footer.copyright;
    const socialsContainer = document.querySelector(".footer-socials");
    socialsContainer.innerHTML = footer.socials
      .map(
        (social) =>
          `<a href="${social.url}" target="_blank" aria-label="My ${social.name} profile"><i class="${social.icon}"></i></a>`
      )
      .join("");

    runSkillAnimation();
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/config");
      const config = await response.json();
      populatePage(config);
    } catch (error) {
      console.error("Failed to load site configuration:", error);
    }
  };

  fetchConfig();
});

function runSkillAnimation() {
  const skillBars = document.querySelectorAll(".progress-bar-fill");
  if (skillBars.length === 0) return;

  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.getAttribute("data-width");
        observer.unobserve(bar);
      }
    });
  }, observerOptions);

  skillBars.forEach((bar) => observer.observe(bar));
}
