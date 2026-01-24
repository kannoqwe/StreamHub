import { Controller } from '@nestjs/common';
import { UserService } from '@modules/user/user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}
}
