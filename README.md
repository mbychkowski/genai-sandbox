# Setup data in AlloyDB

## Enable AlloyDB with text embeddings

Enable the [extensions](https://github.com/pgvector/pgvector#getting-started)
for your AlloyDB cluster

```sql
-- google_ml_integration extension installation
CREATE EXTENSION google_ml_integration;

-- pgvector extension installation
CREATE EXTENSION vector;
```

Enable database integration with VertexAI

```bash
export PROJECT_ID=<your-project-id>
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:service-${PROJECT_NUMBER}@gcp-sa-alloydb.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

Ensure public ip exists for alloydb instance

```
gcloud beta alloydb instances update $PSQL_INSTANCE \
    --cluster=$PSQL_CLUSTER  \
    --region=$PSQL_REGION  \
    --assign-inbound-public-ip=ASSIGN_IPV4
```