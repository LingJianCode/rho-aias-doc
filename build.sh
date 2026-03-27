#!/bin/bash
# build
docker build --no-cache -t ${CNB_DOCKER_REGISTRY}/${CNB_REPO_SLUG_LOWERCASE} .
# push
#docker push ${CNB_DOCKER_REGISTRY}/${CNB_REPO_SLUG_LOWERCASE}