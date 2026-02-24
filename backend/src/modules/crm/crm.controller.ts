import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { CrmService } from "./crm.service";
import type {
  LeadsQueryDto,
  UpdateLeadDto,
  HistoryQueryDto,
  CreateScheduleDto,
  UpdateScheduleDto,
  OrdersQueryDto,
  CreateOrderDto,
  UpdateOrderDto,
} from "./dto";

@Controller("api/crm")
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post("seed-leads")
  async seedLeads() {
    return this.crmService.seedLeads();
  }

  @Get("leads")
  async getLeads(
    @Query("limit", new DefaultValuePipe("50"), ParseIntPipe) limit: number,
    @Query("offset", new DefaultValuePipe("0"), ParseIntPipe) offset: number,
    @Query("stage") stage?: string | string[],
    @Query("source") source?: string,
    @Query("intent") intent?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("q") q?: string,
    @Query("sort") sort?: string,
  ) {
    const query: LeadsQueryDto = {
      limit,
      offset,
      stage,
      source,
      intent,
      from,
      to,
      q,
      sort,
    };
    return this.crmService.findLeads(query);
  }

  @Get("leads/:id")
  async getLeadById(@Param("id") id: string) {
    return this.crmService.findLeadById(id);
  }

  @Put("leads/:id")
  async updateLead(
    @Param("id") id: string,
    @Body() body: UpdateLeadDto,
  ) {
    return this.crmService.updateLead(id, body);
  }

  @Get("leads/:id/history")
  async getLeadHistory(
    @Param("id") id: string,
    @Query("limit", new DefaultValuePipe("50"), ParseIntPipe) limit: number,
    @Query("offset", new DefaultValuePipe("0"), ParseIntPipe) offset: number,
    @Query("before") before?: string,
  ) {
    const query: HistoryQueryDto = { limit, offset, before };
    return this.crmService.getLeadHistory(id, query);
  }

  @Post("schedule")
  async createSchedule(@Body() body: CreateScheduleDto) {
    return this.crmService.createSchedule(body);
  }

  @Put("schedule/:id")
  async updateSchedule(
    @Param("id") id: string,
    @Body() body: UpdateScheduleDto,
  ) {
    return this.crmService.updateSchedule(id, body);
  }

  @Get("orders")
  async getOrders(
    @Query("limit", new DefaultValuePipe("50"), ParseIntPipe) limit: number,
    @Query("offset", new DefaultValuePipe("0"), ParseIntPipe) offset: number,
    @Query("stage") stage?: string | string[],
    @Query("leadId") leadId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("sort") sort?: string,
  ) {
    const query: OrdersQueryDto = {
      limit,
      offset,
      stage,
      leadId,
      from,
      to,
      sort,
    };
    return this.crmService.findOrders(query);
  }

  @Get("orders/:id")
  async getOrderById(@Param("id") id: string) {
    return this.crmService.findOrderById(id);
  }

  @Post("orders")
  async createOrder(@Body() body: CreateOrderDto) {
    return this.crmService.createOrder(body);
  }

  @Put("orders/:id")
  async updateOrder(
    @Param("id") id: string,
    @Body() body: UpdateOrderDto,
  ) {
    return this.crmService.updateOrder(id, body);
  }
}
