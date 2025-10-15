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
	docker run -p 80:80 --name myvueapp -d myvueapp:${tag}