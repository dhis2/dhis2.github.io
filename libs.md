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
                    {% if lib.url %}
                    <a href="{{ lib.url }}">
                        {{ lib.title | escape }}
                    </a>
                    {% else %}
                        {{ lib.title | escape }}
                    {% endif %}

                    <a href="https://github.com/{{ lib.github }}">
                        <img src="/assets/github-icon.png" alt="GitHub"/>
                    </a>
                </h3>
                {{ lib.description }}
            </li>
        {%- endfor -%}
	{%- endfor -%}
</ul>
