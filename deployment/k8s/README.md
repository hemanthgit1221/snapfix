# SnapFix Kubernetes Deployment Guide

This guide explains how to deploy SnapFix to Oracle Kubernetes Engine (OKE) using the provided Kubernetes manifests.

## Prerequisites

1. **Oracle Cloud Infrastructure Account**
2. **OKE Cluster** - Create a Kubernetes cluster in OCI
3. **kubectl** - Configured to connect to your OKE cluster
4. **Docker Hub Account** - For pushing container images
5. **Domain Name** (optional) - For custom domain setup

## Quick Start

### 1. Prepare Your Images

First, build and push your Docker images to Docker Hub:

```bash
# Build images
docker build -t your-dockerhub-username/snapfix-backend:latest ../backend
docker build -t your-dockerhub-username/snapfix-frontend:latest ../frontend
docker build -t your-dockerhub-username/snapfix-db-dashboard:latest ../db-dashboard
docker build -t your-dockerhub-username/snapfix-nginx:latest -f Dockerfile.nginx .

# Push images
docker push your-dockerhub-username/snapfix-backend:latest
docker push your-dockerhub-username/snapfix-frontend:latest
docker push your-dockerhub-username/snapfix-db-dashboard:latest
docker push your-dockerhub-username/snapfix-nginx:latest
```

### 2. Update Configuration

Update the following files with your actual values:

**configmap.yaml:**
- Update `REACT_APP_API_URL` with your domain
- Update `CORS_ORIGINS` with your domain

**secrets.yaml:**
- Encode your actual passwords and secrets using base64:
  ```bash
  echo -n "your-password" | base64
  ```

**All YAML files:**
- Replace `your-dockerhub-username` with your actual Docker Hub username

### 3. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Create secrets and configmap
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml

# Deploy database
kubectl apply -f postgres.yaml

# Wait for database to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n snapfix --timeout=300s

# Deploy backend
kubectl apply -f backend.yaml

# Deploy frontend
kubectl apply -f frontend.yaml

# Deploy database dashboard
kubectl apply -f db-dashboard.yaml

# Deploy nginx
kubectl apply -f nginx.yaml

# Deploy ingress (optional)
kubectl apply -f ingress.yaml
```

### 4. Check Deployment Status

```bash
# Check all pods
kubectl get pods -n snapfix

# Check services
kubectl get services -n snapfix

# Check ingress
kubectl get ingress -n snapfix

# View logs
kubectl logs -f deployment/backend -n snapfix
kubectl logs -f deployment/frontend -n snapfix
```

## Detailed Configuration

### Environment Variables

The application uses ConfigMaps and Secrets for configuration:

**ConfigMap (configmap.yaml):**
- Non-sensitive configuration values
- Database settings, API URLs, etc.

**Secrets (secrets.yaml):**
- Sensitive data like passwords and API keys
- Must be base64 encoded

### Storage

The deployment uses two types of storage:

1. **PostgreSQL Data**: `oci-bv` (Block Volume) - Single node access
2. **File Uploads**: `oci-fss` (File Storage Service) - Multi-node access

### Networking

- **Internal Services**: ClusterIP for internal communication
- **External Access**: LoadBalancer for nginx service
- **Ingress**: Optional for domain-based routing and SSL termination

### Resource Limits

Each container has resource requests and limits:

- **PostgreSQL**: 256Mi-512Mi memory, 250m-500m CPU
- **Backend**: 512Mi-1Gi memory, 250m-500m CPU
- **Frontend**: 128Mi-256Mi memory, 100m-200m CPU
- **DB Dashboard**: 128Mi-256Mi memory, 100m-200m CPU
- **Nginx**: 64Mi-128Mi memory, 50m-100m CPU

## SSL/TLS Configuration

### Option 1: Using cert-manager (Recommended)

1. Install cert-manager:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. Create a ClusterIssuer:
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

3. Update the ingress.yaml with your domain name

### Option 2: Manual SSL Certificates

1. Generate SSL certificates
2. Create a secret:
```bash
kubectl create secret tls snapfix-tls --cert=path/to/cert.pem --key=path/to/key.pem -n snapfix
```

## Monitoring and Logging

### View Logs

```bash
# All pods in namespace
kubectl logs -f -l app=snapfix -n snapfix

# Specific deployment
kubectl logs -f deployment/backend -n snapfix

# Previous container logs
kubectl logs -f deployment/backend -n snapfix --previous
```

### Resource Monitoring

```bash
# Resource usage
kubectl top pods -n snapfix
kubectl top nodes

# Describe resources
kubectl describe pod <pod-name> -n snapfix
```

### Health Checks

All deployments include liveness and readiness probes:

- **PostgreSQL**: `pg_isready` command
- **Backend**: `/actuator/health` endpoint
- **Frontend**: HTTP GET on port 80
- **DB Dashboard**: HTTP GET on port 3001
- **Nginx**: `/health` endpoint

## Scaling

### Horizontal Pod Autoscaling

Create an HPA for the backend:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: snapfix
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Manual Scaling

```bash
# Scale backend to 5 replicas
kubectl scale deployment backend --replicas=5 -n snapfix

# Scale frontend to 3 replicas
kubectl scale deployment frontend --replicas=3 -n snapfix
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
kubectl exec -it deployment/postgres -n snapfix -- pg_dump -U snapfix_user snapfix > backup.sql

# Restore from backup
kubectl exec -i deployment/postgres -n snapfix -- psql -U snapfix_user snapfix < backup.sql
```

### Persistent Volume Backup

Use OCI's backup service or create snapshots of your persistent volumes.

## Troubleshooting

### Common Issues

1. **Pods not starting:**
   ```bash
   kubectl describe pod <pod-name> -n snapfix
   kubectl logs <pod-name> -n snapfix
   ```

2. **Services not accessible:**
   ```bash
   kubectl get services -n snapfix
   kubectl describe service <service-name> -n snapfix
   ```

3. **Ingress not working:**
   ```bash
   kubectl get ingress -n snapfix
   kubectl describe ingress snapfix-ingress -n snapfix
   ```

4. **Storage issues:**
   ```bash
   kubectl get pvc -n snapfix
   kubectl describe pvc <pvc-name> -n snapfix
   ```

### Debug Commands

```bash
# Get all resources
kubectl get all -n snapfix

# Describe namespace
kubectl describe namespace snapfix

# Check events
kubectl get events -n snapfix --sort-by='.lastTimestamp'

# Port forward for testing
kubectl port-forward service/backend-service 8080:8080 -n snapfix
kubectl port-forward service/frontend-service 3000:80 -n snapfix
```

## Security Considerations

1. **Network Policies**: Implement network policies to restrict pod-to-pod communication
2. **RBAC**: Use Role-Based Access Control for API access
3. **Secrets Management**: Use external secret management systems in production
4. **Image Security**: Scan container images for vulnerabilities
5. **Pod Security**: Use Pod Security Standards

## Cost Optimization

1. **Right-sizing**: Adjust resource requests and limits based on actual usage
2. **Spot Instances**: Use preemptible instances for non-critical workloads
3. **Auto-scaling**: Implement proper auto-scaling policies
4. **Storage**: Use appropriate storage classes based on access patterns

## Cleanup

To remove the entire deployment:

```bash
kubectl delete namespace snapfix
```

This will remove all resources in the snapfix namespace.

## Support

For issues and questions:
1. Check the logs: `kubectl logs -f deployment/<deployment-name> -n snapfix`
2. Check events: `kubectl get events -n snapfix`
3. Describe resources: `kubectl describe <resource-type> <resource-name> -n snapfix`
