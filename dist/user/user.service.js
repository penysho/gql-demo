"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapPrismaUserToGraphQLUser(prismaUser) {
        return {
            ...prismaUser,
            bio: prismaUser.bio ?? undefined,
        };
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return users.map((user) => this.mapPrismaUserToGraphQLUser(user));
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.mapPrismaUserToGraphQLUser(user);
    }
    async create(createUserInput) {
        const user = await this.prisma.user.create({
            data: {
                ...createUserInput,
                bio: createUserInput.bio ?? null,
            },
        });
        return this.mapPrismaUserToGraphQLUser(user);
    }
    async update(id, updateData) {
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data: {
                    ...updateData,
                    bio: updateData.bio !== undefined ? (updateData.bio ?? null) : undefined,
                },
            });
            return this.mapPrismaUserToGraphQLUser(user);
        }
        catch {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
    }
    async remove(id) {
        try {
            await this.prisma.user.delete({
                where: { id },
            });
            return true;
        }
        catch {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map