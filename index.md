---
layout: page
title: Welcome
---

Welcome to the DHIS2 Developer Portal. Here you will find the latest information about DHIS2 application development tools, tips, and trainings.

To get started, check out the [Guides](./guides) and [Docs](./docs) sections or join fellow DHIS2 app developers on the [Community of Practice](https://community.dhis2.org/c/development/app-development).

Check out our [developer events](./events) for upcoming webinars and workshops.

### Latest Articles

<ul class="post-list">
{% for post in site.categories.blog %}
    {% if forloop.index > 3 %} {% break %} {% endif %}
    <li>
        {% assign date_format = site.minima.date_format | default: "%b %-d, %Y" %}
        <span class="post-meta">{{ post.date | date: date_format }}</span>
        <h3>
            <a class="post-link" href="{{ post.url | relative_url }}">
                {{ post.title | escape }}
            </a>
        </h3>
        {% if site.show_excerpts %} {{ post.excerpt }} {% endif %}
    </li>
{% endfor %}
</ul>

<div>
    <a class="button" href="{% link blog.md %}">All articles</a
    >&nbsp;:point_right:
</div>
