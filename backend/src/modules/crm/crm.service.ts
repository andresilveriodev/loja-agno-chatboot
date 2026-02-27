import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Lead } from "../../entities/lead.entity";
import { Message } from "../../entities/message.entity";
import { Activity } from "../../entities/activity.entity";
import { Schedule } from "../../entities/schedule.entity";
import { Order } from "../../entities/order.entity";
import { OrderItem } from "../../entities/order-item.entity";
import { OrderCounter } from "../../entities/order-counter.entity";
import {
  LEAD_STAGES,
  SCHEDULE_TYPES,
  SCHEDULE_STATUSES,
  ORDER_STAGES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SHIPPING_STATUSES,
  type LeadSource,
  type ScheduleType,
} from "../../entities/enums";
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
import {
  DEFAULT_LEADS_LIMIT,
  MAX_LEADS_LIMIT,
  DEFAULT_HISTORY_LIMIT,
  MAX_HISTORY_LIMIT,
  DEFAULT_ORDERS_LIMIT,
  MAX_ORDERS_LIMIT,
} from "./dto";

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderCounter)
    private readonly orderCounterRepo: Repository<OrderCounter>,
  ) {}

  /**
   * Lista leads com filtros, paginação e ordenação.
   */
  async findLeads(query: LeadsQueryDto): Promise<{
    data: Lead[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const limit = Math.min(
      Math.max(1, Number(query.limit) || DEFAULT_LEADS_LIMIT),
      MAX_LEADS_LIMIT,
    );
    const offset = Math.max(0, Number(query.offset) || 0);

    const sort = query.sort?.trim() || "-lastInteractionAt";
    const desc = sort.startsWith("-");
    const field = sort.replace(/^-/, "") || "lastInteractionAt";
    const allowedSort: Record<string, string> = {
      createdAt: "lead.createdAt",
      updatedAt: "lead.updatedAt",
      lastInteractionAt: "lead.lastInteractionAt",
      name: "lead.name",
    };
    const orderBy = allowedSort[field] || "lead.lastInteractionAt";

    const qb = this.leadRepo
      .createQueryBuilder("lead")
      .orderBy(orderBy, desc ? "DESC" : "ASC", "NULLS LAST")
      .addOrderBy("lead.createdAt", "DESC");

    // Filtro por estágios
    const stageParam = query.stage;
    if (stageParam) {
      const stages = Array.isArray(stageParam)
        ? stageParam
        : stageParam.split(",").map((s) => s.trim());
      const validStages = stages.filter((s) =>
        (LEAD_STAGES as string[]).includes(s),
      );
      if (validStages.length) {
        qb.andWhere("lead.stage IN (:...stages)", { stages: validStages });
      }
    }

    // Filtro por origem
    if (query.source === "web" || query.source === "whatsapp") {
      qb.andWhere("lead.source = :source", { source: query.source });
    }

    // Filtro por intenção
    if (query.intent?.trim()) {
      qb.andWhere("lead.intent = :intent", { intent: query.intent.trim() });
    }

    // Filtro por data (createdAt ou lastInteractionAt)
    if (query.from) {
      const fromDate = new Date(query.from);
      if (!Number.isNaN(fromDate.getTime())) {
        qb.andWhere(
          "(lead.lastInteractionAt >= :from OR (lead.lastInteractionAt IS NULL AND lead.createdAt >= :from))",
          { from: fromDate },
        );
      }
    }
    if (query.to) {
      const toDate = new Date(query.to);
      if (!Number.isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        qb.andWhere(
          "(lead.lastInteractionAt <= :to OR (lead.lastInteractionAt IS NULL AND lead.createdAt <= :to))",
          { to: toDate },
        );
      }
    }

    // Busca por nome ou telefone
    if (query.q?.trim()) {
      const q = `%${query.q.trim().replace(/%/g, "\\%")}%`;
      qb.andWhere(
        "(lead.name LIKE :q OR lead.phone LIKE :q OR lead.company LIKE :q)",
        { q },
      );
    }

    const [data, total] = await qb
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    // Não enviar todas as mensagens no list; apenas contagem se precisar depois
    const dataWithoutMessages = data.map((lead) => {
      const { messages, ...rest } = lead;
      return { ...rest, messages: [] };
    });

    return {
      data: dataWithoutMessages,
      total,
      limit,
      offset,
    };
  }

  /**
   * Busca lead por ID com relações (mensagens, agendamentos, pedidos, atividades).
   */
  async findLeadById(id: string): Promise<Lead> {
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: ["schedules", "orders", "activities"],
      order: { schedules: { scheduledAt: "ASC" } },
    });
    if (!lead) {
      throw new NotFoundException("Lead não encontrado");
    }
    return lead;
  }

  /**
   * Busca ou cria lead pelo telefone (uso em WhatsApp/webhook).
   * Atualiza lastInteractionAt quando o lead já existe.
   */
  async findOrCreateLeadByPhone(phone: string): Promise<Lead> {
    const normalized = phone.trim();
    if (!normalized) {
      throw new BadRequestException("Telefone é obrigatório");
    }
    let lead = await this.leadRepo.findOne({ where: { phone: normalized } });
    const now = new Date();
    if (lead) {
      lead.lastInteractionAt = now;
      await this.leadRepo.save(lead);
      return lead;
    }
    lead = this.leadRepo.create({
      name: `Contato ${normalized}`,
      phone: normalized,
      source: "whatsapp",
      stage: "new_lead",
      lastInteractionAt: now,
    });
    return this.leadRepo.save(lead);
  }

  /**
   * Atualiza lead (stage para Kanban ou outros campos).
   * Valida stage contra LeadStage.
   */
  async updateLead(id: string, dto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) {
      throw new NotFoundException("Lead não encontrado");
    }

    if (dto.stage !== undefined) {
      if (!(LEAD_STAGES as string[]).includes(dto.stage)) {
        throw new BadRequestException(
          `Estágio inválido. Valores: ${LEAD_STAGES.join(", ")}`,
        );
      }
      const previousStage = lead.stage;
      lead.stage = dto.stage;
      // Registrar atividade de mudança de estágio (userId pode vir de auth depois)
      await this.activityRepo.save({
        leadId: id,
        type: "stage_change",
        title: "Mudança de estágio",
        metadata: {
          previousStage,
          newStage: dto.stage,
        },
      });
    }

    if (dto.name !== undefined) lead.name = dto.name;
    if (dto.company !== undefined) lead.company = dto.company;
    if (dto.email !== undefined) lead.email = dto.email;
    if (dto.city !== undefined) lead.city = dto.city;
    if (dto.intent !== undefined) lead.intent = dto.intent;
    if (dto.productsOfInterest !== undefined)
      lead.productsOfInterest = dto.productsOfInterest;
    if (dto.estimatedValue !== undefined)
      lead.estimatedValue = dto.estimatedValue;
    if (dto.source !== undefined) lead.source = dto.source;
    if (dto.notes !== undefined) lead.notes = dto.notes;

    return this.leadRepo.save(lead);
  }

  /**
   * Histórico/timeline do lead: mensagens + atividades, ordenados por data.
   */
  async getLeadHistory(
    leadId: string,
    query: HistoryQueryDto,
  ): Promise<{
    data: Array<
      | { type: "message"; item: Message }
      | { type: "activity"; item: Activity }
    >;
    total: number;
    limit: number;
    offset: number;
  }> {
    const lead = await this.leadRepo.findOne({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundException("Lead não encontrado");
    }

    const limit = Math.min(
      Math.max(1, Number(query.limit) || DEFAULT_HISTORY_LIMIT),
      MAX_HISTORY_LIMIT,
    );
    const offset = Math.max(0, Number(query.offset) || 0);

    const [messages, messagesTotal] = await this.messageRepo.findAndCount({
      where: { leadId },
      order: { createdAt: "DESC" },
      take: limit * 2,
    });

    const [activities, activitiesTotal] = await this.activityRepo.findAndCount({
      where: { leadId },
      order: { createdAt: "DESC" },
      take: limit * 2,
    });

    const combined: Array<
      { type: "message"; item: Message } | { type: "activity"; item: Activity }
    > = [
      ...messages.map((item) => ({ type: "message" as const, item })),
      ...activities.map((item) => ({ type: "activity" as const, item })),
    ].sort((a, b) => {
      const dateA =
        a.type === "message"
          ? a.item.createdAt.getTime()
          : a.item.createdAt.getTime();
      const dateB =
        b.type === "message"
          ? b.item.createdAt.getTime()
          : b.item.createdAt.getTime();
      return dateB - dateA;
    });

    const total = combined.length;
    const data = combined.slice(offset, offset + limit);

    return { data, total, limit, offset };
  }

  /**
   * Cria agendamento para um lead.
   */
  async createSchedule(dto: CreateScheduleDto): Promise<Schedule> {
    const lead = await this.leadRepo.findOne({ where: { id: dto.leadId } });
    if (!lead) {
      throw new NotFoundException("Lead não encontrado");
    }
    const type = (dto.type || "").trim().toLowerCase();
    if (!SCHEDULE_TYPES.includes(type as ScheduleType)) {
      throw new BadRequestException(
        `Tipo inválido. Valores: ${SCHEDULE_TYPES.join(", ")}`,
      );
    }
    const scheduledAt = new Date(dto.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException("scheduledAt deve ser uma data/hora válida");
    }
    const title = (dto.title || "").trim();
    if (!title) {
      throw new BadRequestException("title é obrigatório");
    }
    return this.scheduleRepo.save({
      leadId: dto.leadId,
      type,
      scheduledAt,
      title,
      description: (dto.description ?? "").trim(),
      address: dto.address?.trim() || null,
      cep: dto.cep?.trim() || null,
      deliveryItems: dto.deliveryItems?.trim() || null,
      status: "pending",
    });
  }

  /**
   * Registra handoff (transferência para atendente) na timeline do lead.
   * Usado na Fase 4 do bot WhatsApp.
   */
  async registerWhatsappHandoff(input: {
    leadId: string;
    phone: string;
    name?: string | null;
    source?: LeadSource;
    reason: string;
    intention?: string | null;
    sessionId?: string;
    recentMessages: Array<{ sender: string; content: string; createdAt: Date }>;
  }): Promise<void> {
    const lead = await this.leadRepo.findOne({ where: { id: input.leadId } });
    if (!lead) return;

    const source: LeadSource = input.source ?? "whatsapp";
    const displayName = (input.name || lead.name || "").trim() || "(sem nome)";
    const phone = (lead.phone || input.phone || "").trim();

    const headerLines: string[] = [
      `Origem: ${source}`,
      `Nome: ${displayName}`,
      `Telefone: ${phone || "(não informado)"}`,
    ];
    if (input.intention) {
      headerLines.push(`Intenção (lead): ${input.intention}`);
    }
    headerLines.push(`Motivo: ${input.reason}`);

    const recent = [...input.recentMessages]
      .slice(-10)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const historyLines = recent.map((m) => {
      const ts = m.createdAt.toISOString();
      const sender =
        m.sender === "bot"
          ? "bot"
          : m.sender === "agent"
            ? "agente"
            : "cliente";
      return `[${ts}] ${sender}: ${m.content}`;
    });

    const description =
      headerLines.join("\n") +
      (historyLines.length
        ? `\n\nÚltimas mensagens:\n${historyLines.join("\n")}`
        : "");

    await this.activityRepo.save({
      leadId: input.leadId,
      type: "handoff",
      title: "Handoff para atendente (WhatsApp)",
      description,
      metadata: {
        source,
        reason: input.reason,
        intention: input.intention ?? null,
        sessionId: input.sessionId ?? null,
        messagesCount: recent.length,
      },
    });
  }

  /**
   * Atualiza ou cancela agendamento.
   */
  async updateSchedule(id: string, dto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: ["lead"],
    });
    if (!schedule) {
      throw new NotFoundException("Agendamento não encontrado");
    }
    if (dto.type !== undefined) {
      const type = dto.type.trim().toLowerCase();
      if (!SCHEDULE_TYPES.includes(type as ScheduleType)) {
        throw new BadRequestException(
          `Tipo inválido. Valores: ${SCHEDULE_TYPES.join(", ")}`,
        );
      }
      schedule.type = type;
    }
    if (dto.scheduledAt !== undefined) {
      const scheduledAt = new Date(dto.scheduledAt);
      if (Number.isNaN(scheduledAt.getTime())) {
        throw new BadRequestException("scheduledAt deve ser uma data/hora válida");
      }
      schedule.scheduledAt = scheduledAt;
    }
    if (dto.title !== undefined) {
      const title = dto.title.trim();
      if (!title) {
        throw new BadRequestException("title não pode ser vazio");
      }
      schedule.title = title;
    }
    if (dto.description !== undefined) {
      schedule.description = dto.description.trim();
    }
    if (dto.status !== undefined) {
      const status = dto.status.trim().toLowerCase();
      if (!SCHEDULE_STATUSES.includes(status as "pending" | "completed" | "cancelled")) {
        throw new BadRequestException(
          `Status inválido. Valores: ${SCHEDULE_STATUSES.join(", ")}`,
        );
      }
      schedule.status = status;
    }
    if (dto.address !== undefined) {
      schedule.address = dto.address.trim() || null;
    }
    if (dto.cep !== undefined) {
      schedule.cep = dto.cep.trim() || null;
    }
    if (dto.deliveryItems !== undefined) {
      schedule.deliveryItems = dto.deliveryItems.trim() || null;
    }
    return this.scheduleRepo.save(schedule);
  }

  /**
   * Lista pedidos com filtros e paginação.
   */
  async findOrders(query: OrdersQueryDto): Promise<{
    data: Order[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const limit = Math.min(
      Math.max(1, Number(query.limit) || DEFAULT_ORDERS_LIMIT),
      MAX_ORDERS_LIMIT,
    );
    const offset = Math.max(0, Number(query.offset) || 0);

    const sort = query.sort?.trim() || "-createdAt";
    const desc = sort.startsWith("-");
    const field = sort.replace(/^-/, "") || "createdAt";
    const allowedSort: Record<string, string> = {
      createdAt: "order.createdAt",
      updatedAt: "order.updatedAt",
      orderNumber: "order.orderNumber",
      total: "order.total",
    };
    const orderBy = allowedSort[field] || "order.createdAt";

    const qb = this.orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.lead", "lead")
      .orderBy(orderBy, desc ? "DESC" : "ASC");

    if (query.stage) {
      const stages = Array.isArray(query.stage)
        ? query.stage
        : query.stage.split(",").map((s) => s.trim());
      const valid = stages.filter((s) =>
        (ORDER_STAGES as string[]).includes(s),
      );
      if (valid.length) {
        qb.andWhere("order.stage IN (:...stages)", { stages: valid });
      }
    }
    if (query.leadId?.trim()) {
      qb.andWhere("order.leadId = :leadId", { leadId: query.leadId.trim() });
    }
    if (query.from) {
      const fromDate = new Date(query.from);
      if (!Number.isNaN(fromDate.getTime())) {
        qb.andWhere("order.createdAt >= :from", { from: fromDate });
      }
    }
    if (query.to) {
      const toDate = new Date(query.to);
      if (!Number.isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        qb.andWhere("order.createdAt <= :to", { to: toDate });
      }
    }

    const [data, total] = await qb.skip(offset).take(limit).getManyAndCount();
    return { data, total, limit, offset };
  }

  /**
   * Detalhe do pedido com itens e lead.
   */
  async findOrderById(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ["items", "lead"],
    });
    if (!order) {
      throw new NotFoundException("Pedido não encontrado");
    }
    return order;
  }

  /**
   * Cria pedido com número sequencial e itens (transação).
   */
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const lead = await this.leadRepo.findOne({ where: { id: dto.leadId } });
    if (!lead) {
      throw new NotFoundException("Lead não encontrado");
    }
    if (!dto.items?.length) {
      throw new BadRequestException("O pedido deve ter pelo menos um item");
    }

    const paymentMethod = (dto.paymentMethod || "pix").trim().toLowerCase();
    if (!PAYMENT_METHODS.includes(paymentMethod as "pix" | "boleto" | "card" | "transfer")) {
      throw new BadRequestException(
        `paymentMethod inválido. Valores: ${PAYMENT_METHODS.join(", ")}`,
      );
    }
    const paymentStatus = (dto.paymentStatus ?? "pending").trim().toLowerCase();
    if (!PAYMENT_STATUSES.includes(paymentStatus as "pending" | "confirmed" | "failed" | "refunded")) {
      throw new BadRequestException(
        `paymentStatus inválido. Valores: ${PAYMENT_STATUSES.join(", ")}`,
      );
    }

    const discount = Math.max(0, Number(dto.discount) || 0);

    return this.orderRepo.manager.transaction(async (manager) => {
      let counter = await manager.getRepository(OrderCounter).findOne({
        where: { id: "default" },
      });
      if (!counter) {
        counter = await manager.getRepository(OrderCounter).save({
          id: "default",
          nextNumber: 1001,
        });
      }
      const orderNumber = counter.nextNumber;
      counter.nextNumber += 1;
      await manager.getRepository(OrderCounter).save(counter);

      const items: OrderItem[] = [];
      let subtotal = 0;
      for (const row of dto.items) {
        const qty = Math.max(0, Number(row.quantity) || 0);
        const unitPrice = Math.max(0, Number(row.unitPrice) || 0);
        const total = qty * unitPrice;
        subtotal += total;
        const item = manager.getRepository(OrderItem).create({
          productId: row.productId ?? null,
          name: (row.name || "").trim() || "Item",
          quantity: qty,
          unitPrice,
          total,
        });
        items.push(item);
      }
      const total = Math.max(0, subtotal - discount);

      const stage =
        paymentStatus === "confirmed"
          ? "payment_confirmed"
          : "payment_pending";

      const order = manager.getRepository(Order).create({
        leadId: dto.leadId,
        orderNumber,
        subtotal,
        discount,
        total,
        paymentMethod,
        paymentStatus,
        paymentConfirmedAt: paymentStatus === "confirmed" ? new Date() : null,
        shippingAddress: dto.shippingAddress ?? null,
        shippingStatus: "pending",
        stage,
      });
      const savedOrder = await manager.getRepository(Order).save(order);
      for (const item of items) {
        item.orderId = savedOrder.id;
        await manager.getRepository(OrderItem).save(item);
      }
      return manager.getRepository(Order).findOne({
        where: { id: savedOrder.id },
        relations: ["items", "lead"],
      }) as Promise<Order>;
    });
  }

  /**
   * Atualiza pedido (stage, pagamento, entrega).
   * Sincroniza stage com paymentStatus/shippingStatus conforme a revisão de arquitetura.
   */
  async updateOrder(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ["items", "lead"],
    });
    if (!order) {
      throw new NotFoundException("Pedido não encontrado");
    }

    if (dto.stage !== undefined) {
      const stage = dto.stage.trim().toLowerCase();
      if (!(ORDER_STAGES as string[]).includes(stage)) {
        throw new BadRequestException(
          `stage inválido. Valores: ${ORDER_STAGES.join(", ")}`,
        );
      }
      order.stage = stage;
      if (stage === "payment_confirmed") {
        order.paymentStatus = "confirmed";
        if (!order.paymentConfirmedAt) {
          order.paymentConfirmedAt = new Date();
        }
      }
      if (stage === "preparing") {
        order.shippingStatus = "preparing";
      }
      if (stage === "shipped") {
        order.shippingStatus = "shipped";
        if (!order.shippedAt) order.shippedAt = new Date();
      }
      if (stage === "delivered") {
        order.shippingStatus = "delivered";
        if (!order.deliveredAt) order.deliveredAt = new Date();
      }
    }
    if (dto.paymentStatus !== undefined) {
      const s = dto.paymentStatus.trim().toLowerCase();
      if (!PAYMENT_STATUSES.includes(s as "pending" | "confirmed" | "failed" | "refunded")) {
        throw new BadRequestException(
          `paymentStatus inválido. Valores: ${PAYMENT_STATUSES.join(", ")}`,
        );
      }
      order.paymentStatus = s;
      if (s === "confirmed" && !order.paymentConfirmedAt) {
        order.paymentConfirmedAt = new Date();
      }
    }
    if (dto.paymentConfirmedAt !== undefined) {
      order.paymentConfirmedAt = dto.paymentConfirmedAt
        ? new Date(dto.paymentConfirmedAt)
        : null;
    }
    if (dto.shippingStatus !== undefined) {
      const s = dto.shippingStatus.trim().toLowerCase();
      if (!SHIPPING_STATUSES.includes(s as "pending" | "preparing" | "shipped" | "delivered")) {
        throw new BadRequestException(
          `shippingStatus inválido. Valores: ${SHIPPING_STATUSES.join(", ")}`,
        );
      }
      order.shippingStatus = s;
    }
    if (dto.shippedAt !== undefined) {
      order.shippedAt = dto.shippedAt ? new Date(dto.shippedAt) : null;
    }
    if (dto.trackingCode !== undefined) {
      order.trackingCode = dto.trackingCode?.trim() ?? null;
    }
    if (dto.deliveredAt !== undefined) {
      order.deliveredAt = dto.deliveredAt ? new Date(dto.deliveredAt) : null;
    }

    return this.orderRepo.save(order);
  }

  /**
   * Popula o banco com 6 leads de exemplo (uso em dev/demo).
   * Idempotente: atualiza por telefone se já existir.
   */
  async seedLeads(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;
    for (const row of SEED_LEADS_DATA) {
      const existing = await this.leadRepo.findOne({ where: { phone: row.phone } });
      if (existing) {
        await this.leadRepo.update(existing.id, { ...row, lastInteractionAt: row.lastInteractionAt ?? null });
        updated++;
      } else {
        await this.leadRepo.save(this.leadRepo.create(row));
        created++;
      }
    }
    return { created, updated };
  }
}

const SEED_LEADS_DATA: Array<{
  name: string;
  phone: string;
  company: string | null;
  email: string | null;
  intent: string | null;
  productsOfInterest: string[];
  estimatedValue: number;
  stage: string;
  source: string;
  notes: string | null;
  lastInteractionAt: Date | null;
}> = [
  {
    name: "Ana Silva",
    phone: "11999990001",
    company: "Indústria Beta Ltda",
    email: "ana.silva@industriabeta.com.br",
    intent: "Cotação de equipamentos",
    productsOfInterest: ["Compressor 2HP", "Serra tico-tico"],
    estimatedValue: 8500,
    stage: "new_lead",
    source: "web",
    notes: "Primeiro contato pelo site.",
    lastInteractionAt: new Date(),
  },
  {
    name: "Bruno Oliveira",
    phone: "11999990002",
    company: "Construtora Norte",
    email: "bruno@construtoranorte.com",
    intent: "Compra imediata",
    productsOfInterest: ["Betoneira", "Vibrador de concreto"],
    estimatedValue: 15000,
    stage: "qualified",
    source: "whatsapp",
    notes: null,
    lastInteractionAt: new Date(Date.now() - 3600000),
  },
  {
    name: "Carla Mendes",
    phone: "11999990003",
    company: null,
    email: "carla.mendes@gmail.com",
    intent: "Dúvida técnica",
    productsOfInterest: ["Furadeira de impacto"],
    estimatedValue: 1200,
    stage: "products_shown",
    source: "web",
    notes: "Interesse em linha profissional.",
    lastInteractionAt: new Date(Date.now() - 86400000),
  },
  {
    name: "Diego Costa",
    phone: "11999990004",
    company: "Auto Center Central",
    email: "diego@autocenter.com.br",
    intent: "Revenda",
    productsOfInterest: ["Compressor", "Lixadeira", "Pistola de pintura"],
    estimatedValue: 22000,
    stage: "quotation",
    source: "whatsapp",
    notes: "Pediu proposta para 3 unidades de cada.",
    lastInteractionAt: new Date(Date.now() - 7200000),
  },
  {
    name: "Elena Santos",
    phone: "11999990005",
    company: "Restaurante Sabor & Arte",
    email: "elena@saborearte.com.br",
    intent: "Compra imediata",
    productsOfInterest: ["Fogão industrial", "Freezer vertical"],
    estimatedValue: 18500,
    stage: "negotiation",
    source: "whatsapp",
    notes: "Aguardando aprovação de desconto.",
    lastInteractionAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    name: "Fernando Lima",
    phone: "11999990006",
    company: "Academia Força Total",
    email: "fernando@forcatotal.com",
    intent: "Orçamento anual",
    productsOfInterest: ["Esteira", "Bicicleta ergométrica", "Aparelhos de musculação"],
    estimatedValue: 45000,
    stage: "won",
    source: "web",
    notes: "Fechado em 18/02. Entregar em 30 dias.",
    lastInteractionAt: new Date(Date.now() - 86400000 * 2),
  },
];
