# 9. Glossário

Referência rápida dos termos usados neste material. Cada um linka para o
capítulo onde é explicado em detalhe.

| Termo | Definição curta | Detalhes em |
|---|---|---|
| **Cluster** | Conjunto de máquinas (Nodes) gerenciadas como uma unidade pelo Kubernetes | [02](02-arquitetura.md) |
| **Node** | Uma máquina (física ou virtual) que faz parte do cluster | [02](02-arquitetura.md) |
| **Control Plane** | Os componentes que administram o cluster (API Server, etcd, Scheduler, Controller Manager) | [02](02-arquitetura.md) |
| **kube-apiserver** | Porta de entrada de todo comando/mudança no cluster; tudo passa por ele | [02](02-arquitetura.md) |
| **etcd** | Banco de dados chave-valor onde o estado do cluster é armazenado | [02](02-arquitetura.md) |
| **kube-scheduler** | Decide em qual Node cada novo Pod deve rodar | [02](02-arquitetura.md) |
| **kube-controller-manager** | Roda os loops de controle que mantêm o estado real igual ao estado desejado | [02](02-arquitetura.md) |
| **kubelet** | Agente em cada Node que garante que os containers descritos estejam rodando | [02](02-arquitetura.md) |
| **kube-proxy** | Mantém as regras de rede que permitem o Service encontrar os Pods certos | [02](02-arquitetura.md) |
| **Namespace** | Divisão lógica dentro do mesmo cluster físico, para isolar ambientes/times | [03](03-conceitos-principais.md) |
| **Pod** | Menor unidade agendável do Kubernetes; um ou mais containers rodando juntos | [03](03-conceitos-principais.md) |
| **Deployment** | Declara réplicas de um Pod e garante que esse número sempre exista (self-healing, rolling update) | [03](03-conceitos-principais.md) |
| **Service** | Endereço estável que balanceia tráfego entre os Pods que casam com seu `selector` | [03](03-conceitos-principais.md) |
| **Ingress** | Roteador HTTP/HTTPS externo que direciona por domínio/path até o Service correto | [03](03-conceitos-principais.md) |
| **CronJob** | Cria Pods temporários em um horário/intervalo definido por sintaxe cron | [03](03-conceitos-principais.md) |
| **Label** | Par chave/valor anexado a um objeto (ex.: `app: weather-api`), usado por `selector` para agrupar objetos | [03](03-conceitos-principais.md) |
| **Selector** | Filtro por labels que um Deployment/Service usa para saber quais Pods são "dele" | [03](03-conceitos-principais.md) |
| **kubectl** | CLI que conversa com o `kube-apiserver` para consultar e alterar o cluster | [04](04-comandos-kubectl.md) |
| **ConfigMap** | Objeto que guarda configuração não sensível (porta, URL, flag) fora do Pod | [06](06-configmap-e-secret.md) |
| **Secret** | Como o ConfigMap, mas para dado sensível (senha, token); guardado em Base64, não criptografado | [06](06-configmap-e-secret.md) |
| **readinessProbe** | Checagem que decide se o Pod deve receber tráfego do Service agora | [07](07-probes.md) |
| **livenessProbe** | Checagem que decide se o container precisa ser reiniciado | [07](07-probes.md) |
| **Rolling update** | Estratégia do Deployment de trocar Pods aos poucos ao atualizar a imagem, sem downtime | [01](01-o-que-e-e-por-que.md) |
| **Self-healing** | Capacidade do Kubernetes de recriar automaticamente um Pod que morreu | [01](01-o-que-e-e-por-que.md), [05](05-roteiro-pratico.md) |
| **Modelo declarativo** | Você descreve o estado desejado; o Kubernetes se encarrega de alcançá-lo e mantê-lo | [01](01-o-que-e-e-por-que.md) |

## Próximo passo

Chegou a hora de validar o que ficou: veja
[10-avaliacao-final.md](10-avaliacao-final.md).
