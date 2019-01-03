---
title: Guides
layout: page
---

These guides contain long-lived information about how to get up and
running with DHIS2.

<ul class="post-list">
  {% for page in site.guides %}
	<li>
      <a class="post-link" href="{{ page.url | relative_url }}">
        {{ page.title | escape }}
      </a>
	</li>
  {% endfor %}
</ul>
