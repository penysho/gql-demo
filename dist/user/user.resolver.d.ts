import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './user.entity';
import { UserService } from './user.service';
export declare class UserResolver {
    private readonly userService;
    constructor(userService: UserService);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    createUser(createUserInput: CreateUserInput): Promise<User>;
    updateUser(updateUserInput: UpdateUserInput): Promise<User>;
    removeUser(id: string): Promise<boolean>;
}
