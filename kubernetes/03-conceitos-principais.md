# 3. Conceitos principais (com os exemplos deste lab)

Cada seção abaixo referencia o `main.yaml` real que já existe neste
repositório, para você ler a explicação e o exemplo lado a lado.

## Namespace — [lab/namespace/main.yaml](lab/namespace/main.yaml)

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: lab-devops
```

Um Namespace é uma **divisão lógica** dentro do mesmo cluster físico —
como pastas dentro de um HD. Ele serve para separar ambientes (`dev`,
`staging`, `prod`) ou times, sem precisar de um cluster inteiro para cada
um. Repare que todos os outros manifests deste lab (`pod`, `deployment`,
`service`) declaram `namespace: lab-devops` — ou seja, todos vivem dentro
dessa "pasta". **Este é sempre o primeiro objeto a ser criado**: se o
namespace não existir, os demais falham.

## Pod — [lab/pod/main.yaml](lab/pod/main.yaml)

O Pod é a **menor unidade que o Kubernetes agenda e executa**. Um Pod
contém um ou mais containers que sempre rodam juntos, na mesma máquina,
compartilhando rede e armazenamento — você nunca agenda um container
diretamente, sempre um Pod.

Ponto de atenção importante para quem está começando: **um Pod criado
sozinho, como neste arquivo, não se auto-recupera.** Se o container cair
ou o Node morrer, ninguém recria esse Pod — ele é efêmero por natureza.
É exatamente esse limite que o Deployment resolve a seguir.

## Deployment — [lab/deployment/main.yaml](lab/deployment/main.yaml)

O Deployment é uma camada acima do Pod: você declara **quantas réplicas**
quer (`replicas: 2`) e um modelo (`template`) de como cada Pod deve ser.
A partir daí, o Deployment garante continuamente que aquele número de
réplicas exista, recriando Pods que morrerem e permitindo atualizações
graduais (rolling update) quando a imagem mudar.

Repare no `selector.matchLabels` e no `template.metadata.labels`: os dois
usam `app: weather-api`. É assim que o Deployment sabe **quais Pods são
"dele"** — por correspondência de labels, não por nome. Esse mesmo label
é o que o Service (próximo item) usa para achar esses Pods.

Na prática: **quase sempre você usa Deployment em vez de Pod solto** —
o Pod isolado deste lab existe só para fins didáticos, para você entender
a unidade básica antes de ver a camada que a gerencia.

## Service — [lab/service/main.yaml](lab/service/main.yaml)

Os Pods são efêmeros: quando um Pod morre e é recriado pelo Deployment,
ele ganha um **IP novo**. Isso quebraria qualquer cliente que tentasse
falar direto com o IP de um Pod.

O Service resolve isso: ele cria um **endereço estável** (nome DNS + IP
fixo dentro do cluster) que aponta para o conjunto de Pods que casam com
`selector: app: weather-api` — o mesmo label do Deployment. O tráfego que
chega no Service é distribuído entre todos os Pods correspondentes.

O manifest deste lab usa `type: NodePort` (expõe a porta em todos os
Nodes do cluster — bom para testes locais). Outros tipos comuns:

- `ClusterIP` (padrão): só acessível de dentro do cluster.
- `NodePort`: acessível de fora pela porta do próprio Node.
- `LoadBalancer`: pede um balanceador externo ao provedor de nuvem.

## Ingress — [lab/ingress/main.yaml](lab/ingress/main.yaml)

Se você tem várias aplicações e quer expor todas por HTTP/HTTPS com
domínios e caminhos diferentes (`api.exemplo.com`, `exemplo.com/app2`),
criar um `LoadBalancer` para cada Service fica caro e redundante.

O Ingress resolve isso com uma camada de roteamento HTTP única: ele lê
regras (domínio + path) e direciona cada requisição para o Service
correto. Para o Ingress funcionar, é preciso ter um **Ingress Controller**
instalado no cluster — por isso o [lab/ingress/readme.md](lab/ingress/readme.md)
deste lab traz o comando de instalação do NGINX Ingress Controller antes
de aplicar as regras.

## CronJob — [lab/cronjob/main.yaml](lab/cronjob/main.yaml)

Para tarefas que devem rodar em um horário ou intervalo definido (backup,
relatório, limpeza de dados), o CronJob cria um Pod temporário seguindo a
mesma sintaxe cron do Linux (`schedule: "*/1 * * * *"` = todo minuto). Ao
terminar, o Pod não fica rodando — ele executa a tarefa e finaliza, e o
CronJob cria um novo na próxima execução agendada.

## Resumo das relações entre os objetos

```
Namespace (lab-devops)
   └── Deployment (weather-api-deployment)
          └── gerencia N réplicas de → Pod (label: app=weather-api)
                                            ▲
Service (weather-api-service) ──── selector: app=weather-api
   ▲
Ingress ──── roteia domínio/path para → Service

CronJob ──── independente, cria seus próprios Pods sob demanda
```

## Próximo passo

Para inspecionar e depurar esses objetos no dia a dia, veja
[04-comandos-kubectl.md](04-comandos-kubectl.md).
