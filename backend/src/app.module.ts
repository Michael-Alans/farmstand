import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { OrdersModule } from './orders/orders.module';
import { EventsModule } from './events.module'; // <-- 1. Import EventsModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ListingsModule,
    OrdersModule,
    EventsModule, // <-- 2. Add to imports
  ],
  controllers: [AppController],
  providers: [AppService], // <-- 3. EventsGateway removed from here
})
export class AppModule {}