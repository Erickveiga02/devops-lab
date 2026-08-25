# 2. Arquitetura de um cluster Kubernetes

Um **cluster** Kubernetes é um conjunto de máquinas (físicas ou virtuais)
chamadas **Nodes**, divididas em dois papéis:

```
                     ┌─────────────────────────────┐
                     │        CONTROL PLANE         │
                     │  (o "cérebro" do cluster)     │
                     │                               │
                     │  kube-apiserver               │
                     │  etcd                         │
                     │  kube-scheduler                │
                     │  kube-controller-manager       │
                     └───────────────┬───────────────┘
                                     │
                     ┌───────────────┼───────────────┐
                     │               │               │
              ┌──────▼─────┐  ┌──────▼─────┐  ┌──────▼─────┐
              │   NODE 1   │  │   NODE 2   │  │   NODE 3   │
              │            │  │            │  │            │
              │  kubelet   │  │  kubelet   │  │  kubelet   │
              │  kube-proxy│  │  kube-proxy│  │  kube-proxy│
              │  runtime   │  │  runtime   │  │  runtime   │
              │  (Docker/  │  │  (Docker/  │  │  (Docker/  │
              │ containerd)│  │ containerd)│  │ containerd)│
              │            │  │            │  │            │
              │  [Pod] [Pod]  │ [Pod]      │  │ [Pod] [Pod] │
              └────────────┘  └────────────┘  └────────────┘
```

Em um cluster local de estudo (Rancher Desktop), Control Plane e Worker Node
costumam rodar na mesma máquina — mas os papéis lógicos abaixo continuam
existindo e valem para qualquer cluster, inclusive os de produção em nuvem.

## Control Plane — quem decide

O Control Plane não roda a aplicação; ele **administra** o cluster.

- **kube-apiserver**: a porta de entrada de tudo. Todo comando que você
  digita no `kubectl` conversa com o API Server via HTTP/REST. Nada no
  cluster acontece sem passar por ele.
- **etcd**: o banco de dados (chave-valor) onde o estado *desejado* e o
  estado *atual* do cluster ficam armazenados. É a "fonte da verdade" —
  se o etcd for perdido, o cluster perde a memória do que deveria existir.
- **kube-scheduler**: decide **em qual Node** cada novo Pod deve rodar,
  com base em recursos disponíveis (CPU, memória), afinidades e restrições.
- **kube-controller-manager**: roda os *loops de controle* que fazem a
  promessa "declarativo" ser cumprida. Exemplo: o controller do Deployment
  verifica sem parar "tenho 2 réplicas rodando como pedido?" e, se um Pod
  cair, ele pede um novo Pod para repor a diferença.

## Worker Nodes — quem executa

Cada Node é uma máquina que efetivamente roda os containers:

- **kubelet**: o agente que roda em cada Node e conversa com o Control
  Plane. Ele recebe a ordem "rode este Pod aqui" e garante que os
  containers descritos nele estejam de fato rodando, chamando o runtime.
- **kube-proxy**: mantém as regras de rede que permitem que um Service
  encontre e balanceie tráfego entre os Pods certos, mesmo quando os Pods
  mudam de IP.
- **Container runtime** (containerd, CRI-O, ou Docker por trás de um
  shim): o componente que efetivamente baixa a imagem e inicia o
  container, exatamente como o Docker faz localmente.

## O ciclo completo, na prática

Quando você roda `kubectl apply -f lab/pod/main.yaml` (o Pod deste lab),
acontece isto:

1. O `kubectl` envia o conteúdo do YAML para o **kube-apiserver**.
2. O API Server valida e grava esse estado desejado no **etcd**.
3. O **kube-scheduler** percebe que existe um Pod novo sem Node atribuído
   e escolhe um Node disponível.
4. O **kubelet** daquele Node é notificado, puxa a imagem
   (`erickveiga/weather-api:latest`) e pede ao **container runtime** para
   iniciar o container.
5. O **kubelet** reporta continuamente ao Control Plane que o Pod está
   `Running` — e se o container cair, é o kubelet quem detecta e o
   controller-manager quem decide se deve ser recriado.

Todo esse fluxo acontece para qualquer objeto (Pod, Deployment, Service
etc.) — muda apenas o que é criado no fim da cadeia.

## Próximo passo

Com a arquitetura clara, o próximo arquivo detalha os objetos que você
declara nos YAMLs: [03-conceitos-principais.md](03-conceitos-principais.md).
