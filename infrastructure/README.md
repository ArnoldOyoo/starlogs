# Starlogs Infrastructure

AWS infrastructure managed with Terraform and Kubernetes manifests for EKS deployment.

## Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform >= 1.0
- kubectl
- Docker

## Terraform Setup

### 1. Create S3 Backend (one-time)

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://starlogs-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket starlogs-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name starlogs-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2. Initialize and Deploy

```bash
cd infrastructure/terraform

# Create terraform.tfvars
cat > terraform.tfvars << EOF
aws_region      = "us-east-1"
environment     = "prod"
project_name    = "starlogs"
db_username     = "starlogs_admin"
EOF

# Initialize Terraform
terraform init

# Review plan
terraform plan

# Apply infrastructure
terraform apply
```

### 3. Configure kubectl

```bash
aws eks update-kubeconfig \
  --name starlogs-prod \
  --region us-east-1
```

## Kubernetes Deployment

### 1. Create Secrets

```bash
# Create namespace
kubectl apply -f kubernetes/namespace.yaml

# Create secrets (edit with actual values first!)
kubectl apply -f kubernetes/secrets.yaml
```

### 2. Deploy Application

```bash
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/ingress.yaml
kubectl apply -f kubernetes/hpa.yaml
```

### 3. Verify Deployment

```bash
# Check pods
kubectl get pods -n starlogs

# Check services
kubectl get svc -n starlogs

# Check ingress
kubectl get ingress -n starlogs

# View logs
kubectl logs -f deployment/starlogs-backend -n starlogs
```

## CI/CD

GitHub Actions workflow (`.github/workflows/deploy.yml`) handles:

1. **Test**: Lint and build both frontend and backend
2. **Build**: Create and push Docker images to ECR
3. **Deploy Backend**: Rolling update to EKS
4. **Deploy Frontend**: Sync to S3 + CloudFront invalidation

### Required GitHub Secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`
- `VITE_API_URL`
- `CLOUDFRONT_DISTRIBUTION_ID`

## Cost Optimization Tips

For development environments:
- Use `db.t3.micro` for RDS
- Use `cache.t3.micro` for ElastiCache
- Set `eks_desired_nodes = 1`
- Disable Multi-AZ for RDS

## Cleanup

```bash
# Destroy all resources
cd infrastructure/terraform
terraform destroy
```
