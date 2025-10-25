import { PartialType } from '@nestjs/swagger';
import { CreateAnalysisTypeDto } from './create-analysis-type.dto';

export class UpdateAnalysisTypeDto extends PartialType(CreateAnalysisTypeDto) {}
