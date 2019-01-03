---
title: Libraries
layout: page
---

<article>
{% for section in site.data.libs.list %}
    {% for lib in section.list %}
    <h3 class="d2-lib-header">
        {{ lib.title | escape }}
    </h3>
    <p>
        [{{section.title}}] {{ lib.description }}
    </p>
    <ul>
        {% if lib.github %}
        <li>:octocat::
        <a href="https://github.com/{{ lib.github }}"
            title="GitHub Repo">
            {{ lib.github }}
        </a>
        </li>
        {% endif %}

        {% if lib.url %}
        <li>:closed_book::
        <a href="{{ lib.url }}" title="Documentation">
            {{ lib.url }}
        </a>
        </li>
        {% endif %}

        {% if lib.changelog %}
        <li>:page_facing_up::
        <a href="{{ lib.changelog }}" title="Changelog">
            {{ lib.changelog }}
        </a>
        </li>
        {% endif %}
    </ul>
    {%- endfor -%}
{%- endfor -%}
</article>
