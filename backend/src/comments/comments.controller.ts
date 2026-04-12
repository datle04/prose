import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller()
export class CommentsController {
    constructor(private commentsServices: CommentsService){}

    @Get('posts/:postId/comments')
    getComments(@Param('postId') postId: string){
        return this.commentsServices.getComments(postId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('posts/:postId/comments')
    create(
        @Param('postId') postId: string,
        @CurrentUser() user: { id: string },
        @Body() dto: CreateCommentDto,
    ){
        return this.commentsServices.create(postId, user.id, dto);
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('comments/:id')
    remove(
        @Param('id') id: string,
        @CurrentUser() user: { id: string, role: string },
    ) {
        return this.commentsServices.remove(id, user.id, user.role);
    }
}
