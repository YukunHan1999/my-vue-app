export tag=v1.0
root:
	export ROOT=MY-VUE-APP

build:
	echo "compile vue project"
	npm run build

release: build
	echo "building httpserver container"
	docker ps -a -q --filter ancestor=myvueapp:${tag} | xargs -r docker rm -f
	docker images -a -q --filter "reference=myvueapp:${tag}" | xargs -r docker rmi -f
	docker build -t myvueapp:${tag} .

push: release
	echo "pushing myvueapp:${tag}"
	docker push myvueapp:${tag}

run: release
	echo "run myvueapp"
	docker run -p 30000:80 --name myvueapp --network blog-network -d myvueapp:${tag}

# docker network create blog-network
# docker network ls
# --add-host 相当于/etc/hosts 中添加了指定主机的域名,不需要硬编码主机的IP地址 http://host.docker.internal:8080/ 
# docker run -p 30000:80 --name myvueapp --add-host=host.docker.internal:host-gateway -d myvueapp:${tag}