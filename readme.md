### 创建证书

```sh
# 生成普通的key
$ cd app/cert && bash gen_cert.sh "hdac.default.svc" "*.default.svc"
```

### 部署 webhook 服务

```sh
$ kubectl apply -f dynamic-webhook-demo.yaml 
service/hdac 
createdpod/hdac created
```

### 测试

待 pod `hdac` 成功运行，执行以下操作进行测试。

先打开一个终端窗口打印 hdac 服务的日志。

```sh
$ kubectl logs hdac -f
```

打开另一个终端执行以下操作。

```sh
$ kubectl run tmp \
  --image=curlimages/curl \
  --restart=Never \
  -it \
  --rm \
  -- \
  curl \
  --insecure \
  -H 'Content-Type: application/json' \
  --request POST \
  --data '{"request": { "uid": "sample" } }' \
  https://hdac.default.svc
```

回到 hdac 日志终端，可以看见，来自 apiserver 请求以及 webhook 的响应已经正常打印出来了。如下所示：

```sh
...
{
  kind: 'AdmissionReview',
  apiVersion: 'admission.k8s.io/v1',
  request: {
    uid: 'b80658d2-603c-425d-ac1c-1ca4e6510f9d',
    kind: { group: '', version: 'v1', kind: 'Pod' },
    resource: { group: '', version: 'v1', resource: 'pods' },
    requestKind: { group: '', version: 'v1', kind: 'Pod' },
    requestResource: { group: '', version: 'v1', resource: 'pods' },
    name: 'tmp',
    namespace: 'default',
    operation: 'CREATE',
    userInfo: {
      username: 'kubernetes-admin',
      uid: 'aws-iam-authenticator:<MY AWS ACCOUNT>:AIDA24MUOIABWETASH6F5',
      groups: [Array],
      extra: [Object]
    },
    object: {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: [Object],
      spec: [Object],
      status: [Object]
    },
    oldObject: null,
    dryRun: false,
    options: {
      kind: 'CreateOptions',
      apiVersion: 'meta.k8s.io/v1',
      fieldManager: 'kubectl-run'
    }
  }
}
{
  kind: 'AdmissionReview',
  apiVersion: 'admission.k8s.io/v1',
  request: {
    uid: 'b80658d2-603c-425d-ac1c-1ca4e6510f9d',
    kind: { group: '', version: 'v1', kind: 'Pod' },
    resource: { group: '', version: 'v1', resource: 'pods' },
    requestKind: { group: '', version: 'v1', kind: 'Pod' },
    requestResource: { group: '', version: 'v1', resource: 'pods' },
    name: 'tmp',
    namespace: 'default',
    operation: 'CREATE',
    userInfo: {
      username: 'kubernetes-admin',
      uid: 'aws-iam-authenticator:<MY AWS ACCOUNT>:AIDA24MUOIABWETASH6F5',
      groups: [Array],
      extra: [Object]
    },
    object: {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: [Object],
      spec: [Object],
      status: [Object]
    },
    oldObject: null,
    dryRun: false,
    options: {
      kind: 'CreateOptions',
      apiVersion: 'meta.k8s.io/v1',
      fieldManager: 'kubectl-run'
    }
  }
}
...
```

### 将证书 base64 编码

```sh
$ cd app/cert && cat ca.crt | base64 --wrap=0
```

将以上输出结果添加到 `validating-webhook-configuration.yaml` 的 `caBundle`。

### 创建 ValidatingWebhookConfiguration

```sh
$ kubectl apply -f validating-webhook-configuration.yaml
validatingwebhookconfiguration.admissionregistration.k8s.io/pod-policy.example.com created
```

### 创建测试的 pod

```sh
$ kubectl apply -f hello-pod.yaml
```

同样可以看到 webhook 服务打印出请求与响应。

## 附录

- [实战Kubernetes动态准入控制webhook](https://www.modb.pro/db/144562)
- [GO 1.15 生成 SAN 证书](https://www.cnblogs.com/jackluo/p/13841286.html)