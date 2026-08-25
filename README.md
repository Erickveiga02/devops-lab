# DevOps Lab

Repositório de apoio à mentoria de DevOps. Aqui ficam o material teórico e
os laboratórios práticos usados para fechar, um por um, os pontos de
falha identificados na matriz de conhecimento do mentorado.

## Objetivo

Cada tópico de DevOps vira uma pasta própria na raiz deste repositório,
contendo:

- **Documentação introdutória** (`README.md` + arquivos numerados) — teoria
  explicada do zero, assumindo que o mentorado não tem conhecimento prévio
  no assunto.
- **Uma pasta `kubernetes/lab/`** — os exercícios práticos (manifests, código,
  configuração) que colocam a teoria em prática, sempre referenciados
  diretamente pela documentação.

Essa separação existe de propósito: primeiro entender o conceito, depois
aplicar no laboratório — nunca copiar um exemplo sem saber o porquê.

## Tópicos disponíveis

| Pasta | Assunto | Status |
|---|---|---|
| [kubernetes/](kubernetes/) | Introdução ao Kubernetes: conceitos, arquitetura, kubectl e um lab prático com Namespace, Pod, Deployment, Service, Ingress e CronJob | Em andamento |

Novos tópicos (Docker, CI/CD, Terraform, observabilidade, etc.) serão
adicionados aqui conforme a matriz de conhecimento apontar a necessidade.

## Como navegar

Entre na pasta do tópico que estiver estudando e comece pelo `README.md`
dela — cada um traz seu próprio roteiro de leitura e pré-requisitos. Por
exemplo, para Kubernetes: [kubernetes/README.md](kubernetes/README.md).
