import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private notificationsService: NotificationsService){

    }
    
    @Get()
    getNotifications(@CurrentUser() user: { id: string }) {
        return this.notificationsService.getNotifications(user.id);
    }

    @Patch('read-all')
    markAllRead(@CurrentUser() user: { id: string }){
        return this.notificationsService.markAllRead(user.id);
    }

    @Patch(':id/read')
    markOneRead(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.notificationsService.markOneRead(id, user.id);
    }
}
