import { Injectable } from '@nestjs/common';
import {
  action_type,
  comment_status,
  complaint_status,
  film_status,
  genre_status,
  person_status,
  Prisma,
  review_status,
  tag_status,
  target_type,
  target_type_ext,
  user_status,
} from '@prisma/client';

import { PrismaService } from '@/shared';

import type {
  AddUserRoleParams,
  AdminFilmDto,
  AdminUserDto,
  BlockUserParams,
  CountryDto,
  CreateAdminFilmParams,
  CreateCountryParams,
  CreateGenreParams,
  CreatePersonParams,
  CreateTagParams,
  DeleteReviewOrCommentParams,
  GenreDto,
  GetAdminFilmsParams,
  GetComplaintsParams,
  GetCountriesParams,
  GetGenresParams,
  GetPersonsParams,
  GetTagsParams,
  GetUsersParams,
  MergeGenreParams,
  ModerateCommentOrReviewParams,
  ModerationActionDto,
  PersonDto,
  TagDto,
  UpdateAdminFilmParams,
  UpdateCountryParams,
  UpdateGenreParams,
  UpdatePersonParams,
  UpdateTagParams,
  UpdateUserStatusParams,
} from '../dto';
import type { AdminRepository } from './admin.repository';

@Injectable()
export class PrismaAdminRepository implements AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(params: GetUsersParams) {
    const { excludeUserId, page, limit, sortBy, sortOrder, search } = params;
    const skip = (page - 1) * limit;

    const sortMap = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      lastLoginAt: 'last_login_at',
      email: 'email',
      displayName: 'display_name',
      status: 'status',
    } as const;

    const where: Prisma.usersWhereInput = {
      id: { not: excludeUserId },
      ...(search
        ? {
            OR: [
              {
                email: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              {
                display_name: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.users.findMany({
        where,
        select: {
          id: true,
          email: true,
          display_name: true,
          status: true,
          created_at: true,
          updated_at: true,
          last_login_at: true,
          user_roles: {
            select: {
              roles: {
                select: {
                  code: true,
                },
              },
            },
          },
        },
        orderBy: { [sortMap[sortBy]]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at,
        roles: user.user_roles.map((ur) => ur.roles.code),
      })),
      total,
      page,
      limit,
    };
  }

  async getComplaints(params: GetComplaintsParams) {
    const { status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [complaints, total] = await this.prisma.$transaction([
      this.prisma.complaints.findMany({
        where,
        select: {
          id: true,
          user_id: true,
          target_type: true,
          target_id: true,
          reason: true,
          status: true,
          created_at: true,
          updated_at: true,
          resolved_at: true,
          users: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.complaints.count({ where }),
    ]);

    return {
      items: complaints.map((item) => ({
        id: item.id,
        userId: item.user_id,
        targetType: item.target_type,
        targetId: item.target_id,
        reason: item.reason,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        resolvedAt: item.resolved_at,
        user: {
          id: item.users.id,
          displayName: item.users.display_name,
        },
      })),
      total,
      page,
      limit,
    };
  }

  async updateUserStatus(
    params: UpdateUserStatusParams,
  ): Promise<AdminUserDto | null> {
    try {
      await this.prisma.users.update({
        where: { id: params.userId },
        data: { status: params.status, updated_at: new Date() },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      throw error;
    }

    return this.getUserById(params.userId);
  }

  async addUserRole(params: AddUserRoleParams): Promise<AdminUserDto | null> {
    const user = await this.prisma.users.findUnique({
      where: { id: params.userId },
      select: { id: true },
    });

    if (!user) {
      return null;
    }

    const role = await this.prisma.roles.findFirst({
      where: { code: params.roleCode },
      select: { id: true },
    });

    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    try {
      await this.prisma.user_roles.create({
        data: {
          user_id: params.userId,
          role_id: role.id,
          assigned_at: new Date(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new Error('ROLE_ALREADY_ASSIGNED');
      }

      throw error;
    }

    return this.getUserById(params.userId);
  }

  async hideReview(
    params: ModerateCommentOrReviewParams,
  ): Promise<ModerationActionDto | null> {
    return this.moderateReview(params, review_status.hidden, action_type.hide_review);
  }

  async unhideReview(
    params: ModerateCommentOrReviewParams,
  ): Promise<ModerationActionDto | null> {
    return this.moderateReview(params, review_status.visible, action_type.unhide_review);
  }

  async deleteReview(
    params: DeleteReviewOrCommentParams,
  ): Promise<ModerationActionDto | null> {
    const { targetId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.reviews.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!review) {
        return null;
      }

      await tx.reviews.delete({
        where: { id: targetId },
      });

      const linkedComplaintId = await this.resolveComplaint(
        tx,
        complaintId,
        target_type.review,
        targetId,
      );

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.review,
          target_id: targetId,
          action_type: action_type.hide_review,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
        reviewStatus: review_status.deleted,
      };
    });
  }

  async hideComment(
    params: ModerateCommentOrReviewParams,
  ): Promise<ModerationActionDto | null> {
    const { targetId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comments.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!comment) {
        return null;
      }

      await tx.comments.update({
        where: { id: targetId },
        data: {
          status: comment_status.hidden,
          updated_at: new Date(),
        },
      });

      const linkedComplaintId = await this.resolveComplaint(
        tx,
        complaintId,
        target_type.comment,
        targetId,
      );

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.comment,
          target_id: targetId,
          action_type: action_type.hide_comment,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
        commentStatus: comment_status.hidden,
      };
    });
  }

  async unhideComment(
    params: ModerateCommentOrReviewParams,
  ): Promise<ModerationActionDto | null> {
    const { targetId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comments.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!comment) {
        return null;
      }

      await tx.comments.update({
        where: { id: targetId },
        data: {
          status: comment_status.visible,
          updated_at: new Date(),
        },
      });

      const linkedComplaintId = await this.resolveComplaint(
        tx,
        complaintId,
        target_type.comment,
        targetId,
      );

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.comment,
          target_id: targetId,
          action_type: action_type.unhide_comment,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
        commentStatus: comment_status.visible,
      };
    });
  }

  async deleteComment(
    params: DeleteReviewOrCommentParams,
  ): Promise<ModerationActionDto | null> {
    const { targetId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comments.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!comment) {
        return null;
      }

      await tx.comments.delete({
        where: { id: targetId },
      });

      const linkedComplaintId = await this.resolveComplaint(
        tx,
        complaintId,
        target_type.comment,
        targetId,
      );

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.comment,
          target_id: targetId,
          action_type: action_type.hide_comment,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
        commentStatus: comment_status.deleted,
      };
    });
  }

  async blockUser(params: BlockUserParams): Promise<ModerationActionDto | null> {
    const { userId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.users.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        return null;
      }

      await tx.users.update({
        where: { id: userId },
        data: {
          status: user_status.blocked,
          updated_at: new Date(),
        },
      });

      let linkedComplaintId: string | null = null;

      if (complaintId) {
        const complaint = await tx.complaints.findFirst({
          where: { id: complaintId },
          select: { id: true },
        });

        if (complaint) {
          linkedComplaintId = complaint.id;
          await tx.complaints.update({
            where: { id: complaintId },
            data: {
              status: complaint_status.resolved,
              resolved_at: new Date(),
              updated_at: new Date(),
            },
          });
        }
      }

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.user,
          target_id: userId,
          action_type: action_type.block_user,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
      };
    });
  }

  async getGenres(params: GetGenresParams) {
    const { q, status, page, limit, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;
    const sortMap = {
      name: 'name',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } as const;

    const where: Prisma.genresWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              {
                name: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                slug: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    const [genres, total] = await this.prisma.$transaction([
      this.prisma.genres.findMany({
        where,
        orderBy: { [sortMap[sortBy]]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.genres.count({ where }),
    ]);

    return {
      items: genres.map((genre) => this.toGenreDto(genre)),
      total,
      page,
      limit,
    };
  }

  async createGenre(params: CreateGenreParams): Promise<GenreDto> {
    const now = new Date();
    const genre = await this.prisma.genres.create({
      data: {
        name: params.name,
        slug: params.slug,
        description: params.description,
        status: params.status,
        created_at: now,
        updated_at: now,
      },
    });

    return this.toGenreDto(genre);
  }

  async updateGenre(params: UpdateGenreParams): Promise<GenreDto | null> {
    try {
      const genre = await this.prisma.genres.update({
        where: { id: params.id },
        data: {
          ...(params.name !== undefined ? { name: params.name } : {}),
          ...(params.slug !== undefined ? { slug: params.slug } : {}),
          ...(params.description !== undefined ? { description: params.description } : {}),
          ...(params.status !== undefined ? { status: params.status } : {}),
          updated_at: new Date(),
        },
      });

      return this.toGenreDto(genre);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      throw error;
    }
  }

  async deleteGenre(id: string): Promise<boolean> {
    try {
      await this.prisma.genres.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return false;
      }

      throw error;
    }
  }

  async mergeGenre(params: MergeGenreParams): Promise<GenreDto | null> {
    const { sourceGenreId, targetGenreId } = params;

    if (sourceGenreId === targetGenreId) {
      throw new Error('GENRE_MERGE_SAME_TARGET');
    }

    return this.prisma.$transaction(async (tx) => {
      const [source, target] = await Promise.all([
        tx.genres.findUnique({
          where: { id: sourceGenreId },
          select: { id: true },
        }),
        tx.genres.findUnique({
          where: { id: targetGenreId },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            status: true,
            created_at: true,
            updated_at: true,
          },
        }),
      ]);

      if (!source || !target) {
        return null;
      }

      const sourceRelations = await tx.film_genres.findMany({
        where: { genre_id: sourceGenreId },
        select: { film_id: true },
      });

      if (sourceRelations.length) {
        await tx.film_genres.createMany({
          data: sourceRelations.map((relation) => ({
            film_id: relation.film_id,
            genre_id: targetGenreId,
          })),
          skipDuplicates: true,
        });
      }

      await tx.film_genres.deleteMany({
        where: { genre_id: sourceGenreId },
      });

      await tx.genres.delete({
        where: { id: sourceGenreId },
      });

      return this.toGenreDto(target);
    });
  }

  async getTags(params: GetTagsParams) {
    const { q, status, page, limit, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;
    const sortMap = {
      name: 'name',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } as const;

    const where: Prisma.tagsWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              {
                name: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                slug: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    const [tags, total] = await this.prisma.$transaction([
      this.prisma.tags.findMany({
        where,
        orderBy: { [sortMap[sortBy]]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.tags.count({ where }),
    ]);

    return {
      items: tags.map((tag) => this.toTagDto(tag)),
      total,
      page,
      limit,
    };
  }

  async createTag(params: CreateTagParams): Promise<TagDto> {
    const now = new Date();
    const tag = await this.prisma.tags.create({
      data: {
        name: params.name,
        slug: params.slug,
        description: params.description,
        status: params.status,
        created_at: now,
        updated_at: now,
      },
    });

    return this.toTagDto(tag);
  }

  async updateTag(params: UpdateTagParams): Promise<TagDto | null> {
    try {
      const tag = await this.prisma.tags.update({
        where: { id: params.id },
        data: {
          ...(params.name !== undefined ? { name: params.name } : {}),
          ...(params.slug !== undefined ? { slug: params.slug } : {}),
          ...(params.description !== undefined ? { description: params.description } : {}),
          ...(params.status !== undefined ? { status: params.status } : {}),
          updated_at: new Date(),
        },
      });

      return this.toTagDto(tag);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      throw error;
    }
  }

  async deleteTag(id: string): Promise<boolean> {
    try {
      await this.prisma.tags.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return false;
      }

      throw error;
    }
  }

  async getCountries(params: GetCountriesParams) {
    const { q, page, limit, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;
    const sortMap = {
      name: 'name',
      code: 'code',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } as const;

    const where: Prisma.countriesWhereInput = {
      ...(q
        ? {
            OR: [
              {
                name: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                code: {
                  contains: q.toUpperCase(),
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    const [countries, total] = await this.prisma.$transaction([
      this.prisma.countries.findMany({
        where,
        orderBy: { [sortMap[sortBy]]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.countries.count({ where }),
    ]);

    return {
      items: countries.map((country) => this.toCountryDto(country)),
      total,
      page,
      limit,
    };
  }

  async createCountry(params: CreateCountryParams): Promise<CountryDto> {
    const now = new Date();
    const country = await this.prisma.countries.create({
      data: {
        code: params.code,
        name: params.name,
        created_at: now,
        updated_at: now,
      },
    });

    return this.toCountryDto(country);
  }

  async updateCountry(params: UpdateCountryParams): Promise<CountryDto | null> {
    try {
      const country = await this.prisma.countries.update({
        where: { id: params.id },
        data: {
          ...(params.code !== undefined ? { code: params.code } : {}),
          ...(params.name !== undefined ? { name: params.name } : {}),
          updated_at: new Date(),
        },
      });

      return this.toCountryDto(country);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      throw error;
    }
  }

  async deleteCountry(id: string): Promise<boolean> {
    try {
      await this.prisma.countries.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return false;
      }

      throw error;
    }
  }

  async getPersons(params: GetPersonsParams) {
    const { q, status, page, limit, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;
    const sortMap = {
      fullName: 'full_name',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } as const;

    const where: Prisma.personsWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              {
                full_name: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                slug: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    const [persons, total] = await this.prisma.$transaction([
      this.prisma.persons.findMany({
        where,
        orderBy: { [sortMap[sortBy]]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.persons.count({ where }),
    ]);

    return {
      items: persons.map((person) => this.toPersonDto(person)),
      total,
      page,
      limit,
    };
  }

  async createPerson(params: CreatePersonParams): Promise<PersonDto> {
    const now = new Date();
    const person = await this.prisma.persons.create({
      data: {
        full_name: params.fullName,
        slug: params.slug,
        birth_date: params.birthDate ?? null,
        death_date: params.deathDate ?? null,
        bio: params.bio,
        status: params.status,
        created_at: now,
        updated_at: now,
      },
    });

    return this.toPersonDto(person);
  }

  async updatePerson(params: UpdatePersonParams): Promise<PersonDto | null> {
    try {
      const person = await this.prisma.persons.update({
        where: { id: params.id },
        data: {
          ...(params.fullName !== undefined ? { full_name: params.fullName } : {}),
          ...(params.slug !== undefined ? { slug: params.slug } : {}),
          ...(params.birthDate !== undefined ? { birth_date: params.birthDate } : {}),
          ...(params.deathDate !== undefined ? { death_date: params.deathDate } : {}),
          ...(params.bio !== undefined ? { bio: params.bio } : {}),
          ...(params.status !== undefined ? { status: params.status } : {}),
          updated_at: new Date(),
        },
      });

      return this.toPersonDto(person);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      throw error;
    }
  }

  async deletePerson(id: string): Promise<boolean> {
    try {
      await this.prisma.persons.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return false;
      }

      throw error;
    }
  }

  async getFilms(params: GetAdminFilmsParams) {
    const {
      q,
      status,
      yearFrom,
      yearTo,
      ratingFrom,
      ratingTo,
      page,
      limit,
      sortBy,
      sortOrder,
    } = params;
    const skip = (page - 1) * limit;

    const sortMap = {
      title: 'title',
      status: 'status',
      releaseYear: 'release_year',
      averageRating: 'average_rating',
      ratingsCount: 'ratings_count',
      popularityScore: 'popularity_score',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } as const;

    const releaseYearFilter: Prisma.IntFilter = {};
    const averageRatingFilter: Prisma.DecimalFilter = {};

    if (yearFrom !== undefined) {
      releaseYearFilter.gte = yearFrom;
    }

    if (yearTo !== undefined) {
      releaseYearFilter.lte = yearTo;
    }

    if (ratingFrom !== undefined) {
      averageRatingFilter.gte = new Prisma.Decimal(ratingFrom);
    }

    if (ratingTo !== undefined) {
      averageRatingFilter.lte = new Prisma.Decimal(ratingTo);
    }

    const where: Prisma.filmsWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              {
                title: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                original_title: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
      ...(Object.keys(releaseYearFilter).length
        ? { release_year: releaseYearFilter }
        : {}),
      ...(Object.keys(averageRatingFilter).length
        ? { average_rating: averageRatingFilter }
        : {}),
    };

    const [films, total] = await this.prisma.$transaction([
      this.prisma.films.findMany({
        where,
        orderBy: { [sortMap[sortBy]]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.films.count({ where }),
    ]);

    return {
      items: films.map((film) => this.toAdminFilmDto(film)),
      total,
      page,
      limit,
    };
  }

  async createFilm(params: CreateAdminFilmParams): Promise<AdminFilmDto> {
    const film = await this.prisma.films.create({
      data: {
        title: params.title,
        original_title: params.originalTitle,
        description: params.description,
        release_year: params.releaseYear,
        duration_min: params.durationMin,
        age_rating: params.ageRating,
        status: params.status,
        popularity_score: new Prisma.Decimal(params.popularityScore ?? 0),
      },
    });

    return this.toAdminFilmDto(film);
  }

  async updateFilm(params: UpdateAdminFilmParams): Promise<AdminFilmDto | null> {
    try {
      const film = await this.prisma.films.update({
        where: { id: params.id },
        data: {
          ...(params.title !== undefined ? { title: params.title } : {}),
          ...(params.originalTitle !== undefined
            ? { original_title: params.originalTitle }
            : {}),
          ...(params.description !== undefined ? { description: params.description } : {}),
          ...(params.releaseYear !== undefined ? { release_year: params.releaseYear } : {}),
          ...(params.durationMin !== undefined ? { duration_min: params.durationMin } : {}),
          ...(params.ageRating !== undefined ? { age_rating: params.ageRating } : {}),
          ...(params.status !== undefined ? { status: params.status } : {}),
          ...(params.popularityScore !== undefined
            ? { popularity_score: new Prisma.Decimal(params.popularityScore) }
            : {}),
          updated_at: new Date(),
        },
      });

      return this.toAdminFilmDto(film);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      throw error;
    }
  }

  async deleteFilm(id: string): Promise<boolean> {
    try {
      await this.prisma.films.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return false;
      }

      throw error;
    }
  }

  private async getUserById(userId: string): Promise<AdminUserDto | null> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        display_name: true,
        status: true,
        created_at: true,
        updated_at: true,
        last_login_at: true,
        user_roles: {
          select: {
            roles: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
      roles: user.user_roles.map((ur) => ur.roles.code),
    };
  }

  private toGenreDto(genre: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: genre_status;
    created_at: Date;
    updated_at: Date;
  }): GenreDto {
    return {
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
      description: genre.description,
      status: genre.status,
      createdAt: genre.created_at,
      updatedAt: genre.updated_at,
    };
  }

  private toTagDto(tag: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: tag_status;
    created_at: Date;
    updated_at: Date;
  }): TagDto {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      status: tag.status,
      createdAt: tag.created_at,
      updatedAt: tag.updated_at,
    };
  }

  private toCountryDto(country: {
    id: string;
    code: string;
    name: string;
    created_at: Date;
    updated_at: Date;
  }): CountryDto {
    return {
      id: country.id,
      code: country.code,
      name: country.name,
      createdAt: country.created_at,
      updatedAt: country.updated_at,
    };
  }

  private toPersonDto(person: {
    id: string;
    full_name: string;
    slug: string;
    birth_date: Date | null;
    death_date: Date | null;
    bio: string | null;
    status: person_status;
    created_at: Date;
    updated_at: Date;
  }): PersonDto {
    return {
      id: person.id,
      fullName: person.full_name,
      slug: person.slug,
      birthDate: person.birth_date,
      deathDate: person.death_date,
      bio: person.bio,
      status: person.status,
      createdAt: person.created_at,
      updatedAt: person.updated_at,
    };
  }

  private toAdminFilmDto(film: {
    id: string;
    title: string;
    original_title: string;
    description: string | null;
    release_year: number;
    duration_min: number;
    age_rating: string | null;
    status: film_status;
    average_rating: Prisma.Decimal;
    ratings_count: number;
    popularity_score: Prisma.Decimal;
    created_at: Date;
    updated_at: Date;
  }): AdminFilmDto {
    return {
      id: film.id,
      title: film.title,
      originalTitle: film.original_title,
      description: film.description,
      releaseYear: film.release_year,
      durationMin: film.duration_min,
      ageRating: film.age_rating,
      status: film.status,
      averageRating: Number(film.average_rating),
      ratingsCount: film.ratings_count,
      popularityScore: Number(film.popularity_score),
      createdAt: film.created_at,
      updatedAt: film.updated_at,
    };
  }

  private async moderateReview(
    params: ModerateCommentOrReviewParams,
    nextStatus: review_status,
    actionType: action_type,
  ): Promise<ModerationActionDto | null> {
    const { targetId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.reviews.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!review) {
        return null;
      }

      await tx.reviews.update({
        where: { id: targetId },
        data: {
          status: nextStatus,
          updated_at: new Date(),
        },
      });

      const linkedComplaintId = await this.resolveComplaint(
        tx,
        complaintId,
        target_type.review,
        targetId,
      );

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.review,
          target_id: targetId,
          action_type: actionType,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
        reviewStatus: nextStatus,
      };
    });
  }

  private async resolveComplaint(
    tx: Prisma.TransactionClient,
    complaintId: string | undefined,
    expectedTargetType: target_type,
    expectedTargetId: string,
  ): Promise<string | null> {
    if (!complaintId) {
      return null;
    }

    const complaint = await tx.complaints.findFirst({
      where: { id: complaintId },
      select: {
        id: true,
        target_type: true,
        target_id: true,
      },
    });

    if (!complaint) {
      return null;
    }

    if (
      complaint.target_type !== expectedTargetType ||
      complaint.target_id !== expectedTargetId
    ) {
      return null;
    }

    await tx.complaints.update({
      where: { id: complaintId },
      data: {
        status: complaint_status.resolved,
        resolved_at: new Date(),
        updated_at: new Date(),
      },
    });

    return complaint.id;
  }
}
