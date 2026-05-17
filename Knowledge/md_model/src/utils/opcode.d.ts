export enum OPCODES {
  CHECK_HOOK = 0x03,
  SET_LIMIT = 0x07,
  SYNC_SHARD = 0x0F,
  ADD_LOG = 0x02,
  GET_STATE = 0x09,
  MONITOR_CPU = 0x0A,
  MONITOR_MEM = 0x0B,
  QUEUE_PUSH = 0x10,
  QUEUE_POP = 0x11,
  BROADCAST_SHARD = 0x12,
  AGENT_CONTROL = 0x1E,
  AGENT_STATUS = 0x1F,
  WEB_QUERY_ALL = 0x33,
  WEB_EXPORT_LOG = 0x34
}

export class Opcode {
  static isOpcode(value: number): boolean {
    return Object.values(OPCODES).includes(value as OPCODES);
  }

  static getName(opcode: OPCODES): string {
    const entry = Object.entries(OPCODES).find(([, val]) => val === opcode);
    return entry ? entry[0] : 'UNKNOWN_OPCODE';
  }

  static getDescription(opcode: OPCODES): string {
    const map: Record<OPCODES, string> = {
      [OPCODES.CHECK_HOOK]: '安全钩子校验',
      [OPCODES.SET_LIMIT]: '设置资源限制',
      [OPCODES.SYNC_SHARD]: '分片同步',
      [OPCODES.ADD_LOG]: '添加日志',
      [OPCODES.GET_STATE]: '获取引擎状态',
      [OPCODES.MONITOR_CPU]: '监控CPU',
      [OPCODES.MONITOR_MEM]: '监控内存',
      [OPCODES.QUEUE_PUSH]: '队列推入任务',
      [OPCODES.QUEUE_POP]: '队列取出任务',
      [OPCODES.BROADCAST_SHARD]: '分片广播',
      [OPCODES.AGENT_CONTROL]: '智能体控制',
      [OPCODES.AGENT_STATUS]: '智能体状态',
      [OPCODES.WEB_QUERY_ALL]: 'Web查询全部数据',
      [OPCODES.WEB_EXPORT_LOG]: 'Web导出日志'
    };
    return map[opcode] || '未知指令';
  }

  static isAgentOpcode(opcode: OPCODES): boolean {
    return [OPCODES.AGENT_CONTROL, OPCODES.AGENT_STATUS].includes(opcode);
  }

  static isWebOpcode(opcode: OPCODES): boolean {
    return [OPCODES.WEB_QUERY_ALL, OPCODES.WEB_EXPORT_LOG].includes(opcode);
  }

  static isQueueOpcode(opcode: OPCODES): boolean {
    return [OPCODES.QUEUE_PUSH, OPCODES.QUEUE_POP].includes(opcode);
  }

  static isMonitorOpcode(opcode: OPCODES): boolean {
    return [OPCODES.MONITOR_CPU, OPCODES.MONITOR_MEM].includes(opcode);
  }

  static isShardOpcode(opcode: OPCODES): boolean {
    return [OPCODES.SYNC_SHARD, OPCODES.BROADCAST_SHARD].includes(opcode);
  }

  static isSecurityOpcode(opcode: OPCODES): boolean {
    return [OPCODES.CHECK_HOOK].includes(opcode);
  }
}