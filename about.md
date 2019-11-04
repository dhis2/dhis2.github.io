---
layout: page
title: About
---

{% assign authors = site.data.people %}

{% for author in authors %}
<a rel="author"
    href="https://github.com/{{ author.github }}"
    title="{{ author.name }}">
{{ author.name }}
</a>
{% endfor %}
