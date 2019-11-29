---
title: Development
short: Development
layout: page
---

Make your choice.

<ul class="post-list">
  {% for page in site.development %}
	<li>
      <a class="post-link" href="{{ page.url | relative_url }}">
        {{ page.title | escape }}
      </a>
	</li>
  {% endfor %}
</ul>
