import { sendMessage, CIEnv } from '../gitlab_ci.ts';

const env: CIEnv = {
    GITLAB_CI: 'true',
    CI_PROJECT_PATH: 'ife/dingtalk-robot',
    CI_COMMIT_REF_NAME: 'master',
    CI_COMMIT_SHA: 'cfe4df310ea2b873af5cacfe17bf33b2aaecf25e',
    CI_COMMIT_MESSAGE: 'chore: commit messages.\n\n这里有具体的变更内容\n可以是很多行的\n+ 还可能是列表项\n+ 列表项2',
    CI_PROJECT_URL: 'http://gitlab.eainc.com/ife/dingtalk-robot',
    GITLAB_USER_NAME: '测试用户',
    GITLAB_USER_EMAIL: 'test@angelalign.com',
    CI_PIPELINE_ID: '434',
    CI_JOB_ID: '803',
    CI_JOB_NAME: 'test',
};

(async () => {
    sendMessage({ status: 'success' }, void 0, { ...env }).then(console.log).catch(console.error);
    sendMessage({ status: 'failure' }, void 0, {
        ...env,
        CI_COMMIT_SHA: '3d303c5346b5ee0c26afe4d687f0b476f8a8b082',
        CI_PIPELINE_ID: '435',
        CI_JOB_ID: '804',
    }).then(console.log).catch(console.error);
})();

// Deno.test('Should send "success" messages successfully', async () => {
//     const result = await sendMessage({ status: 'success' }, void 0, { ...env });
//     if (result?.errcode !== 0 || result?.errmsg !== 'ok') {
//         throw result;
//     }
// });

// Deno.test('Should send "failure" messages successfully', async () => {
//     const result = await sendMessage({ status: 'failure' }, void 0, {
//         ...env,
//         CI_COMMIT_SHA: '3d303c5346b5ee0c26afe4d687f0b476f8a8b082',
//         CI_PIPELINE_ID: '435',
//         CI_JOB_ID: '804',
//     });
//     if (result?.errcode !== 0 || result?.errmsg !== 'ok') {
//         throw result;
//     }
// });
