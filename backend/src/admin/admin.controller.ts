import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor( private adminService: AdminService ){}
    
    @Get('stats')
    getStats(){
        return this.adminService.getStats();
    }

    @Get('users')
    getUsers(){
        return this.adminService.getUsers();
    }

    @Patch('users/:id/ban')
    banUser(@Param('id') id: string){
        return this.adminService.banUser(id);
    }

    @Patch('users/:id/role')
    updateRole(@Param('id') id: string, @Body('role') role: string){
        return this.adminService.updateRole(id, role);
    }

    @Delete('posts/:id')
    deletePost(@Param('id') id: string) {
        return this.adminService.deletePost(id);
    }
}
