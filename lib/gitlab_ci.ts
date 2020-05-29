/**
 * 该模块用于通知 Gitlab CI 的各种状态
 * 本模块只能在 gitlab-ci 脚本环境中执行
 *
 * 以下两个环境变量需要配置在 gitlab ci/cd 配置项 “加密变量” 中：
 * I_DINGTALK_ROBOT_ACCESS_TOKEN: 在钉钉中配置的自定义机器人 access_token
 * I_DINGTALK_ROBOT_SECRET: 在钉钉中配置的自定义机器人 secret
 */
import { ChatRobot, MessageAt } from './ChatRobot.ts';

/** 环境变量表 */
const env = Deno.env.toObject();

/** 钉钉群机器人 access_token */
const accessToken = env.I_DINGTALK_ROBOT_ACCESS_TOKEN;

console.log('access token: ', accessToken);

/** 钉钉群机器人 secret */
const secret = env.I_DINGTALK_ROBOT_SECRET;

console.log('secret: ', secret);

// 无 token 不给用
if (!accessToken) {
    console.error('请将钉钉的 Access Token 配置到 gitlab 加密变量 I_DINGTALK_ROBOT_ACCESS_TOKEN');
    Deno.exit(0);
}

/** 创建机器人实例 */
const robot = ChatRobot({
    name: 'Gitlab CI',
    baseURL: 'https://oapi.dingtalk.com/robot/send',
    accessToken,
    secret,
});

/** CI 结果 */
export interface CIResult {
    status?: 'success' | 'failure';
    message?: string;
}

/** 依赖的 Gitlab CI 内置环境变量 */
export interface CIEnv {
    GITLAB_CI?: string;
    CI_PROJECT_PATH?: string;
    CI_COMMIT_REF_NAME?: string;
    CI_COMMIT_SHA?: string;
    CI_COMMIT_SHORT_SHA?: string;
    CI_COMMIT_MESSAGE?: string;
    CI_PROJECT_URL?: string;
    GITLAB_USER_NAME?: string;
    GITLAB_USER_EMAIL?: string;
    CI_PIPELINE_ID?: string;
    CI_JOB_ID?: string;
    CI_JOB_NAME?: string;
}

/**
 * 发送消息
 * @param ciResult Gitlab CI 结果
 * @param at 需要 at 的人
 * @param env Gitlab CI 内置环境变量对象
 */
export async function sendMessage({ status = 'success', message = '' }: CIResult = {}, at?: MessageAt, env: CIEnv = Deno.env.toObject()) {
    // 只能在 gitlab ci 环境下执行
    if (!env.GITLAB_CI) {
        return;
    }
    const projFullname = env.CI_PROJECT_PATH || '';
    const commitRef = env.CI_COMMIT_REF_NAME || '';
    const commitSha = env.CI_COMMIT_SHA || '';
    const commitShortSha = env.CI_COMMIT_SHORT_SHA || commitSha.slice(0, 8);
    const commitMessage = env.CI_COMMIT_MESSAGE || '';
    const projURL = env.CI_PROJECT_URL || '';

    const userName = env.GITLAB_USER_NAME || '';
    const userMail = env.GITLAB_USER_EMAIL || '';

    const pipelineID = env.CI_PIPELINE_ID || '';
    const jobID = env.CI_JOB_ID || '';
    const jobName = env.CI_JOB_NAME || '';

    const commitLink = `${projURL}/commits/${commitRef}`;
    const success = status === 'success';
    const statusIcon = success ? '✅' : '❌';
    const statusText = success ? '成功' : '失败';

    const msgTitle = `${statusIcon}${projFullname}#${commitRef} [${jobName}] 执行${statusText}`;
    const msgText = `# [${projFullname}](${projURL}) [\`#${commitRef}\`](${commitLink})  
# ${statusIcon} [${jobName}] 执行${statusText}  

**Commit:** [\`#${commitShortSha}\`](${projURL}/commit/${commitSha})  
**Pipeline:** [\`#${pipelineID}\`](${projURL}/pipelines/${pipelineID})  
**Job ID:** [\`#${jobID}\`](${projURL}/-/jobs/${jobID})  
**Username:** [\`${userName}\`](mailto:${userMail})  

> ${commitMessage.replace(/\s*\n+\s*/g, '  \n> ')}  

${message.replace(/\s*\n+\s*/g, '  \n')}`;

    return robot.sendMarkdown({ title: msgTitle, text: msgText }, at);
}
