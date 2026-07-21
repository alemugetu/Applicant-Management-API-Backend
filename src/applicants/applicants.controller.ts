import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards
} from '@nestjs/common';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateNotesDto } from './dto/update-notes.dto';
import { QueryApplicantDto } from './dto/query-applicant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Applicants')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard) // Blocks unauthorized access across all endpoints in this controller
@Controller('applicants')
export class ApplicantsController {
    constructor(private readonly applicantsService: ApplicantsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new applicant' })
    create(@Body() createApplicantDto: CreateApplicantDto) {
        return this.applicantsService.create(createApplicantDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get paginated list of applicants with search, filter, and sort options' })
    findAll(@Query() query: QueryApplicantDto) {
        return this.applicantsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get details of a single applicant by ID' })
    findOne(@Param('id') id: string) {
        return this.applicantsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update applicant general details' })
    update(@Param('id') id: string, @Body() updateApplicantDto: UpdateApplicantDto) {
        return this.applicantsService.update(id, updateApplicantDto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update applicant status (Enforces business state transition constraints)' })
    updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
        return this.applicantsService.updateStatus(id, updateStatusDto);
    }

    @Patch(':id/notes')
    @ApiOperation({ summary: 'Update internal notes for an applicant (Max 1000 chars)' })
    updateNotes(@Param('id') id: string, @Body() updateNotesDto: UpdateNotesDto) {
        return this.applicantsService.updateNotes(id, updateNotesDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft-delete an applicant record' })
    remove(@Param('id') id: string) {
        return this.applicantsService.softDelete(id);
    }
}

