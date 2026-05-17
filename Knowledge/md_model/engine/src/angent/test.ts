import { EngineLimitsType } from "../../../src/types/enginelimits.type";
import { InstructionType } from "../../../src/types/instruction.type";
import { MonitorDataType } from "../../../src/types/monitordata.type";
import { RawStateDataType } from "../../../src/types/rawstatedata.type";
import { ShardType } from "../../../src/types/shard.type";

// 初始化实体
const shard = new ShardType("S1", "primary", "synced", 100, 80);
const limit = new EngineLimitsType(100, 512, 80, 8, 5000, 128);
const inst = new InstructionType(0x03);
const monitor = new MonitorDataType();
const state = new RawStateDataType("K1", "V1", 1, new Date(), "S1", "primary");
shard.setShardId("k1");
