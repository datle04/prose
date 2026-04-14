import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
    constructor (private postsService: PostsService) {}

    // GET ALL POSTS
    @Get()
    findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        return this.postsService.findAll(+page, +limit);
    };

    // SEARCH
    @Get('search')
    search(
        @Query('q') q?: string,
        @Query('tag') tag?: string,
        @Query('author') author?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ){
        return this.postsService.search({ q, tag, author, from, to, page: +page, limit: +limit });
    };

    // GET FOLLOWING FEED
    @UseGuards(JwtAuthGuard)
    @Get('feed')
    getFeed(
        @CurrentUser() user: { id: string },
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        return this.postsService.getFeed(user.id, +page, +limit);
    }

    // GET POST BY SLUG
    @Get(':slug')
    findBySlug(@Param('slug') slug: string) {
        return this.postsService.finndBySlug(slug);
    };

    // CREATE POST
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('AUTHOR', 'ADMIN')
    @Post()
    create(@CurrentUser() user: { id: string }, @Body() dto: CreatePostDto) {
        return this.postsService.create(user.id, dto);
    };


    //UPDATE POST
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('AUTHOR', 'ADMIN')
    @Patch(':id')
    update(
        @Param('id') id: string,
        @CurrentUser() user: { id: string, role: string },
        @Body() dto: UpdatePostDto,
    ) {
        return this.postsService.update(id, user.id, user.role, dto);
    };

    // DELETE POST
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('AUTHOR', 'ADMIN')
    @Delete(':id')
    remove(
        @Param('id') id: string,
        @CurrentUser() user: { id: string, role: string },
    ) {
        return this.postsService.remove(id, user.id, user.role)
    };

    // TOGGLE POST
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('AUTHOR', 'ADMIN')
    @Post(':id/publish')
    togglePublish(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.postsService.togglePublish(id, user.id);
    }

    // TOGGLE LIKE
    @UseGuards(JwtAuthGuard)
    @Post(':id/like')
    toggleLike(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.postsService.toggleLike(id, user.id);
    }

    // TOGGLE BOOKMARK
    @UseGuards(JwtAuthGuard)
    @Post(':id/bookmark')
    toggleBookmark(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.postsService.toggleBookmark(id, user.id);
    }
}
