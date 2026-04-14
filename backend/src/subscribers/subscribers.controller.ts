import { BadRequestException, Body, Controller, Delete, Post, Query, UseGuards } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('subscribers')
export class SubscribersController {
    constructor(private subscribersService: SubscribersService) {}

    @Post()
    subscribe(
        @Body() dto: SubscribeDto,
        @CurrentUser() user?: { id: string },
    ) {
        return this.subscribersService.subscribe(dto, user?.id);
    }

    @Delete()
    unsubscribe(@Query('email') email: string) {
        if (!email) throw new BadRequestException('Email is required');
        return this.subscribersService.unsubscribe(email);
    }
}
