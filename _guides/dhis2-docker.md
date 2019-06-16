https://docs.docker.com/install/linux/docker-ce/debian/
https://docs.docker.com/install/linux/linux-postinstall/
https://docs.docker.com/compose/install/


```
sudo apt-get update
```

```
sudo apt-get install \
     apt-transport-https \
     ca-certificates \
     curl \
     gnupg2 \
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
```

```
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

```
sudo groupadd docker
sudo usermod -aG docker $USER
```

```
sudo chown "$USER":"$USER" /home/"$USER"/.docker -R
sudo chmod g+rwx "$HOME/.docker" -R
```


``` 
sudo systemctl start docker
sudo systemctl enable docker
sudo systemctl disable docker
```

```
sudo touch /etc/docker/daemon.js
```

```
{ "data-root": "/opt/docker/data", "exec-root": "/opt/docker" }
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
