import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Lead } from "../../entities/lead.entity";
import { Message } from "../../entities/message.entity";
import { Activity } from "../../entities/activity.entity";
import { Schedule } from "../../entities/schedule.entity";
import { Order } from "../../entities/order.entity";
import { OrderItem } from "../../entities/order-item.entity";
import { OrderCounter } from "../../entities/order-counter.entity";
import { CrmService } from "./crm.service";
import { CrmController } from "./crm.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      Message,
      Activity,
      Schedule,
      Order,
      OrderItem,
      OrderCounter,
    ]),
  ],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
