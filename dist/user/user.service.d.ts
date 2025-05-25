import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './user.entity';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    private mapPrismaUserToGraphQLUser;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    create(createUserInput: CreateUserInput): Promise<User>;
    update(id: string, updateData: Partial<CreateUserInput>): Promise<User>;
    remove(id: string): Promise<boolean>;
}
