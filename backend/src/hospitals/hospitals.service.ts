import { Injectable, InjectRepository } from "@nestjs/typeorm";


@Injectable()
export class HospitalService{
    constructor(
        @InjectRepository(hospital) 
        private hospitalRepository: Repository<hospital>,){

    }

    async findAll(): Promise<User[]>{
        return this.hospitalRepository.find();
    }
}