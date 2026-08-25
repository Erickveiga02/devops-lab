# 5. Roteiro prático — colocando o lab para rodar

Objetivo: aplicar, na ordem certa, os manifests que já existem em
`kubernetes/lab/`, validando cada etapa antes de seguir para a próxima.
Rode os comandos a partir da raiz de `kubernetes/` (os caminhos abaixo
já incluem o prefixo `lab/`).

> Pré-requisito: Rancher Desktop aberto com **Kubernetes habilitado**
> (veja [README.md](README.md)) e `kubectl` configurado no contexto
> `rancher-desktop`. Confirme com `kubectl cluster-info` antes de começar.

## Passo 1 — Namespace

```bash
kubectl apply -f lab/namespace/main.yaml
kubectl get namespaces
```

Valide: `lab-devops` aparece na lista com status `Active`.

**Pergunta para checar entendimento:** por que este precisa ser o
primeiro objeto criado? (Resposta: os demais manifests declaram
`namespace: lab-devops` — se ele não existir, a criação falha.)

## Passo 2 — Pod isolado

```bash
kubectl apply -f lab/pod/main.yaml
kubectl get pods -n lab-devops
kubectl describe pod weather-api-pod -n lab-devops
```

Valide: o Pod aparece com status `Running`.

**Experimento proposto:** derrube o Pod manualmente e observe o que
acontece.

```bash
kubectl delete pod weather-api-pod -n lab-devops
kubectl get pods -n lab-devops
```

Repare que ele **não volta sozinho** — o Namespace foi listado, mas
ninguém recria este Pod. Esse é o comportamento que motiva o próximo
passo.

## Passo 3 — Deployment

```bash
# remova o Pod solto para não conflitar com os Pods do Deployment
kubectl delete -f lab/pod/main.yaml --ignore-not-found

kubectl apply -f lab/deployment/main.yaml
kubectl get pods -n lab-devops
kubectl get deployment weather-api-deployment -n lab-devops
```

Valide: aparecem **2 Pods** (`replicas: 2`), com nomes gerados
automaticamente (sufixo aleatório), ambos `Running`.

**Experimento proposto:** repita o teste do passo anterior, mas agora
apagando um Pod do Deployment.

```bash
kubectl delete pod <nome-de-um-dos-pods> -n lab-devops
kubectl get pods -n lab-devops -w   # -w acompanha em tempo real
```

Desta vez um novo Pod é criado automaticamente para repor a réplica
perdida — esse é o self-healing descrito em
[01-o-que-e-e-por-que.md](01-o-que-e-e-por-que.md). Use `Ctrl+C` para
sair do modo `-w`.

## Passo 4 — Service

```bash
kubectl apply -f lab/service/main.yaml
kubectl get service weather-api-service -n lab-devops
```

Valide: o Service aparece com `TYPE=NodePort` e uma porta no intervalo
`3xxxx` em `PORT(S)`.

**Teste de conectividade** (Rancher Desktop): o Rancher Desktop encaminha
automaticamente portas de serviços `NodePort`/`LoadBalancer` para
`localhost`, então basta descobrir a porta e acessar.

```powershell
kubectl get service weather-api-service -n lab-devops
# procure o valor depois de ":" na coluna PORT(S), ex.: 80:31234/TCP → a porta é 31234

curl.exe http://localhost:31234
```

A requisição deve chegar em um dos dois Pods do Deployment, mesmo você
não sabendo em qual.

**Experimento proposto:** rode `kubectl get pods -o wide -n lab-devops`
e repare que os dois Pods têm IPs diferentes. O Service escondeu essa
diferença atrás de um único endereço estável.

## Passo 5 — Ingress (opcional, requer Ingress Controller)

```bash
# instala o controller (uma vez só por cluster) — comando em lab/ingress/readme.md
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# aguarde o controller ficar pronto
kubectl get pods -n ingress-nginx -w

kubectl apply -f lab/ingress/main.yaml
kubectl get ingress -n lab-devops
```

Valide: o Ingress aparece com um endereço atribuído em `ADDRESS` (pode
levar alguns segundos).

## Passo 6 — CronJob

```bash
kubectl apply -f lab/cronjob/main.yaml
kubectl get cronjob
kubectl get jobs -w   # acompanhe a criação de um novo Job a cada minuto
```

Valide: a cada execução do `schedule: "*/1 * * * *"`, um novo Job e um
novo Pod aparecem, executam e terminam.

```bash
kubectl logs job/<nome-do-job-gerado>
```

Confirme que a saída contém a mensagem `Executando CronJob em <data>`.

## Passo 7 — Limpeza

```bash
kubectl delete -f lab/cronjob/main.yaml
kubectl delete -f lab/ingress/main.yaml --ignore-not-found
kubectl delete -f lab/service/main.yaml
kubectl delete -f lab/deployment/main.yaml
kubectl delete -f lab/namespace/main.yaml
```

Apagar o Namespace por último remove, em cascata, qualquer objeto que
ainda esteja dentro dele — bom hábito para deixar o cluster limpo entre
sessões de estudo.

## Checklist de fechamento (para a mentoria revisar)

- [ ] Consegue explicar a diferença entre Pod e Deployment sem consultar
      a documentação.
- [ ] Consegue explicar por que o Service usa `selector` com o mesmo
      label do Deployment.
- [ ] Reproduziu o teste de self-healing (passo 3) e entendeu o motivo
      do comportamento.
- [ ] Usou `kubectl describe` e `kubectl logs` para diagnosticar pelo
      menos um problema real (proposital ou não).
- [ ] Sabe dizer, de cabeça, a ordem de aplicação dos manifests deste lab
      e por quê.
