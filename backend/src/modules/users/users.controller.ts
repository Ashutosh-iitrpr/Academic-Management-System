import { Controller, Post, Body, Patch, Param, Get } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get()
  getAllUsers() {
    // TODO: Implement actual user retrieval
    return this.usersService.getAllUsers();
  }

  
  // 👇 ADD THIS
  @Patch(":id/deactivate")
  deactivate(@Param("id") id: string) {
    return this.usersService.deactivateUser(id);
  }

  @Patch(":id/activate")
  activate(@Param("id") id: string) {
    return this.usersService.activateUser(id);
  }
}
