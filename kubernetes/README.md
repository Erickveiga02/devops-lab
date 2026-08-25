# Introdução ao Kubernetes

Material de apoio criado para a mentoria de DevOps, a partir dos pontos de
falha identificados na matriz de conhecimento: base teórica de Kubernetes
ainda não consolidada. O objetivo aqui é fechar essa lacuna **antes** de
voltar para os manifests que já existem em [lab/](lab/)
(`lab/namespace/`, `lab/pod/`, `lab/deployment/`, `lab/service/`,
`lab/ingress/`, `lab/cronjob/`), para que cada `main.yaml` passe a fazer
sentido em vez de ser copiado sem entender o porquê.

## Como usar este material

Siga a ordem abaixo. Cada arquivo assume o conteúdo do anterior:

1. [01-o-que-e-e-por-que.md](01-o-que-e-e-por-que.md) — o problema que o
   Kubernetes resolve e por que ele existe.
2. [02-arquitetura.md](02-arquitetura.md) — como um cluster é montado por
   dentro (Control Plane x Worker Nodes).
3. [03-conceitos-principais.md](03-conceitos-principais.md) — os objetos que
   você já usa no lab: Namespace, Pod, Deployment, Service, Ingress, CronJob.
4. [04-comandos-kubectl.md](04-comandos-kubectl.md) — o mínimo de `kubectl`
   para investigar e depurar o cluster no dia a dia.
5. [05-roteiro-pratico.md](05-roteiro-pratico.md) — o passo a passo para
   aplicar os manifests deste repositório na ordem certa e validar cada
   etapa.

## Pré-requisitos

Nenhuma nuvem é necessária para este material — tudo roda localmente no
Windows com as ferramentas abaixo.

### 1. Rancher Desktop (Docker + cluster Kubernetes local)

O [Rancher Desktop](https://rancherdesktop.io/) substitui a necessidade de
instalar Docker Desktop e Minikube/Kind separados: ele já sobe um cluster
Kubernetes local de um clique.

1. Baixe o instalador em <https://rancherdesktop.io/> e rode o `.msi`.
   No primeiro uso ele pode pedir para habilitar o **WSL2** — aceite,
   é pré-requisito do Windows para containers Linux.
2. Abra o Rancher Desktop e vá em **Preferences → Kubernetes**.
3. Marque **Enable Kubernetes** e escolha uma versão estável (ex.: a
   mais recente marcada como `stable`).
4. Em **Container Engine**, deixe `containerd` (ou `dockerd (moby)` se
   quiser usar comandos `docker` diretamente) — qualquer um dos dois
   funciona para os exemplos deste lab.
5. Clique em **Apply** e aguarde o ícone do Kubernetes, no canto
   inferior esquerdo da janela, ficar verde. Isso indica que o cluster
   local já está no ar.

Valide no terminal:

```powershell
kubectl cluster-info
kubectl get nodes
```

Se aparecer um Node com status `Ready`, o cluster está pronto para os
próximos passos.

### 2. kubectl no Windows

O Rancher Desktop já instala o `kubectl` e configura o `kubeconfig`
automaticamente (contexto `rancher-desktop`), então normalmente nenhum
passo extra é necessário. Confirme com:

```powershell
kubectl version --client
kubectl config current-context
```

Se o comando `kubectl` não for reconhecido, instale manualmente por uma
destas opções:

**Opção A — winget (recomendado):**

```powershell
winget install -e --id Kubernetes.kubectl
```

**Opção B — Chocolatey:**

```powershell
choco install kubernetes-cli
```

**Opção C — download manual do binário:**

```powershell
curl.exe -LO "https://dl.k8s.io/release/v1.30.0/bin/windows/amd64/kubectl.exe"
```

Depois mova `kubectl.exe` para uma pasta incluída no `PATH` (ex.:
`C:\Windows\System32` ou uma pasta própria adicionada às variáveis de
ambiente).

Em qualquer opção, confirme a instalação e o contexto apontando para o
Rancher Desktop:

```powershell
kubectl version --client
kubectl config get-contexts
kubectl config use-context rancher-desktop
```

## Objetivo de aprendizagem

Ao final deste material, o mentorado deve ser capaz de:

- Explicar, com as próprias palavras, o que é um Pod, um Deployment, um
  Service e um Namespace, e por que eles são objetos separados.
- Ler um `main.yaml` deste lab e dizer o que ele cria no cluster antes de
  aplicá-lo.
- Usar `kubectl get`, `kubectl describe` e `kubectl logs` para diagnosticar
  por que um Pod não subiu.
- Aplicar, na ordem correta, todos os manifests de `kubernetes/lab/` e
  explicar a dependência entre eles (por que o Namespace vem antes do Pod,
  por que o Service depende do label do Deployment, etc.).
