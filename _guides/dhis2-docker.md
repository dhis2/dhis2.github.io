---
title: DHIS2 Docker
category: guide
layout: page
---

# Make sure the system is updated

```
sudo apt-get update
sudo apt-get upgrade
```

# Setup a user account for yourself

```
sudo useradd -U -G sudo -b /home $USER
sudo passwd $USER
```

# Install NodeJS

https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions

```
sudo apt-get install gnupg curl

curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add -

VERSION=node_10.x
DISTRO="$(lsb_release -s -c)"

echo "deb https://deb.nodesource.com/$VERSION $DISTRO main" | sudo tee /etc/apt/sources.list.d/nodesource.list
echo "deb-src https://deb.nodesource.com/$VERSION $DISTRO main" | sudo tee -a /etc/apt/sources.list.d/nodesource.list
```

```
sudo apt-get update
sudo apt-get install nodejs
```

# Install Yarn

https://yarnpkg.com/lang/en/docs/install/#debian-stable

```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
```

```
sudo apt-get update
sudo apt-get install yarn
```

# Install Docker

https://docs.docker.com/install/linux/docker-ce/debian/
https://docs.docker.com/install/linux/linux-postinstall/
https://docs.docker.com/compose/install/

```
sudo apt-get update
sudo apt-get install \
     apt-transport-https \
     ca-certificates \
     software-properties-common
```

```
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
```

```
sudo add-apt-repository \
     "deb [arch=amd64] https://download.docker.com/linux/debian \
     $(lsb_release -cs) \
     stable"
```

```
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

```
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

```
sudo chown "$USER":"$USER" /home/"$USER"/.docker -R
sudo chmod g+rwx "$HOME/.docker" -R
```

```
echo "{ \"data-root\": \"/custom/docker/data/dir\", \"exec-root\": \"/custom/docker/dir\" }" | sudo tee /etc/docker/daemon.json
```

```
sudo systemctl start docker
sudo systemctl enable docker
#sudo systemctl disable docker
```

```
sudo apt-get autoremove
```

```
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

```
sudo chmod +x /usr/local/bin/docker-compose
```

# Install Nginx

```
sudo apt-get install nginx
```

```
sudo tee /etc/nginx/sites-available/default <<EOF
server {
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name _;
        charset utf-8;

        client_max_body_size       10m;
        client_body_buffer_size    128k;

        proxy_buffer_size          4k;
        proxy_buffers              4 32k;
        proxy_busy_buffers_size    64k;
        proxy_temp_file_write_size 64k;

        gzip on;
        gzip_types
                "application/json;charset=utf-8" application/json
                "application/javascript;charset=utf-8" application/javascript text/javascript
                "application/xml;charset=utf-8" application/xml text/xml
                "text/css;charset=utf-8" text/css
                "text/plain;charset=utf-8" text/plain;

        root /srv/www/;
        index index.html;

        location /dev {
                proxy_pass                http://localhost:8080/dev;
                proxy_redirect            off;
                proxy_set_header          Host               \$host;
                proxy_set_header          X-Real-IP          \$remote_addr;
                proxy_set_header          X-Forwarded-For    \$proxy_add_x_forwarded_for;
                proxy_set_header          X-Forwarded-Proto  https;
        }
}
EOF
```

```
sudo systemctl enable nginx
```

# Install certbot

https://certbot.eff.org/lets-encrypt/debianbuster-nginx

```
sudo apt-get install certbot python-certbot-nginx
```

```
sudo certbot --nginx
```

> **Note:** After setting up a certificate with certbot, usually I have to clean up my `default` config as well.

```
sudo certbot renew --dry-run
```

# Install D2 CLI

```
yarn global add @dhis2/cli
```

```
tee -a ~/.bash_profile <<EOF
if [ -d "\$HOME/.config/yarn/global/node_modules/.bin" ] ; then
    PATH="\$HOME/.config/yarn/global/node_modules/.bin:\$PATH"
fi
EOF
```

```
mkdir -p ~/.config/d2
tee ~/.config/d2/config.js <<EOF
module.exports = {
    cluster: {
        channel: 'stable',
        clusters: {
            dev: {
                channel: 'dev',
                dbVersion: 'dev',
                dhis2Version: 'master',
                customContext: true,
                port: 8080
            },
        },
    },
}
EOF
```

```
d2 cluster up dev
```
