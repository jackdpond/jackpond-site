```{=html}
<div class="project-grid">
<% for (const item of items) { %>
  <div class="project-card">
    <h3><a href="<%- item.path %>"><%= item.title %></a></h3>
    <p><%= item.description %></p>
    <% if (item.stack) { %><p><strong>Stack:</strong> <%= item.stack %></p><% } %>
    <% if (item.repo) { %><p><a href="<%- item.repo %>" target="_blank">View repo</a></p><% } %>
  </div>
<% } %>
</div>
```
