# StarLogs

StarLogs is an astronomy observation platform that lets users determine the best vissibility window for stargazing, I built it as a full-stack application and delivered for my DevOps portfolio.  
The focus is not only on application features, but on how software is packaged, validated, deployed, and operated in a cloud-native environment.

## DevOps Workflow

Through this project I demonstrate a practical DevOps knowledge by demonstrating the delivery path from local development to AWS production infrastructure:

- Application services are containerized for consistent runtime behavior.
- Infrastructure is declared with Terraform for repeatable provisioning.
- Kubernetes manifests define runtime behavior for backend workloads on EKS.
- GitHub Actions orchestrates CI/CD for test, build, image publish, and deployment.
- Frontend is shipped as a static bundle to S3 and invalidated through CloudFront.

The repository is structured to show how my product code and operations code evolve together.

## Architecture Workflow Diagram

```mermaid
flowchart LR
    Dev[Oyoo] --> GitHub[GitHub Repository]
    GitHub --> Actions[GitHub Actions CI/CD]

    Actions --> FE_Build[Build Frontend]
    Actions --> BE_Build[Build Backend]
    BE_Build --> ECR[(Amazon ECR)]

    FE_Build --> S3[(S3 Static Hosting)]
    S3 --> CF[CloudFront CDN]
    CF --> User[End User Browser]

    Actions --> EKS[EKS Deploy]
    EKS --> ALB[ALB Ingress]
    ALB --> API[StarLogs Backend Pods]

    API --> RDS[(Amazon RDS PostgreSQL)]
    API --> Redis[(ElastiCache Redis)]

    Terraform[Terraform IaC] --> AWS[AWS Infrastructure]
    AWS --> EKS
    AWS --> RDS
    AWS --> Redis
    AWS --> S3
    AWS --> ECR
```

## CI/CD Workflow

1. A push or pull request to `main` triggers GitHub Actions.
2. Frontend and backend are linted and built.
3. Backend image is built and pushed to Amazon ECR.
4. Backend is rolled out to EKS.
5. Frontend static assets are deployed to S3.
6. CloudFront cache is invalidated to publish the latest UI.

## Tech Stack

### Application
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Express, TypeScript, Prisma
- Data: PostgreSQL, Redis

### DevOps
- Containers: Docker, Docker Compose
- Orchestration: Kubernetes (EKS)
- Infrastructure as Code: Terraform
- CI/CD: GitHub Actions
- Cloud: AWS (EKS, ECR, RDS, ElastiCache, S3, CloudFront)

## Repository Layout

```text
.
├── src/                        # Frontend application
├── backend/                    # Backend API service
├── infrastructure/
│   ├── terraform/              # AWS infrastructure definitions
│   └── kubernetes/             # Kubernetes manifests
├── docker-compose.yml          # Local multi-service environment
└── .github/workflows/          # CI/CD pipelines
```

## Local Development

Prerequisites:
- Node.js 20+
- npm
- Docker (optional but recommended for full local stack)

Frontend quick start:

```sh
npm install
npm run dev
```

Backend quick start:

```sh
cd backend
npm install
npm run prisma:generate
npm run dev
```

Full local stack with Docker:

```sh
docker-compose up -d
```

## Infrastructure and Deployment

- Terraform setup and provisioning details: `infrastructure/README.md`
- Kubernetes deployment manifests: `infrastructure/kubernetes/`
- Backend service details: `backend/README.md`

## Portfolio Scope

This portfolio emphasizes:
- Reproducible infrastructure
- Automated delivery
- Service scalability (HPA)
- Operational readiness through health checks and rolling deployment patterns