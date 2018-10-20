---
title: Libraries
layout: page
---

<ul class="post-list">
    {% for section in site.data.libs.list %}
        <h2>{{ section.title }}</h2>
        {% for lib in section.list %}
            <li>
                <h3 class="d2-lib-header">
                    {{ lib.title | escape }}

                    {% if lib.github %}
                    <a href="https://github.com/{{ lib.github }}">
                        :octocat:
                    </a>
                    {% endif %}

                    {% if lib.url %}
                    <a href="{{ lib.url }}">
                        :book:
                    </a>
                    {% endif %}
                </h3>
                {{ lib.description }}
            </li>
        {%- endfor -%}
	{%- endfor -%}
</ul>
