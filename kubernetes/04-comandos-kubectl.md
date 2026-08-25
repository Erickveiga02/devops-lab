# 4. Comandos essenciais do kubectl

`kubectl` é a CLI que fala com o `kube-apiserver` (veja
[02-arquitetura.md](02-arquitetura.md)). Todo comando abaixo pode receber
`-n lab-devops` para operar dentro do namespace deste lab, ou
`--all-namespaces` (`-A`) para ver tudo no cluster.

## Aplicar e remover manifests

```bash
# Cria ou atualiza os objetos descritos no arquivo
kubectl apply -f lab/namespace/main.yaml

# Aplica todos os .yaml de um diretório de uma vez
kubectl apply -f lab/deployment/

# Remove os objetos descritos no arquivo
kubectl delete -f lab/pod/main.yaml
```

`apply` é o comando do dia a dia: ele cria o objeto se não existir e
atualiza se já existir, sem precisar apagar antes.

## Visualizar o estado do cluster

```bash
kubectl get nodes                       # lista as máquinas do cluster
kubectl get namespaces                  # lista os namespaces
kubectl get pods -n lab-devops          # lista os Pods do namespace
kubectl get deployments -n lab-devops
kubectl get services -n lab-devops
kubectl get all -n lab-devops           # tudo de uma vez
kubectl get pods -o wide -n lab-devops  # inclui IP e Node de cada Pod
```

## Investigar um problema (o fluxo mais usado no dia a dia)

Quando um Pod não sobe ou uma aplicação não responde, esta é a sequência
recomendada:

```bash
# 1. O Pod existe? Qual o status? (Pending, CrashLoopBackOff, Running...)
kubectl get pods -n lab-devops

# 2. Por que ele está nesse status? Mostra eventos, imagem, causa do erro
kubectl describe pod weather-api-pod -n lab-devops

# 3. O que a aplicação dentro do container está dizendo?
kubectl logs weather-api-pod -n lab-devops

# 4. Se o Pod tem mais de um container, é preciso especificar qual
kubectl logs weather-api-pod -c nome-do-container -n lab-devops

# 5. Logs em tempo real (equivalente ao tail -f)
kubectl logs -f weather-api-pod -n lab-devops
```

`describe` é o comando mais subestimado por quem está começando: a seção
`Events` no final da saída quase sempre explica a causa raiz (imagem não
encontrada, falta de recursos, falha de probe, etc.).

## Entrar dentro de um container

```bash
kubectl exec -it weather-api-pod -n lab-devops -- sh
```

Útil para inspecionar arquivos, variáveis de ambiente ou testar
conectividade de dentro do próprio container.

## Editar e escalar rapidamente (sem reaplicar o YAML)

```bash
# Muda o número de réplicas na hora
kubectl scale deployment weather-api-deployment --replicas=3 -n lab-devops

# Abre o objeto no editor padrão para alteração pontual
kubectl edit deployment weather-api-deployment -n lab-devops
```

Estes dois comandos alteram o cluster **sem alterar o arquivo YAML** —
por isso são bons para testes rápidos, mas o YAML no repositório deve ser
atualizado depois para não divergir do que está rodando de fato.

## Referência rápida

| Comando | Para que serve |
|---|---|
| `kubectl apply -f <arquivo/pasta>` | Cria/atualiza objetos a partir de um YAML |
| `kubectl get <recurso>` | Lista objetos e seu status resumido |
| `kubectl describe <recurso> <nome>` | Detalhes e eventos — primeiro passo ao investigar erro |
| `kubectl logs <pod>` | Saída (stdout/stderr) do container |
| `kubectl exec -it <pod> -- sh` | Abre um shell dentro do container |
| `kubectl delete -f <arquivo>` | Remove os objetos descritos no arquivo |
| `kubectl scale deployment <nome> --replicas=N` | Muda o número de réplicas na hora |

## Próximo passo

Com esses comandos em mãos, aplique o roteiro prático:
[05-roteiro-pratico.md](05-roteiro-pratico.md).
