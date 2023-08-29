import { NestFactory } from "@nestjs/core";
import { UserModule } from "./user/user.module";
import { StandardResponseInterceptor } from "./interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  app.useGlobalInterceptors(new StandardResponseInterceptor());
  await app.listen(3000);
}
bootstrap();
