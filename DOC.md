# Serverless on Google Cloud

This is a walkthrough on how to step through different tiers of running
serverless workloads on Google Cloud centered around Cloud Run.

For this demo we will start with an Angular frontend application and gradually
build out a fullstack we application.

To get our Angular app up and running we will need a the Angular CLI. Follow the
instructions
[here](https://angular.dev/tutorials/first-app#local-development-environment) to
setup the local dev environment to get going with Angular.

Create a starter application:

```
ng new angular-app
```

and serve locally:

```
ng serve
```

Next, we will work on deploying this application to Google Cloud we will
progressively increase the maturity of application and development lifecycle as
we step through.

To get started let's make sure we are authenticated with our environment.

```
gcloud auth application-default login
```

and

```
gcloud config set project <your-project-id>
```

## Tier 1 - A simple deployment to Cloud Run

This will be the most barebones and quickest option for deploying our Angular
application to Cloud Run. We will use most of the defaults, and Google Cloud
will hand all the packaging and deploying of the application.

Run the `gcloud` command line to serve the Angular application to Cloud Run,
select `y` to any prompted questions.

```
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

## Tier 2 -

## Tier 3 -