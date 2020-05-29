# DingTalk Robot (自定义钉钉机器人)

[![pipeline status](http://gitlab.eainc.com/ife/dingtalk-robot/badges/master/pipeline.svg)](http://gitlab.eainc.com/ife/dingtalk-robot/commits/master) [![coverage report](http://gitlab.eainc.com/ife/dingtalk-robot/badges/master/coverage.svg)](http://gitlab.eainc.com/ife/dingtalk-robot/commits/master)

本项目对钉钉群智能助手-自定义机器人的 webhook API 进行了 Deno 封装

官方文档地址: [https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq](https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq)

## 安装



## 使用


## 开发

### 开发前准备

本项目推荐使用 [velociraptor](https://github.com/umbopepato/velociraptor) 作为 deno 执行工具

1. 安装 velociraptor

```shell
deno install --allow-read --allow-write --allow-env --allow-run -n vr https://deno.land/x/velociraptor/cli.ts
```

2. 执行测试脚本

```shell
vr test:gitlab_ci
```