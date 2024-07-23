# Serverless on Google Cloud

This is a walkthrough on how to step through different tiers of running
serverless workloads on Google Cloud centered around Cloud Run.

For this demo we will start with an Angular frontend application and gradually
build out a fullstack web application.

To get our Angular app up and running we will need a the Angular CLI. Follow the
instructions
[here](https://angular.dev/tutorials/first-app#local-development-environment) to
setup the local dev environment to get going with Angular.

Create a starter application:

```bash
ng new angular-app
```

and serve locally:

```bash
ng serve
```

Next, we will work on deploying this application to Google Cloud we will
progressively increase the maturity of application and development lifecycle as
we step through.

To get started let's make sure we are authenticated with our environment.

```bash
gcloud auth application-default login
```

and

```bash
gcloud config set project ${PROJECT_ID}
```

## Tier 1 - A simple deployment to Cloud Run

This will be the most barebones and quickest option for deploying our Angular
application to Cloud Run. We will use most of the defaults, and Google Cloud
will hand all the packaging and deploying of the application.

Run the `gcloud` command line to serve the Angular application to Cloud Run,
select `y` to any prompted questions.

```bash
gcloud run deploy my-angular-app \
  --region us-central1 \
  --source .
```

Behind the scenes Google Cloud is using Buildpacks to package your application
automatically into a container image. You can see view this in
[Cloud Build](https://console.cloud.google.com/cloud-build/builds) and storing
the image in a created repository for Cloud Run in
[Artifact Registry](https://console.cloud.google.com/artifacts) named
`us-central1-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/my-angular-app`.

> Note: To have Cloud Run application to external user, check your organization
> policy allows [run.googleapis.com/ingress](https://cloud.google.com/run/docs/securing/ingress)

## Tier 2 - Creating a build step with Cloud Build

Now that we have a quick deployment lets start by creating some build steps
around this to quickly automate deployments and securely doing so, by letting
Cloud Build deploy our application rather than on our local machine.

But before we create a build we need a repository to push our artifact binaries
to.

```bash
gcloud artifacts repositories create example \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for example app"
```

We will use the following [`cloudbuild.yaml`](/apps/service/cloudbuild.yaml)
configuration to run on Cloud Build.

```yaml
projectId: $PROJECT_ID
options:
  logging: CLOUD_LOGGING_ONLY
  pool: {}

steps:
- id: 'buildConfirmationStep'
  name: 'alpine'
  entrypoint: 'sh'
  dir: /workspace
  args:
  - '-c'
  - |
      echo "***********************"
      echo "$PROJECT_ID"
      echo "$BUILD_ID"
      echo "$LOCATION"
      echo "$REPO_NAME"
      echo "$BRANCH_NAME"
      echo "$SHORT_SHA"
      echo "$TAG_NAME"
      echo "***********************"

- name: 'node'
  id: expressNpmInstallStep
  entrypoint: 'npm'
  args:
  - install

- name: 'node'
  id: angularNpmInstallStep
  entrypoint: 'npm'
  args:
  - install
  - --prefix
  - angular-app/

- name: 'node'
  id: angularBuildStep
  entrypoint: 'npm'
  args:
  - run
  - build
  - --prefix
  - angular-app/

- name: gcr.io/k8s-skaffold/pack
  id: buildpackStep
  entrypoint: pack
  args:
  - build
  - "${_ARTIFACT_REPO_LOC}-docker.pkg.dev/${PROJECT_ID}/${_ARTIFACT_REPO_NAME}/${_ARTIFACT_IMAGE_NAME}"
  - --builder
  - gcr.io/buildpacks/builder:latest
  - --network
  - cloudbuild
  - --publish

- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  id: deployCloudRunStep
  entrypoint: gcloud
  args:
  - run
  - deploy
  - ${_ARTIFACT_IMAGE_NAME}
  - --image
  - "${_ARTIFACT_REPO_LOC}-docker.pkg.dev/${PROJECT_ID}/${_ARTIFACT_REPO_NAME}/${_ARTIFACT_IMAGE_NAME}"
  - --region
  - ${_APP_DEPLOY_REGION}

substitutions:
  _ARTIFACT_REPO_NAME: example
  _ARTIFACT_REPO_LOC: us-central1
  _ARTIFACT_IMAGE_NAME: my-angular-app
  _APP_DEPLOY_REGION: us-central1
```

The build steps consist of install our `Node.js` application packages and
compiling our angular code to make a production ready distribution to serve on
Cloud Run. It then uses [Google Cloud's Buildpacks](https://cloud.google.com/docs/buildpacks/build-application#build_with_configuration_files) to automatically build an
optimized container image. No need to worry about creating a `Dockerfile`!

In the final step Cloud Build runs the Cloud Run deploy step. In future steps
this will be replaced with Cloud Deploy.

Run Cloud build configuration by navigating into the `service` directory.

```bash
cd apps/service
```

And run the configuration.

```bash
gcloud builds submit --config cloudbuild.yaml .
```

## Tier 3 - Putting our app behind an Application Load Balancer and Identity Aware Proxy

We will mainly be following this [documentation](https://cloud.google.com/load-balancing/docs/https/setup-global-ext-https-serverless)
for setting up a global external loadbalancer for our serverless Angular app on
Cloud Run.

### Reserve Static IP

```bash
gcloud compute addresses create example-app-ip \
    --network-tier=PREMIUM \
    --ip-version=IPV4 \
    --global
```

### Create endpoint

Alternatively can be domain

```bash
gcloud endpoints services deploy ./gcloud/dns-spec.yaml \
  --project ${PROJECT_ID}
```

### Setup Google Managed Certificate

[Google Managed Certificate](https://cloud.google.com/load-balancing/docs/ssl-certificates/google-managed-certs)
and [deployment overview](https://cloud.google.com/certificate-manager/docs/deploy).

Create [managed certificate](https://cloud.google.com/certificate-manager/docs/certificates)

```bash
gcloud certificate-manager certificates create example-app-endpoint-cloud-goog-cert \
  --domains="app.endpoints.prj-kokiri-dev.cloud.goog"
```

Create [certificate map](https://cloud.google.com/certificate-manager/docs/maps)

```bash
gcloud certificate-manager maps create example-app-endpoints-cloud-goog-map
```

Add the [certificate map entries](https://cloud.google.com/certificate-manager/docs/map-entries)
for hostnames that require this certificate.

```bash
gcloud certificate-manager maps entries create example-app-endpoints-cloud-goog-map-entry \
  --map=example-app-endpoints-cloud-goog-map \
  --hostname=app.endpoints.prj-kokiri-dev.cloud.goog \
  --certificates=example-app-endpoint-cloud-goog-cert
```

In order for the certificate to become active we will need to associate it with
a Loadbalancer. Lets go ahead and [create](https://cloud.google.com/load-balancing/docs/https/setup-global-ext-https-serverless#creating_the_load_balancer)
that now.

Create a serverless NEG for your serverless app.
To create a serverless NEG with a Cloud Run service:

```bash
gcloud compute network-endpoint-groups create serverless-neg-my-angular-app \
  --region=us-central1 \
  --network-endpoint-type=serverless \
  --cloud-run-service=my-angular-app
```

Create a backend service.

```bash
gcloud compute backend-services create serverless-lb-be \
  --load-balancing-scheme=EXTERNAL_MANAGED \
  --global
```

Add the serverless NEG as a backend to the backend service:

```bash
gcloud compute backend-services add-backend serverless-lb-be \
  --global \
  --network-endpoint-group=serverless-neg-my-angular-app \
  --network-endpoint-group-region=us-central1 \
  --iap=enabled
```

Create a URL map to route incoming requests to the backend service:

```bash
gcloud compute url-maps create url-map-my-angular-app \
  --default-service=serverless-lb-be
```

Create a path matcher named `serverless-matcher` with the following characteristics:

```bash
gcloud compute url-maps add-path-matcher url-map-my-angular-app \
  --path-matcher-name=serverless-matcher \
  --default-service=serverless-lb-be \
  --path-rules=/angular=serverless-lb-be,/angular/*=serverless-lb-be
```

For an HTTPS load balancer, create an HTTPS target proxy. The proxy is the
portion of the load balancer that holds the SSL certificate for HTTPS Load
Balancing, so you also load your certificate in this step.

```bash
gcloud compute target-https-proxies create serverless-app-lb \
  --certificate-map=example-app-endpoints-cloud-goog-map \
  --url-map=url-map-my-angular-app
```


```bash
gcloud compute forwarding-rules create serverless-lb-fe \
  --load-balancing-scheme=EXTERNAL_MANAGED \
  --network-tier=PREMIUM \
  --address=example-app-ip \
  --target-https-proxy=serverless-app-lb \
  --global \
  --ports=443
```




## Tier 3 - Creating operations around deployment

Now that we have a quick deployment lets build some operations around it.

### Creating a `Knative` yaml template for Cloud Run

We will start by making our service more declarative. The easiest way to go about
this is to copy the `yaml` from the Cloud Run console as a starting point.

![Screenshot of Cloud Run console](/docs/assets/doc-1.png)

We can remove a lot of the the configurations here that are applied by Cloud Run
and create the resulting `yaml` file [templates](/apps/service/run/service.yaml)

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: my-angular-app
  labels:
    cloud.googleapis.com/location: us-central1
  annotations:
    run.googleapis.com/ingress: internal-and-cloud-load-balancing
spec:
  template:
    metadata:
      labels:
        run.googleapis.com/startupProbeType: Default
      annotations:
        autoscaling.knative.dev/maxScale: '100'
        run.googleapis.com/startup-cpu-boost: 'true'
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
      - name: my-angular-app
        image: apps/my-angular-app
        ports:
        - name: h2c
          containerPort: 3000
        resources:
          limits:
            cpu: 1000m
            memory: 512Mi
        startupProbe:
          timeoutSeconds: 240
          periodSeconds: 240
          failureThreshold: 1
          tcpSocket:
            port: 3000
```

A few things to point out here:

1) Right now ingress is setup for all, so anyone on the internet can view our
simple Angular application. In another tier we will add an Application Load
Balancer for additional benefits we will discuss later.

```yaml
...
  annotations:
    run.googleapis.com/ingress: internal-and-cloud-load-balancing
...
```

2) We have generalized the image name as `apps/my-angular-app`. We will be
adding a few more things with Skaffold and Artifact Registry to make this work.

```yaml
...
      containers:
      - name: my-angular-app
        image: example/my-angular-app
...
```

3) By [default](https://cloud.google.com/run/docs/configuring/http2) Cloud Run
downgrades HTTP/2 requests to HTTP/1. This overrides the defualt and explicitly
sets our services to use HTTP/2 end-to-end.

```yaml
...
        ports:
        - name: h2c
          containerPort: 3000
...
```

### Setup Skaffold for our build and deploy stages



```bash
gcloud --pack builds
```

## Tier 3 -