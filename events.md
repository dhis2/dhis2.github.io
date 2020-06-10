---
title: Events
layout: page
---

{% capture now %}{{'now' | date: '%s' | plus: 0 %}}{% endcapture %}

The DHIS2 Core Team is hosting a series training and community events, find more information at the links below:

### Upcoming events

{% for event in site.data.events %}
{% capture date %}{{event.date | date: '%s' | plus: 0 %}}{% endcapture %}
{% if date > now %}

-   **{{event.title}}** -
    {% for link in event.links %}[{{link.label}}]({{link.href}}){% unless forloop.last %}, {% endunless %}{% endfor %}<br/>
    _{{event.date}}_<br/>
    {{event.description}}<br/>
    {% endif %}
    {% endfor %}

{% assign reversed_events = site.data.events | sort: 'date' | reverse %}

### Past events

{% for event in reversed_events %}
{% capture date %}{{event.date | date: '%s' | plus: 0 %}}{% endcapture %}
{% if date < now %}

-   **{{event.title}}** -
    {% for link in event.links %}[{{link.label}}]({{link.href}}){% unless forloop.last %}, {% endunless %}{% endfor %}<br/>
    _{{event.date}}_<br/>
    {{event.description}}<br/>
    {% endif %}
    {% endfor %}
