# 6. ConfigMap e Secret — tirando configuração do YAML

## O problema

Olhe a versão original de [lab/deployment/main.yaml](lab/deployment/main.yaml)
usada nos capítulos anteriores:

```yaml
env:
  - name: OPENWEATHER_API_KEY
    value: "SUA_API_KEY_AQUI"
```

Isso funciona, mas tem dois problemas:

1. **A chave da API fica em texto plano dentro do YAML**, versionado no
   Git junto com o resto do código — qualquer pessoa com acesso ao
   repositório vê a credencial.
2. **Configuração e definição do Pod ficam misturadas.** Se amanhã você
   tiver 3 ambientes (dev/staging/prod), cada um com uma porta ou chave
   diferente, você teria que duplicar o Deployment inteiro só para trocar
   um valor.

O Kubernetes separa isso em dois objetos: **ConfigMap** para configuração
não sensível e **Secret** para dado sensível.

## ConfigMap — [lab/configmap/main.yaml](lab/configmap/main.yaml)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: weather-api-config
  namespace: lab-devops
data:
  PORT: "3000"
```

Um ConfigMap guarda pares chave/valor de configuração comum — nada que
precise de sigilo (porta, URL de outro serviço, nível de log, feature
flag). Fica visível em texto plano mesmo, porque não há necessidade de
esconder.

## Secret — [lab/secret/main.yaml](lab/secret/main.yaml)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: weather-api-secret
  namespace: lab-devops
type: Opaque
stringData:
  OPENWEATHER_API_KEY: "SUA_API_KEY_AQUI"
```

Estruturalmente, um Secret é quase idêntico a um ConfigMap — a diferença
está em como o Kubernetes trata o valor:

> **Atenção, ponto que confunde muita gente iniciando:** o Kubernetes
> guarda o conteúdo de um Secret em **Base64**, não criptografado. Base64
> é apenas uma codificação, reversível em um comando (`echo <valor> | base64 -d`).
> Um Secret **não substitui um cofre de segredos** (Vault, AWS Secrets
> Manager, etc.) — ele só evita que a credencial fique em texto plano
> dentro do próprio manifest, e permite aplicar controle de acesso (RBAC)
> separado do resto da aplicação.

Confirme isso na prática depois de aplicar o Secret:

```bash
kubectl get secret weather-api-secret -n lab-devops -o yaml
```

Repare que o valor aparece codificado, não como `SUA_API_KEY_AQUI`.

## Consumindo os dois no Deployment

Em vez de `value:` fixo, [lab/deployment/main.yaml](lab/deployment/main.yaml)
agora referencia as chaves com `valueFrom`:

```yaml
env:
  - name: PORT
    valueFrom:
      configMapKeyRef:
        name: weather-api-config
        key: PORT
  - name: OPENWEATHER_API_KEY
    valueFrom:
      secretKeyRef:
        name: weather-api-secret
        key: OPENWEATHER_API_KEY
```

O container recebe as mesmas variáveis de ambiente de antes
(`PORT`, `OPENWEATHER_API_KEY`) — a aplicação (`lab/api/index.js`) não
muda uma linha. Só mudou **de onde** o valor vem.

## Ordem de aplicação (importa!)

Como o Deployment agora depende desses dois objetos existirem, a ordem
correta passa a ser:

```bash
kubectl apply -f lab/namespace/main.yaml
kubectl apply -f lab/configmap/main.yaml
kubectl apply -f lab/secret/main.yaml
kubectl apply -f lab/deployment/main.yaml
```

**Experimento proposto:** aplique o Deployment **antes** do ConfigMap e do
Secret (fora de ordem, de propósito) e rode:

```bash
kubectl get pods -n lab-devops
kubectl describe pod <nome-do-pod> -n lab-devops
```

Você deve ver o Pod preso em `CreateContainerConfigError`, e a seção
`Events` do `describe` vai dizer explicitamente que o ConfigMap ou o
Secret não foi encontrado. Esse é exatamente o tipo de erro coberto em
[08-troubleshooting.md](08-troubleshooting.md).

## Quando usar cada um

| Situação | Objeto |
|---|---|
| Porta, URL, timeout, feature flag | ConfigMap |
| Senha, token, chave de API, certificado | Secret |
| Arquivo de configuração inteiro (ex.: `application.yaml`) montado como volume | ConfigMap (ou Secret, se tiver dado sensível dentro) |

## Próximo passo

Config resolvida — falta o Kubernetes saber se a aplicação está de fato
saudável. Isso é o assunto de [07-probes.md](07-probes.md).
