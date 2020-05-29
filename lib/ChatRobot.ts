/**
 * 钉钉自定义机器人
 * @see https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq
 */
import { sign, delay } from './utils.ts';

/**
 * 机器人配置参数
 */
export interface RobotProps {
    name?: string;
    baseURL?: string;
    accessToken: string;
    secret?: string;
    debounce?: number;
}

export interface RobotResponse {
    errcode: number; // 0 表示无错误
    errmsg: string; // ok 表示无错误
}

export interface MessageAt {
    atMobiles?: string[];
    isAtAll?: boolean;
}

export interface TextMessage {
    msgtype: 'text';
    text: {
        content: string;
    };
    at?: MessageAt;
}

export interface LinkMessageData {
    title: string;
    text: string;
    picUrl: string;
    messageUrl: string;
}

export interface LinkMessage {
    msgtype: 'link';
    link: LinkMessageData;
}

export interface MarkdownMessageData {
    title: string;
    text: string;
}

export interface MarkdownMessage {
    msgtype: 'markdown';
    markdown: MarkdownMessageData;
    at?: MessageAt;
}

export interface ActionCardBase {
    title: string;
    text: string;
    btnOrientation?: 0 | 1; // 0 - 垂直排列, 1 - 水平排列
}

export interface SingleActionCard extends ActionCardBase {
    singleTitle: string;
    singleURL: string;
}

export interface MultiActionCardBtn {
    title: string;
    actionURL: string;
}

export interface MultiActionCard extends ActionCardBase {
    btns: MultiActionCardBtn[];
}

export type ActionCardMessageData = SingleActionCard | MultiActionCard;

export interface ActionCardMessage {
    msgtype: 'actionCard';
    actionCard: ActionCardMessageData;
}

interface FeedCardMessageLinkData {
    title: string;
    messageURL: string;
    picURL: string;
}

export interface FeedCardMessage {
    msgtype: 'feedCard';
    feedCard: {
        links: FeedCardMessageLinkData[];
    };
}

export type Message = TextMessage | LinkMessage | MarkdownMessage | ActionCardMessage | FeedCardMessage;

export interface Task {
    schedule: number;
    exec: () => Promise<any>;
}

const TASK_QUEUE: Array<Task> = [];

/**
 * 发送消息
 * @param robot 机器人实例或配置
 * @param data 消息对象
 */
export async function send({ baseURL, accessToken, secret, debounce = 5000 }: RobotProps, data: Message): Promise<RobotResponse> {
    // 任务按时间排序
    TASK_QUEUE.sort((a, b) => a.schedule - b.schedule);

    // 当前任务序号
    const currentIndex = TASK_QUEUE.length;

    // 最晚执行的任务
    const lastTask = TASK_QUEUE[currentIndex - 1];

    // 当前任务计划时间
    const schedule = (lastTask?.schedule ?? Date.now()) + debounce;
    console.log('Task scheduled at: ', schedule);

    // 当前任务
    const task: Task = {
        schedule,
        exec: async () => {
            await delay(schedule - Date.now());
            let url = `${baseURL}?access_token=${accessToken}`;
            if (secret) {
                url += `&${sign(secret)}`;
            }
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            // 完成后删除任务
            TASK_QUEUE.splice(currentIndex, 1);
            return res.json();
        },
    };
    // 追回到队列
    TASK_QUEUE.push(task);

    // 执行任务
    return task.exec();
}

/**
 * 发送文本消息
 * @param robot 机器人实例或配置
 * @param text 文本内容
 * @param at at 配置
 */
export function sendText(robot: RobotProps, content: string, at?: MessageAt) {
    return send(robot, { msgtype: 'text', text: { content }, at });
}

/**
 * 发送链接消息
 * @param robot 机器人实例或配置
 * @param link 链接对象
 */
export function sendLink(robot: RobotProps, link: LinkMessageData) {
    return send(robot, { msgtype: 'link', link });
}

/**
 * 发送 markdown 消息
 * @param robot 机器人实例或配置
 * @param markdown
 * @param at
 */
export function sendMarkdown(robot: RobotProps, markdown: MarkdownMessageData, at?: MessageAt) {
    return send(robot, { msgtype: 'markdown', markdown, at });
}

/**
 * 发送action card
 * @param robot 机器人实例或配置
 * @param actionCard
 */
export function sendActionCard(robot: RobotProps, actionCard: ActionCardMessageData) {
    return send(robot, { msgtype: 'actionCard', actionCard });
}

/**
 * 发送 feed card
 * @param robot 机器人实例或配置
 * @param links feed card 链接
 */
export function sendFeedCard(robot: RobotProps, links: FeedCardMessageLinkData[]) {
    return send(robot, { msgtype: 'feedCard', feedCard: { links } });
}

/**
 * 机器人
 */
export interface ChatRobot extends RobotProps {
    send(data: Message): Promise<RobotResponse>;
    sendText(content: string, at?: MessageAt): Promise<RobotResponse>;
    sendLink(link: LinkMessageData): Promise<RobotResponse>;
    sendMarkdown(markdown: MarkdownMessageData, at?: MessageAt): Promise<RobotResponse>;
    sendActionCard(actionCard: ActionCardMessageData): Promise<RobotResponse>;
    sendFeedCard(links: FeedCardMessageLinkData[]): Promise<RobotResponse>;
}

/**
 * 机器人构造器
 * @param props 配置参数
 */
export function ChatRobot({ name, baseURL = 'https://oapi.dingtalk.com/robot/send', accessToken, secret }: RobotProps): ChatRobot {
    const robot = { name, baseURL, accessToken, secret };
    return Object.defineProperties(robot, {
        send: { value: send.bind(null, robot) },
        sendText: { value: sendText.bind(null, robot) },
        sendLink: { value: sendLink.bind(null, robot) },
        sendMarkdown: { value: sendMarkdown.bind(null, robot) },
        sendActionCard: { value: sendActionCard.bind(null, robot) },
        sendFeedCard: { value: sendFeedCard.bind(null, robot) },
    });
}
