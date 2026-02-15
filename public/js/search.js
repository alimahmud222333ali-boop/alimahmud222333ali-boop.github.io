document.addEventListener("DOMContentLoaded", () => {

  let pages = [];
  let activeIndex = -1;

  const input = document.getElementById("search-input");
  const resultsBox = document.getElementById("search-results");

  // Load blog posts
  fetch("/index.json")
    .then(res => res.json())
    .then(data => {
      pages = data;
      console.log("Search loaded:", pages.length);
    })
    .catch(err => console.error("Search JSON error:", err));

  if (!input || !resultsBox) {
    console.error("Search elements not found");
    return;
  }

  // Highlight matched text
  function highlight(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  // Render results
  function renderResults(results, query) {

    activeIndex = -1;

    if (results.length === 0) {
      resultsBox.innerHTML =
        `<div class="p-2 text-muted">No results found</div>`;
      return;
    }

    let html = `<ul class="list-group">`;

    results.forEach((item, i) => {

      const title = highlight(item.title, query);

      html += `
        <li class="list-group-item search-item"
            data-index="${i}"
            data-url="${item.url}">
          ${title}
        </li>
      `;
    });

    html += `</ul>`;

    resultsBox.innerHTML = html;
  }

  // Search input
  input.addEventListener("input", function () {

    const query = this.value.toLowerCase().trim();

    if (!query) {
      resultsBox.innerHTML = "";
      return;
    }

    const matches = pages
      .filter(page =>
        page.title.toLowerCase().includes(query) ||
        page.content.toLowerCase().includes(query)
      )
      .slice(0, 5); // Limit to 5

    renderResults(matches, query);
  });

  // Keyboard navigation
  input.addEventListener("keydown", function (e) {

    const items = document.querySelectorAll(".search-item");

    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      updateActive(items);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex =
        (activeIndex - 1 + items.length) % items.length;
      updateActive(items);
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (activeIndex >= 0) {
        window.location.href =
          items[activeIndex].dataset.url;
      }
    }
  });

  // Highlight active item
  function updateActive(items) {

    items.forEach(item =>
      item.classList.remove("active")
    );

    if (activeIndex >= 0) {
      items[activeIndex].classList.add("active");
    }
  }

  // Click result
  resultsBox.addEventListener("click", function (e) {

    const item = e.target.closest(".search-item");

    if (!item) return;

    window.location.href = item.dataset.url;
  });

  // Close when clicking outside
  document.addEventListener("click", function (e) {

    if (
      !input.contains(e.target) &&
      !resultsBox.contains(e.target)
    ) {
      resultsBox.innerHTML = "";
    }
  });

});
