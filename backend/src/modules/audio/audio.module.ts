import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { AudioService } from "./audio.service";

@Module({
  imports: [AiModule],
  providers: [AudioService],
  exports: [AudioService],
})
export class AudioModule {}

