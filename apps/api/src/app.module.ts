import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AdminModule } from "./admin/admin.module";
import { ApplicationsModule } from "./applications/applications.module";
import { AuthModule } from "./auth/auth.module";
import { ClubsModule } from "./clubs/clubs.module";
import { HealthModule } from "./health/health.module";
import { OpportunitiesModule } from "./opportunities/opportunities.module";
import { PlayersModule } from "./players/players.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "development-secret"),
        signOptions: { expiresIn: "7d" }
      })
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    PlayersModule,
    ClubsModule,
    OpportunitiesModule,
    ApplicationsModule,
    AdminModule
  ]
})
export class AppModule {}
