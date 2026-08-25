# 8. Troubleshooting — o que cada erro comum significa

O [04-comandos-kubectl.md](04-comandos-kubectl.md) ensinou **como**
investigar (`get`, `describe`, `logs`). Este capítulo ensina **o que**
cada sintoma comum significa, para você parar de adivinhar e ir direto à
causa.

Fluxo geral para qualquer Pod com problema:

```bash
kubectl get pods -n lab-devops              # 1. qual o status?
kubectl describe pod <nome> -n lab-devops   # 2. o que os Events dizem?
kubectl logs <nome> -n lab-devops           # 3. o que a aplicação loga?
```

## `Pending`

**O que significa:** o Pod foi aceito pelo `kube-apiserver`, mas o
`kube-scheduler` ainda não conseguiu (ou não consegue) colocá-lo em
nenhum Node.

**Causas comuns:**
- Nenhum Node tem CPU/memória suficiente para os `resources.requests`
  pedidos (veja o bloco `resources` em
  [lab/deployment/main.yaml](lab/deployment/main.yaml)).
- Um `PersistentVolumeClaim` referenciado ainda não foi atendido.
- Regras de afinidade/taint impedem o agendamento em qualquer Node
  disponível.

**Onde olhar:** `kubectl describe pod` — a seção `Events` normalmente
mostra `0/1 nodes are available: insufficient cpu` ou similar.

## `ImagePullBackOff` / `ErrImagePull`

**O que significa:** o `kubelet` não conseguiu baixar a imagem do
container.

**Causas comuns:**
- Nome ou tag da imagem errado (typo em `image: erickveiga/weather-api:latest`).
- Imagem privada sem `imagePullSecrets` configurado.
- Sem conexão com o registry (ex.: Docker Hub fora do ar, proxy
  corporativo bloqueando).

**Onde olhar:** `kubectl describe pod` mostra a mensagem exata de erro do
registry na seção `Events` — geralmente diz claramente "not found" (nome
errado) ou "unauthorized" (falta credencial).

## `CrashLoopBackOff`

**O que significa:** o container inicia, mas o processo termina (crasha)
logo em seguida — repetidamente. O Kubernetes tenta reiniciar, com um
backoff exponencial entre tentativas (por isso "loop").

**Causas comuns:**
- Erro de configuração que faz a aplicação encerrar no boot (ex.:
  variável de ambiente obrigatória ausente).
- Exceção não tratada no código.
- O comando/entrypoint do container está errado e termina imediatamente.

**Onde olhar:** `kubectl logs <pod>` mostra a saída do processo antes de
morrer. Se o container já reiniciou, use `kubectl logs <pod> --previous`
para ver o log da tentativa anterior (o `logs` sem essa flag mostra só a
tentativa atual, que pode estar vazia).

## `CreateContainerConfigError`

**O que significa:** o Pod não conseguiu nem começar a criar o container
porque uma referência de configuração não existe.

**Causa mais comum neste lab:** um `configMapKeyRef` ou `secretKeyRef` no
`env` do Deployment (veja
[06-configmap-e-secret.md](06-configmap-e-secret.md)) aponta para um
ConfigMap/Secret que ainda não foi criado, ou para uma `key` que não
existe dentro dele.

**Onde olhar:** `kubectl describe pod` — a mensagem costuma ser literal:
`configmap "weather-api-config" not found` ou
`couldn't find key PORT in ConfigMap lab-devops/weather-api-config`.

## `0/1` (ou `1/2`) em `READY`, mas status `Running`

**O que significa:** o container está rodando, mas **não está passando
na readiness probe** (veja [07-probes.md](07-probes.md)) — o Service não
está mandando tráfego para ele.

**Onde olhar:**

```bash
kubectl describe pod <nome> -n lab-devops   # seção Events mostra a probe falhando
kubectl logs <nome> -n lab-devops           # a aplicação subiu de fato?
```

Confirme se o caminho/porta configurados na probe (`/health`, `3000`)
realmente batem com o que a aplicação expõe.

## Service não recebe resposta / conexão recusada

Antes de suspeitar do Service, confirme na ordem:

```bash
kubectl get pods -n lab-devops -o wide           # os Pods estão Running e Ready?
kubectl get endpoints weather-api-service -n lab-devops   # o Service enxerga algum Pod?
```

Se `kubectl get endpoints` voltar vazio (`<none>`), o `selector` do
Service não está casando com nenhum label de Pod — revise
`selector.app` no Service contra `labels.app` no Deployment (veja a
explicação de labels em
[03-conceitos-principais.md](03-conceitos-principais.md)).

## Referência rápida

| Sintoma | Primeira suspeita | Comando que confirma |
|---|---|---|
| `Pending` | Falta recurso ou o Node não comporta | `kubectl describe pod` |
| `ImagePullBackOff` | Nome/tag da imagem errado ou sem credencial | `kubectl describe pod` |
| `CrashLoopBackOff` | Aplicação quebra no boot | `kubectl logs --previous` |
| `CreateContainerConfigError` | ConfigMap/Secret/key ausente | `kubectl describe pod` |
| `0/1` Ready, `Running` | Readiness probe falhando | `kubectl describe pod` + `kubectl logs` |
| Endpoints vazio no Service | `selector` não bate com os labels do Pod | `kubectl get endpoints` |

## Próximo passo

Para revisar rapidamente os termos usados neste guia e em todo o
material, veja o [09-glossario.md](09-glossario.md).
