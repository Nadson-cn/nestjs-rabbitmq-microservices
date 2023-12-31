import { OrdersRepository } from './orders.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderRequest } from './dto/create-orders.request';
import { Order } from './schemas/orders.schema';
import { BILLING_SERVICE } from './constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private billingClient: ClientProxy,
  ) {}

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    const session = await this.ordersRepository.startTransaction();

    try {
      const order = await this.ordersRepository.create(request, { session });

      await lastValueFrom(
        this.billingClient.emit('order_created', {
          request,
        }),
      );

      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    }
  }

  async getOrders(): Promise<Order[]> {
    return this.ordersRepository.find({});
  }

  async getOrder(id: string): Promise<Order> {
    return this.ordersRepository.findOne({ _id: id });
  }
}
