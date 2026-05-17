import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { Shard } from './shard';
import { EngineLimits } from './enginelimits';
import { Instruction } from './instruction';
import { RawStateData } from './rawstatedata';
import { MonitorData } from './monitordata';
import { Opcode } from './opcode';
export type Opcode = number;
export default {
    Shard, EngineLimits, Instruction, RawStateData, MonitorData,
}