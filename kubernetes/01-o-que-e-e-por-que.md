# 1. O que é Kubernetes e por que ele existe

## O problema antes do Kubernetes

Imagine a aplicação `weather-api` que já existe neste lab
([lab/api/index.js](lab/api/index.js)) rodando em produção como um
container Docker solto em uma VM. Perguntas que aparecem rapidamente:

- O container morreu às 3h da manhã. Quem sobe ele de novo?
- O tráfego dobrou. Como eu coloco uma segunda cópia rodando e distribuo as
  requisições entre elas?
- Preciso trocar a versão da imagem sem tirar a API do ar.
- Tenho 3 VMs. Em qual delas eu deveria colocar cada container para não
  sobrecarregar nenhuma?
- Um serviço precisa achar o endereço de outro serviço, mas os IPs dos
  containers mudam toda vez que eles reiniciam.

Resolver cada um desses pontos manualmente (com scripts, cron, load
balancer configurado à mão) funciona por um tempo, mas não escala e é
frágil: depende de alguém lembrar de rodar o script certo na hora certa.

## O que o Kubernetes é

Kubernetes (abreviado **K8s**) é um **orquestrador de containers**: um
sistema que recebe uma descrição do estado desejado ("eu quero 2 réplicas
desta imagem, expostas na porta 80") e se responsabiliza por manter a
realidade do cluster igual a essa descrição, o tempo todo, de forma
automática.

Esse é o conceito mais importante do Kubernetes e vale repetir:

> Você não diz *como* fazer, você diz *o que* quer. O Kubernetes se
> encarrega de chegar lá e de manter esse estado — inclusive quando algo
> falha.

Isso é chamado de **modelo declarativo**, e é exatamente o que cada
`main.yaml` deste lab representa: uma declaração de estado desejado, não um
script de passos.

## O que o Kubernetes resolve, na prática

| Problema manual | Solução do Kubernetes |
|---|---|
| Container caiu, preciso subir de novo | **Self-healing**: o Kubernetes detecta e recria o Pod automaticamente |
| Preciso de mais de uma cópia da aplicação | **Réplicas**: declaradas no Deployment (`replicas: 2`) |
| Distribuir tráfego entre as cópias | **Service**: expõe um endereço estável que balanceia entre os Pods |
| Expor a aplicação para fora do cluster com um domínio | **Ingress**: roteia HTTP/HTTPS externo para o Service certo |
| Rodar uma tarefa periódica (ex.: um relatório diário) | **CronJob**: agenda execuções com sintaxe cron |
| Separar ambientes/times dentro do mesmo cluster | **Namespace**: isola recursos por nome lógico |
| Decidir em qual máquina cada container roda | **Scheduler**: escolhe o Node com base em recursos disponíveis |
| Atualizar a aplicação sem downtime | **Rolling update**: o Deployment troca os Pods aos poucos |

Cada linha da direita é um objeto do Kubernetes que você já tem um exemplo
pronto dentro de [lab/](lab/) (`lab/namespace/`, `lab/deployment/`,
`lab/service/`, `lab/ingress/`, `lab/cronjob/`). O restante deste material
explica o que cada um desses objetos é e como eles se conectam.

## Containers vs. Kubernetes: onde cada um entra

É comum confundir os dois papéis:

- **Docker** (ou outro *container runtime*) empacota e executa **um**
  container isoladamente. Ele não sabe nada sobre outros containers, sobre
  réplicas ou sobre balanceamento de carga.
- **Kubernetes** não substitui o Docker — ele **orquestra** vários
  containers, em várias máquinas, tratando o conjunto como um sistema
  único.

Pense em Docker como "rodar um contêiner" e Kubernetes como "gerenciar uma
frota de contêineres, em várias máquinas, o tempo todo".

## Próximo passo

Agora que está claro *por que* o Kubernetes existe, o próximo arquivo
mostra *como* ele é montado por dentro:
[02-arquitetura.md](02-arquitetura.md).
