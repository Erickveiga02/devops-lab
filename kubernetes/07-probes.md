# 7. Probes — como o Kubernetes sabe se a aplicação está saudável

## O problema

Sem nenhuma configuração extra, o Kubernetes só sabe uma coisa sobre um
container: **o processo dele ainda está rodando** (o processo PID 1 não
morreu). Isso não é suficiente para saber se a aplicação está de fato
funcionando. Exemplos reais que já aconteceram na `weather-api`:

- O processo Node.js está vivo, mas travou em um loop infinito e não
  responde mais a nenhuma requisição HTTP.
- O container acabou de iniciar e ainda está conectando a dependências —
  se o Service mandar tráfego agora, a requisição falha.
- A aplicação perdeu conexão com uma dependência externa e nunca mais vai
  se recuperar sozinha, mas o processo continua de pé.

Nos três casos, `kubectl get pods` mostraria `Running` — mesmo com a
aplicação inutilizável. É para isso que servem as **probes**.

## Os dois tipos que importam para começar

### readinessProbe — "posso receber tráfego agora?"

Controla se o Pod entra ou sai da lista de endereços que o **Service**
usa para balancear tráfego (veja
[03-conceitos-principais.md](03-conceitos-principais.md#service--labpodserviceyaml)).
Se a readiness probe falhar, o Pod continua rodando, mas o Service
simplesmente **para de mandar tráfego para ele** até voltar a responder.

### livenessProbe — "esse container precisa ser reiniciado?"

Se a liveness probe falhar repetidamente, o **kubelet mata e reinicia o
container** — a suposição é de que ele travou de um jeito do qual não vai
se recuperar sozinho.

## O exemplo deste lab

A API já expõe um endpoint feito para isso:
[lab/api/index.js](lab/api/index.js), rota `/health`:

```js
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});
```

E [lab/deployment/main.yaml](lab/deployment/main.yaml) declara as duas
probes apontando para essa rota:

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 20
  failureThreshold: 3
```

Explicando cada campo:

| Campo | Significado |
|---|---|
| `httpGet.path` / `httpGet.port` | Faz uma requisição HTTP GET; considera sucesso se a resposta for `2xx` ou `3xx` |
| `initialDelaySeconds` | Quanto tempo esperar após o container iniciar antes da primeira checagem (evita falso-negativo durante o boot) |
| `periodSeconds` | Intervalo entre uma checagem e outra |
| `failureThreshold` | Quantas falhas seguidas até considerar a probe reprovada (padrão é 3 se omitido) |

## Vendo isso funcionar

Aplique o Deployment atualizado e observe a coluna `READY`:

```bash
kubectl apply -f lab/deployment/main.yaml
kubectl get pods -n lab-devops
```

Logo após a criação, o Pod aparece como `0/1` em `READY` — ele está
`Running`, mas ainda não passou na primeira readiness probe
(`initialDelaySeconds: 5`). Depois de alguns segundos, muda para `1/1`.

**Experimento proposto:** simule uma aplicação travada removendo
temporariamente a rota `/health` (ou apontando a probe para um caminho
que não existe, ex. `path: /nao-existe`) e reaplique o Deployment.
Observe:

```bash
kubectl describe pod <nome-do-pod> -n lab-devops
```

A seção `Events` mostra a probe falhando, o Pod some da lista de
endpoints do Service (`kubectl get endpoints weather-api-service -n lab-devops`),
e — se for a liveness que estiver falhando — o container é reiniciado
(`RESTARTS` sobe em `kubectl get pods`). Desfaça a alteração depois do
teste.

## Por que isso importa tanto quanto Deployment/Service

Um Deployment sem probes garante *quantidade* de réplicas (`replicas: 2`)
mas não garante *qualidade* — ele pode manter 2 Pods "rodando" mesmo que
nenhum deles esteja realmente respondendo. Probes são o que fecha esse
buraco: são o motivo pelo qual, em produção, um rolling update não manda
tráfego para uma versão nova que ainda não terminou de subir.

## Próximo passo

Com ConfigMap, Secret e probes, a Deployment deste lab já reflete boas
práticas comuns de produção. O próximo arquivo ensina a diagnosticar
quando algo dá errado nesse processo:
[08-troubleshooting.md](08-troubleshooting.md).
