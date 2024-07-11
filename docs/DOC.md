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
gcloud config set project <your-project-id>
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
`us-central1-docker.pkg.dev/<your-project-id>/cloud-run-source-deploy/my-angular-app`.

> Note: To have Cloud Run application to external user, check your organization
> policy allows [run.googleapis.com/ingress](https://cloud.google.com/run/docs/securing/ingress)

## Tier 2 - Creating a build step with Cloud Build

```bash
gcloud artifacts repositories create example \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for example app"
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
    run.googleapis.com/ingress: all
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
    run.googleapis.com/ingress: all
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