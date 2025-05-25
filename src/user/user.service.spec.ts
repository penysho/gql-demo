import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaUser = {
    id: '1',
    name: '田中太郎',
    email: 'tanaka@example.com',
    age: 25,
    bio: 'テストユーザーです',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockGraphQLUser: User = {
    id: '1',
    name: '田中太郎',
    email: 'tanaka@example.com',
    age: 25,
    bio: 'テストユーザーです',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockPrismaUser];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual([mockGraphQLUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when no users exist', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle bio as null and convert to undefined', async () => {
      const userWithNullBio = { ...mockPrismaUser, bio: null };
      mockPrismaService.user.findMany.mockResolvedValue([userWithNullBio]);

      const result = await service.findAll();

      expect(result[0].bio).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await service.findOne('1');

      expect(result).toEqual(mockGraphQLUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('create', () => {
    const createUserInput: CreateUserInput = {
      name: '新規ユーザー',
      email: 'new@example.com',
      age: 30,
      bio: '新規ユーザーです',
    };

    it('should create and return a user', async () => {
      const newMockUser = {
        id: '2',
        ...createUserInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(newMockUser);

      const result = await service.create(createUserInput);

      expect(result.name).toBe(createUserInput.name);
      expect(result.email).toBe(createUserInput.email);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserInput,
          bio: createUserInput.bio,
        },
      });
    });

    it('should handle undefined bio and convert to null for Prisma', async () => {
      const inputWithoutBio = { ...createUserInput, bio: undefined };
      const newMockUser = {
        id: '2',
        ...inputWithoutBio,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(newMockUser);

      const result = await service.create(inputWithoutBio);

      expect(result.bio).toBeUndefined();
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...inputWithoutBio,
          bio: null,
        },
      });
    });
  });

  describe('update', () => {
    const updateData = {
      name: '更新されたユーザー',
      age: 35,
    };

    it('should update and return a user', async () => {
      const updatedMockUser = {
        ...mockPrismaUser,
        ...updateData,
        updatedAt: new Date(),
      };
      mockPrismaService.user.update.mockResolvedValue(updatedMockUser);

      const result = await service.update('1', updateData);

      expect(result.name).toBe(updateData.name);
      expect(result.age).toBe(updateData.age);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          ...updateData,
          bio: undefined,
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.update.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.update('999', updateData)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('remove', () => {
    it('should delete a user and return true', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockPrismaUser);

      const result = await service.remove('1');

      expect(result).toBe(true);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.delete.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.remove('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });
});
