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
    return this.usersService.getAllUsers();
  }

  // More specific routes must come BEFORE generic :id routes
  @Patch(":id/deactivate")
  deactivate(@Param("id") id: string) {
    return this.usersService.deactivateUser(id);
  }

  @Patch(":id/activate")
  activate(@Param("id") id: string) {
    return this.usersService.activateUser(id);
  }

  @Patch(":id/department")
  updateDepartment(
    @Param("id") id: string,
    @Body() dto: { department: string }
  ) {
    return this.usersService.updateUserDepartment(id, dto.department);
  }

  // Generic :id route must come LAST
  @Patch(":id")
  async updateUser(
    @Param("id") id: string,
    @Body() dto: any
  ) {
    const result = await this.usersService.updateUser(id, dto);
    console.log('Controller returning:', JSON.stringify(result, null, 2));
    return result;
  }
}
