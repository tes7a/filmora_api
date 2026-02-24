import { Injectable } from '@nestjs/common';
import { list_type, Prisma } from '@prisma/client';

import { PrismaService } from '@/shared';

import type {
  AddFilmToListParams,
  CreateCustomListParams,
  RemoveFilmFromListParams,
  UpdateListParams,
  UserListDto,
} from '../dto';
import type { ListsRepository } from './lists.repository';

@Injectable()
export class PrismaListsRepository implements ListsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMyLists(userId: string): Promise<UserListDto[]> {
    const lists = await this.prisma.user_lists.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        name: true,
        type: true,
        is_public: true,
        created_at: true,
        updated_at: true,
        user_list_items: {
          select: {
            id: true,
            film_id: true,
            position: true,
            note: true,
            created_at: true,
          },
          orderBy: [{ created_at: 'desc' }],
        },
      },
      orderBy: [{ created_at: 'desc' }],
    });

    return lists.map((list) => this.toUserListDto(list));
  }

  async createCustomList(params: CreateCustomListParams): Promise<UserListDto> {
    const created = await this.prisma.user_lists.create({
      data: {
        user_id: params.userId,
        name: params.name,
        type: list_type.custom,
        is_public: params.isPublic ?? false,
      },
      select: {
        id: true,
        name: true,
        type: true,
        is_public: true,
        created_at: true,
        updated_at: true,
        user_list_items: {
          select: {
            id: true,
            film_id: true,
            position: true,
            note: true,
            created_at: true,
          },
          orderBy: [{ created_at: 'desc' }],
        },
      },
    });

    return this.toUserListDto(created);
  }

  async addFilmToList(params: AddFilmToListParams): Promise<UserListDto | null> {
    const { userId, listId, filmId, position, note } = params;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const [list, film] = await Promise.all([
          tx.user_lists.findFirst({
            where: { id: listId, user_id: userId },
            select: { id: true },
          }),
          tx.films.findFirst({
            where: { id: filmId },
            select: { id: true },
          }),
        ]);

        if (!list || !film) {
          return null;
        }

        await tx.user_list_items.create({
          data: {
            list_id: listId,
            user_id: userId,
            film_id: filmId,
            position: position ?? null,
            note: note ?? null,
          },
        });

        return this.getListById(tx, userId, listId);
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new Error('FILM_ALREADY_IN_LIST');
      }

      throw error;
    }
  }

  async removeFilmFromList(
    params: RemoveFilmFromListParams,
  ): Promise<UserListDto | null> {
    const { userId, listId, filmId } = params;

    return this.prisma.$transaction(async (tx) => {
      const list = await tx.user_lists.findFirst({
        where: { id: listId, user_id: userId },
        select: { id: true },
      });

      if (!list) {
        return null;
      }

      const deleted = await tx.user_list_items.deleteMany({
        where: {
          list_id: listId,
          user_id: userId,
          film_id: filmId,
        },
      });

      if (deleted.count === 0) {
        return null;
      }

      return this.getListById(tx, userId, listId);
    });
  }

  async updateList(params: UpdateListParams): Promise<UserListDto | null> {
    const { userId, listId, name, isPublic } = params;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existing = await tx.user_lists.findFirst({
          where: { id: listId, user_id: userId },
          select: {
            id: true,
            type: true,
          },
        });

        if (!existing) {
          return null;
        }

        if (existing.type !== list_type.custom) {
          throw new Error('LIST_NOT_CUSTOM');
        }

        await tx.user_lists.update({
          where: { id: listId },
          data: {
            ...(name !== undefined ? { name } : {}),
            ...(isPublic !== undefined ? { is_public: isPublic } : {}),
            updated_at: new Date(),
          },
        });

        return this.getListById(tx, userId, listId);
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new Error('LIST_NAME_ALREADY_EXISTS');
      }

      throw error;
    }
  }

  private async getListById(
    tx: Prisma.TransactionClient,
    userId: string,
    listId: string,
  ): Promise<UserListDto | null> {
    const list = await tx.user_lists.findFirst({
      where: {
        id: listId,
        user_id: userId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        is_public: true,
        created_at: true,
        updated_at: true,
        user_list_items: {
          select: {
            id: true,
            film_id: true,
            position: true,
            note: true,
            created_at: true,
          },
          orderBy: [{ created_at: 'desc' }],
        },
      },
    });

    if (!list) {
      return null;
    }

    return this.toUserListDto(list);
  }

  private toUserListDto(
    list: Prisma.user_listsGetPayload<{
      select: {
        id: true;
        name: true;
        type: true;
        is_public: true;
        created_at: true;
        updated_at: true;
        user_list_items: {
          select: {
            id: true;
            film_id: true;
            position: true;
            note: true;
            created_at: true;
          };
        };
      };
    }>,
  ): UserListDto {
    return {
      id: list.id,
      name: list.name,
      type: list.type,
      isPublic: list.is_public,
      createdAt: list.created_at,
      updatedAt: list.updated_at,
      items: list.user_list_items.map((item) => ({
        id: item.id,
        filmId: item.film_id,
        position: item.position,
        note: item.note,
        createdAt: item.created_at,
      })),
    };
  }
}
