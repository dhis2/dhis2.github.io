{% assign event = include.event %}
{% assign link_count = event.links | size %}

-   **{{event.title}}**{% if link_count > 0 %} - {% endif %}
    {% for link in event.links %}[{{link.label}}]({{link.href}}){% unless forloop.last %}, {% endunless %}{% endfor %}<br/>
    _{{event.date}}{% if event.time %} @ {{ event.time }}{% endif %}_<br/>
    {{event.description}}
