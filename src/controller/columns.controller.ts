import { Controller, Get, Post, Body, Param, UseGuards, Delete, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('columns')
export class ColumnsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllColumns() {
    const p = this.prisma as any;
    return p.columns.findMany();
  }

  @UseGuards(JwtGuard)
  @Get('author')
  async getColumnsByAuthor(@CurrentUser() user: any) {
    const p = this.prisma as any;
    return p.columns.findMany({ where: { owner: { is: { email: user.email } } } });
  }

  @UseGuards(JwtGuard)
  @Post()
  async createColumn(@CurrentUser() user: any, @Body() body: { title: string }) {
    const { title } = body;
    const p = this.prisma as any;
    return p.columns.create({ data: { title, owner: { connect: { email: user.email } } } });
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteColumn(@CurrentUser() user: any, @Param('id') id: string) {
    const p = this.prisma as any;
    const colId = Number(id);
    const column = await p.columns.findUnique({ where: { id: colId }, include: { owner: true } });
    if (!column) throw new NotFoundException('Coluna não encontrada');
    if (!column.owner || column.owner.email !== user.email) throw new ForbiddenException('Nenhuma permissão para excluir esta coluna');

    // delete tasks in the column first (if any)
    try {
      await p.task.deleteMany({ where: { columnId: colId } });
    } catch (e) {
      // ignore if model shape differs
    }

    await p.columns.delete({ where: { id: colId } });
    return { success: true };
  }
}
