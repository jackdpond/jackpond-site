// Site-wide custom JS, loaded on every page via the include in assets/includes/after-body.html.

// Quarto already computes a word count per post for listing sort
// (data-listing-word-count-sort); render it as a tag next to the category tags.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".quarto-post").forEach((post) => {
    const words = post.getAttribute("data-listing-word-count-sort");
    if (!words) return;

    let tagsEl = post.querySelector(".listing-categories");
    if (!tagsEl) {
      tagsEl = document.createElement("div");
      tagsEl.className = "listing-categories";
      const title = post.querySelector(".listing-title");
      if (title) title.after(tagsEl);
    }

    const tag = document.createElement("div");
    tag.className = "listing-category listing-wordcount";
    tag.textContent = `${Number(words).toLocaleString()} words`;
    tagsEl.appendChild(tag);
  });
});
