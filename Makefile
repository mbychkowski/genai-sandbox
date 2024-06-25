# Copyright 2023 Google LLC All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

SHELL := /bin/bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

# Source important environmental variables that need to be persisted and are easy to forget about
-include .env

authenticate:
	@gcloud auth application-default login

enable-apis:
	@gcloud --project ${PROJECT_ID} services enable \
		artifactregistry.googleapis.com \
		cloudbuild.googleapis.com \
		clouddeploy.googleapis.com \
		cloudresourcemanager.googleapis.com \
		compute.googleapis.com \
		container.googleapis.com \
		mesh.googleapis.com

# This is where local builds should go. Those not going through deployment
# pipeline
registry-dirty:
	@gcloud artifacts repositories create ${ARTIFACT_REPO_NAME}-dirty \
  	--repository-format=docker \
  	--location=${REGION} \
		--labels=env=local,status=dirty \
  	--description="Docker cicd demo repository for local development"

registry:
	@gcloud artifacts repositories create ${ARTIFACT_REPO_NAME} \
  	--repository-format=docker \
  	--location=${REGION} \
		--labels=env=demo,status=clean \
  	--description="Docker cicd demo repository"

build-trigger-main:
	@gcloud beta builds triggers create cloud-source-repositories \
		--name="csr-branch-be00" \
		--description="Trigger from CSR on main branch for apps/client" \
		--region=${REGION} \
		--repo=${CSR_REPO_NAME} \
		--branch-pattern="^main$$" \
		--build-config=cloudbuild.yaml \
		--included-files="apps/client/**,cloudbuild.yaml,skaffold.yaml" \
		--substitutions=_DEPLOY_PIPELINE=client,_CLUSTER_DEV_LOC=${CLUSTER_DEV_LOC},_CLUSTER_DEV_NAME=${CLUSTER_DEV_NAME},_CLUSTER_PROD_LOC=${CLUSTER_PROD_LOC},_CLUSTER_PROD_NAME=${CLUSTER_PROD_NAME}

build-trigger-tag:
	@gcloud beta builds triggers create cloud-source-repositories \
		--name="csr-tag-be00" \
		--description="Trigger from CSR on version release for apps/client" \
		--region=${REGION} \
		--repo=${CSR_REPO_NAME} \
		--tag-pattern=v* \
		--build-config=cloudbuild.yaml \
		--included-files="client/**,cloudbuild.yaml,skaffold.yaml" \
		--substitutions=_DEPLOY_PIPELINE=client,_CLUSTER_DEV_LOC=${CLUSTER_DEV_LOC},_CLUSTER_DEV_NAME=${CLUSTER_DEV_NAME},_CLUSTER_PROD_LOC=${CLUSTER_PROD_LOC},_CLUSTER_PROD_NAME=${CLUSTER_PROD_NAME}

build-trigger-pubsub:
	@gcloud pubsub topics create gcr --project=${PROJECT_ID}
	@gcloud beta builds triggers create pubsub \
		--name="ar-pubsub-be00" \
		--description="Trigger from pub/sub Artifact Registry topic for apps/client" \
		--region=${REGION} \
		--topic=projects/${PROJECT_ID}/topics/gcr \
		--repo-type="CLOUD_SOURCE_REPOSITORIES" \
		--repo=${CSR_REPO_NAME} \
		--branch=main \
		--build-config=cloudbuild-tag.yaml \
		--subscription-filter='_ACTION.matches("INSERT")' \
		--substitutions=_DEPLOY_PIPELINE=client,_CLUSTER_DEV_LOC=${CLUSTER_DEV_LOC},_CLUSTER_DEV_NAME=${CLUSTER_DEV_NAME},_CLUSTER_PROD_LOC=${CLUSTER_PROD_LOC},_CLUSTER_PROD_NAME=${CLUSTER_PROD_NAME},_IMAGE_TAG='$$(body.message.data.tag)',_ACTION='$$(body.message.data.action)'

build-be00:
	@gcloud builds submit --region=${REGION} \
		--tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO_NAME}/be00:latest \
		./apps/client

build-dirty-be00:
	@gcloud builds submit --region=${REGION} \
		--tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO_NAME}-dirty/be00:latest \
		./apps/client

deploy-pipeline:
	@gcloud --project ${PROJECT_ID} deploy apply --file clouddeploy.yaml --region "${REGION}"
