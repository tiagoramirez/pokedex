import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { Region } from './entities/region.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RegionService {
  constructor(
    @InjectModel(Region.name)
    private readonly regionModel: Model<Region>,
  ) {}

  async createMany(createRegionDtos: CreateRegionDto[]): Promise<void> {
    await this.regionModel.insertMany(createRegionDtos);
  }

  async findAll(): Promise<Region[]> {
    return await this.regionModel.find().select('-__v').select('-_id');
  }

  async findOne(name: string): Promise<Region> {
    const region = await this.regionModel
      .findOne({ name: name.toLowerCase().trim() })
      .select('-__v')
      .select('-_id');

    if (!region)
      throw new NotFoundException(`Region with name ${name} not found`);

    return region;
  }

  async removeAll(): Promise<void> {
    await this.regionModel.deleteMany({});
  }
}
