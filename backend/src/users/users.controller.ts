import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { OptionalJwtGuard } from 'src/auth/guards/optional-jwt.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get(':username/profile')
    @UseGuards(OptionalJwtGuard)
    getProfile(@Param('username') username: string, @CurrentUser() user: any) {
        return this.usersService.getProfile(username, user?.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    updateProfile(
        @CurrentUser() user: { id: string },
        @Body() dto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':username/follow')
    toggleFollow(
        @Param('username') username: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.usersService.toggleFollow(user.id, username);
    }
}
