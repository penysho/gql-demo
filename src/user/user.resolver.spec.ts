import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

describe('UserResolver', () => {
  let resolver: UserResolver;

  const mockUser: User = {
    id: '1',
    name: '田中太郎',
    email: 'tanaka@example.com',
    age: 25,
    bio: 'テストユーザーです',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUserService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser];
      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await resolver.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      mockUserService.findAll.mockResolvedValue([]);

      const result = await resolver.findAll();

      expect(result).toEqual([]);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await resolver.findOne('1');

      expect(result).toEqual(mockUser);
      expect(mockUserService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.findOne.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(resolver.findOne('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
      expect(mockUserService.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('createUser', () => {
    const createUserInput: CreateUserInput = {
      name: '新規ユーザー',
      email: 'new@example.com',
      age: 30,
      bio: '新規ユーザーです',
    };

    it('should create and return a user', async () => {
      const newUser: User = {
        id: '2',
        ...createUserInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserService.create.mockResolvedValue(newUser);

      const result = await resolver.createUser(createUserInput);

      expect(result).toEqual(newUser);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserInput);
    });

    it('should create user with undefined bio', async () => {
      const inputWithoutBio = { ...createUserInput, bio: undefined };
      const newUser: User = {
        id: '2',
        ...inputWithoutBio,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserService.create.mockResolvedValue(newUser);

      const result = await resolver.createUser(inputWithoutBio);

      expect(result).toEqual(newUser);
      expect(mockUserService.create).toHaveBeenCalledWith(inputWithoutBio);
    });
  });

  describe('updateUser', () => {
    const updateUserInput: UpdateUserInput = {
      id: '1',
      name: '更新されたユーザー',
      age: 35,
    };

    it('should update and return a user', async () => {
      const updatedUser: User = {
        ...mockUser,
        name: updateUserInput.name!,
        age: updateUserInput.age!,
        updatedAt: new Date(),
      };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await resolver.updateUser(updateUserInput);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith('1', {
        name: updateUserInput.name,
        age: updateUserInput.age,
      });
    });

    it('should update user with partial data', async () => {
      const partialUpdateInput: UpdateUserInput = {
        id: '1',
        name: '部分更新ユーザー',
      };
      const updatedUser: User = {
        ...mockUser,
        name: partialUpdateInput.name!,
        updatedAt: new Date(),
      };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await resolver.updateUser(partialUpdateInput);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith('1', {
        name: partialUpdateInput.name,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.update.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      const invalidUpdateInput: UpdateUserInput = {
        id: '999',
        name: '存在しないユーザー',
      };

      await expect(resolver.updateUser(invalidUpdateInput)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
      expect(mockUserService.update).toHaveBeenCalledWith('999', {
        name: invalidUpdateInput.name,
      });
    });
  });

  describe('removeUser', () => {
    it('should delete a user and return true', async () => {
      mockUserService.remove.mockResolvedValue(true);

      const result = await resolver.removeUser('1');

      expect(result).toBe(true);
      expect(mockUserService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.remove.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(resolver.removeUser('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
      expect(mockUserService.remove).toHaveBeenCalledWith('999');
    });
  });
});
